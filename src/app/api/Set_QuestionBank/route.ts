import { connectDB } from '@/lib/mongoose';
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import QuestionBankSchema from '@/model/QuestionBankSchema';

import { unstable_noStore as noStore } from 'next/cache';
// import { clerkClient } from '@clerk/clerk-sdk-node'; // ✅ correct source for clerkClient
import UserSchema from '@/model/UserSchema';

// Match the schema fields exactly
type QuestionPayload = {
  questionType: 'text' | 'image';
  optionType: 'text' | 'image';
  question: string; // either text or base64 image
  options: { value: string }[]; // 4 options, each text or base64 image
  answer: 'A' | 'B' | 'C' | 'D';
  level: "Easy" | "Medium" | "Difficult" | "Moderate" | "Very Easy" | "Extreme" | "Excellent";
  course:string;
  hintType:'text'|'image';
hint:string;
  subject: string;
  chapter: string;
};

export async function POST(req: NextRequest) {
  try {
    noStore();
    await connectDB();
 const body = await req.json();

// safely extract questions
const questions: QuestionPayload[] = body.data?.questions;
const userId = body.userId;

if (!questions || !Array.isArray(questions) || questions.length === 0) {
  return NextResponse.json({ error: 'No questions provided or invalid format' }, { status: 400 });
}

// handle uploadedBy, including typo in payload
const uploadedBy = body.data?.uploadedBy || body.data?.uplodedBy || 'Unknown';
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
let firstName = "Name";
if (userId) {
  // const user = await clerkClient.users.getUser(userId);
  const user=await UserSchema.findById(userId)
  firstName = user.name || user.email || 'Unknown';
}
const processedQuestions = await Promise.all(
  questions.map(async (q) => {
    let questionData: { text: string | null; imgUrl: string | null } = { text: null, imgUrl: null };

    if (q.questionType === 'image') {
      const uploadRes = await cloudinary.uploader.upload(q.question, {
        folder: 'test-series/questions',
        resource_type: 'image',
      });
      questionData.imgUrl = uploadRes.secure_url;
    } else {
      questionData.text = q.question;
    }



 let hintData: { text: string | null; imgUrl: string | null } = { text: null, imgUrl: null };

    if (q.hintType === 'image') {
      const uploadRes = await cloudinary.uploader.upload(q.hint, {
        folder: 'test-series/hints',
        resource_type: 'image',
      });
      hintData.imgUrl = uploadRes.secure_url;
    } else {
      hintData.text = q.hint;
    }

    const updatedOptions = await Promise.all(
      q.options.map(async (opt) => {
        if (q.optionType === 'image') {
          const uploadRes = await cloudinary.uploader.upload(opt.value, {
            folder: 'test-series/options',
            resource_type: 'image',
          });
          return { text: null, imgUrl: uploadRes.secure_url };
        }
        return { text: opt.value, imgUrl: null };
      })
    );

    return {
      questionType: q.questionType,
      optionType: q.optionType,
      question: questionData,
      options: updatedOptions,
      answer: q.answer,
      hint:hintData,
      hintType:q.hintType,
      level: q.level,
         course: q.course,
      subject: q.subject,
      chapter: q.chapter,
      uploadedBy:uploadedBy||firstName, // Replace with actual user ID if available
    };
  })
);

    const saved = await QuestionBankSchema.insertMany(processedQuestions);

    return NextResponse.json({ message: 'Questions saved successfully',ok:true, saved }, { status: 201 });
  } catch (err: any) {
    console.error('Error saving questions:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
