// app/api/enquiry/route.ts

import { NextResponse } from "next/server";
import {connectDB} from "@/lib/mongoose";
import Enquiry from "@/model/Enquiry";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  try {
    const { name, class: studentClass, phone } = await req.json();

    await connectDB();

    // Save enquiry
    await Enquiry.create({
      name,
      class: studentClass,
      phone,
    });

    // Send email to YOU
    await sendEmail(
     "shayanalimujawar13@gmail.com",
      "🔥 New Enquiry Received",
      `
        <h2>New Student Enquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Class:</b> ${studentClass}</p>
        <p><b>Phone:</b> ${phone}</p>
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}