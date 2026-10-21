import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongoose";
import User from "@/model/UserSchema";

import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { username, email, name, role, isSubscribed, password, avatar, courses } = body;

    if (!username || !email || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    let avatarUrl = "";
    if (avatar) {
      if (avatar.startsWith("data:") || avatar.startsWith("blob:")) {
        const uploadRes = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
          resource_type: "auto",
        });
        avatarUrl = uploadRes.secure_url;
      } else if (avatar.includes("res.cloudinary.com")) {
        avatarUrl = avatar;
      }
    }

    const newUser = new User({
      username,
      email,
      name,
      role,
      isSubscribed: isSubscribed || false,
      password: password || "",
      avatar: avatarUrl,
      courses: Array.isArray(courses)
        ? courses
        : typeof courses === "string" && courses.trim() !== ""
        ? courses.split(",").map((c) => c.trim())
        : [],
    });

    await newUser.save();
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
