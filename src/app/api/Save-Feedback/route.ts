import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongoose";
import Feedback from "@/model/FeedbackSchema";
import User from "@/model/UserSchema"; // your existing user model

export async function POST(req: Request) {
  try {
    await connectDB();

    const token = req.headers.get("token"); // your normal method
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch logged-in student using your method
    const user = await User.findOne({ token });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid user" },
        { status: 401 }
      );
    }

    // Incoming data from form
    const { rating, message } = await req.json();

    if (!rating || !message) {
      return NextResponse.json(
        { success: false, message: "Rating & message required" },
        { status: 400 }
      );
    }

    // Save feedback with auto-filled details
    await Feedback.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.avatar, // cloudinary DP
      rating,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Feedback submitted!",
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
