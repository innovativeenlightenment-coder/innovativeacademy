import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import QuestionBankSchema from "@/model/QuestionBankSchema";
import TestRecords from "@/model/TestRecordSchema";
import { unstable_noStore as noStore } from "next/cache";

type Level = "easy" | "moderate" | "difficult" | "extreme";

const FROM_DB_LEVEL = (dbLevel?: string): Level => {
  if (!dbLevel) return "easy";
  const l = dbLevel.toLowerCase();
  if (l.includes("easy")) return "easy";
  if (l.includes("moderate")) return "moderate";
  if (l.includes("difficult")) return "difficult";
  if (l.includes("extreme")) return "extreme";
  return "easy";
};

export async function GET(req: Request) {
  noStore();

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email required" },
        { status: 400 }
      );
    }

    // 1️⃣ Chapter counts
    const chapterCounts = await QuestionBankSchema.aggregate([
      {
        $group: {
          _id: { course: "$course", subject: "$subject", chapter: "$chapter" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 2️⃣ Get last test for each chapter in JS
    const records = await TestRecords.find({ email, testType: "practice" })
      .sort({ createdAt: -1 })
      .lean();

    // Map: "course|subject|chapter" => last level
    const lastLevelMap = new Map<string, Level>();

    records.forEach(r => {
      const key = `${r.course}|${r.subject}|${r.chapter}`;
      if (!lastLevelMap.has(key) && r.level) {
        lastLevelMap.set(key, FROM_DB_LEVEL(r.level));
      }
    });

    // 3️⃣ Map chapters to levels
    const chapters = chapterCounts
      .filter(item => item._id.course && item._id.subject && item._id.chapter && item.count >= 20)
      .map(item => {
        const key = `${item._id.course}|${item._id.subject}|${item._id.chapter}`;
        const lvl = lastLevelMap.get(key) || "easy";
        return {
          course: item._id.course,
          subject: item._id.subject,
          chapter: item._id.chapter,
          count: item.count,
          level: lvl,
        };
      });

    return NextResponse.json({ success: true, chapters });
  } catch (error) {
    console.error("Error fetching chapter tests:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
