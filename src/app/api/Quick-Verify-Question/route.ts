import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongoose";
import QuestionBankV2 from "@/model/QuestionBankV2";
import UserSchema from "@/model/UserSchema";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { id, userId } = body;

    // Validate question ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid question ID.",
        },
        { status: 400 }
      );
    }

    // Validate reviewer ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reviewer.",
        },
        { status: 400 }
      );
    }

    // Check reviewer exists
    const reviewer = await UserSchema.findById(userId).select("_id");

    if (!reviewer) {
      return NextResponse.json(
        {
          success: false,
          message: "Reviewer not found.",
        },
        { status: 404 }
      );
    }

    // Find question
    const question = await QuestionBankV2.findById(id);

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          message: "Question not found.",
        },
        { status: 404 }
      );
    }

    // Preserve existing verification information
    const existingVerification =
      question.verification?.toObject?.() ||
      question.verification ||
      {};

    // Update verification only
    question.verification = {
      ...existingVerification,
      status: "verified",

      checkedBy: String(reviewer._id),
      checkedAt: new Date(),
    };
    question.status = "published"
    await question.save();

    return NextResponse.json({
      success: true,
      message: "Question verified successfully.",
      question: {
        _id: question._id,
        verification: question.verification,
      },
    });
  } catch (error) {
    console.error("Quick verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify question.",
      },
      { status: 500 }
    );
  }
}