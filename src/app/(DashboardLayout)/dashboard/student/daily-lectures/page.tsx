"use client";

import { useEffect, useState } from "react";
import VideoCard from "../../components/learning/VideoCard";

interface Lecture {
  _id: string;
  date: string;
  subject: string;
  title: string;
  description?: string;
  duration?: number;
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateString: string) {
  return new Date(dateString + "T00:00:00").toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

export default function DailyLecturesPage() {
  const today = new Date();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLectures() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/learning-videos?type=daily&date=${selectedDate}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch lectures");
        }

        const data = await response.json();

        setLectures(data);
      } catch (error) {
        console.error(error);
        setLectures([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLectures();
  }, [selectedDate]);

  // Small quick-access dates around selected date
  const quickDates = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(selectedDate + "T00:00:00");

    date.setDate(date.getDate() - 2 + index);

    return date;
  });

  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-sm">
              🎓
            </span>

            <p className="text-sm font-semibold tracking-wide text-indigo-600">
              DAILY LEARNING
            </p>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Daily Lectures
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Learn something new every day.
          </p>
        </div>

        {/* DATE CONTROLS */}
        <div className="mb-7 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">

          <div className="flex items-center gap-2">

            {/* Previous Day */}
            <button
              onClick={() => {
                const date = new Date(
                  selectedDate + "T00:00:00"
                );

                date.setDate(date.getDate() - 1);

                setSelectedDate(formatDate(date));
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-black"
            >
              ←
            </button>

            {/* Compact Dates */}
            <div className="flex flex-1 gap-2 overflow-x-auto">

              {quickDates.map((date) => {
                const dateString = formatDate(date);
                const active = selectedDate === dateString;
                const isToday =
                  dateString === formatDate(today);

                return (
                  <button
                    key={dateString}
                    onClick={() =>
                      setSelectedDate(dateString)
                    }
                    className={`min-w-[68px] flex-1 rounded-xl px-2 py-2 transition ${
                      active
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-medium ${
                        active
                          ? "text-gray-400"
                          : "text-gray-400"
                      }`}
                    >
                      {isToday
                        ? "TODAY"
                        : date.toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "short",
                            }
                          )}
                    </p>

                    <p className="mt-0.5 text-lg font-bold">
                      {date.getDate()}
                    </p>

                    <p
                      className={`text-[10px] ${
                        active
                          ? "text-gray-400"
                          : "text-gray-400"
                      }`}
                    >
                      {date.toLocaleDateString(
                        "en-IN",
                        {
                          month: "short",
                        }
                      )}
                    </p>
                  </button>
                );
              })}

            </div>

            {/* Next Day */}
            <button
              onClick={() => {
                const date = new Date(
                  selectedDate + "T00:00:00"
                );

                date.setDate(date.getDate() + 1);

                setSelectedDate(formatDate(date));
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-black"
            >
              →
            </button>

            {/* Calendar */}
            <label className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100">

              <span className="text-lg">
                📅
              </span>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />

            </label>

          </div>
        </div>

        {/* SELECTED DATE */}
        <div className="mb-5 flex items-center justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Selected Day
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900 md:text-xl">
              {formatDisplayDate(selectedDate)}
            </h2>
          </div>

          {/* Back to Today */}
          {selectedDate !== formatDate(today) && (
            <button
              onClick={() =>
                setSelectedDate(formatDate(today))
              }
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Today
            </button>
          )}

        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2">

            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="h-6 w-20 rounded-lg bg-gray-200" />

                <div className="mt-5 h-6 w-3/4 rounded-lg bg-gray-200" />

                <div className="mt-3 h-4 w-full rounded-lg bg-gray-100" />

                <div className="mt-6 h-10 w-28 rounded-xl bg-gray-200" />
              </div>
            ))}

          </div>
        )}

        {/* LECTURES */}
        {!loading && lectures.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {lectures.map((lecture) => (
              <VideoCard
                key={lecture._id}
                href={`/dashboard/student/daily-lectures/${lecture._id}`}
                subject={lecture.subject}
                title={lecture.title}
                description={lecture.description}
                duration={lecture.duration}
                type="Lecture"
              />
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && lectures.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
              📚
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              No lecture on this day
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              There are no daily lectures available for{" "}
              {formatDisplayDate(selectedDate)}.
            </p>

            <button
              onClick={() =>
                setSelectedDate(formatDate(today))
              }
              className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Go to Today
            </button>

          </div>
        )}

      </div>
    </main>
  );
}