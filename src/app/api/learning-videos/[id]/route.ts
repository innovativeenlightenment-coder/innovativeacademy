import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import LearningVideo from "@/model/LearningVideo";

// GET - Fetch single video
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const video = await LearningVideo.findById(id).lean();

    if (!video) {
      return NextResponse.json(
        { message: "Learning video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("GET single learning video error:", error);

    return NextResponse.json(
      { message: "Failed to fetch learning video" },
      { status: 500 }
    );
  }
}

// DELETE - Delete video
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const video = await LearningVideo.findByIdAndDelete(id);

    if (!video) {
      return NextResponse.json(
        { message: "Learning video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Learning video deleted successfully",
    });
  } catch (error) {
    console.error("DELETE learning video error:", error);

    return NextResponse.json(
      { message: "Failed to delete learning video" },
      { status: 500 }
    );
  }
}