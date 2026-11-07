
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LiveRoom from "../../../components/learning/LiveRoom";

interface LiveSessionInfo {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  roomName: string;
  startedAt?: string;
}

export default function StudentLivePage() {
  const params = useParams<{ lectureId: string }>();
  const sessionId = params.lectureId;
  const router = useRouter();

  const [session, setSession] = useState<LiveSessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/Live-Class/status", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || data.error || "Unable to check live class."
          );
        }

        // Updated API supports multiple simultaneous live sessions.
        const sessions: LiveSessionInfo[] = Array.isArray(data.sessions)
          ? data.sessions
          : [];

        // Find the exact session requested by this student.
        const currentSession = sessions.find(
          (item) => String(item._id) === String(sessionId)
        );

        if (!currentSession) {
          throw new Error(
            "This live class is no longer available, or you are not authorized to join it."
          );
        }

        if (!cancelled) {
          setSession(currentSession);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to open live class."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (sessionId) {
      checkSession();
    }

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <p className="text-sm text-gray-500">
          Checking live classroom...
        </p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          Live class unavailable
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {error || "This live class is not available."}
        </p>

        <Link
          href="/dashboard/student/daily-lectures"
          className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to Daily Lectures
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-3 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
            LIVE CLASS
          </div>

          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
            {session.title}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {session.subject}
          </p>

          {session.description && (
            <p className="mt-1 text-sm text-gray-500">
              {session.description}
            </p>
          )}
        </div>

        <Link
          href="/dashboard/student/daily-lectures"
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
        >
          Leave Classroom
        </Link>
      </div>

      <LiveRoom
        sessionId={session._id}
        isTeacher={false}
        onLeave={() =>
          router.push("/dashboard/student/daily-lectures")
        }
      />
    </div>
  );
}
