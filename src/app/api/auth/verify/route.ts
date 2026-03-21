import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { otp } = await req.json();

    const user = await User.findOne({ emailVerificationOTP: otp });
    if (!user) return NextResponse.json({ success: false, message: "Invalid OTP" });
console.log(Date.now(), new Date(user.emailVerificationExpires).getTime())
 if (Date.now() > new Date(user.emailVerificationExpires).getTime()) {
  return NextResponse.json({ success: false, message: "OTP expired" });
}

    user.isEmailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationExpires = null;
    
    await user.save();

    return NextResponse.json({ success: true, message: "Email verified successfully!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Verification failed" });
  }
}
