"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

type AnswerType = { id: string; ans: string; selected: string };

type TestRecord = {
  _id: string;
  email: string;
  date: string;
  correct: number;
  incorrect: number;
  unanswered: AnswerType[];
  subject: string;
  percentage: number;
};

export default function StudentDashboard() {
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/test-records")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecords(data.records || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  if (records.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No Tests Yet</h2>
        <p className="text-gray-500">Attempt your first test to see progress.</p>
      </div>
    );
  }

  /* ================= QUICK STATS ================= */

  const totalTests = records.length;

  const totalCorrect = records.reduce((a, b) => a + b.correct, 0);
  const totalIncorrect = records.reduce((a, b) => a + b.incorrect, 0);
  const totalUnanswered = records.reduce(
    (a, b) => a + (b.unanswered?.length || 0),
    0
  );

  const accuracy = (
    (totalCorrect / (totalCorrect + totalIncorrect)) *
    100
  ).toFixed(1);

  /* ================= SUBJECT WISE ================= */

  const subjectMap = new Map<string, number>();
  records.forEach((r) => {
    const s = r.subject || "Mixed";
    subjectMap.set(s, (subjectMap.get(s) || 0) + 1);
  });

  const subjectData = Array.from(subjectMap.entries()).map(
    ([subject, count]) => ({ subject, tests: count })
  );

  /* ================= PIE ================= */

  const pieData = [
    { name: "Correct", value: totalCorrect },
    { name: "Incorrect", value: totalIncorrect },
    { name: "Unanswered", value: totalUnanswered },
  ];

  const pieColors = ["#16a34a", "#ef4444", "#9ca3af"];

  /* ================= LAST 5 TESTS ================= */

  const recentTrend = [...records]
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    .slice(-5)
    .map((r, i) => ({
      test: `T${i + 1}`,
      percentage: r.percentage,
    }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Dashboard</h1>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tests" value={totalTests} />
        <StatCard label="Accuracy" value={`${accuracy}%`} />
        <StatCard label="Correct Answers" value={totalCorrect} />
        <StatCard label="Unanswered" value={totalUnanswered} />
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accuracy Pie */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Overall Accuracy</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Tests */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Tests per Subject</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectData}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tests" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Performance */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Recent Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={recentTrend}>
              <XAxis dataKey="test" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="percentage"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= QUICK MESSAGE ================= */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <p className="font-medium text-blue-800">
          📌 Tip: Improve accuracy by reducing unanswered questions.
        </p>
        <p className="text-sm text-blue-700">
          Detailed analysis is available inside Test Records.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
