
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import VideoPlayer from "../../../components/learning/VideoPlayer";

interface LearningVideo {
  _id: string;
  type: "daily" | "oneShot";
  date?: string;
  subject: string;
  title: string;
  description?: string;
  duration?: number;
  youtubeVideoId?: string;
}

export default function DailyLectureDetailPage() {
  const params = useParams();
  const id = params.id as string;

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
          throw new Error(data.message || "Unable to load lecture.");
        }

        const item = data.lecture || data;

        if (item.type !== "daily") {
          throw new Error("This is not a daily recorded lecture.");
        }

        if (!cancelled) setLecture(item);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load lecture."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) fetchLecture();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <p className="text-sm text-gray-500">Loading lecture...</p>
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          Lecture unavailable
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {error || "This lecture could not be found."}
        </p>
        <Link
          href="/dashboard/student/daily-lectures"
          className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
        >
          Back to Daily Lectures
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <Link
        href="/dashboard/student/daily-lectures"
        className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
      >
        ← Back to Daily Lectures
      </Link>

      <div>
        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
          {lecture.subject}
        </span>

        <h1 className="mt-3 text-2xl font-bold text-gray-900 md:text-3xl">
          {lecture.title}
        </h1>

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
          {lecture.date && (
            <span>
              {new Date(lecture.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
          {lecture.duration && <span>{lecture.duration} minutes</span>}
        </div>

        {lecture.description && (
          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600">
            {lecture.description}
          </p>
        )}
      </div>

      {lecture.youtubeVideoId ? (
        <div className="overflow-hidden rounded-2xl bg-black shadow-sm">
          <VideoPlayer
            videoId={lecture.youtubeVideoId}
            title={lecture.title}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
          <h2 className="font-semibold text-amber-900">
            Recording not uploaded yet
          </h2>
          <p className="mt-2 text-sm text-amber-800">
            The lecture has been added, but its recording is not available yet.
            Please check again later.
          </p>
        </div>
      )}
    </div>
  );
}
