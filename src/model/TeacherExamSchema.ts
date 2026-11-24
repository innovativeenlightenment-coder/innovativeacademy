import mongoose, { Schema, Model } from "mongoose";

const ExamQuestionSchema = new Schema(
  {
    questionDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "QuestionBankV2",
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
      default: "A",
    },
    marks: {
      type: Number,
      required: true,
      min: 0.5,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const ExamSetSchema = new Schema(
  {
    setId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const TeacherExamSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    testType: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "chapter"],
      required: true,
    },

    teacherName: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    chapters: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "At least one chapter is required.",
      },
    },

    schedule: {
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
      durationMinutes: {
        type: Number,
        required: true,
        min: 1,
      },
    },

    distribution: {
      mode: {
        type: String,
        enum: ["same", "sets"],
        default: "same",
      },
      shuffleQuestions: {
        type: Boolean,
        default: true,
      },
      shuffleOptions: {
        type: Boolean,
        default: false,
      },
    },

    questions: {
      type: [ExamQuestionSchema],
      required: true,
    },

    sets: {
      type: [ExamSetSchema],
      default: [],
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "scheduled",
    },

    createdBy: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

TeacherExamSchema.index({ "schedule.startTime": 1 });
TeacherExamSchema.index({ course: 1, subject: 1 });
TeacherExamSchema.index({ status: 1 });

const TeacherExam: Model<any> =
  mongoose.models.TeacherExam ||
  mongoose.model("TeacherExam", TeacherExamSchema);

export default TeacherExam;