// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend,
//   BarChart, Bar, CartesianGrid
// } from "recharts";
// import html2pdf from "html2pdf.js";


// type TestRecord = {
//   _id: string;
//   username: string;
//   email: string;
//   name: string;
//   date: string;
//   score: number;
//   percentage: number;
//   correct: number;
//   incorrect: number;
//   unanswered: { id: string; ans: string; selected: string }[];
//   course: string;
//   subject: string;
//   chapter: string;
//   Answers: { id: string; ans: string; selected: string }[];
// };


// type RecordType = {
//   _id: string;
//   correct: number;
//   incorrect: number;
//   unanswered: { id: string; ans: string; selected: string }[];
//   Answers: { id: string; ans: string; selected: string }[];
//   score: number;
//   percentage: number;
//   username: string;
//   email: string;
//   name: string;
//   date: string;
//   course: string;
//   subject: string;
//   chapter: string;
// };

// type SubjectScore = {
//   subject: string;
//   correct: number;
//   incorrect: number;
//   unanswered: number;
// };

// export default function TestRecordsPage() {
//   const [records, setRecords] = useState<RecordType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const pageSize = 10;

//   const lineRef = useRef<HTMLDivElement | null>(null);
//   const pieRef = useRef<HTMLDivElement | null>(null);
//   const barRef = useRef<HTMLDivElement | null>(null);
//   const stackedRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     loadRecords();
//   }, [page]);

//   async function loadRecords() {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/test-records?page=${page}&limit=${pageSize}`);
//       const data = await res.json();
//       if (data.success) {
//         setRecords(data.records || []);
//         setTotalPages(data.totalPages || 1);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const filtered = records.filter(r => {
//     if (!search) return true;
//     const key = `${r.name} ${r.username} ${r.email}`;
//     return key.toLowerCase().includes(search.toLowerCase());
//   });

//   const paginated = filtered;

//   // --- Stats
//   const totalTests = records.length;
//   const avgScore = totalTests ? records.reduce((a, b) => a + b.score, 0) / totalTests : 0;
//   const avgPercent = totalTests ? records.reduce((a, b) => a + b.percentage, 0) / totalTests : 0;
//   const bestScore = totalTests ? Math.max(...records.map(r => r.score)) : 0;

//   // --- Trend Chart
//   const trendData = [...records]
//     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
//     .map((r, i) => ({
//       test: i + 1,
//       percentage: r.percentage,
//       score: r.score,
//       date: new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
//     }));

//   // --- Pie Chart
//   const totalCorrect = records.reduce((a, r) => a + (r.correct || 0), 0);
//   const totalIncorrect = records.reduce((a, r) => a + (r.incorrect || 0), 0);
//   const totalUnanswered = records.reduce((a, r) => a + ((r.unanswered?.length) || 0), 0);
//   const pieData = [
//     { name: "Correct", value: totalCorrect },
//     { name: "Incorrect", value: totalIncorrect },
//     { name: "Unanswered", value: totalUnanswered },
//   ];
//  const pieColors = ["#10b981", "#f97316", "#9ca3af"];

//   // --- Score distribution
//   const rangeData = [
//     { range: "0-20", count: records.filter(r => r.percentage <= 20).length },
//     { range: "21-40", count: records.filter(r => r.percentage > 20 && r.percentage <= 40).length },
//     { range: "41-60", count: records.filter(r => r.percentage > 40 && r.percentage <= 60).length },
//     { range: "61-80", count: records.filter(r => r.percentage > 60 && r.percentage <= 80).length },
//     { range: "81-100", count: records.filter(r => r.percentage > 80).length },
//   ];

//   // --- Stacked Bar for Test-to-Test Correct/Incorrect/Unanswered
//   const stackedData = [...records]
//     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
//     .map((r, i) => ({
//       test: `T${i + 1}`,
//       Correct: r.correct,
//       Incorrect: r.incorrect,
//       Unanswered: r.unanswered?.length || 0,
//     }));

//   // --- Utility to export charts to PDF
//   async function svgToPng(wrapper: HTMLElement | null) {
//     if (!wrapper) return null;
//     const svg = wrapper.querySelector("svg");
//     if (!svg) return null;
//     const serializer = new XMLSerializer();
//     const svgString = serializer.serializeToString(svg);
//     const svgBase64 = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgString)));
//     const img = new Image();
//     img.src = svgBase64;
//     await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
//     const rect = svg.getBoundingClientRect();
//     const canvas = document.createElement("canvas");
//     const scale = 2;
//     canvas.width = Math.max(1, Math.floor(rect.width * scale));
//     canvas.height = Math.max(1, Math.floor(rect.height * scale));
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return null;
//     ctx.setTransform(scale, 0, 0, scale, 0, 0);
//     ctx.drawImage(img, 0, 0);
//     return canvas.toDataURL("image/png");
//   }

//   const exportFullReport = async () => {
//     try {
//       const linePng = await svgToPng(lineRef.current!);
//       const piePng = await svgToPng(pieRef.current!);
//       const barPng = await svgToPng(barRef.current!);
//       const stackedPng = await svgToPng(stackedRef.current!);

//       const container = document.createElement("div");
//       container.style.width = "800px";
//       container.style.padding = "16px";
//       container.style.fontFamily = "Arial, Helvetica, sans-serif";

//       const title = document.createElement("h1");
//       title.innerText = "Student Test Performance Report";
//       title.style.textAlign = "center";
//       title.style.marginBottom = "8px";
//       container.appendChild(title);

//       if (linePng) {
//         const h2 = document.createElement("h3"); h2.innerText = "Performance Trend"; container.appendChild(h2);
//         const im = document.createElement("img"); im.src = linePng; im.style.width = "100%"; container.appendChild(im);
//       }
//       if (piePng) {
//         const h2 = document.createElement("h3"); h2.innerText = "Correct / Incorrect / Unanswered"; container.appendChild(h2);
//         const im = document.createElement("img"); im.src = piePng; im.style.width = "60%"; container.appendChild(im);
//       }
//       if (barPng) {
//         const h2 = document.createElement("h3"); h2.innerText = "Score Distribution"; container.appendChild(h2);
//         const im = document.createElement("img"); im.src = barPng; im.style.width = "100%"; container.appendChild(im);
//       }
//       if (stackedPng) {
//         const h2 = document.createElement("h3"); h2.innerText = "Test-wise Correct/Incorrect/Unanswered"; container.appendChild(h2);
//         const im = document.createElement("img"); im.src = stackedPng; im.style.width = "100%"; container.appendChild(im);
//       }

//       // simple table
//       const tbl = document.createElement("table");
//       tbl.style.width = "100%";
//       tbl.style.borderCollapse = "collapse";
//       const thead = document.createElement("thead");
//       thead.innerHTML = `<tr>
//         <th style="border:1px solid #ddd;padding:6px">Date</th>
//         <th style="border:1px solid #ddd;padding:6px">Score</th>
//         <th style="border:1px solid #ddd;padding:6px">Percentage</th>
//         <th style="border:1px solid #ddd;padding:6px">Correct</th>
//         <th style="border:1px solid #ddd;padding:6px">Incorrect</th>
//         <th style="border:1px solid #ddd;padding:6px">Unanswered</th>
//       </tr>`;
//       tbl.appendChild(thead);
//       const tbody = document.createElement("tbody");
//       for (const r of records) {
//         const row = document.createElement("tr");
//         row.innerHTML = `<td style="border:1px solid #eee;padding:6px">${new Date(r.date).toLocaleString()}</td>
//         <td style="border:1px solid #eee;padding:6px">${r.score}</td>
//         <td style="border:1px solid #eee;padding:6px">${r.percentage}%</td>
//         <td style="border:1px solid #eee;padding:6px">${r.correct}</td>
//         <td style="border:1px solid #eee;padding:6px">${r.incorrect}</td>
//         <td style="border:1px solid #eee;padding:6px">${r.unanswered?.length || 0}</td>`;
//         tbody.appendChild(row);
//       }
//       tbl.appendChild(tbody);
//       container.appendChild(tbl);

//       html2pdf().from(container).set({ filename: "student-report.pdf", html2canvas: { scale: 2 } }).save();
//     } catch (err) {
//       console.error(err);
//       alert("Export failed.");
//     }
//   };

//   const subjectMap = new Map<string, { correct: number; incorrect: number; unanswered: number }>();

// records.forEach(r => {
//   const key = r.subject || "Unknown";
//   if (!subjectMap.has(key)) subjectMap.set(key, { correct: 0, incorrect: 0, unanswered: 0 });
  
//   const val = subjectMap.get(key)!;
//   val.correct += r.correct;
//   val.incorrect += r.incorrect;
//   val.unanswered += r.unanswered?.length || 0;
// });

// const subjectScores = Array.from(subjectMap.entries()).map(([subject, val]) => ({
//   subject, ...val
// }));


//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Test Performance Dashboard</h1>

//       {/* STATS */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard label="Total Tests" value={totalTests} color="bg-gradient-to-r from-indigo-500 to-purple-500" />
//         <StatCard label="Average Score" value={avgScore.toFixed(1)} color="bg-gradient-to-r from-green-500 to-teal-500" />
//         <StatCard label="Average %" value={`${avgPercent.toFixed(1)}%`} color="bg-gradient-to-r from-yellow-400 to-orange-500" />
//         <StatCard label="Best Score" value={bestScore} color="bg-gradient-to-r from-pink-500 to-red-500" />
//       </div>

//       {/* CHARTS */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-4 rounded shadow" ref={lineRef as any}>
//           <h2 className="font-semibold mb-2">Performance Trend</h2>
//           <div style={{ width: "100%", height: 260 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={trendData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={3} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded shadow" ref={pieRef as any}>
//           <h2 className="font-semibold mb-2">Correct / Incorrect / Unanswered</h2>
//           <div style={{ width: "100%", height: 260 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
//                   {pieData.map((_, idx) => <Cell key={idx} fill={pieColors[idx]} />)}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* BAR CHARTS */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-4 rounded shadow" ref={barRef as any}>
//           <h2 className="font-semibold mb-2">Score Distribution</h2>
//           <div style={{ width: "100%", height: 260 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={rangeData}>
//                 <XAxis dataKey="range" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="count" fill="#7c3aed" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded shadow" ref={stackedRef as any}>
//           <h2 className="font-semibold mb-2">Test-wise Correct/Incorrect/Unanswered</h2>
//           <div style={{ width: "100%", height: 260 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={stackedData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="test" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="Correct" stackId="a" fill="#16a34a" />
//                 <Bar dataKey="Incorrect" stackId="a" fill="#ef4444" />
//                 <Bar dataKey="Unanswered" stackId="a" fill="#6b7280" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* CONTROLS */}
//       <div className="flex items-center justify-between gap-4">
//         <input
//           className="border p-2 rounded w-64"
//           placeholder="Search by name / email"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//         <div className="flex gap-2">
//           <button onClick={exportFullReport} className="px-4 py-2 bg-blue-600 text-white rounded">Export PDF</button>
//           <button onClick={() => loadRecords()} className="px-4 py-2 border rounded">Refresh</button>
//         </div>
//       </div>

//       {/* TABLE */}
//      <div className="bg-white p-4 rounded shadow overflow-x-auto mt-4 ">
//   <table className="min-w-full table-auto text-sm rounded-2xl">
//     <thead className="bg-gray-100 sticky top-0">
//       <tr>
//         <th className="p-3 text-left text-gray-600">Date</th>
//         <th className="p-3 text-left text-gray-600">Score</th>
//         <th className="p-3 text-left text-gray-600">Percentage</th>
//         <th className="p-3 text-left text-gray-600">Correct</th>
//         <th className="p-3 text-left text-gray-600">Incorrect</th>
//         <th className="p-3 text-left text-gray-600">Unanswered</th>
//       </tr>
//     </thead>
//     <tbody>
//       {loading && <tr><td colSpan={6} className="p-4 text-center text-gray-500">Loading...</td></tr>}
//       {!loading && paginated.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">No records</td></tr>}
//       {paginated.map((r, i) => (
//         <tr key={r._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"} >
//           <td className="p-2 text-gray-700">{new Date(r.date).toLocaleDateString()}</td>
//           <td className="p-2 text-gray-700 font-medium">{r.score}</td>
//           <td className="p-2 text-gray-700">{r.percentage}%</td>
//           <td className="p-2 text-green-600">{r.correct}</td>
//           <td className="p-2 text-orange-500">{r.incorrect}</td>
//           <td className="p-2 text-gray-400">{r.unanswered?.length || 0}</td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>


//       {/* PAGINATION */}
//       <div className="flex justify-center gap-2 mt-4">
//         <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
//         <span className="px-3 py-1">Page {page} / {totalPages}</span>
//         <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
//   return (
//     <div className={`p-4 rounded shadow text-white ${color}`}>
//       <div className="text-sm">{label}</div>
//       <div className="text-xl font-bold">{value}</div>
//     </div>
//   );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import html2pdf from "html2pdf.js";

type AnswerType = { id: string; ans: string; selected: string };

type TestRecord = {
  _id: string;
  username: string;
  email: string;
  name: string;
  date: string;
  score: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: AnswerType[];
  course: string;
  subject: string;
  chapter: string;
  Answers: AnswerType[];
};

export default function TestRecordsPage() {
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const pageSize = 10;

  const lineRef = useRef<HTMLDivElement | null>(null);
  const pieRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const subjectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadRecords();
  }, [page]);

  async function loadRecords() {
    try {
      setLoading(true);
      const res = await fetch(`/api/test-records?page=${page}&limit=${pageSize}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setTotalPages(data.totalPages || 1);
      } else {
        setRecords([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = records.filter(r => {
    if (!search) return true;
    const key = `${r.name} ${r.username} ${r.email} ${r.course} ${r.subject} ${r.chapter}`;
    return key.toLowerCase().includes(search.toLowerCase());
  });

  const paginated = filtered;

  // Stats
  const totalTests = records.length;
  const avgScore = totalTests ? (records.reduce((a, b) => a + b.score, 0) / totalTests) : 0;
  const avgPercent = totalTests ? (records.reduce((a, b) => a + b.percentage, 0) / totalTests) : 0;
  const bestScore = totalTests ? Math.max(...records.map(r => r.score)) : 0;

  // Trend chart
  const trendData = [...records]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r, i) => ({
      test: `T${i + 1}`,
      percentage: r.percentage,
      score: r.score,
      date: new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    }));

  // Pie: correct/incorrect/unanswered
  const totalCorrect = records.reduce((a, b) => a + b.correct, 0);
  const totalIncorrect = records.reduce((a, b) => a + b.incorrect, 0);
  const totalUnanswered = records.reduce((a, b) => a + (b.unanswered?.length || 0), 0);
  const pieData = [
    { name: "Correct", value: totalCorrect },
    { name: "Incorrect", value: totalIncorrect },
    { name: "Unanswered", value: totalUnanswered },
  ];
  const pieColors = ["#16a34a", "#ef4444", "#6b7280"];

  // Score distribution
  const rangeData = [
    { range: "0-20", count: records.filter(r => r.percentage <= 20).length },
    { range: "21-40", count: records.filter(r => r.percentage > 20 && r.percentage <= 40).length },
    { range: "41-60", count: records.filter(r => r.percentage > 40 && r.percentage <= 60).length },
    { range: "61-80", count: records.filter(r => r.percentage > 60 && r.percentage <= 80).length },
    { range: "81-100", count: records.filter(r => r.percentage > 80).length },
  ];

  // Subject-wise aggregation
  // const subjectMap = new Map<string, { correct: number; incorrect: number; unanswered: number }>();
  // records.forEach(r => {
  //   const key = r.subject || "Unknown";
  //   if (!subjectMap.has(key)) subjectMap.set(key, { correct: 0, incorrect: 0, unanswered: 0 });
  //   const val = subjectMap.get(key)!;
  //   val.correct += r.correct;
  //   val.incorrect += r.incorrect;
  //   val.unanswered += r.unanswered?.length || 0;
  // });
  // const subjectData = Array.from(subjectMap.entries()).map(([subject, val]) => ({
  //   subject, ...val
  // }));

  // SUBJECT-WISE AVERAGE SCORE
const subjectScoreMap = new Map<
  string,
  { totalScore: number; attempts: number }
>();

records.forEach((r) => {
  const subject = r.subject || "Unknown";
  if (!subjectScoreMap.has(subject)) {
    subjectScoreMap.set(subject, { totalScore: 0, attempts: 0 });
  }
  const val = subjectScoreMap.get(subject)!;
  val.totalScore += r.score;
  val.attempts += 1;
});

const subjectData = Array.from(subjectScoreMap.entries()).map(
  ([subject, val]) => ({
    subject,
    avgScore: Number((val.totalScore / val.attempts).toFixed(1)),
  })
);


  // Improvement summary
  function improvementSummary() {
    if (trendData.length < 2) return "Give at least 2 tests to calculate improvement.";
    const first = trendData[0].percentage;
    const last = trendData[trendData.length - 1].percentage;
    const gain = Number((last - first).toFixed(1));
    if (gain > 15) return "🔥 Excellent progress! Your performance has improved significantly.";
    if (gain > 5) return "👍 Good improvement! Keep practicing weak areas.";
    if (gain > 0) return "🙂 Slight improvement. Focus on incorrect questions.";
    return "⚠️ Your performance dropped. Review previous tests and focus on weak topics.";
  }

  if (records.length === 0) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">No Test Records Found</h2>
      <p className="text-gray-600">You have not taken any test yet.</p>

     
    </div>
  );
}

  return (
    <div className="p-6 space-y-6">
      
      <h1 className="text-2xl font-bold">Test Performance Dashboard</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Total Tests" value={totalTests} />
        <Card label="Average Score" value={avgScore.toFixed(1)} />
        <Card label="Average %" value={`${avgPercent.toFixed(1)}%`} />
        <Card label="Best Score" value={bestScore} />
      </div>

      {/* Trend Chart */}
      <div className="bg-white p-4 rounded shadow" ref={lineRef}>
        <h2 className="font-semibold mb-2">Performance Trend</h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis dataKey="test" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={3} />
              <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie + Distribution + Subject-wise */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow" ref={pieRef}>
          <h2 className="font-semibold mb-2">Correct / Incorrect / Unanswered</h2>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((_, idx) => <Cell key={idx} fill={pieColors[idx % pieColors.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow" ref={barRef}>
          <h2 className="font-semibold mb-2">Score Distribution</h2>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rangeData}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

       <div className="bg-white p-4 rounded shadow" ref={subjectRef}>
  <h2 className="font-semibold mb-2">Subject-wise Average Score</h2>
  <div style={{ width: "100%", height: 260 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={subjectData}>
        <XAxis dataKey="subject" />
        <YAxis />
        <Tooltip />
      <Bar dataKey="avgScore" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />

      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

      </div>

      {/* TABLE */}
  <div className="bg-white p-4 rounded-xl shadow-sm overflow-x-auto">
  <table className="min-w-full text-sm border-separate border-spacing-0">
    <thead>
      <tr className="bg-gray-100 text-gray-700">
        <th className="py-3 px-4 text-left font-medium rounded-tl-lg">Date</th>
        <th className="py-3 px-4 text-left font-medium">Course</th>
        <th className="py-3 px-4 text-left font-medium">Subject</th>
        <th className="py-3 px-4 text-left font-medium">Chapter</th>
        <th className="py-3 px-4 text-left font-medium">Score</th>
        <th className="py-3 px-4 text-left font-medium rounded-tr-lg">Percentage</th>
      </tr>
    </thead>

    <tbody>
      {loading && (
        <tr>
          <td colSpan={6} className="p-4 text-center text-gray-600">
            Loading...
          </td>
        </tr>
      )}

      {!loading && paginated.length === 0 && (
        <tr>
          <td colSpan={6} className="p-4 text-center text-gray-600">
            No records found
          </td>
        </tr>
      )}

      {!loading &&
        paginated.map((r, i) => (
          <tr
            key={r._id}
            className="hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <td className="py-3 px-4 text-gray-700">
              {new Date(r.date).toLocaleDateString()}
            </td>
            <td className="py-3 px-4 text-gray-700">{r.course}</td>
            <td className="py-3 px-4 text-gray-700">{r.subject}</td>
            <td className="py-3 px-4 text-gray-700">{r.chapter}</td>
            <td className="py-3 px-4 text-gray-700">{r.score}</td>
            <td className="py-3 px-4 text-gray-700">{r.percentage}%</td>
          </tr>
        ))}
    </tbody>
  </table>
</div>


    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col items-start hover:shadow-md transition">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
