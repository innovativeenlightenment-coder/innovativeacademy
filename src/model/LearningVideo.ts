import mongoose, { Document, Schema } from "mongoose";

export interface ILearningVideo extends Document {
  type: "daily" | "oneShot";

  date?: Date;

  subject: "Physics" | "Chemistry" | "Mathematics" | "Biology";

  chapter?: string;

  title: string;
  description?: string;

  duration?: number;

  youtubeVideoId: string;

  isPublished: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const LearningVideoSchema = new Schema<ILearningVideo>(
  {
    type: {
      type: String,
      enum: ["daily", "oneShot"],
      required: true,
    },

    date: {
      type: Date,
    },

    subject: {
      type: String,
      enum: [
        "Physics",
        "Chemistry",
        "Mathematics",
        "Biology",
      ],
      required: true,
    },

    chapter: {
      type: String,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    duration: {
      type: Number,
    },

    youtubeVideoId: {
      type: String,
      required: true,
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

LearningVideoSchema.index({
  type: 1,
  date: -1,
  isPublished: 1,
});

LearningVideoSchema.index({
  type: 1,
  subject: 1,
  chapter: 1,
  isPublished: 1,
});

export default mongoose.models.LearningVideo ||
  mongoose.model<ILearningVideo>(
    "LearningVideo",
    LearningVideoSchema
  );