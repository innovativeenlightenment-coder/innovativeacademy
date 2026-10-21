"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminSummary = {
  success: boolean;
  role: string;
  user?: { name?: string };
  admin?: {
    totalStudents: number;
    totalTeachers: number;
    totalSchools: number;
    totalColleges: number;
    totalQuestionBankQuestions: number;
    totalPracticeAttempts: number;
    totalExamPapers: number;
    totalExamRecords: number;
  };
  error?: string;
};

function Metric({ label, value, detail, icon }: { label: string; value: number | string; detail: string; icon: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-500">{label}</p><span className="text-xl">{icon}</span></div><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}

const sections = [
  { href: "/dashboard/admin/manage-users", icon: "👥", title: "Users and roles", description: "Manage student, teacher, school and college accounts." },
  { href: "/dashboard/admin/manage-subjectWithChapter", icon: "📚", title: "Courses and classes", description: "Organize course names and academic assignments." },
  { href: "/dashboard/admin/manage-questionBank", icon: "🧠", title: "Question bank", description: "Manage question content used by assessments." },
 {
  href: "/dashboard/admin/student-performance",
  icon: "📈",
  title: "Student Performance",
  description: "Analyze assessment results, scores, and student progress."
},
];

export default function AdminDashboard() {
  const [data, setData] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard-summary", { cache: "no-store" })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.error || "Could not load dashboard.");
        if (json.role !== "admin") throw new Error("This dashboard is for admin accounts.");
        if (active) setData(json);
      })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Could not load dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">Loading administration dashboard…</div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;

  const stats = data?.admin;

  return <div className="space-y-6">
    <header className="rounded-3xl bg-gradient-to-r from-violet-950 via-violet-800 to-fuchsia-800 p-6 text-white shadow-lg sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet-200">Administration</p>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Welcome{data?.user?.name ? `, ${data.user.name}` : ""}.</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">Monitor academy activity and manage the people and learning resources behind it.</p>
    </header>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Students" value={stats?.totalStudents ?? 0} detail="Student accounts" icon="🎓" />
      <Metric label="Teachers" value={stats?.totalTeachers ?? 0} detail="Teacher accounts" icon="👩‍🏫" />
      <Metric label="Question bank" value={stats?.totalQuestionBankQuestions ?? 0} detail="Saved questions" icon="🧠" />
      <Metric label="Practice attempts" value={stats?.totalPracticeAttempts ?? 0} detail="Recorded test attempts" icon="📝" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Schools" value={stats?.totalSchools ?? 0} detail="School accounts" icon="🏫" />
      <Metric label="Colleges" value={stats?.totalColleges ?? 0} detail="College accounts" icon="🏢" />
      <Metric label="Exam papers" value={stats?.totalExamPapers ?? 0} detail="Teacher-created exam papers" icon="📄" />
      <Metric label="Exam records" value={stats?.totalExamRecords ?? 0} detail="Saved exam submissions" icon="📈" />
    </div>

    <section>
      <div className="mb-4"><h2 className="text-lg font-bold text-slate-900">Management shortcuts</h2><p className="mt-1 text-sm text-slate-500">Go directly to the main admin workflows.</p></div>
      <div className="grid gap-4 md:grid-cols-2">{sections.map((item) => <Link key={item.href} href={item.href} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-2xl">{item.icon}</span><span className="flex-1"><b className="block text-slate-900">{item.title}</b><span className="mt-1 block text-sm leading-5 text-slate-600">{item.description}</span><span className="mt-3 inline-flex text-sm font-semibold text-violet-700">Open section →</span></span></Link>)}</div>
    </section>
  </div>;
}
