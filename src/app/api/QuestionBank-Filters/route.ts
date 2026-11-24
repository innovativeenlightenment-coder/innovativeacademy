import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    noStore();
    await connectDB();

    const { searchParams } = new URL(req.url);

    const course = searchParams.get("course")?.trim();
    const subject = searchParams.get("subject")?.trim();

    const status = searchParams.get("status") || "published";

    const baseFilter: any = {};

    if (status !== "all") {
      baseFilter.status = status;
    }

    const courses = await QuestionBankV2.distinct(
      "course",
      {
        ...baseFilter,
        course: { $exists: true, $nin: ["", null] },
      }
    );

    let subjects: string[] = [];
    let chapters: any[] = [];

    if (course) {
      subjects = await QuestionBankV2.distinct("subject", {
        ...baseFilter,
        course,
        subject: { $exists: true, $nin: ["", null] },
      });
    }

    if (course && subject) {
      chapters = await QuestionBankV2.aggregate([
        {
          $match: {
            ...baseFilter,
            course,
            subject,
            chapter: { $exists: true, $nin: ["", null] },
          },
        },
        {
          $group: {
            _id: "$chapter",
            questionCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id",
            questionCount: 1,
          },
        },
        {
          $sort: { name: 1 },
        },
      ]);
    }

    return NextResponse.json(
      {
        success: true,
        courses: courses.sort((a, b) =>
          String(a).localeCompare(String(b))
        ),
        subjects: subjects.sort((a, b) =>
          String(a).localeCompare(String(b))
        ),
        chapters,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Question bank filters error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load filters.",
      },
      { status: 500 }
    );
  }
}