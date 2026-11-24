import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import QuestionBankV2 from "@/model/QuestionBankV2";
import TestRecords from "@/model/TestRecordSchema";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

type SecondsPerQuestion = {
  easy: number;
  moderate: number;
  difficult: number;
  extreme: number;
};

const DEFAULT_SECONDS_PER_QUESTION: SecondsPerQuestion = {
  easy: 10,
  moderate: 20,
  difficult: 45,
  extreme: 60,
};

/* =====================================================
   HELPERS
===================================================== */

function getDifficulty(question: any): keyof SecondsPerQuestion {
  const difficulty = String(
    question?.difficulty ||
      question?.learning?.difficulty ||
      "easy"
  ).toLowerCase();

  if (
    difficulty === "moderate" ||
    difficulty === "difficult" ||
    difficulty === "extreme"
  ) {
    return difficulty;
  }

  return "easy";
}

function getQuestionId(reference: any): string {
  if (typeof reference === "string") {
    return reference.trim();
  }

  if (!reference || typeof reference !== "object") {
    return "";
  }

  const candidates = [
    reference.questionDocumentId,
    reference._id,
    reference.id,
  ];

  for (const candidate of candidates) {
    const id = String(candidate || "").trim();

    if (mongoose.Types.ObjectId.isValid(id)) {
      return id;
    }
  }

  return "";
}

function normalizeSkills(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    )
  );
}

/* =====================================================
   STUDENT-SAFE QUESTION SANITIZATION

   Preserve:
   - Question skills
   - Step skills
   - Part skills
   - Part-step skills
   - Response configuration
   - Prompt and options

   Never send:
   - Answer keys
   - Evaluation rules
   - Solutions
   - Explanations
===================================================== */

function sanitizeStep(step: any) {
  if (!step || typeof step !== "object") {
    return null;
  }

  return {
    stepId: step.stepId,
    order: step.order,
    title: step.title,
    instruction: step.instruction,
    response: step.response,
    options: step.options,

    // Learning Skills
    skills: normalizeSkills(step.skills),
  };
}

function sanitizePart(part: any) {
  if (!part || typeof part !== "object") {
    return null;
  }

  return {
    partId: part.partId,
    order: part.order,
    prompt: part.prompt,
    response: part.response,
    options: part.options,

    // Learning Skills
    skills: normalizeSkills(part.skills),

    steps: Array.isArray(part.steps)
      ? part.steps.map(sanitizeStep).filter(Boolean)
      : [],
  };
}

function sanitizeQuestion(
  question: any,
  reference: any,
  qNo: number
) {
  return {
    _id: String(question._id),

    questionId: question.questionId,
    version: question.version ?? 1,

    qNo,

    // Preserve exam-reference information
    setId: reference?.setId ?? null,
    order: reference?.order ?? qNo,
    marks: Number(reference?.marks ?? 0),

    course: question.course,
    subject: question.subject,
    chapter: question.chapter,
    subtopic: question.subtopic,

    type: question.type,
    category: question.category,

    prompt: question.prompt,
    response: question.response,
    options: question.options,

    // Main question-level Learning Skills
    skills: normalizeSkills(question.skills),

    steps: Array.isArray(question.steps)
      ? question.steps.map(sanitizeStep).filter(Boolean)
      : [],

    parts: Array.isArray(question.parts)
      ? question.parts.map(sanitizePart).filter(Boolean)
      : [],

    // Concepts remain separate from Learning Skills.
    learning: {
      conceptIds: normalizeSkills(
        question.learning?.conceptIds
      ),
    },

    // Intentionally excluded:
    // answerKey
    // evaluation
    // solution
    // explanation
    // verification
  };
}

/* =====================================================
   START EXAM
===================================================== */

export async function POST(req: Request) {
  noStore();

  try {
    await connectDB();

    /* ================= AUTH ================= */

    const base = process.env.NEXT_PUBLIC_BASE_URL;

    if (!base) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error",
        },
        { status: 500 }
      );
    }

    const userRes = await fetch(
      `${base}/api/auth/Get-Current-User`,
      {
        method: "GET",
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    );

    if (!userRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
        },
        { status: 401 }
      );
    }

    const userJson = await userRes.json();

    if (
      !userJson?.success ||
      !userJson?.user?.email
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Not logged in",
        },
        { status: 401 }
      );
    }

    const email = String(
      userJson.user.email
    ).trim().toLowerCase();

    /* ================= BODY ================= */

    const body = await req.json();

    const examId = String(
      body.examId || ""
    ).trim();

    if (!examId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing examId",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid examId",
        },
        { status: 400 }
      );
    }

    /* ================= GET EXAM ================= */

    const exam = await TeacherExamPaper.findById(
      examId
    ).lean() as any;

    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam not found",
        },
        { status: 404 }
      );
    }

    /* ================= COURSE ACCESS ================= */

    const userCourses = Array.isArray(userJson.user.courses)
      ? userJson.user.courses.map((course: unknown) =>
          String(course).trim().toLowerCase()
        )
      : typeof userJson.user.courses === "string"
        ? userJson.user.courses
            .split(",")
            .map((course: string) => course.trim().toLowerCase())
        : [];

    const examCourse = String(
      exam.course || ""
    ).trim().toLowerCase();

    if (
      userJson.user.role !== "admin" &&
      !userCourses.includes(examCourse)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not enrolled in this examination's course.",
        },
        { status: 403 }
      );
    }

    /* ================= EXAM SCHEDULE ================= */

    const startTime =
      exam.schedule?.startTime || exam.startTime;

    const endTime =
      exam.schedule?.endTime || exam.endTime;

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();

    const now = Date.now();

    if (
      !Number.isFinite(startMs) ||
      !Number.isFinite(endMs) ||
      endMs <= startMs
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid exam time window",
        },
        { status: 400 }
      );
    }

    if (now < startMs) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam not started yet",
        },
        { status: 400 }
      );
    }

    if (now > endMs) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam window closed",
        },
        { status: 400 }
      );
    }

    if (
      exam.status === "draft" ||
      exam.status === "cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This examination is not available",
        },
        { status: 400 }
      );
    }

    /* ================= DUPLICATE SUBMISSION ================= */

    const alreadySubmitted = await TestRecords.exists({
      email,
      testType: exam.testType,
      course: exam.course,
      createdAt: {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      },
    });

    if (alreadySubmitted) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam already submitted",
        },
        { status: 400 }
      );
    }

    /* ================= QUESTION REFERENCES ================= */

    const questionReferences = Array.isArray(exam.questions)
      ? exam.questions
      : Array.isArray(exam.questionIds)
        ? exam.questionIds
        : [];

    if (!questionReferences.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No questions assigned to this exam",
        },
        { status: 400 }
      );
    }

    const references = questionReferences.map(
      (reference: any) => ({
        reference,
        id: getQuestionId(reference),
      })
    );

    const invalidReferences = references
      .filter(
        (item: any) =>
          !item.id ||
          !mongoose.Types.ObjectId.isValid(item.id)
      );

    if (invalidReferences.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid question reference in examination",
        },
        { status: 400 }
      );
    }

    const rawIds = references.map(
      (item: any) => item.id
    );

    const uniqueIds = Array.from(
      new Set<string>(rawIds)
    );

    const objectIds = uniqueIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    /* ================= FETCH QUESTIONS ================= */

    const questionDocs = await QuestionBankV2.find({
      _id: {
        $in: objectIds,
      },
    }).lean() as any[];

    const questionMap = new Map<string, any>();

    questionDocs.forEach((question) => {
      questionMap.set(
        String(question._id),
        question
      );
    });

    /* ================= VALIDATE QUESTIONS ================= */

    const missingQuestions: string[] = [];
    const unpublishedQuestions: string[] = [];
    const unverifiedQuestions: string[] = [];
    const versionMismatches: string[] = [];

    references.forEach((item: any) => {
      const question = questionMap.get(item.id);
      const reference = item.reference;

      if (!question) {
        missingQuestions.push(item.id);
        return;
      }

      if (question.status !== "published") {
        unpublishedQuestions.push(item.id);
      }

      if (
        question.verification?.status !== "verified"
      ) {
        unverifiedQuestions.push(item.id);
      }

      // Validate version only when the exam reference
      // contains a version.
      if (
        reference &&
        typeof reference === "object" &&
        reference.version != null &&
        Number(reference.version) !== Number(question.version ?? 1)
      ) {
        versionMismatches.push(item.id);
      }

      // Validate stable question identity when supplied.
      if (
        reference &&
        typeof reference === "object" &&
        reference.questionId &&
        String(reference.questionId) !== String(question.questionId)
      ) {
        versionMismatches.push(item.id);
      }
    });

    if (missingQuestions.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Some examination questions no longer exist",
          missingQuestions,
        },
        { status: 400 }
      );
    }

    if (unpublishedQuestions.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Some examination questions are not published",
          invalidQuestions: unpublishedQuestions,
        },
        { status: 400 }
      );
    }

    if (unverifiedQuestions.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Some examination questions are not verified",
          invalidQuestions: unverifiedQuestions,
        },
        { status: 400 }
      );
    }

    if (versionMismatches.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Some examination question versions have changed. Please contact your teacher.",
          invalidQuestions: Array.from(
            new Set(versionMismatches)
          ),
        },
        { status: 409 }
      );
    }

    /* ================= PRESERVE QUESTION ORDER ================= */

    const questions = references.map(
      (item: any, index: number) => {
        const question = questionMap.get(item.id);

        return sanitizeQuestion(
          question,
          item.reference,
          index + 1
        );
      }
    );

    /* ================= DURATION ================= */

    const rawSecondsPerQuestion =
      exam.secondsPerQuestion || {};

    const secondsPerQuestion: SecondsPerQuestion = {
      easy: Number.isFinite(
        Number(rawSecondsPerQuestion.easy)
      )
        ? Number(rawSecondsPerQuestion.easy)
        : DEFAULT_SECONDS_PER_QUESTION.easy,

      moderate: Number.isFinite(
        Number(rawSecondsPerQuestion.moderate)
      )
        ? Number(rawSecondsPerQuestion.moderate)
        : DEFAULT_SECONDS_PER_QUESTION.moderate,

      difficult: Number.isFinite(
        Number(rawSecondsPerQuestion.difficult)
      )
        ? Number(rawSecondsPerQuestion.difficult)
        : DEFAULT_SECONDS_PER_QUESTION.difficult,

      extreme: Number.isFinite(
        Number(rawSecondsPerQuestion.extreme)
      )
        ? Number(rawSecondsPerQuestion.extreme)
        : DEFAULT_SECONDS_PER_QUESTION.extreme,
    };

   const calculatedDurationSec = questions.reduce(
  (sum: number, question: any): number => {
    const difficulty = getDifficulty(
      questionMap.get(String(question._id))
    );

    return sum + secondsPerQuestion[difficulty];
  },
  0
);

    const configuredDurationMinutes = Number(
      exam.schedule?.durationMinutes ??
        exam.durationMinutes ??
        0
    );

    const durationSec =
      Number.isFinite(configuredDurationMinutes) &&
      configuredDurationMinutes > 0
        ? configuredDurationMinutes * 60
        : calculatedDurationSec;

    if (
      !Number.isFinite(durationSec) ||
      durationSec <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid examination duration",
        },
        { status: 400 }
      );
    }

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,

      exam: {
        examId,
        email,

        title: exam.title,
        testType: exam.testType,

        teacherName: exam.teacherName,
        course: exam.course,
        subject: exam.subject,

        chapters: exam.chapters || [],

        startTime,
        endTime,

        durationMinutes: Math.ceil(
          durationSec / 60
        ),

        durationSec,

        totalQuestions: questions.length,
        totalMarks: exam.totalMarks || 0,

        secondsPerQuestion,

        distribution: {
          mode: exam.distribution?.mode || "same",
          shuffleQuestions:
            exam.distribution?.shuffleQuestions ?? false,
          shuffleOptions:
            exam.distribution?.shuffleOptions ?? false,
        },
      },

      questions,
    });

  } catch (err) {
    console.error("START EXAM API ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}