import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ExamRecords from "@/model/ExamRecordSchema";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const records = await ExamRecords.find({ "student.email": email })
      .sort({ createdAt: -1 })
      .lean();

    const now = Date.now();

    const ongoing: any[] = [];
    const completed: any[] = [];
    const pendingResults: any[] = [];
    const publishedResults: any[] = [];

    for (const record of records) {
      const publishAt = record.publishAt
        ? new Date(record.publishAt).getTime()
        : null;

      const published =
        record.resultStatus === "published" ||
        (publishAt !== null &&
          Number.isFinite(publishAt) &&
          publishAt <= now);

      if (published) {
        publishedResults.push(record);
      } else {
        pendingResults.push(record);
      }

      // These lists describe record timing only.
      // The student examination page uses exam schedule
      // and submission records for its final categorization.

      const createdAt = new Date(record.createdAt).getTime();

      const durationMinutes = Number(record.duration || 0);

      const recordEndTime =
        createdAt + durationMinutes * 60 * 1000;

      if (
        Number.isFinite(recordEndTime) &&
        recordEndTime > now
      ) {
        ongoing.push(record);
      } else {
        completed.push(record);
      }
    }

    return NextResponse.json(
      {
        success: true,
        total: records.length,

        // Important: the page uses this property.
        records,

        ongoing,
        completed,

        pendingResults,
        publishedResults,

        counts: {
          total: records.length,
          ongoing: ongoing.length,
          completed: completed.length,
          pendingResults: pendingResults.length,
          publishedResults: publishedResults.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Exam Record API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch examination records.",
      },
      { status: 500 }
    );
  }
}