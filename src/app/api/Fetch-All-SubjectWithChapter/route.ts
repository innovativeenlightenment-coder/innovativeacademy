import { connectDB } from "@/lib/mongoose";
import QuestionStructure from "@/model/QuestionStructure";
import { NextResponse } from "next/server";
import {unstable_noStore as noStore} from 'next/cache';

export async function GET() {
  await connectDB();
  noStore()

        const data = await QuestionStructure.find({}, "_id course level subject chapter");

  return NextResponse.json({ success: true, data });
}
