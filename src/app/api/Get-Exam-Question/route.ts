import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Exams from "@/model/ExamsSchema";
import { unstable_noStore as noStore } from "next/cache";
import mongoose from "mongoose";

type TestType = "monthly" | "quarterly";

export async function GET(req: Request) {
  noStore();
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const course = searchParams.get("course");
    const testType = searchParams.get("testType") as TestType | null;

    // ✅ Fetch single
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
      }

      const exam = await Exams.findById(id).lean();
      if (!exam) {
        return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, exam });
    }

    // ✅ Fetch list
    const filter: Record<string, any> = {};
    if (course) filter.course = course;
    if (testType) filter.testType = testType;

    const exams = await Exams.find(filter).sort({ startTime: -1 }).lean();

    return NextResponse.json({ success: true, exams });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
