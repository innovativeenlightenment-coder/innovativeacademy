import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/mongoose";

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

    if (!user?.email) return null;

    return user;
  } catch {
    return null;
  }
}

/* =========================================================
   GET EXAM PERFORMANCE OVERVIEW
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = request.nextUrl;

    const course = searchParams.get("course");
    const subject = searchParams.get("subject");
    const search = searchParams.get("search");

    /* =====================================================
       FETCH EXAMS
    ===================================================== */

    const examFilter: Record<string, any> = {};

    if (course && course !== "all") {
      examFilter.course = course;
    }

    if (subject && subject !== "all") {
      examFilter.subject = subject;
    }

    if (search) {
      examFilter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { course: { $regex: search, $options: "i" } },
      ];
    }

    const exams = await TeacherExam.find(examFilter)
      .sort({ "schedule.startTime": -1 })
      .lean();

    if (!exams.length) {
      return NextResponse.json({
        success: true,
        exams: [],
        courses: [],
        subjects: [],
        overview: {
          totalExams: 0,
          totalAttempts: 0,
          averagePercentage: 0,
          completedEvaluations: 0,
          pendingEvaluations: 0,
        },
      });
    }

    /* =====================================================
       FETCH ALL RECORDS FOR THESE EXAMS
    ===================================================== */

    const examIds = exams.map((exam: any) => exam._id);

    const records = await ExamRecords.find({
      examId: { $in: examIds },
    })
      .select(
        "examId student exam submittedAt evaluationStatus resultStatus totalQuestions answeredCount unansweredCount correctCount incorrectCount totalMarks obtainedMarks percentage timeSpentSeconds"
      )
      .lean();

    /* =====================================================
       GROUP RECORDS BY EXAM
    ===================================================== */

    const recordsByExam = new Map<string, any[]>();

    records.forEach((record: any) => {
      const id = String(record.examId);

      if (!recordsByExam.has(id)) {
        recordsByExam.set(id, []);
      }

      recordsByExam.get(id)!.push(record);
    });

    /* =====================================================
       EXAM STATISTICS
    ===================================================== */

    const formattedExams = exams.map((exam: any) => {
      const examRecords =
        recordsByExam.get(String(exam._id)) || [];

      const attempts = examRecords.length;

      const percentages = examRecords.map((r: any) =>
        Number(r.percentage || 0)
      );

      const averagePercentage =
        attempts > 0
          ? percentages.reduce((a, b) => a + b, 0) / attempts
          : 0;

      const highestPercentage =
        attempts > 0 ? Math.max(...percentages) : 0;

      const completedEvaluations = examRecords.filter(
        (r: any) => r.evaluationStatus === "completed"
      ).length;

      const pendingEvaluations = examRecords.filter(
        (r: any) => r.evaluationStatus !== "completed"
      ).length;

      const publishedResults = examRecords.filter(
        (r: any) => r.resultStatus === "published"
      ).length;

      const totalObtainedMarks = examRecords.reduce(
        (sum: number, r: any) =>
          sum + Number(r.obtainedMarks || 0),
        0
      );

      return {
        _id: String(exam._id),

        title: exam.title,
        testType: exam.testType,

        course: exam.course,
        subject: exam.subject,
        chapters: exam.chapters || [],

        teacherName: exam.teacherName,

        status: exam.status,

        schedule: {
          startTime: exam.schedule?.startTime || null,
          endTime: exam.schedule?.endTime || null,
          durationMinutes:
            exam.schedule?.durationMinutes || 0,
        },

        totalQuestions: exam.totalQuestions || 0,
        totalMarks: exam.totalMarks || 0,

        stats: {
          attempts,

          averagePercentage: Number(
            averagePercentage.toFixed(2)
          ),

          highestPercentage: Number(
            highestPercentage.toFixed(2)
          ),

          totalObtainedMarks: Number(
            totalObtainedMarks.toFixed(2)
          ),

          completedEvaluations,
          pendingEvaluations,
          publishedResults,
        },
      };
    });

    /* =====================================================
       COURSE AND SUBJECT FILTERS
    ===================================================== */

    const courses = Array.from(
      new Set(exams.map((e: any) => e.course).filter(Boolean))
    ).sort();

    const subjects = Array.from(
      new Set(exams.map((e: any) => e.subject).filter(Boolean))
    ).sort();

    /* =====================================================
       OVERALL OVERVIEW
    ===================================================== */

    const totalAttempts = records.length;

    const totalPercentage = records.reduce(
      (sum: number, r: any) =>
        sum + Number(r.percentage || 0),
      0
    );

    const completedEvaluations = records.filter(
      (r: any) => r.evaluationStatus === "completed"
    ).length;

    const pendingEvaluations =
      totalAttempts - completedEvaluations;

    const overview = {
      totalExams: exams.length,

      totalAttempts,

      averagePercentage:
        totalAttempts > 0
          ? Number(
              (totalPercentage / totalAttempts).toFixed(2)
            )
          : 0,

      completedEvaluations,
      pendingEvaluations,
    };

    return NextResponse.json({
      success: true,
      exams: formattedExams,
      courses,
      subjects,
      overview,
    });
  } catch (error) {
    console.error("Teacher Exam Performance API:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load exam performance.",
      },
      { status: 500 }
    );
  }
}