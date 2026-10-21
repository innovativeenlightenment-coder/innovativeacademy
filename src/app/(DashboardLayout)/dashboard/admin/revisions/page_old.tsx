
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type ActivityType = "mcq" | "explain" | "flashcard" | "rapid_fire";
type Difficulty = "easy" | "moderate" | "difficult";

type ActivityDraft = {
  type: ActivityType;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  timeLimitSeconds: number;
  imageUrl: string;
};

type Student = { id: string; name: string; username: string; email: string };
type Revision = {
  id: string;
  title: string;
  course: string;
  subject: string;
  chapter: string;
  topic: string;
  dueDate: string;
  activityCount: number;
  studentStatuses: { studentId: string; studentName: string; status: string }[];
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const blankActivity = (type: ActivityType = "mcq"): ActivityDraft => ({
  type,
  prompt: "",
  options: type === "mcq" ? ["", "", "", ""] : [],
  correctAnswer: "",
  explanation: "",
  difficulty: "moderate",
  timeLimitSeconds: type === "rapid_fire" ? 10 : 0,
  imageUrl: "",
});

const field =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

const label = "block text-sm font-semibold text-slate-700";

const typeLabels: Record<ActivityType, string> = {
  mcq: "Multiple choice",
  explain: "Explain your answer",
  flashcard: "Flashcard",
  rapid_fire: "Rapid fire",
};

const typeIcons: Record<ActivityType, string> = {
  mcq: "☑",
  explain: "✎",
  flashcard: "▤",
  rapid_fire: "⚡",
};

export default function TeacherRevisionsPage() {
  const [courses, setCourses] = useState<string[]>([]);
  const [course, setCourse] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [subject, setSubject] = useState("Science");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [assignedDate, setAssignedDate] = useState(today());
  const [dueDate, setDueDate] = useState(today());

  const [assignToAll, setAssignToAll] = useState(true);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityDraft[]>([
    blankActivity(),
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showBuilder, setShowBuilder] = useState(true);

  const load = useCallback(async (selectedCourse = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/revision-teacher${selectedCourse ? `?course=${encodeURIComponent(selectedCourse)}` : ""}`,
        { cache: "no-store" }
      );

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load revisions.");
      }

      const availableCourses: string[] = result.courses || [];
      setCourses(availableCourses);
      setCourse((current) =>
        current && availableCourses.includes(current)
          ? current
          : result.course || availableCourses[0] || ""
      );
      setStudents(result.students || []);
      setRevisions(result.revisions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load revisions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (course) void load(course);
  }, [course, load]);

  function updateActivity(index: number, patch: Partial<ActivityDraft>) {
    setActivities((old) =>
      old.map((activity, i) =>
        i === index ? { ...activity, ...patch } : activity
      )
    );
  }

  function updateOption(index: number, optionIndex: number, value: string) {
    setActivities((old) =>
      old.map((activity, i) =>
        i !== index
          ? activity
          : {
              ...activity,
              options: activity.options.map((option, j) =>
                j === optionIndex ? value : option
              ),
            }
      )
    );
  }

  function addActivity(type: ActivityType) {
    setActivities((old) => [...old, blankActivity(type)]);
  }

  function moveActivity(index: number, direction: -1 | 1) {
    setActivities((old) => {
      const next = [...old];
      const target = index + direction;
      if (target < 0 || target >= next.length) return old;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleStudent(id: string, checked: boolean) {
    setStudentIds((old) =>
      checked ? [...old, id] : old.filter((item) => item !== id)
    );
  }

  function clearForm() {
    setTitle("");
    setInstructions("");
    setSubject("Science");
    setChapter("");
    setTopic("");
    setAssignedDate(today());
    setDueDate(today());
    setActivities([blankActivity()]);
    setAssignToAll(true);
    setStudentIds([]);
  }

  async function publish(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/revision-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course,
          title,
          instructions,
          subject,
          chapter,
          topic,
          assignedDate,
          dueDate,
          assignToAll,
          studentIds,
          activities,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to publish revision.");
      }

      clearForm();
      setNotice("Revision published successfully.");
      setShowBuilder(false);
      await load(course);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to publish revision.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F6FC] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-violet-800 to-indigo-700 p-6 text-white shadow-lg sm:p-8">
          <a
            href="/dashboard/admin/attendance"
            className="text-sm font-medium text-violet-200 hover:text-white"
          >
            ← Study Calendar
          </a>

          <div className="mt-7 grid gap-6 md:grid-cols-[1fr_280px] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
                Innovative Academy
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Revision Studio
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100">
                Build focused revision sessions. Help students recall, practise,
                and understand concepts without marks or test pressure.
              </p>
            </div>

            <label className="block text-sm font-semibold text-violet-100">
              Class / course
              <select
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                disabled={!courses.length}
                className="mt-2 w-full rounded-xl border border-white/20 bg-white px-3 py-3 text-sm font-semibold text-violet-950 outline-none"
              >
                {courses.length ? (
                  courses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))
                ) : (
                  <option value="">No classes assigned</option>
                )}
              </select>
            </label>
          </div>
        </header>

        {(error || notice) && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || notice}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowBuilder((value) => !value)}
            className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-800"
          >
            {showBuilder ? "Hide builder" : "+ Create revision"}
          </button>
          <a
            href="/dashboard/admin/attendance"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-300"
          >
            Attendance & homework
          </a>
        </div>

        {showBuilder && (
          <form
            onSubmit={publish}
            className="space-y-7 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
                Create learning session
              </p>
              <h2 className="mt-2 text-2xl font-bold">New revision</h2>
              <p className="mt-2 text-sm text-slate-500">
                Add your questions and answers, then choose who should receive
                the assignment.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={label}>
                Revision title
                <input
                  required
                  maxLength={160}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Understanding Newton’s laws"
                  className={field}
                />
              </label>

              <label className={label}>
                Subject
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Science or Maths"
                  className={field}
                />
              </label>

              <label className={label}>
                Chapter
                <input
                  value={chapter}
                  onChange={(event) => setChapter(event.target.value)}
                  placeholder="Chapter name"
                  className={field}
                />
              </label>

              <label className={label}>
                Topic
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Specific concept"
                  className={field}
                />
              </label>

              <label className={label}>
                Assigned date
                <input
                  type="date"
                  required
                  value={assignedDate}
                  onChange={(event) => setAssignedDate(event.target.value)}
                  className={field}
                />
              </label>

              <label className={label}>
                Deadline
                <input
                  type="date"
                  required
                  min={assignedDate}
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={field}
                />
              </label>
            </div>

            <label className={label}>
              Instructions for students
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                rows={3}
                maxLength={3000}
                placeholder="What should students revise before starting?"
                className={field}
              />
            </label>

            <section className="space-y-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-lg font-bold">Learning activities</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {activities.length} activities · No marks or scores
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    ["flashcard", "rapid_fire", "mcq", "explain"] as ActivityType[]
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addActivity(type)}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-100"
                    >
                      + {typeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>

              {activities.map((activity, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xl text-violet-800">
                      {typeIcons[activity.type]}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold">
                        {index + 1}. {typeLabels[activity.type]}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Add the prompt and its learning answer.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveActivity(index, -1)}
                      className="rounded-lg border bg-white px-3 py-2 disabled:opacity-30"
                      aria-label="Move activity up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === activities.length - 1}
                      onClick={() => moveActivity(index, 1)}
                      className="rounded-lg border bg-white px-3 py-2 disabled:opacity-30"
                      aria-label="Move activity down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={activities.length === 1}
                      onClick={() =>
                        setActivities((old) => old.filter((_, i) => i !== index))
                      }
                      className="rounded-lg border border-rose-200 bg-white px-3 py-2 font-bold text-rose-600 disabled:opacity-30"
                      aria-label="Remove activity"
                    >
                      ×
                    </button>
                  </div>

                  <label className={label}>
                    {activity.type === "flashcard"
                      ? "Front of card"
                      : "Question / prompt"}
                    <textarea
                      required
                      value={activity.prompt}
                      onChange={(event) =>
                        updateActivity(index, { prompt: event.target.value })
                      }
                      rows={3}
                      maxLength={4000}
                      placeholder="Write a clear question or concept prompt"
                      className={field}
                    />
                  </label>

                  {activity.type === "mcq" && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {activity.options.map((option, optionIndex) => (
                        <label key={optionIndex} className={label}>
                          Option {String.fromCharCode(65 + optionIndex)}
                          <input
                            required
                            value={option}
                            onChange={(event) =>
                              updateOption(index, optionIndex, event.target.value)
                            }
                            placeholder={`Enter option ${String.fromCharCode(65 + optionIndex)}`}
                            className={field}
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className={label}>
                      {activity.type === "flashcard"
                        ? "Back of card / answer"
                        : "Correct / model answer"}
                      {activity.type === "mcq" ? (
                        <select
                          required
                          value={activity.correctAnswer}
                          onChange={(event) =>
                            updateActivity(index, {
                              correctAnswer: event.target.value,
                            })
                          }
                          className={field}
                        >
                          <option value="">Choose the correct option</option>
                          {activity.options
                            .filter((option) => option.trim())
                            .map((option, optionIndex) => (
                              <option key={optionIndex} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <textarea
                          required
                          value={activity.correctAnswer}
                          onChange={(event) =>
                            updateActivity(index, {
                              correctAnswer: event.target.value,
                            })
                          }
                          rows={3}
                          maxLength={5000}
                          placeholder="Write the answer students should learn"
                          className={field}
                        />
                      )}
                    </label>

                    <label className={label}>
                      Explanation (optional)
                      <textarea
                        value={activity.explanation}
                        onChange={(event) =>
                          updateActivity(index, {
                            explanation: event.target.value,
                          })
                        }
                        rows={3}
                        maxLength={5000}
                        placeholder="Explain the idea in simple language"
                        className={field}
                      />
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className={label}>
                      Difficulty
                      <select
                        value={activity.difficulty}
                        onChange={(event) =>
                          updateActivity(index, {
                            difficulty: event.target.value as Difficulty,
                          })
                        }
                        className={field}
                      >
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="difficult">Difficult</option>
                      </select>
                    </label>

                    <label className={label}>
                      Timer (seconds)
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={activity.timeLimitSeconds}
                        onChange={(event) =>
                          updateActivity(index, {
                            timeLimitSeconds: Number(event.target.value),
                          })
                        }
                        className={field}
                      />
                    </label>
                  </div>

                  {activity.type === "rapid_fire" && (
                    <p className="mt-3 rounded-xl bg-violet-50 p-3 text-xs leading-5 text-violet-800">
                      The answer appears when the timer ends. Set the timer to
                      0 for an untimed question.
                    </p>
                  )}
                </article>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-200 p-4 sm:p-5">
              <h3 className="font-bold">Who should receive this revision?</h3>

              <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={assignToAll}
                  onChange={(event) => setAssignToAll(event.target.checked)}
                  className="h-4 w-4 accent-violet-700"
                />
                Assign to every student in {course || "this class"}
              </label>

              {!assignToAll && (
                <div className="mt-4 max-h-60 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3">
                  {students.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 rounded-lg p-2 text-sm hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={studentIds.includes(student.id)}
                        onChange={(event) =>
                          toggleStudent(student.id, event.target.checked)
                        }
                        className="h-4 w-4 accent-violet-700"
                      />
                      <span>{student.name}</span>
                      <span className="ml-auto text-xs text-slate-400">
                        {student.username || student.email}
                      </span>
                    </label>
                  ))}

                  {!students.length && (
                    <p className="text-sm text-slate-500">
                      No students found for this course.
                    </p>
                  )}
                </div>
              )}
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={clearForm}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear form
              </button>
              <button
                type="submit"
                disabled={
                  saving ||
                  !course ||
                  !activities.length ||
                  (!assignToAll && !studentIds.length)
                }
                className="rounded-xl bg-violet-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-800 disabled:opacity-50"
              >
                {saving ? "Publishing…" : "Publish revision →"}
              </button>
            </div>
          </form>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Published revisions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Monitor who has started or completed each revision.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">
              Loading revisions…
            </div>
          ) : revisions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-bold">Nothing published yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Create your first revision above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {revisions.map((revision) => {
                const completed = revision.studentStatuses.filter(
                  (student) => student.status === "completed"
                ).length;
                const attempted = revision.studentStatuses.filter(
                  (student) => student.status === "attempted"
                ).length;
                const total = revision.studentStatuses.length;
                const percentage = total
                  ? Math.round((completed / total) * 100)
                  : 0;

                return (
                  <article
                    key={revision.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
                          {revision.subject || revision.course}
                        </p>
                        <h3 className="mt-2 font-bold">{revision.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {[revision.chapter, revision.topic]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800">
                        {revision.activityCount} activities
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs text-emerald-700">Completed</p>
                        <p className="mt-1 text-xl font-bold text-emerald-800">
                          {completed}
                        </p>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-3">
                        <p className="text-xs text-amber-700">In progress</p>
                        <p className="mt-1 text-xl font-bold text-amber-800">
                          {attempted}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-100 p-3">
                        <p className="text-xs text-slate-600">Not started</p>
                        <p className="mt-1 text-xl font-bold text-slate-800">
                          {total - completed - attempted}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-600 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Deadline: {revision.dueDate || "—"}
                    </p>

                    <details className="mt-4 border-t border-slate-100 pt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-violet-700">
                        View student progress
                      </summary>
                      <div className="mt-3 space-y-2">
                        {revision.studentStatuses.map((student) => (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                          >
                            <span className="text-sm">{student.studentName}</span>
                            <span className="text-xs font-semibold capitalize text-slate-500">
                              {student.status.replaceAll("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-400">
          Innovative Academy · Revision Studio
        </footer>
      </div>
    </main>
  );
}
