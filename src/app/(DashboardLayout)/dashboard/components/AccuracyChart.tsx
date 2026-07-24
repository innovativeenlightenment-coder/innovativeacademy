"use client";

import {
  BarChart,
  Bar,
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


export default function AccuracyChart({ records }: any) {
  if (!records?.length) return null;

// Correct vs Incorrect
const data: { test: number; correct: number; incorrect: number }[] =
  records.map((r: RecordType, i: number) => ({
    test: i + 1,
    correct: r.correct,
    incorrect: r.incorrect,
  }));

  return (
    <div className="bg-white border shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">🎯 Correct vs Incorrect</h2>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="test" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="correct" fill="#10b981" />
            <Bar dataKey="incorrect" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
