export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import TestRecords from "@/model/TestRecordSchema";

export async function GET(req: Request) {
  try {
    await connectDB();

    const base =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const userRes = await fetch(`${base}/api/auth/Get-Current-User`, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    const userJson = await userRes.json();

    if (!userJson?.success || !userJson?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Not logged in" },
        { status: 401 }
      );
    }

    const email = userJson.user.email;

    const url = new URL(req.url);
    const query: any = { email };

    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const minP = url.searchParams.get("minP");
    const maxP = url.searchParams.get("maxP");
    if (minP || maxP) {
      query.percentage = {};
      if (minP) query.percentage.$gte = Number(minP);
      if (maxP) query.percentage.$lte = Number(maxP);
    }

    // ✅ FETCH ALL RECORDS (NO PAGINATION)
    const records = await TestRecords.find(query)
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      records,
      total: records.length,
      user: userJson.user,
    });
  } catch (error) {
    console.error("GET /api/test-records/user error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
