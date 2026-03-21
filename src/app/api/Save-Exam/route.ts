import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

type TestType = "monthly" | "quarterly";

export async function POST(req: Request) {
  noStore();
  await connectDB();

  try {
    const {
      testType,
      teacherName,
      startTime,
      endTime,
      secondsPerQuestion = 20,
      questionIds,
      course,
      subject,
      chapter,
    }: {
      testType: TestType;
      teacherName: string;
      startTime: string; // ISO
      endTime: string;   // ISO
      secondsPerQuestion?: number;
      questionIds: string[];
      course?: string;
      subject?: string;
      chapter?: string;
    } = await req.json();

    if (!testType || !teacherName || !startTime || !endTime || !questionIds?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
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

    // validate ids
    for (const id of questionIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: `Invalid questionId: ${id}` },
          { status: 400 }
        );
      }
    }

    const created = await TeacherExamPaper.create({
      testType,
      teacherName: String(teacherName).trim(),
      startTime: st,
      endTime: et,
      secondsPerQuestion: Number(secondsPerQuestion),
      totalQuestions: questionIds.length,
      totalMarks:questionIds.length * 4,
      questionIds: questionIds.map((id) => new mongoose.Types.ObjectId(id)),
      course: course ? String(course).trim() : undefined,
      subject: subject ? String(subject).trim() : undefined,
      chapter: chapter ? String(chapter).trim() : undefined,
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
