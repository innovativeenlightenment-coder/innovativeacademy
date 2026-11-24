
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILiveSession extends Document {
  title: string;
  roomName: string;
  status: "live" | "ended";
  startedBy: Types.ObjectId;
  participantIds: Types.ObjectId[];
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

    participantIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

LiveSessionSchema.index({ status: 1, startedAt: -1 });
LiveSessionSchema.index({ participantIds: 1, status: 1 });
LiveSessionSchema.index({ startedBy: 1, status: 1 });

const LiveSession =
  (mongoose.models.LiveSession as mongoose.Model<ILiveSession>) ||
  mongoose.model<ILiveSession>(
    "LiveSession",
    LiveSessionSchema,
    "livesessions"
  );

export default LiveSession;
