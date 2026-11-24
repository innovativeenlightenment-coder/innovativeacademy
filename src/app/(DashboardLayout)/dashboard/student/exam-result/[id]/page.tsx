"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Image as ImageIcon,
  Loader2,
  Target,
  Trophy,
  X,
  XCircle,
  CircleDashed,
} from "lucide-react";
import { toPng } from "html-to-image";

/* =========================================================
   TYPES
========================================================= */

type AnalysisItem = {
  name: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  partiallyCorrect: number;
  pending: number;
  marksAwarded: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
};

type SkillItem = {
  skillId: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  partiallyCorrect: number;
  pending: number;
  marksAwarded: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
  masteryScore?: number;
  masteryStatus?: string;
};

type QuestionReview = {
  questionId: string;
  questionVersion: number;
  order: number;
  subject: string;
  chapter: string;
  marks: number;
  marksAwarded: number;
  status: string;
  question: any;
  studentResponse: any;
  correctAnswer: any;
  explanation: any;
  feedback: string;
  skills: string[];
  stepResults: any[];
  partResults?: any[];
};

type ResultData = {
  success: boolean;
  error?: string;
  resultPending?: boolean;

  exam: {
    _id: string;
    title: string;
    testType: string;
    course: string;
    subject: string;
    chapters: string[];
    totalQuestions: number;
    totalMarks: number;
    allowedSeconds: number;
  };

  record: {
    _id: string;
    name: string;
    email: string;
    score: number;
    percentage: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    partiallyCorrect: number;
    pending: number;
    duration: number;
    timeLeft: number;
    submittedAt: string;
    evaluationStatus: string;
    resultStatus: string;
  };

  analytics: {
    rank: number;
    percentile: number;
    totalStudents: number;
    accuracy: number;
    speed: number;
    correctCount: number;
    incorrectCount: number;
    skippedCount: number;
    partiallyCorrectCount: number;
    pendingCount: number;
  };

  subjectAnalysis: AnalysisItem[];
  chapterAnalysis: AnalysisItem[];
  skillAnalysis: SkillItem[];

  strongestSubject: string | null;
  weakestSubject: string | null;
  strongestChapter: string | null;
  weakestChapter: string | null;

  marksLost: {
    wrong: number;
    skipped: number;
    total: number;
  };

  topperList: {
    _id: string;
    name: string;
    score: number;
    percentage: number;
  }[];

  questionReview: QuestionReview[];
};

/* =========================================================
   CONSTANTS
========================================================= */

const COLORS = [
  "#6D28D9",
  "#0891B2",
  "#16A34A",
  "#D97706",
  "#DB2777",
  "#2563EB",
  "#7C3AED",
  "#0D9488",
  "#64748B",
  "#EA580C",
];

const STATUS: Record<string, string> = {
  correct: "Correct",
  incorrect: "Incorrect",
  partially_correct: "Partially correct",
  skipped: "Skipped",
  pending: "Pending",
};

const STATUS_CLASS: Record<string, string> = {
  correct: "bg-green-50 text-green-700 ring-green-200",
  incorrect: "bg-red-50 text-red-700 ring-red-200",
  partially_correct: "bg-orange-50 text-orange-700 ring-orange-200",
  skipped: "bg-slate-100 text-slate-600 ring-slate-200",
  pending: "bg-purple-50 text-purple-700 ring-purple-200",
};

/* =========================================================
   HELPERS
========================================================= */

const number = (value: any): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const percent = (value: any): string =>
  `${number(value).toFixed(1)}%`;

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(number(seconds)));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;

  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
};

const formatDate = (date: string) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatSkill = (value: string) => {
  const labels: Record<string, string> = {
    recall: "Recall",
    conceptual_understanding: "Conceptual understanding",
    comparison: "Comparison",
    formula_application: "Formula application",
    calculation: "Calculation",
    problem_solving: "Problem solving",
    logical_reasoning: "Logical reasoning",
    analytical_thinking: "Analytical thinking",
    error_identification: "Error identification",
    data_interpretation: "Data interpretation",
    scientific_investigation: "Scientific investigation",
  };

  return (
    labels[value] ||
    value.replace(/_/g, " ").replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
  );
};

/* Normalize API status values into one consistent format. */

const normalizeStatus = (value: any): string => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

const getStatusLabel = (value: any): string => {
  const normalized = normalizeStatus(value);
  return STATUS[normalized] || String(value || "Unavailable");
};

const getStatusClass = (value: any): string => {
  const normalized = normalizeStatus(value);

  return (
    STATUS_CLASS[normalized] ||
    "bg-slate-100 text-slate-600 ring-slate-200"
  );
};

/* Supports both boolean and string-based evaluation results. */

const getEvaluationStatus = (item: any) => {
  if (item?.isCorrect === true) {
    return {
      label: "Correct",
      className: "bg-green-100 text-green-700",
    };
  }

  if (item?.isCorrect === false) {
    return {
      label: "Incorrect",
      className: "bg-red-100 text-red-700",
    };
  }

  const outcome = normalizeStatus(
    item?.outcome ??
      item?.status ??
      item?.result ??
      ""
  );

  if (
    ["correct", "fully_correct", "right"].includes(outcome)
  ) {
    return {
      label: "Correct",
      className: "bg-green-100 text-green-700",
    };
  }

  if (
    ["incorrect", "wrong", "fully_incorrect"].includes(outcome)
  ) {
    return {
      label: "Incorrect",
      className: "bg-red-100 text-red-700",
    };
  }

  if (
    ["skipped", "unanswered", "not_attempted"].includes(outcome)
  ) {
    return {
      label: "Skipped",
      className: "bg-slate-100 text-slate-600",
    };
  }

  if (outcome === "pending") {
    return {
      label: "Pending",
      className: "bg-purple-100 text-purple-700",
    };
  }

  return {
    label: "Partially correct",
    className: "bg-orange-100 text-orange-700",
  };
};

/* =========================================================
   BASIC COMPONENTS
========================================================= */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

function Heading({
  title,
  subtitle,
  color = "purple",
}: {
  title: string;
  subtitle?: string;
  color?: string;
}) {
  const colorStyles: Record<string, string> = {
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    pink: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="mb-4 flex items-start gap-3">
      <span
        className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
          colorStyles[color] || colorStyles.purple
        }`}
      />

      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  const styles: Record<string, string> = {
    green: "border-green-200 bg-green-50 text-green-700",
    red: "border-red-200 bg-red-50 text-red-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500">
          {title}
        </span>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
            styles[color] || styles.purple
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-2 text-2xl font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Progress({
  value,
  color = "#6D28D9",
}: {
  value: number;
  color?: string;
}) {
  const safe = Math.max(0, Math.min(100, number(value)));

  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${safe}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* =========================================================
   LINEAR ANSWER DISTRIBUTION
========================================================= */

function LinearDistribution({
  title,
  data,
  total,
}: {
  title: string;
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  total: number;
}) {
  const safeTotal = Math.max(0, number(total));

  const countedTotal = data.reduce(
    (sum, item) => sum + Math.max(0, number(item.value)),
    0
  );

  /*
    Using the larger number prevents segments from overflowing
    when API counts are slightly different from total questions.
  */
  const denominator = Math.max(safeTotal, countedTotal);

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-slate-800">
          {title}
        </h3>

        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {safeTotal} Questions
        </span>
      </div>

      {denominator === 0 ? (
        <p className="text-sm text-slate-500">
          No answer data available.
        </p>
      ) : (
        <>
          {/* Exactly ONE segmented progress bar */}

          <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-100">
            {data.map((item) => {
              const value = Math.max(0, number(item.value));

              if (value === 0) return null;

              const width = (value / denominator) * 100;

              return (
                <div
                  key={item.name}
                  title={`${item.name}: ${value}`}
                  className="h-full shrink-0 transition-all duration-500"
                  style={{
                    width: `${width}%`,
                    backgroundColor: item.color,
                  }}
                />
              );
            })}
          </div>

          {/* Legend only — no additional progress bars */}

          <div className="mt-5 flex gap-5 flex-wrap">
            {data.map((item) => {
              const value = Math.max(0, number(item.value));

              const percentage =
                denominator > 0
                  ? (value / denominator) * 100
                  : 0;

              return (
                <div key={item.name} className="flex items-start gap-1.5">
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-slate-500">
                      {item.name}
                    </p>

                    {/* <p className="mt-0.5 text-[10px] font-black text-slate-800">
                      {value}
                      <span className="ml-1 text-[10px] font-medium text-slate-400">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </p> */}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   DONUT CHART
========================================================= */

function DonutChart({
  title,
  data,
  centerValue,
  centerLabel,
}: {
  title: string;
  data: { name: string; value: number }[];
  centerValue?: string;
  centerLabel?: string;
}) {
  const filtered = data.filter((item) => number(item.value) > 0);

  if (!filtered.length) return null;

  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3 sm:p-4">
      <h3 className="mb-2 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <div className="relative h-[230px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="82%"
              paddingAngle={3}
              stroke="white"
              strokeWidth={2}
            >
              {filtered.map((item, index) => (
                <Cell
                  key={`${item.name}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: any, name: any) => [
                value,
                name,
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                fontSize: "12px",
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={48}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: "11px",
                lineHeight: "18px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {centerValue && (
          <div className="pointer-events-none absolute inset-x-0 top-[34%] flex flex-col items-center">
            <span className="text-2xl font-black text-slate-900">
              {centerValue}
            </span>

            {centerLabel && (
              <span className="text-[10px] font-semibold text-slate-400">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CONTENT RENDERER
========================================================= */

function Content({
  value,
  onImageClick,
}: {
  value: any;
  onImageClick: (url: string) => void;
}) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return (
      <span className="text-sm italic text-slate-400">
        No response available
      </span>
    );
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return (
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
        {String(value)}
      </p>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <Content
            key={index}
            value={item}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    if (value.type === "image" && value.url) {
      return (
        <button
          type="button"
          onClick={() => onImageClick(value.url)}
          className="group block max-w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 text-left transition hover:border-purple-300"
        >
          <img
            src={value.url}
            alt="Question image"
            loading="lazy"
            className="max-h-56 max-w-full rounded-lg object-contain sm:max-h-72"
          />

          <span className="flex items-center gap-1.5 px-2 py-2 text-xs font-semibold text-purple-700">
            <ImageIcon size={14} />
            View full image
          </span>
        </button>
      );
    }

    if (value.type === "video" && value.url) {
      return (
        <a
          href={value.url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-purple-700 underline"
        >
          Open video
        </a>
      );
    }

    const text =
      value.value ??
      value.text ??
      value.label ??
      "";

    if (text) {
      return (
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
          {String(text)}
        </p>
      );
    }
  }

  return null;
}

/* =========================================================
   QUESTION REVIEW
========================================================= */

function QuestionReviewCard({
  question,
  expanded,
  onToggle,
  onImageClick,
}: {
  question: QuestionReview;
  expanded: boolean;
  onToggle: () => void;
  onImageClick: (url: string) => void;
}) {
  const status = getStatusLabel(question.status);
  const statusClass = getStatusClass(question.status);

  return (
    <article
      className={`overflow-hidden rounded-xl border transition ${
        expanded
          ? "border-purple-200 bg-white shadow-sm"
          : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-purple-50/40 sm:p-4"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-black text-purple-700">
          {question.order}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-900">
            Question {question.order}
          </span>

          <span className="mt-0.5 block truncate text-xs text-slate-500">
            {[question.subject, question.chapter]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>

        <span
          className={`hidden rounded-full px-2.5 py-1 text-xs font-bold ring-1 sm:inline-flex ${statusClass}`}
        >
          {status}
        </span>

        <span className="shrink-0 text-sm font-black text-slate-800">
          {question.marksAwarded}/{question.marks}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-500 transition ${
            expanded ? "rotate-180 text-purple-700" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-slate-100 bg-white p-3.5 sm:p-5">
          {/* Mobile status */}

          <div className="sm:hidden">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusClass}`}
            >
              {status}
            </span>
          </div>

          {/* QUESTION */}

          <div>
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-purple-600">
              Question
            </p>

            <Content
              value={question.question?.prompt}
              onImageClick={onImageClick}
            />
          </div>

          {/* ANSWERS */}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
                Your answer
              </p>

              <Content
                value={question.studentResponse}
                onImageClick={onImageClick}
              />
            </div>

            <div className="min-w-0 rounded-xl border border-green-200 bg-green-50/60 p-3.5">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-green-700">
                Expected answer
              </p>

              <Content
                value={question.correctAnswer}
                onImageClick={onImageClick}
              />
            </div>
          </div>

          {/* FEEDBACK */}

          {question.feedback && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3.5">
              <p className="mb-1 text-xs font-bold text-indigo-800">
                Feedback
              </p>

              <p className="whitespace-pre-wrap text-sm leading-6 text-indigo-800">
                {question.feedback}
              </p>
            </div>
          )}

          {/* EXPLANATION */}

          {question.explanation && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                Explanation
              </p>

              <Content
                value={question.explanation}
                onImageClick={onImageClick}
              />
            </div>
          )}

          {/* STEP EVALUATION */}

          {!!question.stepResults?.length && (
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Step evaluation
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {question.stepResults.map((step: any, index) => {
                  const evaluation = getEvaluationStatus(step);

                  return (
                    <div
                      key={step.stepId || index}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                    >
                      <span className="text-sm text-slate-700">
                        {step.title || `Step ${index + 1}`}
                      </span>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${evaluation.className}`}
                      >
                        {evaluation.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PART EVALUATION */}

          {!!question.partResults?.length && (
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Part evaluation
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {question.partResults.map((part: any, index) => {
                  const evaluation = getEvaluationStatus(part);

                  return (
                    <div
                      key={part.partId || index}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                    >
                      <span className="text-sm text-slate-700">
                        {part.title || `Part ${index + 1}`}
                      </span>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${evaluation.className}`}
                      >
                        {evaluation.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SKILLS */}

          {!!question.skills?.length && (
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Skills assessed
              </p>

              <div className="flex flex-wrap gap-2">
                {question.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700"
                  >
                    {formatSkill(skill)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ExamResultPage() {
  const params = useParams();
  const id = params.id as string;

  const reportRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  /* -------------------------------------------------------
     LOAD RESULT
  ------------------------------------------------------- */

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/Exam-Result-Details?examId=${encodeURIComponent(id)}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Unable to load your result."
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* -------------------------------------------------------
     IMAGE DIALOG
  ------------------------------------------------------- */

  useEffect(() => {
    if (!imageUrl) return;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setImageUrl("");
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [imageUrl]);

  /* -------------------------------------------------------
     DOWNLOAD REPORT
  ------------------------------------------------------- */

  const downloadReport = async () => {
    if (!reportRef.current || downloading) return;

    try {
      setDownloading(true);

      const image = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: "#F6F7FB",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = "Innovative-Academy-Result.png";
      link.href = image;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Could not download the report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  /* -------------------------------------------------------
     LOADING / ERROR
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-purple-700"
          />

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading result...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <XCircle
            size={42}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-3 text-xl font-black text-slate-900">
            Result unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Unable to find this result."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     DERIVED ANALYSIS
  ========================================================= */

  const {
    exam,
    record,
    analytics,
    subjectAnalysis = [],
    chapterAnalysis = [],
    skillAnalysis = [],
    marksLost,
    topperList = [],
    questionReview = [],
  } = data;

  const scorePercentage = Math.max(
    0,
    Math.min(100, number(record.percentage))
  );

  const skillDonutData = skillAnalysis
    .filter((skill) => number(skill.total) > 0)
    .map((skill) => ({
      name: formatSkill(skill.skillId),
      value: number(skill.total),
    }));

  const skillsWithEvidence = skillAnalysis.filter(
    (skill) => number(skill.total) > 0
  );

  const weakestSkill = [...skillsWithEvidence].sort(
    (a, b) =>
      number(a.accuracy ?? a.percentage) -
      number(b.accuracy ?? b.percentage)
  )[0];

  const chaptersWithEvidence = chapterAnalysis.filter(
    (chapter) => number(chapter.total) > 0
  );

  const weakestChapter = [...chaptersWithEvidence].sort(
    (a, b) => number(a.percentage) - number(b.percentage)
  )[0];

  const answerDistributionData = [
    {
      name: "Correct",
      value: number(record.correct),
      color: "#16A34A",
    },
    {
      name: "Incorrect",
      value: number(record.incorrect),
      color: "#DC2626",
    },
    {
      name: "Partially correct",
      value: number(record.partiallyCorrect),
      color: "#D97706",
    },
    {
      name: "Skipped",
      value: number(record.unanswered),
      color: "#64748B",
    },
    {
      name: "Pending",
      value: number(record.pending),
      color: "#7C3AED",
    },
  ];

  const subjectDonutData = subjectAnalysis
    .filter((item) => number(item.total) > 0)
    .map((item) => ({
      name: item.name,
      value: number(item.percentage),
    }));

  const chapterDonutData = chapterAnalysis
    .filter((item) => number(item.total) > 0)
    .map((item) => ({
      name: item.name,
      value: number(item.percentage),
    }));

  /* -------------------------------------------------------
     IMPROVEMENT PLAN
  ------------------------------------------------------- */

  const improvementActions: string[] = [];

  if (weakestSkill) {
    improvementActions.push(
      `Focus on ${formatSkill(
        weakestSkill.skillId
      )}. Review its underlying concept and solve five fresh questions independently.`
    );
  }

  if (weakestChapter) {
    improvementActions.push(
      `Revisit ${weakestChapter.name}. Identify the specific question or concept that caused difficulty before revising the entire chapter.`
    );
  }

  if (number(record.incorrect) > 0) {
    improvementActions.push(
      `Retry ${record.incorrect} incorrect questions without looking at the solutions first. Then identify the mistake in your original approach.`
    );
  }

  if (number(record.unanswered) > 0) {
    improvementActions.push(
      `Attempt ${record.unanswered} skipped questions. Practise identifying the given information and required result before solving.`
    );
  }

  if (number(record.partiallyCorrect) > 0) {
    improvementActions.push(
      `Improve ${record.partiallyCorrect} partially correct answers by checking missing steps, formulas, units and final statements.`
    );
  }

  if (improvementActions.length === 0) {
    improvementActions.push(
      "No major weakness was identified. Attempt a fresh mixed question set without notes after a short revision break to check retention."
    );
  }

  const priorityTitle = weakestSkill
    ? formatSkill(weakestSkill.skillId)
    : weakestChapter
    ? weakestChapter.name
    : "Maintain your progress";

  const priorityDescription = weakestSkill
    ? `Your lowest-scoring skill in this exam. Accuracy: ${percent(
        weakestSkill.accuracy ?? weakestSkill.percentage
      )}.`
    : weakestChapter
    ? "Your lowest-performing chapter in this exam."
    : "No clear weak area was identified from the available evidence.";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="relative min-h-screen bg-[#F1F3F9] px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <header className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-purple-700">
              Innovative Academy
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Exam result
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Performance report and learning analysis
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={downloadReport}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-800 disabled:opacity-60"
            >
              {downloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}

              {downloading ? "Preparing..." : "Download"}
            </button>
          </div>
        </header>

        <div
          ref={reportRef}
          className="grid grid-cols-1 items-start gap-4 rounded-2xl bg-[#F1F3F9] lg:grid-cols-2"
        >

          {/* SCORE - FULL WIDTH */}

          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5420A8] via-[#6D28D9] to-[#4338CA] p-5 text-white shadow-lg lg:col-span-2 sm:p-7">
            <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-indigo-300/10 blur-2xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-purple-200">
                  Examination result
                </p>

                <h2 className="mt-2 break-words text-xl font-black sm:text-2xl">
                  {exam.title}
                </h2>

                <p className="mt-2 text-sm text-purple-100">
                  {[exam.course, exam.subject, exam.testType]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                <p className="mt-4 text-xs text-purple-200">
                  Submitted {formatDate(record.submittedAt)}
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm sm:min-w-[240px] sm:justify-center">
                <div>
                  <p className="text-xs font-semibold text-purple-100">
                    Your score
                  </p>

                  <p className="mt-1 text-3xl font-black sm:text-4xl">
                    {record.score}
                    <span className="text-base font-semibold text-purple-200">
                      {" "}
                      / {exam.totalMarks}
                    </span>
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {percent(scorePercentage)}
                  </p>
                </div>

                <div
                  className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#FFFFFF ${
                      scorePercentage * 3.6
                    }deg, rgba(255,255,255,.2) 0deg)`,
                  }}
                >
                  <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#5B24B7] text-base font-black">
                    {Math.round(scorePercentage)}%
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* METRICS - FULL WIDTH */}

          <section className="grid grid-cols-2 gap-2 lg:col-span-2 sm:grid-cols-4 sm:gap-3">
            <Metric
              title="Correct"
              value={record.correct}
              color="green"
              icon={<CheckCircle2 size={17} />}
            />

            <Metric
              title="Incorrect"
              value={record.incorrect}
              color="red"
              icon={<XCircle size={17} />}
            />

            <Metric
              title="Skipped"
              value={record.unanswered}
              color="orange"
              icon={<CircleDashed size={17} />}
            />

            <Metric
              title="Time used"
              value={formatDuration(record.duration)}
              color="blue"
              icon={<Clock size={17} />}
            />
          </section>

          {/* PERFORMANCE OVERVIEW */}

          <Card>
            <Heading
              title="Performance overview"
              subtitle="Your overall performance in this examination."
              color="blue"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Marks obtained
                  </span>

                  <span className="text-sm font-black text-slate-900">
                    {record.score}/{exam.totalMarks}
                  </span>
                </div>

                <Progress
                  value={scorePercentage}
                  color="#2563EB"
                />

                <p className="mt-2 text-xs text-slate-500">
                  {number(marksLost?.total)} marks lost
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-purple-100 bg-purple-50 p-3">
                  <p className="text-xs font-semibold text-purple-700">
                    Accuracy
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {percent(analytics.accuracy)}
                  </p>
                </div>

                <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-3">
                  <p className="text-xs font-semibold text-cyan-700">
                    Question pace
                  </p>

                  <p className="mt-1 text-xl font-black text-slate-900">
                    {number(analytics.speed).toFixed(2)}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Questions/min
                  </p>
                </div>
              </div>
            </div>

            <LinearDistribution
              title="Answer distribution"
              data={answerDistributionData}
              total={exam.totalQuestions}
            />
          </Card>

          {/* SUBJECT / CHAPTER ANALYSIS */}

          {(subjectDonutData.length > 1 ||
            chapterDonutData.length > 1) && (
            <Card>
              <Heading
                title="Subject and chapter analysis"
                subtitle="Performance across the topics in this exam."
                color="green"
              />

              <div className="grid gap-3">
                {subjectDonutData.length > 1 && (
                  <DonutChart
                    title="Subject performance"
                    data={subjectDonutData}
                  />
                )}

                {chapterDonutData.length > 1 && (
                  <DonutChart
                    title="Chapter performance"
                    data={chapterDonutData}
                  />
                )}
              </div>
            </Card>
          )}

          {/* SKILL ANALYSIS */}

          {skillDonutData.length > 0 && (
            <Card>
              <Heading
                title="Learning skills"
                subtitle="Distribution of the skills assessed in this exam."
                color="pink"
              />

              <div className="mx-auto max-w-lg">
                <DonutChart
                  title="Skill distribution"
                  data={skillDonutData}
                  centerValue={String(skillDonutData.length)}
                  centerLabel="Skills"
                />
              </div>
            </Card>
          )}

          {/* CLASS PERFORMANCE */}

          {(number(analytics.rank) > 0 ||
            number(analytics.percentile) > 0) && (
            <Card>
              <Heading
                title="Class performance"
                subtitle="Your position compared with other students."
                color="orange"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Trophy size={18} />

                    <span className="text-xs font-bold">
                      Your rank
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {analytics.rank > 0
                      ? `#${analytics.rank}`
                      : "—"}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Among {analytics.totalStudents} students
                  </p>
                </div>

                <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Award size={18} />

                    <span className="text-xs font-bold">
                      Percentile
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {percent(analytics.percentile)}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Relative performance
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* TOP STUDENTS */}

          {topperList.length > 0 && (
            <Card>
              <Heading
                title="Top performers"
                subtitle="Highest scores in this examination."
                color="orange"
              />

              <div className="space-y-2">
                {topperList.slice(0, 5).map((student, index) => (
                  <div
                    key={student._id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                      index === 0
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                          index === 0
                            ? "bg-amber-200 text-amber-800"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <span className="truncate text-sm font-semibold text-slate-800">
                        {student.name}
                      </span>
                    </div>

                    <span className="shrink-0 text-sm font-black text-slate-900">
                      {student.score}
                      <span className="ml-1 text-xs font-medium text-slate-500">
                        ({percent(student.percentage)})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* IMPROVEMENT PLAN - FULL WIDTH */}

          <Card className="overflow-hidden border-purple-200 bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/50 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-xl bg-purple-100 p-3 text-purple-700">
                <Target size={22} />
              </span>

              <div>
                <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  Improvement plan
                </h2>

                <p className="text-xs text-slate-500 sm:text-sm">
                  Your next learning priorities based on this examination.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-600" />

                  <p className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                    Priority area
                  </p>
                </div>

                <p className="mt-3 text-xl font-black text-slate-900">
                  {priorityTitle}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {priorityDescription}
                </p>

                {weakestSkill && (
                  <div className="mt-4 rounded-xl bg-purple-50 p-3">
                    <p className="text-xs font-bold text-purple-700">
                      Skill to focus on
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatSkill(weakestSkill.skillId)}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">
                        Exam accuracy
                      </span>

                      <span className="font-black text-purple-700">
                        {percent(
                          weakestSkill.accuracy ??
                            weakestSkill.percentage
                        )}
                      </span>
                    </div>

                    <Progress
                      value={weakestSkill.accuracy ?? weakestSkill.percentage}
                      color="#7C3AED"
                    />
                  </div>
                )}

                {weakestChapter && (
                  <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50/70 p-3">
                    <p className="text-xs font-bold text-orange-700">
                      Chapter needing attention
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {weakestChapter.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {percent(weakestChapter.percentage)} performance
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800">
                    Recommended actions
                  </h3>

                  <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                    {improvementActions.length} actions
                  </span>
                </div>

                {improvementActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-purple-200"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 text-xs font-black text-purple-700">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-6 text-slate-700">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* QUESTION REVIEW - FULL WIDTH */}

          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 lg:col-span-2">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-100 p-3 text-blue-700">
                  <BookOpen size={22} />
                </span>

                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                    Question review
                  </h2>

                  <p className="text-xs text-slate-500 sm:text-sm">
                    Review your answers, expected answers and explanations.
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {questionReview.length} Questions
              </span>
            </div>

            {questionReview.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
                No question review available.
              </p>
            ) : (
              <div className="space-y-2.5">
                {questionReview.map((question) => {
                  const key = `${question.questionId}_${question.questionVersion}`;

                  return (
                    <QuestionReviewCard
                      key={key}
                      question={question}
                      expanded={openQuestion === key}
                      onToggle={() =>
                        setOpenQuestion((current) =>
                          current === key ? null : key
                        )
                      }
                      onImageClick={setImageUrl}
                    />
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* =====================================================
          FULL-SCREEN IMAGE DIALOG
      ===================================================== */}

      {imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full-size question image"
          onClick={() => setImageUrl("")}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-3 sm:p-6"
        >
          <button
            type="button"
            aria-label="Close image"
            onClick={() => setImageUrl("")}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
          >
            <X size={24} />
          </button>

          <div
            className="flex h-full w-full items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt="Full-size question image"
              draggable={false}
              className="block max-h-[92vh] max-w-[96vw] select-none object-contain"
            />
          </div>

          <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/60">
            Press Esc or click outside to close
          </p>
        </div>
      )}
    </main>
  );
}