import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { SignJWT, importPKCS8 } from "jose";

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

    if (!["teacher", "admin", "student"].includes(user.role)) {
      return NextResponse.json(
        { message: "You cannot join this class." },
        { status: 403 }
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
        { message: "This live class has ended." },
        { status: 404 }
      );
    }

    const appId = process.env.NEXT_PUBLIC_JAAS_APP_ID;
    const kid = process.env.JAAS_API_KEY_ID;
    const privateKeyValue = process.env.JAAS_PRIVATE_KEY;

    if (!appId || !kid || !privateKeyValue) {
      console.error("JaaS environment variables are missing.");

      return NextResponse.json(
        { message: "Live classroom is not configured." },
        { status: 500 }
      );
    }

    const privateKey = privateKeyValue.replace(/\\n/g, "\n");

    const signingKey = await importPKCS8(
      privateKey,
      "RS256"
    );

    const isModerator =
      ["teacher", "admin"].includes(user.role) &&
      session.startedBy.toString() === user._id.toString();

    const now = Math.floor(Date.now() / 1000);

    const jwt = await new SignJWT({
      aud: "jitsi",
      context: {
        user: {
          id: user._id.toString(),
          name: user.name || user.username,
          email: user.email,
          moderator: isModerator ? "true" : "false",
        },
      },
      room: session.roomName,
    })
      .setProtectedHeader({
        alg: "RS256",
        kid,
        typ: "JWT",
      })
      .setIssuer("chat")
      .setSubject(appId)
      .setNotBefore(now - 5)
      .setIssuedAt(now)
      .setExpirationTime(now + 6 * 60 * 60)
      .sign(signingKey);

 
    return NextResponse.json({
  jwt,
  appId,
  roomName: session.roomName,
  isModerator,
  displayName: user.name || user.username,
  email: user.email,
}, {
  headers: { "Cache-Control": "no-store" },
});
  } catch (error) {
    console.error("JAAS TOKEN ERROR:", error);

    return NextResponse.json(
      { message: "Unable to authenticate with JaaS." },
      { status: 500 }
    );
  }
}