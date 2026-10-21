import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";  import { connectDB } from "@/lib/mongoose";
import ExamRecords from "@/model/ExamRecordSchema";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(req: Request) {
  noStore();
  await connectDB();

  try {
    const url = new URL(req.url);
    const examId = url.searchParams.get("examId");
    const email = url.searchParams.get("email");

    if (!examId || !email) {
      return NextResponse.json(
        { success: false, error: "examId and email are required" },
        { status: 400 }
      );
    }

    // ==========================================================
    // 1️⃣ Get Student Record
    // ==========================================================
    const record: any = await ExamRecords.findOne({
      examId,
      email,
    }).lean();

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Exam record not found" },
        { status: 404 }
      );
    }

   // ==========================================================
// 2️⃣ Get Exam Paper + Questions
// ==========================================================
const exam: any = await TeacherExamPaper.findById(examId)
  .populate({
    path: "questionIds",
    select:
      "question options answer subject chapter level hint questionType optionType",
  })
  .lean();

if (!exam) {
  return NextResponse.json(
    { success: false, error: "Exam not found" },
    { status: 404 }
  );
}

const questions = exam.questionIds || [];

    const totalQuestions = exam.totalQuestions;
    const totalMarks = exam.totalMarks;
// ==========================================================
// Build Question Map
// ==========================================================

const questionMap = new Map();

questions.forEach((q: any) => {
  questionMap.set(q._id.toString(), q);
});
    // ==========================================================
    // 3️⃣ Get All Records For Ranking
    // ==========================================================
    const allRecords: any[] = await ExamRecords.find({ examId }).lean();
    const totalStudents = allRecords.length;

    const scores = allRecords.map((r) => r.score ?? 0);

    // Sort descending
    const sortedScores = [...scores].sort((a, b) => b - a);

    const rank = sortedScores.indexOf(record.score) + 1;

    // ✅ Better percentile (rank-based method)
    const percentile =
      totalStudents > 0
        ? (((totalStudents - rank) / totalStudents) * 100).toFixed(2)
        : "0.00";

    // ==========================================================
    // 4️⃣ Marking Calculation
    // ==========================================================
    const positiveMarking = record.correct * 4;
    const negativeMarking = record.incorrect * 1;
    const totalMarksObtained = (positiveMarking - negativeMarking) * 4;
// ==========================================================
// Subject / Chapter / Difficulty Analysis
// ==========================================================

const subjectAnalysis: Record<
  string,
  {
    total: number;
    correct: number;
    incorrect: number;
    skipped: number;
    score: number;
  }
> = {};

const chapterAnalysis: Record<
  string,
  {
    total: number;
    correct: number;
    incorrect: number;
    skipped: number;
    score: number;
  }
> = {};

const difficultyAnalysis: Record<
  string,
  {
    total: number;
    correct: number;
    incorrect: number;
    skipped: number;
  }
> = {};
// ==========================================================
// Analyze Every Question
// ==========================================================

const questionReview: any[] = [];

const answerMap = new Map();

(record.Answers || []).forEach((a: any) => {
  answerMap.set(a.id, a);
});

(record.unanswered || []).forEach((a: any) => {
  answerMap.set(a.id, a);
});

questions.forEach((q: any) => {
  const answer = answerMap.get(q._id.toString());

  let status = "skipped";

  if (answer) {
    if (answer.selected === q.answer) {
      status = "correct";
    } else if (answer.selected !== "") {
      status = "incorrect";
    }
  }

  // SUBJECT

  if (!subjectAnalysis[q.subject]) {
    subjectAnalysis[q.subject] = {
      total: 0,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      score: 0,
    };
  }

  subjectAnalysis[q.subject].total++;

  // CHAPTER

  const chapterKey = `${q.subject} / ${q.chapter}`;

  if (!chapterAnalysis[chapterKey]) {
    chapterAnalysis[chapterKey] = {
      total: 0,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      score: 0,
    };
  }

  chapterAnalysis[chapterKey].total++;

  // DIFFICULTY

  if (!difficultyAnalysis[q.level]) {
    difficultyAnalysis[q.level] = {
      total: 0,
      correct: 0,
      incorrect: 0,
      skipped: 0,
    };
  }

  if (status === "correct") {
    subjectAnalysis[q.subject].correct++;
    subjectAnalysis[q.subject].score += 4;

    chapterAnalysis[chapterKey].correct++;
    chapterAnalysis[chapterKey].score += 4;

    difficultyAnalysis[q.level].correct++;
  }

  if (status === "incorrect") {
    subjectAnalysis[q.subject].incorrect++;
    subjectAnalysis[q.subject].score -= 1;

    chapterAnalysis[chapterKey].incorrect++;
    chapterAnalysis[chapterKey].score -= 1;

    difficultyAnalysis[q.level].incorrect++;
  }

  if (status === "skipped") {
    subjectAnalysis[q.subject].skipped++;
    chapterAnalysis[chapterKey].skipped++;
    difficultyAnalysis[q.level].skipped++;
  }

  questionReview.push({
    questionId: q._id,
    subject: q.subject,
    chapter: q.chapter,
    difficulty: q.level,
    question: q.question,
    options: q.options,
    hint: q.hint,
    correctAnswer: q.answer,
    selectedAnswer: answer?.selected || "",
    status,
  });
});
    // ==========================================================
    // 5️⃣ Topper List (Top 5 Students)
    // ==========================================================
    const topperList = await ExamRecords.find({ examId })
      .sort({ score: -1 })
      .limit(5)
      .select("name email score percentage")
      .lean();

    // ==========================================================
    // 6️⃣ Final Clean Response
    // ==========================================================
   return NextResponse.json({
  success: true,

  exam: {
    _id: exam._id.toString(),
    testType: exam.testType,
    course: exam.course,
    startTime: exam.startTime,
    endTime: exam.endTime,
    totalQuestions,
    totalMarks,
  },

  record: {
    _id: record._id.toString(),
    name: record.name,
    email: record.email,
    score: record.score,
    percentage: record.percentage,
    correct: record.correct,
    incorrect: record.incorrect,
    unanswered:
      totalQuestions - (record.correct + record.incorrect),
    duration: record.duration,
    timeLeft: record.timeLeft,
    resultStatus: record.resultStatus,
  },

  analytics: {
    rank,
    percentile,
    totalStudents,
  },

  topperList,

  positiveMarking,
  negativeMarking,
  totalMarksObtained,

  // ===============================
  // NEW ANALYTICS
  // ===============================

  subjectAnalysis: Object.entries(subjectAnalysis).map(
    ([subject, value]) => ({
      subject,
      ...value,
      percentage:
        value.total > 0
          ? Number(
              ((value.correct / value.total) * 100).toFixed(2)
            )
          : 0,
    })
  ),

  chapterAnalysis: Object.entries(chapterAnalysis).map(
    ([chapter, value]) => ({
      chapter,
      ...value,
      percentage:
        value.total > 0
          ? Number(
              ((value.correct / value.total) * 100).toFixed(2)
            )
          : 0,
    })
  ),

  difficultyAnalysis: Object.entries(difficultyAnalysis).map(
    ([difficulty, value]) => ({
      difficulty,
      ...value,
      percentage:
        value.total > 0
          ? Number(
              ((value.correct / value.total) * 100).toFixed(2)
            )
          : 0,
    })
  ),

  questionReview,

  strongestSubject:
    Object.entries(subjectAnalysis)
      .sort(
        (a: any, b: any) =>
          b[1].score - a[1].score
      )[0]?.[0] || null,

  weakestSubject:
    Object.entries(subjectAnalysis)
      .sort(
        (a: any, b: any) =>
          a[1].score - b[1].score
      )[0]?.[0] || null,

  strongestChapter:
    Object.entries(chapterAnalysis)
      .sort(
        (a: any, b: any) =>
          b[1].score - a[1].score
      )[0]?.[0] || null,

  weakestChapter:
    Object.entries(chapterAnalysis)
      .sort(
        (a: any, b: any) =>
          a[1].score - b[1].score
      )[0]?.[0] || null,

  marksLost: {
    wrong: record.incorrect * 1,
    skipped: record.unansweredCount * 4,
    total:
      record.incorrect +
      record.unansweredCount * 4,
  },
});
  } catch (error) {
    console.error("Exam Result Details Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}