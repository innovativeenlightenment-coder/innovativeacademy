
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type ActivityType = "flashcard" | "rapid_fire" | "mcq" | "explain";
type Status = "not_attempted" | "attempted" | "completed";

type Option = string | { text?: string; label?: string };

type Activity = {
  id: string;
  type: ActivityType;
  prompt?: string;
  options?: Option[];
  difficulty?: string;
  timeLimitSeconds?: number;
  imageUrl?: string;
};

type Assignment = {
  id: string;
  title: string;
  course?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  instructions?: string;
  description?: string;
  status: Status;
  activities: Activity[];
  dueDate?: string;
};

const ORDER: ActivityType[] = [
  "flashcard",
  "rapid_fire",
  "mcq",
  "explain",
];

const INFO: Record<
  ActivityType,
  { title: string; subtitle: string; icon: string; color: string }
> = {
  flashcard: {
    title: "Flashcards",
    subtitle: "Recall key concepts",
    icon: "◈",
    color: "violet",
  },
  rapid_fire: {
    title: "Rapid Fire",
    subtitle: "Think and respond quickly",
    icon: "↯",
    color: "amber",
  },
  mcq: {
    title: "MCQ Practice",
    subtitle: "Choose the best answer",
    icon: "☷",
    color: "blue",
  },
  explain: {
    title: "Explain Your Answer",
    subtitle: "Build deeper understanding",
    icon: "✎",
    color: "emerald",
  },
};

const COLORS: Record<string, string> = {
  violet: "bg-violet-50 text-violet-700",
  amber: "bg-amber-50 text-amber-800",
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
};

const DEFAULT_RAPID_SECONDS = 15;

function getId(item: { id?: string; _id?: string }) {
  return String(item.id || item._id || "");
}

function normalizeStatus(value: unknown): Status {
  if (value === "completed" || value === "attempted") return value;
  return "not_attempted";
}

function optionText(option: Option): string {
  return typeof option === "string"
    ? option
    : option.text || option.label || "";
}

function activityQuestion(activity?: Activity) {
  return activity?.prompt || "Review this concept.";
}

export default function StudentRevisionsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [active, setActive] = useState<Assignment | null>(null);
  const [section, setSection] = useState<ActivityType | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState("");
  const [revealedExplanation, setRevealedExplanation] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [response, setResponse] = useState("");
  const [finishedSections, setFinishedSections] = useState<ActivityType[]>([]);
  const [seconds, setSeconds] = useState(DEFAULT_RAPID_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/revision-student", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to load revisions.");
      }

      const rows: Assignment[] = (data.assignments || []).map(
        (item: Record<string, unknown>) => ({
          ...item,
          id: String(item.id || item._id || ""),
          status: normalizeStatus(item.status),
          activities: Array.isArray(item.activities)
            ? item.activities.map((activity: Record<string, unknown>) => ({
                ...activity,
                id: String(activity.id || activity._id || ""),
                options: Array.isArray(activity.options)
                  ? activity.options
                  : [],
              }))
            : [],
        })
      );

      setAssignments(rows);

      setActive((previous) => {
        if (!previous) return null;
        return rows.find((a) => a.id === previous.id) || null;
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load revisions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const types = useMemo(() => {
    if (!active) return [];
    const present = new Set(active.activities.map((a) => a.type));
    return ORDER.filter((type) => present.has(type));
  }, [active]);

  const activities = useMemo(
    () =>
      active && section
        ? active.activities.filter((a) => a.type === section)
        : [],
    [active, section]
  );

  const current = activities[index];

  const completedCount = assignments.filter(
    (a) => a.status === "completed"
  ).length;

  // Rapid Fire countdown.
  useEffect(() => {
    if (!timerRunning || section !== "rapid_fire" || revealed) return;

    const timer = window.setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          setTimerRunning(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timerRunning, section, revealed]);

  // Reveal the answer automatically when Rapid Fire time expires.
  useEffect(() => {
    if (
      section === "rapid_fire" &&
      seconds === 0 &&
      !revealed &&
      current
    ) {
      void revealAnswer();
    }
    // revealAnswer is intentionally triggered only when the timer reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, section, revealed, current?.id]);

  async function updateStatus(id: string, status: Status) {
    const res = await fetch("/api/revision-student", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId: id, status }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || "Unable to save progress.");
    }

    setAssignments((old) =>
      old.map((a) => (a.id === id ? { ...a, status: data.status || status } : a))
    );

    setActive((old) =>
      old && old.id === id
        ? { ...old, status: data.status || status }
        : old
    );
  }

  async function openAssignment(assignment: Assignment) {
    if (assignment.status === "completed") return;

    setError("");
    setNotice("");
    setActive(assignment);
    setSection(null);
    setIndex(0);
    setRevealed(false);
    setRevealedAnswer("");
    setRevealedExplanation("");
    setSelectedOption("");
    setResponse("");
    setFinishedSections([]);
    setTimerRunning(false);
    setSeconds(DEFAULT_RAPID_SECONDS);

    if (assignment.status === "not_attempted") {
      try {
        await updateStatus(assignment.id, "attempted");
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to save progress."
        );
      }
    }
  }

  function startSection(type: ActivityType) {
    if (!active || finishedSections.includes(type)) return;

    setSection(type);
    setIndex(0);
    setRevealed(false);
    setRevealedAnswer("");
    setRevealedExplanation("");
    setSelectedOption("");
    setResponse("");
    setSeconds(
      type === "rapid_fire"
        ? active.activities.find((a) => a.type === type)?.timeLimitSeconds ||
            DEFAULT_RAPID_SECONDS
        : DEFAULT_RAPID_SECONDS
    );
    setTimerRunning(type === "rapid_fire");
    setError("");
    setNotice("");
  }

  function resetQuestion(nextIndex: number) {
    const next = activities[nextIndex];

    setIndex(nextIndex);
    setRevealed(false);
    setRevealedAnswer("");
    setRevealedExplanation("");
    setSelectedOption("");
    setResponse("");

    const duration =
      section === "rapid_fire"
        ? next?.timeLimitSeconds || DEFAULT_RAPID_SECONDS
        : DEFAULT_RAPID_SECONDS;

    setSeconds(duration);
    setTimerRunning(section === "rapid_fire");
  }

  function stopSection() {
    setTimerRunning(false);
    setSection(null);
    setIndex(0);
    setRevealed(false);
    setRevealedAnswer("");
    setRevealedExplanation("");
    setSelectedOption("");
    setResponse("");
  }

  function exitAssignment() {
    setTimerRunning(false);
    setActive(null);
    setSection(null);
    setFinishedSections([]);
    setNotice("");
    setError("");
  }

  async function revealAnswer() {
    if (!active || !section || !current || revealed || saving) return;

    setTimerRunning(false);
    setError("");

    try {
      const res = await fetch("/api/revision-student", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reveal",
          assignmentId: active.id,
          activityId: current.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to load the model answer.");
      }

      setRevealedAnswer(
        typeof data.correctAnswer === "string"
          ? data.correctAnswer
          : data.correctAnswer == null
            ? "No model answer was provided."
            : JSON.stringify(data.correctAnswer)
      );
      setRevealedExplanation(
        typeof data.explanation === "string" ? data.explanation : ""
      );
      setRevealed(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load the model answer."
      );
    }
  }

  function nextActivity() {
    if (index >= activities.length - 1) return;
    resetQuestion(index + 1);
  }

  async function finishSection() {
    if (!active || !section || saving) return;

    setTimerRunning(false);
    setSaving(true);
    setError("");

    const nextFinished = Array.from(
      new Set([...finishedSections, section])
    );
    const allFinished = types.every((type) => nextFinished.includes(type));

    try {
      if (allFinished) {
        await updateStatus(active.id, "completed");
        setActive(null);
        setSection(null);
        setFinishedSections([]);
        setNotice("Revision completed. Great work!");
      } else {
        setFinishedSections(nextFinished);
        setSection(null);
        setIndex(0);
        setRevealed(false);
        setRevealedAnswer("");
        setRevealedExplanation("");
        setSelectedOption("");
        setResponse("");
        setNotice("Section complete. Choose your next learning activity.");
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to save completion."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-4">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-16 rounded-2xl bg-gray-100" />
          <div className="h-32 rounded-2xl bg-gray-100" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-28 rounded-2xl bg-gray-100" />
            <div className="h-28 rounded-2xl bg-gray-100" />
            <div className="h-28 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-5">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-700 font-black text-white">
              IA
            </div>
            <div>
              <p className="text-xs font-black tracking-wide text-violet-700">
                INNOVATIVE ACADEMY
              </p>
              <p className="text-[11px] text-gray-500">Learning workspace</p>
            </div>
          </div>

          {active && (
            <button
              onClick={exitAssignment}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold hover:border-violet-300 hover:text-violet-700"
            >
              Exit revision
            </button>
          )}
        </header>

        {error && (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-3 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-800"
          >
            {notice}
          </div>
        )}

        {!active && (
          <>
            <section className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-violet-800 to-indigo-700 px-5 py-5 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                  Learn · Recall · Understand
                </p>
                <h1 className="mt-1 text-2xl font-black">Your revision room</h1>
                <p className="mt-1 text-sm text-violet-100">
                  Build understanding, one concept at a time.
                </p>
              </div>

              <div className="flex gap-2">
                {[
                  { label: "Assigned", value: assignments.length },
                  { label: "Completed", value: completedCount },
                  {
                    label: "Remaining",
                    value: assignments.length - completedCount,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="min-w-[72px] rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-center"
                  >
                    <p className="text-xl font-black">{stat.value}</p>
                    <p className="text-[10px] text-violet-100">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Assigned revisions</h2>
                <p className="text-xs text-gray-500">
                  Activities shared by your teacher
                </p>
              </div>
              <button
                onClick={() => void loadAssignments()}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold hover:bg-gray-50"
              >
                Refresh ↻
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h3 className="font-bold">Nothing assigned yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  New revision activities will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {assignments.map((a) => {
                  const done = a.status === "completed";
                  const attempted = a.status === "attempted";
                  const presentTypes = ORDER.filter((type) =>
                    a.activities.some((activity) => activity.type === type)
                  );

                  return (
                    <article
                      key={a.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-violet-200 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-700">
                          {done ? "✓" : "◈"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            done
                              ? "bg-emerald-50 text-emerald-700"
                              : attempted
                                ? "bg-amber-50 text-amber-800"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {done
                            ? "Completed"
                            : attempted
                              ? "In progress"
                              : "Not started"}
                        </span>
                      </div>

                      <h3 className="mt-3 font-extrabold">{a.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {[a.subject, a.chapter, a.topic]
                          .filter(Boolean)
                          .join(" · ") || "Revision assignment"}
                      </p>

                      {(a.instructions || a.description) && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-600">
                          {a.instructions || a.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {presentTypes.map((type) => (
                          <span
                            key={type}
                            className={`rounded-md px-2 py-1 text-[10px] font-bold ${COLORS[INFO[type].color]}`}
                          >
                            {INFO[type].title}
                          </span>
                        ))}
                      </div>

                      <button
                        disabled={done}
                        onClick={() => void openAssignment(a)}
                        className={`mt-4 w-full rounded-lg px-3 py-2.5 text-xs font-bold ${
                          done
                            ? "cursor-not-allowed bg-emerald-50 text-emerald-700"
                            : "bg-violet-700 text-white hover:bg-violet-800"
                        }`}
                      >
                        {done
                          ? "✓ Revision completed"
                          : attempted
                            ? "Continue revision →"
                            : "Start revision →"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {active && !section && (
          <>
            <section className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
              <button
                onClick={exitAssignment}
                className="mb-2 text-xs font-bold text-violet-700"
              >
                ← All revisions
              </button>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
                Your learning plan
              </p>
              <h1 className="mt-1 text-xl font-black">{active.title}</h1>
              <p className="mt-1 text-xs text-gray-500">
                Complete each activity type to finish this revision.
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all"
                  style={{
                    width: `${
                      types.length
                        ? (finishedSections.length / types.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                {finishedSections.length} of {types.length} sections completed
              </p>
            </section>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {types.map((type) => {
                const info = INFO[type];
                const done = finishedSections.includes(type);
                const count = active.activities.filter(
                  (activity) => activity.type === type
                ).length;

                return (
                  <button
                    key={type}
                    disabled={done || count === 0}
                    onClick={() => startSection(type)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      done
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                          done
                            ? "bg-emerald-100 text-emerald-700"
                            : COLORS[info.color]
                        }`}
                      >
                        {done ? "✓" : info.icon}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {count} {count === 1 ? "activity" : "activities"}
                      </span>
                    </div>
                    <h2 className="mt-3 text-sm font-extrabold">
                      {info.title}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      {done ? "Section completed" : info.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {active && section && current && (
          <>
            <button
              onClick={stopSection}
              className="mb-3 text-xs font-bold text-violet-700"
            >
              ← Back to sections
            </button>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${COLORS[INFO[section].color]}`}
                >
                  {INFO[section].icon}
                </span>
                <div>
                  <h2 className="text-sm font-extrabold">
                    {INFO[section].title}
                  </h2>
                  <p className="text-[10px] text-gray-500">{active.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500">
                  Activity {index + 1} / {activities.length}
                </span>
                {section === "rapid_fire" && (
                  <div
                    className={`rounded-lg px-3 py-2 text-xs font-black tabular-nums ${
                      seconds <= 5 && !revealed
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    ◷ 00:{String(seconds).padStart(2, "0")}
                  </div>
                )}
              </div>
            </div>

            <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(230px,0.8fr)]">
              <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div
                  className={`border-b border-gray-100 px-4 py-5 sm:px-6 ${
                    section === "rapid_fire"
                      ? "bg-amber-50"
                      : section === "mcq"
                        ? "bg-blue-50"
                        : section === "explain"
                          ? "bg-emerald-50"
                          : "bg-violet-50"
                  }`}
                >
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-gray-500">
                    {section === "flashcard"
                      ? "Think before you flip"
                      : section === "rapid_fire"
                        ? "Beat the clock · No marks"
                        : section === "mcq"
                          ? "Choose, then check"
                          : "Explain in your own words"}
                  </p>
                  <h2 className="whitespace-pre-wrap text-lg font-extrabold leading-7 sm:text-xl">
                    {activityQuestion(current)}
                  </h2>

                  {current.imageUrl && (
                    <img
                      src={current.imageUrl}
                      alt="Question illustration"
                      className="mt-4 max-h-80 w-full rounded-xl border border-gray-200 bg-white object-contain"
                    />
                  )}
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                  {section === "flashcard" && !revealed && (
                    <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50 p-4 text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        Can you recall the answer?
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Think it through before revealing.
                      </p>
                    </div>
                  )}

                  {section === "rapid_fire" && !revealed && (
                    <div className="space-y-3">
                      <label
                        htmlFor="rapid-response"
                        className="text-xs font-bold text-gray-600"
                      >
                        Your quick response
                      </label>
                      <input
                        id="rapid-response"
                        autoComplete="off"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Type a short answer…"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      />
                      <p className="text-xs leading-5 text-gray-500">
                        Reveal the model answer when you are ready, or let the
                        timer run out.
                      </p>
                    </div>
                  )}

                  {section === "mcq" && (
                    <div className="grid gap-2">
                      {(current.options || []).map((option, i) => {
                        const label = optionText(option);
                        const chosen = selectedOption === label;

                        return (
                          <button
                            key={`${i}-${label}`}
                            disabled={revealed}
                            onClick={() => setSelectedOption(label)}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${
                              chosen
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-200 hover:border-blue-200"
                            }`}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                chosen
                                  ? "bg-blue-700 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="leading-5">{label}</span>
                          </button>
                        );
                      })}
                      {(!current.options || current.options.length === 0) && (
                        <p className="text-sm text-gray-500">
                          No options were provided for this question.
                        </p>
                      )}
                    </div>
                  )}

                  {section === "explain" && (
                    <div>
                      <label
                        htmlFor="explain-response"
                        className="mb-2 block text-xs font-bold text-gray-600"
                      >
                        Your explanation
                      </label>
                      <textarea
                        id="explain-response"
                        rows={5}
                        value={response}
                        disabled={revealed}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Explain the concept in your own words…"
                        className="w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm leading-6 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-70"
                      />
                    </div>
                  )}

                  {revealed && (
                    <div className="space-y-3">
                      {(section === "rapid_fire" || section === "explain") &&
                        response.trim() && (
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                              Your response
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                              {response}
                            </p>
                          </div>
                        )}

                      {section === "mcq" && selectedOption && (
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                            Your selection
                          </p>
                          <p className="mt-1 text-sm font-semibold">
                            {selectedOption}
                          </p>
                        </div>
                      )}

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                          Model answer
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                          {revealedAnswer || "No model answer was provided."}
                        </p>

                        {revealedExplanation && (
                          <div className="mt-3 border-t border-emerald-200 pt-3">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                              Explanation
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                              {revealedExplanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <p className="text-[10px] text-gray-400">
                      Practice for understanding · No marks
                    </p>

                    {!revealed ? (
                      <button
                        disabled={
                          saving ||
                          (section === "mcq" && !selectedOption)
                        }
                        onClick={() => void revealAnswer()}
                        className={`rounded-lg px-4 py-2.5 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          section === "rapid_fire"
                            ? "bg-amber-600 hover:bg-amber-700"
                            : section === "mcq"
                              ? "bg-blue-700 hover:bg-blue-800"
                              : section === "explain"
                                ? "bg-emerald-700 hover:bg-emerald-800"
                                : "bg-violet-700 hover:bg-violet-800"
                        }`}
                      >
                        {section === "flashcard"
                          ? "Reveal card ↻"
                          : section === "rapid_fire"
                            ? "Lock response & reveal"
                            : section === "mcq"
                              ? "Check answer"
                              : "Compare answers"}
                      </button>
                    ) : index < activities.length - 1 ? (
                      <button
                        onClick={nextActivity}
                        className="rounded-lg bg-violet-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-800"
                      >
                        Next activity →
                      </button>
                    ) : (
                      <button
                        disabled={saving}
                        onClick={() => void finishSection()}
                        className="rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Complete section ✓"}
                      </button>
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-3">
                <section className="rounded-2xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold">Learning path</h3>
                    <span className="text-[10px] font-bold text-violet-700">
                      {finishedSections.length}/{types.length}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all"
                      style={{
                        width: `${
                          types.length
                            ? (finishedSections.length / types.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 space-y-1">
                    {types.map((type) => {
                      const done = finishedSections.includes(type);
                      const selected = section === type;

                      return (
                        <button
                          key={type}
                          disabled={done || selected}
                          onClick={() => startSection(type)}
                          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left ${
                            selected
                              ? "bg-violet-50 text-violet-800"
                              : done
                                ? "bg-emerald-50 text-emerald-800"
                                : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="w-5 text-center">
                            {done ? "✓" : INFO[type].icon}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                            {INFO[type].title}
                          </span>
                          <span className="text-[10px]">
                            {done ? "Done" : selected ? "Here" : "Open"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">
                    Learning tip
                  </p>
                  <h3 className="mt-1 text-sm font-extrabold">
                    {section === "flashcard"
                      ? "Retrieve before revealing"
                      : section === "rapid_fire"
                        ? "Speed comes after clarity"
                        : section === "mcq"
                          ? "Understand why"
                          : "Explain it simply"}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-gray-500">
                    {section === "flashcard"
                      ? "Try to recall the concept from memory before checking the answer."
                      : section === "rapid_fire"
                        ? "Try a short answer first. Then use the model answer to correct your understanding."
                        : section === "mcq"
                          ? "Compare your reasoning with the model answer."
                          : "Explaining a concept in your own words helps test your understanding."}
                  </p>
                </section>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold text-gray-700">Remember</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    This is a learning space, not an exam. Focus on what you
                    understand and what you need to revisit.
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
