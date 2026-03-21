import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

type TestType = "monthly" | "quarterly";

export async function PATCH(req: Request) {
  noStore();
  await connectDB();

  try {
    const body: Partial<{
      id: string;
      testType: TestType;
      teacherName: string;
      startTime: string;
      endTime: string;
      secondsPerQuestion: number;
      questionIds: string[];
      course?: string;
      subject?: string;
      chapter?: string;
    }> = await req.json();

    if (!body.id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(body.id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const existing = (await TeacherExamPaper.findById(body.id).lean()) as any;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const update: any = {};
    if (body.testType) update.testType = body.testType;
    if (body.teacherName) update.teacherName = String(body.teacherName).trim();
    if (typeof body.secondsPerQuestion === "number") update.secondsPerQuestion = body.secondsPerQuestion;
    if (body.course !== undefined) update.course = body.course ? String(body.course).trim() : undefined;
    if (body.subject !== undefined) update.subject = body.subject ? String(body.subject).trim() : undefined;
    if (body.chapter !== undefined) update.chapter = body.chapter ? String(body.chapter).trim() : undefined;

    if (body.startTime) {
      const st = new Date(body.startTime);
      if (Number.isNaN(st.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid startTime" }, { status: 400 });
      }
      update.startTime = st;
    }
    if (body.endTime) {
      const et = new Date(body.endTime);
      if (Number.isNaN(et.getTime())) {
        return NextResponse.json({ success: false, error: "Invalid endTime" }, { status: 400 });
      }
      update.endTime = et;
    }

    if (body.questionIds) {
      if (!Array.isArray(body.questionIds) || body.questionIds.length === 0) {
        return NextResponse.json({ success: false, error: "questionIds required" }, { status: 400 });
      }

      for (const id of body.questionIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return NextResponse.json({ success: false, error: `Invalid questionId: ${id}` }, { status: 400 });
        }
      }

      update.questionIds = body.questionIds.map((id) => new mongoose.Types.ObjectId(id));
      update.totalQuestions = body.questionIds.length;
    }

    const finalStart = update.startTime ?? existing.startTime;
    const finalEnd = update.endTime ?? existing.endTime;
    if (new Date(finalStart) >= new Date(finalEnd)) {
      return NextResponse.json(
        { success: false, error: "startTime must be before endTime" },
        { status: 400 }
      );
    }

    const updated = await TeacherExamPaper.findByIdAndUpdate(body.id, update, { new: true }).lean();
    return NextResponse.json({ success: true, exam: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
