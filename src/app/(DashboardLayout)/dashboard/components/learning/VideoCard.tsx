import Link from "next/link";

interface VideoCardProps {
  href: string;
  subject: string;
  title: string;
  description?: string;
  duration?: number;
  type: "Lecture" | "One-Shot";
}

export default function VideoCard({
  href,
  subject,
  title,
  description,
  duration,
  type,
}: VideoCardProps) {
  return (
    <div
      className="
        group relative overflow-hidden
        rounded-2xl border border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1
        hover:border-slate-300
        hover:shadow-xl hover:shadow-slate-200/60
      "
    >
      {/* Top accent */}
      <div
        className="
          absolute left-0 right-0 top-0
          h-1
          bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="
            inline-flex items-center gap-2
            rounded-full
            border border-blue-100
            bg-blue-50
            px-3 py-1.5
            text-xs font-bold
            text-blue-700
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          {subject}
        </span>

        {duration !== undefined && (
          <span
            className="
              rounded-lg
              bg-slate-50
              px-2.5 py-1
              text-xs font-medium
              text-slate-500
            "
          >
            {duration} min
          </span>
        )}
      </div>

      {/* Type */}
      <div className="mt-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {type}
        </span>
      </div>

      {/* Title */}
      <h3
        className="
          mt-1.5
          line-clamp-2
          text-lg font-bold leading-7
          text-slate-900
          transition-colors
          group-hover:text-blue-700
        "
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="
            mt-2
            line-clamp-2
            text-sm leading-6
            text-slate-500
          "
        >
          {description}
        </p>
      )}

      {/* Bottom */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <Link
          href={href}
          className="
            inline-flex items-center gap-2
            rounded-xl
            bg-slate-950
            px-4 py-2.5
            text-sm font-semibold
            text-white
            shadow-sm
            transition-all duration-200
            hover:-translate-y-0.5
            hover:bg-slate-800
            hover:shadow-md
          "
        >
          Watch {type}

          <span
            className="
              text-base
              transition-transform duration-200
              group-hover:translate-x-0.5
            "
          >
            →
          </span>
        </Link>

        <span className="text-xs font-medium text-slate-400">
          Start learning
        </span>
      </div>
    </div>
  );
}