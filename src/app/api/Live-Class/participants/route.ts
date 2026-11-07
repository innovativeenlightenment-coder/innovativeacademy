
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getLiveUser } from "@/lib/liveAuth";
import UserSchema from "@/model/UserSchema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getLiveUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (!["teacher", "admin"].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    await connectDB();

    const users = await UserSchema.find({
      role: "student",
      courses: {
        $in: ["Foundation 8th", "Foundation 9th"],
      },
    })
      .select("_id name username email avatar courses")
      .sort({ name: 1 })
      .lean();

    const formattedUsers = users.map((user: any) => ({
      _id: String(user._id),
      name: user.name || user.username,
      username: user.username,
      email: user.email,
      avatar: user.avatar || "",
      courses: user.courses || [],
    }));

    return NextResponse.json(
      {
        success: true,
        users: formattedUsers,
        groups: {
          foundation8: formattedUsers.filter((user) =>
            user.courses.includes("Foundation 8th")
          ),
          foundation9: formattedUsers.filter((user) =>
            user.courses.includes("Foundation 9th")
          ),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("LIVE PARTICIPANTS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch participants." },
      { status: 500 }
    );
  }
}
