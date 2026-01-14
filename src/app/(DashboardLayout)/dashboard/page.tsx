
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/app/(DashboardLayout)/dashboard/components/container/PageContainer";
import Loading from "./loading";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TestRecord = {
  _id: string;
  score: number;
  percentage: number;
  date: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/test-records");
        const data = await res.json();
        if (data.success) {
          setRecords(data.records || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  /* ===== QUICK STATS ===== */
  const totalTests = records.length;
  const avgPercent = totalTests
    ? (records.reduce((a, b) => a + b.percentage, 0) / totalTests).toFixed(1)
    : "0";
  const bestPercent = totalTests
    ? Math.max(...records.map((r) => r.percentage))
    : 0;

  /* ===== SIMPLE TREND ===== */
  const trendData = records
    .slice(-6)
    .map((r, i) => ({
      test: `T${i + 1}`,
      percentage: r.percentage,
    }));

  return (
    <PageContainer title="Dashboard" description="Student Dashboard">
      <div className="p-6 space-y-8">

        {/* 🔥 EARLY BIRD OFFER */}
        <div className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold">🎉 Early Bird Offer</h2>
          <p className="mt-2 text-lg">
            First <b>100 Students</b> get <b>FREE ACCESS</b> 🎁  
            <br />After that: <span className="font-bold">₹1000 / year</span>
          </p>
          <p className="mt-1 text-sm opacity-90">
            Limited time • Lifetime foundation advantage
          </p>
        </div>

        {/* 📊 QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Tests Taken" value={totalTests} color="blue" />
          <StatCard title="Avg %" value={`${avgPercent}%`} color="green" />
          <StatCard title="Best %" value={`${bestPercent}%`} color="purple" />
        </div>

        {/* 📈 PERFORMANCE TREND (LIGHT) */}
        {records.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-3">📈 Recent Performance</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="test" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 🌟 FEATURES */}
        <div>
          <h3 className="text-xl font-bold mb-4">Why Innovative Academy?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              title="🤖 AI Doubt Solving"
              desc="Instant concept-based answers powered by AI"
            />
            <FeatureCard
              title="👨‍🏫 1-to-1 Expert Doubts"
              desc="Personal doubt support from experienced faculties"
            />
            <FeatureCard
              title="📚 Smart Notes"
              desc="Short, exam-focused notes with clarity"
            />
            <FeatureCard
              title="🔴 Live Doubt Sessions"
              desc="Real-time doubt solving with teachers"
            />
            <FeatureCard
              title="📝 Monthly / Quarterly Tests"
              desc="Exam-pattern tests to track real progress"
            />
            <FeatureCard
              title="🚀 More Coming Soon"
              desc="Advanced analytics, rank prediction & more"
            />
          </div>
        </div>

        {/* 🚀 COMING SOON */}
        <div className="bg-gray-900 text-white rounded-xl p-6">
          <h3 className="text-xl font-bold">🚀 Coming Soon</h3>
          <ul className="mt-3 space-y-1 text-sm text-gray-300">
            <li>• Personalized learning path</li>
            <li>• AI performance advisor</li>
            <li>• National-level rankings</li>
            <li>• Mentor-based guidance</li>
          </ul>
        </div>

      </div>
    </PageContainer>
  );
}

/* ===== COMPONENTS ===== */

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: "blue" | "green" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className={`p-4 rounded-xl shadow ${colors[color]}`}>
      <div className="text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      className="
        rounded-xl p-4 shadow
        bg-gradient-to-br from-green-200 to-white
        border border-gray-100
        hover:shadow-md hover:-translate-y-[2px]
        transition-all
      "
    >
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </div>
  );
}
