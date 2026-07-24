"use client";

import { FaGraduationCap, FaPlayCircle, FaClock } from "react-icons/fa";

export default function FeatureStrip() {
    return (
        <section className="bg-gradient-to-r from-blue-50 via-grey to-blue-300 py-1 px-6">
            {/* === Offer Box === */}
            {/* <div className="bg-yellow-400 text-gray-900 font-semibold px-8 py-6 rounded-2xl shadow-md text-center w-[280px] mb-10">
                <h2 className="text-4xl font-bold text-gray-800">
                    Expert Instructors – 🎉 Limited Time Offer
                </h2>
                <p className="text-sm font-normal">
                    Get your 1st test absolutely FREE!
                </p>
            </div> */}

            {/* === Main Row === */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8">

                {/* === Left Side === */}
                <div className="max-w-[500px] flex-shrink-0 text-center lg:text-left mt-6">
                    <img
                        src="/images/shayan.jpg"
                        alt="Study Smart"
                        className="rounded-lg shadow-md mb-1 mx-auto lg:mx-0 w-[100px] h-[100px] object-cover"
                    />
                    <p className="text-gray-700 text-base leading-relaxed">
                        Our test series is carefully designed by expert faculty to give you
                        maximum exposure to real exam patterns. Gain accuracy, confidence,
                        and subject mastery with smart preparation strategies.
                    </p>
                     <div className="bg-yellow-400 text-gray-900 font-semibold px-2 py-2 rounded-2xl shadow-md text-center w-[500px] mb-10">
                <h4 className="text-1xl font-bold text-gray-800 px-2">
                     🎉 Limited Time Offer!!  <span className="text-sm font-normal">
                    Get your 1st test absolutely FREE!
                </span>
                </h4>
                
            </div>
                </div>

                {/* === Right Side (Features) === */}
                <div className="flex flex-col md:flex-row gap-6 flex-1">
                    {/* Feature 1 */}
                    <div className="bg-blue-600 text-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col items-center text-center hover:scale-105 transition">
                        <div className="bg-orange-200 text-blue-600 rounded-full flex items-center justify-center w-[50px] h-[50px] mb-4">
                            <FaPlayCircle className="w-[24px] h-[24px]" />
                        </div>
                        <p className="text-lg font-semibold">
                            10,000+ Tests
                        </p>
                        <p className="text-sm text-blue-100 mt-2 leading-relaxed">
                            Foundation, JEE, NEET, CET with detailed analysis.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-green-600 text-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col items-center text-center hover:scale-105 transition">
                        <div className="bg-white/20 text-white rounded-full flex items-center justify-center w-[50px] h-[50px] mb-4">
                            <FaGraduationCap className="w-[24px] h-[24px]" />
                        </div>
                        <p className="text-lg font-semibold">Expert Guidance</p>
                        <p className="text-sm text-green-100 mt-2 leading-relaxed">
                            Learn directly from India’s most experienced mentors.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-purple-600 text-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col items-center text-center hover:scale-105 transition">
                        <div className="bg-white/20 text-white rounded-full flex items-center justify-center w-[50px] h-[50px] mb-4">
                            <FaClock className="w-[24px] h-[24px]" />
                        </div>
                        <p className="text-lg font-semibold">Lifetime Access</p>
                        <p className="text-sm text-purple-100 mt-2 leading-relaxed">
                            Study anytime, anywhere with unlimited access.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
