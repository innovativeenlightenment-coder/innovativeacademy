"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface LearningVideo {
  _id: string;
  date: string;
  subject: string;
  title: string;
  description?: string;
  duration?: number;
  youtubeVideoId?: string;
}

interface LiveSessionInfo {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  roomName?: string;
  startedAt?: string;
  canEnd?: boolean;
}

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(dateString: string, amount: number) {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + amount);
  return localDateString(date);
}

function getWeekDates(selectedDate: string) {
  const date = parseLocalDate(selectedDate);
  const day = date.getDay();

  // Monday as the first day of the week.
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);

    return localDateString(current);
  });
}

function formatMonth(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatFullDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DailyLecturesPage() {
  const today = localDateString(new Date());

  const [selectedDate, setSelectedDate] = useState(today);

  const [lectures, setLectures] = useState<LearningVideo[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSessionInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(true);
  const [error, setError] = useState("");

  const weekDates = useMemo(
    () => getWeekDates(selectedDate),
    [selectedDate]
  );
const openDatePicker = () => {
  const input = document.getElementById(
    "mobile-date-picker"
  ) as HTMLInputElement | null;

  if (!input) return;

  if (typeof input.showPicker === "function") {
    input.showPicker();
  } else {
    input.focus();
    input.click();
  }
};
  const fetchLectures = useCallback(async (date: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/learning-videos?type=daily&date=${encodeURIComponent(date)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load daily lectures.");
      }

      const items: LearningVideo[] = Array.isArray(data)
        ? data
        : data.videos || [];

      setLectures(
        items.filter((lecture) => Boolean(lecture.youtubeVideoId))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load daily lectures."
      );

      setLectures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLiveStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/Live-Class/status", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to check live classes.");
      }

      setLiveSessions(
        Array.isArray(data.sessions) ? data.sessions : []
      );
    } catch (err) {
      console.error("LIVE STATUS ERROR:", err);
      setLiveSessions([]);
    } finally {
      setLiveLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLectures(selectedDate);
  }, [selectedDate, fetchLectures]);

  useEffect(() => {
    fetchLiveStatus();

    const interval = window.setInterval(fetchLiveStatus, 15000);

    return () => window.clearInterval(interval);
  }, [fetchLiveStatus]);

  function changeWeek(direction: number) {
    setSelectedDate((current) => addDays(current, direction * 7));
  }

  function selectDate(date: string) {
    setSelectedDate(date);
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-7 px-3 py-5 sm:px-5 sm:py-7 md:px-8">

      {/* HEADER */}
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-xl">
            📚
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Daily Lectures
            </h1>

            <p className="text-xs text-gray-500 sm:text-sm">
              Your daily learning classroom
            </p>
          </div>
        </div>
      </header>

      {/* LIVE CLASSROOMS */}
      <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-4 py-4 sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />

              <h2 className="font-bold text-gray-900">
                Live Classrooms
              </h2>
            </div>

            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Join a classroom currently running.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-bold sm:text-xs ${
              liveLoading
                ? "bg-gray-200 text-gray-600"
                : liveSessions.length > 0
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {liveLoading
              ? "CHECKING"
              : liveSessions.length > 0
              ? `${liveSessions.length} LIVE`
              : "OFFLINE"}
          </span>
        </div>

        <div className="p-4 sm:p-5">

          {liveLoading ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Checking live classrooms...
            </div>
          ) : liveSessions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mb-3 text-3xl">📡</div>

              <h3 className="font-semibold text-gray-800">
                No live class right now
              </h3>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Your teacher&apos;s live class will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">

              {liveSessions.map((session) => (
                <div
                  key={session._id}
                  className="rounded-xl border border-gray-200 p-4 transition hover:border-red-200 hover:shadow-md sm:p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600 sm:text-xs">
                      ● LIVE NOW
                    </span>

                    <span className="text-xs text-gray-400">
                      {session.subject}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                    {session.title}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-purple-700">
                    {session.subject}
                  </p>

                  {session.description && (
                    <p className="mt-2 line-clamp-3 text-xs text-gray-500 sm:text-sm">
                      {session.description}
                    </p>
                  )}

                  <Link
                    href={`/dashboard/student/live/${session._id}`}
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
                  >
                    Join Live Class →
                  </Link>
                </div>
              ))}

            </div>
          )}
        </div>
      </section>

      {/* RECORDED LECTURES */}
      <section className="space-y-5">

        {/* SECTION HEADER */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Recorded Lectures
          </h2>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Revisit your classroom lessons anytime.
          </p>
        </div>


{/* RESPONSIVE DATE NAVIGATOR */}
<div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">

{/* MOBILE DATE SELECTOR */}
<div className="sm:hidden space-y-2">

  <div className="grid grid-cols-[40px_1fr_40px] items-center gap-2">

    {/* PREVIOUS DAY */}
    <button
      type="button"
      onClick={() => setSelectedDate((d) => addDays(d, -1))}
      aria-label="Previous day"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-xl text-gray-700 active:bg-purple-50"
    >
      ‹
    </button>

    {/* DATE */}
    <div className="min-w-0 text-center">
      <p className="text-[10px] font-bold tracking-wider text-purple-600">
        {selectedDate === today ? "TODAY" : "SELECTED DATE"}
      </p>

      <p className="whitespace-nowrap text-sm font-bold text-gray-900">
        {parseLocalDate(selectedDate).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>

    {/* NEXT DAY */}
    <button
      type="button"
      onClick={() => setSelectedDate((d) => addDays(d, 1))}
      disabled={selectedDate >= today}
      aria-label="Next day"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-xl text-gray-700 active:bg-purple-50 disabled:opacity-30"
    >
      ›
    </button>

  </div>

{/* MOBILE DATE PICKER */}
<div className="space-y-2">

  <button
    type="button"
    onClick={openDatePicker}
    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 active:bg-purple-50"
  >
    <span>📅</span>
    <span>Choose date</span>
  </button>

  <input
    id="mobile-date-picker"
    type="date"
    value={selectedDate}
    max={today}
    onChange={(e) => {
      if (e.target.value) {
        setSelectedDate(e.target.value);
      }
    }}
    className="sr-only"
    tabIndex={-1}
  />

</div>

  {selectedDate !== today && (
    <button
      type="button"
      onClick={() => setSelectedDate(today)}
      className="w-full py-1 text-xs font-semibold text-purple-700"
    >
      Back to Today
    </button>
  )}

</div>

  {/* DESKTOP DATE NAVIGATOR */}
  <div className="hidden sm:block">

    <div className="mb-4 flex items-center justify-between gap-3">

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Selected week
        </p>

        <h3 className="text-lg font-bold text-gray-900">
          {formatMonth(selectedDate)}
        </h3>
      </div>

      <div className="flex items-center gap-2">

        <button
          type="button"
          onClick={() => changeWeek(-1)}
          aria-label="Previous week"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => setSelectedDate(today)}
          className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100"
        >
          Today
        </button>

        <button
          type="button"
          onClick={() => changeWeek(1)}
          aria-label="Next week"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
        >
          →
        </button>

      </div>
    </div>

    <div className="grid grid-cols-7 gap-2">

      {weekDates.map((date) => {
        const parsed = parseLocalDate(date);
        const isSelected = selectedDate === date;
        const isToday = date === today;

        return (
          <button
            key={date}
            type="button"
            onClick={() => selectDate(date)}
            className={`flex flex-col items-center rounded-xl border px-3 py-3 transition ${
              isSelected
                ? "border-purple-600 bg-purple-600 text-white shadow-md"
                : "border-gray-100 bg-gray-50 text-gray-700 hover:border-purple-200 hover:bg-purple-50"
            }`}
          >
            <span className={`text-xs font-medium uppercase ${
              isSelected ? "text-purple-100" : "text-gray-400"
            }`}>
              {parsed.toLocaleDateString("en-IN", {
                weekday: "short",
              })}
            </span>

            <span className="my-1 text-lg font-bold">
              {parsed.getDate()}
            </span>

            <span className={`text-[9px] font-semibold ${
              isSelected ? "text-purple-100" : "text-purple-600"
            }`}>
              {isToday ? "TODAY" : "\u00A0"}
            </span>
          </button>
        );
      })}

    </div>

    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">

      <p className="text-xs text-gray-500">
        {formatFullDate(selectedDate)}
      </p>

      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
        📅 Choose date

        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => {
            if (e.target.value) setSelectedDate(e.target.value);
          }}
          className="w-[115px] bg-transparent text-xs outline-none"
        />
      </label>

    </div>

  </div>
</div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SELECTED DATE HEADING */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900">
              {selectedDate === today ? "Today's Lectures" : "Lectures"}
            </h3>

            <p className="text-xs text-gray-500">
              {formatFullDate(selectedDate)}
            </p>
          </div>

          {!loading && (
            <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
              {lectures.length} {lectures.length === 1 ? "Lecture" : "Lectures"}
            </span>
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />

            <p className="text-sm text-gray-500">
              Loading recorded lectures...
            </p>
          </div>
        ) : lectures.length === 0 ? (

          /* EMPTY STATE */
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
            <div className="mb-3 text-3xl">🎥</div>

            <h3 className="font-semibold text-gray-800">
              No recorded lectures
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs text-gray-500 sm:text-sm">
              There are no recorded lectures for this date. Select another day to explore previous lessons.
            </p>

            {selectedDate !== today && (
              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Go to Today
              </button>
            )}
          </div>

        ) : (

          /* LECTURE CARDS */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">

            {lectures.map((lecture) => (
              <Link
                key={lecture._id}
                href={`/dashboard/student/daily-lectures/${lecture._id}`}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md sm:p-5"
              >
                <div className="mb-3 flex items-center justify-between gap-2">

                  <span className="max-w-[65%] truncate rounded-full bg-purple-50 px-3 py-1.5 text-[10px] font-semibold text-purple-700 sm:text-xs">
                    {lecture.subject}
                  </span>

                  <span className="shrink-0 text-[10px] text-gray-400 sm:text-xs">
                    {lecture.duration
                      ? `${lecture.duration} min`
                      : "Recorded"}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl">
                    ▶
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 font-bold text-gray-900 transition group-hover:text-purple-700">
                      {lecture.title}
                    </h3>

                    {lecture.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500 sm:text-sm">
                        {lecture.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs font-semibold text-purple-700">
                    Watch recording
                  </span>

                  <span className="text-purple-600 transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}