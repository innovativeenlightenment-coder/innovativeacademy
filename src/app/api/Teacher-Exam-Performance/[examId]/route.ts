import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";

import TeacherExam from "@/model/TeacherExamSchema";
import ExamRecords from "@/model/ExamRecordSchema";

export const dynamic = "force-dynamic";

/* =========================================================
   AUTHENTICATION
========================================================= */

async function authenticate(request: NextRequest) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

    const response = await fetch(
      `${baseUrl}/api/auth/Get-Current-User`,
      {
        method: "GET",
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const user = data?.user || data;

    return user?.email ? user : null;
  } catch {
    return null;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function round(value: number) {
  return Number((Number(value) || 0).toFixed(2));
}

/* =========================================================
   GET EXAM DETAILS
========================================================= */

export async function GET(
  request: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { examId } = params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid exam ID.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       FETCH EXAM
    ===================================================== */

    const exam: any = await TeacherExam.findById(examId).lean();

    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          message: "Exam not found.",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       FETCH STUDENT SUBMISSIONS
    ===================================================== */

    const records: any[] = await ExamRecords.find({
      examId: new mongoose.Types.ObjectId(examId),
    })
      .sort({
        obtainedMarks: -1,
        submittedAt: 1,
      })
      .lean();

    /* =====================================================
       STUDENT RESULTS
    ===================================================== */

    const students = records.map((record: any, index: number) => {
      return {
        _id: String(record._id),

        rank: index + 1,

        student: {
          name: record.student?.name || "Unknown Student",
          username: record.student?.username || "",
          email: record.student?.email || "",
        },

        submittedAt: record.submittedAt || null,

        totalQuestions: Number(record.totalQuestions || 0),

        answeredCount: Number(record.answeredCount || 0),
        unansweredCount: Number(record.unansweredCount || 0),

        correctCount: Number(record.correctCount || 0),
        incorrectCount: Number(record.incorrectCount || 0),

        totalMarks: Number(record.totalMarks || 0),
        obtainedMarks: Number(record.obtainedMarks || 0),

        percentage: Number(record.percentage || 0),

        timeSpentSeconds: Number(
          record.timeSpentSeconds || 0
        ),

        evaluationStatus:
          record.evaluationStatus || "pending",

        resultStatus:
          record.resultStatus || "pending",

        publishAt: record.publishAt || null,
        publishedAt: record.publishedAt || null,
      };
    });

    /* =====================================================
       SUMMARY STATISTICS
    ===================================================== */

    const attempts = students.length;

    const percentages = students.map(
      (student) => student.percentage
    );

    const marks = students.map(
      (student) => student.obtainedMarks
    );

    const averagePercentage =
      attempts > 0
        ? percentages.reduce((a, b) => a + b, 0) / attempts
        : 0;

    const completedEvaluations = students.filter(
      (student) => student.evaluationStatus === "completed"
    ).length;

    const publishedResults = students.filter(
      (student) => student.resultStatus === "published"
    ).length;

    const summary = {
      attempts,

      averagePercentage: round(averagePercentage),

      highestPercentage:
        attempts > 0 ? Math.max(...percentages) : 0,

      lowestPercentage:
        attempts > 0 ? Math.min(...percentages) : 0,

      averageMarks:
        attempts > 0
          ? round(
              marks.reduce((a, b) => a + b, 0) / attempts
            )
          : 0,

      completedEvaluations,

      pendingEvaluations:
        attempts - completedEvaluations,

      publishedResults,
    };

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,

      exam: {
        _id: String(exam._id),

        title: exam.title,
        testType: exam.testType,

        course: exam.course,
        subject: exam.subject,

        chapters: exam.chapters || [],

        status: exam.status,

        schedule: {
          startTime: exam.schedule?.startTime || null,
          endTime: exam.schedule?.endTime || null,
          durationMinutes:
            exam.schedule?.durationMinutes || 0,
        },

        totalQuestions: exam.totalQuestions || 0,
        totalMarks: exam.totalMarks || 0,
      },

      summary,

      students,
    });
  } catch (error) {
    console.error(
      "Teacher Exam Performance Detail:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load exam performance.",
      },
      { status: 500 }
    );
  }
}