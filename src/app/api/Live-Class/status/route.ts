
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import LiveSession from "@/model/LiveSession";

export const dynamic = "force-dynamic";

interface LiveSessionResult {
  _id: unknown;
  title: string;
  subject: string;
  description?: string;
  roomName: string;
  startedAt: Date;
  startedBy: unknown;
}

export async function GET() {
  try {
    const user = await getLiveUser();

    if (!user) {
      return NextResponse.json(
        { message: "Please log in first." },
        { status: 401 }
      );
    }

    await connectDB();

    const session = (await LiveSession.findOne({
      status: "live",
    })
      .select("_id title subject description roomName startedAt startedBy")
      .lean()
      .exec()) as LiveSessionResult | null;

    return NextResponse.json(
      {
        isLive: Boolean(session),
        session: session
          ? {
              _id: String(session._id),
              title: session.title,
              subject: session.subject,
              description: session.description,
              roomName: session.roomName,
              startedAt: session.startedAt,
              canEnd:
                String(session.startedBy) === String(user._id) ||
                user.role === "admin",
            }
          : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("LIVE STATUS ERROR:", error);

    return NextResponse.json(
      { message: "Unable to check live status." },
      { status: 500 }
    );
  }
}
