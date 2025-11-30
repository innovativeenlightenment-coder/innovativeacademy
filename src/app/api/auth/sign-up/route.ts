import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";
import cloudinary from "@/lib/cloudinary";
import QuestionStructure from "@/model/QuestionStructure";

export async function POST(req: Request) {
  try {
    await connectDB();
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = "student";
    // const role = (formData.get("role") as string) || "student";
     const mobile = (formData.get("mobile") as string) ;
    const course = (formData.get("course") as string) || "";
    const isIndividual = formData.get("isIndividual") === "true";
    const avatarFile = formData.get("avatar") as File | null;

    // ✅ Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already exists" });
    }

    // ✅ Upload avatar if provided
    let avatarUrl = "";
    if (avatarFile) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${avatarFile.type};base64,${buffer.toString("base64")}`;
      const upload = await cloudinary.uploader.upload(base64, { folder: "avatars" });
      avatarUrl = upload.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Fetch all available courses
    const allCoursesData = await QuestionStructure.find({}, "-_id course");
    const allCourses = Array.from(
      new Set(allCoursesData.map((d: any) => d.course as string))
    );

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

const TRIAL_DAYS = 7;

const now = new Date();
const trialEnd = new Date(now.getTime() + 60 * 2000);


    // ✅ Build user data
    const userData: any = {
      // clerkId:"id",
      name,
      username,
      email,
      password: hashedPassword,
      role,
      mobile,
      isIndividual,
      avatar: avatarUrl,
      isEmailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
  //       trialStart: now,
  // trialEnd,
  // hasUsedTrial: true,
    };


    // ✅ Course assignment logic
    if (["student", "teacher"].includes(role)) {
      if (course === "AllCourse") {
        userData.courses = allCourses; // all courses
      } else if (course) {
        userData.courses = [course]; // single course
      } else {
        userData.courses = []; // none selected
      }
    }

    // ✅ Save user
    await User.create(userData);

    // ✅ Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify/${otp}`;
    await sendEmail(
      email,
      "Verify Your Account",
      `<p>Hello ${name},</p>
    
      <h3>click the link below to verify:</h3>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link will expire in 10 minutes.</p>`
    );

    return NextResponse.json({
      success: true,
      message: "Verify Link is sent to your email... Click to verify...",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ success: false, message: "Signup failed." });
  }
}
