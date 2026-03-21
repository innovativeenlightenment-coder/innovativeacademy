import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import { verifyTokenEdge } from "@/lib/verifyToken";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
  }

  const decoded = await verifyTokenEdge(token);
  if (!decoded || !decoded.id) {
    return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  let isSubscribed = user.isSubscribed;

  if (user.collegeId?.subscribedTill) {
    isSubscribed ||= new Date(user.collegeId.subscribedTill) > new Date();
  }

   let isTrialActive = false;

  if (user.trialStart && user.trialEnd) {
    const now = new Date();
    const start = new Date(user.trialStart);
    const end = new Date(user.trialEnd);

    if (now >= start && now <= end) {
      isTrialActive = true;
    }
  }

  return NextResponse.json({
    success: true,
    user: {
      // _id: user._id,
      // name: user.name,
      // username: user.username,
      // email: user.email,
      // role: user.role,
      // isSubscribed,
      ...user._doc,
      isTrialActive
    },
  });
}
