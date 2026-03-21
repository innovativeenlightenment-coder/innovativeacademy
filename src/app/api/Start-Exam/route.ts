import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import QuestionBank from "@/model/QuestionBankSchema";
import TestRecords from "@/model/TestRecordSchema";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

type TestType = "monthly" | "quarterly";

export async function POST(req: Request) {
  noStore();
  await connectDB();

  try {
    /* ================= AUTH (COOKIE) ================= */
    const base = process.env.NEXT_PUBLIC_BASE_URL;

    const userRes = await fetch(`${base}/api/auth/Get-Current-User`, {
      method: "GET",
      headers: { cookie: req.headers.get("cookie") || "" },
      cache: "no-store",
    });

    const userJson = await userRes.json();

    if (!userJson?.success || !userJson?.user?.email) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
    }

    const email = String(userJson.user.email).toLowerCase();

    /* ================= BODY ================= */
    const body: { examId?: string } = await req.json();
    const examId = String(body.examId || "").trim();

    if (!examId) {
      return NextResponse.json({ success: false, error: "Missing examId" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ success: false, error: "Invalid examId" }, { status: 400 });
    }

    /* ================= GET EXAM (SINGLE DOC) ================= */
    const exam = (await TeacherExamPaper.findById(examId).lean()) as any;  // ✅ returns object | null

    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    // ✅ now TS knows exam is a SINGLE object (not array)
    const startMs = new Date(exam.startTime).getTime();
    const endMs = new Date(exam.endTime).getTime();
    const now = Date.now();

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      return NextResponse.json({ success: false, error: "Invalid exam time window" }, { status: 400 });
    }

    if (now < startMs) {
      return NextResponse.json({ success: false, error: "Exam not started yet" }, { status: 400 });
    }

    if (now > endMs) {
      return NextResponse.json({ success: false, error: "Exam window closed" }, { status: 400 });
    }

    /* ================= BLOCK IF ALREADY SUBMITTED =================
       NO examId in records, so we match: email + testType + course + createdAt within window
    */
    const alreadySubmitted = await TestRecords.exists({
      email,
      testType: exam.testType as TestType,
      course: exam.course,
      createdAt: { $gte: new Date(exam.startTime), $lte: new Date(exam.endTime) },
    });

    if (alreadySubmitted) {
      return NextResponse.json({ success: false, error: "Exam already submitted" }, { status: 400 });
    }

    /* ================= QUESTIONS ================= */
    const rawIds: string[] = Array.isArray(exam.questionIds) ? exam.questionIds.map(String) : [];

    if (rawIds.length === 0) {
      return NextResponse.json({ success: false, error: "No questions in exam" }, { status: 400 });
    }

    // Validate & convert
    const objIds: mongoose.Types.ObjectId[] = rawIds.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid questionId: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const docs = await QuestionBank.find({ _id: { $in: objIds } }).lean();

    // keep order as exam.questionIds
    const map = new Map<string, any>();
    for (const d of docs) map.set(String(d._id), d);

    const questions = rawIds
      .map((id, i) => {
        const q = map.get(id);
        return q ? { ...q, qNo: i + 1 } : null;
      })
      .filter(Boolean);

    if (questions.length === 0) {
      return NextResponse.json({ success: false, error: "Questions not found" }, { status: 400 });
    }

    /* ================= DURATION ================= */
    const secondsPerQuestion = Number(exam.secondsPerQuestion ?? 20);
    const durationSec = secondsPerQuestion * questions.length;

    return NextResponse.json({
      success: true,
      exam: {
        examId ,
        email,
        testType: exam.testType,
        teacherName: exam.teacherName,
        course: exam.course,
        startTime: exam.startTime,
        endTime: exam.endTime,
        totalQuestions: questions.length,
        secondsPerQuestion,
        durationSec,
      },
      questions,
    });
  } catch (err: any) {
    console.error(err);
    // if invalid questionId threw Error above
    if (String(err?.message || "").startsWith("Invalid questionId:")) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
