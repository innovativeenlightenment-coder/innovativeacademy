
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import QuestionBankV2 from "@/model/QuestionBankV2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const allowedLevels = [
  "courses",
  "subjects",
  "chapters",
  "subtopics",
] as const;

type Level = (typeof allowedLevels)[number];

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, message, values: [] },
    {
      status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const user = await getLiveUser();

    if (!user) {
      return errorResponse("Please log in first.", 401);
    }

    if (!["teacher", "admin"].includes(user.role)) {
      return errorResponse("Access denied.", 403);
    }

    const params = request.nextUrl.searchParams;

    const rawLevel = params.get("level");
    const course = params.get("course")?.trim() || "";
    const subject = params.get("subject")?.trim() || "";
    const chapter = params.get("chapter")?.trim() || "";

    if (
      !rawLevel ||
      !allowedLevels.includes(rawLevel as Level)
    ) {
      return errorResponse("A valid metadata level is required.", 400);
    }

    const level = rawLevel as Level;

    if (level !== "courses" && !course) {
      return errorResponse("Please select a course first.", 400);
    }

    if (
      (level === "chapters" || level === "subtopics") &&
      !subject
    ) {
      return errorResponse("Please select a subject first.", 400);
    }

    if (level === "subtopics" && !chapter) {
      return errorResponse("Please select a chapter first.", 400);
    }

    await connectDB();

    const filter: Record<string, unknown> = {
      status: { $ne: "archived" },
    };

    if (level !== "courses") {
      filter.course = course;
    }

    if (level === "chapters" || level === "subtopics") {
      filter.subject = subject;
    }

    if (level === "subtopics") {
      filter.chapter = chapter;
    }

    const fieldMap: Record<Level, string> = {
      courses: "course",
      subjects: "subject",
      chapters: "chapter",
      subtopics: "subtopic",
    };

    const rawValues = await QuestionBankV2.distinct(
      fieldMap[level],
      filter
    );

    const values = Array.from(
      new Set(
        rawValues
          .filter(
            (value: unknown): value is string =>
              typeof value === "string" &&
              value.trim().length > 0
          )
          .map((value: string) => value.trim())
      )
    ).sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

    return NextResponse.json(
      {
        success: true,
        level,
        values,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("QUESTION BANK METADATA ERROR:", error);

    return errorResponse(
      "Unable to load Question Bank metadata.",
      500
    );
  }
}
