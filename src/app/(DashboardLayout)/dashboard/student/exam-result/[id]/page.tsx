// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { getCurrentUser } from "@/lib/getCurrentUser";

// function RankHexBadge({ rank }: { rank: number }) {
//   return (
//     <div className="relative w-24 h-24 flex items-center justify-center">
//       <div
//         className="absolute inset-0 animate-pulse"
//         style={{
//           clipPath:
//             "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
//           background:
//             "linear-gradient(135deg,#00f5ff,#7c3aed,#ff00c8)",
//           boxShadow: "0 0 30px rgba(124,58,237,0.6)",
//         }}
//       />
//       <span className="relative text-3xl font-bold text-white drop-shadow-lg">
//         {rank}
//       </span>
//     </div>
//   );
// }

// export default function ExamDetailPage() {
//   const { id } = useParams();
//   const [data, setData] = useState<any>(null);
//   const [userEmail, setUserEmail] = useState("");

//   useEffect(() => {
//     async function fetchData() {
//       const userData = await getCurrentUser();
//       const email = userData.user.email;
//       setUserEmail(email);

//       const res = await fetch(
//         `/api/Exam-Result-Details?examId=${id}&email=${email}`
//       );
//       const result = await res.json();
//       setData(result);
//     }

//     fetchData();
//   }, [id]);

//   if (!data) return <div className="p-10 text-white">Loading...</div>;

//   const { exam, record, analytics, topperList } = data;

//   const studentPerformance = [
//     { name: "Correct", value: record.correct },
//     { name: "Incorrect", value: record.incorrect },
//     { name: "Unanswered", value: record.unanswered },
//   ];

//   const classDistribution = [
//     { name: "High", value: data.highCount },
//     { name: "Medium", value: data.mediumCount },
//     { name: "Low", value: data.lowCount },
//   ];

//   const colors1 = ["#22c55e", "#ef4444", "#facc15"];
//   const colors2 = ["#3b82f6", "#a855f7", "#f43f5e"];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black p-8 text-white">

//       {/* HEADER */}
//       <div className="mb-12 text-center">
//         <h1 className="text-4xl font-bold tracking-wide">
//           Exam Performance
//         </h1>
//         <p className="text-gray-400 mt-2">
//           {exam.course} • {exam.testType}
//         </p>
//       </div>

//       {/* RANK + SCORE SECTION */}
//       <div className="grid md:grid-cols-2 gap-10 mb-16">

//         {/* RANK CARD */}
//         <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl flex flex-col items-center">
//           <h2 className="text-lg text-gray-300 mb-6">
//             Your Rank
//           </h2>

//           <RankHexBadge rank={analytics.rank} />

//           <p className="mt-6 text-gray-400">
//             Out of {analytics.totalStudents} students
//           </p>

//           <p className="text-cyan-400 font-semibold mt-2">
//             Percentile: {analytics.percentile}%
//           </p>
//         </div>

//         {/* SCORE SUMMARY */}
//         <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl grid grid-cols-2 gap-6">
//           <div>
//             <p className="text-gray-400">Score</p>
//             <p className="text-3xl font-bold text-cyan-400">
//               {record.score}
//             </p>
//           </div>
//           <div>
//             <p className="text-gray-400">Total</p>
//             <p className="text-3xl font-bold">
//               {exam.totalMarks}
//             </p>
//           </div>
//           <div>
//             <p className="text-green-400">Correct</p>
//             <p className="text-2xl font-bold">
//               {record.correct}
//             </p>
//           </div>
//           <div>
//             <p className="text-red-400">Incorrect</p>
//             <p className="text-2xl font-bold">
//               {record.incorrect}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* CHARTS */}
//       <div className="grid md:grid-cols-2 gap-10 mb-16">

//         {/* STUDENT DONUT */}
//         <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-xl">
//           <h2 className="mb-6 text-lg text-gray-300">
//             Your Performance
//           </h2>

//           <ResponsiveContainer width="100%" height={280}>
//             <PieChart>
//               <Pie
//                 data={studentPerformance}
//                 dataKey="value"
//                 innerRadius={70}
//                 outerRadius={100}
//               >
//                 {studentPerformance.map((entry, index) => (
//                   <Cell key={index} fill={colors1[index]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* CLASS DONUT */}
//         <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-xl">
//           <h2 className="mb-6 text-lg text-gray-300">
//             Class Distribution
//           </h2>

//           <ResponsiveContainer width="100%" height={280}>
//             <PieChart>
//               <Pie
//                 data={classDistribution}
//                 dataKey="value"
//                 innerRadius={70}
//                 outerRadius={100}
//               >
//                 {classDistribution.map((entry, index) => (
//                   <Cell key={index} fill={colors2[index]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* LEADERBOARD */}
//       <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl">
//         <h2 className="text-xl mb-8">🏆 Leaderboard</h2>

//         <div className="space-y-5">
//           {topperList?.map((t: any, index: number) => {
//             const isUser = t.email === userEmail;

//             return (
//               <div
//                 key={index}
//                 className={`flex justify-between items-center p-5 rounded-2xl transition-all duration-300 ${
//                   isUser
//                     ? "bg-cyan-500/20 border border-cyan-400 scale-105"
//                     : "bg-white/5 hover:bg-white/10"
//                 }`}
//               >
//                 <div className="flex items-center gap-6">
//                   <RankHexBadge rank={index + 1} />
//                   <div>
//                     <p className="font-semibold text-lg">
//                       {t.name}
//                     </p>
//                     <p className="text-sm text-gray-400">
//                       {t.percentage?.toFixed(1)}%
//                     </p>
//                   </div>
//                 </div>

//                 <div className="text-xl font-bold text-cyan-400">
//                   {t.score}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//     </div>
//   );
// }

// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   LineChart,
//   Line,
// } from "recharts";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { useParams } from "next/navigation";
// import { getCurrentUser } from "@/lib/getCurrentUser";

// interface Exam {
//   _id: string;
//   testType: string;
//   course: string;
//   startTime: string;
//   endTime: string;
//   totalQuestions: number;
//   totalMarks: number;
// }

// interface Record {
//   _id: string;
//   name: string;
//   email: string;
//   score: number;
//   percentage: number;
//   correct: number;
//   incorrect: number;
//   unanswered: number;
//   duration: number;
//   timeLeft: number;
//   resultStatus: string;
// }

// interface Analytics {
//   rank: number;
//   percentile: string;
//   totalStudents: number;
// }

// interface ApiResponse {
//   success: boolean;
//   exam: Exam;
//   record: Record;
//   analytics: Analytics;
// }

// const ResultPage = () => {
//   const [data, setData] = useState<ApiResponse | null>(null);
  // const resultRef = useRef<HTMLDivElement | null>(null);
  //  const { id } = useParams();


  // useEffect(() => {
  //   const fetchResult = async () => {
  //     try {
  //             const userData = await getCurrentUser();
  //     const email = userData.user.email;
      

  //     const res = await fetch(
  //       `/api/Exam-Result-Details?examId=${id}&email=${email}`
  //     );

  //       // const res = await fetch("/api/result"); // same API style
  //       const json: ApiResponse = await res.json();
  //       setData(json);
  //     } catch (error) {
  //       console.error("Failed to fetch result", error);
  //     }
  //   };

  //   fetchResult();
  // }, []);

//   const handleDownload = async () => {
//     if (!resultRef.current) return;

//     const canvas = await html2canvas(resultRef.current);
//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//     });

//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight =
//       (canvas.height * pdfWidth) / canvas.width;

//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//     pdf.save("result.pdf");
//   };

//   if (!data) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         Loading...
//       </div>
//     );
//   }

//   const { exam, record, analytics } = data;

//   const marksPerQuestion =
//     exam.totalMarks / exam.totalQuestions;

//   const accuracy =
//     record.correct + record.incorrect === 0
//       ? 0
//       : Number(
//           (
//             (record.correct /
//               (record.correct + record.incorrect)) *
//             100
//           ).toFixed(2)
//         );

//   const speed =
//     record.duration === 0
//       ? 0
//       : Number(
//           (
//             exam.totalQuestions /
//             (record.duration / 60)
//           ).toFixed(2)
//         );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
//       <div
//         ref={resultRef}
//         className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-10"
//       >
//         {/* Rank */}
//         <div className="text-center">
//           <p className="text-gray-500">
//             Your Rank
//           </p>
//           <h1 className="text-5xl font-bold text-indigo-600">
//             #{analytics.rank}
//           </h1>
//           <p className="text-gray-600">
//             Out of {analytics.totalStudents} students
//           </p>
//         </div>

//         {/* Score */}
//         <div className="text-center">
//           <p className="text-gray-500">
//             Score
//           </p>
//           <h2 className="text-4xl font-semibold text-gray-800">
//             {record.score} / {exam.totalMarks}
//           </h2>
//           <p className="text-indigo-600 font-medium">
//             {record.percentage.toFixed(2)}%
//           </p>
//         </div>

//         {/* Charts */}
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Marks Breakdown */}
//           <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
//             <h3 className="font-semibold mb-4">
//               Marks Breakdown
//             </h3>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart
//                 data={[
//                   {
//                     name: "Scored",
//                     value:
//                       record.correct *
//                       marksPerQuestion,
//                   },
//                   {
//                     name: "Lost",
//                     value:
//                       record.incorrect *
//                       marksPerQuestion,
//                   },
//                   {
//                     name: "Unattempted",
//                     value:
//                       record.unanswered *
//                       marksPerQuestion,
//                   },
//                 ]}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar
//                   dataKey="value"
//                   fill="#6366f1"
//                   radius={[6, 6, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Speed vs Accuracy */}
//           <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
//             <h3 className="font-semibold mb-4">
//               Speed vs Accuracy
//             </h3>
//             <ResponsiveContainer width="100%" height={250}>
//               <LineChart
//                 data={[
//                   {
//                     name: "Performance",
//                     Speed: speed,
//                     Accuracy: accuracy,
//                   },
//                 ]}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line
//                   type="monotone"
//                   dataKey="Speed"
//                   stroke="#10b981"
//                   strokeWidth={3}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="Accuracy"
//                   stroke="#6366f1"
//                   strokeWidth={3}
//                 />
//               </LineChart>
//             </ResponsiveContainer>

//             <div className="flex justify-around mt-4 text-sm">
//               <span>
//                 Speed: {speed} Q/min
//               </span>
//               <span>
//                 Accuracy: {accuracy}%
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Download */}
//       <div className="text-center mt-6">
//         <button
//           onClick={handleDownload}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition"
//         >
//           Download Result (PDF)
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ResultPage;


"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getCurrentUser } from "@/lib/getCurrentUser";

import { toPng } from "html-to-image";

// ---------------- TYPES ----------------

interface Exam {
  _id: string;
  testType: string;
  course: string;
  totalQuestions: number;
  totalMarks: number;
}

interface RecordType {
  name: string;
  email: string;
  score: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  duration: number;
  timeLeft: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  score: number;
  percentage: number;
}

interface Analytics {
  rank: number;
  percentile: string;
  totalStudents: number;
}

interface ApiResponse {
  success: boolean;
  exam: Exam;
  record: RecordType;
  analytics: Analytics;
  topperList: Student[];
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

// ---------------- COMPONENT ----------------

export default function ResultPage() {
  const { id } = useParams() as { id: string };
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      try {
        const userData = await getCurrentUser();
        const email = userData?.user?.email;

        const res = await fetch(
          `/api/Exam-Result-Details?examId=${id}&email=${email}`
        );

        const json: ApiResponse = await res.json();
        setData(json);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  // const handleDownload = async () => {
  //   if (!resultRef.current) return;

  //   const canvas = await html2canvas(resultRef.current);
  //   const imgData = canvas.toDataURL("image/png");

  //   const pdf = new jsPDF();
  //   const width = pdf.internal.pageSize.getWidth();
  //   const height = (canvas.height * width) / canvas.width;

  //   pdf.addImage(imgData, "PNG", 0, 0, width, height);
  //   pdf.save("result.pdf");
  // };

  

const handleDownload = async () => {
  if (!resultRef.current) return;

  try {
    const dataUrl = await toPng(resultRef.current, {
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = "Exam-Result.png";
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Download failed:", error);
  }
};

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Result...
      </div>
    );

  if (!data) return <div>Result not found</div>;

  const {
    exam,
    record,
    analytics,
    topperList,
    highCount,
    mediumCount,
    lowCount,
  } = data;

  const accuracy =
    record.correct + record.incorrect === 0
      ? 0
      : Number(
          (
            (record.correct /
              (record.correct + record.incorrect)) *
            100
          ).toFixed(2)
        );

  const speed =
    record.duration === 0
      ? 0
      : Number(
          (
            exam.totalQuestions /
            (record.duration / 60)
          ).toFixed(2)
        );

  const percentageWidth = Math.max(
    0,
    (record.score / exam.totalMarks) * 100
  );

  const difficultyData = [
    { name: "High", value: highCount },
    { name: "Medium", value: mediumCount },
    { name: "Low", value: lowCount },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#10b981"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* DOWNLOAD BUTTON */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md"
          >
            Download Result
          </button>
        </div>

        <div
          ref={resultRef}
          className="bg-white shadow-xl rounded-2xl p-8 space-y-10"
        >
          {/* ===== SUMMARY SECTION ===== */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Rank */}
            <div className="bg-indigo-600 text-white p-6 rounded-xl text-center shadow-md">
              <p className="text-sm opacity-80">Your Rank</p>
              <h2 className="text-4xl font-bold mt-2">
                #{analytics.rank}
              </h2>
              <p className="text-sm mt-1">
                Out of {analytics.totalStudents}
              </p>
            </div>

            {/* Score */}
            <div className="bg-white border p-6 rounded-xl text-center shadow-sm">
              <p className="text-sm text-gray-500">Score</p>
              <h2 className="text-3xl font-bold mt-2">
                {record.score} / {exam.totalMarks}
              </h2>
              <p
                className={`mt-1 font-medium ${
                  record.score < 0
                    ? "text-red-500"
                    : "text-indigo-600"
                }`}
              >
                {record.percentage.toFixed(2)}%
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div
                  className="bg-indigo-600 h-3 rounded-full"
                  style={{
                    width: `${percentageWidth}%`,
                  }}
                />
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white border p-6 rounded-xl text-center shadow-sm">
              <p className="text-sm text-gray-500">Performance</p>
              <h2 className="text-lg font-semibold mt-2">
                Accuracy: {accuracy}%
              </h2>
              <p className="text-gray-600 mt-1">
                Speed: {speed} Q/min
              </p>
            </div>
          </div>

          {/* ===== ANALYSIS SECTION ===== */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Correct / Incorrect Pie */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">
                Question Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Correct", value: record.correct },
                      { name: "Incorrect", value: record.incorrect },
                      { name: "Unanswered", value: record.unanswered },
                    ]}
                    dataKey="value"
                    outerRadius={100}
                    label
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#9ca3af" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Difficulty Chart */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">
                Difficulty Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ===== TOPPER LIST ===== */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">
              Leaderboard
            </h3>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-indigo-100 text-indigo-700">
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {topperList.map((student, index) => (
                  <tr
                    key={student._id}
                    className={`border-b ${
                      student.email === record.email
                        ? "bg-indigo-50 font-semibold"
                        : ""
                    }`}
                  >
                    <td className="p-3">#{index + 1}</td>
                    <td className="p-3">{student.name}</td>
                    <td className="p-3 text-center">
                      {student.score}
                    </td>
                    <td className="p-3 text-center">
                      {student.percentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}