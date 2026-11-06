import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongoose";
import User from "@/model/UserSchema";

export async function getLiveUser() {
  try {
    const token = cookies().get("token")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return null;
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload.id !== "string" ||
      !payload.id
    ) {
      return null;
    }

    await connectDB();

    const user = await User.findById(payload.id).select(
      "_id name username email role avatar"
    );

    return user || null;
  } catch {
    return null;
  }
}