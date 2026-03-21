import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TestRecords from "@/model/TestRecordSchema";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const data = await TestRecords.aggregate([
      { $match: { email } },
      {
        $facet: {
          totalTests: [{ $count: "count" }],

          testsPerSubject: [
            { $group: { _id: "$subject", count: { $sum: 1 } } }
          ],

          correctIncorrect: [
            {
              $group: {
                _id: null,
                correct: { $sum: "$correct" },
                incorrect: { $sum: "$incorrect" }
              }
            }
          ],

          answeredUnanswered: [
            {
              $project: {
                answered: { $size: "$Answers" },
                unanswered: { $size: "$unanswered" }
              }
            },
            {
              $group: {
                _id: null,
                answered: { $sum: "$answered" },
                unanswered: { $sum: "$unanswered" }
              }
            }
          ],

          recentTests: [
            { $sort: { date: -1 } },
            { $limit: 5 },
            {
              $project: {
                name: 1,
                subject: 1,
                percentage: 1,
                date: 1
              }
            }
          ]
        }
      }
    ]);

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
