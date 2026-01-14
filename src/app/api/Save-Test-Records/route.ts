import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TestRecords from "@/model/TestRecordSchema";
import { unstable_noStore as noStore } from "next/cache";

/* ================= TYPES ================= */

type AnswerPayload = {
  id: string;
  ans: string;
  selected: string;
};

type SavePayload = {
  correct: number;
  incorrect: number;
  unanswered: AnswerPayload[];
  Answers: AnswerPayload[];
  level: "easy" | "moderate" | "difficult" | "extreme";
  score: number;
  percentage: number;
  username?: string;
  name?: string;
  testType:string;
  email: string;
  course: string;
  subject: string;
  chapter: string;
};

/* ================= API ================= */

export async function POST(req: Request) {
  noStore();
  await connectDB();

  try {
    const body: SavePayload = await req.json();

    const {
      correct,
      incorrect,
      unanswered,
      Answers,
      level,
      score,
      percentage,
      email,
      course,
      subject,
      testType,
      chapter,
      username = "student",
      name = "student",
    } = body;

    /* ================= VALIDATION ================= */

    if (
      !email ||
      !course ||
      !subject ||
      !chapter ||
      !Array.isArray(Answers)
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ================= SAVE RECORD ================= */

    const record = await TestRecords.create({
      correct,
      incorrect,
      unanswered,
      Answers,
      level, 
      testType,             // ⭐ IMPORTANT for level upgrade logic
      score,
      percentage,
      username,
      name,
      email,
      course,
      subject,
      chapter,
    });

    return NextResponse.json({
      success: true,
      recordId: record._id,
    });

  } catch (err) {
    console.error("Save TestRecord error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
