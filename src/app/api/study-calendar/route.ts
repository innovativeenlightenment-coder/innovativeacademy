import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { verifyTokenEdge } from "@/lib/verifyToken";
import User from "@/model/UserSchema";
import Attendance from "@/model/AttendanceSchema";
import StudentTask from "@/model/StudentTaskSchema";
import ExamSession from "@/model/ExamSessionSchema";

async function getStudent(req: NextRequest) {
  await connectDB();
  const token = req.cookies.get("token")?.value;
  if (!token) return { error: NextResponse.json({ success: false, error: "Please sign in to view your study calendar." }, { status: 401 }) };
  const decoded = await verifyTokenEdge(token);
  if (!decoded?.id) return { error: NextResponse.json({ success: false, error: "Your session is invalid. Please sign in again." }, { status: 401 }) };
  const student: any = await User.findById(decoded.id).select("_id name username email role courses").lean();
  if (!student) return { error: NextResponse.json({ success: false, error: "Student account not found." }, { status: 404 }) };
  // if (student.role !== "student") return { error: NextResponse.json({ success: false, error: "Student access required." }, { status: 403 }) };
  return { student };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudent(req);
    if (auth.error) return auth.error;
    const student = auth.student!;
    const courses: string[] = Array.isArray(student.courses) ? student.courses.filter((c: unknown): c is string => typeof c === "string" && c.trim().length > 0) : [];
    const studentId = new mongoose.Types.ObjectId(String(student._id));
    if (!courses.length) return NextResponse.json({ success: true, student: { id: String(student._id), name: student.name || student.username || "Student" }, courses, attendance: [], tasks: [], exams: [] });

    const [attendanceDocs, taskDocs, examDocs] = await Promise.all([
      Attendance.find({ course: { $in: courses }, "entries.studentId": studentId }).sort({ dateKey: -1 }).limit(180).lean().exec(),
      StudentTask.find({ course: { $in: courses }, "studentStatuses.studentId": studentId }).sort({ dueDate: 1, createdAt: -1 }).limit(200).lean().exec(),
      ExamSession.find({ course: { $in: courses }, "entries.studentId": studentId }).sort({ examDate: -1 }).limit(100).lean().exec(),
    ]);

    const attendance = attendanceDocs.map((doc: any) => {
      const entry = (doc.entries || []).find((e: any) => String(e.studentId) === String(student._id));
      return entry ? { id: String(doc._id), course: doc.course, dateKey: doc.dateKey, status: entry.status, note: entry.note || "" } : null;
    }).filter(Boolean);
    const tasks = taskDocs.map((doc: any) => {
      const status = (doc.studentStatuses || []).find((s: any) => String(s.studentId) === String(student._id));
      return status ? { id: String(doc._id), course: doc.course, title: doc.title, description: doc.description || "", taskType: doc.taskType, assignedDate: doc.assignedDate, dueDate: doc.dueDate, studentStatus: status.studentStatus, studentNote: status.studentNote || "", submittedAt: status.submittedAt || null, teacherStatus: status.teacherStatus, teacherNote: status.teacherNote || "", verifiedAt: status.verifiedAt || null } : null;
    }).filter(Boolean);
    const exams = examDocs.map((doc: any) => {
      const entry = (doc.entries || []).find((e: any) => String(e.studentId) === String(student._id));
      return entry ? { id: String(doc._id), course: doc.course, title: doc.title, examDate: doc.examDate, examType: doc.examType, instructions: doc.instructions || "", status: entry.status } : null;
    }).filter(Boolean);

    return NextResponse.json({ success: true, student: { id: String(student._id), name: student.name || student.username || "Student", username: student.username || "", email: student.email || "" }, courses, attendance, tasks, exams });
  } catch (error) {
    console.error("Student study calendar GET error:", error);
    return NextResponse.json({ success: false, error: "Unable to load your study calendar." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getStudent(req);
    if (auth.error) return auth.error;
    const student = auth.student!;
    const body = await req.json();
    const taskId = typeof body.taskId === "string" ? body.taskId : "";
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "";
    if (!mongoose.isValidObjectId(taskId)) return NextResponse.json({ success: false, error: "Invalid task." }, { status: 400 });
    const courses: string[] = Array.isArray(student.courses) ? student.courses.filter((c: unknown): c is string => typeof c === "string") : [];
    const task: any = await StudentTask.findOne({ _id: taskId, course: { $in: courses }, "studentStatuses.studentId": student._id });
    if (!task) return NextResponse.json({ success: false, error: "Task not found for your account." }, { status: 404 });
    const status = task.studentStatuses.find((s: any) => String(s.studentId) === String(student._id));
    if (!status) return NextResponse.json({ success: false, error: "Your task record was not found." }, { status: 404 });
    status.studentStatus = "submitted";
    status.studentNote = note;
    status.submittedAt = new Date();
    // A new submission needs a fresh teacher review. Existing review notes are retained for context.
    status.teacherStatus = "pending";
    status.verifiedAt = null;
    task.markModified("studentStatuses");
    await task.save();
    return NextResponse.json({ success: true, message: "Homework submitted successfully." });
  } catch (error) {
    console.error("Student task submission error:", error);
    return NextResponse.json({ success: false, error: "Unable to submit this task." }, { status: 500 });
  }
}
