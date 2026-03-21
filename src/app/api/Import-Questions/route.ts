import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/mongoose";
import QuestionBank from "@/model/QuestionBankSchema"; // update path as needed
import { unstable_noStore as noStore } from "next/cache";
// import { clerkClient } from '@clerk/clerk-sdk-node'; // ✅ correct source for clerkClient
import UserSchema from "@/model/UserSchema";




export async function POST(request: Request) {
    noStore()
  try {
    await connectDB(); // make sure DB connected


  
  const {userId,questions} = await request.json();
 if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
   
var firstName="Name"
if (userId) {
  // const user = await clerkClient.users.getUser(userId);
  const user= await UserSchema.findById(userId)
  firstName = user.name || user.email[0] || 'Unknown';
}

 

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid input: questions array required" },
        { status: 400 }
      );
    }

    const formattedQuestions = questions.map((q: any) => {
      // Transform separate optionA, optionB... to array options
      return {
        questionType: "text",
        optionType: "text",
        question: {
          text: q["question"] || "",
          imgUrl: "",
        },
        options: [
          { text: q["optionA"] || "", imgUrl:  "" },
          { text: q["optionB"] || "", imgUrl:  "" },
          { text: q["optionC"] || "", imgUrl:  "" },
          { text: q["optionD"] || "", imgUrl:  "" },
        ],
        answer: q.answer,
        level: q.level,
           course: q.course,
        subject: q.subject,
        chapter: q.chapter,
        uploadedBy: firstName,
        hintType: "text",
        hint:{
          text: q["hint"] || "",
          imgUrl: "",
        },
      };
    });

    
    // Optional: validate each question options length === 4
    for (const fq of formattedQuestions) {
      if (fq.options.length !== 4) {
        return NextResponse.json(
          { error: "Each question must have exactly 4 options" },
          { status: 400 }
        );
      }
    }

    // Insert many at once
    await QuestionBank.insertMany(formattedQuestions);

    return NextResponse.json({ message: "Questions imported successfully",ok:true });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}