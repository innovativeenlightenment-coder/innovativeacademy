import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import ExamSession from "@/model/ExamSessionSchema";
import { getTeacherFromRequest, normalizeCourse, validDateKey } from "@/lib/teacherAttendanceAuth_old";

export const dynamic = "force-dynamic";
const validId = (id: unknown) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

async function getAllowedCourses(teacher: any): Promise<string[]> {
  if (teacher.role === "admin") return Array.from(new Set((await User.distinct("courses", { role: "student" })).filter(Boolean))).sort();
  return (teacher.courses || []).map((c: string) => c.trim()).filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const teacher: any = auth.user;
    const course = normalizeCourse(new URL(req.url).searchParams.get("course"));
    const courses = await getAllowedCourses(teacher);
    if (!course) return NextResponse.json({ success: true, courses, exams: [] });
    if (!courses.includes(course)) return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    await connectDB();
    const exams = await ExamSession.find({ course }).sort({ examDate: -1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, courses, exams: exams.map((exam: any) => ({
      id: String(exam._id), course: exam.course, title: exam.title, examDate: exam.examDate,
      examType: exam.examType, instructions: exam.instructions || "",
      entries: (exam.entries || []).map((entry: any) => ({ studentId: String(entry.studentId), status: entry.status, note: entry.note || "" })),
    })) });
  } catch (error) {
    console.error("Teacher exams GET:", error);
    return NextResponse.json({ success: false, error: "Unable to load exam records." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const teacher: any = auth.user;
    const body = await req.json();
    const course = normalizeCourse(body.course);
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
    const examDate = body.examDate;
    const examType = body.examType;
    const instructions = typeof body.instructions === "string" ? body.instructions.trim().slice(0, 1000) : "";
    if (!course || !title || !validDateKey(examDate) || !["online_mcq", "offline_theory"].includes(examType)) {
      return NextResponse.json({ success: false, error: "Course, exam name, valid date, and exam type are required." }, { status: 400 });
    }
    const courses = await getAllowedCourses(teacher);
    if (!courses.includes(course)) return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    await connectDB();
    const students = await User.find({ role: "student", courses: course }).select("_id").lean();
    const entries = students.map((student: any) => ({ studentId: student._id, status: "unmarked", note: "" }));
    const exam = await ExamSession.create({ course, title, examDate, examType, instructions, teacherId: teacher._id, updatedBy: teacher._id, entries });
    return NextResponse.json({ success: true, exam: { id: String(exam._id), course, title, examDate, examType, instructions, entries: entries.map((e: any) => ({ studentId: String(e.studentId), status: e.status, note: e.note })) } }, { status: 201 });
  } catch (error) {
    console.error("Teacher exams POST:", error);
    return NextResponse.json({ success: false, error: "Unable to create exam record." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const teacher: any = auth.user;
    const body = await req.json();
    const examId = body.examId;
    const entries = body.entries;
    if (!validId(examId) || !Array.isArray(entries)) return NextResponse.json({ success: false, error: "Valid exam and attendance entries are required." }, { status: 400 });
    await connectDB();
    const exam: any = await ExamSession.findById(examId).lean();
    if (!exam) return NextResponse.json({ success: false, error: "Exam record not found." }, { status: 404 });
    const courses = await getAllowedCourses(teacher);
    if (!courses.includes(exam.course)) return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    const studentIds = entries.map((entry: any) => String(entry.studentId || ""));
    if (studentIds.some((id: string) => !validId(id)) || new Set(studentIds).size !== studentIds.length) return NextResponse.json({ success: false, error: "Invalid or duplicate student in attendance list." }, { status: 400 });
    const validStudents = await User.find({ _id: { $in: studentIds }, role: "student", courses: exam.course }).select("_id").lean();
    if (validStudents.length !== studentIds.length) return NextResponse.json({ success: false, error: "One or more students do not belong to this course." }, { status: 400 });
    const allowed = new Set(["unmarked", "present", "absent"]);
    const normalized = entries.map((entry: any) => {
      if (!allowed.has(entry.status)) throw new Error("Invalid exam attendance status.");
      return { studentId: entry.studentId, status: entry.status, note: String(entry.note || "").trim().slice(0, 300) };
    });
    const updated: any = await ExamSession.findByIdAndUpdate(examId, { $set: { entries: normalized, updatedBy: teacher._id } }, { new: true, runValidators: true }).lean();
    return NextResponse.json({ success: true, exam: { id: String(updated._id), entries: updated.entries.map((e: any) => ({ studentId: String(e.studentId), status: e.status, note: e.note || "" })) } });
  } catch (error: any) {
    console.error("Teacher exams PATCH:", error);
    return NextResponse.json({ success: false, error: error.message === "Invalid exam attendance status." ? error.message : "Unable to save exam attendance." }, { status: error.message === "Invalid exam attendance status." ? 400 : 500 });
  }
}
