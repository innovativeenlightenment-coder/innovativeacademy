// src/app/api/auth/update-user/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Just a placeholder until you add real logic
    return NextResponse.json({ success: true, message: "Update user route working" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
