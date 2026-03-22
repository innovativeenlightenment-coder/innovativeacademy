import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import ExamRecords from "@/model/ExamRecordSchema";
import QuestionBank from "@/model/QuestionBankSchema";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";


export const dynamic = "force-dynamic";


noStore();

type QuestionInfo = {
  _id: string;
  subject: string;
  chapter: string;
};

type ExamLean = {
  _id: string;
  testType: string;
  course?: string;
  subject?: string;
  chapter?: string;
  questionIds: string[];
  startTime: Date;
  endTime: Date;
  totalQuestions: number;
  totalMarks: number;
};

export async function GET(req: Request) {
  await connectDB();

  try {
    const email = String(new URL(req.url).searchParams.get("email") || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });

    const now = new Date();

    // Fetch all teacher exams
    const examsRaw = await TeacherExamPaper.find().lean();
    const exams: ExamLean[] = examsRaw.map((e: any) => ({
      _id: e._id.toString(),
      testType: e.testType,
      course: e.course,
      subject: e.subject,
      chapter: e.chapter,
      questionIds: (e.questionIds || []).map((id: any) => id.toString()),
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
      totalQuestions: e.totalQuestions,
      totalMarks: e.totalMarks,
    }));

    // Fetch all exam records for this student
    const studentRecordsRaw = await ExamRecords.find({ email }).lean();
    const studentRecords = studentRecordsRaw.map((r: any) => ({
      ...r,
      examId: r.examId?.toString(),
    }));

    const questionIdsAll = exams.flatMap((e) => e.questionIds);
    const questionsRaw = await QuestionBank.find({ _id: { $in: questionIdsAll } })
      .select("_id subject chapter")
      .lean();
    const questions: QuestionInfo[] = questionsRaw.map((q: any) => ({
      _id: q._id.toString(),
      subject: q.subject,
      chapter: q.chapter,
    }));

    // Map questionId -> {subject, chapter}
    const questionMap = new Map<string, { subject: string; chapter: string }>();
    for (const q of questions) {
      if (q._id && q.subject && q.chapter) {
        questionMap.set(q._id, { subject: q.subject, chapter: q.chapter });
      }
    }

    // Build final response
    const results = exams.map((exam) => {
      const record = studentRecords.find((r) => r.examId === exam._id);

      // auto-update resultStatus if publishAt reached
      let isPublished = false;
      if (record?.resultStatus === "pending" && record.publishAt && new Date(record.publishAt) <= now) {
        record.resultStatus = "published";
        isPublished = true;
      }

      // Build per-question subject/chapter counts
      const subjectChapterCounts: Record<string, number> = {};
      exam.questionIds.forEach((qid) => {
        const info = questionMap.get(qid);
        if (info) {
          const key = `${info.subject} - ${info.chapter}`;
          subjectChapterCounts[key] = (subjectChapterCounts[key] || 0) + 1;
        }
      });

      return {
        examId: exam._id,
        testType: exam.testType,
        course: exam.course,
        subject: exam.subject,
        chapter: exam.chapter,
        startTime: exam.startTime,
        endTime: exam.endTime,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        attended: Boolean(record),
        record: record
          ? {
              correct: record.correct,
              incorrect: record.incorrect,
              unansweredCount: record.unansweredCount,
              score: record.score,
              percentage: record.percentage,
              resultStatus: record.resultStatus,
              questionIds: record.questionIds,
              Answers: record.Answers,
              unanswered: record.unanswered,
            }
          : null,
        subjectChapterCounts,
      };
    });

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Error fetching results:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}