import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import TeacherExam from "@/model/TeacherExamSchema";

import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

type SelectedQuestionInput = {
  id: string;
  marks: number;
  setId?: string;
};

type ExamSetInput = {
  setId: string;
  name: string;
};

const getIndiaDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values: Record<string, string> = {};

  parts.forEach((part) => {
    values[part.type] = part.value;
  });

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
};

export async function POST(req: NextRequest) {
  try {
    noStore();
    await connectDB();

    const body = await req.json();

    const {
      title,
      testType,
      teacherName,
      course,
      subject,
      chapters,
      startTime,
      endTime,
      durationMinutes,
      distribution,
      questionIds,
      sets,
    }: {
      title: string;
      testType: "weekly" | "monthly" | "quarterly" | "chapter";
      teacherName: string;
      course: string;
      subject: string;
      chapters: string[];
      startTime: string;
      endTime: string;
      durationMinutes: number;
      distribution: {
        mode: "same" | "sets";
        shuffleQuestions: boolean;
        shuffleOptions: boolean;
      };
      questionIds: SelectedQuestionInput[];
      sets: ExamSetInput[];
    } = body;

    // =============================================
    // BASIC VALIDATION
    // =============================================

    if (
      !title?.trim() ||
      !teacherName?.trim() ||
      !course?.trim() ||
      !subject?.trim() ||
      !Array.isArray(chapters) ||
      chapters.length === 0 ||
      !Array.isArray(questionIds) ||
      questionIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required examination details.",
        },
        { status: 400 }
      );
    }

    if (
      !["weekly", "monthly", "quarterly", "chapter"].includes(
        testType
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid examination type.",
        },
        { status: 400 }
      );
    }

    const uniqueChapters = Array.from(
      new Set(
        chapters
          .map((item) => String(item).trim())
          .filter(Boolean)
      )
    );

    if (uniqueChapters.length !== chapters.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate or invalid chapters were supplied.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > 600
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid exam duration.",
        },
        { status: 400 }
      );
    }

    // =============================================
    // SCHEDULE VALIDATION
    // =============================================

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid examination schedule.",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    const startIndia = getIndiaDateParts(start);
    const endIndia = getIndiaDateParts(end);
    const nowIndia = getIndiaDateParts(now);

    // Allow today, but never allow a past date.
    if (startIndia.date < nowIndia.date) {
      return NextResponse.json(
        {
          success: false,
          error: "Examination date cannot be in the past.",
        },
        { status: 400 }
      );
    }

    // Both times must be on the same Indian calendar date.
    if (startIndia.date !== endIndia.date) {
      return NextResponse.json(
        {
          success: false,
          error: "Examination must start and end on the same day.",
        },
        { status: 400 }
      );
    }

    // Fixed examination window: 09:00 to 21:00 IST.
    if (
      startIndia.hour !== 9 ||
      startIndia.minute !== 0 ||
      endIndia.hour !== 21 ||
      endIndia.minute !== 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "The examination window must be 09:00 to 21:00 IST.",
        },
        { status: 400 }
      );
    }

    // =============================================
    // DISTRIBUTION VALIDATION
    // =============================================

    const mode = distribution?.mode || "same";

    if (!["same", "sets"].includes(mode)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid distribution mode.",
        },
        { status: 400 }
      );
    }

    // =============================================
    // QUESTION VALIDATION
    // =============================================

    const validIds = questionIds.every(
      (item) =>
        item &&
        mongoose.Types.ObjectId.isValid(item.id) &&
        Number.isFinite(item.marks) &&
        item.marks >= 0.5
    );

    if (!validIds) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid selected question data.",
        },
        { status: 400 }
      );
    }

    const uniqueIds = new Set(
      questionIds.map((item) => item.id)
    );

    if (uniqueIds.size !== questionIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate questions are not allowed.",
        },
        { status: 400 }
      );
    }

    // =============================================
    // SET VALIDATION
    // =============================================

    if (mode === "sets") {
      if (
        !Array.isArray(sets) ||
        sets.length !== 2 ||
        !sets.some((set) => set.setId === "A") ||
        !sets.some((set) => set.setId === "B")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Set A and Set B are required.",
          },
          { status: 400 }
        );
      }

      const invalidSetAssignment = questionIds.some(
        (item) => !["A", "B"].includes(item.setId || "")
      );

      if (invalidSetAssignment) {
        return NextResponse.json(
          {
            success: false,
            error: "Every question must belong to Set A or Set B.",
          },
          { status: 400 }
        );
      }

      const setA = questionIds.filter(
        (item) => item.setId === "A"
      );

      const setB = questionIds.filter(
        (item) => item.setId === "B"
      );

      const marksA = setA.reduce(
        (sum, item) => sum + item.marks,
        0
      );

      const marksB = setB.reduce(
        (sum, item) => sum + item.marks,
        0
      );

      if (
        setA.length === 0 ||
        setB.length === 0 ||
        setA.length !== setB.length ||
        marksA !== marksB
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Both sets must have equal question counts and total marks.",
          },
          { status: 400 }
        );
      }
    }

    // =============================================
    // VERIFY QUESTIONS IN DATABASE
    // =============================================

    const documents = await QuestionBankV2.find({
      _id: {
        $in: questionIds.map(
          (item) => new mongoose.Types.ObjectId(item.id)
        ),
      },

      status: "published",
      course,
      subject,
      chapter: {
        $in: uniqueChapters,
      },
    })
      .select("_id questionId version course subject chapter status")
      .lean();

    if (documents.length !== questionIds.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Some questions are unavailable, unpublished, or outside the selected chapters. Refresh your question selection.",
        },
        { status: 400 }
      );
    }

    const documentMap = new Map(
      documents.map((doc: any) => [
        String(doc._id),
        doc,
      ])
    );

    // =============================================
    // BUILD EXAM QUESTIONS
    // =============================================

    const examQuestions = questionIds.map(
      (item, index) => {
        const doc: any = documentMap.get(item.id);

        return {
          questionDocumentId: doc._id,
          questionId: doc.questionId,
          version: doc.version,

          setId: mode === "sets" ? item.setId : "A",

          marks: item.marks,
          order: index + 1,
        };
      }
    );

    let totalQuestions = questionIds.length;

    let totalMarks = questionIds.reduce(
      (sum, item) => sum + item.marks,
      0
    );

    if (mode === "sets") {
      const setA = questionIds.filter(
        (item) => item.setId === "A"
      );

      totalQuestions = setA.length;

      totalMarks = setA.reduce(
        (sum, item) => sum + item.marks,
        0
      );
    }

    // =============================================
    // EXAM STATUS
    // =============================================

    // If created during today's examination window,
    // it becomes active immediately.
    // If created after closing time, it is completed.

    let examStatus:
      | "scheduled"
      | "active"
      | "completed" = "scheduled";

    if (now >= end) {
      examStatus = "completed";
    } else if (now >= start) {
      examStatus = "active";
    }

    // =============================================
    // CREATE EXAM
    // =============================================

    const exam = await TeacherExam.create({
      title: title.trim(),

      testType,

      teacherName: teacherName.trim(),

      course,
      subject,
      chapters: uniqueChapters,

      schedule: {
        startTime: start,
        endTime: end,
        durationMinutes,
      },

      distribution: {
        mode,

        shuffleQuestions: Boolean(
          distribution?.shuffleQuestions
        ),

        shuffleOptions: Boolean(
          distribution?.shuffleOptions
        ),
      },

      questions: examQuestions,

      sets: mode === "sets" ? sets : [],

      totalQuestions,
      totalMarks,

      status: examStatus,
      createdBy:teacherName.trim()
    });

    return NextResponse.json(
      {
        success: true,
        message: "Examination created successfully.",
        examId: exam._id,
        status: examStatus,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Save exam error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.message || "Failed to create examination.",
      },
      { status: 500 }
    );
  }
}