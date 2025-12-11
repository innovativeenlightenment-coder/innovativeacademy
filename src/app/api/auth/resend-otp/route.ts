import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.emailVerificationOTP = otp;
    user.emailVerificationExpires = expiresAt;
    await user.save();

    // Send Email
    try {
      await sendEmail(
        email,
        "Resend OTP - Innovative Academy",
        `<h2>Your New OTP: ${otp}</h2>
         <p>This OTP will expire in 10 minutes.</p>`
      );
    } catch (err) {
      console.error("Email Error:", err);
    }

    return NextResponse.json({
      success: true,
      message: "OTP has been resent successfully.",
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
