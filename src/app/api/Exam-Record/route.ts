// app/api/exam-record/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import ExamRecords from "@/model/ExamRecordSchema";

type LeanExamRecord = {
  _id: string;
  createdAt: string | Date;
  duration: number; // minutes
  timeLeft: number; // seconds or minutes
  resultStatus: "pending" | "published";
  publishAt: string | Date | null;
};

function toMs(val: number, unit: "minutes" | "seconds") {
  return unit === "minutes" ? val * 60 * 1000 : val * 1000;
}

function guessTimeLeftUnit(durationMinutes: number, timeLeft: number): "minutes" | "seconds" {
  if (timeLeft > durationMinutes) return "seconds";
  return "minutes";
}

function isOngoing(rec: LeanExamRecord) {
  const startedAt = new Date(rec.createdAt).getTime();
  const durationMs = toMs(rec.duration, "minutes");

  const unit = guessTimeLeftUnit(rec.duration, rec.timeLeft);
  const timeLeftMs = toMs(rec.timeLeft, unit);

  const endAt = startedAt + durationMs;
  return timeLeftMs > 0 && Date.now() < endAt;
}

function isPublishedNow(rec: LeanExamRecord) {
  if (rec.resultStatus === "published") return true;
  if (!rec.publishAt) return false;
  return new Date(rec.publishAt).getTime() <= Date.now();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const records = (await ExamRecords.find({ email })
      .sort({ createdAt: -1 })
      .lean()) as any[];

    const ongoing: any[] = [];
    const completed: any[] = [];
    const pendingResults: any[] = [];
    const publishedResults: any[] = [];

    for (const r of records) {
      const rec = r as LeanExamRecord;

      if (isOngoing(rec)) ongoing.push(r);
      else completed.push(r);

      if (isPublishedNow(rec)) publishedResults.push(r);
      else pendingResults.push(r);
    }

    return NextResponse.json({
      success: true,
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
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
