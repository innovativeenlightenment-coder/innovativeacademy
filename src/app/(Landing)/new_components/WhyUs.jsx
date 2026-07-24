"use client";

import Link from "next/link";

export default function WhyUs() {
  return (
<section className="bg-gray-50 py-16">
  <div className="container mx-auto px-6 md:px-16 grid md:grid-cols-2 gap-12 items-center">
    
    {/* Left Side Image */}
    <div className="flex justify-center">
      <img
        src="./images/why.jpg"
        alt="Online Test Series"
        className="w-full h-full object-cover rounded-lg shadow-md"
      />
    </div>

    {/* Right Side Text */}
    <div className="flex flex-col justify-center">
      <h1 className="text-4xl md:text-3xl font-bold text-gray-900 leading-tight">
        The Smarter Way to{" "}
        <span className="text-blue-600 font-bold">
          Crack JEE, NEET & CET
        </span>
      </h1>

      <h3 className="text-2xl md:text-xl font-bold text-orange-500 leading-tight px-4 py-3 bg-gray-100 mt-4 rounded">
        Your Foundation is the Key{" "}
        <span className="text-gray-600 font-semibold">
          Unlock JEE, NEET, CET Success with Us
        </span>
      </h3>

      <p className="text-gray-600 mt-4 text-base">
        Innovative Academy Test Series helps Foundation, JEE, NEET & CET
        aspirants prepare with expert-designed question banks, instant
        performance analysis, and AI-powered test recommendations.
      </p>

      <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 text-sm">
        <li>Foundation (8th–10th) – Build strong basics</li>
        <li>NEET – Complete Biology, Physics & Chemistry practice</li>
        <li>JEE – Advanced level Physics, Chemistry & Maths</li>
        <li>CET – State-level competitive test preparation</li>
        <li>Instant Results & Detailed Analysis Reports</li>
      </ul>
    </div>
  </div>
</section>

  );
}
