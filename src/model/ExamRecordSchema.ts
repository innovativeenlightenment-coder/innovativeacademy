import mongoose, { Schema, Model } from "mongoose";

const { Mixed } = Schema.Types;

// Individual question evaluation
const QuestionEvaluationSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "auto_evaluated",
        "manual_review",
        "evaluated",
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

    feedback: {
      type: String,
      default: "",
    },

    evaluatedAt: {
      type: Date,
      default: null,
    },

    evaluatedBy: {
      type: String,
      default: "",
    },

    breakdown: {
      type: [Mixed],
      default: [],
    },
  },
  { _id: false }
);

// Student's response to an individual question
const QuestionResponseSchema = new Schema(
  {
    questionDocumentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    questionId: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      required: true,
    },

    setId: {
      type: String,
      default: null,
    },

    order: {
      type: Number,
      required: true,
    },

    marks: {
      type: Number,
      required: true,
      min: 0,
    },

    response: {
      type: Mixed,
      default: null,
    },

    responseStatus: {
      type: String,
      enum: ["answered", "unanswered"],
      default: "unanswered",
    },

    evaluation: {
      type: QuestionEvaluationSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

// Snapshot of exam information
const ExamSnapshotSchema = new Schema(
  {
    title: String,
    testType: String,
    course: String,
    subject: String,
    chapters: [String],
    teacherName: String,
  },
  { _id: false }
);

const ExamRecordsSchema = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "TeacherExam",
      required: true,
    },

    student: {
      username: {
        type: String,
        default: "",
      },

      name: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
    },

    exam: {
      type: ExamSnapshotSchema,
      required: true,
    },

    questions: {
      type: [QuestionResponseSchema],
      default: [],
    },

    submissionStatus: {
      type: String,
      enum: ["submitted"],
      default: "submitted",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    evaluationStatus: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "under_review",
        "completed",
      ],
      default: "pending",
    },

    evaluatedAt: {
      type: Date,
      default: null,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    answeredCount: {
      type: Number,
      default: 0,
    },

    unansweredCount: {
      type: Number,
      default: 0,
    },

    correctCount: {
      type: Number,
      default: 0,
    },

    incorrectCount: {
      type: Number,
      default: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
    },

    obtainedMarks: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    // All time values are in seconds.
    allowedSeconds: {
      type: Number,
      default: 0,
    },

    timeSpentSeconds: {
      type: Number,
      default: 0,
    },

    reportedTimeLeftSeconds: {
      type: Number,
      default: 0,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    resultStatus: {
      type: String,
      enum: ["pending", "published"],
      default: "pending",
    },

    publishAt: {
      type: Date,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Student's submitted exam history
ExamRecordsSchema.index({
  "student.email": 1,
  submittedAt: -1,
});

// Exam-wise submissions
ExamRecordsSchema.index({
  examId: 1,
  submittedAt: -1,
});

// One submission per student per exam
ExamRecordsSchema.index(
  {
    examId: 1,
    "student.email": 1,
  },
  { unique: true }
);

const ExamRecords: Model<any> =
  mongoose.models.ExamRecords ||
  mongoose.model("ExamRecords", ExamRecordsSchema);

export default ExamRecords;