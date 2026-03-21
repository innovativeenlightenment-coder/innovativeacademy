// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongoose";
// import ExamRecords from "@/model/ExamRecordSchema";
// import TeacherExamPaper from "@/model/TeacherExamSchema";
// import QuestionBankSchema from "@/model/QuestionBankSchema";
// import mongoose from "mongoose";
// import { unstable_noStore as noStore } from "next/cache";

// export async function GET(req: Request) {
//   noStore();
//   await connectDB();

//   try {
//     const url = new URL(req.url);
//     const recordId = url.searchParams.get("recordId");
//     const email = url.searchParams.get("email");

//     if (!recordId && !email) {
//       return NextResponse.json(
//         { success: false, error: "recordId or email is required" },
//         { status: 400 }
//       );
//     }

//     // ✅ fetch student record
//     const recordRaw = await ExamRecords.findById(recordId).lean();
//     const record: any = recordRaw; // <-- cast to any to fix TS
//     if (!record) {
//       return NextResponse.json(
//         { success: false, error: "Exam record not found" },
//         { status: 404 }
//       );
//     }

//     // ✅ fetch exam info
//     const examRaw = await TeacherExamPaper.findById(record.examId)
//       .populate("questionIds")
//       .lean();
//     const exam: any = examRaw; // <-- cast to any to fix TS
//     if (!exam) {
//       return NextResponse.json(
//         { success: false, error: "Exam info not found" },
//         { status: 404 }
//       );
//     }

//     // ✅ build question map for subject/chapter
//     const questions = (exam.questionIds || []).map((q: any) => ({
//       _id: q._id.toString(),
//       subject: q.subject,
//       chapter: q.chapter,
//       answer: q.answer,
//       questionType: q.questionType,
//       optionType: q.optionType,
//     }));

//     const questionMap = new Map<string, { subject: string; chapter: string; answer: string }>();
//     for (const q of questions) {
//       questionMap.set(q._id, { subject: q.subject, chapter: q.chapter, answer: q.answer });
//     }

//     // ✅ calculate marks per subject
//     const subjectMarks: Record<string, { correct: number; total: number }> = {};
//     for (const a of record.Answers) {
//       const q = questionMap.get(a.id);
//       if (!q) continue;

//       if (!subjectMarks[q.subject]) subjectMarks[q.subject] = { correct: 0, total: 0 };
//       subjectMarks[q.subject].total += 4; // 4 marks per question
//       if (a.selected === q.answer) subjectMarks[q.subject].correct += 4;
//     }

//     // ✅ calculate rank & topper list
//     const allRecordsRaw = await ExamRecords.find({ examId: exam._id }).sort({ score: -1 }).lean();
//     const allRecords: any[] = allRecordsRaw.map((r: any) => ({ ...r, _id: r._id.toString() }));
//     const studentIndex = allRecords.findIndex((r) => r._id === record._id.toString());
//     const rank = studentIndex + 1;
//     const topperList = allRecords.slice(0, 5).map((r) => ({
//       name: r.name,
//       score: r.score,
//       percentage: r.percentage,
//     }));

//     // ✅ return all
//     return NextResponse.json({
//       success: true,
//       exam: {
//         _id: exam._id.toString(),
//         testType: exam.testType,
//         course: exam.course,
//         totalQuestions: exam.totalQuestions,
//         totalMarks: exam.totalQuestions * 4,
//         startTime: exam.startTime,
//         endTime: exam.endTime,
//       },
//       record,
//       questions,
//       subjectMarks,
//       rank,
//       topperList,
//     });
//   } catch (err) {
//     console.error("Exam detail error:", err);
//     return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
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
    // 2️⃣ Get Exam Paper
    // ==========================================================
    const exam: any = await TeacherExamPaper.findById(examId).lean();

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found" },
        { status: 404 }
      );
    }

    const totalQuestions = exam.totalQuestions;
    const totalMarks = exam.totalMarks;

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
    // 4️⃣ Score Distribution (for Pie Chart)
    // ==========================================================
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    allRecords.forEach((r) => {
      const percent =
        totalMarks > 0 ? (r.score / totalMarks) * 100 : 0;

      if (percent >= 70) highCount++;
      else if (percent >= 40) mediumCount++;
      else lowCount++;
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

      // 👇 New Fields For Frontend
      topperList,
      highCount,
      mediumCount,
      lowCount,
    });
  } catch (error) {
    console.error("Exam Result Details Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}