
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { connectDB } from "@/lib/mongoose";
import ExamRecords from "@/model/ExamRecordSchema";
import TeacherExamPaper from "@/model/TeacherExamSchema";
import TestRecords from "@/model/TestRecordSchema";
import User from "@/model/UserSchema";

export const dynamic = "force-dynamic";

type AnyRecord = Record<string, any>;

function average(values: number[]) {
  if (!values.length) return 0;
  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)
  );
}

function rankStudents(records: AnyRecord[], userByEmail: Map<string, AnyRecord>) {
  const groups = new Map<string, AnyRecord>();

  for (const record of records) {
    const email = record.email;
    if (!email) continue;

    const user = userByEmail.get(email);
    const existing = groups.get(email);

    if (existing) {
      existing.percentages.push(Number(record.percentage ?? 0));
      existing.totalScore += Number(record.score ?? 0);
    } else {
      groups.set(email, {
        name: user?.name || record.name || record.username || "Student",
        email,
        avatar: user?.avatar || "",
        percentages: [Number(record.percentage ?? 0)],
        totalScore: Number(record.score ?? 0),
      });
    }
  }

  return Array.from(groups.values())
    .map((student) => ({
      name: student.name,
      email: student.email,
      avatar: student.avatar,
      examsAttempted: student.percentages.length,
      averagePercentage: average(student.percentages),
      totalScore: student.totalScore,
    }))
    .sort(
      (a, b) =>
        b.averagePercentage - a.averagePercentage ||
        b.totalScore - a.totalScore
    )
    .slice(0, 5)
    .map((student, index) => ({ rank: index + 1, ...student }));
}

export async function GET(req: Request) {
  noStore();

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course")?.trim();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course is required." },
        { status: 400 }
      );
    }

    const [exams, practiceRecords] = await Promise.all([
      TeacherExamPaper.find({ course })
        .select(
          "_id testType teacherName startTime endTime totalQuestions totalMarks course subject chapter"
        )
        .sort({ startTime: -1 })
        .lean(),

      TestRecords.find({ course })
        .select(
          "correct incorrect unanswered Answers level score percentage username email name course subject chapter testType date duration timeLeft"
        )
        .sort({ date: -1 })
        .lean(),
    ]);

    const examIds = exams.map((exam: AnyRecord) => exam._id);

    const examRecords: AnyRecord[] = examIds.length
      ? await ExamRecords.find({
          examId: { $in: examIds },
          resultStatus: "published",
        })
          .select(
            "examId name email username score percentage correct incorrect totalQuestions totalMarks date course testType"
          )
          .sort({ percentage: -1, score: -1 })
          .lean()
      : [];

   
const emails = Array.from(
  new Set(
    [...examRecords, ...practiceRecords]
      .map((record: AnyRecord) => record.email)
      .filter(Boolean)
  )
);

    const users: AnyRecord[] = emails.length
      ? await User.find({ email: { $in: emails } })
          .select("name email username avatar")
          .lean()
      : [];

    const userByEmail = new Map(
      users.map((user: AnyRecord) => [user.email, user])
    );

    // Exam summaries
    const recordsByExam = new Map<string, AnyRecord[]>();

    for (const record of examRecords) {
      const id = String(record.examId);
      const list = recordsByExam.get(id) ?? [];
      list.push(record);
      recordsByExam.set(id, list);
    }

    const examSummaries = exams.map((exam: AnyRecord) => {
      const records = recordsByExam.get(String(exam._id)) ?? [];

      const students = records
        .map((record: AnyRecord) => {
          const user = userByEmail.get(record.email);

          return {
            name:
              user?.name || record.name || record.username || "Student",
            email: record.email || "",
            avatar: user?.avatar || "",
            score: Number(record.score ?? 0),
            percentage: Number(record.percentage ?? 0),
            correct: Number(record.correct ?? 0),
            incorrect: Number(record.incorrect ?? 0),
            totalQuestions: Number(
              record.totalQuestions ?? exam.totalQuestions ?? 0
            ),
          };
        })
        .sort(
          (a, b) =>
            b.percentage - a.percentage || b.score - a.score
        );

      return {
        examId: String(exam._id),
        testType: exam.testType,
        teacherName: exam.teacherName,
        course: exam.course,
        subject: exam.subject || "",
        chapter: exam.chapter || "",
        startTime: exam.startTime,
        endTime: exam.endTime,
        totalQuestions: Number(exam.totalQuestions ?? 0),
        totalMarks: Number(exam.totalMarks ?? 0),
        studentsAssessed: records.length,
        averagePercentage: average(
          records.map((record: AnyRecord) =>
            Number(record.percentage ?? 0)
          )
        ),
        averageScore: average(
          records.map((record: AnyRecord) => Number(record.score ?? 0))
        ),
        topStudents: students
          .slice(0, 5)
          .map((student, index) => ({ rank: index + 1, ...student })),
        students,
      };
    });

    // Practice summaries grouped by subject, chapter and practice type
    const practiceGroups = new Map<string, AnyRecord[]>();

    for (const record of practiceRecords as AnyRecord[]) {
      const key = [
        record.subject || "General",
        record.chapter || "All chapters",
        record.testType || record.level || "Practice",
      ].join("|||");

      const list = practiceGroups.get(key) ?? [];
      list.push(record);
      practiceGroups.set(key, list);
    }

    const practiceSummaries = Array.from(practiceGroups.entries())
      .map(([key, records]) => {
        const [subject, chapter, testType] = key.split("|||");

        const students = records
          .map((record: AnyRecord) => {
            const user = userByEmail.get(record.email);

            return {
              name:
                user?.name || record.name || record.username || "Student",
              email: record.email || "",
              avatar: user?.avatar || "",
              score: Number(record.score ?? 0),
              percentage: Number(record.percentage ?? 0),
              correct: Number(record.correct ?? 0),
              incorrect: Number(record.incorrect ?? 0),
              totalQuestions: Array.isArray(record.Answers)
                ? record.Answers.length
                : 0,
            };
          })
          .sort(
            (a, b) =>
              b.percentage - a.percentage || b.score - a.score
          );

        const dates = records
          .map((record: AnyRecord) => record.date)
          .filter(Boolean);

        return {
          id: key,
          subject,
          chapter,
          testType,
          attempts: records.length,
          latestDate: dates.length
            ? new Date(
                Math.max(...dates.map((date: Date | string) =>
                  new Date(date).getTime()
                ))
              )
            : null,
          averagePercentage: average(
            records.map((record: AnyRecord) =>
              Number(record.percentage ?? 0)
            )
          ),
          averageScore: average(
            records.map((record: AnyRecord) => Number(record.score ?? 0))
          ),
          studentsAssessed: new Set(
            records
              .map((record: AnyRecord) => record.email)
              .filter(Boolean)
          ).size,
          topStudents: students
            .slice(0, 5)
            .map((student, index) => ({ rank: index + 1, ...student })),
          students,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.latestDate ?? 0).getTime() -
          new Date(a.latestDate ?? 0).getTime()
      );

    const examLeaderboard = rankStudents(examRecords, userByEmail);
    const practiceLeaderboard = rankStudents(
      practiceRecords as AnyRecord[],
      userByEmail
    );

    const examEmails = new Set(
      examRecords.map((record: AnyRecord) => record.email).filter(Boolean)
    );
    const practiceEmails = new Set(
      (practiceRecords as AnyRecord[])
        .map((record: AnyRecord) => record.email)
        .filter(Boolean)
    );

    return NextResponse.json({
      success: true,
      course,

      overview: {
        exams: {
          studentsAssessed: examEmails.size,
          publishedExams: examSummaries.filter(
            (exam) => exam.studentsAssessed > 0
          ).length,
          totalExams: exams.length,
          totalAttempts: examRecords.length,
          classAverage: average(
            examRecords.map((record: AnyRecord) =>
              Number(record.percentage ?? 0)
            )
          ),
          topScore: examRecords.length
            ? Math.max(
                ...examRecords.map((record: AnyRecord) =>
                  Number(record.percentage ?? 0)
                )
              )
            : 0,
        },

        practice: {
          studentsAssessed: practiceEmails.size,
          totalAttempts: practiceRecords.length,
          assessments: practiceSummaries.length,
          classAverage: average(
            (practiceRecords as AnyRecord[]).map((record) =>
              Number(record.percentage ?? 0)
            )
          ),
          topScore: practiceRecords.length
            ? Math.max(
                ...(practiceRecords as AnyRecord[]).map((record) =>
                  Number(record.percentage ?? 0)
                )
              )
            : 0,
        },
      },

      examSummaries,
      practiceSummaries,
      examLeaderboard,
      practiceLeaderboard,
    });
  } catch (error) {
    console.error("Student Performance API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load student performance.",
      },
      { status: 500 }
    );
  }
}
