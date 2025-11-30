import { connectDB } from "@/lib/mongoose";
import QuestionBankSchema from "@/model/QuestionBankSchema";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  
  const list = await QuestionBankSchema.distinct("uploadedBy"); // excluding level & level_olds
  return NextResponse.json({ ok: true, list });
}
