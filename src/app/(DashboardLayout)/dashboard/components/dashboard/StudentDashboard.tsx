"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type TestRecord = {
  _id: string;
  score: number;
  percentage: number;
  date: string | null;
  subject?: string;
  chapter?: string;
  course?: string;
  testType?: string;
};

type DashboardData = {
  success: boolean;
  role: string;
  user?: { name?: string; courses?: string[] };
  student?: {
    totalTests: number;
    averagePercentage: number;
    bestPercentage: number;
    records: TestRecord[];
  };
  error?: string;
};

function Stat({ label, value, hint, color }: { label: string; value: string | number; hint: string; color: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`h-2.5 w-2.5 rounded-full ${color}`} /></div>
    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
  </div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-base font-bold text-slate-900">{title}</h2>{children}</section>;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard-summary", { cache: "no-store" })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.error || "Could not load dashboard.");
        if (json.role !== "student") throw new Error("This dashboard is for student accounts.");
        if (active) setData(json);
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const records = data?.student?.records || [];
  const chart = useMemo(() => [...records].reverse().slice(-8).map((record, index) => ({
    test: `Test ${index + 1}`,
    percentage: Number(record.percentage) || 0,
  })), [records]);

  if (loading) return <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">Loading your dashboard…</div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;

  const stats = data?.student;

  return <div className="space-y-6">
    <header className="rounded-3xl bg-gradient-to-r from-violet-800 via-violet-700 to-indigo-700 p-6 text-white shadow-lg sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet-200">Student workspace</p>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Welcome{data?.user?.name ? `, ${data.user.name}` : ""}.</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">Learn, practise, and use your results to decide what to revise next.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/dashboard/student/start-practice-test" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-800 hover:bg-violet-50">Start a test →</Link>
        <Link href="/dashboard/student/test-record" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">View test records</Link>
      </div>
    </header>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Stat label="Tests taken" value={stats?.totalTests ?? 0} hint="Up to 100 most recent recorded attempts" color="bg-blue-500" />
      <Stat label="Average score" value={`${stats?.averagePercentage ?? 0}%`} hint="Across loaded attempts" color="bg-emerald-500" />
      <Stat label="Best score" value={`${stats?.bestPercentage ?? 0}%`} hint="Highest recorded percentage" color="bg-amber-500" />
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Panel title="Recent performance">
        {records.length ? <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="test" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
            <Line type="monotone" dataKey="percentage" stroke="#6d28d9" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer></div> : <div className="flex min-h-52 flex-col items-center justify-center text-center">
          <span className="text-3xl">📈</span><p className="mt-3 font-semibold text-slate-800">No test results yet</p><p className="mt-1 text-sm text-slate-500">Your chart appears after your first recorded test.</p>
        </div>}
      </Panel>
      <Panel title="Quick actions">
        <div className="space-y-3">
          <Link href="/dashboard/student/start-practice-test" className="block rounded-xl border border-slate-200 p-4 hover:border-violet-300 hover:bg-violet-50"><b className="text-slate-900">📝 Practice and test</b><p className="mt-1 text-sm text-slate-500">Attempt an available assessment.</p></Link>
          <Link href="/dashboard/student/test-record" className="block rounded-xl border border-slate-200 p-4 hover:border-violet-300 hover:bg-violet-50"><b className="text-slate-900">📊 Test records</b><p className="mt-1 text-sm text-slate-500">Review your previous results.</p></Link>
        
<Link href="/dashboard/student/study-calendar" className="block rounded-xl border border-slate-200 p-4 hover:border-violet-300 hover:bg-violet-50"><b className="text-slate-900">📅 Study Calendar</b><p className="mt-1 text-sm text-slate-500">Track your study plan, homework, attendance, and daily learning progress in one place.</p></Link>

        </div>
      </Panel>
    </div>

    <Panel title="Recent attempts">
      {records.length ? <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm">
        <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500"><th className="py-3 pr-3">Date</th><th className="py-3 pr-3">Course / subject</th><th className="py-3 pr-3">Type</th><th className="py-3 text-right">Score</th></tr></thead>
        <tbody>{records.slice(0, 5).map((record) => <tr key={record._id} className="border-b border-slate-50"><td className="py-3 pr-3 text-slate-600">{record.date ? new Date(record.date).toLocaleDateString() : "—"}</td><td className="py-3 pr-3 font-medium text-slate-800">{[record.course, record.subject, record.chapter].filter(Boolean).join(" · ") || "Assessment"}</td><td className="py-3 pr-3 text-slate-600">{record.testType || "Test"}</td><td className="py-3 text-right font-bold text-slate-900">{record.percentage}%</td></tr>)}</tbody>
      </table></div> : <p className="text-sm text-slate-500">No attempts to display yet.</p>}
    </Panel>
  </div>;
}
