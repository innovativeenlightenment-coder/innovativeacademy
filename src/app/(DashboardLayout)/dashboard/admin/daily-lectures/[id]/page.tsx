
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import VideoPlayer from "@/app/(DashboardLayout)/dashboard/components/learning/VideoPlayer";

interface LearningVideo {
  _id: string;
  type: "daily" | "oneShot";
  date?: string;
  subject: string;
  chapter?: string;
  title: string;
  description?: string;
  duration?: number;
  youtubeVideoId?: string;
  isPublished?: boolean;
}

export default function DailyLectureDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const selectedDate = searchParams.get("date");

  const backUrl = selectedDate
    ? `/dashboard/admin/daily-lectures?date=${encodeURIComponent(selectedDate)}`
    : "/dashboard/admin/daily-lectures";

  const [lecture, setLecture] = useState<LearningVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchLecture() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/learning-videos/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Unable to load lecture."
          );
        }

        const item = data.lecture || data.data || data;

        if (item.type !== "daily") {
          throw new Error("This is not a daily recorded lecture.");
        }

        if (!cancelled) {
          setLecture(item);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load lecture."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchLecture();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <p className="text-sm text-gray-500">
          Loading lecture...
        </p>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
          !
        </div>

        <h1 className="text-xl font-bold text-gray-900">
          Lecture unavailable
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {error || "This lecture could not be found."}
        </p>

        <Link
          href={backUrl}
          className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          ← Back to Daily Lectures
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* BACK */}
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
        >
          ← Back to Daily Lectures
        </Link>

        {/* LECTURE DETAILS */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              {lecture.subject}
            </span>

            {lecture.chapter && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {lecture.chapter}
              </span>
            )}

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                lecture.isPublished
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {lecture.isPublished ? "Published" : "Draft"}
            </span>
          </div>

          <h1 className="mt-4 text-md font-bold tracking-tight text-gray-900 sm:text-lg">
            {lecture.title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            {lecture.date && (
              <span>
                {new Date(lecture.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}

            {lecture.duration ? (
              <span>{lecture.duration} minutes</span>
            ) : null}
          </div>

          {lecture.description && (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600">
              {lecture.description}
            </p>
          )}
        </section>

        {/* VIDEO PLAYER */}
        {lecture.youtubeVideoId ? (
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm">
            <VideoPlayer
              videoId={lecture.youtubeVideoId}
              title={lecture.title}
            />
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
            <div className="text-3xl">🎬</div>

            <h2 className="mt-3 font-semibold text-amber-900">
              Recording not uploaded yet
            </h2>

            <p className="mt-2 text-sm text-amber-800">
              This lecture has been added, but its recording is not available yet.
              Please check again later.
            </p>
          </section>
        )}

      </div>
    </main>
  );
}
