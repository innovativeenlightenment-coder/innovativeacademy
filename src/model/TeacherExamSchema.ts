// import mongoose, { Schema, Types } from "mongoose";

// type TestType = "monthly" | "quarterly";

// const TeacherExamPaperSchema = new Schema(
//   {
//     testType: {
//       type: String,
//       enum: ["monthly", "quarterly"],
//       required: true,
//     },

//     teacherName: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Store full date-time range (best for scheduling)
//     startTime: { type: Date, required: true },
//     endTime: { type: Date, required: true },

//     // total questions in paper
//     totalQuestions: { type: Number, required: true, min: 1 },

//     // 20 sec per question (store for future change)
//     secondsPerQuestion: { type: Number, required: true, default: 20, min: 5 },

//     // selected questions (manual)
//     questionIds: [{ type: Schema.Types.ObjectId, ref: "QuestionBank", required: true }],

//     // optional: store filter context (helpful for UI listing)
//     course: { type: String, required: false, trim: true },
//     subject: { type: String, required: false, trim: true },
//     chapter: { type: String, required: false, trim: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.TeacherExamPaper ||
//   mongoose.model("TeacherExamPaper", TeacherExamPaperSchema);

import mongoose, { Schema } from "mongoose";

const TeacherExamPaperSchema = new Schema(
  {
    testType: {
      type: String,
      enum: ["monthly", "quarterly"],
      required: true,
    },

    teacherName: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    totalQuestions: { type: Number, required: true, min: 1 },

    // ✅ auto calculated = totalQuestions * 4
    totalMarks: { type: Number, required: true },

    secondsPerQuestion: {
      type: Number,
      required: true,
      default: 20,
      min: 5,
    },

    questionIds: [
      { type: Schema.Types.ObjectId, ref: "QuestionBank", required: true },
    ],

    course: { type: String, trim: true },
    subject: { type: String, trim: true },
    chapter: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.TeacherExamPaper ||
  mongoose.model("TeacherExamPaper", TeacherExamPaperSchema);
