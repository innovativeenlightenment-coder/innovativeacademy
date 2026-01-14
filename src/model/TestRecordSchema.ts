import mongoose from "mongoose";


const AnswersSchema = new mongoose.Schema({
    id: {type: String, required: true},
   ans: {type: String, required: true},
   selected: { type: String,required:true }
 });


const TestRecords = new mongoose.Schema({

 correct:{
type: Number,
required:true,
 },
  incorrect: {
    type: Number,
    required: true,
  },
  unanswered: {
    type: [AnswersSchema],
    required: true,
  },
   Answers:{
type: [AnswersSchema],
required:true,
 },
 level:{
  type:String
 },
  score: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
    username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  testType:{
type:String,
  },
    name: {
    type: String,
    required: true,
  },
      course: {
    type: String,
    required: true,
  },
      subject: {
    type: String,
    required: true,
  },
      chapter: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
   
    default: Date.now
  },

}, { timestamps: true });

export default mongoose.models.TestRecords || mongoose.model("TestRecords", TestRecords);
