
import { NextRequest, NextResponse } from "next/server";
import { getTeacherFromRequest } from "@/lib/teacherAttendanceAuth_old";
import cloudinary from "@/lib/cloudinary";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FOLDERS = new Set([
  "revision-studio/questions",
  "revision-studio/options",
  "revision-studio/hints",
]);

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
};

function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url || !result.public_id) {
          reject(new Error("Cloudinary returned an incomplete upload result."));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );

    stream.on("error", reject);
    stream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);

    if (auth.error) {
      return auth.error;
    }

    const formData = await req.formData();
    const fileEntry = formData.get("file");
    const folderEntry = formData.get("folder");

    if (typeof folderEntry !== "string" || !ALLOWED_FOLDERS.has(folderEntry)) {
      return NextResponse.json(
        { success: false, error: "Invalid upload folder." },
        { status: 400 }
      );
    }

    if (
      !fileEntry ||
      typeof fileEntry === "string" ||
      typeof fileEntry.arrayBuffer !== "function"
    ) {
      return NextResponse.json(
        { success: false, error: "Choose an image to upload." },
        { status: 400 }
      );
    }

    const file = fileEntry as File;

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported image type. Use JPG, PNG, WEBP, GIF, or AVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { success: false, error: "The selected image is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Images must be 5 MB or smaller." },
        { status: 413 }
      );
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary environment variables are missing.");

      return NextResponse.json(
        { success: false, error: "Image upload is not configured." },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await uploadBufferToCloudinary(buffer, folderEntry);

    return NextResponse.json(
      {
        success: true,
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        folder: folderEntry,
        bytes: uploaded.bytes,
        format: uploaded.format,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Revision image upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to upload the image. Please try again.",
      },
      { status: 500 }
    );
  }
}
