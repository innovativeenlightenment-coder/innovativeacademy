import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import Attendance from "@/model/AttendanceSchema";
import { getTeacherFromRequest, normalizeCourse, validDateKey } from "@/lib/teacherAttendanceAuth_old";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const teacher: any = auth.user;
    const { searchParams } = new URL(req.url);
    const course = normalizeCourse(searchParams.get("course"));
    const dateKey = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    if (!validDateKey(dateKey)) return NextResponse.json({ success: false, error: "Date must be YYYY-MM-DD." }, { status: 400 });
    if (!course) {
      await connectDB();
      const adminCourses = teacher.role === "admin"
        ? Array.from(new Set((await User.distinct("courses", { role: "student" })).filter(Boolean))).sort()
        : [];
      return NextResponse.json({
        success: true,
        courses: teacher.role === "admin" ? adminCourses : teacher.courses || [],
        students: [],
        attendance: null,
      });
    }

    const allowedCourses: string[] = (teacher.courses || []).map((c: string) => c.trim()).filter(Boolean);
    if (teacher.role !== "admin" && !allowedCourses.includes(course)) {
      return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    }

    await connectDB();
    const students = await User.find({ role: "student", courses: course })
      .select("_id name username email avatar courses")
      .sort({ name: 1, username: 1 }).lean();

    const attendance: any = await Attendance.findOne({ course, dateKey }).lean();
    return NextResponse.json({
      success: true,
      courses: teacher.role === "admin" ? Array.from(new Set((await User.distinct("courses", { role: "student" })).filter(Boolean))).sort() : allowedCourses,
      students: students.map((s: any) => ({ id: String(s._id), name: s.name || s.username || "Student", username: s.username, email: s.email, avatar: s.avatar || "" })),
      attendance: attendance ? { id: String(attendance._id), dateKey: attendance.dateKey, entries: attendance.entries.map((e: any) => ({ studentId: String(e.studentId), status: e.status, note: e.note || "" })) } : null,
    });
  } catch (error) {
    console.error("Teacher attendance GET:", error);
    return NextResponse.json({ success: false, error: "Unable to load attendance." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const teacher: any = auth.user;
    const body = await req.json();
    const course = normalizeCourse(body.course);
    const dateKey = body.dateKey;
    const entries = body.entries;

    if (!course || !validDateKey(dateKey) || !Array.isArray(entries)) {
      return NextResponse.json({ success: false, error: "Course, valid date, and attendance entries are required." }, { status: 400 });
    }
    if (teacher.role !== "admin" && !(teacher.courses || []).map((c: string) => c.trim()).includes(course)) {
      return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    }

    await connectDB();
    const studentIds = entries.map((entry: any) => String(entry.studentId || ""));
    if (studentIds.some((id: string) => !/^[a-f\d]{24}$/i.test(id))) {
      return NextResponse.json({ success: false, error: "Invalid student in attendance list." }, { status: 400 });
    }
    const validStudents = await User.find({ _id: { $in: studentIds }, role: "student", courses: course }).select("_id").lean();
    if (validStudents.length !== new Set(studentIds).size) {
      return NextResponse.json({ success: false, error: "One or more students do not belong to this course." }, { status: 400 });
    }

    const allowed = new Set(["present", "absent", "late", "leave"]);
    const normalized = entries.map((entry: any) => {
      if (!allowed.has(entry.status)) throw new Error("Invalid attendance status.");
      return { studentId: entry.studentId, status: entry.status, note: String(entry.note || "").trim().slice(0, 300) };
    });

    const record: any = await Attendance.findOneAndUpdate(
      { course, dateKey },
      { $set: { course, dateKey, teacherId: teacher._id, entries: normalized, updatedBy: teacher._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({ success: true, attendance: { id: String(record._id), dateKey: record.dateKey, entries: record.entries } });
  } catch (error: any) {
    console.error("Teacher attendance POST:", error);
    return NextResponse.json({ success: false, error: error.message === "Invalid attendance status." ? error.message : "Unable to save attendance." }, { status: error.message === "Invalid attendance status." ? 400 : 500 });
  }
}
