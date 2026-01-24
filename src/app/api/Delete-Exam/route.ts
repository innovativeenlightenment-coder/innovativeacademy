import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Exams from "@/model/ExamsSchema";
import { unstable_noStore as noStore } from "next/cache";
import mongoose from "mongoose";

export async function DELETE(req: Request) {
  noStore();
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    }

    const deleted = await Exams.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
