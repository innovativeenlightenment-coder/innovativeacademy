
"use client";

import { useEffect, useState } from "react";
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

export default function DailyLecturesPage() {
  const [selectedDate, setSelectedDate] = useState(
    localDateString(new Date())
  );

  const [lectures, setLectures] = useState<LearningVideo[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSessionInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch date-wise recorded lectures
  async function fetchLectures(date: string) {
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

      // Only show recorded lectures here.
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
  }

  // Fetch all live classes available to this student
  async function fetchLiveStatus() {
    try {
      const response = await fetch("/api/Live-Class/status", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to check live classes."
        );
      }

      // The status API now returns sessions[], not a single session.
      setLiveSessions(
        Array.isArray(data.sessions) ? data.sessions : []
      );
    } catch (err) {
      console.error("LIVE STATUS ERROR:", err);
      setLiveSessions([]);
    } finally {
      setLiveLoading(false);
    }
  }

  // Fetch recorded lectures whenever the date changes.
  useEffect(() => {
    fetchLectures(selectedDate);
  }, [selectedDate]);

  // Fetch live classes and refresh every 15 seconds.
  useEffect(() => {
    fetchLiveStatus();

    const interval = window.setInterval(() => {
      fetchLiveStatus();
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-7 p-4 md:p-8">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Daily Lectures
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Join live classrooms and watch your recorded lectures.
        </p>
      </div>

      {/* Live classrooms */}
      <section className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">

        {/* Live header */}
        <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-5 py-4">
          <div>
            <h2 className="font-bold text-gray-900">
              Live Classrooms
            </h2>

            <p className="text-sm text-gray-600">
              Join a classroom currently running at Innovative Academy.
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
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

        {/* Live session list */}
        <div className="space-y-4 p-5">

          {liveLoading ? (
            <div className="py-6 text-center text-sm text-gray-500">
              Checking live classrooms...
            </div>
          ) : liveSessions.length === 0 ? (
            <div className="py-6 text-center">
              <div className="mb-2 text-3xl">📡</div>

              <h3 className="font-semibold text-gray-800">
                No live class right now
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                When your teacher starts a class, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {liveSessions.map((session) => (
                <div
                  key={session._id}
                  className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-red-200 hover:shadow-md"
                >
                  {/* Session status */}
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                      ● LIVE NOW
                    </span>

                    <span className="text-xs text-gray-400">
                      {session.subject}
                    </span>
                  </div>

                  {/* Session details */}
                  <h3 className="text-lg font-bold text-gray-900">
                    {session.title}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-purple-700">
                    {session.subject}
                  </p>

                  {session.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                      {session.description}
                    </p>
                  )}

                  {/* Join button */}
                  <Link
                    href={`/dashboard/student/live/${session._id}`}
                    className="mt-5 flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Join Live Class →
                  </Link>
                </div>
              ))}

            </div>
          )}
        </div>
      </section>

      {/* Date-wise recorded lectures */}
      <section className="space-y-5">

        {/* Recorded lecture heading and date selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Recorded Lectures
            </h2>

            <p className="text-sm text-gray-500">
              Select a date to see its recorded lectures.
            </p>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-purple-500"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading recorded lectures...
          </div>
        ) : lectures.length === 0 ? (

          /* Empty state */
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center">
            <h3 className="font-semibold text-gray-800">
              No recorded lectures for this date
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Choose another date or check again when the recording is uploaded.
            </p>
          </div>

        ) : (

          /* Recorded lecture cards */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.map((lecture) => (
              <Link
                key={lecture._id}
                href={`/dashboard/student/daily-lectures/${lecture._id}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    {lecture.subject}
                  </span>

                  <span className="text-xs text-gray-400">
                    {lecture.duration
                      ? `${lecture.duration} min`
                      : "Recorded"}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 group-hover:text-purple-700">
                  {lecture.title}
                </h3>

                {lecture.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {lecture.description}
                  </p>
                )}

                <p className="mt-4 text-sm font-semibold text-purple-700">
                  Watch recording →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
