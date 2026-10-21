import Link from "next/link";
import VideoPlayer from "../../../components/learning/VideoPlayer";

interface Lecture {
  type: string;
  _id: string;
  subject: string;
  title: string;
  description?: string;
  duration?: number;
  youtubeVideoId: string;
  date: string;
}

async function getLecture(
  id: string
): Promise<Lecture | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/learning-videos/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function DailyLecturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lecture = await getLecture(id);

  if (!lecture || lecture.type !== "daily") {
    return (
      <main className="min-h-[70vh] px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
            📚
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Lecture not found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            This lecture may have been removed or is no longer available.
          </p>

          <Link
            href="/dashboard/student/daily-lectures"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            ← Back to Daily Lectures
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Back navigation */}
        <Link
          href="/dashboard/student/daily-lectures"
          className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <span className="transition-transform group-hover:-translate-x-1">
            ←
          </span>
          Daily Lectures
        </Link>

        {/* Main content */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)]">

          {/* Header */}
          <div className="p-5 sm:p-7 lg:p-8">

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                {lecture.subject}
              </span>

              <span className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-600">
                Daily Lecture
              </span>

              {lecture.duration && (
                <span className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-600">
                  ⏱ {lecture.duration} min
                </span>
              )}
            </div>

            <h1 className="mt-5 max-w-4xl text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
              {lecture.title}
            </h1>

            {lecture.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500 sm:text-base">
                {lecture.description}
              </p>
            )}
          </div>

          {/* Video */}
          <div className="border-t border-gray-100 bg-gray-50 p-3 sm:p-5 lg:p-6">
            <VideoPlayer
              videoId={lecture.youtubeVideoId}
              title={lecture.title}
            />
          </div>

          {/* Bottom information */}
          <div className="flex flex-col gap-4 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Keep learning
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                Watch the lecture carefully and build your understanding.
              </p>
            </div>

            <Link
              href="/dashboard/student/daily-lectures"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              More Lectures →
            </Link>

          </div>
        </div>
      </div>
    </main>
  );
}