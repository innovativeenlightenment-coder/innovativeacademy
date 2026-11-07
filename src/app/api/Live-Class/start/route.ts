
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
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!["teacher", "admin"].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: "Only teachers and admins can start classes" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const title = String(body.title || "").trim();
    const subject = String(body.subject || "").trim();
    const description = String(body.description || "").trim();

    const rawParticipantIds = Array.isArray(body.participantIds)
      ? body.participantIds
      : [];

    if (!title || !subject) {
      return NextResponse.json(
        { success: false, error: "Title and subject are required" },
        { status: 400 }
      );
    }

    if (
      rawParticipantIds.some(
        (id: unknown) =>
          typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)
      )
    ) {
      return NextResponse.json(
        { success: false, error: "One or more participant IDs are invalid" },
        { status: 400 }
      );
    }

    const participantIds: string[] = Array.from(
      new Set<string>(
        rawParticipantIds.map((id: string) => String(id))
      )
    );

    // Only actual student accounts may be selected.
    if (participantIds.length > 0) {
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
    }

    const session = await LiveSession.create({
      title,
      subject,
      description,
      roomName: `ia-${new mongoose.Types.ObjectId().toString()}`,
      status: "live",
      startedBy: user._id,
      participantIds,
      startedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        subject: session.subject,
        description: session.description,
        roomName: session.roomName,
        participantIds: session.participantIds,
        startedAt: session.startedAt,
      },
    });
  } catch (error) {
    console.error("Start live class error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to start live class" },
      { status: 500 }
    );
  }
}
