import { connectDB } from "@/lib/mongoose";
import QuestionStructure from "@/model/QuestionStructure";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  
        const data = await QuestionStructure.find({}, "_id course level subject chapter");

  return NextResponse.json({ success: true, data });
}
