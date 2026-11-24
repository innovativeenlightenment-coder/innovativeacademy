export const dynamic = "force-dynamic";  import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  
  const list = await QuestionBankV2.distinct("uploadedBy"); // excluding level & level_olds
  return NextResponse.json({ ok: true, list });
}
