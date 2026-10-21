import { NextRequest, NextResponse } from "next/server";
import { getTeacherFromRequest } from "@/lib/teacherAttendanceAuth_old";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const ALLOWED_FOLDERS = new Set([
  "revision-studio/questions",
  "revision-studio/options",
  "revision-studio/hints",
]);

export async function POST(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);

    if (auth.error) {
      return auth.error;
    }

    const body = await req.json().catch(() => null);
    const folder = body?.folder;

    if (typeof folder !== "string" || !ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json(
        { success: false, error: "Invalid upload folder." },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary environment variables are missing.");

      return NextResponse.json(
        { success: false, error: "Image upload is not configured." },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        timestamp,
      },
      apiSecret
    );

    return NextResponse.json(
      {
        success: true,
        cloudName,
        apiKey,
        timestamp,
        folder,
        signature,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Revision image signing error:", error);

    return NextResponse.json(
      { success: false, error: "Unable to prepare image upload." },
      { status: 500 }
    );
  }
}