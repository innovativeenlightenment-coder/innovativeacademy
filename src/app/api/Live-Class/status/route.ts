
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import LiveSession from "@/model/LiveSession";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const user = await getLiveUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = String(user._id);

    const filter: Record<string, any> = {
      status: "live",
    };

    if (user.role === "admin") {
      // Admin can see all live sessions.
    } else if (user.role === "teacher") {
      filter.$or = [
        { startedBy: user._id },
        { participantIds: user._id },
      ];
    } else if (user.role === "student") {
      filter.participantIds = user._id;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot access live classes",
        },
        { status: 403 }
      );
    }

    const sessions = await LiveSession.find(filter)
      .sort({ startedAt: -1 })
      .populate("startedBy", "name username")
      .lean();

    const result = sessions.map((session: any) => {
      const startedById = String(
        session.startedBy?._id || session.startedBy
      );

      return {
        _id: session._id,
        title: session.title,
        roomName: session.roomName,
        status: session.status,
        startedBy: session.startedBy,
        participantIds: session.participantIds || [],
        startedAt: session.startedAt,
        createdAt: session.createdAt,

        canEnd:
          user.role === "admin" ||
          startedById === userId,
      };
    });

    return NextResponse.json({
      success: true,
      isLive: result.length > 0,
      total: result.length,
      sessions: result,
    });
  } catch (error) {
    console.error("Live class status error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch live class status",
      },
      { status: 500 }
    );
  }
}
