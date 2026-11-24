import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import {
  isLearningSkillId,
  type LearningSkillId,
} from "@/utils/learningSkills";

export const dynamic = "force-dynamic";

/* =========================================================
   CONTENT MAPPING
========================================================= */

function mapContent(content: any[] = []) {
  if (!Array.isArray(content)) return [];

  return content.map((item) => ({
    type: item.type || "text",
    value: item.value || "",
    url: item.url || "",
    alt: item.alt || "",
  }));
}

/* =========================================================
   SKILLS MAPPING
========================================================= */

function mapSkills(skills: any): LearningSkillId[] {
  if (!Array.isArray(skills)) return [];

  const validSkills: LearningSkillId[] = [];

  for (const skill of skills) {
    if (
      typeof skill === "string" &&
      isLearningSkillId(skill) &&
      !validSkills.includes(skill)
    ) {
      validSkills.push(skill);
    }
  }

  return validSkills;
}

/* =========================================================
   OPTIONS MAPPING
========================================================= */

function mapOptions(options: any[] = []) {
  if (!Array.isArray(options)) return [];

  return options.map((option) => ({
    id: option.optionId,
    content: mapContent(option.content),
  }));
}

/* =========================================================
   ANSWER TYPE
========================================================= */

function getAnswerType(mode?: string) {
  return mode === "select_one" ? "mcq" : "text";
}

/* =========================================================
   GET QUESTION
========================================================= */

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    noStore();

    await connectDB();

    const { id } = params;

    // -----------------------------
    // VALIDATE ID
    // -----------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid question ID",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // FETCH QUESTION
    // -----------------------------

    const question: any =
      await QuestionBankV2.findById(id).lean();

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          message: "Question not found",
        },
        { status: 404 }
      );
    }

    // -----------------------------
    // MAP QUESTION FORMAT
    // -----------------------------

    const format =
      question.type === "mcq"
        ? "mcq"
        : question.type === "stepwise"
          ? "steps"
          : "answer";

    // -----------------------------
    // MAP MAIN OPTIONS
    // -----------------------------

    const options = mapOptions(question.options);

    // -----------------------------
    // MAP CORRECT OPTION
    // -----------------------------

    const correctOptionId =
      format === "mcq"
        ? question.answerKey?.optionId || ""
        : "";

    // -----------------------------
    // MAP EXPECTED ANSWER
    // -----------------------------

    const answer = {
      content: mapContent(
        question.answerKey?.content || []
      ),

      acceptedAnswers: Array.isArray(
        question.answerKey?.acceptedAnswers
      )
        ? question.answerKey.acceptedAnswers
        : [],
    };

    // -----------------------------
    // MAP SOLUTION STEPS
    // -----------------------------

    const steps = (question.steps || []).map(
      (step: any) => ({
        id: step.stepId,

        title: step.title || "",

        instruction: mapContent(
          step.instruction || []
        ),

        answerType: getAnswerType(
          step.response?.mode
        ),

        options: mapOptions(step.options),

        correctOptionId:
          step.answerKey?.optionId || "",

        answer: {
          content: mapContent(
            step.answerKey?.content || []
          ),

          acceptedAnswers: Array.isArray(
            step.answerKey?.acceptedAnswers
          )
            ? step.answerKey.acceptedAnswers
            : [],
        },

        explanation: mapContent(
          step.explanation || []
        ),

        // Step-level learning skills
        skills: mapSkills(step.skills),
      })
    );

    // -----------------------------
    // PREPARE EDITOR RESPONSE
    // -----------------------------

    const response = {
      _id: question._id,

      questionId: question.questionId,
      version: question.version,

      academic: {
        course: question.course,
        subject: question.subject,
        chapter: question.chapter,
        subtopic: question.subtopic,
      },

      format,

      // Question-level learning skills
      skills: mapSkills(question.skills),

      prompt: mapContent(question.prompt),

      options,
      correctOptionId,

      answer,
      steps,

      explanation: mapContent(
        question.solution?.explanation || []
      ),

      teacherChecked:
        question.verification?.status === "verified",

      status: question.status,

      uploadedBy: question.uploadedBy,

      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return NextResponse.json(
      {
        ok: true,
        question: response,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "Get QuestionBankV2 error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch question",
      },
      { status: 500 }
    );
  }
}