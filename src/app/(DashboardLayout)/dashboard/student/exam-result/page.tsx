// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getCurrentUser } from "@/lib/getCurrentUser";

// type ExamRecord = {
//   examId: string;
//   testType: string;
//   course?: string;
//   startTime: string;
//   endTime: string;
//   totalQuestions: number;
//   attended: boolean;
//   record?: {
//     _id: string;
//     score: number;
//     percentage: number;
//     correct: number;
//     incorrect: number;
//     unansweredCount: number;
//     Answers: any[];
//     resultStatus: string;
//   };
//   subjectChapterCounts: Record<string, number>;
// };

// export default function MyResultsPage() {
//   const [results, setResults] = useState<ExamRecord[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchResults() {
//       try {
//         const userData = await getCurrentUser();
//         const res = await fetch("/api/Exam-Result?email=" + userData.user.email);
//         const data = await res.json();
//         if (data.success) setResults(data.results);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchResults();
//   }, []);

//   if (loading) return <div className="p-4 text-center">Loading...</div>;

//   return (
//     <div className="p-4 max-w-6xl mx-auto space-y-8">
//       <h1 className="text-3xl font-bold mb-6">My Exam Results</h1>

//       <div className="grid md:grid-cols-2 gap-4">
//         {results.map((r) => {
//           const start = new Date(r.startTime);
//           const end = new Date(r.endTime);

//           // Build syllabus string like: Maths (Rational Number, Factorisation), Physics (Motion)
//           const syllabus = Object.entries(r.subjectChapterCounts)
//             .reduce<Record<string, string[]>>((acc, [key, _]) => {
//               const [sub, chap] = key.split(" - ");
//               if (!acc[sub]) acc[sub] = [];
//               acc[sub].push(chap);
//               return acc;
//             }, {});
//           const syllabusStr = Object.entries(syllabus)
//             .map(([sub, chaps]) => `${sub} (${chaps.join(", ")})`)
//             .join(", ");

//           return (
//             <div
//               key={r.examId}
//               className="bg-white p-4 rounded shadow hover:shadow-lg transition cursor-pointer"
//             >
//               <div className="flex flex-wrap gap-2 mb-2">
//                 <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm font-semibold">{r.testType}</span>
//                 <span className={`px-2 py-1 rounded text-sm font-semibold ${r.attended ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
//                   {r.attended ? "Attended" : "Not Attended"}
//                 </span>
//               </div>

//               <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
//                 <div><b>Syllabus:</b> {syllabusStr || "All"}</div>
//                 <div><b>Course:</b> {r.course || "N/A"}</div>
//                 <div><b>Date:</b> <span className="font-semibold">{start.toLocaleDateString()}</span></div>
//                 <div><b>Time:</b> <span className="font-semibold">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span> - <span className="font-semibold">{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
//                 {r.attended && r.record && r.record?.resultStatus === "published" ? (
//                   <div><b>Marks:</b> <span className="font-semibold">{r.record.score} / {r.totalQuestions * 4}</span></div>
//                 ) : null}
//               </div>

//               {r.attended && r.record?.resultStatus === "published" && (
//                 <Link
//                   href={`/dashboard/student/exam-detail?recordId=${r.record._id}`}
//                   className="mt-2 inline-block bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
//                 >
//                   View Details
//                 </Link>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ExamRecord = {
  examId: string;
  testType: string;
  course?: string;
  startTime: string;
  endTime: string;
  totalQuestions: number;
  attended: boolean;
  record?: {
    correct: number;
    incorrect: number;
    unansweredCount: number;
    score: number;
    percentage: number;
    resultStatus: string;
  };
  subjectChapterCounts: Record<string, number>;
};

export default function MyResultsPage() {
  const [results, setResults] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const userData = await getCurrentUser();
        const res = await fetch(
          "/api/Exam-Result?email=" + userData.user.email
        );
        const data = await res.json();
        if (data.success) setResults(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  // ✅ Only published exams
  const published = results.filter(
    (r) => r.attended && r.record?.resultStatus === "published"
  );

  // ✅ Average Score
  const avgScore =
    published.length > 0
      ? published.reduce((sum, r) => sum + (r.record?.score || 0), 0) /
        published.length
      : 0;

  const avgPercentage =
    published.length > 0
      ? published.reduce((sum, r) => sum + (r.record?.percentage || 0), 0) /
        published.length
      : 0;

  // ✅ Growth Data (based on percentage)
  const growthData = published.map((r, index) => ({
    name: `Exam ${index + 1}`,
    percentage: r.record?.percentage || 0,
  }));

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-semibold mb-6">My Exam Results</h1>

      {/* ================= OVERVIEW SECTION ================= */}
      {published.length > 0 && (
        <div className="space-y-6 mb-10">

          {/* Overview Boxes */}
          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-600">Exams Attempted</div>
              <div className="text-2xl font-semibold mt-1">
                {published.length}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-2xl font-semibold mt-1">
                {avgScore.toFixed(2)}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-600">Average Percentage</div>
              <div className="text-2xl font-semibold mt-1">
                {avgPercentage.toFixed(2)}%
              </div>
            </div>

          </div>

          {/* Growth Chart */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-base mb-4">Performance Growth</h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[-100, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="percentage"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* ================= ORIGINAL EXAM CARDS ================= */}
      <div className="grid md:grid-cols-2 gap-4">
        {results.map((r) => {
          const start = new Date(r.startTime);
          const end = new Date(r.endTime);

          const syllabus = Object.entries(r.subjectChapterCounts)
            .reduce<Record<string, string[]>>((acc, [key]) => {
              const [sub, chap] = key.split(" - ");
              if (!acc[sub]) acc[sub] = [];
              acc[sub].push(chap);
              return acc;
            }, {});
          const syllabusStr = Object.entries(syllabus)
            .map(([sub, chaps]) => `${sub} (${chaps.join(", ")})`)
            .join(", ");

          return (
        
            <Link
  key={r.examId}
  href={`/dashboard/student/exam-result/${r.examId}`}
  className="bg-white p-4 rounded shadow hover:shadow-lg transition block"
>

              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                  {r.testType}
                </span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    r.attended
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {r.attended ? "Attended" : "Not Attended"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                <div>Syllabus: {syllabusStr || "All"}</div>
                <div>Course: {r.course || "N/A"}</div>
                <div>
                  Date:{" "}
                  <span className="font-medium">
                    {start.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  Time:{" "}
                  <span className="font-medium">
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}