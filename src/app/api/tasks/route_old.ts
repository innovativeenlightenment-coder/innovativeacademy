import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import StudentTask from "@/model/StudentTaskSchema";
import { getTeacherFromRequest, normalizeCourse, validDateKey } from "@/lib/teacherAttendanceAuth_old";

export const dynamic = "force-dynamic";

async function authorizedCourse(teacher: any, course: string) {
  if (teacher.role === "admin") return true;
  return (teacher.courses || []).some((c: string) => c.trim() === course);
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const teacher: any = auth.user;
    const { searchParams } = new URL(req.url);
    const course = normalizeCourse(searchParams.get("course"));
    if (!course) return NextResponse.json({ success: true, tasks: [], courses: teacher.courses || [] });
    if (!(await authorizedCourse(teacher, course))) return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });

    await connectDB();
    const tasks = await StudentTask.find({ course }).sort({ dueDate: 1, createdAt: -1 }).lean();
    const students = await User.find({ role: "student", courses: course }).select("_id name username").lean();
    const studentMap = new Map(students.map((s: any) => [String(s._id), s]));

    return NextResponse.json({
      success: true,
      courses: teacher.role === "admin" ? Array.from(new Set((await User.distinct("courses", { role: "student" })).filter(Boolean))).sort() : teacher.courses || [],
      tasks: tasks.map((task: any) => ({
        id: String(task._id), course: task.course, title: task.title, description: task.description,
        taskType: task.taskType, assignedDate: task.assignedDate, dueDate: task.dueDate,
        studentStatuses: (task.studentStatuses || []).map((status: any) => ({
          studentId: String(status.studentId),
          studentName: (studentMap.get(String(status.studentId)) as any)?.name || (studentMap.get(String(status.studentId)) as any)?.username || "Student",
          studentStatus: status.studentStatus, studentNote: status.studentNote || "",
          teacherStatus: status.teacherStatus, teacherNote: status.teacherNote || "",
          submittedAt: status.submittedAt, verifiedAt: status.verifiedAt,
        })),
      })),
    });
  } catch (error) {
    console.error("Teacher tasks GET:", error);
    return NextResponse.json({ success: false, error: "Unable to load tasks." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const teacher: any = auth.user;
    const body = await req.json();
    const course = normalizeCourse(body.course);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const taskType = ["homework", "revision", "project", "other"].includes(body.taskType) ? body.taskType : "homework";
    const assignedDate = body.assignedDate;
    const dueDate = body.dueDate;

    if (!course || !title || title.length > 120 || description.length > 2000 || !validDateKey(assignedDate) || !validDateKey(dueDate)) {
      return NextResponse.json({ success: false, error: "Enter a title, course, valid assigned date, and due date." }, { status: 400 });
    }
    if (dueDate < assignedDate) return NextResponse.json({ success: false, error: "Due date cannot be before assigned date." }, { status: 400 });
    if (teacher.role !== "admin" && !(teacher.courses || []).map((c: string) => c.trim()).includes(course)) {
      return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    }

    await connectDB();
    const students = await User.find({ role: "student", courses: course }).select("_id").lean();
    const task = await StudentTask.create({
      course, title, description, taskType, assignedDate, dueDate, teacherId: teacher._id,
      studentStatuses: students.map((student: any) => ({
        studentId: student._id, studentStatus: "pending", teacherStatus: "pending",
      })),
    });
    return NextResponse.json({ success: true, task: { id: String(task._id), title: task.title } }, { status: 201 });
  } catch (error) {
    console.error("Teacher tasks POST:", error);
    return NextResponse.json({ success: false, error: "Unable to create task." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const teacher: any = auth.user;
    const body = await req.json();
    const taskId = String(body.taskId || "");
    const studentId = String(body.studentId || "");
    const status = body.teacherStatus;
    const teacherNote = String(body.teacherNote || "").trim().slice(0, 500);

    if (!/^[a-f\d]{24}$/i.test(taskId) || !/^[a-f\d]{24}$/i.test(studentId) || !["verified", "needs_revision", "pending"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid task update." }, { status: 400 });
    }

    await connectDB();
    const task = await StudentTask.findById(taskId);
    if (!task) return NextResponse.json({ success: false, error: "Task not found." }, { status: 404 });
    if (teacher.role !== "admin" && !(teacher.courses || []).map((c: string) => c.trim()).includes(task.course)) {
      return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    }

    const entry: any = task.studentStatuses.find((s: any) => String(s.studentId) === studentId);
    if (!entry) return NextResponse.json({ success: false, error: "Student is not assigned this task." }, { status: 404 });
    entry.teacherStatus = status;
    entry.teacherNote = teacherNote;
    entry.verifiedAt = status === "pending" ? null : new Date();
    await task.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Teacher tasks PATCH:", error);
    return NextResponse.json({ success: false, error: "Unable to update task." }, { status: 500 });
  }
}
