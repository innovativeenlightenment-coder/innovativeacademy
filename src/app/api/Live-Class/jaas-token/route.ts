
import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";
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

    const session = await LiveSession.findOne({
      _id: sessionId,
      status: "live",
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Class not found or already ended" },
        { status: 404 }
      );
    }

    const userId = String(user._id);
    const creatorId = String(session.startedBy);

    const isAdmin = user.role === "admin";
    const isCreator = userId === creatorId;

    const isSelectedParticipant = (session.participantIds || []).some(
      (id) => String(id) === userId
    );

    // Reject anyone who is neither admin, creator, nor selected.
    if (!isAdmin && !isCreator && !isSelectedParticipant) {
      return NextResponse.json(
        { success: false, error: "You are not allowed to join this class" },
        { status: 403 }
      );
    }

    // Only the creator and admin are moderators.
    const isModerator = isAdmin || isCreator;

    const appId = process.env.NEXT_PUBLIC_JAAS_APP_ID;
    const keyId = process.env.JAAS_API_KEY_ID;
    const privateKey = process.env.JAAS_PRIVATE_KEY;

    if (!appId || !keyId || !privateKey) {
      console.error("Missing JaaS environment configuration");

      return NextResponse.json(
        { success: false, error: "JaaS configuration is incomplete" },
        { status: 500 }
      );
    }

    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    const signingKey = await importPKCS8(formattedPrivateKey, "RS256");

    const now = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({
      aud: "jitsi",
      iss: "chat",
      sub: appId,
      room: session.roomName,
      context: {
        user: {
          id: userId,
          name: user.name || user.username || "Innovative Academy User",
          email: user.email || "",
          moderator: isModerator,
        },
      },
    })
      .setProtectedHeader({
        alg: "RS256",
        kid: keyId,
        typ: "JWT",
      })
      .setIssuedAt(now)
      .setNotBefore(now - 5)
      .setExpirationTime(now + 60 * 60)
      .sign(signingKey);

    return NextResponse.json({
      success: true,
      token,
      roomName: session.roomName,
      isModerator,
    });
  } catch (error) {
    console.error("JaaS token error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to generate meeting token" },
      { status: 500 }
    );
  }
}
