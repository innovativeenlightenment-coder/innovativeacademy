// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/mongoose";
// import Exams from "@/model/ExamsSchema";
// import { unstable_noStore as noStore } from "next/cache";
// import mongoose from "mongoose";

// type TestType = "monthly" | "quarterly";
// type ChapterInput = { chapter: string; noOfQuestions: number };

// export async function PATCH(req: Request) {
//   noStore();
//   await connectDB();

//   try {
//     const body: Partial<{
//       id: string;
//       testType: TestType;
//       course: string;
//       chapters: ChapterInput[];
//       totalQuestions: number;
//       startTime: string;
//       endTime: string;
//     }> = await req.json();

//     const id = body.id;

//     if (!id) {
//       return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
//     }

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
//     }

//     const existing = await Exams.findById(id).lean();
//     if (!existing) {
//       return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
//     }

//     const update: Record<string, any> = {};

//     if (body.testType) update.testType = body.testType;
//     if (body.course) update.course = String(body.course).trim();

//     if (body.startTime) {
//       const st = new Date(body.startTime);
//       if (Number.isNaN(st.getTime())) {
//         return NextResponse.json({ success: false, error: "Invalid startTime" }, { status: 400 });
//       }
//       update.startTime = st;
//     }

//     if (body.endTime) {
//       const et = new Date(body.endTime);
//       if (Number.isNaN(et.getTime())) {
//         return NextResponse.json({ success: false, error: "Invalid endTime" }, { status: 400 });
//       }
//       update.endTime = et;
//     }

//     if (body.chapters) {
//       if (!Array.isArray(body.chapters) || body.chapters.length === 0) {
//         return NextResponse.json(
//           { success: false, error: "At least one chapter is required" },
//           { status: 400 }
//         );
//       }

//       update.chapters = body.chapters.map((c) => ({
//         chapter: String(c.chapter).trim(),
//         noOfQuestions: Number(c.noOfQuestions),
//       }));
//     }

//     if (typeof body.totalQuestions === "number") {
//       update.totalQuestions = Number(body.totalQuestions);
//     }

//     // ✅ Validate final values
//     const finalChapters = update.chapters ?? existing.chapters;
//     const finalTotal = update.totalQuestions ?? existing.totalQuestions;

//     const sum = finalChapters.reduce((a: number, c: any) => a + Number(c.noOfQuestions || 0), 0);
//     if (sum !== Number(finalTotal)) {
//       return NextResponse.json(
//         { success: false, error: "totalQuestions must equal sum of chapter noOfQuestions" },
//         { status: 400 }
//       );
//     }

//     const finalStart = update.startTime ?? existing.startTime;
//     const finalEnd = update.endTime ?? existing.endTime;
//     if (new Date(finalStart) >= new Date(finalEnd)) {
//       return NextResponse.json(
//         { success: false, error: "startTime must be before endTime" },
//         { status: 400 }
//       );
//     }

//     const updated = await Exams.findByIdAndUpdate(id, update, { new: true }).lean();

//     return NextResponse.json({ success: true, exam: updated });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { success: false, error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
