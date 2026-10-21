"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Student = { id: string; name: string; username: string; email: string; avatar: string };
type AttendanceStatus = "present" | "absent" | "late" | "leave";
type Entry = { studentId: string; status: AttendanceStatus; note: string };
type TaskStatus = {
  studentId: string; studentName: string; studentStatus: "pending" | "submitted";
  studentNote: string; teacherStatus: "pending" | "verified" | "needs_revision"; teacherNote: string;
};
type Task = {
  id: string; course: string; title: string; description: string; taskType: string;
  assignedDate: string; dueDate: string; studentStatuses: TaskStatus[];
};
type ExamStatus = "unmarked" | "present" | "absent";
type ExamEntry = { studentId: string; status: ExamStatus; note?: string };
type ExamRecord = { id: string; course: string; title: string; examDate: string; examType: "online_mcq" | "offline_theory"; instructions: string; entries: ExamEntry[] };
type Tab = "overview" | "attendance" | "tasks" | "exam";

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const prettyDate = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
const statusLabel: Record<AttendanceStatus, string> = { present: "Present", absent: "Absent", late: "Late", leave: "Leave" };

export default function TeacherAttendanceCalendarPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [courses, setCourses] = useState<string[]>([]);
  const [course, setCourse] = useState("");
  const [dateKey, setDateKey] = useState(todayKey());
  const [students, setStudents] = useState<Student[]>([]);
  const [entries, setEntries] = useState<Record<string, AttendanceStatus>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskType, setTaskType] = useState("homework");
  const [assignedDate, setAssignedDate] = useState(todayKey());
  const [dueDate, setDueDate] = useState(todayKey());
  const [taskSaving, setTaskSaving] = useState(false);
  const [reviewing, setReviewing] = useState("");
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examEntries, setExamEntries] = useState<Record<string, ExamStatus>>({});
  const [showExamForm, setShowExamForm] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState(todayKey());
  const [examType, setExamType] = useState<"online_mcq" | "offline_theory">("online_mcq");
  const [examInstructions, setExamInstructions] = useState("");
  const [examSaving, setExamSaving] = useState(false);

  const loadAttendance = useCallback(async (selectedCourse: string, selectedDate: string) => {
    if (!selectedCourse) { setStudents([]); setEntries({}); return; }
    const response = await fetch(`/api/attendance?course=${encodeURIComponent(selectedCourse)}&date=${encodeURIComponent(selectedDate)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Unable to load attendance.");
    setCourses(Array.isArray(result.courses) ? result.courses : []);
    const loadedStudents: Student[] = result.students || [];
    setStudents(loadedStudents);
    const saved: Record<string, AttendanceStatus> = {};
    for (const entry of result.attendance?.entries || []) saved[entry.studentId] = entry.status;
    for (const student of loadedStudents) if (!saved[student.id]) saved[student.id] = "present";
    setEntries(saved);
  }, []);

  const loadExams = useCallback(async (selectedCourse: string) => {
    if (!selectedCourse) { setExams([]); setSelectedExamId(""); setExamEntries({}); return; }
    const response = await fetch(`/api/exam-attendance?course=${encodeURIComponent(selectedCourse)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Unable to load exams.");
    const loaded: ExamRecord[] = result.exams || [];
    setCourses(Array.isArray(result.courses) ? result.courses : []);
    setExams(loaded);
    setSelectedExamId((current) => loaded.some((exam) => exam.id === current) ? current : loaded[0]?.id || "");
    const selected = loaded.find((exam) => exam.id === selectedExamId) || loaded[0];
    const statusMap: Record<string, ExamStatus> = {};
    for (const entry of selected?.entries || []) statusMap[entry.studentId] = entry.status;
    setExamEntries(statusMap);
  }, [selectedExamId]);

  const loadTasks = useCallback(async (selectedCourse: string) => {
    if (!selectedCourse) { setTasks([]); return; }
    const response = await fetch(`/api/tasks?course=${encodeURIComponent(selectedCourse)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "Unable to load tasks.");
    setCourses(Array.isArray(result.courses) ? result.courses : []);
    setTasks(result.tasks || []);
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      setLoading(true); setError("");
      try {
        const response = await fetch("/api/attendance", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || "Unable to load classes.");
        const available = Array.isArray(result.courses) ? result.courses : [];
        if (!active) return;
        setCourses(available);
        setCourse((current) => current && available.includes(current) ? current : available[0] || "");
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Unable to load classes.");
      } finally { if (active) setLoading(false); }
    }
    init();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!course) return;
    let active = true;
    async function refresh() {
      setLoading(true); setError("");
      try { await Promise.all([loadAttendance(course, dateKey), loadTasks(course), loadExams(course)]); }
      catch (e) { if (active) setError(e instanceof Error ? e.message : "Unable to load class data."); }
      finally { if (active) setLoading(false); }
    }
    refresh();
    return () => { active = false; };
  }, [course, dateKey, loadAttendance, loadTasks, loadExams]);

  const counts = useMemo(() => {
    const values = Object.values(entries);
    return {
      total: students.length,
      present: values.filter((s) => s === "present").length,
      absent: values.filter((s) => s === "absent").length,
      late: values.filter((s) => s === "late").length,
      leave: values.filter((s) => s === "leave").length,
    };
  }, [entries, students.length]);

  const updateEntry = (id: string, status: AttendanceStatus) => setEntries((old) => ({ ...old, [id]: status }));

  async function saveAttendance() {
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, dateKey, entries: students.map((s) => ({ studentId: s.id, status: entries[s.id] || "present", note: "" })) }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to save attendance.");
      setNotice(`Attendance saved for ${prettyDate(dateKey)}.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save attendance."); }
    finally { setSaving(false); }
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault(); setTaskSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/tasks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, title: taskTitle, description: taskDescription, taskType, assignedDate, dueDate }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to create task.");
      setShowTaskModal(false); setTaskTitle(""); setTaskDescription(""); setTaskType("homework");
      await loadTasks(course); setNotice("Task assigned to students.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to create task."); }
    finally { setTaskSaving(false); }
  }

  async function createExam(e: React.FormEvent) {
    e.preventDefault(); setExamSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/exam-attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course, title: examTitle, examDate, examType, instructions: examInstructions }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to create exam.");
      setShowExamForm(false); setExamTitle(""); setExamInstructions("");
      await loadExams(course); setSelectedExamId(result.exam.id);
      const initial: Record<string, ExamStatus> = {};
      for (const entry of result.exam.entries || []) initial[entry.studentId] = entry.status;
      setExamEntries(initial); setNotice("Exam created. Mark attendance and save it when ready.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to create exam."); }
    finally { setExamSaving(false); }
  }

  function selectExam(examId: string) {
    setSelectedExamId(examId);
    const exam = exams.find((item) => item.id === examId);
    const statusMap: Record<string, ExamStatus> = {};
    for (const entry of exam?.entries || []) statusMap[entry.studentId] = entry.status;
    setExamEntries(statusMap);
  }

  async function saveExamAttendance() {
    const exam = exams.find((item) => item.id === selectedExamId);
    if (!exam) return;
    setExamSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/exam-attendance", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam.id, entries: students.map((student) => ({ studentId: student.id, status: examEntries[student.id] || "unmarked", note: "" })) }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to save exam attendance.");
      await loadExams(course);
      setSelectedExamId(exam.id);
      setExamEntries(Object.fromEntries(students.map((student) => [student.id, examEntries[student.id] || "unmarked"])) as Record<string, ExamStatus>);
      setNotice(`Exam attendance saved for ${exam.title}.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save exam attendance."); }
    finally { setExamSaving(false); }
  }

  async function verifyTask(taskId: string, studentId: string, teacherStatus: string) {
    const key = `${taskId}-${studentId}`; setReviewing(key); setError(""); setNotice("");
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, studentId, teacherStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to update review.");
      await loadTasks(course); setNotice("Student task review updated.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update review."); }
    finally { setReviewing(""); }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" }, { id: "attendance", label: "Attendance" },
    { id: "tasks", label: "Homework & Tasks" }, { id: "exam", label: "Exam Attendance" },
  ];

  if (loading && courses.length === 0) return <div className="min-h-screen bg-slate-50 p-6 text-slate-600">Loading teacher workspace…</div>;

  return (
    <main className="min-h-screen bg-[#F7F7FB] px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-violet-800 to-violet-600 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-200">Teacher workspace</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Attendance & Study Calendar</h1>
            <p className="mt-1 text-sm text-violet-100">Track presence, assign learning tasks, and review student progress.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="text-xs text-violet-100">Class / course
              <select value={course} onChange={(e) => setCourse(e.target.value)} className="mt-1 block min-w-36 rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm font-semibold text-violet-950 outline-none" disabled={!courses.length}>
                {courses.length ? courses.map((c) => <option key={c} value={c}>{c}</option>) : <option value="">No classes assigned</option>}
              </select>
            </label>
            <label className="text-xs text-violet-100">Selected date
              <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} className="mt-1 block rounded-xl border border-white/20 bg-white px-3 py-2.5 text-sm font-semibold text-violet-950 outline-none" />
            </label>
          </div>
        </header>

        {(error || notice) && <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error || notice}</div>}

        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === item.id ? "bg-violet-700 text-white shadow-sm" : "text-slate-600 hover:bg-violet-50 hover:text-violet-800"}`}>{item.label}</button>)}
          <a href="/dashboard/admin/revisions" className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-800">Revision Activities</a>
        </nav>

        {loading && <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500">Updating class data…</div>}

        {tab === "overview" && <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Students in class", value: counts.total, hint: "Enrolled in selected course" },
              { label: "Present", value: counts.present, hint: "Marked for selected date" },
              { label: "Absent", value: counts.absent, hint: "Needs follow-up" },
              { label: "Active tasks", value: tasks.length, hint: "Homework and revision" },
            ].map((card) => <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><p className="text-xs font-medium text-slate-500 sm:text-sm">{card.label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p><p className="mt-1 text-xs text-slate-400">{card.hint}</p></div>)}
          </section>
          <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Attendance snapshot</h2><p className="mt-1 text-sm text-slate-500">{prettyDate(dateKey)}</p></div><button onClick={() => setTab("attendance")} className="text-sm font-semibold text-violet-700 hover:text-violet-900">Take attendance →</button></div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="flex h-full"><div style={{ width: `${counts.total ? counts.present / counts.total * 100 : 0}%` }} className="bg-emerald-500" /><div style={{ width: `${counts.total ? counts.absent / counts.total * 100 : 0}%` }} className="bg-rose-500" /><div style={{ width: `${counts.total ? counts.late / counts.total * 100 : 0}%` }} className="bg-amber-400" /><div style={{ width: `${counts.total ? counts.leave / counts.total * 100 : 0}%` }} className="bg-sky-500" /></div></div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{(["present", "absent", "late", "leave"] as AttendanceStatus[]).map((s) => <div key={s} className="flex items-center gap-2 text-sm text-slate-600"><span className={`h-2.5 w-2.5 rounded-full ${s === "present" ? "bg-emerald-500" : s === "absent" ? "bg-rose-500" : s === "late" ? "bg-amber-400" : "bg-sky-500"}`} />{statusLabel[s]} <b className="ml-auto text-slate-900">{counts[s]}</b></div>)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Upcoming deadlines</h2><p className="mt-1 text-sm text-slate-500">Tasks due soon</p></div><button onClick={() => setTab("tasks")} className="text-sm font-semibold text-violet-700">View all →</button></div>
              <div className="mt-4 space-y-3">{tasks.filter((t) => t.dueDate >= todayKey()).slice(0, 4).map((task) => <div key={task.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">▤</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{task.title}</p><p className="mt-1 text-xs text-slate-500">Due {prettyDate(task.dueDate)} · {task.taskType}</p></div></div>)}{!tasks.some((t) => t.dueDate >= todayKey()) && <p className="py-6 text-center text-sm text-slate-400">No upcoming tasks yet.</p>}</div>
            </div>
          </section>
        </>}

        {tab === "attendance" && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-bold text-slate-900">Daily attendance</h2><p className="mt-1 text-sm text-slate-500">{course || "Select a class"} · {prettyDate(dateKey)}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setEntries(Object.fromEntries(students.map((s) => [s.id, "present"])) as Record<string, AttendanceStatus>)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Mark all present</button><button disabled={saving || !students.length} onClick={saveAttendance} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50">{saving ? "Saving…" : "Save attendance"}</button></div></div>
          {!students.length ? <div className="p-10 text-center"><p className="font-semibold text-slate-700">No students found for this class</p><p className="mt-1 text-sm text-slate-500">Students need this exact class name in their User.courses array.</p></div> :
            <div className="divide-y divide-slate-100">{students.map((student, index) => <div key={student.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">{student.name.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{student.name}</p><p className="truncate text-xs text-slate-400">{student.username || student.email}</p></div><span className="ml-auto text-xs text-slate-400 sm:hidden">#{index + 1}</span></div><div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-50 p-1 sm:w-[340px]">{(["present", "absent", "late", "leave"] as AttendanceStatus[]).map((s) => <button key={s} onClick={() => updateEntry(student.id, s)} className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${entries[student.id] === s ? s === "present" ? "bg-emerald-600 text-white" : s === "absent" ? "bg-rose-600 text-white" : s === "late" ? "bg-amber-500 text-white" : "bg-sky-600 text-white" : "text-slate-500 hover:bg-white"}`}>{statusLabel[s]}</button>)}</div></div>)}</div>}
          {students.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-sm"><span className="text-slate-500">{counts.present} present · {counts.absent} absent · {counts.late} late · {counts.leave} leave</span><button disabled={saving} onClick={saveAttendance} className="rounded-xl bg-violet-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save attendance"}</button></div>}
        </section>}

        {tab === "tasks" && <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-bold text-slate-900">Homework & learning tasks</h2><p className="mt-1 text-sm text-slate-500">Assign work and separately verify student submissions.</p></div><button onClick={() => { setAssignedDate(dateKey); setDueDate(dateKey); setShowTaskModal(true); }} disabled={!course} className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50">＋ Create task</button></div>
          {tasks.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><div className="text-3xl">▤</div><h3 className="mt-3 font-semibold text-slate-800">No tasks assigned</h3><p className="mt-1 text-sm text-slate-500">Create homework, revision or project tasks for this class.</p></div> :
            tasks.map((task) => <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold capitalize text-violet-700">{task.taskType}</span><span className="text-xs text-slate-400">Due {prettyDate(task.dueDate)}</span></div><h3 className="mt-2 font-bold text-slate-900">{task.title}</h3>{task.description && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{task.description}</p>}</div><div className="shrink-0 text-sm text-slate-500">{task.studentStatuses.filter((s) => s.teacherStatus === "verified").length}/{task.studentStatuses.length} verified</div></div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2.5 font-semibold">Student</th><th className="px-3 py-2.5 font-semibold">Student report</th><th className="px-3 py-2.5 font-semibold">Teacher review</th><th className="px-3 py-2.5 font-semibold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{task.studentStatuses.map((s) => <tr key={s.studentId}><td className="px-3 py-3 font-medium text-slate-800">{s.studentName}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${s.studentStatus === "submitted" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{s.studentStatus === "submitted" ? "Submitted" : "Pending"}</span>{s.studentNote && <p className="mt-1 max-w-48 truncate text-xs text-slate-400">{s.studentNote}</p>}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${s.teacherStatus === "verified" ? "bg-emerald-50 text-emerald-700" : s.teacherStatus === "needs_revision" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{s.teacherStatus === "needs_revision" ? "Needs revision" : s.teacherStatus === "verified" ? "Verified" : "Not reviewed"}</span></td><td className="px-3 py-3"><div className="flex gap-1.5"><button disabled={reviewing === `${task.id}-${s.studentId}`} onClick={() => verifyTask(task.id, s.studentId, "verified")} className="rounded-lg border border-emerald-200 px-2 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">Verify</button><button disabled={reviewing === `${task.id}-${s.studentId}`} onClick={() => verifyTask(task.id, s.studentId, "needs_revision")} className="rounded-lg border border-amber-200 px-2 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50">Revise</button></div></td></tr>)}</tbody></table></div>
            </article>)}
        </section>}

        {tab === "exam" && <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-bold text-slate-900">Exam attendance</h2><p className="mt-1 text-sm text-slate-500">Create an exam record, then mark students present or absent.</p></div><button onClick={() => setShowExamForm(true)} disabled={!course} className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">+ Add exam</button></div>
          {!exams.length ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-xl text-violet-700">▦</div><h3 className="mt-3 font-bold text-slate-800">No exam records yet</h3><p className="mt-1 text-sm text-slate-500">Add an online MCQ or offline theory exam for {course || "this class"}.</p></div> : <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Select exam</label><select value={selectedExamId} onChange={(e) => selectExam(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-violet-500">{exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.title} · {prettyDate(exam.examDate)} · {exam.examType === "online_mcq" ? "Online MCQ" : "Offline Theory"}</option>)}</select>
              {exams.find((exam) => exam.id === selectedExamId) && <div className="mt-3 rounded-xl bg-violet-50 p-3"><p className="font-semibold text-violet-950">{exams.find((exam) => exam.id === selectedExamId)?.title}</p><p className="mt-1 text-xs text-violet-800">{prettyDate(exams.find((exam) => exam.id === selectedExamId)!.examDate)} · {exams.find((exam) => exam.id === selectedExamId)?.examType === "online_mcq" ? "Online MCQ" : "Offline Theory"}</p>{exams.find((exam) => exam.id === selectedExamId)?.instructions && <p className="mt-2 text-sm text-violet-900">{exams.find((exam) => exam.id === selectedExamId)?.instructions}</p>}</div>}
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h3 className="font-bold text-slate-900">Mark exam attendance</h3><p className="mt-1 text-sm text-slate-500">Unmarked students are not counted as present or absent.</p></div><div className="flex gap-2"><button onClick={() => setExamEntries(Object.fromEntries(students.map((student) => [student.id, "present"])) as Record<string, ExamStatus>)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Mark all present</button><button onClick={saveExamAttendance} disabled={examSaving || !students.length || !selectedExamId} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{examSaving ? "Saving…" : "Save attendance"}</button></div></div>
              {!students.length ? <div className="p-8 text-center text-sm text-slate-500">No students found for this class.</div> : <div className="divide-y divide-slate-100">{students.map((student, index) => <div key={student.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5"><div className="flex min-w-0 flex-1 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">{student.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{student.name}</p><p className="truncate text-xs text-slate-400">{student.username || student.email || `Student #${index + 1}`}</p></div></div><div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-50 p-1 sm:w-[300px]">{(["unmarked", "present", "absent"] as ExamStatus[]).map((status) => <button key={status} onClick={() => setExamEntries((old) => ({ ...old, [student.id]: status }))} className={`rounded-lg px-2 py-2 text-xs font-semibold ${examEntries[student.id] === status || (!examEntries[student.id] && status === "unmarked") ? status === "present" ? "bg-emerald-600 text-white" : status === "absent" ? "bg-rose-600 text-white" : "bg-slate-600 text-white" : "text-slate-500 hover:bg-white"}`}>{status === "unmarked" ? "Not Marked" : status === "present" ? "Present" : "Absent"}</button>)}</div></div>)}</div>}
            </div>
          </>}
        </section>}

        {showExamForm && <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 pb-4 pt-10 sm:pt-16" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowExamForm(false); }}><form onSubmit={createExam} className="my-auto w-full max-w-xl space-y-4 rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div><h2 className="text-lg font-bold text-slate-900">Create exam record</h2><p className="mt-1 text-sm text-slate-500">This creates an attendance record; it does not create or modify an online MCQ test.</p></div><label className="block text-sm font-medium text-slate-700">Exam name / topic<input required maxLength={120} value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="e.g. Algebra Chapter Test" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Exam date<input required type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500" /></label><label className="block text-sm font-medium text-slate-700">Exam type<select value={examType} onChange={(e) => setExamType(e.target.value as "online_mcq" | "offline_theory")} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500"><option value="online_mcq">Online MCQ</option><option value="offline_theory">Offline Theory</option></select></label></div><label className="block text-sm font-medium text-slate-700">Instructions / notes (optional)<textarea rows={3} maxLength={1000} value={examInstructions} onChange={(e) => setExamInstructions(e.target.value)} placeholder="Syllabus, total marks, or other information" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-500" /></label><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowExamForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button disabled={examSaving} className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{examSaving ? "Creating…" : "Create exam"}</button></div></form></div>}
      </div>

      {showTaskModal && <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 px-3 pb-4 pt-20 sm:pt-24" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowTaskModal(false); }}>
        <form onSubmit={createTask} className="flex max-h-[calc(100dvh-104px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5"><div><h2 className="font-bold text-slate-900">Create learning task</h2><p className="mt-0.5 text-xs text-slate-500">Assign to {course || "selected class"}</p></div><button type="button" onClick={() => setShowTaskModal(false)} aria-label="Close modal" className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100">×</button></div>
          <div className="space-y-3 overflow-y-auto p-4 sm:p-5">
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Task title *</label><input required maxLength={120} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Solve Exercise 3.2" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-semibold text-slate-600">Task type</label><select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"><option value="homework">Homework</option><option value="revision">Revision</option><option value="project">Project</option><option value="other">Other</option></select></div><div><label className="mb-1 block text-xs font-semibold text-slate-600">Assigned date</label><input type="date" required value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500" /></div><div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold text-slate-600">Due date</label><input type="date" min={assignedDate} required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 sm:max-w-[calc(50%-6px)]" /></div></div>
            <div><label className="mb-1 block text-xs font-semibold text-slate-600">Instructions (optional)</label><textarea rows={2} maxLength={2000} value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Chapter, questions, submission instructions…" className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" /></div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-5"><button type="button" onClick={() => setShowTaskModal(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" disabled={taskSaving || !taskTitle.trim()} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{taskSaving ? "Creating…" : "Assign task"}</button></div>
        </form>
      </div>}
    </main>
  );
}
