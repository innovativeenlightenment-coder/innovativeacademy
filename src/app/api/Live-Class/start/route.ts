
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import LiveSession from "@/model/LiveSession";
import UserSchema from "@/model/UserSchema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getLiveUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (!["teacher", "admin"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Only teachers and admins can start classes",
        },
        { status: 403 }
      );
    }

    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const title = String(body.title || "").trim();

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: "Class title is required",
        },
        { status: 400 }
      );
    }

    if (title.length > 150) {
      return NextResponse.json(
        {
          success: false,
          error: "Class title cannot exceed 150 characters",
        },
        { status: 400 }
      );
    }

    const rawParticipantIds = Array.isArray(body.participantIds)
      ? body.participantIds
      : [];

    if (
      rawParticipantIds.some(
        (id: unknown) =>
          typeof id !== "string" ||
          !mongoose.Types.ObjectId.isValid(id)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more participant IDs are invalid",
        },
        { status: 400 }
      );
    }

    const participantIds = Array.from(
      new Set<string>(rawParticipantIds)
    );

    if (participantIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Select at least one student before starting the class",
        },
        { status: 400 }
      );
    }

    const validStudents = await UserSchema.find({
      _id: { $in: participantIds },
      role: "student",
    }).select("_id");

    if (validStudents.length !== participantIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Some selected accounts are not valid student accounts",
        },
        { status: 400 }
      );
    }

    const session = await LiveSession.create({
      title,

      roomName: `ia-${new mongoose.Types.ObjectId().toString()}`,

      status: "live",

      startedBy: user._id,
      participantIds,

      startedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Live class started successfully",

        session: {
          _id: session._id,
          title: session.title,
          roomName: session.roomName,
          status: session.status,
          startedBy: session.startedBy,
          participantIds: session.participantIds,
          startedAt: session.startedAt,
          createdAt: session.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Start live class error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to start live class",
      },
      { status: 500 }
    );
  }
}
