import Link from "next/link";
import VideoPlayer from "./VideoPlayer";

interface VideoPageProps {
  videoId: string;
  title: string;
  subject: string;
  description?: string;
  backLink: string;
  backText: string;
}

export default function VideoPage({
  videoId,
  title,
  subject,
  description,
  backLink,
  backText,
}: VideoPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">

        {/* Back button */}
        <Link
          href={backLink}
          className="
            group mb-7 inline-flex items-center gap-2
            rounded-xl
            border border-slate-200
            bg-white
            px-4 py-2.5
            text-sm font-medium
            text-slate-600
            shadow-sm
            transition-all
            hover:-translate-x-0.5
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-900
          "
        >
          <span className="text-lg transition-transform group-hover:-translate-x-0.5">
            ←
          </span>

          {backText}
        </Link>

        {/* Header */}
        <div className="mb-7">

          {/* Subject + type */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-blue-100
                bg-blue-50
                px-3.5 py-1.5
                text-xs font-bold
                uppercase tracking-wide
                text-blue-700
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

              {subject}
            </span>

            <span className="text-xs font-medium text-slate-400">
              Learning Video
            </span>
          </div>

          {/* Title */}
          <h1
            className="
              max-w-4xl
              text-2xl font-bold
              leading-tight tracking-tight
              text-slate-950
              sm:text-3xl
              lg:text-4xl
            "
          >
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p
              className="
                mt-3 max-w-3xl
                text-sm leading-6
                text-slate-500
                sm:text-base
              "
            >
              {description}
            </p>
          )}
        </div>

        {/* Video */}
        <VideoPlayer
          videoId={videoId}
          title={title}
        />

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">

          <button
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl
              border border-slate-200
              bg-white
              px-5 py-3
              text-sm font-semibold
              text-slate-700
              shadow-sm
              transition-all
              hover:border-slate-300
              hover:bg-slate-50
              hover:shadow-md
            "
          >
            <span className="text-emerald-600">✓</span>

            Mark as Completed
          </button>

          <button
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl
              bg-slate-950
              px-5 py-3
              text-sm font-semibold
              text-white
              shadow-lg shadow-slate-900/10
              transition-all
              hover:-translate-y-0.5
              hover:bg-slate-800
              hover:shadow-xl
            "
          >
            <span>📝</span>

            Practice Questions
          </button>

        </div>

        {/* Bottom information */}
        <div
          className="
            mt-8
            rounded-2xl
            border border-slate-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <div className="flex items-start gap-4">

            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl
                bg-blue-50
                text-lg
              "
            >
              🎓
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Keep learning
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Watch the complete lesson, practice what you learned,
                and continue to the next topic.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div
          className="
            mt-8 flex flex-col gap-2
            border-t border-slate-100
            pt-5
            text-xs text-slate-400
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <span>
            Innovative Academy
          </span>

          <span>
            Learn • Practice • Improve
          </span>
        </div>

      </div>
    </main>
  );
}