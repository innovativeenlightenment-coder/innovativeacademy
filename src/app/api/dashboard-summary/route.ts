import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import TestRecords from "@/model/TestRecordSchema";
import ExamRecords from "@/model/ExamRecordSchema";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import QuestionBankSchema from "@/model/QuestionBankSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AnyRecord = Record<string, any>;

function average(values: number[]) {
  if (!values.length) return 0;
  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)
  );
}

/**
 * Resolve the signed-in user through the app's existing current-user endpoint.
 * The browser's session cookie is forwarded; identity is never accepted from
 * a userId/email query parameter.
 */
async function getAuthenticatedUser(req: NextRequest) {
  const authUrl = new URL("/api/auth/Get-Current-User", req.url);
  const cookie = req.headers.get("cookie") || "";

  const response = await fetch(authUrl, {
    method: "GET",
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  if (!data?.success || !data?.user) return null;

  return data.user as AnyRecord;
}

export async function GET(req: NextRequest) {
  noStore();

  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const role = String(user.role || "").trim().toLowerCase();
    const allowedRoles = ["admin", "college", "school", "teacher", "student"];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Unsupported account role." },
        { status: 403 }
      );
    }

    await connectDB();

    // Student dashboard: only the signed-in student's own records.
    if (role === "student") {
      const email = String(user.email || "").trim();
      const username = String(user.username || "").trim();

      if (!email && !username) {
        return NextResponse.json({
          success: true,
          role,
          user: { name: user.name || "Student", courses: user.courses || [] },
          student: { totalTests: 0, averagePercentage: 0, bestPercentage: 0, records: [] },
        });
      }

      const identityFilter: AnyRecord[] = [];
      if (email) identityFilter.push({ email });
      if (username) identityFilter.push({ username });

      const records = await TestRecords.find({ $or: identityFilter })
        .select("_id score percentage date subject chapter course testType")
        .sort({ date: -1 })
        .limit(100)
        .lean();

      const percentages = records.map((record: AnyRecord) => Number(record.percentage ?? 0));

      return NextResponse.json({
        success: true,
        role,
        user: {
          name: user.name || user.username || "Student",
          courses: Array.isArray(user.courses) ? user.courses : [],
        },
        student: {
          totalTests: records.length,
          averagePercentage: average(percentages),
          bestPercentage: percentages.length ? Math.max(...percentages) : 0,
          records: records.map((record: AnyRecord) => ({
            _id: String(record._id),
            score: Number(record.score ?? 0),
            percentage: Number(record.percentage ?? 0),
            date: record.date || null,
            subject: record.subject || "",
            chapter: record.chapter || "",
            course: record.course || "",
            testType: record.testType || "",
          })),
        },
      });
    }

    // Admin gets system-wide counts; no private user records are returned.
    if (role === "admin") {
      const [
        totalStudents,
        totalTeachers,
        totalSchools,
        totalColleges,
        totalQuestionBankQuestions,
        totalPracticeAttempts,
        totalExamPapers,
        totalExamRecords,
      ] = await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "teacher" }),
        User.countDocuments({ role: "school" }),
        User.countDocuments({ role: "college" }),
        QuestionBankSchema.countDocuments({}),
        TestRecords.countDocuments({}),
        TeacherExamPaper.countDocuments({}),
        ExamRecords.countDocuments({}),
      ]);

      return NextResponse.json({
        success: true,
        role,
        user: { name: user.name || user.username || "Admin" },
        admin: {
          totalStudents,
          totalTeachers,
          totalSchools,
          totalColleges,
          totalQuestionBankQuestions,
          totalPracticeAttempts,
          totalExamPapers,
          totalExamRecords,
        },
      });
    }

    // Teacher / school / college dashboards are scoped to courses assigned to
    // the current account. The User schema uses courses: string[].
    const courses: string[] = Array.isArray(user.courses)
      ? user.courses.map((course: unknown) => String(course).trim()).filter(Boolean)
      : [];

    if (role === "teacher") {
      const [studentCount, practiceAttempts, examPapers] = courses.length
        ? await Promise.all([
            User.countDocuments({ role: "student", courses: { $in: courses } }),
            TestRecords.countDocuments({ course: { $in: courses } }),
            TeacherExamPaper.countDocuments({ course: { $in: courses } }),
          ])
        : [0, 0, 0];

      const recentRecords = courses.length
        ? await TestRecords.find({ course: { $in: courses } })
            .select("_id score percentage date subject chapter course testType")
            .sort({ date: -1 })
            .limit(6)
            .lean()
        : [];

      return NextResponse.json({
        success: true,
        role,
        user: { name: user.name || user.username || "Teacher", courses },
        teacher: {
          assignedCourses: courses,
          assignedCourseCount: courses.length,
          studentCount,
          practiceAttempts,
          examPapers,
          recentRecords: recentRecords.map((record: AnyRecord) => ({
            _id: String(record._id),
            score: Number(record.score ?? 0),
            percentage: Number(record.percentage ?? 0),
            date: record.date || null,
            subject: record.subject || "",
            chapter: record.chapter || "",
            course: record.course || "",
            testType: record.testType || "",
          })),
        },
      });
    }

    // School and college are accepted roles but are not part of the three
    // requested dashboards yet. Return only safe account summary information.
    return NextResponse.json({
      success: true,
      role,
      user: { name: user.name || user.username || role, courses },
      organization: {
        assignedCourses: courses,
        assignedCourseCount: courses.length,
      },
    });
  } catch (error) {
    console.error("Dashboard summary API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard summary." },
      { status: 500 }
    );
  }
}
