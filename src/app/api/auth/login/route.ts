import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import { generateToken } from "@/lib/generateToken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ success: false, message: "User not found" });
  if (!user.isEmailVerified) return NextResponse.json({ success: false, message: "Email not verified" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ success: false, message: "Invalid credentials" });

  const token = await generateToken(user._id.toString()); // now async

  if (!user.isSubscribed && !user.hasUsedTrial) {
  const TRIAL_DAYS = 7;
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  user.trialStart = now;
  user.trialEnd = trialEnd;
  user.hasUsedTrial = true;

  await user.save();
}

  const res = NextResponse.json({ success: true, user });
  res.cookies.set("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
