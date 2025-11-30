import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });

  // 🧹 Clear the auth cookie
  res.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
