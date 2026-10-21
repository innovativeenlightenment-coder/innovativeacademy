
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Explain from "@/model/Explain";
import { getTeacherFromRequest } from "@/lib/teacherAttendanceAuth_old";

export const dynamic = "force-dynamic";

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
}

async function authorize(request: NextRequest) {
  const auth = await getTeacherFromRequest(request);
  const user = auth?.user;

  if (!user?._id) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const isAdmin = String(user.role ?? "").toLowerCase() === "admin";

  return {
    user,
    isAdmin,
    response: null,
  };
}

function ownerFilter(user: { _id: unknown }, isAdmin: boolean) {
  return isAdmin ? {} : { uploadedBy: user._id };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const access = await authorize(request);
    if (access.response) return access.response;

    await connectDB();

    const params = request.nextUrl.searchParams;
    const search = params.get("search")?.trim() ?? "";
    const course = params.get("course") ?? "";
    const subject = params.get("subject") ?? "";
    const chapter = params.get("chapter") ?? "";

    const filter: Record<string, unknown> = {
      ...ownerFilter(access.user!, access.isAdmin!),
    };

    if (course) filter.course = course;
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { question: regex },
        { explanation: regex },
        { topic: regex },
        { course: regex },
        { subject: regex },
        { chapter: regex },
      ];
    }

    const items = await Explain.find(filter)
      .sort({ updatedAt: -1, _id: -1 })
      .lean();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET manage-explain error:", error);
    return NextResponse.json(
      { message: "Failed to load explain questions." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const access = await authorize(request);
    if (access.response) return access.response;

    const body = await request.json();
    const id = String(body.id ?? "");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid explain-question ID." },
        { status: 400 }
      );
    }

    const allowedFields = [
      "question",
      "explanation",
      "course",
      "subject",
      "chapter",
      "topic",
    ] as const;

    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return NextResponse.json(
            { message: `${field} must be text.` },
            { status: 400 }
          );
        }
        updates[field] = body[field].trim();
      }
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { message: "No changes provided." },
        { status: 400 }
      );
    }

    if (updates.question !== undefined && !updates.question) {
      return NextResponse.json(
        { message: "Question cannot be empty." },
        { status: 400 }
      );
    }

    if (updates.explanation !== undefined && !updates.explanation) {
      return NextResponse.json(
        { message: "Explanation cannot be empty." },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await Explain.findOneAndUpdate(
      {
        _id: id,
        ...ownerFilter(access.user!, access.isAdmin!),
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!item) {
      return NextResponse.json(
        { message: "Explain question not found or you cannot edit it." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Explain question updated successfully.",
      item,
    });
  } catch (error) {
    console.error("PATCH manage-explain error:", error);
    return NextResponse.json(
      { message: "Failed to update explain question." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await authorize(request);
    if (access.response) return access.response;

    const body = await request.json();
    const ids: string[] = Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => String(id))
      : body.id
        ? [String(body.id)]
        : [];

    const uniqueIds = Array.from(new Set(ids));

    if (
      uniqueIds.length === 0 ||
      uniqueIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      return NextResponse.json(
        { message: "Provide valid explain-question ID(s)." },
        { status: 400 }
      );
    }

    await connectDB();

    const permissionFilter = ownerFilter(access.user!, access.isAdmin!);
    const permitted = await Explain.countDocuments({
      _id: { $in: uniqueIds },
      ...permissionFilter,
    });

    if (permitted !== uniqueIds.length) {
      return NextResponse.json(
        {
          message:
            "Some explain questions were not found or cannot be deleted.",
        },
        { status: 403 }
      );
    }

    const result = await Explain.deleteMany({
      _id: { $in: uniqueIds },
      ...permissionFilter,
    });

    return NextResponse.json({
      message: `${result.deletedCount ?? 0} explain question(s) deleted.`,
      deletedCount: result.deletedCount ?? 0,
    });
  } catch (error) {
    console.error("DELETE manage-explain error:", error);
    return NextResponse.json(
      { message: "Failed to delete explain questions." },
      { status: 500 }
    );
  }
}
