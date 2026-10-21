import mongoose, { Schema, models, model } from "mongoose";

const StudentTaskStatusSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentStatus: { type: String, enum: ["pending", "submitted"], default: "pending" },
    studentNote: { type: String, trim: true, maxlength: 1000, default: "" },
    submittedAt: { type: Date, default: null },
    teacherStatus: { type: String, enum: ["pending", "verified", "needs_revision"], default: "pending" },
    teacherNote: { type: String, trim: true, maxlength: 500, default: "" },
    verifiedAt: { type: Date, default: null },
  },
  { _id: false }
);

const StudentTaskSchema = new Schema(
  {
    course: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    taskType: { type: String, enum: ["homework", "revision", "project", "other"], default: "homework" },
    assignedDate: { type: String, required: true, trim: true }, // YYYY-MM-DD
    dueDate: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentStatuses: { type: [StudentTaskStatusSchema], default: [] },
  },
  { timestamps: true }
);

StudentTaskSchema.index({ course: 1, dueDate: 1 });

export default models.StudentTask || model("StudentTask", StudentTaskSchema);
