import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import { unstable_noStore as noStore } from "next/cache";

import {
  isLearningSkillId,
} from "@/utils/learningSkills";

export const dynamic = "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* =========================================================
   GET EXAM QUESTIONS
========================================================= */

export async function GET(req: NextRequest) {
  try {
    noStore();
    await connectDB();

    const { searchParams } = new URL(req.url);

    // -----------------------------------------------------
    // PAGINATION
    // -----------------------------------------------------

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 25)
    );

    // -----------------------------------------------------
    // FILTER PARAMETERS
    // -----------------------------------------------------

    const search = searchParams.get("search")?.trim();

    const course = searchParams.get("course")?.trim();

    const subject = searchParams.get("subject")?.trim();

    const chaptersParam = searchParams.get("chapters");

    const type = searchParams.get("type");

    const skill = searchParams.get("skill");

    // -----------------------------------------------------
    // CHAPTERS
    // -----------------------------------------------------

    const chapters = chaptersParam
      ? Array.from(
          new Set(
            chaptersParam
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        )
      : [];

    if (!course || !subject || chapters.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Course, subject and at least one chapter are required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // VALIDATE SKILL FILTER
    // -----------------------------------------------------

    if (
      skill &&
      skill !== "all" &&
      !isLearningSkillId(skill)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid learning skill.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // BASE FILTER
    // -----------------------------------------------------

    const filter: any = {
      course,
      subject,
      chapter: {
        $in: chapters,
      },
      status: "published",
    };

    // -----------------------------------------------------
    // QUESTION TYPE FILTER
    // -----------------------------------------------------

    if (type && type !== "all") {
      filter.type = type;
    }

    // -----------------------------------------------------
    // LEARNING SKILL FILTER
    // -----------------------------------------------------

    if (skill && skill !== "all") {
      filter.skills = skill;
    }

    // -----------------------------------------------------
    // SEARCH
    // -----------------------------------------------------

    if (search) {
      const regex = new RegExp(
        escapeRegex(search),
        "i"
      );

      filter.$or = [
        { "prompt.value": regex },
        { "prompt.url": regex },

        { "options.content.value": regex },
        { "options.content.url": regex },

        { "solution.explanation.value": regex },

        { course: regex },
        { subject: regex },
        { chapter: regex },
        { subtopic: regex },

        { questionId: regex },

        // Also allow searching by stored skill ID.
        { skills: regex },
      ];
    }

    // -----------------------------------------------------
    // PAGINATION CALCULATION
    // -----------------------------------------------------

    const skip = (page - 1) * limit;

    // -----------------------------------------------------
    // DATABASE QUERY
    // -----------------------------------------------------

    const [questions, total] = await Promise.all([
      QuestionBankV2.find(filter)
        .select(
          [
            "_id",
            "questionId",
            "version",

            "course",
            "subject",
            "chapter",
            "subtopic",

            "type",
            "skills",

            "prompt",
            "response",
            "options",
            "answerKey",
            "evaluation",

            "steps",
            "parts",

            "solution",
            "learning",
            "selection",
            "verification",

            "status",
            "createdAt",
          ].join(" ")
        )
        .sort({
          chapter: 1,
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      QuestionBankV2.countDocuments(filter),
    ]);

    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

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
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "Fetch exam questions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to fetch examination questions.",
      },
      { status: 500 }
    );
  }
}