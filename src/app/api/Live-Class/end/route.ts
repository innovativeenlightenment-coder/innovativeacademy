
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import LiveSession from "@/model/LiveSession";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getLiveUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!["teacher", "admin"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "You cannot end live classes" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const sessionId = body.sessionId;

    if (
      typeof sessionId !== "string" ||
      !mongoose.Types.ObjectId.isValid(sessionId)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid session ID" },
        { status: 400 }
      );
    }

    const session = await LiveSession.findById(sessionId);

    if (!session || session.status !== "live") {
      return NextResponse.json(
        { success: false, error: "Live class not found or already ended" },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "admin";
    const isCreator =
      String(session.startedBy) === String(user._id);

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        {
          success: false,
          error: "Only the creator or admin can end this class",
        },
        { status: 403 }
      );
    }

    const endedAt = new Date();

    const updatedSession = await LiveSession.findOneAndUpdate(
      {
        _id: sessionId,
        status: "live",
      },
      {
        $set: {
          status: "ended",
          endedAt,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSession) {
      return NextResponse.json(
        { success: false, error: "This class has already ended." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Live class ended successfully",
      sessionId: updatedSession._id,
      endedAt: updatedSession.endedAt,
    });
  } catch (error) {
    console.error("End live class error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to end live class" },
      { status: 500 }
    );
  }
}
