import mongoose, { Schema, models, model } from "mongoose";

const AttendanceEntrySchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["present", "absent", "late", "leave"], required: true },
    note: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { _id: false }
);

const AttendanceSchema = new Schema(
  {
    course: { type: String, required: true, trim: true, index: true },
    dateKey: { type: String, required: true, trim: true, index: true }, // YYYY-MM-DD
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    entries: { type: [AttendanceEntrySchema], default: [] },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ course: 1, dateKey: 1 }, { unique: true });

export default models.Attendance || model("Attendance", AttendanceSchema);
