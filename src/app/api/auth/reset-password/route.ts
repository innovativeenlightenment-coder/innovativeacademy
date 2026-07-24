import {connectDB} from "@/lib/mongoose";
import User from "@/model/UserSchema";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const { token, newPassword } = await req.json();
  const user = await User.findOne({ resetToken: token });
  if (!user) return NextResponse.json({ success: false, message: "Invalid token" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  await user.save();
  return NextResponse.json({ success: true, message: "Password reset successful" });
}

