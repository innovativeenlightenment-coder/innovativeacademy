import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import UserSchema from "@/model/UserSchema";

import {
  isLearningSkillId,
  type LearningSkillId,
} from "@/utils/learningSkills";

import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value: any): string {
  return String(value ?? "").trim();
}

function createTextContent(value: string) {
  return [
    {
      type: "text",
      value,
      url: "",
      alt: "",
    },
  ];
}

function normalizeAnswer(answer: any): string {
  const value = normalizeText(answer).toUpperCase();

  // Supports A, B, C, D and formats such as Option A.
  const match = value.match(/[ABCD]/);

  return match ? match[0] : "";
}

/* =========================================================
   LEARNING SKILLS NORMALIZATION

   Accepts:
   - ["conceptual", "calculation"]
   - '["conceptual", "calculation"]'
   - "conceptual,calculation"
   - "conceptual"

   Returns unique, validated skill IDs.
========================================================= */

function normalizeSkills(value: any): LearningSkillId[] {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  let parsed = value;

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      parsed = JSON.parse(trimmed);
    } catch {
      // Also support comma-separated skill IDs.
      parsed = trimmed.split(",").map((item) => item.trim());
    }
  }

  if (!Array.isArray(parsed)) {
    parsed = [parsed];
  }

  const skills: LearningSkillId[] = [];

  for (const skill of parsed) {
    if (
      typeof skill !== "string" ||
      !isLearningSkillId(skill.trim())
    ) {
      throw new Error(
        `Invalid learning skill ID: ${String(skill)}`
      );
    }

    const normalizedSkill = skill.trim();

if (isLearningSkillId(normalizedSkill)) {
  if (!skills.includes(normalizedSkill)) {
    skills.push(normalizedSkill);
  }
} else {
  throw new Error(
    `Invalid learning skill ID: ${normalizedSkill}`
  );
}
  }

  return skills;
}

/* =========================================================
   POST
========================================================= */

export async function POST(req: NextRequest) {
  try {
    noStore();

    await connectDB();

    const body = await req.json();

    const { userId, questions } = body;

    // -----------------------------
    // VALIDATE REQUEST
    // -----------------------------

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "User ID is required.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "No questions provided for import.",
        },
        { status: 400 }
      );
    }

    if (questions.length > 500) {
      return NextResponse.json(
        {
          ok: false,
          error: "Maximum 500 questions can be imported at once.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // FIND USER
    // -----------------------------

    const user = await UserSchema.findById(userId)
      .lean()
      .exec();

    if (!user || Array.isArray(user)) {
      return NextResponse.json(
        {
          ok: false,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    const uploadedBy = String(
      (user as { _id: unknown })._id
    );

    // -----------------------------
    // PREPARE QUESTIONS
    // -----------------------------

    const preparedQuestions: any[] = [];

    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      const questionText = normalizeText(question.question);

      const optionValues = [
        normalizeText(question.optionA),
        normalizeText(question.optionB),
        normalizeText(question.optionC),
        normalizeText(question.optionD),
      ];

      const answer = normalizeAnswer(question.answer);

      const course = normalizeText(question.course);
      const subject = normalizeText(question.subject);
      const chapter = normalizeText(question.chapter);

      const hint = normalizeText(question.hint);

      // -----------------------------
      // LEARNING SKILLS
      // -----------------------------

      let skills: LearningSkillId[];

      try {
        skills = normalizeSkills(question.skills);
      } catch (error: any) {
        throw new Error(
          `Row ${index + 1}: ${error.message}`
        );
      }

      // -----------------------------
      // VALIDATE ROW
      // -----------------------------

      if (!questionText) {
        throw new Error(
          `Row ${index + 1}: Question text is missing.`
        );
      }

      if (optionValues.some((option) => !option)) {
        throw new Error(
          `Row ${index + 1}: All four options are required.`
        );
      }

      if (!["A", "B", "C", "D"].includes(answer)) {
        throw new Error(
          `Row ${index + 1}: Answer must be A, B, C or D.`
        );
      }

      if (!course || !subject || !chapter) {
        throw new Error(
          `Row ${index + 1}: Course, subject and chapter are required.`
        );
      }

      // -----------------------------
      // PREPARE OPTIONS
      // -----------------------------

      const options = optionValues.map(
        (option, optionIndex) => ({
          optionId: String.fromCharCode(65 + optionIndex),
          content: createTextContent(option),
        })
      );

      // -----------------------------
      // PREPARE QUESTION
      // -----------------------------

      const preparedQuestion = {
        questionId: randomUUID(),
        version: 1,

        course,
        subject,
        chapter,

        subtopic: normalizeText(question.subtopic) || "General",

        type: "mcq",

        // Centralized learning skill IDs.
        skills,

        prompt: createTextContent(questionText),

        response: {
          mode: "select_one",
          inputMode: "option_grid",
          config: {},
        },

        options,

        answerKey: {
          optionId: answer,
        },

        evaluation: {
          mode: "automatic",
          method: "exact",
          rules: {},
        },

        steps: [],
        parts: [],

        solution: {
          explanation: hint
            ? createTextContent(hint)
            : [],
          videoUrl: "",
        },

        // Concepts remain separate from learning skills.
        learning: {
          conceptIds: [],
        },

        selection: {
          purpose: ["practice"],
          variantGroupId: "",
        },

        verification: {
          status: "pending",
          checkedBy: "",
          checkedAt: null,
          remarks: "",
        },

        status: "draft",

        uploadedBy,

        source: "bulk_import",
      };

      preparedQuestions.push(preparedQuestion);
    }

    // -----------------------------
    // INSERT QUESTIONS
    // -----------------------------

    const savedQuestions =
      await QuestionBankV2.insertMany(
        preparedQuestions,
        {
          ordered: true,
        }
      );

    return NextResponse.json(
      {
        message: "Questions imported successfully",
        ok: true,
        importedCount: savedQuestions.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "Bulk Question Import Error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error.message ||
          "Failed to import questions.",
      },
      { status: 500 }
    );
  }
}