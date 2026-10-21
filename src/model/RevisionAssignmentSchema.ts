import { Schema, models, model } from "mongoose";

const RevisionActivitySchema = new Schema(
  {
    type: { type: String, enum: ["mcq", "explain", "flashcard", "rapid_fire"], required: true },
    prompt: { type: String, trim: true, maxlength: 4000, default: "" },
    imageUrl: { type: String, trim: true, maxlength: 2000, default: "" },
    options: { type: [String], default: [] },
    optionType: { type: String, enum: ["text", "image"], default: "text" },
    optionImages: { type: [String], default: [] },
    // For text options this stores the correct option text; for image options it stores A/B/C/D.
    correctAnswer: { type: String, required: true, trim: true, maxlength: 5000 },
    explanation: { type: String, trim: true, maxlength: 5000, default: "" },
    hintType: { type: String, enum: ["text", "image"], default: "text" },
    hint: { type: String, trim: true, maxlength: 5000, default: "" },
    hintImageUrl: { type: String, trim: true, maxlength: 2000, default: "" },
    marks: { type: Number, min: 0, max: 100, default: 1 },
    difficulty: { type: String, enum: ["easy", "moderate", "difficult"], default: "moderate" },
    timeLimitSeconds: { type: Number, enum: [0, 15, 20], default: 0 },
  },
  { _id: true }
);

const RevisionStudentStatusSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["not_attempted", "attempted", "completed"], default: "not_attempted" },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const RevisionAssignmentSchema = new Schema(
  {
    course: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    instructions: { type: String, trim: true, maxlength: 3000, default: "" },
    subject: { type: String, trim: true, maxlength: 100, default: "" },
    chapter: { type: String, trim: true, maxlength: 160, default: "" },
    topic: { type: String, trim: true, maxlength: 160, default: "" },
    assignedDate: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    activities: { type: [RevisionActivitySchema], validate: [(value: unknown[]) => value.length > 0, "Add at least one activity."] },
    studentStatuses: { type: [RevisionStudentStatusSchema], default: [] },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RevisionAssignmentSchema.index({ course: 1, dueDate: 1 });
RevisionAssignmentSchema.index({ "studentStatuses.studentId": 1, published: 1 });

export default models.RevisionAssignment || model("RevisionAssignment", RevisionAssignmentSchema);
