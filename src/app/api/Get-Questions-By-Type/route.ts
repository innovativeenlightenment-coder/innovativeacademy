// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongoose";
// import QuestionBank from "@/model/QuestionBankSchema";
// import TestRecords from "@/model/TestRecordSchema";
// import { unstable_noStore as noStore } from "next/cache";

// /* ================= TYPES ================= */

// type Level = "easy" | "moderate" | "difficult" | "extreme";
// type TestType = "practice" | "monthly" | "quarterly";

// /* ================= CONSTANTS ================= */

// const LEVELS: Level[] = ["easy", "moderate", "difficult", "extreme"];

// const DIFFICULTY_WEIGHT: Record<Level, number> = {
//   easy: 1.0,
//   moderate: 1.5,
//   difficult: 2.2,
//   extreme: 3.0,
// };

// /* Practice adaptive mix */
// const DIFFICULTY_MIX: Record<Level, Record<Level, number>> = {
//   easy: { easy: 0.8, moderate: 0.2, difficult: 0, extreme: 0 },
//   moderate: { easy: 0.3, moderate: 0.6, difficult: 0.1, extreme: 0 },
//   difficult: { easy: 0, moderate: 0.35, difficult: 0.5, extreme: 0.15 },
//   extreme: { easy: 0, moderate: 0.2, difficult: 0.4, extreme: 0.4 },
// };

// /* Monthly / Quarterly fixed mix */
// const EXAM_MIX: Record<Level, number> = {
//   easy: 0.25,
//   moderate: 0.35,
//   difficult: 0.25,
//   extreme: 0.15,
// };

// /* ================= LEVEL CONVERTERS ================= */

// const FROM_DB_LEVEL = (dbLevel?: string): Level => {
//   if (!dbLevel) return "easy";
//   const l = dbLevel.toLowerCase();
//   if (l.includes("easy")) return "easy";
//   if (l.includes("moderate")) return "moderate";
//   if (l.includes("difficult")) return "difficult";
//   if (l.includes("extreme")) return "extreme";
//   return "easy";
// };

// const TO_DB_LEVEL: Record<Level, string> = {
//   easy: "Easy",
//   moderate: "Moderate",
//   difficult: "Difficult",
//   extreme: "Extreme",
// };

// /* ================= API ================= */

// export async function POST(req: Request) {
//   noStore();
//   await connectDB();

//   try {
//     const {
//       testType,
//       course,
//       subject,
//       chapter,
//       email,
//     }: {
//       testType: TestType;
//       course: string;
//       subject: string;
//       chapter: string;
//       email: string;
//     } = await req.json();

//     if (!testType || !course || !subject || !chapter || !email) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     /* ================= PRACTICE LEVEL LOGIC ================= */

//     let finalLevel: Level = "easy";
//     let avgScore = 0;

//     if (testType === "practice") {
//       const records = await TestRecords.find({
//         email,
//         course,
//         subject,
//         chapter,
//       })
//         .sort({ createdAt: -1 })
//         .limit(3)
//         .lean();

//       // last level
//       const lastWithLevel = records.find((r) => r.level);
//       if (lastWithLevel) {
//         finalLevel = FROM_DB_LEVEL(lastWithLevel.level);
//       }

//       let scores: number[] = [];
//       let eligibleForLevelUp = true;

//       for (const r of records) {
//         const logicLevel = FROM_DB_LEVEL(r.level);

//         const answered = r.correct + r.incorrect;
//         const total = answered + r.unanswered.length;
//         if (total === 0) continue;

//         const attemptRatio = answered / total;
//         if (attemptRatio < 0.6) {
//           eligibleForLevelUp = false;
//           break;
//         }

//         const accuracy = answered > 0 ? r.correct / answered : 0;
//         const weight = DIFFICULTY_WEIGHT[logicLevel];
//         scores.push(accuracy * weight);
//       }

//       avgScore =
//         scores.length > 0
//           ? scores.reduce((a, b) => a + b, 0) / scores.length
//           : 0;

//       // level up
//       if (eligibleForLevelUp && avgScore >= 0.9) {
//         const idx = LEVELS.indexOf(finalLevel);
//         if (idx < LEVELS.length - 1) {
//           finalLevel = LEVELS[idx + 1];
//         }
//       }
//     }

//     /* ================= QUESTION COUNT ================= */

//     const TOTAL_QUESTIONS =
//       testType === "practice" ? 25 : testType === "monthly" ? 60 : 90;

//     /* ================= SELECT MIX ================= */

//     const mix =
//       testType === "practice" ? DIFFICULTY_MIX[finalLevel] : EXAM_MIX;

//     /* ================= FETCH QUESTIONS ================= */

//     let questions: any[] = [];

//     for (const [level, ratio] of Object.entries(mix) as [
//       Level,
//       number
//     ][]) {
//       const count = Math.round(TOTAL_QUESTIONS * ratio);
//       if (count <= 0) continue;

//       const qs = await QuestionBank.aggregate([
//         {
//           $match: {
//             course,
//             subject,
//             chapter,
//             level: TO_DB_LEVEL[level], // ✅ FIX
//           },
//         },
//         { $sample: { size: count } },
//       ]);

//       questions.push(...qs);
//     }

//     questions = questions
//       .sort(() => Math.random() - 0.5)
//       .map((q, i) => ({ ...q, qNo: i + 1 }));

//     /* ================= RESPONSE ================= */

//     return NextResponse.json({
//       success: true,
//       hasQuestions: questions.length > 0,
//       testType,
//       chapterLevel: testType === "practice" ? finalLevel : null,
//       totalQuestions: questions.length,
//       questions,
//       avgScore,
//     });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import QuestionBank from "@/model/QuestionBankSchema";
import TestRecords from "@/model/TestRecordSchema";
import { unstable_noStore as noStore } from "next/cache";

/* ================= TYPES ================= */

type Level = "easy" | "moderate" | "difficult" | "extreme";
type TestType = "practice" | "monthly" | "quarterly";

/* ================= CONSTANTS ================= */

const LEVELS: Level[] = ["easy", "moderate", "difficult", "extreme"];

const DIFFICULTY_WEIGHT: Record<Level, number> = {
  easy: 1.0,
  moderate: 1.5,
  difficult: 2.2,
  extreme: 3.0,
};

/* Practice adaptive mix */
const DIFFICULTY_MIX: Record<Level, Record<Level, number>> = {
  easy: { easy: 0.65, moderate: 0.2, difficult: 0.1, extreme: 0.05 },
  moderate: { easy: 0.15, moderate: 0.6, difficult: 0.15, extreme: 0.1 },
  difficult: { easy: 0.1, moderate: 0.35, difficult: 0.4, extreme: 0.15 },
  extreme: { easy: 0.1, moderate: 0.2, difficult: 0.4, extreme: 0.3 },
};

/* Monthly / Quarterly fixed mix */
const EXAM_MIX: Record<Level, number> = {
  easy: 0.25,
  moderate: 0.35,
  difficult: 0.25,
  extreme: 0.15,
};

/* ================= LEVEL CONVERTERS ================= */

const FROM_DB_LEVEL = (dbLevel?: string): Level => {
  if (!dbLevel) return "easy";
  const l = dbLevel.toLowerCase();
  if (l.includes("easy")) return "easy";
  if (l.includes("moderate")) return "moderate";
  if (l.includes("difficult")) return "difficult";
  if (l.includes("extreme")) return "extreme";
  return "easy";
};

const TO_DB_LEVEL: Record<Level, string> = {
  easy: "Easy",
  moderate: "Moderate",
  difficult: "Difficult",
  extreme: "Extreme",
};

/* ================= API ================= */

export async function POST(req: Request) {
  noStore();
  await connectDB();

  try {
    const {
      testType,
      course,
      subject,
      chapter,
      email,
    }: {
      testType: TestType;
      course: string;
      subject: string;
      chapter: string;
      email: string;
    } = await req.json();

    if (!testType || !course || !subject || !chapter || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ================= PRACTICE LEVEL LOGIC ================= */

    let finalLevel: Level = "easy";
    let avgScore = 0;

    if (testType === "practice") {
      const records = await TestRecords.find({
        email,
        course,
        subject,
        chapter,
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      // ✅ FIX: pick the latest record with level
      const latestRecordWithLevel = records.find(r => r.level);
      if (latestRecordWithLevel) {
        finalLevel = FROM_DB_LEVEL(latestRecordWithLevel.level);
      }

      let scores: number[] = [];
      let eligibleForLevelUp = true;

      for (const r of records) {
        const logicLevel = FROM_DB_LEVEL(r.level);

        const answered = r.correct + r.incorrect;
        const total = answered + r.unanswered.length;
        if (total === 0) continue;

        const attemptRatio = answered / total;
        console.log(attemptRatio)
        if (attemptRatio < 0.65) {
          eligibleForLevelUp = false;
          break;
        }

        const accuracy = answered > 0 ? r.correct / answered : 0;
        const weight = DIFFICULTY_WEIGHT[logicLevel];
        scores.push(accuracy * weight);
      }
console.log(scores)
      avgScore =
        scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
console.log(eligibleForLevelUp, avgScore)
      // level up
      if (eligibleForLevelUp && avgScore >= 0.85) {
        const idx = LEVELS.indexOf(finalLevel);
        if (idx < LEVELS.length - 1) {
          finalLevel = LEVELS[idx + 1];
        }
      }
    }

    /* ================= QUESTION COUNT ================= */

    const TOTAL_QUESTIONS =
      testType === "practice" ? 30 : testType === "monthly" ? 120 : 240;

    /* ================= SELECT MIX ================= */

    const mix =
      testType === "practice" ? DIFFICULTY_MIX[finalLevel] : EXAM_MIX;

    /* ================= FETCH QUESTIONS ================= */

    let questions: any[] = [];

    for (const [level, ratio] of Object.entries(mix) as [
      Level,
      number
    ][]) {
      const count = Math.round(TOTAL_QUESTIONS * ratio);
      if (count <= 0) continue;

      const qs = await QuestionBank.aggregate([
        {
          $match: {
            course,
            subject,
            chapter,
            level: TO_DB_LEVEL[level],
          },
        },
        { $sample: { size: count } },
      ]);

      questions.push(...qs);
    }

    questions = questions
      .sort(() => Math.random() - 0.5)
      .map((q, i) => ({ ...q, qNo: i + 1 }));

    /* ================= RESPONSE ================= */

    return NextResponse.json({
      success: true,
      hasQuestions: questions.length > 0,
      testType,
      chapterLevel: testType === "practice" ? finalLevel : null,
      totalQuestions: questions.length,
      questions,
      avgScore,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
