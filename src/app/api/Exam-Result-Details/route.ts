import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

import { connectDB } from "@/lib/mongoose";
import ExamRecords from "@/model/ExamRecordSchema";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import QuestionBankV2 from "@/model/QuestionBankV2";
import QuestionAttempt from "@/model/QuestionAttempt";
import StudentSkillMastery from "@/model/StudentSkillMastery";
import { publishEligibleExamResults } from "@/utils/publishEligibleExamResults";

export const dynamic = "force-dynamic";

type AnyObject = Record<string, any>;

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

function cleanNumber(value: any): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function getSkillIds(value: any): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter(
          (id: any) =>
            typeof id === "string" && id.trim().length > 0
        )
        .map((id: string) => id.trim())
    )
  );
}

function getOutcome(
  attempt: any,
  questionRecord: any
): Outcome {
  const outcome = attempt?.performance?.outcome;

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

  if (questionRecord?.evaluation?.isCorrect === true) {
    return "correct";
  }

  if (questionRecord?.evaluation?.isCorrect === false) {
    return "incorrect";
  }

  if (questionRecord?.responseStatus === "unanswered") {
    return "skipped";
  }

  return "pending";
}

function getQuestionContent(question: any) {
  return {
    prompt: question?.prompt ?? null,
    options: question?.options ?? [],
    response: question?.response ?? null,
    solution: question?.solution ?? null,
    explanation: question?.explanation ?? null,
  };
}

function addToAnalysis(
  map: Map<string, AnyObject>,
  key: string,
  marks: number
) {
  if (!map.has(key)) {
    map.set(key, {
      name: key,
      total: 0,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      partiallyCorrect: 0,
      pending: 0,
      marksAwarded: 0,
      totalMarks: 0,
    });
  }

  const item = map.get(key)!;

  item.total++;
  item.totalMarks += marks;

  return item;
}

function finalizeAnalysis(
  map: Map<string, AnyObject>
) {
  return Array.from(map.values()).map((item) => ({
    name: String(item.name || "Unassigned"),
    total: cleanNumber(item.total),
    pending: cleanNumber(item.pending),
    marksAwarded: round(cleanNumber(item.marksAwarded)),
    totalMarks: round(cleanNumber(item.totalMarks)),

    percentage:
      item.totalMarks > 0
        ? round(
            (item.marksAwarded / item.totalMarks) * 100
          )
        : 0,

    accuracy:
      item.correct + item.incorrect > 0
        ? round(
            (item.correct /
              (item.correct + item.incorrect)) *
              100
          )
        : 0,
  }));
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

function getResultById(
  results: any[],
  id: string,
  possibleKeys: string[]
) {
  return results.find((result) =>
    possibleKeys.some(
      (key) =>
        result?.[key] !== undefined &&
        String(result[key]) === String(id)
    )
  );
}

/**
 * Uses the most specific available evidence:
 *
 * 1. Step-level skill mappings.
 * 2. Part-level skill mappings when no step mapping exists.
 * 3. Question-level skills only when granular mappings are absent.
 *
 * A skill is counted once per question, preventing duplicate evidence
 * when the same skill appears at multiple nested levels.
 */
function addQuestionSkillEvidence(
  skillMap: Map<string, SkillEvidence>,
  attempt: any,
  question: any,
  questionRecord: any,
  questionOutcome: Outcome,
  questionMarks: number,
  questionAwarded: number
) {
  const stepMappings = Array.isArray(
    attempt?.stepSkillMappings
  )
    ? attempt.stepSkillMappings
    : [];

  const partMappings = Array.isArray(
    attempt?.partSkillMappings
  )
    ? attempt.partSkillMappings
    : [];

  const stepResults = Array.isArray(
    attempt?.evaluation?.stepResults
  )
    ? attempt.evaluation.stepResults
    : [];

  const partResults = Array.isArray(
    attempt?.evaluation?.partResults
  )
    ? attempt.evaluation.partResults
    : [];

  const granularEvidence: Array<{
    skillId: string;
    outcome: Outcome;
    marks: number;
    awarded: number;
  }> = [];

  // STEP-LEVEL EVIDENCE

  for (const mapping of stepMappings) {
    const stepId = String(mapping?.stepId || "");
    if (!stepId) continue;

    const result = getResultById(
      stepResults,
      stepId,
      ["stepId", "id"]
    );

    const skills = getSkillIds(mapping?.skillIds);

    if (!skills.length) continue;

    const marks = cleanNumber(
      result?.totalMarks ??
        result?.marks ??
        result?.maxMarks
    );

    const awarded = cleanNumber(
      result?.marksAwarded ??
        result?.awardedMarks
    );

    const outcome = (
      result?.outcome &&
      [
        "correct",
        "incorrect",
        "partially_correct",
        "skipped",
        "pending",
      ].includes(result.outcome)
        ? result.outcome
        : result?.isCorrect === true
          ? "correct"
          : result?.isCorrect === false
            ? "incorrect"
            : result
              ? "pending"
              : questionOutcome
    ) as Outcome;

    for (const skillId of skills) {
      granularEvidence.push({
        skillId,
        outcome,
        marks,
        awarded,
      });
    }
  }

  // PART-LEVEL EVIDENCE

  for (const mapping of partMappings) {
    const partId = String(mapping?.partId || "");
    if (!partId) continue;

    const partResult = getResultById(
      partResults,
      partId,
      ["partId", "id"]
    );

    const nestedSteps = Array.isArray(mapping?.steps)
      ? mapping.steps
      : [];

    const partSkills = getSkillIds(mapping?.skillIds);

    // If nested step mappings exist, their evidence is more specific.
    // Do not count the parent part skills again.
    if (nestedSteps.length > 0) {
      continue;
    }

    if (!partSkills.length) continue;

    const marks = cleanNumber(
      partResult?.totalMarks ??
        partResult?.marks ??
        partResult?.maxMarks
    );

    const awarded = cleanNumber(
      partResult?.marksAwarded ??
        partResult?.awardedMarks
    );

    const outcome = (
      partResult?.outcome &&
      [
        "correct",
        "incorrect",
        "partially_correct",
        "skipped",
        "pending",
      ].includes(partResult.outcome)
        ? partResult.outcome
        : partResult?.isCorrect === true
          ? "correct"
          : partResult?.isCorrect === false
            ? "incorrect"
            : partResult
              ? "pending"
              : questionOutcome
    ) as Outcome;

    for (const skillId of partSkills) {
      granularEvidence.push({
        skillId,
        outcome,
        marks,
        awarded,
      });
    }
  }

  // FALLBACK TO QUESTION-LEVEL SKILLS

  if (!granularEvidence.length) {
    const skills = getSkillIds(
      attempt?.skillIds ?? question?.skills
    );

    for (const skillId of skills) {
      granularEvidence.push({
        skillId,
        outcome: questionOutcome,
        marks: questionMarks,
        awarded: questionAwarded,
      });
    }
  }

  // Aggregate duplicate skill evidence within this question.
  const perQuestion = new Map<
    string,
    {
      marks: number;
      awarded: number;
      outcomes: Outcome[];
    }
  >();

  for (const item of granularEvidence) {
    if (!perQuestion.has(item.skillId)) {
      perQuestion.set(item.skillId, {
        marks: 0,
        awarded: 0,
        outcomes: [],
      });
    }

    const current = perQuestion.get(item.skillId)!;

    current.marks += item.marks;
    current.awarded += item.awarded;
    current.outcomes.push(item.outcome);
  }

  for (const [skillId, evidence] of Array.from(perQuestion.entries())) {
    if (!skillMap.has(skillId)) {
      skillMap.set(
        skillId,
        createSkillEvidence(skillId)
      );
    }

    const skill = skillMap.get(skillId)!;

    skill.total++;

    // If granular marks are unavailable, use the question marks.
    skill.totalMarks +=
      evidence.marks > 0
        ? evidence.marks
        : questionMarks;

    skill.marksAwarded +=
      evidence.marks > 0
        ? evidence.awarded
        : questionAwarded;

    // A skill is counted once per question.
    // If its evidence spans multiple steps, use the combined result.
    const outcomes = evidence.outcomes;

    let finalOutcome: Outcome;

    if (outcomes.includes("pending")) {
      finalOutcome = "pending";
    } else if (outcomes.includes("incorrect")) {
      finalOutcome = "incorrect";
    } else if (outcomes.includes("partially_correct")) {
      finalOutcome = "partially_correct";
    } else if (outcomes.includes("skipped")) {
      finalOutcome = "skipped";
    } else {
      finalOutcome = "correct";
    }

    applyOutcome(skill, finalOutcome);
  }
}

function finalizeSkillAnalysis(
  skillMap: Map<string, SkillEvidence>,
  masteryMap: Map<string, any>
) {
  const result = Array.from(skillMap.values()).map(
    (skill) => {
      const mastery = masteryMap.get(skill.skillId);

      return {
        ...skill,

        marksAwarded: round(skill.marksAwarded),
        totalMarks: round(skill.totalMarks),

        percentage:
          skill.totalMarks > 0
            ? round(
                (skill.marksAwarded /
                  skill.totalMarks) *
                  100
              )
            : 0,

        accuracy:
          skill.correct + skill.incorrect > 0
            ? round(
                (skill.correct /
                  (skill.correct + skill.incorrect)) *
                  100
              )
            : 0,

        // Cumulative mastery is separate from this exam's score.
        masteryScore: mastery
          ? round(
              cleanNumber(mastery.masteryScore) * 100
            )
          : null,

        masteryStatus: mastery?.status || "not_started",

        lastPracticedAt:
          mastery?.lastPracticedAt || null,
      };
    }
  );

  result.sort(
    (a, b) => a.percentage - b.percentage
  );

  return result;
}

export async function GET(request: NextRequest) {
  noStore();

  try {
    await connectDB();

    // =====================================================
    // 1. AUTHENTICATE STUDENT
    // =====================================================

    const authUrl = new URL(
      "/api/auth/Get-Current-User",
      request.nextUrl.origin
    );

    const authResponse = await fetch(
      authUrl.toString(),
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
          error: "Authentication required.",
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
          error: "Student information not found.",
        },
        { status: 401 }
      );
    }

    const email = String(user.email)
      .trim()
      .toLowerCase();

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
          error: "Student ID is invalid.",
        },
        { status: 401 }
      );
    }

    const studentId = new mongoose.Types.ObjectId(
      String(rawStudentId)
    );

   // =====================================================
// 2. VALIDATE SUBMISSION RECORD ID
// =====================================================

const submissionId =
  request.nextUrl.searchParams.get("examId");

if (
  !submissionId ||
  !mongoose.Types.ObjectId.isValid(submissionId)
) {
  return NextResponse.json(
    {
      success: false,
      error: "Invalid submission ID.",
    },
    { status: 400 }
  );
}

const submissionObjectId =
  new mongoose.Types.ObjectId(submissionId);

// Publish all eligible results belonging to this student.
await publishEligibleExamResults(email);


// =====================================================
// 3. GET STUDENT SUBMISSION RECORD
// =====================================================

const record: any = await ExamRecords.findOne({
  _id: submissionObjectId,
  "student.email": email,
  submissionStatus: "submitted",
}).lean();

if (!record) {
  return NextResponse.json(
    {
      success: false,
      error: "Your exam submission was not found.",
    },
    { status: 404 }
  );
}

// Get the actual exam paper ID from the submission.
if (
  !record.examId ||
  !mongoose.Types.ObjectId.isValid(
    String(record.examId)
  )
) {
  return NextResponse.json(
    {
      success: false,
      error: "The original exam paper ID is invalid.",
    },
    { status: 404 }
  );
}

const examObjectId = new mongoose.Types.ObjectId(
  String(record.examId)
);


    // =====================================================
    // 4. RESULT PUBLICATION SECURITY
    // =====================================================

    if (
      record.resultStatus !== "published" ||
      record.evaluationStatus !== "completed" ||
      (
        record.publishAt &&
        new Date(record.publishAt).getTime() > Date.now()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          resultPending: true,
          error:
            "Your result is not published yet. Please check again later.",
          evaluationStatus: record.evaluationStatus,
          resultStatus: record.resultStatus,
          publishAt: record.publishAt,
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 5. GET EXAM
    // =====================================================

    const exam: any = await TeacherExamPaper.findById(
      examObjectId
    ).lean();

    if (!exam) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam information not found.",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // 6. GET EXACT QUESTION DOCUMENTS
    // =====================================================

    const recordQuestions = Array.isArray(
      record.questions
    )
      ? [...record.questions].sort(
          (a: any, b: any) =>
            cleanNumber(a.order) -
            cleanNumber(b.order)
        )
      : [];

    const questionDocumentIds = recordQuestions
      .map((question: any) => question.questionDocumentId)
      .filter(Boolean);

    const questionDocuments: any[] =
      await QuestionBankV2.find({
        _id: { $in: questionDocumentIds },
      }).lean();

    const questionMap = new Map<string, any>();

    questionDocuments.forEach((question) => {
      questionMap.set(
        String(question._id),
        question
      );
    });

    // =====================================================
    // 7. GET QUESTION ATTEMPTS
    // =====================================================

    const attempts: any[] =
      await QuestionAttempt.find({
        examRecordId: record._id,
        studentId,
        source: "exam",
      }).lean();

    const attemptMap = new Map<string, any>();

    attempts.forEach((attempt) => {
      attemptMap.set(
        `${attempt.questionId}_${attempt.questionVersion}`,
        attempt
      );
    });

    // =====================================================
    // 8. GET CUMULATIVE STUDENT SKILL MASTERY
    // =====================================================

    const masteryRecords: any[] =
      await StudentSkillMastery.find({
        studentId,
      })
        .select(
          "skillId masteryScore status lastPracticedAt course subject"
        )
        .lean();

    const masteryMap = new Map<string, any>();

    masteryRecords.forEach((mastery) => {
      masteryMap.set(
        String(mastery.skillId),
        mastery
      );
    });

    // =====================================================
    // 9. ANALYSIS MAPS
    // =====================================================

    const subjectMap = new Map<string, AnyObject>();
    const chapterMap = new Map<string, AnyObject>();
    const difficultyMap = new Map<string, AnyObject>();
    const skillMap = new Map<string, SkillEvidence>();

    const questionReview: AnyObject[] = [];

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let partiallyCorrectCount = 0;
    let pendingCount = 0;

    let obtainedMarks = 0;
    let availableMarks = 0;

    let wrongMarksLost = 0;
    let skippedMarksLost = 0;

    // =====================================================
    // 10. PROCESS QUESTIONS
    // =====================================================

    for (const item of recordQuestions) {
      const question = questionMap.get(
        String(item.questionDocumentId)
      );

      const attempt = attemptMap.get(
        `${item.questionId}_${item.version}`
      );

      if (
        !question ||
        Number(question.version) !==
          Number(item.version) ||
        question.questionId !== item.questionId
      ) {
        questionReview.push({
          questionId: item.questionId,
          order: item.order,
          marks: item.marks,
          status: "unavailable",
          question: null,
          response: item.response,
          feedback:
            "Original question version is unavailable.",
        });

        continue;
      }

      const marks = cleanNumber(item.marks);

      const awarded = cleanNumber(
        item.evaluation?.marksAwarded ??
          attempt?.performance?.marksAwarded
      );

      const outcome = getOutcome(attempt, item);

      const subject = question.subject || "Unassigned";
      const chapter = question.chapter || "Unassigned";

      const difficulty =
        question.difficulty ||
        question.level ||
        question.selection?.difficulty ||
        "Unspecified";

      availableMarks += marks;
      obtainedMarks += awarded;

      const subjectItem = addToAnalysis(
        subjectMap,
        subject,
        marks
      );

      const chapterItem = addToAnalysis(
        chapterMap,
        `${subject} / ${chapter}`,
        marks
      );

      const difficultyItem = addToAnalysis(
        difficultyMap,
        difficulty,
        marks
      );

      if (outcome === "correct") {
        correctCount++;
        subjectItem.correct++;
        chapterItem.correct++;
        difficultyItem.correct++;
      } else if (outcome === "incorrect") {
        incorrectCount++;
        subjectItem.incorrect++;
        chapterItem.incorrect++;
        difficultyItem.incorrect++;

        wrongMarksLost += Math.max(
          0,
          marks - awarded
        );
      } else if (outcome === "skipped") {
        skippedCount++;
        subjectItem.skipped++;
        chapterItem.skipped++;
        difficultyItem.skipped++;

        skippedMarksLost += Math.max(
          0,
          marks - awarded
        );
      } else if (outcome === "partially_correct") {
        partiallyCorrectCount++;
        subjectItem.partiallyCorrect++;
        chapterItem.partiallyCorrect++;
        difficultyItem.partiallyCorrect++;

        wrongMarksLost += Math.max(
          0,
          marks - awarded
        );
      } else {
        pendingCount++;
        subjectItem.pending++;
        chapterItem.pending++;
        difficultyItem.pending++;
      }

      subjectItem.marksAwarded += awarded;
      chapterItem.marksAwarded += awarded;
      difficultyItem.marksAwarded += awarded;

      // =================================================
      // SKILL ANALYSIS
      // =================================================

      addQuestionSkillEvidence(
        skillMap,
        attempt,
        question,
        item,
        outcome,
        marks,
        awarded
      );

      // =================================================
      // QUESTION REVIEW
      // =================================================

      questionReview.push({
        questionId: item.questionId,
        questionVersion: item.version,
        order: item.order,
        setId: item.setId,

        subject,
        chapter,
        difficulty,

        marks,
        marksAwarded: awarded,

        status: outcome,

        question: getQuestionContent(question),

        studentResponse: item.response,

        correctAnswer: question.answerKey ?? null,

        explanation:
          question.explanation ??
          question.solution ??
          null,

        feedback:
          item.evaluation?.feedback ||
          attempt?.evaluation?.feedback ||
          "",

        skills: getSkillIds(
          attempt?.skillIds ?? question?.skills
        ),

        stepSkillMappings:
          attempt?.stepSkillMappings || [],

        partSkillMappings:
          attempt?.partSkillMappings || [],

        stepResults:
          attempt?.evaluation?.stepResults ||
          item.evaluation?.breakdown ||
          [],

        partResults:
          attempt?.evaluation?.partResults || [],
      });
    }

    // =====================================================
    // 11. FINAL SUBJECT / CHAPTER / DIFFICULTY ANALYSIS
    // =====================================================

    const subjectAnalysis =
      finalizeAnalysis(subjectMap);

    const chapterAnalysis =
      finalizeAnalysis(chapterMap);

    const difficultyAnalysis =
      finalizeAnalysis(difficultyMap);

    // =====================================================
    // 12. FINAL SKILL ANALYSIS
    // =====================================================

    const skillAnalysis = finalizeSkillAnalysis(
      skillMap,
      masteryMap
    );

    // =====================================================
    // 13. STRONGEST AND WEAKEST AREAS
    // =====================================================

    const evaluatedSubjects =
      subjectAnalysis.filter(
        (item) =>
          item.total > 0 &&
          item.pending === 0
      );

    const evaluatedChapters =
      chapterAnalysis.filter(
        (item) =>
          item.total > 0 &&
          item.pending === 0
      );

    const strongestSubject =
      [...evaluatedSubjects].sort(
        (a, b) => b.percentage - a.percentage
      )[0]?.name || null;

    const weakestSubject =
      [...evaluatedSubjects].sort(
        (a, b) => a.percentage - b.percentage
      )[0]?.name || null;

    const strongestChapter =
      [...evaluatedChapters].sort(
        (a, b) => b.percentage - a.percentage
      )[0]?.name || null;

    const weakestChapter =
      [...evaluatedChapters].sort(
        (a, b) => a.percentage - b.percentage
      )[0]?.name || null;

    // =====================================================
    // 14. RANK AND TOPPERS
    // =====================================================

   const publishedRecords: any[] =
  await ExamRecords.find({
    examId: examObjectId,
    submissionStatus: "submitted",
    resultStatus: "published",
    evaluationStatus: "completed",

    $expr: {
      $or: [
        { $eq: ["$publishAt", null] },
        {
          $lte: [
            {
              $convert: {
                input: "$publishAt",
                to: "date",
                onError: null,
                onNull: null,
              },
            },
            new Date(),
          ],
        },
      ],
    },
  })
    .select(
      "student.name student.email obtainedMarks percentage totalMarks"
    )
    .lean();

    const sortedRecords = [...publishedRecords].sort(
      (a, b) =>
        cleanNumber(b.obtainedMarks) -
        cleanNumber(a.obtainedMarks)
    );

    const rank =
      sortedRecords.findIndex(
        (recordItem) =>
          String(
            recordItem.student?.email || ""
          ).toLowerCase() === email
      ) + 1;

    const totalStudents = sortedRecords.length;

    const studentsBelow = sortedRecords.filter(
      (recordItem) =>
        cleanNumber(recordItem.obtainedMarks) <
        cleanNumber(record.obtainedMarks)
    ).length;

    const percentile =
      totalStudents > 0
        ? round(
            (studentsBelow / totalStudents) * 100
          )
        : 0;

    const topperList = sortedRecords
      .slice(0, 5)
      .map((student, index) => ({
        _id: String(index + 1),
        name: student.student?.name || "Student",
        score: cleanNumber(student.obtainedMarks),
        percentage: cleanNumber(student.percentage),
      }));

    // =====================================================
    // 15. FINAL RESPONSE
    // =====================================================

    const totalQuestions = cleanNumber(
      record.totalQuestions
    );

    const duration = cleanNumber(
      record.timeSpentSeconds
    );

    const accuracy =
      correctCount + incorrectCount > 0
        ? round(
            (correctCount /
              (correctCount + incorrectCount)) *
              100
          )
        : 0;

    const speed =
      duration > 0
        ? round(
            totalQuestions / (duration / 60)
          )
        : 0;

    return NextResponse.json({
      success: true,

      exam: {
        _id: String(exam._id),
        title: record.exam?.title || exam.title,
        testType:
          record.exam?.testType || exam.testType,
        course:
          record.exam?.course || exam.course,
        subject:
          record.exam?.subject || exam.subject,
        chapters:
          record.exam?.chapters || exam.chapters,

        totalQuestions,
        totalMarks: cleanNumber(record.totalMarks),

        allowedSeconds: cleanNumber(
          record.allowedSeconds
        ),
      },

      record: {
        _id: String(record._id),

        name: record.student?.name || "Student",
        email,

        score: round(obtainedMarks),

        percentage: round(
          availableMarks > 0
            ? (obtainedMarks / availableMarks) * 100
            : 0
        ),

        correct: correctCount,
        incorrect: incorrectCount,
        unanswered: skippedCount,
        partiallyCorrect: partiallyCorrectCount,
        pending: pendingCount,

        duration,
        timeLeft: cleanNumber(
          record.reportedTimeLeftSeconds
        ),

        submittedAt: record.submittedAt,
        evaluationStatus: record.evaluationStatus,
        resultStatus: record.resultStatus,
      },

      analytics: {
        rank,
        percentile,
        totalStudents,

        accuracy,
        speed,

        correctCount,
        incorrectCount,
        skippedCount,
        partiallyCorrectCount,
        pendingCount,
      },

      subjectAnalysis,
      chapterAnalysis,
      difficultyAnalysis,
      skillAnalysis,

      strongestSubject,
      weakestSubject,

      strongestChapter,
      weakestChapter,

      marksLost: {
        wrong: round(wrongMarksLost),
        skipped: round(skippedMarksLost),
        total: round(
          wrongMarksLost + skippedMarksLost
        ),
      },

      topperList,

      questionReview,
    });
  } catch (error) {
    console.error(
      "Exam Result Details Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to generate exam result.",
      },
      { status: 500 }
    );
  }
}