"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Summary = {
  success: boolean;
  role: string;
  user?: { name?: string; courses?: string[] };
  teacher?: {
    assignedCourses: string[];
    assignedCourseCount: number;
    studentCount: number;
    practiceAttempts: number;
    examPapers: number;
    recentRecords: { _id: string; percentage: number; date: string | null; subject: string; chapter: string; course: string; testType: string }[];
  };
  error?: string;
};

function Metric({ label, value, detail, color }: { label: string; value: string | number; detail: string; color: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className={`h-2.5 w-2.5 rounded-full ${color}`} /></div><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

const actions = [
  {
    href: "/dashboard/admin/manage-questionBank",
    icon: "🧠",
    title: "Manage Questions",
    description:
      "Organize questions and manage the question bank for assessments and practice.",
  },
  {
    href: "/dashboard/admin/attendance",
    icon: "📅",
    title: "Study Calendar",
    description:
      "Manage homework, attendance, learning tasks, and the complete daily study flow.",
  },
  {
    href: "/dashboard/admin/student-performance",
    icon: "📈",
    title: "Student Performance",
    description:
      "Track student progress, analyze assessment results, and identify learning gaps.",
  },
  {
    href: "/dashboard/admin/manage-learning-videos",
    icon: "🎥",
    title: "Learning Videos",
    description:
      "Manage daily lecture videos and help students revise concepts after class.",
  },
];



export default function TeacherDashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard-summary", { cache: "no-store" })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.error || "Could not load dashboard.");
        if (json.role !== "teacher") throw new Error("This dashboard is for teacher accounts.");
        if (active) setData(json);
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">Loading teacher workspace…</div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;

  const summary = data?.teacher;


  return <div className="space-y-6">
<header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-violet-950 to-violet-800 p-6 text-white shadow-lg sm:p-8">
  <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />

  <div className="relative">
    <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet-200">
      Innovative Academy · Teacher Portal
    </p>

    <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
      Welcome{data?.user?.name ? `, ${data.user.name}` : ""}.
    </h1>

    <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">
      Your teaching workspace, all in one place. Manage questions, organize
      the complete study flow, monitor student performance, and provide daily
      learning lectures.
    </p>

    <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium sm:text-sm">
      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
        🧠 Question Bank
      </span>
      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
        📅 Study Calendar
      </span>
      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
        📈 Student Progress
      </span>
      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
        🎥 Daily Lectures
      </span>
    </div>
  </div>
</header>

{/* Teacher overview */}
<section>
  <div className="mb-4">
    <h2 className="text-lg font-bold text-slate-900">
      Teaching Overview
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      A snapshot of your assigned courses, students, and assessments.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <Metric
      label="Assigned Courses"
      value={summary?.assignedCourseCount ?? 0}
      detail="Courses linked to your account"
      color="bg-violet-500"
    />
    <Metric
      label="Students"
      value={summary?.studentCount ?? 0}
      detail="Students in your assigned courses"
      color="bg-blue-500"
    />
    <Metric
      label="Practice Attempts"
      value={summary?.practiceAttempts ?? 0}
      detail="Recorded practice activity"
      color="bg-emerald-500"
    />
    <Metric
      label="Exam Papers"
      value={summary?.examPapers ?? 0}
      detail="Teacher exam papers"
      color="bg-amber-500"
    />
  </div>
</section>

{/* Main teacher tools */}
<section>
  <div className="mb-4">
    <h2 className="text-lg font-bold text-slate-900">
      Your Teaching Workspace
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      Everything you need to manage teaching and student learning.
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    {actions.map((action) => (
      <Link
        key={action.href}
        href={action.href}
        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <div className="flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
            {action.icon}
          </span>
          <span className="text-lg text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-violet-600">
            ↗
          </span>
        </div>

        <h3 className="mt-4 font-bold text-slate-900">
          {action.title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {action.description}
        </p>
      </Link>
    ))}
  </div>
</section>

{/* Assigned courses */}
<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <div className="flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl">
      📚
    </span>
    <div>
      <h2 className="font-bold text-slate-900">Assigned Courses</h2>
      <p className="mt-1 text-sm text-slate-500">
        The courses associated with your teacher account.
      </p>
    </div>
  </div>

  {summary?.assignedCourses?.length ? (
    <div className="mt-4 flex flex-wrap gap-2">
      {summary.assignedCourses.map((course) => (
        <span
          key={course}
          className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-800"
        >
          {course}
        </span>
      ))}
    </div>
  ) : (
    <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
      No courses are assigned to this teacher account yet. Add course names
      to the user's `courses` array to populate this section.
    </p>
  )}
</section>

{/* Recent assessment activity */}
<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <div className="flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl">
      📊
    </span>
    <div>
      <h2 className="font-bold text-slate-900">
        Recent Assessment Activity
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Review recorded results from your assigned courses.
      </p>
    </div>
  </div>

  {summary?.recentRecords?.length ? (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-3 pr-3">Date</th>
            <th className="py-3 pr-3">Course</th>
            <th className="py-3 pr-3">Subject / Chapter</th>
            <th className="py-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {summary.recentRecords.map((record) => (
            <tr key={record._id} className="border-b border-slate-50 last:border-0">
              <td className="py-3 pr-3 text-slate-600">
                {record.date
                  ? new Date(record.date).toLocaleDateString()
                  : "—"}
              </td>
              <td className="py-3 pr-3 font-medium text-slate-800">
                {record.course || "—"}
              </td>
              <td className="py-3 pr-3 text-slate-600">
                {[record.subject, record.chapter]
                  .filter(Boolean)
                  .join(" · ") ||
                  record.testType ||
                  "Assessment"}
              </td>
              <td className="py-3 text-right font-bold text-slate-900">
                {record.percentage}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
      No assessment attempts are recorded for your assigned courses yet.
    </p>
  )}
</section>

  </div>;
}
