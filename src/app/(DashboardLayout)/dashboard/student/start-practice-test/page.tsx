
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLevelLabel } from "@/lib/getLevelLable";
import { getCurrentUser } from "@/lib/getCurrentUser";

interface PracticeRow {
  course: string;
  subject?: string;
  chapter?: string;
  level: string;
  count: number;
}

const CURRENT_TEST_KEY = "currentTest";
const TEST_END_KEY = "testEndTime";
const TEST_ANS_KEY = "testAnswers";

function clearSavedTest() {
  sessionStorage.removeItem(CURRENT_TEST_KEY);
  sessionStorage.removeItem(TEST_END_KEY);
  sessionStorage.removeItem(TEST_ANS_KEY);
}

function makeResourceHref(path: string, row: PracticeRow): string {
  const params = new URLSearchParams({
    course: row.course,
    subject: row.subject || "",
    chapter: row.chapter || "",
  });

  return `${path}?${params.toString()}`;
}

function getVideoSubject(subject?: string) {
  return subject?.toLowerCase() === "maths"
    ? "Mathematics"
    : subject || "";
}

export default function PracticeSelector() {
  const router = useRouter();

  const [rows, setRows] = useState<PracticeRow[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchText, setSearchText] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [startingChapter, setStartingChapter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    clearSavedTest();

    let active = true;

    async function fetchData() {
      try {
        setLoadingOptions(true);
        setError("");

        const userData = await getCurrentUser();
        const email = userData?.user?.email;
        const userCourses: string[] = userData?.user?.courses || [];

        if (!email) {
          throw new Error("Could not identify your student account.");
        }

        const response = await fetch(
          `/api/Get-Available-Options?email=${encodeURIComponent(email)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Could not load your available chapters.");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || "Could not load your available chapters."
          );
        }

        const seen = new Set<string>();

        const availableRows: PracticeRow[] = (data.chapters || [])
          .filter((chapter: PracticeRow) =>
            userCourses.includes(chapter.course)
          )
          .filter((chapter: PracticeRow) => {
            const key = [
              chapter.course,
              chapter.subject || "",
              chapter.chapter || "",
            ].join("::");

            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((chapter: PracticeRow) => ({
            course: chapter.course,
            subject: chapter.subject,
            chapter: chapter.chapter,
            level: chapter.level,
            count: chapter.count,
          }));

        if (!active) return;

        setRows(availableRows);
        setSelectedCourse(availableRows[0]?.course || "");
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading chapters."
          );
        }
      } finally {
        if (active) setLoadingOptions(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const courses = useMemo(
    () => Array.from(new Set(rows.map((row) => row.course))),
    [rows]
  );

  const subjects = useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .filter((row) => row.course === selectedCourse)
            .map((row) => row.subject)
            .filter((subject): subject is string => Boolean(subject))
        )
      ),
    [rows, selectedCourse]
  );

  useEffect(() => {
    if (!subjects.length) {
      setSelectedSubject("");
      return;
    }

    if (!subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  const chapters = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return rows.filter((row) => {
      const sameCourse = row.course === selectedCourse;
      const sameSubject = row.subject === selectedSubject;
      const matchesSearch =
        !query ||
        `${row.chapter || ""} ${row.subject || ""} ${row.course}`
          .toLowerCase()
          .includes(query);

      return sameCourse && sameSubject && matchesSearch;
    });
  }, [rows, selectedCourse, selectedSubject, searchText]);

  // Keep the original practice-test workflow unchanged.
  const handleStart = async (row: PracticeRow) => {
    const key = [
      row.course,
      row.subject || "",
      row.chapter || "",
    ].join("::");

    setStartingChapter(key);

    try {
      clearSavedTest();

      const userData = await getCurrentUser();
      const email = userData?.user?.email;

      if (!email) {
        throw new Error("Could not identify your student account.");
      }

      const response = await fetch("/api/Get-Questions-By-Type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testType: "practice",
          course: row.course,
          subject: row.subject,
          chapter: row.chapter,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.error || "Not enough questions available for this chapter."
        );
        return;
      }

      const testSession = {
        testType: "practice",
        course: row.course,
        subject: row.subject,
        chapter: row.chapter,
        email,
        questions: data.questions,
        chapterLevel: data.chapterLevel,
        totalQuestions: data.totalQuestions,
        avgScore: data.avgScore,
        startTime: Date.now(),
      };

      sessionStorage.setItem(
        CURRENT_TEST_KEY,
        JSON.stringify(testSession)
      );

      router.push("/dashboard/student/test");
    } catch (err) {
      console.error("Error starting practice test:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Error starting test. Please try again."
      );
    } finally {
      setStartingChapter("");
    }
  };
const [expandedChapter, setExpandedChapter] = useState("");
  if (loadingOptions) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-6xl animate-pulse space-y-4">
          <div className="h-20 rounded-2xl bg-white" />
          <div className="h-16 rounded-2xl bg-white" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-4 px-3 py-4 sm:px-5 sm:py-6">
        {/* Compact page header */}
        <header className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-slate-950 to-violet-900 px-4 py-4 text-white shadow-sm sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200 sm:text-xs">
              Innovative Academy
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              Learning Hub
            </h1>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              Choose a chapter. Learn, revise, and practise.
            </p>
          </div>
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl sm:flex">
            🎯
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            {error}
          </div>
        )}

        {/* Course and subject selectors in one compact panel */}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Your course
              </h2>
              <span className="text-xs text-slate-500">
                {courses.length} available
              </span>
            </div>

            {courses.length ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {courses.map((course) => {
                  const active = selectedCourse === course;

                  return (
                    <button
                      key={course}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(course);
                        setSearchText("");
                      }}
                      className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-violet-700 bg-violet-700 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"
                      }`}
                    >
                      {course}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                No course chapters are available. Ask your teacher to check
                your course assignments.
              </p>
            )}
          </div>

          {selectedCourse && subjects.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <h2 className="mb-2 text-sm font-bold text-slate-900">
                Subject
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {subjects.map((subject) => {
                  const active = selectedSubject === subject;

                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => {
                        setSelectedSubject(subject);
                        setSearchText("");
                      }}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Search, result count, and chapter list */}
        {selectedCourse && selectedSubject && (
          <section>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedSubject} chapters
                </h2>
                <p className="text-xs text-slate-500">
                  {chapters.length}{" "}
                  {chapters.length === 1 ? "chapter" : "chapters"} found
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ⌕
                </span>
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Find a chapter..."
                  aria-label="Search chapters"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

        
{chapters.length ? (
  <div className="space-y-2">
    {chapters.map((row, index) => {
      const chapterKey = [
        row.course,
        row.subject || "",
        row.chapter || "",
      ].join("::");

      const isExpanded = expandedChapter === chapterKey;
      const starting = startingChapter === chapterKey;

      return (
        <article
          key={chapterKey}
          className={`overflow-hidden rounded-xl border bg-white transition ${
            isExpanded
              ? "border-violet-300 shadow-sm"
              : "border-slate-200"
          }`}
        >
          {/* Always-visible chapter heading */}
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={() =>
              setExpandedChapter(isExpanded ? "" : chapterKey)
            }
            className="flex w-full items-center gap-3 p-3 text-left sm:p-4"
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                isExpanded
                  ? "bg-violet-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {index + 1}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block break-words text-sm font-bold text-slate-900 sm:text-base">
                {row.chapter || "Untitled chapter"}
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                {row.count} questions
                <span className="mx-1.5">·</span>
                {getLevelLabel(row.level) || "Beginner"}
              </span>
            </span>

            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                isExpanded
                  ? "bg-violet-50 text-violet-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {isExpanded ? "Close" : "Open"}
            </span>

            <span
              aria-hidden="true"
              className={`shrink-0 text-lg text-slate-400 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              ⌄
            </span>
          </button>

          {/* Resources appear only when expanded */}
          {isExpanded && (
            <div className="border-t border-slate-100 bg-slate-50/70 p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={makeResourceHref(
                    "/dashboard/student/notes",
                    row
                  )}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                >
                  <span>📖</span> Notes
                </Link>

                <Link
                  href={makeResourceHref(
                    "/dashboard/student/flashcards",
                    row
                  )}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                >
                  <span>🗂️</span> Flashcards
                </Link>

                <Link
                  href={makeResourceHref(
                    "/dashboard/student/one-shots",
                    {
                      ...row,
                      subject: getVideoSubject(row.subject),
                    }
                  )}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-sky-300 hover:bg-sky-50"
                >
                  <span>🎬</span> One-Shot
                </Link>

                <button
                  type="button"
                  onClick={() => handleStart(row)}
                  disabled={Boolean(startingChapter)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-700 px-3 py-2 text-sm font-bold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{starting ? "⏳" : "🎯"}</span>
                  {starting ? "Preparing..." : "Practice"}
                </button>
              </div>
            </div>
          )}
        </article>
      );
    })}
  </div>
) : (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
    <p className="font-bold text-slate-900">No chapters found</p>
    <p className="mt-1 text-sm text-slate-500">
      Try another search or choose a different subject.
    </p>
    {searchText && (
      <button
        type="button"
        onClick={() => setSearchText("")}
        className="mt-3 text-sm font-semibold text-violet-700"
      >
        Clear search
      </button>
    )}
  </div>
)}

          </section>
        )}

        {!error && !rows.length && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <h2 className="font-bold text-slate-900">
              No chapters available yet
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ask your teacher or academy administrator to check your course
              assignments and available questions.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
