import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(req: Request) {
  noStore();
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // single
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
      }

      const exam = await TeacherExamPaper.findById(id)
        .populate("questionIds") // optional: if you want full question details
        .lean();

      if (!exam) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, exam });
    }

    // list
    const exams = await TeacherExamPaper.find({})
      .sort({ startTime: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ success: true, exams });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
