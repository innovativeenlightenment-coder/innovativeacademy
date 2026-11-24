import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    noStore();

    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid question ID.",
        },
        { status: 400 }
      );
    }

    const deletedQuestion =
      await QuestionBankV2.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return NextResponse.json(
        {
          success: false,
          message: "Question not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Question deleted successfully.",
        deletedId: id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete Question Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Failed to delete question.",
      },
      { status: 500 }
    );
  }
}