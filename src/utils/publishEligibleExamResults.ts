import ExamRecords from "@/model/ExamRecordSchema";

export async function publishEligibleExamResults(
  studentEmail: string,
  examId?: string
) {
  try {
    const now = new Date();

    // Base filter
    const filter: Record<string, any> = {
      "student.email": studentEmail,
      resultStatus: "pending",
      evaluationStatus: "completed",

      // Supports both String and Date values.
      $expr: {
        $lte: [
          {
            $convert: {
              input: "$publishAt",
              to: "date",
              onError: null,
              onNull: null,
            },
          },
          now,
        ],
      },
    };

    // Optionally publish only one particular exam.
    if (examId) {
      filter.examId = examId;
    }

    console.log(
      `[RESULT PUBLISH] Checking results for ${studentEmail}`,
      {
        examId: examId ?? "all exams",
        currentTime: now.toISOString(),
      }
    );

    // Find eligible records for debugging.
    const eligibleRecords = await ExamRecords.find(filter)
      .select("_id examId resultStatus evaluationStatus publishAt")
      .lean();

    console.log(
      `[RESULT PUBLISH] Eligible records: ${eligibleRecords.length}`
    );

    // Nothing to publish.
    if (eligibleRecords.length === 0) {
      return {
        success: true,
        publishedCount: 0,
        message: "No eligible results found.",
      };
    }

    // Publish eligible results.
    const result = await ExamRecords.updateMany(
      filter,
      {
        $set: {
          resultStatus: "published",
        },
      }
    );

    console.log("[RESULT PUBLISH] Update completed:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });

    return {
      success: true,
      publishedCount: result.modifiedCount ?? 0,
      message: "Eligible results published successfully.",
    };
  } catch (error) {
    console.error("[RESULT PUBLISH] Error:", error);

    throw error;
  }
}