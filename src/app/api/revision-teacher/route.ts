
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  getTeacherFromRequest,
  normalizeCourse,
} from "@/lib/teacherAttendanceAuth_old";
import User from "@/model/UserSchema";
import RevisionAssignment from "@/model/RevisionAssignmentSchema";
import QuestionBank from "@/model/QuestionBankSchema";
import cloudinary from "@/lib/cloudinary";
import Explain from "@/model/Explain";
import Flashcard from "@/model/Flashcard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AnyRecord = Record<string, any>;

const ANSWER_LETTERS = ["A", "B", "C", "D"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const LEVEL_MAP: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  difficult: "Difficult",
};

function isChoiceType(type: string) {
  return type === "mcq" || type === "rapid_fire";
}

function isCloudinaryUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com"
    );
  } catch {
    return false;
  }
}

/**
 * Upload an image file to Cloudinary from the server.
 */
async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Each image must be smaller than 5 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        // timeout: 30_000,
      },
      (error, result) => {
        if (error) {
          console.error(
            `[Revision Publish] Cloudinary error (${folder}):`,
            error
          );

          reject(
            new Error(
              "An image could not be uploaded. Please try again."
            )
          );

          return;
        }

        if (!result?.secure_url) {
          reject(
            new Error("Cloudinary did not return an image URL.")
          );

          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

/**
 * Retain support for data URLs from older clients.
 */
async function uploadIfDataUrl(
  value: string,
  folder: string
): Promise<string> {
  if (!value || !value.startsWith("data:image/")) {
    return value;
  }

  try {
    const uploaded = await cloudinary.uploader.upload(value, {
      folder,
      resource_type: "image",
      timeout: 30_000,
    });

    return uploaded.secure_url;
  } catch (error) {
    console.error(
      `[Revision Publish] Cloudinary upload failed (${folder}):`,
      error
    );

    throw new Error(
      "An image could not be uploaded. Please try again."
    );
  }
}

/**
 * Resolve placeholders such as:
 * pending:0-imageUrl
 * pending:0-hintImageUrl
 * pending:0-option-0
 */
async function resolveImageValue(
  value: unknown,
  files: Map<string, File>,
  folder: string
): Promise<string> {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("pending:")) {
    const key = trimmed.slice("pending:".length);
    const file = files.get(key);

    if (!file) {
      throw new Error(
        `An image is missing for "${key}". Please select it again.`
      );
    }

    return uploadFileToCloudinary(file, folder);
  }

  if (trimmed.startsWith("data:image/")) {
    return uploadIfDataUrl(trimmed, folder);
  }

  if (!isCloudinaryUrl(trimmed)) {
    throw new Error(
      "An image URL is invalid. Please select the image again."
    );
  }

  return trimmed;
}

/**
 * Resolve all image fields before validating activities.
 * Upload concurrency is limited to three simultaneous operations.
 */
async function resolveActivityImages(
  rawActivities: AnyRecord[],
  files: Map<string, File>
) {
  const jobs: Array<() => Promise<void>> = [];

  for (let index = 0; index < rawActivities.length; index++) {
    const activity = rawActivities[index];

    if (!activity || typeof activity !== "object") {
      continue;
    }

    jobs.push(async () => {
      activity.imageUrl = await resolveImageValue(
        activity.imageUrl,
        files,
        "revision-studio/questions"
      );
    });

    jobs.push(async () => {
      activity.hintImageUrl = await resolveImageValue(
        activity.hintImageUrl,
        files,
        "revision-studio/hints"
      );
    });

    const optionImages = Array.isArray(activity.optionImages)
      ? [...activity.optionImages]
      : [];

    while (optionImages.length < 4) {
      optionImages.push("");
    }

    activity.optionImages = optionImages;

    for (let optionIndex = 0; optionIndex < 4; optionIndex++) {
      jobs.push(async () => {
        activity.optionImages[optionIndex] =
          await resolveImageValue(
            activity.optionImages[optionIndex],
            files,
            "revision-studio/options"
          );
      });
    }
  }

  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const current = nextIndex++;

      if (current >= jobs.length) {
        return;
      }

      await jobs[current]();
    }
  };

  const concurrency = Math.min(3, jobs.length);

  await Promise.all(
    Array.from({ length: concurrency }, () => worker())
  );
}

/**
 * Validate and normalize a revision activity.
 */
function cleanActivity(raw: AnyRecord) {
  const allowedTypes = [
    "mcq",
    "explain",
    "flashcard",
    "rapid_fire",
  ];

  const type = allowedTypes.includes(raw?.type)
    ? raw.type
    : "";

  const prompt =
    typeof raw?.prompt === "string"
      ? raw.prompt.trim().slice(0, 4000)
      : "";

  const imageUrl =
    typeof raw?.imageUrl === "string"
      ? raw.imageUrl.trim()
      : "";

  const isChoice = isChoiceType(type);
  const optionsInQuestionImage =
    raw?.optionsInQuestionImage === true;

  const rawOptionType =
    raw?.optionType === "image" ? "image" : "text";

  const options = Array.isArray(raw?.options)
    ? raw.options
        .slice(0, 4)
        .map((value: unknown) =>
          typeof value === "string"
            ? value.trim().slice(0, 500)
            : ""
        )
    : [];

  const optionImages = Array.isArray(raw?.optionImages)
    ? raw.optionImages
        .slice(0, 4)
        .map((value: unknown) =>
          typeof value === "string" ? value.trim() : ""
        )
    : [];

  while (optionImages.length < 4) {
    optionImages.push("");
  }

  const answerRaw =
    typeof raw?.correctAnswer === "string"
      ? raw.correctAnswer.trim().slice(0, 5000)
      : "";

  const answerLetter = answerRaw.toUpperCase();

  const hintType = raw?.hintType === "image"
    ? "image"
    : "text";

  const hint =
    typeof raw?.hint === "string"
      ? raw.hint.trim().slice(0, 5000)
      : "";

  const hintImageUrl =
    typeof raw?.hintImageUrl === "string"
      ? raw.hintImageUrl.trim()
      : "";

  const difficulty = [
    "easy",
    "moderate",
    "difficult",
  ].includes(raw?.difficulty)
    ? raw.difficulty
    : "moderate";

  const timeLimitSeconds =
    type === "rapid_fire" &&
    [15, 20].includes(Number(raw?.timeLimitSeconds))
      ? Number(raw.timeLimitSeconds)
      : type === "rapid_fire"
        ? 15
        : 0;

  const explanation =
    typeof raw?.explanation === "string"
      ? raw.explanation.trim().slice(0, 5000)
      : "";

  if (!type || (!prompt && !imageUrl)) {
    return null;
  }

  if (imageUrl && !isCloudinaryUrl(imageUrl)) {
    return null;
  }

  if (hintImageUrl && !isCloudinaryUrl(hintImageUrl)) {
    return null;
  }

  if (
    optionImages.some(
      (image: string) =>
        image && !isCloudinaryUrl(image)
    )
  ) {
    return null;
  }

  let normalizedOptions = options;
  let optionType: "text" | "image" = rawOptionType;
  let normalizedOptionImages = optionImages;
  let correctAnswer = answerRaw;

  if (isChoice) {
    if (!ANSWER_LETTERS.includes(answerLetter)) {
      return null;
    }

    if (optionsInQuestionImage) {
      if (!imageUrl) {
        return null;
      }

      normalizedOptions = [...ANSWER_LETTERS];
      optionType = "text";
      normalizedOptionImages = ["", "", "", ""];
      correctAnswer = answerLetter;
    } else if (rawOptionType === "text") {
      if (
        options.length !== 4 ||
        options.some((option: string) => !option)
      ) {
        return null;
      }

      const answerIndex =
        ANSWER_LETTERS.indexOf(answerLetter);

      if (answerIndex >= 0) {
        correctAnswer = options[answerIndex];
      } else if (options.includes(answerRaw)) {
        correctAnswer = answerRaw;
      } else {
        return null;
      }

      normalizedOptions = options;
      optionType = "text";
      normalizedOptionImages = ["", "", "", ""];
    } else {
      if (optionImages.some((image: string) => !image)) {
        return null;
      }

      normalizedOptions = ["", "", "", ""];
      normalizedOptionImages = optionImages;
      optionType = "image";
      correctAnswer = answerLetter;
    }
  } else if (!correctAnswer) {
    return null;
  }

  if (hintType === "image" && !hintImageUrl) {
    return null;
  }

  return {
    type,
    prompt,
    imageUrl,
    options: normalizedOptions,
    optionType,
    optionImages: normalizedOptionImages,
    optionsInQuestionImage,
    correctAnswer,
    explanation,
    hintType,
    hint,
    hintImageUrl,
    difficulty,
    timeLimitSeconds,
  };
}

/**
 * GET: Load teacher courses, students, and existing revisions.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getTeacherFromRequest(req);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user!;
    const params = new URL(req.url).searchParams;
    const requestedCourse = normalizeCourse(
      params.get("course")
    );

    const isAdmin = user.role === "admin";

    const teacherCourses: string[] = Array.isArray(user.courses)
      ? user.courses.filter(
          (value: unknown): value is string =>
            typeof value === "string"
        )
      : [];

    const courses = isAdmin
      ? Array.from(
          new Set(
            (await User.distinct("courses", {
              role: "student",
            }))
              .flat()
              .filter(
                (value: unknown): value is string =>
                  typeof value === "string" &&
                  Boolean(value.trim())
              )
          )
        )
      : teacherCourses;

    if (
      requestedCourse &&
      !isAdmin &&
      !teacherCourses.includes(requestedCourse)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not assigned to this course.",
        },
        { status: 403 }
      );
    }

    const selectedCourse =
      requestedCourse || courses[0] || "";

    const [students, docs] = selectedCourse
      ? await Promise.all([
          User.find({
            role: "student",
            courses: selectedCourse,
          })
            .select("_id name username email")
            .sort({ name: 1 })
            .lean(),

          RevisionAssignment.find({
            course: selectedCourse,
            ...(isAdmin
              ? {}
              : { teacherId: user._id }),
          })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean(),
        ])
      : [[], []];

    const studentRows = (
      students as AnyRecord[]
    ).map((student) => ({
      id: String(student._id),
      name:
        student.name ||
        student.username ||
        student.email ||
        "Student",
      username: student.username || "",
      email: student.email || "",
    }));

    const revisions = (
      docs as AnyRecord[]
    ).map((doc) => ({
      id: String(doc._id),
      course: doc.course,
      title: doc.title,
      subject: doc.subject || "",
      chapter: doc.chapter || "",
      topic: doc.topic || "",
      dueDate: doc.dueDate,
      activityCount: (doc.activities || []).length,
      studentStatuses: (
        doc.studentStatuses || []
      ).map((status: AnyRecord) => ({
        studentId: String(status.studentId),
        status: status.status,
        studentName:
          studentRows.find(
            (student) =>
              student.id === String(status.studentId)
          )?.name || "Student",
      })),
    }));

    return NextResponse.json({
      success: true,
      courses,
      course: selectedCourse,
      students: studentRows,
      revisions,
    });
  } catch (error) {
    console.error("Teacher revisions GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load revision activities.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Publish a revision, upload images, insert Question Bank
 * questions, and assign the revision to eligible students.
 */
export async function POST(req: NextRequest) {
  let questionBankIds: mongoose.Types.ObjectId[] = [];

  try {
    console.log("[Revision Publish] 1. Request received");

    const auth = await getTeacherFromRequest(req);

    console.log("[Revision Publish] 2. Authentication finished");

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user!;
    const contentType =
      req.headers.get("content-type") || "";

    let body: AnyRecord;
    const files = new Map<string, File>();

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      // Support both multipart formats:
      // A. A JSON string in the "payload" field.
      // B. Separate fields such as course, title, and activities.
      const payload = formData.get("payload");

      if (typeof payload === "string") {
        try {
          body = JSON.parse(payload);
        } catch {
          return NextResponse.json(
            {
              success: false,
              error: "The revision payload is invalid.",
            },
            { status: 400 }
          );
        }
      } else {
        const readString = (
          key: string,
          fallback = ""
        ): string => {
          const value = formData.get(key);

          return typeof value === "string"
            ? value
            : fallback;
        };

        let activities: unknown;
        let studentIds: unknown;

        try {
          activities = JSON.parse(
            readString("activities", "[]")
          );
        } catch {
          return NextResponse.json(
            {
              success: false,
              error:
                "The activities field is invalid JSON.",
            },
            { status: 400 }
          );
        }

        try {
          studentIds = JSON.parse(
            readString("studentIds", "[]")
          );
        } catch {
          return NextResponse.json(
            {
              success: false,
              error:
                "The studentIds field is invalid JSON.",
            },
            { status: 400 }
          );
        }

        const assignToAllValue = readString(
          "assignToAll",
          "true"
        );

        body = {
          course: readString("course"),
          title: readString("title"),
          instructions: readString("instructions"),
          subject: readString("subject"),
          chapter: readString("chapter"),
          topic: readString("topic"),
          assignedDate: readString("assignedDate"),
          dueDate: readString("dueDate"),
          assignToAll: assignToAllValue === "true",
          studentIds,
          activities,
        };
      }

      // Collect uploaded files using their original field names.
     const entries = Array.from(formData.entries());

for (const [key, value] of entries) {
  
        if (key === "payload" || typeof value === "string") {
          continue;
        }

        if (value.size > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            {
              success: false,
              error: `Image "${key}" exceeds the 5 MB limit.`,
            },
            { status: 400 }
          );
        }

        // Browsers may include empty File values for unselected inputs.
        if (value.size === 0) {
          continue;
        }

        files.set(key, value);
      }
    } else {
      // Continue supporting existing JSON clients.
      body = await req.json();
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid revision data.",
        },
        { status: 400 }
      );
    }

    const course = normalizeCourse(body.course);

    const teacherCourses: string[] = Array.isArray(user.courses)
      ? user.courses.filter(
          (value: unknown): value is string =>
            typeof value === "string"
        )
      : [];

    if (
      !course ||
      (user.role !== "admin" &&
        !teacherCourses.includes(course))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not assigned to this course.",
        },
        { status: 403 }
      );
    }

    const title =
      typeof body.title === "string"
        ? body.title.trim().slice(0, 160)
        : "";

    const assignedDate =
      typeof body.assignedDate === "string"
        ? body.assignedDate
        : "";

    const dueDate =
      typeof body.dueDate === "string"
        ? body.dueDate
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim().slice(0, 100)
        : "";

    const chapter =
      typeof body.chapter === "string"
        ? body.chapter.trim().slice(0, 160)
        : "";

    const topic =
      typeof body.topic === "string"
        ? body.topic.trim().slice(0, 160)
        : "";

    if (
      !title ||
      !/^\d{4}-\d{2}-\d{2}$/.test(assignedDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Title and valid assignment/deadline dates are required.",
        },
        { status: 400 }
      );
    }

    if (dueDate < assignedDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Deadline cannot be before the assigned date.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.activities) ||
      !body.activities.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Add at least one revision activity.",
        },
        { status: 400 }
      );
    }

    if (
      body.activities.some(
        (activity: unknown) =>
          !activity ||
          typeof activity !== "object" ||
          Array.isArray(activity)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "One or more revision activities are invalid.",
        },
        { status: 400 }
      );
    }

    const rawActivities =
      body.activities as AnyRecord[];

    console.log("[Revision Publish] 3. Request parsed", {
      activityCount: rawActivities.length,
      fileCount: files.size,
    });

    // Resolve pending image placeholders and upload images.
    console.log(
      "[Revision Publish] 4. Uploading selected images"
    );

    await resolveActivityImages(rawActivities, files);

    console.log(
      "[Revision Publish] 5. Image uploads finished"
    );

    // Validate activities after all pending image URLs are resolved.
    const cleanedActivities =
      rawActivities.map(cleanActivity);

    if (
      !cleanedActivities.length ||
      cleanedActivities.some(
        (activity: AnyRecord | null) => !activity
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Check each question. MCQ and Rapid Fire need four valid options and a correct answer; image options need four images.",
        },
        { status: 400 }
      );
    }

    const activities =
      cleanedActivities as AnyRecord[];

    const bankActivities = activities.filter(
      (activity) =>
        activity.type === "mcq" ||
        activity.type === "rapid_fire"
    );

    if (bankActivities.length && (!subject || !chapter)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Choose a subject and chapter to add MCQ/Rapid Fire questions to the Question Bank.",
        },
        { status: 400 }
      );
    }

    // Prepare Question Bank documents.
    const questionBankDocuments = bankActivities.map(
      (activity) => {
        let answerIndex = -1;

        if (activity.optionsInQuestionImage) {
          answerIndex = ANSWER_LETTERS.indexOf(
            String(activity.correctAnswer).toUpperCase()
          );
        } else if (activity.optionType === "image") {
          answerIndex = ANSWER_LETTERS.indexOf(
            String(activity.correctAnswer).toUpperCase()
          );
        } else {
          answerIndex = activity.options.indexOf(
            activity.correctAnswer
          );

          if (answerIndex < 0) {
            answerIndex = ANSWER_LETTERS.indexOf(
              String(activity.correctAnswer).toUpperCase()
            );
          }
        }

        if (answerIndex < 0 || answerIndex > 3) {
          throw new Error(
            "A Question Bank answer must be A, B, C, or D."
          );
        }

        const id = new mongoose.Types.ObjectId();

        questionBankIds.push(id);

        return {
          _id: id,
          questionType: activity.imageUrl
            ? "image"
            : "text",
          optionType: activity.optionType,

          question: {
            ...(activity.prompt
              ? { text: activity.prompt }
              : {}),
            ...(activity.imageUrl
              ? { imgUrl: activity.imageUrl }
              : {}),
          },

          options: activity.options.map(
            (text: string, index: number) => ({
              ...(text ? { text } : {}),
              ...(activity.optionType === "image" &&
              activity.optionImages[index]
                ? {
                    imgUrl:
                      activity.optionImages[index],
                  }
                : {}),
            })
          ),

          answer: ANSWER_LETTERS[answerIndex],
          level:
            LEVEL_MAP[activity.difficulty] || "Moderate",
          course,
          subject,
          chapter,
          uploadedBy: user.username || user.email || "Teacher",
          hintType: activity.hintType,

          hint: {
            ...(activity.hintType === "text" &&
            activity.hint
              ? { text: activity.hint }
              : {}),

            ...(activity.hintType === "image" &&
            activity.hintImageUrl
              ? { imgUrl: activity.hintImageUrl }
              : {}),
          },
        };
      }
    );

    const requestedIds = Array.isArray(body.studentIds)
      ? body.studentIds.filter(
          (id: unknown): id is string =>
            typeof id === "string" &&
            mongoose.isValidObjectId(id)
        )
      : [];

    const assignToAll = body.assignToAll !== false;

    const studentFilter: AnyRecord = {
      role: "student",
      courses: course,
    };

    if (!assignToAll) {
      if (!requestedIds.length) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Select at least one student or assign to the whole class.",
          },
          { status: 400 }
        );
      }

      studentFilter._id = {
        $in: requestedIds,
      };
    }

    console.log(
      "[Revision Publish] 6. Finding assigned students"
    );

    const students = await User.find(studentFilter)
      .select("_id")
      .lean();

    console.log(
      "[Revision Publish] 7. Student query finished",
      {
        count: students.length,
      }
    );

    if (!students.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No eligible students were found for this assignment.",
        },
        { status: 400 }
      );
    }

    // Insert Question Bank rows first.
    // If revision creation fails, remove these inserted rows.
    if (questionBankDocuments.length) {
      console.log(
        "[Revision Publish] 8. Inserting Question Bank questions"
      );

      await QuestionBank.insertMany(
        questionBankDocuments
      );

      console.log(
        "[Revision Publish] 9. Question Bank insertion finished"
      );
    }

    try {
      console.log(
        "[Revision Publish] 10. Creating revision assignment"
      );

      const revision = await RevisionAssignment.create({
        course,
        title,

        instructions:
          typeof body.instructions === "string"
            ? body.instructions.trim().slice(0, 3000)
            : "",

        subject,
        chapter,
        topic,
        assignedDate,
        dueDate,
        teacherId: user._id,
        activities,

        studentStatuses: students.map(
          (student: AnyRecord) => ({
            studentId: student._id,
            status: "not_attempted",
          })
        ),

        published: true,
      });

      console.log(
        "[Revision Publish] 11. Revision assignment created"
      );

      // Save flashcards and explanations here
for (const activity of activities) {
  if (activity.type === "flashcard") {
    await Flashcard.create({
      assignmentId: revision._id,
      question: activity.prompt,
      answer: activity.correctAnswer,
      course,
      subject,
      chapter,
      topic,
      uploadedBy: user._id,
    });
  }

  if (activity.type === "explain") {
    await Explain.create({
      assignmentId: revision._id,
      question: activity.prompt,
      explanation: activity.explanation,
      course,
      subject,
      chapter,
      topic,
      uploadedBy: user._id,
    });
  }
}


      return NextResponse.json(
        {
          success: true,
          message: "Revision published successfully.",
          revisionId: String(revision._id),
          questionBankInsertedCount:
            questionBankDocuments.length,
        },
        { status: 201 }
      );
    } catch (error) {
      if (questionBankIds.length) {
        await QuestionBank.deleteMany({
          _id: {
            $in: questionBankIds,
          },
        }).catch((cleanupError: unknown) => {
          console.error(
            "Question Bank cleanup error:",
            cleanupError
          );
        });
      }

      throw error;
    }
  } catch (error) {
    if (questionBankIds.length) {
      await QuestionBank.deleteMany({
        _id: {
          $in: questionBankIds,
        },
      }).catch((cleanupError: unknown) => {
        console.error(
          "Question Bank cleanup error:",
          cleanupError
        );
      });
    }

    console.error(
      "Teacher revisions POST error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to publish revision. Check the question and image fields.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
