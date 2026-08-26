import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import LearningVideo from "@/model/LearningVideo.ts";

// GET - Fetch videos
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");
    const subject = searchParams.get("subject");
    const date = searchParams.get("date");

   const includeUnpublished =
  searchParams.get("includeUnpublished") === "true";

const filter: Record<string, unknown> = {};

if (!includeUnpublished) {
  filter.isPublished = true;
}

    if (type) {
      filter.type = type;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: start,
        $lte: end,
      };
    }

    const videos = await LearningVideo.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(videos);
  } catch (error) {
    console.error("GET learning videos error:", error);

    return NextResponse.json(
      { message: "Failed to fetch learning videos" },
      { status: 500 }
    );
  }
}

// POST - Create video
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      type,
      date,
      subject,
      chapter,
      title,
      description,
      duration,
      youtubeVideoId,
      isPublished = true,
    } = body;

    if (!type || !subject || !title || !youtubeVideoId) {
      return NextResponse.json(
        {
          message:
            "type, subject, title and youtubeVideoId are required",
        },
        { status: 400 }
      );
    }

    if (!["daily", "oneShot"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid video type" },
        { status: 400 }
      );
    }

    if (type === "daily" && !date) {
      return NextResponse.json(
        { message: "Date is required for daily lectures" },
        { status: 400 }
      );
    }

    if (type === "oneShot" && !chapter) {
      return NextResponse.json(
        { message: "Chapter is required for one-shots" },
        { status: 400 }
      );
    }

    const video = await LearningVideo.create({
      type,
      date: type === "daily" ? date : undefined,
      subject,
      chapter: type === "oneShot" ? chapter : undefined,
      title,
      description,
      duration,
      youtubeVideoId,
      isPublished,
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("POST learning video error:", error);

    return NextResponse.json(
      { message: "Failed to create learning video" },
      { status: 500 }
    );
  }
}