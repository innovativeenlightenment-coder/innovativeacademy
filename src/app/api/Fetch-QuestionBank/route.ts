import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import { unstable_noStore as noStore } from "next/cache";
import { isLearningSkillId } from "@/utils/learningSkills";

export const dynamic = "force-dynamic";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    noStore();

    await connectDB();

    const { searchParams } = new URL(req.url);

    // -----------------------------
    // PAGINATION
    // -----------------------------

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number(searchParams.get("limit")) || 25
      )
    );

    const skip = (page - 1) * limit;

    // -----------------------------
    // QUERY PARAMETERS
    // -----------------------------

    const search = searchParams.get("search")?.trim();

    const course = searchParams.get("course");
    const subject = searchParams.get("subject");
    const chapter = searchParams.get("chapter");
    const subtopic = searchParams.get("subtopic");

    const type = searchParams.get("type");
    const skill = searchParams.get("skill");

    const status = searchParams.get("status");

    const verificationStatus =
      searchParams.get("verificationStatus");

    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // Legacy `level` parameter is intentionally ignored.
    // The finalized schema no longer contains difficulty/level.

    // -----------------------------
    // BUILD FILTER
    // -----------------------------

    const filter: any = {};

    if (course) filter.course = course;
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (subtopic) filter.subtopic = subtopic;

    if (type) filter.type = type;

    // -----------------------------
    // LEARNING SKILL FILTER
    // -----------------------------

    if (skill) {
      if (!isLearningSkillId(skill)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid learning skill.",
          },
          { status: 400 }
        );
      }

      // Matches questions containing this skill ID.
      filter.skills = skill;
    }

    if (status) filter.status = status;

    if (verificationStatus) {
      filter["verification.status"] = verificationStatus;
    }

    // -----------------------------
    // DATE FILTER
    // -----------------------------

    if (fromDate || toDate) {
      const createdAt: any = {};

      if (fromDate) {
        const start = new Date(fromDate);

        if (Number.isNaN(start.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid fromDate.",
            },
            { status: 400 }
          );
        }

        createdAt.$gte = start;
      }

      if (toDate) {
        const end = new Date(toDate);

        if (Number.isNaN(end.getTime())) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid toDate.",
            },
            { status: 400 }
          );
        }

        // Include the entire selected day.
        end.setUTCHours(0, 0, 0, 0);
        end.setUTCDate(end.getUTCDate() + 1);

        createdAt.$lt = end;
      }

      filter.createdAt = createdAt;
    }

    // -----------------------------
    // SEARCH
    // -----------------------------

    if (search) {
      const regex = new RegExp(
        escapeRegex(search),
        "i"
      );

      filter.$or = [
        // Main question content
        { "prompt.value": regex },

        // Options
        { "options.content.value": regex },

        // Direct solution explanation
        { "solution.explanation.value": regex },

        // Step instructions and explanations
        { "steps.instruction.value": regex },
        { "steps.explanation.value": regex },

        // Part content
        { "parts.prompt.value": regex },
        { "parts.explanation.value": regex },

        // Part solution steps
        { "parts.steps.instruction.value": regex },
        { "parts.steps.explanation.value": regex },

        // Academic metadata
        { course: regex },
        { subject: regex },
        { chapter: regex },
        { subtopic: regex },

        // Learning skill IDs
        { skills: regex },
        { "steps.skills": regex },
        { "parts.skills": regex },
        { "parts.steps.skills": regex },

        // Creator
        { uploadedBy: regex },

        // Question metadata
        { questionId: regex },
      ];
    }

    // -----------------------------
    // FETCH QUESTIONS
    // -----------------------------

    const [questions, total, courses] =
      await Promise.all([
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

              // Learning skills
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
              "uploadedBy",
              "source",
              "createdAt",
              "updatedAt",
            ].join(" ")
          )
          .sort({
            createdAt: -1,
            _id: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        QuestionBankV2.countDocuments(filter),

        // Independent of active filters.
        QuestionBankV2.distinct("course", {
          course: {
            $exists: true,
            $nin: ["", null],
          },
        }),
      ]);

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return NextResponse.json(
      {
        success: true,

        questions,

        courses: courses.sort((a, b) =>
          String(a).localeCompare(String(b))
        ),

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "Fetch QuestionBankV2 error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to fetch questions.",
      },
      { status: 500 }
    );
  }
}