import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import LiveSession from "@/model/LiveSession";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getLiveUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { message: "Invalid session ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const session = await LiveSession.findOne({
      _id: sessionId,
      status: "live",
    });

    if (!session) {
      return NextResponse.json(
        { message: "Live session not found or already ended." },
        { status: 404 }
      );
    }

    const isOwner =
      session.startedBy.toString() === user._id.toString();

    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "You cannot end this live class." },
        { status: 403 }
      );
    }

    session.status = "ended";
    session.endedAt = new Date();

    await session.save();

    return NextResponse.json({
      success: true,
      message: "Live class ended.",
    });
  } catch (error) {
    console.error("END LIVE ERROR:", error);

    return NextResponse.json(
      { message: "Unable to end live class." },
      { status: 500 }
    );
  }
}