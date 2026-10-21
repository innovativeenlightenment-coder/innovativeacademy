import { connectDB } from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
import QuestionBankSchema from "@/model/QuestionBankSchema";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function positiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(req: NextRequest) {
  try {
    noStore();
    await connectDB();

    const params = req.nextUrl.searchParams;
    const page = positiveInt(params.get("page"), 1);
    const limit = Math.min(100, positiveInt(params.get("limit"), 25));

    const search = (params.get("search") || "").trim().slice(0, 150);
    const course = (params.get("course") || "").trim();
    const subject = (params.get("subject") || "").trim();
    const chapter = (params.get("chapter") || "").trim();
    const level = (params.get("level") || "").trim();
    const fromDate = (params.get("fromDate") || "").trim();
    const toDate = (params.get("toDate") || "").trim();

    const filter: Record<string, any> = {};
    if (course) filter.course = course;
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (level) filter.level = level;

    // Filter by createdAt. The end date is inclusive by using the next day as $lt.
    const dateRange: Record<string, Date> = {};
    if (fromDate && /^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
      const start = new Date(`${fromDate}T00:00:00.000Z`);
      if (!Number.isNaN(start.getTime())) dateRange.$gte = start;
    }
    if (toDate && /^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
      const endExclusive = new Date(`${toDate}T00:00:00.000Z`);
      if (!Number.isNaN(endExclusive.getTime())) {
        endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
        dateRange.$lt = endExclusive;
      }
    }
    if (Object.keys(dateRange).length) filter.createdAt = dateRange;

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { "question.text": regex },
        { "hint.text": regex },
        { "options.text": regex },
        { subject: regex },
        { chapter: regex },
        { course: regex },
        { uploadedBy: regex },
      ];
    }

    const [questions, total] = await Promise.all([
      QuestionBankSchema.find(filter)
        .select(
          "_id questionType question hint hintType optionType options answer level course subject chapter uploadedBy createdAt updatedAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      QuestionBankSchema.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Fetch question bank error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch questions." },
      { status: 500 }
    );
  }
}
