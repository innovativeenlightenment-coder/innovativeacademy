"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type RecordType = {
  _id: string;
  correct: number;
  incorrect: number;
  unanswered: { id: string; ans: string; selected: string }[];
  Answers: { id: string; ans: string; selected: string }[];
  score: number;
  percentage: number;
  username: string;
  email: string;
  name: string;
  date: string;
  course: string;
  subject: string;
  chapter: string;
};


export default function ScoreTrendChart({ records }: any) {
  if (!records?.length) return null;

// Score Trend
const data: { test: number; score: number }[] = records.map((r: RecordType, i: number) => ({
  test: i + 1,
  score: r.score,
}));


  return (
    <div className="bg-white border shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">📊 Score Trend</h2>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="test" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
