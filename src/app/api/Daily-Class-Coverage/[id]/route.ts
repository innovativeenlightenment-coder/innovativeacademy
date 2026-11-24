import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import DailyClassCoverage from "@/model/DailyClassCoverage";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getLiveUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (!["teacher", "admin"].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid coverage ID." },
        { status: 400 }
      );
    }

    await connectDB();

    // Coverage is shared across the academy, so any authorized teacher/admin
    // can correct or remove an entry when needed.
    const deleted = await DailyClassCoverage.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Coverage entry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coverage entry deleted.",
    });
  } catch (error) {
    console.error("DAILY CLASS COVERAGE DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete coverage entry." },
      { status: 500 }
    );
  }
}
