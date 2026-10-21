import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getTeacherFromRequest, normalizeCourse } from "@/lib/teacherAttendanceAuth_old";
import User from "@/model/UserSchema";
import RevisionAssignment from "@/model/RevisionAssignmentSchema";

export const dynamic = "force-dynamic";
type AnyRecord = Record<string, any>;

function cleanActivity(raw: AnyRecord) {
  const type = ["mcq", "explain", "flashcard", "rapid_fire"].includes(raw?.type)
    ? raw.type
    : "";

  const prompt =
    typeof raw?.prompt === "string"
      ? raw.prompt.trim().slice(0, 4000)
      : "";

  const correctAnswer =
    typeof raw?.correctAnswer === "string"
      ? raw.correctAnswer.trim().slice(0, 5000)
      : "";

  const options = Array.isArray(raw?.options)
    ? raw.options
        .map((value: unknown) =>
          typeof value === "string" ? value.trim().slice(0, 500) : ""
        )
        .filter(Boolean)
        .slice(0, 6)
    : [];

  const timeLimitSeconds = Math.max(
    0,
    Math.min(300, Number(raw?.timeLimitSeconds) || 0)
  );

  const difficulty = ["easy", "moderate", "difficult"].includes(raw?.difficulty)
    ? raw.difficulty
    : "moderate";

  if (!type || !prompt || !correctAnswer) return null;

  if (type === "mcq" && (options.length < 2 || !options.includes(correctAnswer))) {
    return null;
  }

  return {
    type,
    prompt,
    correctAnswer,
    options,
    explanation:
      typeof raw?.explanation === "string"
        ? raw.explanation.trim().slice(0, 5000)
        : "",
    difficulty,
    timeLimitSeconds,
    imageUrl:
      typeof raw?.imageUrl === "string"
        ? raw.imageUrl.trim().slice(0, 2000)
        : "",
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const user = auth.user!;
    const params = new URL(req.url).searchParams;
    const course = normalizeCourse(params.get("course"));
    const isAdmin = user.role === "admin";
    const teacherCourses: string[] = Array.isArray(user.courses) ? user.courses.filter((c: unknown): c is string => typeof c === "string") : [];
    const courses = isAdmin ? Array.from(new Set((await User.distinct("courses", { role: "student" })).flat().filter((c: unknown): c is string => typeof c === "string" && Boolean(c.trim())))) : teacherCourses;
    if (course && !isAdmin && !teacherCourses.includes(course)) return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    const selectedCourse = course || courses[0] || "";
    const [students, docs] = selectedCourse ? await Promise.all([
      User.find({ role: "student", courses: selectedCourse }).select("_id name username email").sort({ name: 1 }).lean(),
      RevisionAssignment.find({ course: selectedCourse, ...(isAdmin ? {} : { teacherId: user._id }) }).sort({ createdAt: -1 }).limit(100).lean(),
    ]) : [[], []];
    const studentRows = (students as AnyRecord[]).map(s => ({ id: String(s._id), name: s.name || s.username || s.email || "Student", username: s.username || "", email: s.email || "" }));
    const revisions = (docs as AnyRecord[]).map(doc => ({
      id: String(doc._id), course: doc.course, title: doc.title, instructions: doc.instructions || "", subject: doc.subject || "", chapter: doc.chapter || "", topic: doc.topic || "", assignedDate: doc.assignedDate, dueDate: doc.dueDate,
      activityCount: (doc.activities || []).length,
      studentStatuses: (doc.studentStatuses || []).map((s: AnyRecord) => ({ studentId: String(s.studentId), status: s.status, startedAt: s.startedAt, completedAt: s.completedAt, studentName: studentRows.find(x => x.id === String(s.studentId))?.name || "Student" })),
    }));
    return NextResponse.json({ success: true, courses, course: selectedCourse, students: studentRows, revisions });
  } catch (error) {
    console.error("Teacher revisions GET error:", error);
    return NextResponse.json({ success: false, error: "Unable to load revision activities." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);
    if (auth.error) return auth.error;
    const user = auth.user!;
    const body = await req.json();
    const course = normalizeCourse(body.course);
    const teacherCourses: string[] = Array.isArray(user.courses) ? user.courses.filter((c: unknown): c is string => typeof c === "string") : [];
    if (user.role !== "admin" && !teacherCourses.includes(course)) return NextResponse.json({ success: false, error: "You are not assigned to this course." }, { status: 403 });
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
    const assignedDate = typeof body.assignedDate === "string" ? body.assignedDate : "";
    const dueDate = typeof body.dueDate === "string" ? body.dueDate : "";
    const activities = Array.isArray(body.activities) ? body.activities.map(cleanActivity) : [];
    if (!course || !title || !/^\d{4}-\d{2}-\d{2}$/.test(assignedDate) || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return NextResponse.json({ success: false, error: "Course, title and valid assignment/deadline dates are required." }, { status: 400 });
    if (dueDate < assignedDate) return NextResponse.json({ success: false, error: "Deadline cannot be before the assigned date." }, { status: 400 });
    if (!activities.length || activities.some((a: AnyRecord | null) => !a)) return NextResponse.json({ success: false, error: "Every activity needs a question/prompt and correct answer. MCQs need at least two options and the correct answer must match one option." }, { status: 400 });
    const requestedIds = Array.isArray(body.studentIds) ? body.studentIds.filter((id: unknown): id is string => typeof id === "string" && mongoose.isValidObjectId(id)) : [];
    const assignToAll = body.assignToAll !== false;
    const studentFilter: AnyRecord = { role: "student", courses: course };
    if (!assignToAll) {
      if (!requestedIds.length) return NextResponse.json({ success: false, error: "Select at least one student or assign to the whole class." }, { status: 400 });
      studentFilter._id = { $in: requestedIds };
    }
    const students = await User.find(studentFilter).select("_id").lean();
    if (!students.length) return NextResponse.json({ success: false, error: "No eligible students were found for this assignment." }, { status: 400 });
    const revision = await RevisionAssignment.create({
      course, title,
      instructions: typeof body.instructions === "string" ? body.instructions.trim().slice(0, 3000) : "",
      subject: typeof body.subject === "string" ? body.subject.trim().slice(0, 100) : "",
      chapter: typeof body.chapter === "string" ? body.chapter.trim().slice(0, 160) : "",
      topic: typeof body.topic === "string" ? body.topic.trim().slice(0, 160) : "",
      assignedDate, dueDate, teacherId: user._id, activities,
      studentStatuses: students.map((s: AnyRecord) => ({ studentId: s._id, status: "not_attempted" })), published: true,
    });
    return NextResponse.json({ success: true, message: "Revision published successfully.", revisionId: String(revision._id) }, { status: 201 });
  } catch (error) {
    console.error("Teacher revisions POST error:", error);
    return NextResponse.json({ success: false, error: "Unable to publish revision." }, { status: 500 });
  }
}
