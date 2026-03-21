import mongoose from "mongoose";

const AnswersSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    ans: { type: String, required: true },
    selected: { type: String, required: true },
  },
  { _id: false }
);

const ExamRecordsSchema = new mongoose.Schema(
  {
    correct: { type: Number, required: true },
    incorrect: { type: Number, required: true },
examId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "TeacherExamPaper",
  required: true,
  index: true,
},
totalQuestions: { type: Number, required: true },
totalMarks: { type: Number, required: true },
unansweredCount: { type: Number, required: true },

    unanswered: { type: [AnswersSchema], required: true },
    Answers: { type: [AnswersSchema], required: true },

    // ❌ NO level field here (because no level-up)
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },

    username: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },

    testType: { type: String, required: true },
    course: { type: String, required: true },
    // subject: { type: String, required: true },
    // chapter: { type: String, required: true },

    duration: { type: Number, required: true },
    timeLeft: { type: Number, required: true },

    // ✅ extra for exam / leaderboard
    questionIds: { type: [String], default: [] },

    // ✅ control result timing
    resultStatus: {
      type: String,
      enum: ["pending", "published"],
      default: "pending",
      index: true,
    },
    publishAt: { type: Date, default: null, index: true },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.ExamRecords ||
  mongoose.model("ExamRecords", ExamRecordsSchema);
