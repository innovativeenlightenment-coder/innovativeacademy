import mongoose, { Schema, Model } from "mongoose";

const SkillMasteryEventSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    attemptId: {
      type: Schema.Types.ObjectId,
      ref: "QuestionAttempt",
      required: true,
    },

    examRecordId: {
      type: Schema.Types.ObjectId,
      ref: "ExamRecords",
      required: true,
    },

    skillId: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      default: "exam",
    },

    outcome: {
      type: String,
      enum: ["correct", "partial", "incorrect", "skipped"],
      required: true,
    },

    marksAwarded: {
      type: Number,
      default: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
    },

    hintsUsed: {
      type: Number,
      default: 0,
    },

    independent: {
      type: Boolean,
      default: true,
    },

    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// A question attempt can contribute only one event per skill.
SkillMasteryEventSchema.index(
  {
    attemptId: 1,
    skillId: 1,
  },
  {
    unique: true,
  }
);

SkillMasteryEventSchema.index({
  studentId: 1,
  skillId: 1,
  createdAt: -1,
});

const SkillMasteryEvent: Model<any> =
  mongoose.models.SkillMasteryEvent ||
  mongoose.model("SkillMasteryEvent", SkillMasteryEventSchema);

export default SkillMasteryEvent;