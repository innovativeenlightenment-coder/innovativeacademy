
import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDailyClassCoverage extends Document {
  dateKey: string;
  course: string;
  subject: string;
  chapter: string;
  subtopics: string[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DailyClassCoverageSchema = new Schema<IDailyClassCoverage>(
  {
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      trim: true,
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    chapter: {
      type: String,
      required: true,
      trim: true,
    },

    subtopics: {
      type: [String],
      default: [],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

DailyClassCoverageSchema.index(
  {
    dateKey: 1,
    course: 1,
    subject: 1,
    chapter: 1,
  },
  { unique: true }
);

DailyClassCoverageSchema.index({
  dateKey: 1,
  subject: 1,
});

const DailyClassCoverage =
  (mongoose.models.DailyClassCoverage as mongoose.Model<IDailyClassCoverage>) ||
  mongoose.model<IDailyClassCoverage>(
    "DailyClassCoverage",
    DailyClassCoverageSchema,
    "dailyclasscoverages"
  );

export default DailyClassCoverage;
