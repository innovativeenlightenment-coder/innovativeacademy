import {connectDB} from "@/lib/mongoose";
import User from "@/model/UserSchema";
import crypto from "crypto";
import { sendEmail } from "@/lib/sendEmail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const { email } = await req.json();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ success: false, message: "User not found" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  await user.save();

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;
  await sendEmail(email, "Password Reset", `<a href="${resetUrl}">Reset Password</a>`);

  return NextResponse.json({ success: true, message: "Reset email sent" });
}
