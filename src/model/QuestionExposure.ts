import mongoose, { Schema, Model } from "mongoose";

const QuestionExposureSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "UserSchema",
      index: true,
    },

    questionId: {
      type: String,
      required: true,
    },

    questionVersion: {
      type: Number,
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

    chapter: {
      type: String,
      required: true,
    },

    subtopic: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      enum: [
        "daily_practice",
        "chapter_journey",
        "homework",
        "diagnostic",
        "exam",
      ],
      required: true,
    },

    firstSeenAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    timesSeen: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

QuestionExposureSchema.index(
  {
    studentId: 1,
    questionId: 1,
    questionVersion: 1,
  },
  {
    unique: true,
  }
);

QuestionExposureSchema.index({
  studentId: 1,
  course: 1,
  subject: 1,
  chapter: 1,
});

const QuestionExposure: Model<any> =
  mongoose.models.QuestionExposure ||
  mongoose.model("QuestionExposure", QuestionExposureSchema);

export default QuestionExposure;