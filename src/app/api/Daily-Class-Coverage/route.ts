
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import DailyClassCoverage from "@/model/DailyClassCoverage";

export const dynamic = "force-dynamic";

function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

async function requireTeacher() {
  const user = await getLiveUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      ),
    };
  }

  if (!["teacher", "admin"].includes(user.role)) {
    return {
      user: null,
      response: NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}

// GET: Fetch teaching coverage for a date
export async function GET(request: NextRequest) {
  try {
    const auth = await requireTeacher();
    if (auth.response) return auth.response;

    const dateKey = request.nextUrl.searchParams.get("date");

    if (!isValidDateKey(dateKey)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid date (YYYY-MM-DD) is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const coverages = await DailyClassCoverage.find({ dateKey })
      .sort({ subject: 1, course: 1, chapter: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        coverages: coverages.map((item: any) => ({
          ...item,
          _id: String(item._id),
          createdBy: String(item.createdBy),
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("DAILY CLASS COVERAGE GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load daily coverage.",
      },
      { status: 500 }
    );
  }
}

// POST: Create or update teaching coverage
export async function POST(request: NextRequest) {
  try {
    const auth = await requireTeacher();
    if (auth.response) return auth.response;

    const body = await request.json();

    const dateKey = body.dateKey;

    const course =
      typeof body.course === "string" ? body.course.trim() : "";

    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";

    const chapter =
      typeof body.chapter === "string" ? body.chapter.trim() : "";

    // Accept Question Bank subtopics AND manually entered subtopics.
    // Empty arrays are allowed so teachers can save coverage before class.
    const subtopics = Array.isArray(body.subtopics)
      ? Array.from(
          new Set(
            body.subtopics
              .filter(
                (item: unknown): item is string =>
                  typeof item === "string"
              )
              .map((item: string) => item.trim())
              .filter(Boolean)
          )
        )
      : [];

    if (
      !isValidDateKey(dateKey) ||
      !course ||
      !subject ||
      !chapter
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid date, course, subject and chapter are required.",
        },
        { status: 400 }
      );
    }

    // Prevent excessively large or invalid entries.
    if (
      subtopics.length > 100 ||
      subtopics.some((item:any) => item.length > 200)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many subtopics or a subtopic name is too long.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const coverage = await DailyClassCoverage.findOneAndUpdate(
      {
        dateKey,
        course,
        subject,
        chapter,
      },
      {
        $set: {
          subtopics,
        },
        $setOnInsert: {
          createdBy: auth.user!._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Teaching coverage saved.",
      coverage: coverage
        ? {
            ...coverage,
            _id: String(coverage._id),
          }
        : null,
    });
  } catch (error: any) {
    console.error("DAILY CLASS COVERAGE SAVE ERROR:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "This coverage entry already exists. Refresh and try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save teaching coverage.",
      },
      { status: 500 }
    );
  }
}
