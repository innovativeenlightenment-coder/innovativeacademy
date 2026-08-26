"use client";

import { useEffect, useState } from "react";
import VideoCard from "../../components/learning/VideoCard";

interface OneShot {
  _id: string;
  subject: string;
  chapter: string;
  title: string;
  description?: string;
  duration?: number;
}

const subjects = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
];

export default function OneShotsPage() {
  const [videos, setVideos] = useState<OneShot[]>([]);
  const [selectedSubject, setSelectedSubject] =
    useState("Physics");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOneShots() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/learning-videos?type=oneShot&subject=${encodeURIComponent(
            selectedSubject
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch one-shots");
        }

        const data = await response.json();

        setVideos(data);
      } catch (error) {
        console.error(error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOneShots();
  }, [selectedSubject]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ================= HEADER ================= */}

        <div className="relative mb-9 overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-sm sm:px-8">

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative">

            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Quick Revision
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  One-Shots
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Complete chapter revision in one focused video.
                  Learn faster, revise smarter.
                </p>
              </div>

              {/* Small visual badge */}
              <div className="hidden shrink-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm text-white shadow-sm">
                    ⚡
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Fast Revision
                    </p>

                    <p className="text-[11px] text-slate-500">
                      One chapter · One video
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ================= SUBJECT SELECTOR ================= */}

        <section className="mb-9">

          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Choose a subject
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Select a subject to explore its one-shots
              </p>
            </div>

            {!loading && videos.length > 0 && (
              <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm sm:block">
                {videos.length}{" "}
                {videos.length === 1 ? "video" : "videos"}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-2.5 shadow-sm">

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">

              {subjects.map((subject) => {
                const active =
                  selectedSubject === subject;

                return (
                  <button
                    key={subject}
                    onClick={() =>
                      setSelectedSubject(subject)
                    }
                    className={`relative flex-1 whitespace-nowrap rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {subject}

                    {/* Active indicator */}
                    {active && (
                      <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-400" />
                    )}
                  </button>
                );
              })}

            </div>
          </div>
        </section>

        {/* ================= CURRENT SUBJECT ================= */}

        <div className="mb-6 flex items-end justify-between gap-4">

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Selected Subject
            </p>

            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {selectedSubject}
            </h2>
          </div>

          {!loading && videos.length > 0 && (
            <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
              {videos.length}{" "}
              {videos.length === 1 ? "one-shot" : "one-shots"}
            </div>
          )}

        </div>

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-center justify-between">
                  <div className="h-7 w-24 animate-pulse rounded-full bg-slate-100" />

                  <div className="h-4 w-14 animate-pulse rounded bg-slate-100" />
                </div>

                <div className="mt-5 h-6 w-3/4 animate-pulse rounded-lg bg-slate-100" />

                <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />

                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-100" />

                <div className="mt-6 h-10 w-32 animate-pulse rounded-xl bg-slate-100" />

              </div>
            ))}

          </div>
        )}

        {/* ================= VIDEOS ================= */}

        {!loading && videos.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">

            {videos.map((video) => (
              <VideoCard
                key={video._id}
                href={`/dashboard/student/one-shots/${video._id}`}
                subject={video.chapter}
                title={video.title}
                description={video.description}
                duration={video.duration}
                type="One-Shot"
              />
            ))}

          </div>
        )}

        {/* ================= EMPTY STATE ================= */}

        {!loading && videos.length === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-72 -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl shadow-inner">
              ⚡
            </div>

            <h3 className="relative mt-5 text-lg font-bold text-slate-900">
              No one-shots available
            </h3>

            <p className="relative mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              One-shots for{" "}
              <span className="font-semibold text-slate-700">
                {selectedSubject}
              </span>{" "}
              will appear here when they are available.
            </p>

            <p className="relative mt-3 text-xs text-slate-400">
              Try another subject.
            </p>

          </div>
        )}

      </div>
    </main>
  );
}