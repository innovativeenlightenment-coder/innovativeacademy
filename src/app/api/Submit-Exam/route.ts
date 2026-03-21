// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongoose";
// import ExamRecords from "@/model/ExamRecordSchema";
// import { unstable_noStore as noStore } from "next/cache";
// import { getCurrentUser } from "@/lib/getCurrentUser";

// type AnswerPayload = {
//   id: string;
//   ans: string;
//   selected: string;
// };

// type ExamSubmitPayload = {
//   correct: number;
//   incorrect: number;
//   unanswered: AnswerPayload[];
//   Answers: AnswerPayload[];

//   score: number;
//   percentage: number;

//   username?: string;
//   name?: string;

//   testType: string;
//   email: string;

//   duration: number;
//   timeLeft: number;

//   course: string;

//   // ✅ optional extras
//   questionIds?: string[];

//   // ✅ if you still sometimes have them, keep optional
//   subject?: string;
//   chapter?: string;
// };

// export async function POST(req: Request) {
//   noStore();
//   await connectDB();

//   try {
//     const body: ExamSubmitPayload = await req.json();

//     const {
//       correct,
//       incorrect,
//       unanswered,
//       Answers,
//       score,
//       percentage,
//       duration,
//       timeLeft,
//       email,
//       course,
//       testType,
//       questionIds = [],
//  username,
//  name,

//       // optional
//       // subject,
//       // chapter,
//     } = body;

  
//     // ✅ basic validation (removed subject/chapter)
//     if (
//       !email ||
//       !course ||
//       !testType ||
//       !Array.isArray(Answers) ||
//       !Array.isArray(unanswered)
//     ) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // ✅ publish next day 9:00 AM (optional)
//     const publishAt = new Date();
//     publishAt.setDate(publishAt.getDate() + 1);
//     publishAt.setHours(9, 0, 0, 0);

//     const record = await ExamRecords.create({
//       correct,
//       incorrect,
//       unanswered,
//       Answers,
//       score,
//       percentage,

//       username,
//       name,
//       email,

//       testType,
//       course,

//       // only store if provided
//       // ...(subject ? { subject } : {}),
//       // ...(chapter ? { chapter } : {}),

//       duration,
//       timeLeft,

//       questionIds,

//       resultStatus: "pending",
//       publishAt,
//     });

//     return NextResponse.json({
//       success: true,
//       recordId: record._id,
//       message: "Exam submitted. Result will be available tomorrow.",
//     });
//   } catch (err) {
//     console.error("Exam submit error:", err);
//     return NextResponse.json(
//       { success: false, error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ExamRecords from "@/model/ExamRecordSchema";
import { unstable_noStore as noStore } from "next/cache";

type AnswerPayload = {
  id: string;
  ans: string;
  selected: string;
};

type ExamSubmitPayload = {
  correct: number;
  incorrect: number;
  unanswered: AnswerPayload[];
  Answers: AnswerPayload[];

  score: number;
  percentage: number;

  username?: string;
  name?: string;

  testType: string;
  email: string;

  duration: number;
  timeLeft: number;

  course: string;
  questionIds: string[];

  // new required field
  examId: string;

  // optional
  subject?: string;
  chapter?: string;
};

export async function POST(req: Request) {
  noStore();
  await connectDB();

  try {
    const body: ExamSubmitPayload = await req.json();

    const {
      correct,
      incorrect,
      unanswered,
      Answers,
      duration,
      timeLeft,
      email,
      course,
      testType,
      questionIds,
     examId,
      username,
      name,
    } = body;
// sessionStorage.getItem("currentTest")
    // ✅ basic validation
    if (
      !email ||
      !course ||
      !testType ||
      !Array.isArray(Answers) ||
      !Array.isArray(questionIds)
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Calculate totals
    const totalQuestions = questionIds.length;
    const marksPerQuestion = 4;
    const totalMarks = totalQuestions * marksPerQuestion;
    const unansweredCount = totalQuestions - (correct + incorrect);

    const score = (correct * marksPerQuestion)-incorrect; // change if negative marking applies
    const percentage = (score / totalMarks) * 100;

    // ✅ publish next day 9:00 AM (optional)
    const publishAt = new Date();
    publishAt.setDate(publishAt.getDate() + 1);
    publishAt.setHours(9, 0, 0, 0);

    const record = await ExamRecords.create({
      correct,
      incorrect,
      unanswered,
      Answers,
      score,
      percentage,

      username,
      name,
      email,

      testType,
      course,

      // new required fields
      examId,
      totalQuestions,
      totalMarks,
      unansweredCount,

      duration,
      timeLeft,
      questionIds,

      resultStatus: "pending",
      publishAt,
    });

    return NextResponse.json({
      success: true,
      recordId: record._id,
      message: "Exam submitted. Result will be available tomorrow.",
    });
  } catch (err) {
    console.error("Exam submit error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}