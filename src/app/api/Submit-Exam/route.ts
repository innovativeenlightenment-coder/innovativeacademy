import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";

import TeacherExamPaper from "@/model/TeacherExamSchema";
import QuestionBankV2 from "@/model/QuestionBankV2";
import ExamRecords from "@/model/ExamRecordSchema";
import QuestionAttempt from "@/model/QuestionAttempt";
import StudentSkillMastery from "@/model/StudentSkillMastery";
import SkillMasteryEvent from "@/model/SkillMasteryEvent";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type SubmittedResponse = {
  questionDocumentId: string;
  questionId: string;
  version: number;
  setId?: string | null;
  response: any;
};

type SubmitPayload = {
  examId: string;
  examResponses: SubmittedResponse[];
  duration?: number;
  timeLeft?: number;
  automatic?: boolean;
};

type SkillOutcome =
  | "correct"
  | "incorrect"
  | "partial"
  | "skipped";

type EvaluationResult = {
  status: "auto_evaluated";
  outcome: SkillOutcome;
  isCorrect: boolean | null;
  marksAwarded: number;
  feedback: string;
  breakdown: any[];
};

type SkillEvidence = {
  skillId: string;
  outcome: SkillOutcome;
  marksAwarded: number;
  totalMarks: number;
};

type ItemEvaluationResult = {
  id: string;
  kind: "question" | "part" | "step";
  status: "unanswered" | "evaluated";
  isCorrect: boolean;
  marksAwarded: number;
  totalMarks: number;
  feedback: string;
  skillEvidence: SkillEvidence[];
};

/* =========================================================
   GENERAL HELPERS
========================================================= */

function round(value: number, decimals = 4): number {
  const factor = Math.pow(10, decimals);

  return (
    Math.round((value + Number.EPSILON) * factor) / factor
  );
}

function normalizeAnswer(value: any): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function stableStringify(value: any): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();

    return `{${keys
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify(value[key])}`
      )
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function isEmptyAnswer(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return (
      value.length === 0 ||
      value.every(isEmptyAnswer)
    );
  }

  if (typeof value === "object") {
    return Object.values(value).every(isEmptyAnswer);
  }

  return false;
}

function getTextFromContent(content: any): string[] {
  if (!Array.isArray(content)) return [];

  return content
    .filter(
      (item) =>
        item &&
        (item.type === "text" || item.type === "math")
    )
    .map((item) => String(item.value ?? "").trim())
    .filter(Boolean);
}

function getAcceptedAnswers(answerKey: any): string[] {
  if (!answerKey) return [];

  const accepted = Array.isArray(answerKey.acceptedAnswers)
    ? answerKey.acceptedAnswers
    : [];

  const contentAnswers = getTextFromContent(
    answerKey.content
  );

  return Array.from(
    new Set(
      [...accepted, ...contentAnswers]
        .map(normalizeAnswer)
        .filter(Boolean)
    )
  );
}

function getRules(evaluation: any): any {
  return evaluation?.rules &&
    typeof evaluation.rules === "object"
    ? evaluation.rules
    : {};
}

function getNumericValue(value: any): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value !== "string") return null;

  const normalized = value.trim().replace(/,/g, "");

  if (!normalized) return null;

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

/* =========================================================
   RESPONSE NORMALIZATION
========================================================= */

function normalizeStudentResponse(response: any) {
  return {
    selectedOptions: [],
    selectedExpression: null,
    answers: response ?? {},
    textAnswer: "",
    submittedSteps: [],
    submittedParts: [],
  };
}

/* =========================================================
   EVALUATION HELPERS
========================================================= */

function compareStructured(
  studentAnswer: any,
  answerKey: any,
  rules: any
): boolean {
  if (
    studentAnswer === null ||
    studentAnswer === undefined ||
    answerKey === null ||
    answerKey === undefined
  ) {
    return false;
  }

  if (rules?.caseSensitive === false) {
    return (
      normalizeAnswer(studentAnswer) ===
      normalizeAnswer(answerKey)
    );
  }

  return (
    stableStringify(studentAnswer) ===
    stableStringify(answerKey)
  );
}

/* =========================================================
   SINGLE ANSWER EVALUATION
========================================================= */

function evaluateAnswer(
  studentAnswer: any,
  answerKey: any,
  evaluation: any
): {
  correct: boolean;
  supported: boolean;
  feedback: string;
} {
  const method = evaluation?.method || "exact";
  const rules = getRules(evaluation);

  if (isEmptyAnswer(studentAnswer)) {
    return {
      correct: false,
      supported: true,
      feedback: "Not answered.",
    };
  }

  if (method === "exact") {
    if (
      answerKey === null ||
      answerKey === undefined
    ) {
      throw new Error(
        "Missing answer key for exact evaluation."
      );
    }

    return {
      supported: true,
      correct:
        stableStringify(studentAnswer) ===
        stableStringify(answerKey),
      feedback: "",
    };
  }

  if (method === "accepted_answers") {
    const accepted = getAcceptedAnswers(answerKey);

    if (accepted.length === 0) {
      throw new Error(
        "No accepted answers configured for accepted_answers evaluation."
      );
    }

    return {
      supported: true,
      correct: accepted.includes(
        normalizeAnswer(studentAnswer)
      ),
      feedback: "",
    };
  }

  if (method === "numeric_tolerance") {
    const expected = getNumericValue(
      typeof answerKey === "object" &&
        answerKey !== null
        ? answerKey.value
        : answerKey
    );

    const actual = getNumericValue(studentAnswer);

    if (expected === null || actual === null) {
      throw new Error(
        "numeric_tolerance requires numeric student and expected answers."
      );
    }

    const absoluteTolerance = Math.max(
      0,
      Number(
        rules.absoluteTolerance ??
          rules.tolerance ??
          0
      )
    );

    const relativeTolerance = Math.max(
      0,
      Number(rules.relativeTolerance ?? 0)
    );

    const allowedDifference = Math.max(
      absoluteTolerance,
      Math.abs(expected) * relativeTolerance
    );

    return {
      supported: true,
      correct:
        Math.abs(actual - expected) <=
        allowedDifference,
      feedback: "",
    };
  }

  if (method === "normalized_text") {
    const accepted = getAcceptedAnswers(answerKey);

    if (accepted.length === 0) {
      throw new Error(
        "No accepted answers configured for normalized_text evaluation."
      );
    }

    return {
      supported: true,
      correct: accepted.includes(
        normalizeAnswer(studentAnswer)
      ),
      feedback: "",
    };
  }

  if (method === "structured") {
    if (
      answerKey === null ||
      answerKey === undefined
    ) {
      throw new Error(
        "Missing answer key for structured evaluation."
      );
    }

    return {
      supported: true,
      correct: compareStructured(
        studentAnswer,
        answerKey,
        rules
      ),
      feedback: "",
    };
  }

  throw new Error(
    `Unsupported automatic evaluation method: ${method}`
  );
}

/* =========================================================
   MARK ALLOCATION
========================================================= */

function getItemMarks(
  items: any[],
  totalMarks: number
): number[] {
  if (!items.length) return [];

  const configured = items.map((item) =>
    Number(item.marks)
  );

  const allConfigured = configured.every(
    (value) =>
      Number.isFinite(value) && value >= 0
  );

  if (
    allConfigured &&
    configured.some((value) => value > 0)
  ) {
    const configuredTotal = configured.reduce(
      (sum, value) => sum + value,
      0
    );

    return configured.map((value) =>
      round(
        (value / configuredTotal) * totalMarks
      )
    );
  }

  const equalMarks = totalMarks / items.length;

  return items.map(() => equalMarks);
}

/* =========================================================
   SKILL HELPERS
========================================================= */

function cleanSkillIds(skills: any): string[] {
  if (!Array.isArray(skills)) return [];

  const validSkills = skills.filter(
    (skill: any): skill is string =>
      typeof skill === "string" &&
      skill.trim().length > 0
  );

  // Array.from avoids downlevelIteration requirements.
  return Array.from(new Set<string>(validSkills));
}

function createSkillEvidence(
  skills: any[],
  outcome: SkillOutcome,
  marksAwarded: number,
  totalMarks: number
): SkillEvidence[] {
  return cleanSkillIds(skills).map((skillId) => ({
    skillId,
    outcome,
    marksAwarded,
    totalMarks,
  }));
}

/* =========================================================
   EVALUATE ONE ITEM
========================================================= */

function evaluateItem(
  studentAnswer: any,
  answerKey: any,
  evaluation: any,
  skills: any[],
  marks: number,
  id: string,
  kind: "question" | "part" | "step"
): ItemEvaluationResult {
  if (isEmptyAnswer(studentAnswer)) {
    return {
      id,
      kind,
      status: "unanswered",
      isCorrect: false,
      marksAwarded: 0,
      totalMarks: marks,
      feedback: "Not answered.",
      skillEvidence: createSkillEvidence(
        skills,
        "skipped",
        0,
        marks
      ),
    };
  }

  const result = evaluateAnswer(
    studentAnswer,
    answerKey,
    evaluation
  );

  const awarded = result.correct ? marks : 0;

  return {
    id,
    kind,
    status: "evaluated",
    isCorrect: result.correct,
    marksAwarded: awarded,
    totalMarks: marks,
    feedback: result.correct
      ? "Correct answer."
      : "Incorrect answer.",
    skillEvidence: createSkillEvidence(
      skills,
      result.correct ? "correct" : "incorrect",
      awarded,
      marks
    ),
  };
}

/* =========================================================
   STEPWISE EVALUATION
========================================================= */

function evaluateSteps(
  studentResponse: any,
  steps: any[],
  totalMarks: number
): {
  marksAwarded: number;
  isCorrect: boolean;
  outcome: SkillOutcome;
  feedback: string;
  breakdown: any[];
  skillEvidence: SkillEvidence[];
} {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error(
      "Stepwise question has no evaluation steps."
    );
  }

  const orderedSteps = [...steps].sort(
    (a, b) =>
      Number(a.order || 0) -
      Number(b.order || 0)
  );

  const allocations = getItemMarks(
    orderedSteps,
    totalMarks
  );

  const breakdown: any[] = [];
  const skillEvidence: SkillEvidence[] = [];

  let marksAwarded = 0;

  orderedSteps.forEach((step, index) => {
    const studentAnswer =
      studentResponse?.steps?.[step.stepId] ??
      studentResponse?.[step.stepId] ??
      null;

    const result = evaluateItem(
      studentAnswer,
      step.answerKey,
      step.evaluation || { method: "exact" },
      step.skills,
      allocations[index],
      String(step.stepId),
      "step"
    );

    breakdown.push(result);

    marksAwarded += result.marksAwarded;

    skillEvidence.push(...result.skillEvidence);
  });

  const allCorrect = breakdown.every(
    (item) => item.isCorrect === true
  );

  const anyCorrect = breakdown.some(
    (item) => item.isCorrect === true
  );

  const outcome: SkillOutcome = allCorrect
    ? "correct"
    : anyCorrect || marksAwarded > 0
      ? "partial"
      : "incorrect";

  return {
    marksAwarded: round(marksAwarded),
    isCorrect: allCorrect,
    outcome,
    feedback: allCorrect
      ? "All steps are correct."
      : "Stepwise evaluation completed.",
    breakdown,
    skillEvidence,
  };
}

/* =========================================================
   PART EVALUATION
========================================================= */

function evaluateParts(
  studentResponse: any,
  parts: any[],
  totalMarks: number
): {
  marksAwarded: number;
  isCorrect: boolean;
  outcome: SkillOutcome;
  feedback: string;
  breakdown: any[];
  skillEvidence: SkillEvidence[];
} {
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error(
      "Multi-part question has no parts."
    );
  }

  const orderedParts = [...parts].sort(
    (a, b) =>
      Number(a.order || 0) -
      Number(b.order || 0)
  );

  const allocations = getItemMarks(
    orderedParts,
    totalMarks
  );

  const breakdown: any[] = [];
  const skillEvidence: SkillEvidence[] = [];

  let marksAwarded = 0;

  orderedParts.forEach((part, index) => {
    const partMarks = allocations[index];

    const partResponse =
      studentResponse?.parts?.[part.partId] ??
      studentResponse?.[part.partId] ??
      {};

    let partResult: any;

    if (
      Array.isArray(part.steps) &&
      part.steps.length > 0
    ) {
      partResult = evaluateSteps(
        partResponse,
        part.steps,
        partMarks
      );

      // Part-level skills and step-level skills are
      // recorded separately.
      if (
        Array.isArray(part.skills) &&
        part.skills.length > 0
      ) {
        skillEvidence.push(
          ...createSkillEvidence(
            part.skills,
            partResult.outcome,
            partResult.marksAwarded,
            partMarks
          )
        );
      }

      skillEvidence.push(
        ...partResult.skillEvidence
      );
    } else {
      const answer =
        partResponse?.answer ??
        partResponse?.value ??
        partResponse;

      partResult = evaluateItem(
        answer,
        part.answerKey,
        part.evaluation || { method: "exact" },
        part.skills,
        partMarks,
        String(part.partId),
        "part"
      );

      skillEvidence.push(
        ...partResult.skillEvidence
      );
    }

    marksAwarded += partResult.marksAwarded;

    breakdown.push({
      id: String(part.partId),
      kind: "part",
      isCorrect: partResult.isCorrect,
      marksAwarded: partResult.marksAwarded,
      totalMarks: partMarks,
      breakdown: partResult.breakdown || [],
    });
  });

  const allCorrect = breakdown.every(
    (item) => item.isCorrect === true
  );

  const anyCorrect = breakdown.some(
    (item) => item.marksAwarded > 0
  );

  const outcome: SkillOutcome = allCorrect
    ? "correct"
    : anyCorrect
      ? "partial"
      : "incorrect";

  return {
    marksAwarded: round(marksAwarded),
    isCorrect: allCorrect,
    outcome,
    feedback: "Multi-part evaluation completed.",
    breakdown,
    skillEvidence,
  };
}

/* =========================================================
   QUESTION EVALUATION
========================================================= */

function evaluateQuestion(
  question: any,
  studentResponse: any,
  marks: number
): EvaluationResult & {
  skillEvidence: SkillEvidence[];
} {
  if (isEmptyAnswer(studentResponse)) {
    return {
      status: "auto_evaluated",
      outcome: "skipped",
      isCorrect: null,
      marksAwarded: 0,
      feedback: "Not answered.",
      breakdown: [],
      skillEvidence: createSkillEvidence(
        question.skills,
        "skipped",
        0,
        marks
      ),
    };
  }

  const method = question.evaluation?.method || "exact";

  if (method === "stepwise") {
    const result = evaluateSteps(
      studentResponse,
      question.steps,
      marks
    );

    return {
      status: "auto_evaluated",
      outcome: result.outcome,
      isCorrect: result.isCorrect,
      marksAwarded: result.marksAwarded,
      feedback: result.feedback,
      breakdown: result.breakdown,
      skillEvidence: result.skillEvidence,
    };
  }

  if (
    Array.isArray(question.parts) &&
    question.parts.length > 0
  ) {
    const result = evaluateParts(
      studentResponse,
      question.parts,
      marks
    );

    return {
      status: "auto_evaluated",
      outcome: result.outcome,
      isCorrect: result.isCorrect,
      marksAwarded: result.marksAwarded,
      feedback: result.feedback,
      breakdown: result.breakdown,
      skillEvidence: result.skillEvidence,
    };
  }

  const result = evaluateItem(
    studentResponse,
    question.answerKey,
    question.evaluation,
    question.skills,
    marks,
    String(question.questionId),
    "question"
  );

  const outcome: SkillOutcome = result.isCorrect
    ? "correct"
    : "incorrect";

  return {
    status: "auto_evaluated",
    outcome,
    isCorrect: result.isCorrect,
    marksAwarded: result.marksAwarded,
    feedback: result.feedback,
    breakdown: [],
    skillEvidence: result.skillEvidence,
  };
}

/* =========================================================
   MASTERY SCORE CALCULATION
========================================================= */

function calculateMasteryStatus(
  score: number,
  attempts: number
):
  | "not_started"
  | "needs_foundation"
  | "developing"
  | "practicing"
  | "proficient"
  | "mastered" {
  if (attempts === 0) return "not_started";

  if (attempts < 3 && score < 0.5) {
    return "needs_foundation";
  }

  if (score < 0.4) return "needs_foundation";
  if (score < 0.6) return "developing";
  if (score < 0.8) return "practicing";
  if (score < 0.95) return "proficient";

  return "mastered";
}

/* =========================================================
   REBUILD SKILL MASTERY FROM EVENT LEDGER
========================================================= */

async function rebuildSkillMastery(
  studentId: mongoose.Types.ObjectId,
  skillId: string,
  course: string,
  subject: string
) {
  const events: any[] = await SkillMasteryEvent.find({
    studentId,
    skillId,
    course,
    subject,
  })
    .sort({ createdAt: 1 })
    .lean()
    .exec();

  if (!events.length) return;

  let totalAttempts = 0;
  let correctAttempts = 0;
  let partiallyCorrect = 0;
  let incorrectAttempts = 0;
  let skippedAttempts = 0;

  let independentAttempts = 0;
  let independentCorrect = 0;

  let totalMarksAwarded = 0;
  let totalAvailableMarks = 0;

  let totalHintsUsed = 0;

  const sourceCounts: Record<string, number> = {
    exam: 0,
    classroom: 0,
    chapter_journey: 0,
    daily_revision: 0,
    homework: 0,
    diagnostic: 0,
    targeted_practice: 0,
    mastery_check: 0,
  };

  let consecutiveCorrect = 0;
  let consecutiveIncorrect = 0;

  for (const event of events) {
    totalAttempts++;

    if (event.outcome === "correct") {
      correctAttempts++;
    } else if (event.outcome === "partial") {
      partiallyCorrect++;
    } else if (event.outcome === "incorrect") {
      incorrectAttempts++;
    } else if (event.outcome === "skipped") {
      skippedAttempts++;
    }

    if (event.independent !== false) {
      independentAttempts++;

      if (event.outcome === "correct") {
        independentCorrect++;
      }
    }

    totalMarksAwarded += Number(
      event.marksAwarded || 0
    );

    totalAvailableMarks += Number(
      event.totalMarks || 0
    );

    totalHintsUsed += Number(
      event.hintsUsed || 0
    );

    if (
      Object.prototype.hasOwnProperty.call(
        sourceCounts,
        event.source
      )
    ) {
      sourceCounts[event.source]++;
    }

    if (event.outcome === "correct") {
      consecutiveCorrect++;
      consecutiveIncorrect = 0;
    } else if (
      event.outcome === "incorrect" ||
      event.outcome === "partial"
    ) {
      consecutiveIncorrect++;
      consecutiveCorrect = 0;
    } else {
      consecutiveCorrect = 0;
      consecutiveIncorrect = 0;
    }
  }

  const recentEvents = events.slice(-10);

  const recentCorrect = recentEvents.filter(
    (event: any) => event.outcome === "correct"
  ).length;

  const recentMarksAwarded = recentEvents.reduce(
    (sum: number, event: any) =>
      sum + Number(event.marksAwarded || 0),
    0
  );

  const recentAvailableMarks = recentEvents.reduce(
    (sum: number, event: any) =>
      sum + Number(event.totalMarks || 0),
    0
  );

  const marksPercentage =
    totalAvailableMarks > 0
      ? totalMarksAwarded / totalAvailableMarks
      : 0;

  const independentAccuracy =
    independentAttempts > 0
      ? independentCorrect / independentAttempts
      : 0;

  const masteryScore = round(
    marksPercentage * 0.7 +
      independentAccuracy * 0.3,
    4
  );

  const status = calculateMasteryStatus(
    masteryScore,
    totalAttempts
  );

  const averageMarksPercentage = round(
    marksPercentage * 100,
    2
  );

  const hintUsageRate =
    totalAttempts > 0
      ? round(totalHintsUsed / totalAttempts, 2)
      : 0;

  const independentAccuracyPercentage = round(
    independentAccuracy * 100,
    2
  );

  let direction:
    | "improving"
    | "stable"
    | "declining"
    | "unknown" = "unknown";

  if (
    recentEvents.length >= 4 &&
    recentAvailableMarks > 0
  ) {
    const recentPercentage =
      recentMarksAwarded / recentAvailableMarks;

    direction =
      recentPercentage >= 0.75
        ? "improving"
        : recentPercentage < 0.4
          ? "declining"
          : "stable";
  }

  const lastEvent = events[events.length - 1];

  await StudentSkillMastery.findOneAndUpdate(
    {
      studentId,
      course,
      subject,
      skillId,
    },
    {
      $set: {
        masteryScore,
        status,

        evidence: {
          totalAttempts,
          correctAttempts,
          partiallyCorrect,
          incorrectAttempts,
          skippedAttempts,
          independentAttempts,
          independentCorrect,
          totalMarksAwarded: round(totalMarksAwarded),
          totalAvailableMarks: round(totalAvailableMarks),
          totalHintsUsed,
        },

        recentEvidence: {
          recentTotal: recentEvents.length,
          recentCorrect,
          recentMarksAwarded: round(
            recentMarksAwarded
          ),
          recentAvailableMarks: round(
            recentAvailableMarks
          ),
        },

        sourceCounts,

        performance: {
          averageMarksPercentage,
          hintUsageRate,
          independentAccuracy:
            independentAccuracyPercentage,
        },

        trends: {
          direction,
          consecutiveCorrect,
          consecutiveIncorrect,
        },

        lastPracticedAt: lastEvent.createdAt,
        lastEvidenceAt: lastEvent.createdAt,

        lastProcessedAttemptId: lastEvent.attemptId,

        nextReviewAt:
          status === "mastered"
            ? new Date(
                Date.now() +
                  30 * 24 * 60 * 60 * 1000
              )
            : status === "proficient"
              ? new Date(
                  Date.now() +
                    14 * 24 * 60 * 60 * 1000
                )
              : new Date(
                  Date.now() +
                    3 * 24 * 60 * 60 * 1000
                ),
      },

      $setOnInsert: {
        studentId,
        skillId,
        course,
        subject,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}

/* =========================================================
   SAVE MASTERY EVENTS
========================================================= */

async function updateStudentSkillMastery(
  attemptId: mongoose.Types.ObjectId,
  studentId: mongoose.Types.ObjectId,
  record: any,
  question: any,
  skillEvidence: SkillEvidence[]
) {
  if (
    !Array.isArray(skillEvidence) ||
    skillEvidence.length === 0
  ) {
    return;
  }

  const aggregated = new Map<string, SkillEvidence>();

  for (const evidence of skillEvidence) {
    if (!evidence.skillId) continue;

    const existing = aggregated.get(
      evidence.skillId
    );

    if (existing) {
      existing.marksAwarded +=
        evidence.marksAwarded;

      existing.totalMarks += evidence.totalMarks;

      if (
        evidence.outcome === "incorrect" &&
        existing.outcome === "correct"
      ) {
        existing.outcome = "partial";
      } else if (
        evidence.outcome === "partial" &&
        existing.outcome === "correct"
      ) {
        existing.outcome = "partial";
      } else if (
        evidence.outcome === "correct" &&
        existing.outcome === "incorrect"
      ) {
        existing.outcome = "partial";
      }
    } else {
      aggregated.set(evidence.skillId, {
        ...evidence,
      });
    }
  }

  // FIX: Do not spread MapIterator.
  const skillIds = Array.from(aggregated.keys());

  for (const skillId of skillIds) {
    const evidence = aggregated.get(skillId);

    if (!evidence) continue;

    const outcome: SkillOutcome =
      evidence.totalMarks > 0 &&
      evidence.marksAwarded >= evidence.totalMarks
        ? "correct"
        : evidence.marksAwarded > 0
          ? "partial"
          : evidence.outcome === "skipped"
            ? "skipped"
            : "incorrect";

    try {
      await SkillMasteryEvent.updateOne(
        {
          attemptId,
          skillId,
        },
        {
          $setOnInsert: {
            studentId,
            attemptId,
            examRecordId: record._id,
            skillId,
            course: question.course || "",
            subject: question.subject || "",
            source: "exam",
            outcome,
            marksAwarded: round(
              evidence.marksAwarded
            ),
            totalMarks: round(evidence.totalMarks),
            hintsUsed: 0,
            independent: true,
          },
        },
        {
          upsert: true,
        }
      );
    } catch (error: any) {
      if (error?.code !== 11000) {
        throw error;
      }
    }

    await rebuildSkillMastery(
      studentId,
      skillId,
      question.course || "",
      question.subject || ""
    );
  }
}

/* =========================================================
   ALREADY SUBMITTED RESPONSE
========================================================= */

function alreadySubmittedResponse(record: any) {
  return NextResponse.json(
    {
      success: true,
      alreadySubmitted: true,
      message:
        "This exam has already been submitted successfully.",

      recordId: String(record._id),

      resultStatus: record.resultStatus,
      evaluationStatus: record.evaluationStatus,

      totalQuestions: record.totalQuestions,
      answeredCount: record.answeredCount,
      unansweredCount: record.unansweredCount,

      totalMarks: record.totalMarks,
    },
    { status: 200 }
  );
}

/* =========================================================
   CREATE QUESTION ATTEMPTS
========================================================= */

async function saveQuestionAttempts(
  record: any,
  studentId: mongoose.Types.ObjectId,
  questionMap: Map<string, any>
) {
  for (const item of record.questions) {
    const question = questionMap.get(
      String(item.questionDocumentId)
    );

    if (!question) {
      throw new Error(
        `Question metadata missing: ${item.questionDocumentId}`
      );
    }

    const skillIds = cleanSkillIds(
      question.skills
    );

    const conceptIds = Array.isArray(
      question.learning?.conceptIds
    )
      ? question.learning.conceptIds
      : [];

    const stepSkillMappings = Array.isArray(
      question.steps
    )
      ? question.steps.map((step: any) => ({
          stepId: String(step.stepId),
          skillIds: cleanSkillIds(step.skills),
        }))
      : [];

    const partSkillMappings = Array.isArray(
      question.parts
    )
      ? question.parts.map((part: any) => ({
          partId: String(part.partId),
          skillIds: cleanSkillIds(part.skills),

          steps: Array.isArray(part.steps)
            ? part.steps.map((step: any) => ({
                stepId: String(step.stepId),
                skillIds: cleanSkillIds(
                  step.skills
                ),
              }))
            : [],
        }))
      : [];

    const evaluation = item.evaluation || {};

    const outcome: SkillOutcome =
      evaluation.outcome ||
      (evaluation.isCorrect === true
        ? "correct"
        : evaluation.isCorrect === false
          ? "incorrect"
          : item.responseStatus === "unanswered"
            ? "skipped"
            : "incorrect");

    await QuestionAttempt.updateOne(
      {
        examRecordId: record._id,
        questionId: question.questionId,
      },
      {
        $setOnInsert: {
          studentId,

          questionId: question.questionId,
          questionVersion: question.version,

          questionType: question.type,
          category: question.category,

          course: question.course,
          subject: question.subject,
          chapter: question.chapter,
          subtopic: question.subtopic,

          skillIds,
          conceptIds,

          prerequisiteSkillIds:
            question.learning?.prerequisiteSkillIds || [],

          stepSkillMappings,
          partSkillMappings,

          source: "exam",

          sessionId: String(record._id),

          examId: record.examId,
          examRecordId: record._id,

          response: normalizeStudentResponse(
            item.response
          ),

          performance: {
            outcome,

            isCorrect: evaluation.isCorrect,

            marksAwarded: evaluation.marksAwarded,
            totalMarks: item.marks,

            attemptNumber: 1,
            hintsUsed: 0,
            solutionViewed: false,
            changedAnswer: false,
            completed: true,
          },

          evaluation: {
            status: "evaluated",

            stepResults: Array.isArray(
              evaluation.breakdown
            )
              ? evaluation.breakdown
                  .filter(
                    (result: any) =>
                      result?.id || result?.stepId
                  )
                  .map((result: any) => ({
                    stepId: String(
                      result.stepId || result.id
                    ),

                    isCorrect:
                      typeof result.isCorrect ===
                      "boolean"
                        ? result.isCorrect
                        : null,

                    marksAwarded: Number(
                      result.marksAwarded || 0
                    ),

                    errorTags: [],
                  }))
              : [],

            errorTags: [],
            misconceptions: [],

            feedback: evaluation.feedback || "",
            evaluatedBy: "",
          },

          learningSignals: {
            skillsDemonstrated:
              evaluation.isCorrect === true
                ? skillIds
                : [],

            skillsNotDemonstrated:
              evaluation.isCorrect === false
                ? skillIds
                : [],

            conceptsUnderstood: [],
            conceptsNeedingPractice: [],
          },
        },
      },
      {
        upsert: true,
      }
    );

    // Explicit any avoids Mongoose lean() union inference
    // incorrectly treating the result as an array.
    const attempt: any = await QuestionAttempt.findOne({
      examRecordId: record._id,
      questionId: question.questionId,
    })
      .lean()
      .exec();

    if (!attempt?._id) {
      throw new Error(
        `Unable to create QuestionAttempt for ${question.questionId}`
      );
    }

    await updateStudentSkillMastery(
      attempt._id,
      studentId,
      record,
      question,
      evaluation.skillEvidence || []
    );
  }
}

/* =========================================================
   PUBLICATION DATE
   Next day at 9 AM
========================================================= */

function getNextDayPublishTime() {
  const now = new Date();

  const publishAt = new Date(now);

  publishAt.setDate(publishAt.getDate() + 1);
  publishAt.setHours(9, 0, 0, 0);

  return publishAt;
}

/* =========================================================
   POST: SUBMIT EXAM
========================================================= */

export async function POST(request: NextRequest) {
  let retryExamId = "";
  let retryStudentEmail = "";

  try {
    await connectDB();

    /* =====================================================
       1. AUTHENTICATION
    ===================================================== */

    const authResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/Get-Current-User`,
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

    if (!user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Student information not found.",
        },
        { status: 401 }
      );
    }

    const studentEmail = String(user.email)
      .trim()
      .toLowerCase();

    retryStudentEmail = studentEmail;

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
          message: "Valid student ID not found.",
        },
        { status: 401 }
      );
    }

    const studentId = new mongoose.Types.ObjectId(
      String(rawStudentId)
    );

    /* =====================================================
       2. REQUEST VALIDATION
    ===================================================== */

    const body: SubmitPayload = await request.json();

    const { examId, examResponses, timeLeft } = body;

    if (
      !examId ||
      !mongoose.Types.ObjectId.isValid(examId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid exam ID.",
        },
        { status: 400 }
      );
    }

    retryExamId = examId;

    if (!Array.isArray(examResponses)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid exam responses.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       3. LOAD EXAM
    ===================================================== */

    const exam: any = await TeacherExamPaper.findById(
      examId
    )
      .lean()
      .exec();

    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          message: "Exam not found.",
        },
        { status: 404 }
      );
    }

    if (
      ["draft", "cancelled"].includes(exam.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This exam cannot be submitted.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       4. DUPLICATE SUBMISSION CHECK
    ===================================================== */

    const existingRecord: any =
      await ExamRecords.findOne({
        examId: new mongoose.Types.ObjectId(examId),
        "student.email": studentEmail,
      })
        .lean()
        .exec();

    if (existingRecord) {
      const existingQuestions: any[] =
        await QuestionBankV2.find({
          _id: {
            $in: existingRecord.questions.map(
              (q: any) => q.questionDocumentId
            ),
          },
        })
          .lean()
          .exec();

      const existingQuestionMap = new Map<
        string,
        any
      >(
        existingQuestions.map(
          (q: any): [string, any] => [
            String(q._id),
            q,
          ]
        )
      );

      await saveQuestionAttempts(
        existingRecord,
        studentId,
        existingQuestionMap
      );

      return alreadySubmittedResponse(
        existingRecord
      );
    }

    /* =====================================================
       5. ASSIGNED QUESTIONS
    ===================================================== */

    const assignedQuestions = Array.isArray(
      exam.questions
    )
      ? exam.questions
      : [];

    if (assignedQuestions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No questions are assigned to this exam.",
        },
        { status: 400 }
      );
    }

    const assignedIds = assignedQuestions.map(
      (item: any) =>
        String(item.questionDocumentId)
    );

    const uniqueAssignedIds = new Set(
      assignedIds
    );

    if (
      uniqueAssignedIds.size !== assignedIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Duplicate question assignments found.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       6. VALIDATE SUBMITTED RESPONSES
    ===================================================== */

    const submittedMap = new Map<
      string,
      SubmittedResponse
    >();

    for (const item of examResponses) {
      if (
        !item?.questionDocumentId ||
        !mongoose.Types.ObjectId.isValid(
          item.questionDocumentId
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid question ID.",
          },
          { status: 400 }
        );
      }

      const id = String(item.questionDocumentId);

      if (!uniqueAssignedIds.has(id)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An unassigned question was submitted.",
          },
          { status: 400 }
        );
      }

      if (submittedMap.has(id)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Duplicate question response found.",
          },
          { status: 400 }
        );
      }

      submittedMap.set(id, item);
    }

    /* =====================================================
       7. LOAD EXACT QUESTION DOCUMENTS
    ===================================================== */

    const objectIds = assignedIds.map(
      (id: string) =>
        new mongoose.Types.ObjectId(id)
    );

    const questionDocuments: any[] =
      await QuestionBankV2.find({
        _id: { $in: objectIds },
      })
        .lean()
        .exec();

    const questionMap = new Map<string, any>(
      questionDocuments.map(
        (question: any): [string, any] => [
          String(question._id),
          question,
        ]
      )
    );

    if (
      questionMap.size !== assignedIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more assigned questions no longer exist.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       8. EVALUATE ALL QUESTIONS
    ===================================================== */

    const recordQuestions: any[] = [];

    let totalMarks = 0;
    let obtainedMarks = 0;

    let answeredCount = 0;
    let unansweredCount = 0;

    let correctCount = 0;
    let incorrectCount = 0;

    for (
      let index = 0;
      index < assignedQuestions.length;
      index++
    ) {
      const assigned = assignedQuestions[index];

      const documentId = String(
        assigned.questionDocumentId
      );

      const question = questionMap.get(documentId);

      const submitted = submittedMap.get(documentId);

      if (!question) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An assigned question could not be loaded.",
          },
          { status: 400 }
        );
      }

      if (
        question.status !== "published" ||
        question.verification?.status !== "verified"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An assigned question is not published and verified.",
          },
          { status: 400 }
        );
      }

      if (
        Number(question.version) !==
          Number(assigned.version) ||
        question.questionId !== assigned.questionId
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Question version mismatch. Please contact your teacher.",
          },
          { status: 400 }
        );
      }

      if (
        submitted &&
        (
          submitted.questionId !==
            question.questionId ||
          Number(submitted.version) !==
            Number(question.version)
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Submitted question information does not match.",
          },
          { status: 400 }
        );
      }

      const marks = Number(assigned.marks || 0);

      if (
        !Number.isFinite(marks) ||
        marks < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid marks configuration.",
          },
          { status: 400 }
        );
      }

      totalMarks += marks;

      const response = submitted?.response ?? null;

      const answered = !isEmptyAnswer(response);

      if (answered) {
        answeredCount++;
      } else {
        unansweredCount++;
      }

      const evaluation = evaluateQuestion(
        question,
        response,
        marks
      );

      const marksAwarded = round(
        Math.min(
          marks,
          Math.max(0, evaluation.marksAwarded)
        )
      );

      evaluation.marksAwarded = marksAwarded;

      obtainedMarks += marksAwarded;

      if (evaluation.outcome === "correct") {
        correctCount++;
      } else if (
        evaluation.outcome === "incorrect" ||
        evaluation.outcome === "partial"
      ) {
        incorrectCount++;
      }

      recordQuestions.push({
        questionDocumentId: question._id,
        questionId: question.questionId,
        version: question.version,

        setId:
          assigned.setId ??
          submitted?.setId ??
          null,

        order: assigned.order ?? index + 1,

        marks,

        response,

        responseStatus: answered
          ? "answered"
          : "unanswered",

        evaluation: {
          status: "auto_evaluated",
          outcome: evaluation.outcome,
          isCorrect: evaluation.isCorrect,
          marksAwarded,
          feedback: evaluation.feedback,
          evaluatedAt: new Date(),
          evaluatedBy: "system",
          breakdown: evaluation.breakdown,

          skillEvidence: evaluation.skillEvidence,
        },
      });
    }

    /* =====================================================
       9. CALCULATE FINAL RESULT
    ===================================================== */

    const allowedSeconds =
      Number(
        exam.schedule?.durationMinutes || 0
      ) * 60;

    const reportedTimeLeft = Number.isFinite(
      Number(timeLeft)
    )
      ? Math.max(
          0,
          Math.min(
            allowedSeconds,
            Math.floor(Number(timeLeft))
          )
        )
      : 0;

    const timeSpentSeconds = Math.max(
      0,
      allowedSeconds - reportedTimeLeft
    );

    const percentage =
      totalMarks > 0
        ? round(
            (obtainedMarks / totalMarks) * 100,
            2
          )
        : 0;

    /* =====================================================
       10. CREATE EXAM RECORD
    ===================================================== */

    const publishAt = getNextDayPublishTime();

    const record = await ExamRecords.create({
      examId: exam._id,

      student: {
        username: user.username || "",
        name: user.name || "",
        email: studentEmail,
      },

      exam: {
        title: exam.title,
        testType: exam.testType,
        course: exam.course,
        subject: exam.subject,
        chapters: exam.chapters || [],
        teacherName: exam.teacherName || "",
      },

      questions: recordQuestions,

      submissionStatus: "submitted",

      submittedAt: new Date(),

      evaluationStatus: "completed",
      evaluatedAt: new Date(),

      totalQuestions: recordQuestions.length,

      answeredCount,
      unansweredCount,

      correctCount,
      incorrectCount,

      totalMarks,
      obtainedMarks,
      percentage,

      allowedSeconds,
      timeSpentSeconds,
      reportedTimeLeftSeconds: reportedTimeLeft,

      startedAt: null,

      resultStatus: "pending",
      publishAt,
      publishedAt: null,
    });

    /* =====================================================
       11. CREATE QUESTION ATTEMPTS
       12. UPDATE STUDENT SKILL MASTERY
    ===================================================== */

    await saveQuestionAttempts(
      record,
      studentId,
      questionMap
    );

    /* =====================================================
       13. SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        alreadySubmitted: false,
        message: "Exam submitted successfully.",

        recordId: String(record._id),

        resultStatus: record.resultStatus,

        evaluationStatus: record.evaluationStatus,

        totalQuestions: record.totalQuestions,

        answeredCount: record.answeredCount,

        unansweredCount: record.unansweredCount,

        totalMarks: record.totalMarks,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("SUBMIT EXAM ERROR:", error);

    /* =====================================================
       DUPLICATE SUBMISSION
    ===================================================== */

    if (error?.code === 11000) {
      try {
        if (
          retryExamId &&
          retryStudentEmail
        ) {
          const existingRecord: any =
            await ExamRecords.findOne({
              examId: new mongoose.Types.ObjectId(
                retryExamId
              ),
              "student.email": retryStudentEmail,
            })
              .lean()
              .exec();

          if (existingRecord) {
            return alreadySubmittedResponse(
              existingRecord
            );
          }
        }
      } catch (lookupError) {
        console.error(
          "Unable to find previously submitted exam:",
          lookupError
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Submission already exists. Please refresh.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit exam.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}