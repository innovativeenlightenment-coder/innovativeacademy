
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PURPLE = "#6D28D9";

type CourseData = {
  _id: string;
  course: string;
  level?: string;
  subject: string;
  chapter: string;
};

type Student = {
  rank?: number;
  name: string;
  email: string;
  avatar: string;
  score: number;
  percentage: number;
  correct: number;
  incorrect: number;
  totalQuestions: number;
};

type LeaderboardStudent = {
  rank: number;
  name: string;
  email: string;
  avatar: string;
  examsAttempted: number;
  averagePercentage: number;
  totalScore: number;
};

type ExamSummary = {
  examId: string;
  testType: string;
  teacherName: string;
  course: string;
  subject: string;
  chapter: string;
  startTime: string;
  endTime: string;
  totalQuestions: number;
  totalMarks: number;
  studentsAssessed: number;
  averagePercentage: number;
  averageScore: number;
  topStudents: Student[];
  students: Student[];
};

type PracticeSummary = {
  id: string;
  subject: string;
  chapter: string;
  testType: string;
  attempts: number;
  latestDate: string | null;
  averagePercentage: number;
  averageScore: number;
  studentsAssessed: number;
  topStudents: Student[];
  students: Student[];
};

type PerformanceData = {
  success: boolean;
  course: string;
  overview: {
    exams: {
      studentsAssessed: number;
      publishedExams: number;
      totalExams: number;
      totalAttempts: number;
      classAverage: number;
      topScore: number;
    };
    practice: {
      studentsAssessed: number;
      totalAttempts: number;
      assessments: number;
      classAverage: number;
      topScore: number;
    };
  };
  examSummaries: ExamSummary[];
  practiceSummaries: PracticeSummary[];
  examLeaderboard: LeaderboardStudent[];
  practiceLeaderboard: LeaderboardStudent[];
};

type Tab = "exams" | "practice";

function percent(value: number | undefined) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function Avatar({
  name,
  avatar,
}: {
  name: string;
  avatar?: string;
}) {
  if (avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatar}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full border border-violet-100 object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
      {initials(name) || "S"}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path
            d="M4 19V5m0 14h16M8 15v-4m4 4V7m4 8V9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="mt-4 font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default function StudentPerformancePage() {
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("exams");

  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);

  const [coursesLoading, setCoursesLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [performanceError, setPerformanceError] = useState("");

  // Load available courses.
  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setCoursesLoading(true);
      setPageError("");

      try {
        const response = await fetch(
          "/api/Fetch-All-SubjectWithChapter",
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Unable to load courses.");
        }

        const data: CourseData[] = Array.isArray(result.data)
          ? result.data
          : [];

        const uniqueCourses = Array.from(
          new Set(
            data
              .map((item) => item.course?.trim())
              .filter((course): course is string => Boolean(course))
          )
        ).sort((a, b) => a.localeCompare(b));

        setCourses(uniqueCourses);

        setSelectedCourse((current) =>
          current && uniqueCourses.includes(current)
            ? current
            : uniqueCourses[0] ?? ""
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setPageError(
          error instanceof Error ? error.message : "Unable to load courses."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCoursesLoading(false);
        }
      }
    }

    loadCourses();

    return () => controller.abort();
  }, []);

  // Load analytics for the selected course.
  useEffect(() => {
    if (!selectedCourse) {
      setPerformanceData(null);
      setPerformanceError("");
      setPerformanceLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadPerformance() {
      setPerformanceLoading(true);
      setPerformanceError("");
      setPerformanceData(null);

      try {
        const response = await fetch(
          `/api/Student-Performance?course=${encodeURIComponent(
            selectedCourse
          )}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Unable to load student performance."
          );
        }

        setPerformanceData(result as PerformanceData);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        setPerformanceError(
          error instanceof Error
            ? error.message
            : "Unable to load student performance."
        );
      } finally {
        if (!controller.signal.aborted) {
          setPerformanceLoading(false);
        }
      }
    }

    loadPerformance();

    return () => controller.abort();
  }, [selectedCourse]);

  const examOverview = performanceData?.overview.exams;
  const practiceOverview = performanceData?.overview.practice;

  const currentOverview =
    activeTab === "exams" ? examOverview : practiceOverview;

  const exams = performanceData?.examSummaries ?? [];
  const practices = performanceData?.practiceSummaries ?? [];

  const leaderboard = useMemo(
    () =>
      activeTab === "exams"
        ? performanceData?.examLeaderboard ?? []
        : performanceData?.practiceLeaderboard ?? [],
    [activeTab, performanceData]
  );

//   const chartData = useMemo(() => {
//     if (activeTab === "exams") {
//       return [...exams]
//         .filter((exam) => exam.studentsAssessed > 0)
//         .reverse()
//         .slice(-8)
//         .map((exam) => ({
//           label: [
//             exam.subject || "Exam",
//             exam.chapter || "",
//           ]
//             .filter(Boolean)
//             .join(" · ")
//             .slice(0, 28),
//           average: exam.averagePercentage,
//         }));
//     }

//     return [...practices]
//       .filter((practice) => practice.attempts > 0)
//       .slice(0, 8)
//       .reverse()
//       .map((practice) => ({
//         label: [
//           practice.subject || "Practice",
//           practice.chapter || "",
//         ]
//           .filter(Boolean)
//           .join(" · ")
//           .slice(0, 28),
//         average: practice.averagePercentage,
//       }));
//   }, [activeTab, exams, practices]);

const progressStudents = useMemo(
  () => (leaderboard ?? []).slice(0, 5),
  [leaderboard]
);

const chartData = useMemo(() => {
  const assessments =
  activeTab === "exams" ? exams : practices;

  return [...(assessments ?? [])]
    .sort((a, b) => {
  const rawDateA =
    "startTime" in a ? a.startTime : a.latestDate;

  const rawDateB =
    "startTime" in b ? b.startTime : b.latestDate;

  const dateA = rawDateA
    ? new Date(rawDateA).getTime()
    : 0;

  const dateB = rawDateB
    ? new Date(rawDateB).getTime()
    : 0;

  return dateA - dateB;
})
    .map((assessment) => {
      const point: Record<string, string | number | null> = {
        assessment:
          assessment.chapter ||
          assessment.subject ||
          assessment.testType ||
          "Assessment",
      };

      for (const student of progressStudents) {
        const record = (assessment.students ?? []).find(
          (item) =>
            item.email?.toLowerCase() ===
            student.email?.toLowerCase()
        );

        point[student.email] =
          record?.percentage == null
            ? null
            : Number(record.percentage);
      }

      return point;
    });
}, [activeTab, exams, practices, progressStudents]);

  const totalAssessments =
    activeTab === "exams"
      ? examOverview?.totalExams ?? 0
      : practiceOverview?.assessments ?? 0;

  return (
    <main className="min-h-screen bg-[#F8F7FC] px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page header */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-600" />
              Teacher dashboard
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Student Performance
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Monitor assessment results, track class progress, and identify
              students who may need additional support.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="course-select"
              className="text-sm font-medium text-gray-600"
            >
              Course
            </label>

            <select
              id="course-select"
              value={selectedCourse}
              onChange={(event) => setSelectedCourse(event.target.value)}
              disabled={coursesLoading || courses.length === 0}
              className="min-w-40 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
            >
              {courses.length === 0 && (
                <option value="">No courses</option>
              )}

              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Course tabs */}
        {courses.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-b border-violet-100">
            {courses.map((course) => (
              <button
                key={course}
                type="button"
                onClick={() => setSelectedCourse(course)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  selectedCourse === course
                    ? "border-violet-700 text-violet-700"
                    : "border-transparent text-gray-500 hover:text-violet-700"
                }`}
              >
                {course}
              </button>
            ))}
          </div>
        )}

        {/* Exam / practice switch */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-xl border border-violet-100 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("exams")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "exams"
                  ? "bg-violet-700 text-white shadow-sm"
                  : "text-gray-600 hover:bg-violet-50"
              }`}
            >
              Exam Performance
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("practice")}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === "practice"
                  ? "bg-violet-700 text-white shadow-sm"
                  : "text-gray-600 hover:bg-violet-50"
              }`}
            >
              Practice Performance
            </button>
          </div>

          {selectedCourse && (
            <p className="text-sm text-gray-500">
              Course:{" "}
              <span className="font-semibold text-gray-800">
                {selectedCourse}
              </span>
            </p>
          )}
        </div>

        {/* Loading state */}
        {(coursesLoading || performanceLoading) && (
          <div className="rounded-2xl border border-violet-100 bg-white p-10 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-violet-100 border-t-violet-700" />
            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading student performance...
            </p>
          </div>
        )}

        {/* Errors */}
        {!coursesLoading && pageError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Unable to load courses</p>
            <p className="mt-1">{pageError}</p>
          </div>
        )}

        {!coursesLoading && !pageError && courses.length === 0 && (
          <div className="rounded-2xl border border-violet-100 bg-white">
            <EmptyState
              title="No courses found"
              description="Courses will appear here when they are available in your question structure."
            />
          </div>
        )}

        {!performanceLoading && performanceError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-semibold">Unable to load performance</p>
            <p className="mt-1">{performanceError}</p>
          </div>
        )}

        {/* Dashboard content */}
        {!performanceLoading &&
          !performanceError &&
          performanceData && (
            <>
              {/* Overview cards */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Students assessed"
                  value={currentOverview?.studentsAssessed ?? 0}
                  description="Unique students with recorded results"
                />

                <StatCard
                  label={
                    activeTab === "exams"
                      ? "Published exams"
                      : "Practice assessments"
                  }
                  value={
                    activeTab === "exams"
                      ? examOverview?.publishedExams ?? 0
                      : practiceOverview?.assessments ?? 0
                  }
                  description={
                    activeTab === "exams"
                      ? `${examOverview?.totalExams ?? 0} exams created`
                      : "Subject and chapter groupings"
                  }
                />

                <StatCard
                  label="Class average"
                  value={percent(currentOverview?.classAverage)}
                  description="Average across recorded attempts"
                />

                <StatCard
                  label="Highest score"
                  value={percent(currentOverview?.topScore)}
                  description={`${currentOverview?.totalAttempts ?? 0} recorded attempts`}
                />
              </section>

              {/* Chart and leaderboard */}
              <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm xl:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">
                        Average performance
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Average percentage for each assessment
                      </p>
                    </div>

                    <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                      {activeTab === "exams" ? "Exam results" : "Practice results"}
                    </span>
                  </div>

                  {chartData.length > 0 ? (
                    <div className="mt-6 h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{
                            top: 8,
                            right: 12,
                            left: -16,
                            bottom: 42,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#EEE8FA"
                          />

                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "#6B7280" }}
                            angle={-20}
                            textAnchor="end"
                            interval={0}
                          />

                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 11, fill: "#6B7280" }}
                            tickFormatter={(value) => `${value}%`}
                          />

                          <Tooltip
                            formatter={(value) => [
                              `${Number(value ?? 0).toFixed(1)}%`,
                              "Average",
                            ]}
                            contentStyle={{
                              borderRadius: 12,
                              border: "1px solid #EDE9FE",
                            }}
                          />

                          <Bar
                            dataKey="average"
                            name="Average"
                            fill={PURPLE}
                            radius={[6, 6, 0, 0]}
                            maxBarSize={54}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState
                      title="No chart data yet"
                      description="Published exam results or completed practice attempts will appear here."
                    />
                  )}
                </div> */}
                <div className="w-full xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm">
  {/* Header */}
  <div className="mb-4">
    <h2 className="text-lg font-semibold">
      Student Progress
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Compare how students perform across assessments.
    </p>
  </div>

  {/* Student legend with avatars */}
  {/* <div className="mb-5 flex flex-wrap gap-x-5 gap-y-3">
    {progressStudents.map((student, index) => {
      const colors = [
        "#7C3AED",
        "#2563EB",
        "#059669",
        "#EA580C",
        "#DB2777",
      ];

      return (
        <div
          key={student.email}
          className="flex items-center gap-2"
        >
          {student.avatar ? (
            <img
              src={student.avatar}
              alt={student.name}
              className="h-8 w-8 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: colors[index % colors.length] }}
            >
              {initials(student.name)}
            </div>
          )}

          <span className="max-w-28 truncate text-sm font-medium">
            {student.name}
          </span>

          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
        </div>
      );
    })}
  </div> */}

  {/* Chart information */}
  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
    <p className="text-xs text-gray-500">
      Percentage score · Higher is better
    </p>

    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
      Latest {Math.min(chartData.length, 8)} assessments
    </span>
  </div>

  {/* Responsive chart: stays within the original card width */}
  {chartData.length === 0 ? (
    <div className="flex h-64 items-center justify-center text-sm text-gray-500">
      No assessment history available yet.
    </div>
  ) : (
    <div className="h-[310px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData.slice(-8)}
          margin={{
            top: 10,
            right: 16,
            left: 0,
            bottom: 35,
          }}
        >
          <CartesianGrid
            stroke="#E5E7EB"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="assessment"
            tick={{ fill: "#6B7280", fontSize: 11 }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
            angle={-20}
            textAnchor="end"
            interval="preserveStartEnd"
            height={55}
          />

          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "#6B7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={42}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              color: "#111827",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
            formatter={(value, name) => [
              value == null ? "No result" : `${value}%`,
              progressStudents.find(
                (student) => student.email === name
              )?.name ?? String(name),
            ]}
            labelFormatter={(label) => `Assessment: ${label}`}
          />

          {progressStudents.map((student, index) => {
            const colors = [
              "#7C3AED",
              "#2563EB",
              "#059669",
              "#EA580C",
              "#DB2777",
            ];

            return (
              <Line
                key={student.email}
                type="monotone"
                dataKey={student.email}
                name={student.name}
                stroke={colors[index % colors.length]}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: colors[index % colors.length],
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
                connectNulls={false}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )}

  <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-5 text-gray-500">
    Each line represents a student. Each dot represents an assessment
    score. Missing results are shown as gaps, not zero scores.
  </p>
</div>

                {/* Leaderboard */}
                <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold">Top students</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Ranked by average percentage
                  </p>

                  {leaderboard.length > 0 ? (
                    <div className="mt-5 space-y-4">
                      {leaderboard.map((student) => (
                        <div
                          key={student.email || student.rank}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700">
                            {student.rank}
                          </div>

                          <Avatar
                            name={student.name}
                            avatar={student.avatar}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {student.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {student.examsAttempted} attempts
                            </p>
                          </div>

                          <p className="text-sm font-bold text-violet-700">
                            {percent(student.averagePercentage)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No student results"
                      description="Students will appear here after they have recorded results."
                    />
                  )}
                </div>
              </section>

              {/* Assessment records */}
              <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100 p-5">
                  <div>
                    <h2 className="text-lg font-bold">
                      {activeTab === "exams"
                        ? "Exam assessments"
                        : "Practice assessments"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {activeTab === "exams"
                        ? "Exam results are included once they are published."
                        : "Practice results are grouped by subject, chapter, and practice type."}
                    </p>
                  </div>

                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                    {totalAssessments} total
                  </span>
                </div>

                {activeTab === "exams" ? (
                  exams.length > 0 ? (
                    <div className="divide-y divide-violet-50">
                      {exams.map((exam) => (
                        <div
                          key={exam.examId}
                          className="flex flex-col gap-4 p-5 transition hover:bg-violet-50/40 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {exam.subject || "Exam"}
                              </h3>

                              <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium capitalize text-violet-700">
                                {exam.testType}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-gray-500">
                              {exam.chapter || "All chapters"} ·{" "}
                              {formatDate(exam.startTime)}
                            </p>

                            <p className="mt-2 text-xs text-gray-500">
                              Teacher: {exam.teacherName || "Not specified"}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-5 text-sm md:min-w-72">
                            <div>
                              <p className="text-xs text-gray-500">Students</p>
                              <p className="mt-1 font-bold">
                                {exam.studentsAssessed}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Average</p>
                              <p className="mt-1 font-bold text-violet-700">
                                {percent(exam.averagePercentage)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Avg. score</p>
                              <p className="mt-1 font-bold">
                                {exam.averageScore}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No exams found"
                      description="No exam papers are currently available for this course."
                    />
                  )
                ) : practices.length > 0 ? (
                  <div className="divide-y divide-violet-50">
                    {practices.map((practice) => (
                      <div
                        key={practice.id}
                        className="flex flex-col gap-4 p-5 transition hover:bg-violet-50/40 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {practice.subject}
                            </h3>

                            <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium capitalize text-violet-700">
                              {practice.testType}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {practice.chapter} ·{" "}
                            {formatDate(practice.latestDate)}
                          </p>

                          <p className="mt-2 text-xs text-gray-500">
                            {practice.studentsAssessed} students ·{" "}
                            {practice.attempts} attempts
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-5 text-sm md:min-w-48">
                          <div>
                            <p className="text-xs text-gray-500">Average</p>
                            <p className="mt-1 font-bold text-violet-700">
                              {percent(practice.averagePercentage)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Avg. score</p>
                            <p className="mt-1 font-bold">
                              {practice.averageScore}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No practice records found"
                    description="Completed practice attempts for this course will appear here."
                  />
                )}
              </section>

              <p className="pb-4 text-center text-xs text-gray-400">
                Analytics reflect the records currently available for the
                selected course.
              </p>
            </>
          )}
      </div>
    </main>
  );
}
