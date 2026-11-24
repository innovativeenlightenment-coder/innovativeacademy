import mongoose, { Schema, Model } from "mongoose";
import { LEARNING_SKILL_IDS } from "@/utils/learningSkills";

const { Mixed } = Schema.Types;

/* =========================================================
   REUSABLE SKILL FIELD
========================================================= */

const SkillsField = {
  type: [
    {
      type: String,
      enum: [...LEARNING_SKILL_IDS],
    },
  ],
  default: [],
};

/* =========================================================
   CONTENT SCHEMA
========================================================= */

// Reusable content: text, maths, images, diagrams, tables and videos.
const ContentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["text", "math", "image", "diagram", "table", "video"],
      required: true,
    },

    value: {
      type: String,
      default: "",
    },

    url: {
      type: String,
      default: "",
    },

    alt: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

/* =========================================================
   OPTION SCHEMA
========================================================= */

// Options can contain text, maths, images or combinations.
const OptionSchema = new Schema(
  {
    optionId: {
      type: String,
      required: true,
    },

    content: {
      type: [ContentSchema],
      required: true,
    },
  },
  { _id: false }
);

/* =========================================================
   RESPONSE SCHEMA
========================================================= */

// How the student interacts with a question.
const ResponseSchema = new Schema(
  {
    mode: {
      type: String,
      enum: [
        "select_one",
        "select_many",
        "number_choice",
        "math_choice",
        "math_builder",
        "word_bank",
        "fill_blanks",
        "matching",
        "ordering",
        "diagram_select",
        "diagram_label",
        "drawing",
        "short_text",
        "long_text",
        "oral",
        "file_upload",
      ],
      required: true,
    },

    inputMode: {
      type: String,
      enum: [
        "option_grid",
        "number_pad",
        "math_expression_options",
        "math_expression_builder",
        "word_selection",
        "drag_drop",
        "diagram_interaction",
        "text_input",
        "voice_input",
        "file_upload",
      ],
      required: true,
    },

    config: {
      type: Mixed,
      default: {},
    },
  },
  { _id: false }
);

/* =========================================================
   EVALUATION SCHEMA
========================================================= */

// How the answer should be evaluated.
const EvaluationSchema = new Schema(
  {
    mode: {
      type: String,
      enum: ["automatic", "teacher", "hybrid"],
      default: "automatic",
    },

    method: {
      type: String,
      enum: [
        "exact",
        "accepted_answers",
        "numeric_tolerance",
        "normalized_text",
        "structured",
        "stepwise",
        "teacher_review",
      ],
      default: "exact",
    },

    rules: {
      type: Mixed,
      default: {},
    },
  },
  { _id: false }
);

/* =========================================================
   SOLUTION STEP SCHEMA
========================================================= */

// Expected steps in numerical, derivation or multi-step questions.
const SolutionStepSchema = new Schema(
  {
    stepId: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    instruction: {
      type: [ContentSchema],
      default: [],
    },

    response: {
      type: ResponseSchema,
      required: true,
    },

    options: {
      type: [OptionSchema],
      default: [],
    },

    answerKey: {
      type: Mixed,
      default: null,
    },

    explanation: {
      type: [ContentSchema],
      default: [],
    },

    // Specific skills tested by this individual step.
    skills: SkillsField,
  },
  { _id: false }
);

/* =========================================================
   PART SCHEMA
========================================================= */

// Different parts of a case-based or multi-part question.
const PartSchema = new Schema(
  {
    partId: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    prompt: {
      type: [ContentSchema],
      required: true,
    },

    response: {
      type: ResponseSchema,
      required: true,
    },

    options: {
      type: [OptionSchema],
      default: [],
    },

    answerKey: {
      type: Mixed,
      default: null,
    },

    evaluation: {
      type: EvaluationSchema,
      default: () => ({}),
    },

    steps: {
      type: [SolutionStepSchema],
      default: [],
    },

    explanation: {
      type: [ContentSchema],
      default: [],
    },

    // Skills tested by this individual part.
    skills: SkillsField,
  },
  { _id: false }
);

/* =========================================================
   QUESTION BANK V2 SCHEMA
========================================================= */

const QuestionBankV2Schema = new Schema(
  {
    // Stable identity. Editing creates a new version.
    questionId: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    /* =====================================================
       ACADEMIC MAPPING
    ===================================================== */

    course: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    chapter: {
      type: String,
      required: true,
    },

    subtopic: {
      type: String,
      required: true,
    },

    /* =====================================================
       QUESTION TYPE
    ===================================================== */

    type: {
      type: String,
      enum: [
        "mcq",
        "multi_select",
        "true_false",
        "one_word",
        "fill_blank",
        "name_following",
        "definition",
        "reasoning",
        "explanation",
        "differentiate",
        "matching",
        "ordering",
        "numerical",
        "stepwise",
        "derivation",
        "diagram",
        "diagram_label",
        "drawing",
        "graph",
        "table",
        "case_based",
        "assertion_reason",
        "application",
        "experiment",
        "activity",
        "oral",
        "multi_part",
        "other",
      ],
      required: true,
    },

    /* =====================================================
       LEARNING SKILLS
    ===================================================== */

    // Multiple skills can be assigned to one question.
    skills: SkillsField,

    /* =====================================================
       QUESTION STATEMENT
    ===================================================== */

    prompt: {
      type: [ContentSchema],
      required: true,
    },

    /* =====================================================
       STUDENT RESPONSE INTERFACE
    ===================================================== */

    response: {
      type: ResponseSchema,
      required: true,
    },

    /* =====================================================
       ANSWER OPTIONS
    ===================================================== */

    options: {
      type: [OptionSchema],
      default: [],
    },

    /* =====================================================
       ANSWER KEY
    ===================================================== */

    answerKey: {
      type: Mixed,
      default: null,
    },

    /* =====================================================
       ANSWER EVALUATION
    ===================================================== */

    evaluation: {
      type: EvaluationSchema,
      default: () => ({}),
    },

    /* =====================================================
       STEPWISE SOLUTION
    ===================================================== */

    steps: {
      type: [SolutionStepSchema],
      default: [],
    },

    /* =====================================================
       CASE-BASED AND MULTI-PART QUESTIONS
    ===================================================== */

    parts: {
      type: [PartSchema],
      default: [],
    },

    /* =====================================================
       FULL SOLUTION
    ===================================================== */

    solution: {
      explanation: {
        type: [ContentSchema],
        default: [],
      },

      videoUrl: {
        type: String,
        default: "",
      },
    },

    /* =====================================================
       LEARNING RELATIONSHIPS
    ===================================================== */

    learning: {
      conceptIds: {
        type: [String],
        default: [],
      },
    },

    /* =====================================================
       QUESTION SELECTION SYSTEM
    ===================================================== */

    selection: {
      purpose: {
        type: [String],
        enum: [
          "diagnostic",
          "classroom",
          "practice",
          "revision",
          "homework",
          "mastery_check",
          "remedial",
          "challenge",
          "application",
        ],
        default: ["practice"],
      },

      variantGroupId: {
        type: String,
        default: null,
      },
    },

    /* =====================================================
       TEACHER VERIFICATION
    ===================================================== */

    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "needs_correction"],
        default: "pending",
      },

      checkedBy: {
        type: String,
        default: "",
      },

      checkedAt: {
        type: Date,
        default: null,
      },

      remarks: {
        type: String,
        default: "",
      },
    },

    /* =====================================================
       PUBLICATION STATUS
    ===================================================== */

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    /* =====================================================
       UPLOAD INFORMATION
    ===================================================== */

    uploadedBy: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      enum: ["manual", "bulk_import", "ai_assisted"],
      default: "manual",
    },
  },
  { timestamps: true }
);

/* =========================================================
   INDEXES
========================================================= */

// Unique question versions.
QuestionBankV2Schema.index(
  { questionId: 1, version: 1 },
  { unique: true }
);

// Academic navigation.
QuestionBankV2Schema.index({
  course: 1,
  subject: 1,
  chapter: 1,
  subtopic: 1,
  status: 1,
});

// Skill-based question selection.
QuestionBankV2Schema.index({
  skills: 1,
  status: 1,
});

// Purpose-based question selection.
QuestionBankV2Schema.index({
  "selection.purpose": 1,
  status: 1,
});

/* =========================================================
   MODEL
========================================================= */

const QuestionBankV2: Model<any> =
  mongoose.models.QuestionBankV2 ||
  mongoose.model("QuestionBankV2", QuestionBankV2Schema);

export default QuestionBankV2;