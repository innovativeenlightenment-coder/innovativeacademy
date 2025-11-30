"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TestImprovementChart({ records }: any) {
  if (!records?.length) return null;
  
const data: { test: number; percentage: number; date: string }[] = [...records]
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((r, i) => ({
    test: i + 1,
    percentage: r.percentage,
    date: new Date(r.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
  }));

  return (
    <div className="bg-white border shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">📈 Test-to-Test Improvement</h2>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="test" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
