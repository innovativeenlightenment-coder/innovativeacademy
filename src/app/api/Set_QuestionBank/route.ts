import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

import cloudinary from "@/lib/cloudinary";
import QuestionBankV2 from "@/model/QuestionBankV2";
import UserSchema from "@/model/UserSchema";
import { connectDB } from "@/lib/mongoose";

import {
  isLearningSkillId,
  type LearningSkillId,
} from "@/utils/learningSkills";

export const dynamic = "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type ContentType =
  | "text"
  | "math"
  | "image"
  | "diagram"
  | "table"
  | "video";

type ContentItem = {
  type: ContentType;
  value?: string;
  url?: string;
  alt?: string;
};

type QuestionFormat = "mcq" | "answer" | "steps";

const validFormats: QuestionFormat[] = [
  "mcq",
  "answer",
  "steps",
];

const validContentTypes: ContentType[] = [
  "text",
  "math",
  "image",
  "diagram",
  "table",
  "video",
];

/* =========================================================
   CONTENT VALIDATION
========================================================= */

function hasContent(content: ContentItem[] = []): boolean {
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
   LEARNING SKILLS
========================================================= */

/**
 * Validate skills using the central learningSkills.ts file.
 *
 * Invalid skill IDs are rejected.
 * Duplicate IDs are removed.
 */
function prepareSkills(
  skills: unknown
): LearningSkillId[] {
  if (skills === undefined || skills === null) {
    return [];
  }

  if (!Array.isArray(skills)) {
    throw new Error("Skills must be an array.");
  }

  const prepared: LearningSkillId[] = [];

  for (const skill of skills) {
    if (!isLearningSkillId(skill)) {
      throw new Error(
        `Invalid learning skill: ${String(skill)}`
      );
    }

    if (!prepared.includes(skill)) {
      prepared.push(skill);
    }
  }

  return prepared;
}

/* =========================================================
   DERIVE QUESTION SKILLS FROM STEPS
========================================================= */

/**
 * For stepwise questions, question-level skills
 * are automatically derived from individual steps.
 *
 * This prevents question-level and step-level
 * skills from becoming inconsistent.
 */
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
   CONTENT PREPARATION
========================================================= */

/**
 * Process content and upload Base64 images to Cloudinary.
 * Other content types are preserved.
 */
async function prepareContent(
  content: ContentItem[] = [],
  folder = "innovative-academy/questions"
) {
  if (!Array.isArray(content)) {
    throw new Error("Invalid content format.");
  }

  const prepared: ContentItem[] = [];

  for (const item of content) {
    if (
      !item ||
      !validContentTypes.includes(item.type)
    ) {
      throw new Error("Invalid content type.");
    }

    const value = item.value || "";
    const url = item.url || "";

    if (item.type === "image") {
      const imageSource = url || value;

      if (!imageSource) {
        throw new Error(
          "Image content is missing."
        );
      }

      // Already uploaded image
      if (
        imageSource.startsWith("http://") ||
        imageSource.startsWith("https://")
      ) {
        prepared.push({
          type: "image",
          value: "",
          url: imageSource,
          alt: item.alt || "",
        });

        continue;
      }

      // Upload Base64 image
      if (imageSource.startsWith("data:image/")) {
        const uploaded =
          await cloudinary.uploader.upload(
            imageSource,
            {
              folder,
              resource_type: "image",
            }
          );

        prepared.push({
          type: "image",
          value: "",
          url: uploaded.secure_url,
          alt: item.alt || "",
        });

        continue;
      }

      throw new Error(
        "Invalid image URL or Base64 data."
      );
    }

    prepared.push({
      type: item.type,
      value,
      url,
      alt: item.alt || "",
    });
  }

  return prepared;
}

/* =========================================================
   OPTIONS
========================================================= */

async function prepareOptions(options: any[] = []) {
  if (!Array.isArray(options)) {
    throw new Error("Invalid options format.");
  }

  const prepared = [];

  for (const option of options) {
    if (!option?.id) {
      throw new Error("Option ID is missing.");
    }

    if (!hasContent(option.content || [])) {
      throw new Error(
        "An option has no content."
      );
    }

    prepared.push({
      optionId: String(option.id),

      content: await prepareContent(
        option.content || [],
        "innovative-academy/options"
      ),
    });
  }

  const ids = prepared.map(
    (option) => option.optionId
  );

  if (new Set(ids).size !== ids.length) {
    throw new Error(
      "Duplicate option IDs found."
    );
  }

  return prepared;
}

/* =========================================================
   ANSWERS
========================================================= */

async function prepareAnswer(answer: any = {}) {
  const content = await prepareContent(
    answer.content || [],
    "innovative-academy/answers"
  );

  const acceptedAnswers = Array.isArray(
    answer.acceptedAnswers
  )
    ? answer.acceptedAnswers
        .map((item: unknown) =>
          String(item).trim()
        )
        .filter(Boolean)
    : [];

  return {
    content,
    acceptedAnswers,
  };
}

/* =========================================================
   RESPONSE CONFIGURATION
========================================================= */

function createResponse(type: "mcq" | "text") {
  if (type === "mcq") {
    return {
      mode: "select_one",
      inputMode: "option_grid",
      config: {},
    };
  }

  return {
    mode: "short_text",
    inputMode: "text_input",
    config: {},
  };
}

/* =========================================================
   QUESTION TYPE
========================================================= */

/**
 * Frontend format -> MongoDB type
 *
 * mcq    -> mcq
 * steps  -> stepwise
 * answer -> one_word
 */
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
   STEP PREPARATION
========================================================= */

async function prepareStep(
  step: any,
  index: number
) {
  if (
    !["mcq", "text"].includes(step.answerType)
  ) {
    throw new Error(
      `Invalid answer type in step ${index + 1}.`
    );
  }

  // Support both old prompt and instruction formats.
  const instruction = await prepareContent(
    step.instruction || step.prompt || [],
    "innovative-academy/step-instructions"
  );

  if (!hasContent(instruction)) {
    throw new Error(
      `Step ${index + 1} needs an instruction.`
    );
  }

  const isMCQ = step.answerType === "mcq";

  let options: any[] = [];
  let answerKey: any;

  if (isMCQ) {
    options = await prepareOptions(
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
    answerKey = await prepareAnswer(
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

  // Prepare step-level learning skills.
  const skills = prepareSkills(step.skills);

  return {
    stepId: String(
      step.id || step.stepId || randomUUID()
    ),

    order: index + 1,

    title: step.title || "",

    instruction,

    response: createResponse(
      isMCQ ? "mcq" : "text"
    ),

    options,

    answerKey,

    explanation: await prepareContent(
      step.explanation || [],
      "innovative-academy/step-explanations"
    ),

    skills,
  };
}

/* =========================================================
   QUESTION PREPARATION
========================================================= */

async function prepareQuestion(
  question: any,
  academic: {
    course: string;
    subject: string;
    chapter: string;
    subtopic: string;
  },
  uploadedBy: string,
  reviewerName: string
) {
  const {
    format,
    prompt,
    options = [],
    correctOptionId,
    answer = {},
    steps = [],
    explanation = [],
    teacherChecked,
  } = question;

  /* -----------------------------------------
     FORMAT VALIDATION
  ----------------------------------------- */

  if (
    !validFormats.includes(format as QuestionFormat)
  ) {
    throw new Error("Invalid question format.");
  }

  /* -----------------------------------------
     PROMPT
  ----------------------------------------- */

  if (!hasContent(prompt || [])) {
    throw new Error(
      "Question prompt is required."
    );
  }

  const preparedPrompt = await prepareContent(
    prompt,
    "innovative-academy/questions"
  );

  let preparedOptions: any[] = [];
  let answerKey: any = null;
  let preparedSteps: any[] = [];

  /* -----------------------------------------
     MCQ
  ----------------------------------------- */

  if (format === "mcq") {
    preparedOptions = await prepareOptions(
      options
    );

    if (preparedOptions.length < 2) {
      throw new Error(
        "MCQ needs at least two options."
      );
    }

    const correctOption = preparedOptions.find(
      (option) =>
        option.optionId ===
        String(correctOptionId)
    );

    if (!correctOption) {
      throw new Error(
        "Select a valid correct option."
      );
    }

    answerKey = {
      optionId: correctOption.optionId,
    };
  }

  /* -----------------------------------------
     DIRECT ANSWER
  ----------------------------------------- */

  if (format === "answer") {
    answerKey = await prepareAnswer(answer);

    if (
      !hasContent(answerKey.content) &&
      answerKey.acceptedAnswers.length === 0
    ) {
      throw new Error(
        "Expected answer is required."
      );
    }
  }

  /* -----------------------------------------
     STEPWISE
  ----------------------------------------- */

  if (format === "steps") {
    if (
      !Array.isArray(steps) ||
      steps.length === 0
    ) {
      throw new Error(
        "At least one solution step is required."
      );
    }

    for (let i = 0; i < steps.length; i++) {
      preparedSteps.push(
        await prepareStep(steps[i], i)
      );
    }
  }

  /* -----------------------------------------
     QUESTION-LEVEL SKILLS
  ----------------------------------------- */

  /**
   * MCQ and one-word:
   * Use teacher-selected question-level skills.
   *
   * Stepwise:
   * Automatically derive question-level skills
   * from all individual step skills.
   */
  const skills =
    format === "steps"
      ? getUniqueStepSkills(preparedSteps)
      : prepareSkills(question.skills);

  /* -----------------------------------------
     EXPLANATION
  ----------------------------------------- */

  const preparedExplanation =
    await prepareContent(
      explanation || [],
      "innovative-academy/explanations"
    );

  /* -----------------------------------------
     RESPONSE
  ----------------------------------------- */

  const response =
    format === "mcq"
      ? createResponse("mcq")
      : createResponse("text");

  /* -----------------------------------------
     EVALUATION
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

  /* -----------------------------------------
     FINAL DOCUMENT
  ----------------------------------------- */

  return {
    questionId: randomUUID(),

    version: 1,

    course: academic.course,
    subject: academic.subject,
    chapter: academic.chapter,
    subtopic: academic.subtopic,

    // Question format
    type: getQuestionType(
      format as QuestionFormat
    ),

    // Automatically derived for stepwise questions
    skills,

    prompt: preparedPrompt,

    response,

    options: preparedOptions,

    answerKey,

    evaluation,

    // Steps with their own learning skills
    steps: preparedSteps,

    solution: {
      explanation: preparedExplanation,
      videoUrl: "",
    },

    learning: {
      conceptIds: [],
    },

    selection: {
      purpose: ["practice"],
      variantGroupId: "",
    },

    verification: {
      status: isVerified
        ? "verified"
        : "pending",

      checkedBy: isVerified
        ? reviewerName
        : "",

      checkedAt: isVerified
        ? new Date()
        : null,

      remarks: "",
    },

    status: isVerified
      ? "published"
      : "draft",

    uploadedBy,

    source: "manual",
  };
}

/* =========================================================
   POST API
========================================================= */

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const { userId, academic, data } = body;

    /* -----------------------------------------
       REQUEST VALIDATION
    ----------------------------------------- */

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required.",
        },
        { status: 400 }
      );
    }

    if (!academic) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Academic information is required.",
        },
        { status: 400 }
      );
    }

    const requiredAcademicFields = [
      "course",
      "subject",
      "chapter",
      "subtopic",
    ] as const;

    for (const field of requiredAcademicFields) {
      if (
        typeof academic[field] !== "string" ||
        !academic[field].trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${field} is required.`,
          },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one question is required.",
        },
        { status: 400 }
      );
    }

    if (data.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Maximum 100 questions can be uploaded at once.",
        },
        { status: 400 }
      );
    }

    /* -----------------------------------------
       FIND USER
    ----------------------------------------- */

    const user = await UserSchema.findById(
      userId
    ).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    const userData = user as any;

    const uploadedBy = String(userData._id);

    const reviewerName =
      getReviewerName(userData);

    /* -----------------------------------------
       PREPARE QUESTIONS
    ----------------------------------------- */

    const preparedQuestions: any[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const prepared = await prepareQuestion(
          data[i],
          {
            course: academic.course.trim(),
            subject: academic.subject.trim(),
            chapter: academic.chapter.trim(),
            subtopic: academic.subtopic.trim(),
          },
          uploadedBy,
          reviewerName
        );

        preparedQuestions.push(prepared);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown question preparation error.";

        throw new Error(
          `Question ${i + 1}: ${message}`
        );
      }
    }

    /* -----------------------------------------
       SAVE TO DATABASE
    ----------------------------------------- */

    const savedQuestions =
      await QuestionBankV2.insertMany(
        preparedQuestions,
        {
          ordered: true,
        }
      );

    /* -----------------------------------------
       SUCCESS
    ----------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        savedCount: savedQuestions.length,

        message: `${savedQuestions.length} question(s) uploaded successfully.`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "Set QuestionBankV2 error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to upload questions.",
      },
      { status: 500 }
    );
  }
}