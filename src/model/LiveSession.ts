
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILiveSession extends Document {
  title: string;
  subject: string;
  description?: string;
  roomName: string;
  status: "live" | "ended";
  startedBy: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LiveSessionSchema = new Schema<ILiveSession>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    roomName: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["live", "ended"],
      default: "live",
      required: true,
    },
    startedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Only one live class can exist across the academy at a time.
LiveSessionSchema.index(
  { status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "live" },
  }
);

const LiveSession =
  (mongoose.models.LiveSession as mongoose.Model<ILiveSession>) ||
  mongoose.model<ILiveSession>(
    "LiveSession",
    LiveSessionSchema,
    "livesessions"
  );

export default LiveSession;