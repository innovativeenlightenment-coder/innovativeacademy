import { NextRequest, NextResponse } from "next/server";
import { Question } from "@/types/questionType";

import { unstable_noStore as noStore } from 'next/cache';
import { connectDB } from "@/lib/mongoose";
import { verifyTokenEdge } from "@/lib/verifyToken";
import User from "@/model/UserSchema";
import TestRecordSchema from "@/model/TestRecordSchema";

type SubmittedAnswers = Record<string, string>;

export async function POST(req: NextRequest) {
  noStore();
  
  try {
    await connectDB()
      const token = req.cookies.get("token")?.value;
      if (!token) {
        return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
      }
    
      const decoded = await verifyTokenEdge(token);
      if (!decoded || !decoded.id) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
      }
    
      const user = await User.findById(decoded.id);
      if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
    const body = await req.json();
    const {correct, incorrect, unanswered, score, percentage, Answers, course,subject,chapter}=body
    // const { generatedQuestions, submittedAnswers }: {
    //   generatedQuestions: Question[];
    //   submittedAnswers: SubmittedAnswers;
    // } = body;

    // let correct = 0;
    // let incorrect = 0;
    
    // const Answers: { id: string; ans: string;selected:string; }[]= [];
    
    // const unanswered: string[] = [];

    // const totalMarks = generatedQuestions.length*4;

    // generatedQuestions.forEach((question, index) => {
    //   const selected = submittedAnswers[question._id];

    //   if (!selected) {
    //     unanswered.push(question._id);
    //   } else if (selected === question.answer) {
    //     correct++;
    //     Answers.push({id:question._id,ans:"correct",selected})
    //   } else {
    //     incorrect++;
    //     Answers.push({id:question._id,ans:"incorrect",selected})
    //   }
    // });

    // const score = correct * 4 - incorrect * 1;
    // const percentage = Math.round((score / totalMarks) * 100);
const date=new Date();
    const newTestRecord={
      correct,
      incorrect,
      unanswered,
      Answers,
      score,
      percentage,
      username:user.username,
      email:user.email,
      name:user.name,
date,
course,subject,chapter
    }

    await TestRecordSchema.create(newTestRecord);

    return NextResponse.json({
      correct,
      incorrect,
      unanswered,
      Answers,
      score,
      percentage,course,subject,chapter
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
