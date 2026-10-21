import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyTokenEdge } from "@/lib/verifyToken";
import User from "@/model/UserSchema";

export async function getTeacherFromRequest(req: NextRequest) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  if (!token) return { error: NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 }) };

  const decoded = await verifyTokenEdge(token);
  if (!decoded || !decoded.id) {
    return { error: NextResponse.json({ success: false, error: "Invalid session." }, { status: 401 }) };
  }

  const user: any = await User.findById(decoded.id).select("_id name username email role courses").lean();
  if (!user) return { error: NextResponse.json({ success: false, error: "User not found." }, { status: 404 }) };
  if (user.role !== "teacher" && user.role !== "admin") {
    return { error: NextResponse.json({ success: false, error: "Teacher access required." }, { status: 403 }) };
  }
  return { user };
}

export function normalizeCourse(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
