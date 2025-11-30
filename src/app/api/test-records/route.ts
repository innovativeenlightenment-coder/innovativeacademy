// app/api/test-records/user/route.ts
export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose"; // adjust path if needed
import TestRecords from "@/model/TestRecordSchema"; // adjust path if needed

export async function GET(req: Request) {
  try {
    await connectDB();

    // call your auth endpoint to get current user (forward cookies)
    const base = process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3000`;
    const userRes = await fetch(`${base}/api/auth/Get-Current-User`, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    const userJson = await userRes.json();
    if (!userJson?.success || !userJson?.user?.email) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 });
    }

    const email = userJson.user.email;

    // simple pagination support via query params
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "50");

    const query: any = { email };

    // optional date/percentage filters (if sent)
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

    const total = await TestRecords.countDocuments(query);
    const records = await TestRecords.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      records,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      user: userJson.user,
    });
  } catch (error) {
    console.error("GET /api/test-records/user error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
