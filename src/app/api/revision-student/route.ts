
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { verifyTokenEdge } from "@/lib/verifyToken";
import User from "@/model/UserSchema";
import RevisionAssignment from "@/model/RevisionAssignmentSchema";

export const dynamic = "force-dynamic";

type AuthResult =
  | { student: any; error?: never }
  | { student?: never; error: NextResponse };

async function getStudent(req: NextRequest): Promise<AuthResult> {
  await connectDB();

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: "Please sign in first." },
        { status: 401 }
      ),
    };
  }

  const decoded = await verifyTokenEdge(token);

  if (!decoded?.id) {
    return {
      error: NextResponse.json(
        { success: false, error: "Your session is invalid." },
        { status: 401 }
      ),
    };
  }

  const student: any = await User.findById(decoded.id)
    .select("_id name username role courses")
    .lean();

  if (!student) {
    return {
      error: NextResponse.json(
        { success: false, error: "Student account not found." },
        { status: 404 }
      ),
    };
  }

  // If your application uses a different role naming convention,
  // align this check with the roles stored in your User model.
  if (
    typeof student.role === "string" &&
    student.role.toLowerCase() !== "student"
  ) {
    return {
      error: NextResponse.json(
        { success: false, error: "Student access required." },
        { status: 403 }
      ),
    };
  }

  return { student };
}

function getStudentCourses(student: any): string[] {
  return Array.isArray(student.courses)
    ? student.courses.filter(
        (course: unknown): course is string =>
          typeof course === "string"
      )
    : [];
}

function serializeActivity(activity: any) {
  return {
    id: String(activity._id),
    type: activity.type,
    prompt: activity.prompt || "",
    options: Array.isArray(activity.options)
      ? activity.options.map((option: any) => {
          if (typeof option === "string") return option;

          return {
            text: option?.text || "",
            label: option?.label || "",
          };
        })
      : [],
    difficulty: activity.difficulty || "moderate",
    timeLimitSeconds: Number(activity.timeLimitSeconds) || 0,
    imageUrl: activity.imageUrl || "",
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getStudent(req);
    if (auth.error) return auth.error;

    const student = auth.student;
    const courses = getStudentCourses(student);

    if (!courses.length) {
      return NextResponse.json({
        success: true,
        assignments: [],
      });
    }

    const docs: any[] = await RevisionAssignment.find({
      published: true,
      course: { $in: courses },
      "studentStatuses.studentId": new mongoose.Types.ObjectId(
        String(student._id)
      ),
    })
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(100)
      .lean();

    const assignments = docs.map((doc) => {
      const ownStatus = (doc.studentStatuses || []).find(
        (status: any) =>
          String(status.studentId) === String(student._id)
      );

      return {
        id: String(doc._id),
        course: doc.course || "",
        title: doc.title || "Revision assignment",
        instructions: doc.instructions || "",
        subject: doc.subject || "",
        chapter: doc.chapter || "",
        topic: doc.topic || "",
        assignedDate: doc.assignedDate || null,
        dueDate: doc.dueDate || null,
        status: ownStatus?.status || "not_attempted",
        startedAt: ownStatus?.startedAt || null,
        completedAt: ownStatus?.completedAt || null,

        // Do not send correct answers in the initial assignment payload.
        activities: (doc.activities || []).map(serializeActivity),
      };
    });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Student revisions GET error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load assigned revisions.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getStudent(req);
    if (auth.error) return auth.error;

    const student = auth.student;
    const body = await req.json();

    const assignmentId =
      typeof body.assignmentId === "string"
        ? body.assignmentId
        : "";

    if (!mongoose.isValidObjectId(assignmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid assignment." },
        { status: 400 }
      );
    }

    const courses = getStudentCourses(student);

    if (!courses.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No course is linked to your account.",
        },
        { status: 403 }
      );
    }

    const doc: any = await RevisionAssignment.findOne({
      _id: assignmentId,
      published: true,
      course: { $in: courses },
      "studentStatuses.studentId": student._id,
    });

    if (!doc) {
      return NextResponse.json(
        {
          success: false,
          error: "Revision not found for your account.",
        },
        { status: 404 }
      );
    }

    // Return the model answer only after the student requests it.
    if (body.action === "reveal") {
      const activityId =
        typeof body.activityId === "string"
          ? body.activityId
          : "";

      if (!mongoose.isValidObjectId(activityId)) {
        return NextResponse.json(
          { success: false, error: "Invalid activity." },
          { status: 400 }
        );
      }

      const activity = doc.activities.id(activityId);

      if (!activity) {
        return NextResponse.json(
          { success: false, error: "Activity not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        correctAnswer: activity.correctAnswer ?? "",
        explanation: activity.explanation || "",
      });
    }

    const status = body.status;

    if (!["attempted", "completed"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid assignment status update.",
        },
        { status: 400 }
      );
    }

    const ownStatus = doc.studentStatuses.find(
      (item: any) =>
        String(item.studentId) === String(student._id)
    );

    if (!ownStatus) {
      return NextResponse.json(
        {
          success: false,
          error: "Your assignment record was not found.",
        },
        { status: 404 }
      );
    }

    if (
      status === "attempted" &&
      ownStatus.status === "not_attempted"
    ) {
      ownStatus.status = "attempted";
      ownStatus.startedAt = new Date();
    }

    if (status === "completed") {
      ownStatus.status = "completed";
      ownStatus.completedAt = new Date();
    }

    doc.markModified("studentStatuses");
    await doc.save();

    return NextResponse.json({
      success: true,
      status: ownStatus.status,
    });
  } catch (error) {
    console.error("Student revisions PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update revision status.",
      },
      { status: 500 }
    );
  }
}
