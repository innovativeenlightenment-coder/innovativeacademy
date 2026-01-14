"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
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
  testType:string;
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
  const [loading, setLoading] = useState(false);

  const lineRef = useRef<HTMLDivElement | null>(null);
  const pieRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const subjectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      setLoading(true);
      const res = await fetch("/api/test-records");
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = records.filter((r) => {
    if (!search) return true;
    const key = `${r.name} ${r.username} ${r.email} ${r.course} ${r.subject} ${r.chapter}`;
    return key.toLowerCase().includes(search.toLowerCase());
  });

  // Stats
  const totalTests = records.length;
  const avgScore = totalTests
    ? records.reduce((a, b) => a + b.score, 0) / totalTests
    : 0;
  const avgPercent = totalTests
    ? records.reduce((a, b) => a + b.percentage, 0) / totalTests
    : 0;
  const bestScore = totalTests
    ? Math.max(...records.map((r) => r.score))
    : 0;

  // Trend
  const trendData = [...records]
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .map((r, i) => ({
      test: `T${i + 1}`,
      percentage: r.percentage,
      score: r.score,
    }));

  // Pie
  const pieData = [
    { name: "Correct", value: records.reduce((a, b) => a + b.correct, 0) },
    { name: "Incorrect", value: records.reduce((a, b) => a + b.incorrect, 0) },
    { name: "Unanswered", value: records.reduce((a, b) => a + (b.unanswered?.length || 0), 0) },
  ];
  const pieColors = ["#16a34a", "#ef4444", "#6b7280"];

  // Score Distribution
  const rangeData = [
    { range: "0-20", count: records.filter((r) => r.percentage <= 20).length },
    { range: "21-40", count: records.filter((r) => r.percentage > 20 && r.percentage <= 40).length },
    { range: "41-60", count: records.filter((r) => r.percentage > 40 && r.percentage <= 60).length },
    { range: "61-80", count: records.filter((r) => r.percentage > 60 && r.percentage <= 80).length },
    { range: "81-100", count: records.filter((r) => r.percentage > 80).length },
  ];

  // Subject-wise average
  const subjectMap = new Map<string, { total: number; count: number }>();
  records.forEach((r) => {
    const s = r.subject || "Unknown";
    if (!subjectMap.has(s)) subjectMap.set(s, { total: 0, count: 0 });
    const v = subjectMap.get(s)!;
    v.total += r.score;
    v.count += 1;
  });

  const subjectData = Array.from(subjectMap.entries()).map(
    ([subject, val]) => ({
      subject,
      avgScore: Number((val.total / val.count).toFixed(1)),
    })
  );

  if (records.length === 0 && !loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No Test Records Found</h2>
        <p className="text-gray-600">You have not taken any test yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test Performance Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Total Tests" value={totalTests} />
        <Card label="Average Score" value={avgScore.toFixed(1)} />
        <Card label="Average %" value={`${avgPercent.toFixed(1)}%`} />
        <Card label="Best Score" value={bestScore} />
      </div>

      {/* Charts */}
      <div className="bg-white p-4 rounded shadow" ref={lineRef}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <XAxis dataKey="test" />
            <YAxis />
            <Tooltip />
            <Line dataKey="percentage" stroke="#2563eb" strokeWidth={3} />
            <Line dataKey="score" stroke="#f59e0b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div ref={pieRef} className="bg-white p-4 rounded shadow">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div ref={barRef} className="bg-white p-4 rounded shadow">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rangeData}>
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div ref={subjectRef} className="bg-white p-4 rounded shadow">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subjectData}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Chapter</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-left">%</th>
            </tr>
          </thead>
          <tbody>
            {filtered.filter((record) => record.testType === "practice").map((r) => (
              <tr key={r._id} className="border-b">
                <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
                <td className="p-2">{r.course}</td>
                <td className="p-2">{r.subject === "-" ? "All Subjects" : r.subject}</td>
                <td className="p-2">{r.chapter === "-" ? "All Chapters" : r.chapter}</td>
                <td className="p-2">{r.score}</td>
                <td className="p-2">{r.percentage}%</td>
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
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
