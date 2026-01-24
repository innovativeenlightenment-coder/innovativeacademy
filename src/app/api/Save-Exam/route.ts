import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Exams from "@/model/ExamsSchema";
import { unstable_noStore as noStore } from "next/cache";

type TestType = "monthly" | "quarterly";
type ChapterInput = { chapter: string; noOfQuestions: number };

export async function POST(req: Request) {
  noStore();
  await connectDB();

  try {
    const {
      testType,
      course,
      chapters,
      totalQuestions,
      startTime,
      endTime,
    }: {
      testType: TestType;
      course: string;
      chapters: ChapterInput[];
      totalQuestions: number;
      startTime: string; // ISO
      endTime: string;   // ISO
    } = await req.json();

    if (!testType || !course || !chapters || !totalQuestions || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one chapter is required" },
        { status: 400 }
      );
    }

    const st = new Date(startTime);
    const et = new Date(endTime);

    if (Number.isNaN(st.getTime()) || Number.isNaN(et.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid startTime or endTime" },
        { status: 400 }
      );
    }

    if (st >= et) {
      return NextResponse.json(
        { success: false, error: "startTime must be before endTime" },
        { status: 400 }
      );
    }

    const sum = chapters.reduce((a, c) => a + Number(c.noOfQuestions || 0), 0);
    if (sum !== Number(totalQuestions)) {
      return NextResponse.json(
        { success: false, error: "totalQuestions must equal sum of chapter noOfQuestions" },
        { status: 400 }
      );
    }

    const created = await Exams.create({
      testType,
      course: String(course).trim(),
      chapters: chapters.map((c) => ({
        chapter: String(c.chapter).trim(),
        noOfQuestions: Number(c.noOfQuestions),
      })),
      totalQuestions: Number(totalQuestions),
      startTime: st,
      endTime: et,
    });

    return NextResponse.json({ success: true, exam: created });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
