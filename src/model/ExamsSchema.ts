import mongoose, { Schema } from "mongoose";

/* ================= CHAPTER CONFIG ================= */

const ChapterConfigSchema = new Schema(
  {
    // MUST match QuestionStructure.chapter exactly
    chapter: {
      type: String,
      required: true,
      trim: true,
    },

    noOfQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

/* ================= MAIN EXAM SCHEMA ================= */

const ExamsSchema = new Schema(
  {
    testType: {
      type: String,
      enum: ["monthly", "quarterly"],
      required: true,
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    chapters: {
      type: [ChapterConfigSchema],
      required: true,
      validate: {
        validator: (v: any[]) => v.length > 0,
        message: "At least one chapter is required",
      },
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

/* ================= EXPORT ================= */

export default mongoose.models.Exams ||
  mongoose.model("Exams", ExamsSchema);
