"use client";

import React from "react";
import Image from "next/image";

export default function TestSeriesCTA() {
  return (
    <div className="w-full bg-gray-200 py-10 px-6 flex flex-col md:flex-row items-stretch justify-center gap-0">
      {/* Left Box */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-700 to-red-500 text-center md:text-left text-white p-8 md:p-5 md:w-1/2 flex flex-col justify-between rounded-2xl shadow-lg">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Invest in Your <span className="text-yellow-400">Future</span>
          </h2>

          <p className="text-lg md:text-xl leading-relaxed mb-6 font-medium">
            Join our{" "}
            <span className="font-bold text-yellow-200">
              Innovative Academy Test Series
            </span>{" "}
            and get access to{" "}
            <span className="font-bold text-green-200">high-quality questions</span>,{" "}
            <span className="font-bold text-pink-200">instant results</span>, and{" "}
            <span className="font-bold text-cyan-200">expert guidance</span>. <br />
            Prepare smart for{" "}
            <span className="font-bold underline text-yellow-300">
              JEE, NEET & CET
            </span>{" "}
            and secure your success!
          </p>

          <p className="font-semibold text-sm md:text-base text-gray-200">
            – Team Innovative Academy
          </p>
          <p className="text-xs opacity-80 text-gray-300">
            Guiding Students to Excellence
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-6 flex justify-center md:justify-start">
          <a
            href="/contact"
            className="bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-lg shadow-md hover:bg-yellow-300 hover:scale-105 transition-transform duration-300"
          >
            Join Now
          </a>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="md:w-1/2 flex">
        <Image
          src="/images/CTA.jpg" // replace with your student/testseries image
          alt="Student preparing"
          width={600}
          height={500}
          className="w-full h-full rounded-xl object-cover shadow-lg"
        />
      </div>
    </div>
  );
}
