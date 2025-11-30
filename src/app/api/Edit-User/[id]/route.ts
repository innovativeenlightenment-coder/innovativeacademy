import { connectDB } from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

import { unstable_noStore as noStore } from 'next/cache';
import User from "@/model/UserSchema";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    const body = await req.json();
    const { username, email, name, role, isSubscribed, password, avatar, courses } = body;

    let avatarUrl = avatar;
    if (avatar && (avatar.startsWith("data:") || avatar.startsWith("blob:"))) {
      const uploadRes = await cloudinary.uploader.upload(avatar, {
        folder: "avatars",
        resource_type: "auto",
      });
      avatarUrl = uploadRes.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      {
        username,
        email,
        name,
        role,
        isSubscribed: isSubscribed || false,
        ...(password && { password }),
        ...(avatarUrl && { avatar: avatarUrl }),
        courses: Array.isArray(courses)
          ? courses
          : typeof courses === "string" && courses.trim() !== ""
          ? courses.split(",").map((c) => c.trim())
          : [],
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
