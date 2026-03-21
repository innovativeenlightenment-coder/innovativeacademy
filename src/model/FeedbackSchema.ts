import mongoose, { Schema, Document } from "mongoose";

export interface FeedbackType extends Document {
  userId: string;
  name: string;
  email: string;
  profilePic: string;
  rating: number;
  message: string;
}

const FeedbackSchema = new Schema(
  {
    userId: { type: String, required: true },
    name: String,
    email: String,
    profilePic: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback ||
  mongoose.model("Feedback", FeedbackSchema);
