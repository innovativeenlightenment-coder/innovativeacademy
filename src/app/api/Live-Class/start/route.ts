
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

    if (!["teacher", "admin"].includes(user.role)) {
      return NextResponse.json(
        { message: "Only teachers can start a live class." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!title || !subject) {
      return NextResponse.json(
        { message: "Title and subject are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const roomName = `ia-${new mongoose.Types.ObjectId().toString()}`;

    const session = await LiveSession.create({
      title,
      subject,
      description,
      roomName,
      status: "live",
      startedBy: user._id,
      startedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      alreadyLive: false,
      session: {
        _id: session._id,
        title: session.title,
        subject: session.subject,
        description: session.description,
        roomName: session.roomName,
        startedAt: session.startedAt,
      },
    });
  } catch (error: any) {
    console.error("START LIVE ERROR:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "Unable to create a unique classroom." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to start live class." },
      { status: 500 }
    );
  }
}
