import { NextRequest, NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import ExamRecords from "@/model/ExamRecordSchema";
import QuestionAttempt from "@/model/QuestionAttempt";
import StudentSkillMastery from "@/model/StudentSkillMastery";
import { publishEligibleExamResults } from "@/utils/publishEligibleExamResults";

export const dynamic = "force-dynamic";

type AnyRecord = Record<string, any>;

type Outcome =
  | "correct"
  | "incorrect"
  | "partially_correct"
  | "skipped"
  | "pending";

type SkillEvidence = {
  skillId: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  partiallyCorrect: number;
  pending: number;
  marksAwarded: number;
  totalMarks: number;
};

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function numberValue(value: any): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function average(values: number[]) {
  if (!values.length) return 0;

  return round(
    values.reduce((sum, value) => sum + value, 0) /
      values.length
  );
}

function cleanString(value: any) {
  return typeof value === "string" ? value.trim() : "";
}

function formatSkillName(skillId: string) {
  return skillId
    .split("_")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function getSkillIds(value: any): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter(
          (id: any) =>
            typeof id === "string" &&
            id.trim().length > 0
        )
        .map((id: string) => id.trim())
    )
  );
}

function getOutcome(value: any): Outcome {
  const outcome = cleanString(value);

  if (
    [
      "correct",
      "incorrect",
      "partially_correct",
      "skipped",
      "pending",
    ].includes(outcome)
  ) {
    return outcome as Outcome;
  }

  return "pending";
}

function isPublished(record: AnyRecord, now: Date) {
  return (
    record.resultStatus === "published" &&
    record.evaluationStatus === "completed" &&
    (
      !record.publishAt ||
      new Date(record.publishAt) <= now
    )
  );
}

function createSkillEvidence(
  skillId: string
): SkillEvidence {
  return {
    skillId,
    total: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0,
    partiallyCorrect: 0,
    pending: 0,
    marksAwarded: 0,
    totalMarks: 0,
  };
}

function applyOutcome(
  evidence: SkillEvidence,
  outcome: Outcome
) {
  switch (outcome) {
    case "correct":
      evidence.correct++;
      break;

    case "incorrect":
      evidence.incorrect++;
      break;

    case "skipped":
      evidence.skipped++;
      break;

    case "partially_correct":
      evidence.partiallyCorrect++;
      break;

    default:
      evidence.pending++;
      break;
  }
}

function findResult(
  results: any[],
  id: string,
  keys: string[]
) {
  return results.find((result) =>
    keys.some(
      (key) =>
        result?.[key] !== undefined &&
        String(result[key]) === id
    )
  );
}

function getResultOutcome(
  result: any,
  fallback: Outcome
): Outcome {
  if (!result) return fallback;

  const directOutcome = getOutcome(result.outcome);

  if (directOutcome !== "pending") {
    return directOutcome;
  }

  if (result.isCorrect === true) {
    return "correct";
  }

  if (result.isCorrect === false) {
    return "incorrect";
  }

  return fallback;
}

/* =========================================================
   SKILL ANALYSIS

   Exam-specific evidence:
   - Step-level mappings
   - Part-level mappings
   - Question-level fallback

   Cumulative mastery:
   - Read from StudentSkillMastery
========================================================= */

function buildSkillAnalysis(
  attempts: AnyRecord[],
  masteryRecords: AnyRecord[]
) {
  const skillMap = new Map<string, SkillEvidence>();

  const masteryMap = new Map<string, AnyRecord>();

  for (const mastery of masteryRecords) {
    const skillId = cleanString(mastery.skillId);

    if (skillId) {
      masteryMap.set(skillId, mastery);
    }
  }

  function addEvidence(
    skillId: string,
    outcome: Outcome,
    marksAwarded: number,
    totalMarks: number
  ) {
    if (!skillId) return;

    if (!skillMap.has(skillId)) {
      skillMap.set(
        skillId,
        createSkillEvidence(skillId)
      );
    }

    const item = skillMap.get(skillId)!;

    item.total++;

    applyOutcome(item, outcome);

    item.marksAwarded += marksAwarded;
    item.totalMarks += totalMarks;
  }

  for (const attempt of attempts) {
    const performance = attempt.performance || {};

    const questionOutcome = getOutcome(
      performance.outcome
    );

    const questionMarksAwarded = numberValue(
      performance.marksAwarded
    );

    const questionTotalMarks = numberValue(
      performance.totalMarks
    );

    const stepMappings = Array.isArray(
      attempt.stepSkillMappings
    )
      ? attempt.stepSkillMappings
      : [];

    const partMappings = Array.isArray(
      attempt.partSkillMappings
    )
      ? attempt.partSkillMappings
      : [];

    const stepResults = Array.isArray(
      attempt.evaluation?.stepResults
    )
      ? attempt.evaluation.stepResults
      : [];

    const partResults = Array.isArray(
      attempt.evaluation?.partResults
    )
      ? attempt.evaluation.partResults
      : [];

    const perQuestion = new Map<
      string,
      {
        marks: number;
        awarded: number;
        outcomes: Outcome[];
      }
    >();

const collect = (
  skillIds: string[],
  outcome: Outcome,
  marks: number,
  awarded: number
) => {
  for (const skillId of skillIds) {
    if (!perQuestion.has(skillId)) {
      perQuestion.set(skillId, {
        marks: 0,
        awarded: 0,
        outcomes: [],
      });
    }

    const current = perQuestion.get(skillId)!;

    current.marks += marks;
    current.awarded += awarded;
    current.outcomes.push(outcome);
  }
};

    // -----------------------------------------------------
    // STEP-LEVEL EVIDENCE
    // -----------------------------------------------------

    for (const mapping of stepMappings) {
      const stepId = cleanString(mapping.stepId);

      if (!stepId) continue;

      const skills = getSkillIds(mapping.skillIds);

      if (!skills.length) continue;

      const result = findResult(
        stepResults,
        stepId,
        ["stepId", "id"]
      );

      const marks = numberValue(
        result?.totalMarks ??
          result?.marks ??
          result?.maxMarks
      );

      const awarded = numberValue(
        result?.marksAwarded ??
          result?.awardedMarks
      );

      const outcome = getResultOutcome(
        result,
        questionOutcome
      );

      collect(skills, outcome, marks, awarded);
    }

    // -----------------------------------------------------
    // PART-LEVEL EVIDENCE
    // -----------------------------------------------------

    for (const mapping of partMappings) {
      const partId = cleanString(mapping.partId);

      if (!partId) continue;

      const nestedSteps = Array.isArray(mapping.steps)
        ? mapping.steps
        : [];

      /*
       * If the part has nested step mappings, those steps
       * provide the more specific evidence.
       *
       * Avoid counting parent part skills again.
       */
      if (nestedSteps.length > 0) {
        continue;
      }

      const skills = getSkillIds(mapping.skillIds);

      if (!skills.length) continue;

      const result = findResult(
        partResults,
        partId,
        ["partId", "id"]
      );

      const marks = numberValue(
        result?.totalMarks ??
          result?.marks ??
          result?.maxMarks
      );

      const awarded = numberValue(
        result?.marksAwarded ??
          result?.awardedMarks
      );

      const outcome = getResultOutcome(
        result,
        questionOutcome
      );

      collect(skills, outcome, marks, awarded);
    }

    // -----------------------------------------------------
    // QUESTION-LEVEL FALLBACK
    // -----------------------------------------------------

    if (perQuestion.size === 0) {
      const questionSkills = getSkillIds(
        attempt.skillIds
      );

      for (const skillId of questionSkills) {
        collect(
          [skillId],
          questionOutcome,
          questionTotalMarks,
          questionMarksAwarded
        );
      }
    }

    // -----------------------------------------------------
    // FINALIZE EACH SKILL FOR THIS QUESTION
    // -----------------------------------------------------

    for (const [skillId, evidence] of Array.from(
      perQuestion.entries()
    )) {
      const outcomes = evidence.outcomes;

      let finalOutcome: Outcome;

      if (outcomes.includes("pending")) {
        finalOutcome = "pending";
      } else if (outcomes.includes("incorrect")) {
        finalOutcome = "incorrect";
      } else if (
        outcomes.includes("partially_correct")
      ) {
        finalOutcome = "partially_correct";
      } else if (outcomes.includes("skipped")) {
        finalOutcome = "skipped";
      } else {
        finalOutcome = "correct";
      }

      addEvidence(
        skillId,
        finalOutcome,
        evidence.marks > 0
          ? evidence.awarded
          : questionMarksAwarded,
        evidence.marks > 0
          ? evidence.marks
          : questionTotalMarks
      );
    }
  }

  // -------------------------------------------------------
  // FINAL SKILL RESPONSE
  // -------------------------------------------------------

  return Array.from(skillMap.values())
    .map((item) => {
      const evaluated =
        item.correct + item.incorrect;

      const mastery = masteryMap.get(item.skillId);

      return {
        skillId: item.skillId,

        name: formatSkillName(item.skillId),

        attempts: item.total,

        correct: item.correct,

        incorrect: item.incorrect,

        skipped: item.skipped,

        partiallyCorrect: item.partiallyCorrect,

        pending: item.pending,

        accuracy: evaluated
          ? round(
              (item.correct / evaluated) * 100
            )
          : null,

        marksAwarded: round(item.marksAwarded),

        totalMarks: round(item.totalMarks),

        // Cumulative mastery from StudentSkillMastery.
        masteryScore: mastery
          ? round(
              numberValue(mastery.masteryScore) * 100
            )
          : null,

        masteryStatus:
          mastery?.status || "not_started",

        lastPracticedAt:
          mastery?.lastPracticedAt || null,
      };
    })
    .sort((a, b) => {
      if (a.accuracy === null) return 1;

      if (b.accuracy === null) return -1;

      return a.accuracy - b.accuracy;
    });
}

/* =========================================================
   CHAPTER ANALYSIS
========================================================= */

function buildChapterAnalysis(
  attempts: AnyRecord[]
) {
  const chapterMap = new Map<
    string,
    {
      chapter: string;
      total: number;
      correct: number;
      incorrect: number;
      skipped: number;
      partiallyCorrect: number;
      pending: number;
      marksAwarded: number;
      totalMarks: number;
    }
  >();

  for (const attempt of attempts) {
    const chapter =
      cleanString(attempt.chapter) || "Other";

    const performance = attempt.performance || {};

    const outcome = getOutcome(performance.outcome);

    let item = chapterMap.get(chapter);

    if (!item) {
      item = {
        chapter,
        total: 0,
        correct: 0,
        incorrect: 0,
        skipped: 0,
        partiallyCorrect: 0,
        pending: 0,
        marksAwarded: 0,
        totalMarks: 0,
      };

      chapterMap.set(chapter, item);
    }

    item.total++;

    switch (outcome) {
      case "correct":
        item.correct++;
        break;

      case "incorrect":
        item.incorrect++;
        break;

      case "skipped":
        item.skipped++;
        break;

      case "partially_correct":
        item.partiallyCorrect++;
        break;

      default:
        item.pending++;
        break;
    }

    item.marksAwarded += numberValue(
      performance.marksAwarded
    );

    item.totalMarks += numberValue(
      performance.totalMarks
    );
  }

  return Array.from(chapterMap.values())
    .map((item) => {
      const evaluated =
        item.correct + item.incorrect;

      return {
        ...item,

        accuracy: evaluated
          ? round(
              (item.correct / evaluated) * 100
            )
          : null,

        marksAwarded: round(item.marksAwarded),

        totalMarks: round(item.totalMarks),
      };
    })
    .sort((a, b) => {
      if (a.accuracy === null) return 1;

      if (b.accuracy === null) return -1;

      return a.accuracy - b.accuracy;
    });
}

/* =========================================================
   MAIN GET API
========================================================= */

export async function GET(request: NextRequest) {
  noStore();

  try {
    await connectDB();

    // =====================================================
    // 1. AUTHENTICATION
    // =====================================================

    const authResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/Get-Current-User`,
      {
        method: "GET",
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    );

    if (!authResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed.",
        },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();

    const user = authData?.user || authData;

    const studentEmail = cleanString(
      user?.email
    ).toLowerCase();

    if (!studentEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Student account not found.",
        },
        { status: 401 }
      );
    }

    const rawStudentId =
      user._id || user.id || user.userId;

    if (
      !rawStudentId ||
      !mongoose.Types.ObjectId.isValid(
        String(rawStudentId)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid student account.",
        },
        { status: 401 }
      );
    }

    const studentId = new mongoose.Types.ObjectId(
      String(rawStudentId)
    );


    await publishEligibleExamResults(studentEmail);

    // =====================================================
    // 2. FETCH STUDENT EXAM RECORDS
    // =====================================================

    const records: AnyRecord[] =
      await ExamRecords.find({
        "student.email": studentEmail,
        submissionStatus: "submitted",
      })
        .sort({ submittedAt: -1 })
        .lean();

    const now = new Date();

    const publishedRecords = records.filter(
      (record) => isPublished(record, now)
    );

    // =====================================================
    // 3. FETCH CUMULATIVE SKILL MASTERY
    // =====================================================

    const masteryRecords: AnyRecord[] =
      await StudentSkillMastery.find({
        studentId,
      })
        .select(
          "skillId masteryScore status evidence recentEvidence performance trends lastPracticedAt nextReviewAt course subject"
        )
        .lean();

    const masteryAnalysis = masteryRecords
      .map((item) => ({
        skillId: cleanString(item.skillId),

        name: formatSkillName(
          cleanString(item.skillId)
        ),

        masteryScore: round(
          numberValue(item.masteryScore) * 100
        ),

        masteryStatus:
          item.status || "not_started",

        evidence: item.evidence || {},

        recentEvidence: item.recentEvidence || {},

        performance: item.performance || {},

        trends: item.trends || {},

        lastPracticedAt:
          item.lastPracticedAt || null,

        nextReviewAt:
          item.nextReviewAt || null,

        course: item.course || null,

        subject: item.subject || null,
      }))
      .sort(
        (a, b) =>
          a.masteryScore - b.masteryScore
      );

    // =====================================================
    // 4. NO EXAM RECORDS
    // =====================================================

    if (!records.length) {
      return NextResponse.json({
        success: true,

        student: {
          name:
            cleanString(user.name) ||
            cleanString(user.username) ||
            "Student",
        },

        summary: {
          totalExams: 0,
          publishedExams: 0,
          pendingExams: 0,
          averagePercentage: 0,
          bestPercentage: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
        },

        results: [],

        skillAnalysis: [],

        masteryAnalysis,

        chapterAnalysis: [],

        growth: [],
      });
    }

    // =====================================================
    // 5. FETCH QUESTION ATTEMPTS
    // =====================================================

    const recordIds = records.map(
      (record) => record._id
    );

    const attempts: AnyRecord[] =
      await QuestionAttempt.find({
        studentId,
        examRecordId: { $in: recordIds },
        source: "exam",
      }).lean();

    const attemptsByRecord = new Map<
      string,
      AnyRecord[]
    >();

    for (const attempt of attempts) {
      const recordId = String(
        attempt.examRecordId
      );

      const existing =
        attemptsByRecord.get(recordId) || [];

      existing.push(attempt);

      attemptsByRecord.set(recordId, existing);
    }

    // =====================================================
    // 6. PREPARE RESULT LIST
    // =====================================================

    const results = records.map((record) => {
      const recordId = String(record._id);

      const published = isPublished(
        record,
        now
      );

      const recordAttempts =
        attemptsByRecord.get(recordId) || [];

      const totalMarks = numberValue(
        record.totalMarks
      );

      const obtainedMarks = numberValue(
        record.obtainedMarks
      );

      return {
        recordId,

        examId: String(record.examId),

        title:
          cleanString(record.exam?.title) ||
          "Examination",

        testType: cleanString(
          record.exam?.testType
        ),

        course: cleanString(
          record.exam?.course
        ),

        subject: cleanString(
          record.exam?.subject
        ),

        chapters: Array.isArray(
          record.exam?.chapters
        )
          ? record.exam.chapters
          : [],

        teacherName: cleanString(
          record.exam?.teacherName
        ),

        submittedAt: record.submittedAt || null,

        publishedAt: record.publishedAt || null,

        publishAt: record.publishAt || null,

        resultStatus: record.resultStatus,

        evaluationStatus:
          record.evaluationStatus,

        published,

        totalQuestions: numberValue(
          record.totalQuestions
        ),

        answeredCount: numberValue(
          record.answeredCount
        ),

        unansweredCount: numberValue(
          record.unansweredCount
        ),

        correctCount: numberValue(
          record.correctCount
        ),

        incorrectCount: numberValue(
          record.incorrectCount
        ),

        totalMarks,

        obtainedMarks,

        percentage: published
          ? numberValue(record.percentage)
          : null,

        allowedSeconds: numberValue(
          record.allowedSeconds
        ),

        timeSpentSeconds: numberValue(
          record.timeSpentSeconds
        ),

        questionAttemptCount:
          recordAttempts.length,
      };
    });

    // =====================================================
    // 7. ONLY PUBLISHED RESULTS FOR EXAM ANALYTICS
    // =====================================================

    const publishedIds = new Set(
      publishedRecords.map(
        (record) => String(record._id)
      )
    );

    const publishedAttempts = attempts.filter(
      (attempt) =>
        publishedIds.has(
          String(attempt.examRecordId)
        )
    );

    // =====================================================
    // 8. SUMMARY
    // =====================================================

    const percentages = publishedRecords.map(
      (record) =>
        numberValue(record.percentage)
    );

    const averagePercentage =
      average(percentages);

    const bestPercentage = percentages.length
      ? Math.max(...percentages)
      : 0;

    const totalCorrect =
      publishedRecords.reduce(
        (sum, record) =>
          sum + numberValue(record.correctCount),
        0
      );

    const totalIncorrect =
      publishedRecords.reduce(
        (sum, record) =>
          sum + numberValue(record.incorrectCount),
        0
      );

    // =====================================================
    // 9. SKILL AND CHAPTER ANALYSIS
    // =====================================================

    const skillAnalysis = buildSkillAnalysis(
      publishedAttempts,
      masteryRecords
    );

    const chapterAnalysis =
      buildChapterAnalysis(publishedAttempts);

    // =====================================================
    // 10. GROWTH ANALYSIS
    // =====================================================

    const growth = [...publishedRecords]
      .sort(
        (a, b) =>
          new Date(
            a.submittedAt || 0
          ).getTime() -
          new Date(
            b.submittedAt || 0
          ).getTime()
      )
      .map((record, index) => ({
        examNumber: index + 1,

        title:
          cleanString(record.exam?.title) ||
          `Exam ${index + 1}`,

        date: record.submittedAt || null,

        percentage: numberValue(
          record.percentage
        ),
      }));

    // =====================================================
    // 11. FINAL RESPONSE
    // =====================================================

    return NextResponse.json({
      success: true,

      student: {
        name:
          cleanString(user.name) ||
          cleanString(user.username) ||
          "Student",
      },

      summary: {
        totalExams: records.length,

        publishedExams:
          publishedRecords.length,

        pendingExams:
          records.length -
          publishedRecords.length,

        averagePercentage,

        bestPercentage,

        totalCorrect,

        totalIncorrect,
      },

      results,

      // Exam-specific skill evidence + cumulative mastery.
      skillAnalysis,

      // Full cumulative StudentSkillMastery information.
      masteryAnalysis,

      chapterAnalysis,

      growth,
    });
  } catch (error: any) {
    console.error(
      "EXAM RESULT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load exam results.",

        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}