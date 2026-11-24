import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  noStore();

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const courseParams = searchParams.getAll("course");

    // --------------------------------
    // FETCH SINGLE EXAM
    // --------------------------------

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid exam ID.",
          },
          { status: 400 }
        );
      }

      const exam = await TeacherExamPaper.findById(id)
        .populate("questionIds")
        .lean();

      if (!exam) {
        return NextResponse.json(
          {
            success: false,
            error: "Exam not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          exam,
        },
        { status: 200 }
      );
    }

    // --------------------------------
    // FETCH EXAMS
    // --------------------------------

   const courses = Array.from(
  new Set(
    courseParams
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean)
  )
);

    const filter: Record<string, any> = {};

    if (courses.length > 0) {
      filter.course = { $in: courses };
    }

    const exams = await TeacherExamPaper.find(filter)
      .sort({ startTime: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        total: exams.length,
        exams,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get Exam API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch examinations.",
      },
      { status: 500 }
    );
  }
}