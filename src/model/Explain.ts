import mongoose, { Schema, models, model } from "mongoose";

const ExplainSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "RevisionAssignment",
      required: true,
    },
    question: { type: String, required: true },
    explanation: { type: String },
    course: { type: String, required: true },
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    topic: { type: String, default: "" },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Explain ||
  model("Explain", ExplainSchema);