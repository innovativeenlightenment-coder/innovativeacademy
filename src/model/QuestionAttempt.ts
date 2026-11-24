import mongoose, { Schema, Model } from "mongoose";

/* =========================================================
   STUDENT RESPONSE
========================================================= */

const StudentResponseSchema = new Schema(
  {
    selectedOptions: [{ type: String }],

    selectedExpression: {
      type: String,
      default: null,
    },

    answers: {
      type: Schema.Types.Mixed,
      default: {},
    },

    textAnswer: {
      type: String,
      default: "",
    },

    submittedSteps: [
      {
        stepId: String,
        answer: Schema.Types.Mixed,
        selectedOption: String,
        isCorrect: Boolean,
        marksAwarded: Number,
        errorTags: [String],
      },
    ],

    submittedParts: [
      {
        partId: String,
        answer: Schema.Types.Mixed,
        isCorrect: Boolean,
        marksAwarded: Number,
      },
    ],
  },
  { _id: false }
);

/* =========================================================
   STEP SKILL MAPPING

   Stores the skills tested by an individual step.
========================================================= */

const StepSkillMappingSchema = new Schema(
  {
    stepId: {
      type: String,
      required: true,
    },

    skillIds: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

/* =========================================================
   PART SKILL MAPPING

   Stores:
   - Skills tested by the entire part.
   - Skills tested by individual steps inside that part.
========================================================= */

const PartSkillMappingSchema = new Schema(
  {
    partId: {
      type: String,
      required: true,
    },

    skillIds: {
      type: [String],
      default: [],
    },

    steps: {
      type: [StepSkillMappingSchema],
      default: [],
    },
  },
  { _id: false }
);

/* =========================================================
   QUESTION ATTEMPT
========================================================= */

const QuestionAttemptSchema = new Schema(
  {
    /* -----------------------------
       STUDENT
    ----------------------------- */

    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    /* -----------------------------
       QUESTION IDENTITY
    ----------------------------- */

    questionId: {
      type: String,
      required: true,
      index: true,
    },

    questionVersion: {
      type: Number,
      required: true,
    },

    questionType: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "",
    },

    /* -----------------------------
       ACADEMIC MAPPING
    ----------------------------- */

    course: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      default: "",
    },

    chapter: {
      type: String,
      default: "",
    },

    subtopic: {
      type: String,
      default: "",
    },

    /* -----------------------------
       LEARNING SKILLS

       Snapshot of question-level skills.

       Source:
       QuestionBankV2.skills
    ----------------------------- */

    skillIds: {
      type: [String],
      default: [],
    },

    /* -----------------------------
       STEP-LEVEL SKILLS

       Snapshot of skills assigned to
       individual question steps.

       Source:
       QuestionBankV2.steps[].skills
    ----------------------------- */

    stepSkillMappings: {
      type: [StepSkillMappingSchema],
      default: [],
    },

    /* -----------------------------
       PART-LEVEL SKILLS

       Snapshot of skills assigned to
       individual question parts and
       their nested steps.

       Source:
       QuestionBankV2.parts[].skills
       QuestionBankV2.parts[].steps[].skills
    ----------------------------- */

    partSkillMappings: {
      type: [PartSkillMappingSchema],
      default: [],
    },

    /* -----------------------------
       CONCEPT RELATIONSHIPS
    ----------------------------- */

    conceptIds: {
      type: [String],
      default: [],
    },

    /* -----------------------------
       LEGACY COMPATIBILITY

       Retained so existing attempt
       records and older code do not
       break during migration.
    ----------------------------- */

    prerequisiteSkillIds: {
      type: [String],
      default: [],
    },

    /* -----------------------------
       SOURCE
    ----------------------------- */

    source: {
      type: String,
      enum: [
        "classroom",
        "chapter_journey",
        "daily_revision",
        "homework",
        "diagnostic",
        "targeted_practice",
        "mastery_check",
        "exam",
      ],
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      default: null,
    },

    /* -----------------------------
       EXAM REFERENCES
    ----------------------------- */

    examId: {
      type: Schema.Types.ObjectId,
      ref: "TeacherExamPaper",
      default: null,
    },

    examRecordId: {
      type: Schema.Types.ObjectId,
      ref: "ExamRecords",
      default: null,
      index: true,
    },

    /* -----------------------------
       STUDENT RESPONSE
    ----------------------------- */

    response: {
      type: StudentResponseSchema,
      required: true,
    },

    /* -----------------------------
       PERFORMANCE
    ----------------------------- */

    performance: {
      outcome: {
        type: String,
        enum: [
          "pending",
          "correct",
          "incorrect",
          "partially_correct",
          "skipped",
        ],
        default: "pending",
      },

      isCorrect: {
        type: Boolean,
        default: null,
      },

      marksAwarded: {
        type: Number,
        default: 0,
      },

      totalMarks: {
        type: Number,
        default: 0,
      },

      attemptNumber: {
        type: Number,
        default: 1,
      },

      hintsUsed: {
        type: Number,
        default: 0,
      },

      solutionViewed: {
        type: Boolean,
        default: false,
      },

      changedAnswer: {
        type: Boolean,
        default: false,
      },

      completed: {
        type: Boolean,
        default: true,
      },
    },

    /* -----------------------------
       EVALUATION
    ----------------------------- */

    evaluation: {
      status: {
        type: String,
        enum: [
          "pending",
          "evaluated",
          "teacher_reviewed",
        ],
        default: "pending",
      },

      stepResults: [
        {
          stepId: String,
          isCorrect: Boolean,
          marksAwarded: Number,
          errorTags: [String],
        },
      ],

      errorTags: [{ type: String }],

      misconceptions: [{ type: String }],

      feedback: {
        type: String,
        default: "",
      },

      evaluatedBy: {
        type: String,
        default: "",
      },
    },

    /* -----------------------------
       LEARNING SIGNALS

       These are evaluation outcomes,
       not the original question skills.

       They can be populated later by
       automatic or teacher evaluation.
    ----------------------------- */

    learningSignals: {
      skillsDemonstrated: {
        type: [String],
        default: [],
      },

      skillsNotDemonstrated: {
        type: [String],
        default: [],
      },

      conceptsUnderstood: {
        type: [String],
        default: [],
      },

      conceptsNeedingPractice: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

/* =========================================================
   INDEXES
========================================================= */

// Student's performance by subtopic.
QuestionAttemptSchema.index({
  studentId: 1,
  subtopic: 1,
  createdAt: -1,
});

// Question version history.
QuestionAttemptSchema.index({
  studentId: 1,
  questionId: 1,
  questionVersion: 1,
});

// Exam attempt lookup.
QuestionAttemptSchema.index({
  examRecordId: 1,
  questionId: 1,
});

// Student's attempts by source.
QuestionAttemptSchema.index({
  studentId: 1,
  source: 1,
  createdAt: -1,
});

// Student's performance by skill.
QuestionAttemptSchema.index({
  studentId: 1,
  skillIds: 1,
  createdAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

const QuestionAttempt: Model<any> =
  mongoose.models.QuestionAttempt ||
  mongoose.model(
    "QuestionAttempt",
    QuestionAttemptSchema
  );

export default QuestionAttempt;