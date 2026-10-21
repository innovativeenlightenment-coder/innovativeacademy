import mongoose, { Schema, models, model } from "mongoose";

const ExamAttendanceEntrySchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["unmarked", "present", "absent"], default: "unmarked", required: true },
    note: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { _id: false }
);

const ExamSessionSchema = new Schema(
  {
    course: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    examDate: { type: String, required: true, trim: true, index: true },
    examType: { type: String, enum: ["online_mcq", "offline_theory"], required: true },
    instructions: { type: String, trim: true, maxlength: 1000, default: "" },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    entries: { type: [ExamAttendanceEntrySchema], default: [] },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ExamSessionSchema.index({ course: 1, examDate: 1, title: 1 });
export default models.ExamSession || model("ExamSession", ExamSessionSchema);
