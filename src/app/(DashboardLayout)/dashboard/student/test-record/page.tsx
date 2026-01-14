"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
  CartesianGrid,
} from "recharts";

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
  duration:number;
  timeLeft:number;
  incorrect: number;
  unanswered: AnswerType[];
  course: string;
  subject: string;
  chapter: string;
  Answers: AnswerType[];
};

type TestSummary = {
  totalTests: number;
  avgScore: number;
  bestScore: number;
  avgTimeTaken: number;
  duration: number;

  firstTestDate?: Date;
  lastTestDate?: Date;
  testsLast7Days: number;
  testsLast30Days: number;

  weakSubject?: string;
  strongSubject?: string;

  recentAvgScore?: number;   // last 3–5 tests
  earlyAvgScore?: number;    // first 3–5 tests
};

type TestRecordInsights = {
  createdAt?: string | Date;
  score: number;
  percentage: number;
  subject?: string;
  timeLeft?: number;
  duration?: number;
};


export default function TestRecordsPage() {
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // -------------------- Load Records --------------------
  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      setLoading(true);
      const res = await fetch("/api/test-records");
      const data = await res.json();
      if (data.success) setRecords(data.records || []);
      else setRecords([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // -------------------- Summary --------------------
  const totalTests = records.length;
  const avgScore = totalTests
    ? records.reduce((a, b) => a + b.score, 0) / totalTests
    : 0;
const avgTimeTaken =
  records.length > 0
    ? records.reduce((sum, r) => sum + (r.duration - r.timeLeft), 0) / records.length
    : 0;
const avgTimePerQuestion =
  records.length > 0
    ? records.reduce((sum, r) => {
        const timeTaken = r.duration - r.timeLeft;
        const attempted = r.correct + r.incorrect;
        return attempted > 0 ? sum + timeTaken / attempted : sum;
      }, 0) / records.length
    : 0;
const subjectTimeMap: Record<string, { time: number; count: number }> = {};

records.forEach((r) => {
  const key = r.subject || "All";
  const timeTaken = r.duration - r.timeLeft;

  if (!subjectTimeMap[key]) {
    subjectTimeMap[key] = { time: 0, count: 0 };
  }

  subjectTimeMap[key].time += timeTaken;
  subjectTimeMap[key].count += 1;
});

const subjectAvgTime = Object.entries(subjectTimeMap).map(
  ([subject, v]) => ({
    subject,
    avgTime: v.time / v.count,
  })
);


const bestScore = totalTests
    ? Math.max(...records.map((r) => r.score))
    : 0;

  // Strong / Weak Subject
  // const subjectStats = useMemo(() => {
  //   const map: Record<string, { total: number; count: number }> = {};
  //   records.forEach((r) => {
  //     const s = r.subject || "Unknown";
  //     if (!map[s]) map[s] = { total: 0, count: 0 };
  //     map[s].total += r.score;
  //     map[s].count += 1;
  //   });
  //   const arr = Object.entries(map).map(([subject, val]) => ({
  //     subject,
  //     avg: val.total / val.count,
  //   }));
  //   arr.sort((a, b) => b.avg - a.avg);
  //   return {
  //     strong: arr[0]?.subject || "-",
  //     weak: arr[arr.length - 1]?.subject || "-",

  //   };
  // }, [records]);

  const subjectStats = useMemo(() => {
  return getRecentStrongWeakSubject(records);
}, [records]);


  // -------------------- Table Filter/Search --------------------
  const [search, setSearch] = useState("");
  const filteredRecords = useMemo(() => {
    if (!search) return records;
    return records.filter((r) =>
      `${r.name} ${r.username} ${r.email} ${r.course} ${r.subject} ${r.chapter}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [records, search]);

  // -------------------- Colors --------------------
  const pieColors1 = ["#3b82f6", "#f97316", "#ef4444", "#16a34a", "#8b5cf6"];
  const pieColors2 = ["#f43f5e", "#fbbf24", "#14b8a6", "#6366f1", "#e879f9"];
  const lineColors = ["#2563eb", "#f59e0b", "#16a34a", "#8b5cf6", "#f43f5e"];
  const barColors = ["#3b82f6", "#f97316", "#10b981", "#e11d48"];

  // -------------------- Group by Month / Subject --------------------
  const monthMap = useMemo(() => {
    const map: Record<string, TestRecord[]> = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [records]);

  const months = useMemo(() => Object.keys(monthMap).sort(), [monthMap]);

  // -------------------- Chart Pagination States --------------------
  const [monthIndex1, setMonthIndex1] = useState(0); // Line
  const [monthIndex2, setMonthIndex2] = useState(0); // Monthly Analysis Bar
  const [subjectIndex1, setSubjectIndex1] = useState(0); // Correct/Incorrect
  const [subjectIndex2, setSubjectIndex2] = useState(0); // Answered/Unanswered

  // Update monthIndex when months change
  useEffect(() => {
    if (months.length > 0) {
      setMonthIndex1(months.length - 1);
      setMonthIndex2(months.length - 1);
    }
  }, [months]);

  // -------------------- Line Chart (Performance) --------------------
  const lineData = useMemo(() => {
    const key = months[monthIndex1];
    if (!key) return [];
    return [...(monthMap[key] || [])]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r, i) => ({
        test: `T${i + 1}`,
        score: r.score,
        percentage: r.percentage,
        date: new Date(r.date).toLocaleDateString(),
      }));
  }, [monthMap, months, monthIndex1]);

  // -------------------- Monthly Analysis Bar --------------------
const barData = useMemo(() => {
  const key = months[monthIndex2];
  if (!key || !monthMap[key]) return [];

  const records = monthMap[key];

  const subjectScoreMap: Record<
    string,
    { total: number; count: number }
  > = {};

  records.forEach((r) => {
    if (!subjectScoreMap[r.subject]) {
      subjectScoreMap[r.subject] = { total: 0, count: 0 };
    }
    subjectScoreMap[r.subject].total += r.score;
    subjectScoreMap[r.subject].count += 1;
  });

  return Object.entries(subjectScoreMap).map(([subject, v]) => ({
    subject,
    avgScore: Number((v.total / v.count).toFixed(1)),
  }));
}, [monthMap, months, monthIndex2]);


  // -------------------- Pie Charts --------------------
  const subjects = useMemo(() => {
    const map: Record<string, TestRecord[]> = {};
    records.forEach((r) => {
      const s = r.subject || "Unknown";
      if (!map[s]) map[s] = [];
      map[s].push(r);
    });
    return Object.keys(map).sort();
  }, [records]);

  const currentSubject1 = subjects[subjectIndex1];
  const currentSubject2 = subjects[subjectIndex2];

  const pieDataCorrectIncorrect = useMemo(() => {
    if (!currentSubject1) return [];
    const subRecords = records.filter((r) => r.subject === currentSubject1);
    const correct = subRecords.reduce((a, b) => a + b.correct, 0);
    const incorrect = subRecords.reduce((a, b) => a + b.incorrect, 0);
    return [
      { name: "Correct", value: correct },
      { name: "Incorrect", value: incorrect },
    ];
  }, [records, currentSubject1]);

  const pieDataAnsweredUnanswered = useMemo(() => {
    if (!currentSubject2) return [];
    const subRecords = records.filter((r) => r.subject === currentSubject2);
    const answered = subRecords.reduce(
      (a, b) => a + b.correct + b.incorrect,
      0
    );
    const unanswered = subRecords.reduce((a, b) => a + b.unanswered.length, 0);
    return [
      { name: "Answered", value: answered },
      { name: "Unanswered", value: unanswered },
    ];
  }, [records, currentSubject2]);

  if (records.length === 0 && !loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No Test Records Found</h2>
        <p className="text-gray-600">You have not taken any test yet.</p>
      </div>
    );
  }

  
  const mainInsight = generateMainInsight({
    totalTests,
    avgScore,
    bestScore,
    avgTimeTaken,
    duration: records.length>0?records[0].duration:3000,
    weakSubject: subjectStats.weak,
    record:records,
  });
  // -------------------- Render --------------------

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold">Test Performance Dashboard</h1>

      {/* Summary Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
  <SummaryBox
    label="Total Tests Attempted"
    value={totalTests}
    color="from-blue-50 to-white"
  />

  <SummaryBox
    label="Average Score"
    value={avgScore.toFixed(1)}
    color="from-green-50 to-white"
  />

  {/* <SummaryBox
    label="Best Score"
    value={bestScore}
    color="from-yellow-50 to-white"
  /> */}

 

  <SummaryBox
    label="Avg Time / Test"
    value={formatTime(avgTimeTaken)}
    color="from-orange-50 to-white"
  />

  <SummaryBox
    label="Avg Time / Question"
    value={formatTime(avgTimePerQuestion)}
    color="from-teal-50 to-white"
  />

   <SummaryBox
    label="Strong Subject"
    value={subjectStats.strong}
    color="from-purple-50 to-white"
  />

  <SummaryBox
    label="Weak Subject"
    value={subjectStats.weak}
    color="from-red-50 to-white"
  />
</div>

<div className="rounded-xl p-5 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100">
  <p className="text-sm font-semibold text-indigo-600">
    Performance Insight
  </p>

  <p className="mt-2 text-base text-gray-700 leading-relaxed">
    {mainInsight}
  </p>
</div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correct vs Incorrect Pie */}
        <ChartCard title={`Correct vs Incorrect - ${currentSubject1 || "-"}`}>
          <div className="flex justify-between mb-2">
            <button
              disabled={subjectIndex1 === 0}
              onClick={() => setSubjectIndex1((i) => i - 1)}
              className="px-2 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ◀
            </button>
            <div className="font-semibold">{currentSubject1}</div>
            <button
              disabled={subjectIndex1 === subjects.length - 1}
              onClick={() => setSubjectIndex1((i) => i + 1)}
              className="px-2 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ▶
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieDataCorrectIncorrect} dataKey="value" nameKey="name" label>
                {pieDataCorrectIncorrect.map((_, i) => (
                  <Cell key={i} fill={pieColors1[i % pieColors1.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Answered vs Unanswered Pie */}
        <ChartCard title={`Answered vs Unanswered - ${currentSubject2 || "-"}`}>
          <div className="flex justify-between mb-2">
            <button
              disabled={subjectIndex2 === 0}
              onClick={() => setSubjectIndex2((i) => i - 1)}
              className="px-2 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ◀
            </button>
            <div className="font-semibold">{currentSubject2}</div>
            <button
              disabled={subjectIndex2 === subjects.length - 1}
              onClick={() => setSubjectIndex2((i) => i + 1)}
              className="px-2 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ▶
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieDataAnsweredUnanswered} dataKey="value" nameKey="name" label>
                {pieDataAnsweredUnanswered.map((_, i) => (
                  <Cell key={i} fill={pieColors2[i % pieColors2.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Performance Line Chart */}
        <ChartCard title="Performance Over Tests">
          <div className="flex justify-between mb-2">
            <button
              disabled={monthIndex1 === 0}
              onClick={() => setMonthIndex1((i) => i - 1)}
              className="px-2 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ◀
            </button>
            <div className="font-semibold">{formatMonthLabel(months[monthIndex1])}</div>
            <button
              disabled={monthIndex1 === months.length - 1}
              onClick={() => setMonthIndex1((i) => i + 1)}
              className="px-2 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ▶
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <XAxis dataKey="test" />
              <YAxis />
              <Tooltip />
              <Line dataKey="score" stroke={lineColors[0]} strokeWidth={3} name="Score" />
              <Line dataKey="percentage" stroke={lineColors[1]} strokeWidth={3} name="Percentage" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Analysis Bar Chart */}
        <ChartCard title="Monthly Analysis">
          <div className="flex justify-between mb-2">
            <button
              disabled={monthIndex2 === 0}
              onClick={() => setMonthIndex2((i) => i - 1)}
              className="px-2 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ◀
            </button>
            <div className="font-semibold">{formatMonthLabel(months[monthIndex2])}</div>
            <button
              disabled={monthIndex2 === months.length - 1}
              onClick={() => setMonthIndex2((i) => i + 1)}
              className="px-2 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ▶
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
           <BarChart data={barData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="subject" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="avgScore" fill="#4f46e5" radius={[6, 6, 0, 0]} />
</BarChart>

          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Modern Table */}
      <div className="bg-white p-4 rounded-xl shadow-sm overflow-x-auto">
          <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="mb-2 p-2 border rounded w-full max-w-sm"
        />
        <table className="min-w-full border-collapse table-auto border border-gray-200">
          <thead className="bg-blue-950 text-white sticky top-0 z-10">
            <tr>
              <th className="p-3 border border-gray-400 text-left">Date</th>
              <th className="p-3 border border-gray-400 text-left">Course</th>
              <th className="p-3 border border-gray-400 text-left">Subject</th>
              <th className="p-3 border border-gray-400 text-left">Chapter</th>
              <th className="p-3 border border-gray-400 text-left">Score</th>
              <th className="p-3 border border-gray-400 text-left">%</th>
              <th className="p-3 border border-gray-400 text-left">Time Taken</th>
              <th className="p-3 border border-gray-400 text-left">Test Duration</th>
              <th className="p-3 border border-gray-400 text-left">Correct</th>
              <th className="p-3 border border-gray-400 text-left">Incorrect</th>
              <th className="p-3 border border-gray-400 text-left">Unanswered</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr key={r._id} className={`${i % 2 === 0 ? "bg-blue-50" : ""} hover:bg-gray-100 transition`}>
                <td className="p-2 border border-gray-300">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-2 border border-gray-300">{r.course}</td>
                <td className="p-2 border border-gray-300">{r.subject}</td>
                <td className="p-2 border border-gray-300">{r.chapter}</td>
                <td className="p-2 border border-gray-300">{r.score}</td>
                <td className="p-2 border border-gray-300">{r.percentage}%</td>
                <td className="p-2 border border-gray-300">{(r.duration&&r.timeLeft)?formatTime(r.duration-r.timeLeft):"-"}</td>
                <td className="p-2 border border-gray-300">{(r.duration&&r.timeLeft)?formatTime(r.duration):"-"}</td>
                <td className="p-2 border border-gray-300">{r.correct}</td>
                <td className="p-2 border border-gray-300">{r.incorrect}</td>
                <td className="p-2 border border-gray-300">{r.unanswered.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------- Helper Components --------------------
function SummaryBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      className={`bg-gradient-to-br ${color} p-4 rounded-xl shadow-sm hover:shadow-md transition-all`}
    >
      <div className="text-sm text-gray-700">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${s}s`;
}


// function generateMainInsight(params: {
//   totalTests: number;
//   avgScore: number;
//   bestScore: number;
//   avgTimeTaken: number;
//   duration: number;
//   weakSubject?: string;
//   record
// }) {
//   const {
//     totalTests,
//     avgScore,
//     bestScore,
//     avgTimeTaken,
//     duration,
//     weakSubject,
//   } = params;

//   // 1️⃣ Consistency
//   if (totalTests < 8) {
//     return "Practice consistency is low. Increase test frequency to build confidence and long-term improvement.";
//   }

//   // 2️⃣ Time management
//   if (avgTimeTaken > duration * 1.05) {
//     return "Time pressure observed in tests. Focus on timed practice and quicker decision-making.";
//   }

//   // 3️⃣ Subject weakness
//   if (weakSubject) {
//     return `Most score loss is coming from ${weakSubject}. Targeted revision here will give the fastest improvement.`;
//   }

//   // 4️⃣ Performance gap
//   if (bestScore - avgScore > 20) {
//     return "Performance is inconsistent. Aim to match your best performance more frequently.";
//   }

//   // 5️⃣ Strong overall
//   return "Overall performance is stable. Maintain consistency and start increasing difficulty gradually.";
// }


function generateMainInsight(params: {
  totalTests: number;
  avgScore: number;
  bestScore: number;
  avgTimeTaken: number;
  duration: number;
  weakSubject?: string;
  record: TestRecord[];
}) {
  const { totalTests, avgScore, bestScore, avgTimeTaken, duration, weakSubject, record } = params;

  if (!record || record.length === 0) return "No tests taken yet. Start attempting tests to generate insights.";

  const insights: string[] = [];

  // 1️⃣ New learner
  if (totalTests <= 3) {
    insights.push("You are just starting. Focus on understanding concepts clearly — scores will improve naturally with regular practice.");
  }

  // 2️⃣ Consistency / Gaps
  const sortedRecords = [...record].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  for (let i = 1; i < sortedRecords.length; i++) {
    const prev = new Date(sortedRecords[i - 1].date).getTime();
    const curr = new Date(sortedRecords[i].date).getTime();
    const gapDays = (curr - prev) / (1000 * 60 * 60 * 24);
    if (gapDays > 14) {
      insights.push(`There was a gap of ${Math.round(gapDays)} days between tests. Try maintaining regular practice for better retention.`);
      break;
    }
  }

  // 3️⃣ Performance trend
  const first3 = sortedRecords.slice(0, 3);
  const last3 = sortedRecords.slice(-3);
  const earlyAvg = first3.reduce((sum, r) => sum + r.score, 0) / first3.length;
  const recentAvg = last3.reduce((sum, r) => sum + r.score, 0) / last3.length;

  if (recentAvg > earlyAvg + 10) {
    insights.push("Your recent tests show improvement. Keep up the strategy that’s working!");
  } else if (recentAvg + 10 < earlyAvg) {
    insights.push("Recent performance has dropped. Focus on revision and avoid rushing questions.");
  }

  // 4️⃣ Time management
  if (avgTimeTaken > duration * 1.1) {
    insights.push("You are taking longer than expected per test. Practice timed tests to improve efficiency.");
  }
  if (avgTimeTaken < duration * 0.6 && avgScore < 60) {
    insights.push("Tests are being completed too quickly with low accuracy. Slow down and attempt questions carefully.");
  }

  // 5️⃣ Subject-level insights
  if (weakSubject) {
    insights.push(`Most score loss is coming from ${weakSubject}. Focused practice here will yield faster improvement.`);
  }

  // 6️⃣ Best vs average
  if (bestScore - avgScore > 25 && totalTests >= 6) {
    insights.push("Your best score is significantly higher than your average. Analyze what worked in that test and try to replicate it.");
  }

  // 7️⃣ Stable high performance
  if (avgScore >= 75 && totalTests >= 6) {
    insights.push("Performance is strong and consistent. Gradually increase difficulty while maintaining accuracy.");
  }

  // 8️⃣ Skipped / unanswered questions trends
  const totalUnanswered = record.reduce((sum, r) => sum + r.unanswered.length, 0);
  if (totalUnanswered / totalTests > 5) {
    insights.push("You are leaving multiple questions unanswered per test. Focus on attempting all questions for better scoring.");
  }

  // 9️⃣ Default / motivational
  if (insights.length === 0) {
    insights.push("Progress is steady. Keep testing regularly and focusing on weak areas to improve consistency and confidence.");
  }

  // Return a joined string of multiple insights
  return insights.join(" ");
}


function formatMonthLabel(key: string) {
  if (!key) return "";

  const parts = key.split("-");
  if (parts.length !== 2) return key;

  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;

  if (isNaN(year) || isNaN(month)) return key;

  return new Date(year, month).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function getRecentStrongWeakSubject(records: TestRecord[]) {
  if (records.length === 0) {
    return { strong: "-", weak: "-" };
  }

  // take last 3 tests (by date)
  const recent = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const subjectMap: Record<
    string,
    { totalIndex: number; count: number }
  > = {};

  recent.forEach((r) => {
    const subject = r.subject || "Unknown";

    const timeTaken = r.duration - r.timeLeft;
    const timeRatio = timeTaken / r.duration; // 0–1
    const timePenalty = timeRatio * 20; // max 20 marks penalty

    const performanceIndex = r.percentage - timePenalty;

    if (!subjectMap[subject]) {
      subjectMap[subject] = { totalIndex: 0, count: 0 };
    }

    subjectMap[subject].totalIndex += performanceIndex;
    subjectMap[subject].count += 1;
  });

  const ranked = Object.entries(subjectMap)
    .map(([subject, v]) => ({
      subject,
      avgIndex: v.totalIndex / v.count,
    }))
    .sort((a, b) => b.avgIndex - a.avgIndex);

  return {
    strong: ranked[0]?.subject || "-",
    weak: ranked[ranked.length - 1]?.subject || "-",
  };
}
