import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import mongoose from "mongoose";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    noStore();

    await connectDB();

    const body = await req.json();

    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide question IDs.",
        },
        { status: 400 }
      );
    }

    if (ids.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum 500 questions can be deleted at once.",
        },
        { status: 400 }
      );
    }

    // Remove duplicates.
  const uniqueIds: string[] = Array.from(
  new Set<string>(
    ids.map((id: unknown) => String(id))
  )
);

    // Validate every ID before deleting anything.
    const invalidIds = uniqueIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more question IDs are invalid.",
          invalidIds,
        },
        { status: 400 }
      );
    }

    const result = await QuestionBankV2.deleteMany({
      _id: {
        $in: uniqueIds,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${result.deletedCount} question(s) deleted successfully.`,
        deletedCount: result.deletedCount,
        requestedCount: uniqueIds.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Bulk Delete Questions Error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Failed to delete questions.",
      },
      { status: 500 }
    );
  }
}