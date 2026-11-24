
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import UserSchema from "@/model/UserSchema";
import cloudinary from "@/lib/cloudinary";
import { unstable_noStore as noStore } from "next/cache";
import mongoose from "mongoose";

import {
  isLearningSkillId,
  type LearningSkillId,
} from "@/utils/learningSkills";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type ContentItem = {
  type: "text" | "math" | "image" | "diagram" | "table" | "video";
  value?: string;
  url?: string;
  alt?: string;
};

const validFormats = ["mcq", "answer", "steps"];

const validContentTypes = [
  "text",
  "math",
  "image",
  "diagram",
  "table",
  "video",
];

/* =========================================================
   QUESTION TYPE MAPPING

   Frontend -> MongoDB

   MCQ    -> mcq
   Steps  -> stepwise
   Answer -> one_word
========================================================= */

function getQuestionType(format: string) {
  switch (format) {
    case "mcq":
      return "mcq";

    case "steps":
      return "stepwise";

    case "answer":
      return "one_word";

    default:
      return "other";
  }
}

/* =========================================================
   LEARNING SKILLS NORMALIZATION
========================================================= */

function normalizeSkills(value: unknown): LearningSkillId[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("Invalid learning skills format.");
  }

  const skills: LearningSkillId[] = [];

  for (const skill of value) {
    if (typeof skill !== "string") {
      throw new Error("Invalid learning skill ID.");
    }

    const normalizedSkill = skill.trim();

    if (!isLearningSkillId(normalizedSkill)) {
      throw new Error(
        `Invalid learning skill ID: ${normalizedSkill}`
      );
    }

    if (!skills.includes(normalizedSkill)) {
      skills.push(normalizedSkill);
    }
  }

  return skills;
}

/* =========================================================
   DERIVE QUESTION SKILLS FROM STEPS
========================================================= */

function getUniqueStepSkills(
  steps: any[]
): LearningSkillId[] {
  const skills: LearningSkillId[] = [];

  for (const step of steps ?? []) {
    for (const skill of step.skills ?? []) {
      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }
  }

  return skills;
}

/* =========================================================
   REVIEWER NAME
========================================================= */

function getReviewerName(user: any): string {
  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    user.name?.trim() ||
    user.fullName?.trim() ||
    fullName ||
    user.username?.trim() ||
    user.displayName?.trim() ||
    "Teacher"
  );
}

/* =========================================================
   CONTENT VALIDATION
========================================================= */

function hasContent(content: ContentItem[] = []) {
  return (
    Array.isArray(content) &&
    content.some((item) => {
      if (!item) return false;

      if (item.type === "image") {
        return Boolean(item.url || item.value);
      }

      return Boolean(
        item.value?.trim() || item.url?.trim()
      );
    })
  );
}

/* =========================================================
   PROCESS CONTENT

   - Text/math/table content preserved.
   - Existing media URLs preserved.
   - New Base64 images uploaded to Cloudinary.
========================================================= */

async function processContent(
  content: ContentItem[] = [],
  folder: string
): Promise<ContentItem[]> {
  if (!Array.isArray(content)) {
    throw new Error("Invalid content format.");
  }

  return Promise.all(
    content.map(async (item) => {
      if (
        !item ||
        !validContentTypes.includes(item.type)
      ) {
        throw new Error("Invalid content item.");
      }

      const value = item.value || "";
      const url = item.url || "";

      if (item.type === "image") {
        const imageSource = url || value;

        if (!imageSource) {
          throw new Error("Image source is missing.");
        }

        // Existing URL.
        if (
          imageSource.startsWith("https://") ||
          imageSource.startsWith("http://")
        ) {
          return {
            type: "image" as const,
            value: "",
            url: imageSource,
            alt: item.alt || "",
          };
        }

        // New Base64 image.
        if (imageSource.startsWith("data:image/")) {
          const uploaded =
            await cloudinary.uploader.upload(
              imageSource,
              {
                folder,
                resource_type: "image",
              }
            );

          return {
            type: "image" as const,
            value: "",
            url: uploaded.secure_url,
            alt: item.alt || "",
          };
        }

        throw new Error("Invalid image source.");
      }

      // Preserve non-image content.
      return {
        type: item.type,
        value,
        url,
        alt: item.alt || "",
      };
    })
  );
}

/* =========================================================
   PROCESS ANSWER
========================================================= */

async function processAnswer(answer: any = {}) {
  return {
    content: await processContent(
      answer.content || [],
      "test-series/answers"
    ),

    acceptedAnswers: Array.isArray(
      answer.acceptedAnswers
    )
      ? answer.acceptedAnswers
          .map((value: unknown) => String(value).trim())
          .filter(Boolean)
      : [],
  };
}

/* =========================================================
   PROCESS OPTIONS
========================================================= */

async function processOptions(options: any[] = []) {
  if (!Array.isArray(options)) {
    throw new Error("Invalid options format.");
  }

  const processed = await Promise.all(
    options.map(async (option: any) => {
      if (!option.id) {
        throw new Error("An option is missing its ID.");
      }

      if (!hasContent(option.content || [])) {
        throw new Error("An option has no content.");
      }

      return {
        optionId: String(option.id),

        content: await processContent(
          option.content || [],
          "test-series/options"
        ),
      };
    })
  );

  const ids = processed.map(
    (option) => option.optionId
  );

  if (new Set(ids).size !== ids.length) {
    throw new Error("Duplicate option IDs found.");
  }

  return processed;
}

/* =========================================================
   PROCESS ONE STEP

   Includes step-level learning skills.
========================================================= */

async function processStep(step: any, index: number) {
  const isMCQ = step.answerType === "mcq";

  if (!["mcq", "text"].includes(step.answerType)) {
    throw new Error(
      `Invalid answer type in step ${index + 1}.`
    );
  }

  // Supports both instruction and frontend prompt.
  const instruction = await processContent(
    step.instruction || step.prompt || [],
    "test-series/questions"
  );

  if (!hasContent(instruction)) {
    throw new Error(
      `Step ${index + 1} needs an instruction.`
    );
  }

  // Step-level learning skills.
  let skills: LearningSkillId[];

  try {
    skills = normalizeSkills(step.skills);
  } catch (error: any) {
    throw new Error(
      `Step ${index + 1}: ${error.message}`
    );
  }

  let options: any[] = [];
  let answerKey: any = null;

  /* -----------------------------------------
     MCQ STEP
  ----------------------------------------- */

  if (isMCQ) {
    options = await processOptions(
      step.options || []
    );

    if (options.length < 2) {
      throw new Error(
        `Step ${index + 1} needs at least two options.`
      );
    }

    const correctOption = options.find(
      (option) =>
        option.optionId ===
        String(step.correctOptionId)
    );

    if (!correctOption) {
      throw new Error(
        `Select the correct answer for step ${index + 1}.`
      );
    }

    answerKey = {
      optionId: correctOption.optionId,
    };
  } else {
    /* -----------------------------------------
       TEXT STEP
    ----------------------------------------- */

    answerKey = await processAnswer(
      step.answer || {}
    );

    if (
      !hasContent(answerKey.content) &&
      answerKey.acceptedAnswers.length === 0
    ) {
      throw new Error(
        `Step ${index + 1} needs an expected answer.`
      );
    }
  }

  return {
    stepId: String(
      step.id || step.stepId || `step-${index + 1}`
    ),

    order: index + 1,

    title: step.title || "",

    instruction,

    response: {
      mode: isMCQ ? "select_one" : "short_text",

      inputMode: isMCQ
        ? "option_grid"
        : "text_input",

      config: {},
    },

    options,

    answerKey,

    explanation: await processContent(
      step.explanation || [],
      "test-series/hints"
    ),

    skills,
  };
}

/* =========================================================
   POST — UPDATE QUESTION
========================================================= */

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    noStore();

    await connectDB();

    const { id } = params;

    /* -----------------------------------------
       VALIDATE QUESTION ID
    ----------------------------------------- */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid question ID." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       FIND EXISTING QUESTION
    ----------------------------------------- */

    const existingQuestion: any =
      await QuestionBankV2.findById(id);

    if (!existingQuestion) {
      return NextResponse.json(
        { message: "Question not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Supports:
    // { data: QuestionData }
    // { question: QuestionData }
    // Direct QuestionData

    const data = body.data || body.question || body;

    const {
      format,
      skills: rawSkills,
      prompt,
      options = [],
      correctOptionId,
      answer = {},
      steps = [],
      explanation = [],
      teacherChecked,
      academic,
    } = data;

    /* -----------------------------------------
       VALIDATE FORMAT
    ----------------------------------------- */

    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { message: "Invalid question format." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       VALIDATE QUESTION-LEVEL SKILLS
    ----------------------------------------- */

    let questionSkills: LearningSkillId[] = [];

    // Stepwise skills are derived after processing steps.
    // MCQ and answer skills are manually selected.

    if (format !== "steps") {
      try {
        questionSkills = normalizeSkills(rawSkills);
      } catch (error: any) {
        return NextResponse.json(
          {
            ok: false,
            message: error.message,
          },
          { status: 400 }
        );
      }
    }

    /* -----------------------------------------
       VALIDATE PROMPT
    ----------------------------------------- */

    if (!hasContent(prompt || [])) {
      return NextResponse.json(
        { message: "Question prompt is required." },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       VALIDATE MCQ
    ----------------------------------------- */

    if (format === "mcq") {
      if (!Array.isArray(options) || options.length < 2) {
        return NextResponse.json(
          {
            message: "At least two MCQ options are required.",
          },
          { status: 400 }
        );
      }

      if (!correctOptionId) {
        return NextResponse.json(
          {
            message: "Select the correct answer.",
          },
          { status: 400 }
        );
      }

      if (
        !options.some(
          (option: any) =>
            String(option.id) === String(correctOptionId)
        )
      ) {
        return NextResponse.json(
          {
            message: "Correct option does not exist.",
          },
          { status: 400 }
        );
      }
    }

    /* -----------------------------------------
       VALIDATE DIRECT ANSWER
    ----------------------------------------- */

    if (format === "answer") {
      if (
        !hasContent(answer.content || []) &&
        !(
          Array.isArray(answer.acceptedAnswers) &&
          answer.acceptedAnswers.some(
            (value: unknown) => String(value).trim()
          )
        )
      ) {
        return NextResponse.json(
          {
            message: "Enter an expected answer.",
          },
          { status: 400 }
        );
      }
    }

    /* -----------------------------------------
       VALIDATE STEPS
    ----------------------------------------- */

    if (format === "steps") {
      if (!Array.isArray(steps) || steps.length === 0) {
        return NextResponse.json(
          {
            message: "At least one solution step is required.",
          },
          { status: 400 }
        );
      }
    }

    /* -----------------------------------------
       PROCESS QUESTION CONTENT
    ----------------------------------------- */

    const processedPrompt = await processContent(
      prompt,
      "test-series/questions"
    );

    /* -----------------------------------------
       PROCESS OPTIONS
    ----------------------------------------- */

    const processedOptions =
      format === "mcq"
        ? await processOptions(options)
        : [];

    /* -----------------------------------------
       PROCESS ANSWER
    ----------------------------------------- */

    let answerKey: any = null;

    if (format === "mcq") {
      const correctOption = processedOptions.find(
        (option) =>
          option.optionId === String(correctOptionId)
      );

      if (!correctOption) {
        throw new Error("Correct MCQ option not found.");
      }

      answerKey = {
        optionId: correctOption.optionId,
      };
    }

    if (format === "answer") {
      answerKey = await processAnswer(answer);
    }

    /* -----------------------------------------
       PROCESS STEPS
    ----------------------------------------- */

    const processedSteps =
      format === "steps"
        ? await Promise.all(
            steps.map(
              (step: any, index: number) =>
                processStep(step, index)
            )
          )
        : [];

    /* -----------------------------------------
       FINAL QUESTION-LEVEL SKILLS
    ----------------------------------------- */

    questionSkills =
      format === "steps"
        ? getUniqueStepSkills(processedSteps)
        : questionSkills;

    /* -----------------------------------------
       PROCESS EXPLANATION
    ----------------------------------------- */

    const processedExplanation = await processContent(
      explanation || [],
      "test-series/hints"
    );

    /* -----------------------------------------
       RESPONSE CONFIGURATION
    ----------------------------------------- */

    const response =
      format === "mcq"
        ? {
            mode: "select_one",
            inputMode: "option_grid",
            config: {},
          }
        : {
            mode: "short_text",
            inputMode: "text_input",
            config: {},
          };

    /* -----------------------------------------
       EVALUATION CONFIGURATION
    ----------------------------------------- */

    const evaluation =
      format === "mcq"
        ? {
            mode: "automatic",
            method: "exact",
            rules: {},
          }
        : format === "steps"
          ? {
              mode: "automatic",
              method: "stepwise",
              rules: {},
            }
          : {
              mode: "automatic",
              method: "accepted_answers",
              rules: {},
            };

    /* -----------------------------------------
       VERIFICATION
    ----------------------------------------- */

    const isVerified = teacherChecked === true;

    let verification: any;

    if (isVerified) {
      const userId = body.userId;

      if (
        !userId ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return NextResponse.json(
          {
            message: "Valid reviewer user ID is required.",
          },
          { status: 400 }
        );
      }

      const reviewer: any =
        await UserSchema.findById(userId).lean();

      if (!reviewer) {
        return NextResponse.json(
          { message: "Reviewer not found." },
          { status: 404 }
        );
      }

      verification = {
        status: "verified",
        checkedBy: getReviewerName(reviewer),
        checkedAt: new Date(),

        remarks:
          existingQuestion.verification?.remarks || "",
      };
    } else {
      verification = {
        status: "pending",
        checkedBy: "",
        checkedAt: null,
        remarks: "",
      };
    }

    /* -----------------------------------------
       UPDATE FIELDS
    ----------------------------------------- */

    const updatedFields: any = {
      type: getQuestionType(format),

      // Automatically derived for stepwise questions.
      skills: questionSkills,

      prompt: processedPrompt,

      response,

      options: processedOptions,

      answerKey,

      evaluation,

      steps: processedSteps,

      solution: {
        explanation: processedExplanation,

        videoUrl:
          existingQuestion.solution?.videoUrl || "",
      },

      verification,

      status: isVerified ? "published" : "draft",
    };

    /* -----------------------------------------
       PRESERVE ACADEMIC INFORMATION
    ----------------------------------------- */

    if (academic) {
      for (const field of [
        "course",
        "subject",
        "chapter",
        "subtopic",
      ]) {
        if (academic[field] !== undefined) {
          const value = String(academic[field]).trim();

          if (!value) {
            return NextResponse.json(
              {
                message: `${field} cannot be empty.`,
              },
              { status: 400 }
            );
          }

          updatedFields[field] = value;
        }
      }
    }

    /* -----------------------------------------
       SAVE
    ----------------------------------------- */

    const updatedQuestion =
      await QuestionBankV2.findByIdAndUpdate(
        id,
        {
          $set: updatedFields,
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    return NextResponse.json(
      {
        ok: true,
        message: "Question updated successfully.",
        question: updatedQuestion,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Edit QuestionBankV2 error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          error.message ||
          "Failed to update question.",
      },
      { status: 500 }
    );
  }
}