import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import UserSchema from "@/model/UserSchema";
import { LEVELS } from "@/utils/level_config";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      userId,
      attemptedQuestions,
      totalQuestions,
      scorePercent,
      timeUsed,
      totalTime,
    } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const user = await UserSchema.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /* ---------------- ATTEMPT RATIO ---------------- */
    const attemptRatio =
      totalQuestions > 0 ? attemptedQuestions / totalQuestions : 0;

    /* ---------------- POINTS ---------------- */
    let basePoints = 0;
    let scorePoints = 0;
    let timePoints = 0;

    if (attemptRatio >= 0.5) {
      basePoints = 20;

      if (scorePercent >= 85) scorePoints = 20;
      else if (scorePercent >= 70) scorePoints = 10;

      const usedPercent =
        totalTime > 0 ? (timeUsed / totalTime) * 100 : 100;
      const leftPercent = 100 - usedPercent;

      if (leftPercent >= 40) timePoints = 20;
      else if (leftPercent >= 25) timePoints = 12;
      else if (leftPercent >= 10) timePoints = 6;
    }

    const gainedPoints = basePoints + scorePoints + timePoints;

    /* ---------------- TOTAL POINTS ---------------- */
    const previousPoints = user.points ?? 0;
    const totalPoints = previousPoints + gainedPoints;

    /* ---------------- LEVEL ---------------- */
    const newLevelConfig =
      [...LEVELS].reverse().find(l => totalPoints >= l.minPoints) ??
      LEVELS[0];

    const leveledUp = user.level !== newLevelConfig.level;

    /* ---------------- UPDATE USER (ATOMIC) ---------------- */
    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      {
        $set: {
          level: newLevelConfig.level,
          levelName: newLevelConfig.name,
        },
        $inc: {
          points: gainedPoints,
        },
      },
      { new: true }
    );
console.log(newLevelConfig.level,newLevelConfig.name,gainedPoints)
    if (!updatedUser) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
console.log(updatedUser)
    /* ---------------- NEXT LEVEL ---------------- */
    const nextLevel = LEVELS.find(
      l => l.level === newLevelConfig.level + 1
    );

    /* ---------------- RESPONSE ---------------- */
    return NextResponse.json({
      success: true,

      pointsBreakdown: {
        basePoints,
        scorePoints,
        timePoints,
        gainedPoints,
      },

      previousPoints,
      totalPoints: updatedUser.points,

      level: updatedUser.level,
      levelName: updatedUser.levelName,
      leveledUp,
      nextLevelMin: nextLevel?.minPoints ?? null,

      meta: {
        attemptRatio: Number(attemptRatio.toFixed(2)),
        scorePercent,
        timeUsed,
        leftPercent:
          totalTime > 0
            ? Number((((totalTime - timeUsed) / totalTime) * 100).toFixed(1))
            : 0,
      },

      user: {
        id: updatedUser._id,
        points: updatedUser.points,
        level: updatedUser.level,
        levelName: updatedUser.levelName,
      },
    });
  } catch (err) {
    console.error("ADD POINTS ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
