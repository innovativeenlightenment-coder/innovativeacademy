"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type ContentItem = {
  type: string;
  value?: string;
  url?: string;
  alt?: string;
};

type QuestionData = {
  questionId: string;
  version: number;
  type: string;
  category: string;
  chapter: string;
  subtopic: string;
  prompt: ContentItem[];
  response: any;
  options?: any[];
  answerKey: any;
  steps: any[];
  parts: any[];
  solution: any;
  difficulty: any;
};

type StudentQuestion = {
  questionId: string;
  version: number;
  order: number;
  marks: number;
  response: any;
  responseStatus: string;
  evaluation: {
    status: string;
    isCorrect: boolean | null;
    marksAwarded: number;
    feedback: string;
    breakdown: any[];
  };
  question: QuestionData | null;
};

type Student = {
  _id: string;
  rank: number;
  student: {
    name: string;
    username: string;
    email: string;
  };
  submittedAt: string;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  evaluationStatus: string;
  resultStatus: string;
  publishAt: string | null;
  publishedAt: string | null;
  questions: StudentQuestion[];
};

type QuestionAnalysis = {
  questionId: string;
  version: number;
  order: number;
  marks: number;
  question: QuestionData | null;
  attempted: number;
  unanswered: number;
  correct: number;
  incorrect: number;
  totalStudents: number;
  averageMarksAwarded: number;
  correctPercentage: number;
};

type Exam = {
  _id: string;
  title: string;
  testType: string;
  course: string;
  subject: string;
  chapters: string[];
  status: string;
  schedule: {
    startTime: string | null;
    endTime: string | null;
    durationMinutes: number;
  };
  totalQuestions: number;
  totalMarks: number;
  stats: {
    attempts: number;
    averagePercentage: number;
    highestPercentage: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    publishedResults: number;
  };
};

type ExamDetail = {
  exam: Exam;
  summary: {
    attempts: number;
    averagePercentage: number;
    highestPercentage: number;
    lowestPercentage: number;
    averageMarks: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    publishedResults: number;
  };
  students: Student[];
  questionAnalysis: QuestionAnalysis[];
};

/* =========================================================
   CONSTANTS
========================================================= */

const PURPLE = "#6D28D9";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date?: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date?: string | null) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds || 0));

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;

  return `${secs}s`;
}

function titleCase(value: string) {
  return (value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function percentageColor(value: number) {
  if (value >= 75) return "text-emerald-600";
  if (value >= 40) return "text-amber-600";
  return "text-red-600";
}

function statusClass(value: string) {
  if (value === "completed" || value === "published") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "in_progress") {
    return "bg-blue-50 text-blue-700";
  }

  if (value === "under_review") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-gray-100 text-gray-600";
}

function stringify(value: any) {
  if (value == null) return "—";

  if (typeof value === "string") return value;

  return JSON.stringify(value, null, 2);
}

/* =========================================================
   CONTENT RENDERER
========================================================= */

function ContentRenderer({
  content,
}: {
  content: ContentItem[] | any;
}) {
  if (!content) {
    return (
      <p className="text-sm text-gray-400">
        Content unavailable.
      </p>
    );
  }

  const blocks = Array.isArray(content)
    ? content
    : [{ type: "text", value: String(content) }];

  return (
    <div className="space-y-2">
      {blocks.map((block: ContentItem, index: number) => {
        if (block.type === "image" || block.type === "diagram") {
          const src = block.url || block.value;

          return src ? (
            <img
              key={index}
              src={src}
              alt={block.alt || "Question illustration"}
              className="max-h-80 max-w-full rounded-lg border border-gray-200 object-contain"
            />
          ) : null;
        }

        if (block.type === "video") {
          const src = block.url || block.value;

          return src ? (
            <video
              key={index}
              src={src}
              controls
              className="max-h-80 max-w-full rounded-lg"
            />
          ) : null;
        }

        if (block.type === "table") {
          return (
            <div
              key={index}
              className="overflow-x-auto rounded-lg border border-gray-200 p-3"
            >
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {block.value}
              </pre>
            </div>
          );
        }

        if (block.type === "math") {
          return (
            <div
              key={index}
              className="overflow-x-auto rounded-lg bg-purple-50 px-3 py-2 font-mono text-sm text-purple-900"
            >
              {block.value}
            </div>
          );
        }

        return (
          <p
            key={index}
            className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-800"
          >
            {block.value}
          </p>
        );
      })}
    </div>
  );
}

/* =========================================================
   ANSWER RENDERER
========================================================= */

function AnswerRenderer({
  answer,
}: {
  answer: any;
}) {
  if (answer == null) {
    return <span className="text-gray-400">Not available</span>;
  }

  if (typeof answer === "string" || typeof answer === "number") {
    return (
      <p className="whitespace-pre-wrap break-words text-sm text-gray-800">
        {String(answer)}
      </p>
    );
  }

  if (Array.isArray(answer)) {
    return (
      <div className="space-y-2">
        {answer.map((item, index) => (
          <AnswerRenderer key={index} answer={item} />
        ))}
      </div>
    );
  }

  if (answer.content && Array.isArray(answer.content)) {
    return <ContentRenderer content={answer.content} />;
  }

  if (answer.optionId) {
    return (
      <span className="font-semibold text-gray-800">
        Option: {answer.optionId}
      </span>
    );
  }

  if (Array.isArray(answer.acceptedAnswers)) {
    return (
      <div className="space-y-1">
        {answer.acceptedAnswers.map(
          (item: any, index: number) => (
            <p key={index} className="text-sm text-gray-800">
              {stringify(item)}
            </p>
          )
        )}
      </div>
    );
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-700">
      {stringify(answer)}
    </pre>
  );
}

/* =========================================================
   QUESTION CARD
========================================================= */

function QuestionCard({
  question,
  index,
  showAnswer = true,
}: {
  question: StudentQuestion | QuestionAnalysis;
  index: number;
  showAnswer?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const actualQuestion = question.question;

  const studentQuestion = question as StudentQuestion;
  const analysisQuestion = question as QuestionAnalysis;

  const isStudentQuestion = "responseStatus" in question;

  const marks = question.marks;

  const awardedMarks = isStudentQuestion
    ? studentQuestion.evaluation?.marksAwarded ?? 0
    : analysisQuestion.averageMarksAwarded ?? 0;

  // Safe values: no null or undefined access.
  const prompt = actualQuestion?.prompt ?? [];
  const actualOptions = actualQuestion?.options ?? [];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-purple-700">
                QUESTION {question.order || index + 1}
              </span>

              {actualQuestion?.type && (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600">
                  {titleCase(actualQuestion.type)}
                </span>
              )}

              {actualQuestion?.difficulty && (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] text-gray-500">
                  {titleCase(
                    typeof actualQuestion.difficulty === "string"
                      ? actualQuestion.difficulty
                      : actualQuestion.difficulty.level || ""
                  )}
                </span>
              )}
            </div>

            {prompt.length > 0 ? (
              <ContentRenderer content={prompt} />
            ) : (
              <p className="text-sm text-red-500">
                Question content could not be loaded.
              </p>
            )}

            {!actualQuestion && (
              <p className="mt-2 text-xs text-gray-400">
                Question content is unavailable for this record.
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-gray-900">
              {awardedMarks}
              {isStudentQuestion ? "" : " avg"} / {marks}
            </p>

            <p className="text-[10px] text-gray-400">
              Marks
            </p>
          </div>
        </div>

        {actualOptions.length > 0 && (
          <div className="mt-4 space-y-2">
            {actualOptions.map(
              (option: any, optionIndex: number) => (
                <div
                  key={option.optionId || optionIndex}
                  className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-gray-600">
                    {option.optionId ||
                      String.fromCharCode(65 + optionIndex)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <ContentRenderer content={option.content || []} />
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {showAnswer && actualQuestion?.answerKey != null && (
          <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
            <p className="mb-2 text-xs font-bold text-emerald-700">
              CORRECT ANSWER
            </p>

            <AnswerRenderer answer={actualQuestion.answerKey} />
          </div>
        )}

        {isStudentQuestion && (
          <div className="mt-4 rounded-lg border border-gray-200 p-3">
            <p className="mb-2 text-xs font-bold text-gray-500">
              STUDENT RESPONSE
            </p>

            <AnswerRenderer answer={studentQuestion.response} />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  studentQuestion.evaluation?.isCorrect === true
                    ? "bg-emerald-50 text-emerald-700"
                    : studentQuestion.evaluation?.isCorrect === false
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {studentQuestion.evaluation?.isCorrect === true
                  ? "Correct"
                  : studentQuestion.evaluation?.isCorrect === false
                  ? "Incorrect"
                  : titleCase(
                      studentQuestion.evaluation?.status || "pending"
                    )}
              </span>

              <span className="text-xs font-semibold text-gray-700">
                {studentQuestion.evaluation?.marksAwarded ?? 0} / {marks} marks
              </span>
            </div>

            {studentQuestion.evaluation?.feedback && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500">
                  Feedback
                </p>

                <p className="mt-1 text-sm text-gray-700">
                  {studentQuestion.evaluation.feedback}
                </p>
              </div>
            )}

            {studentQuestion.evaluation?.breakdown?.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs font-semibold text-purple-700 hover:underline"
                >
                  {expanded
                    ? "Hide evaluation breakdown"
                    : "View evaluation breakdown"}
                </button>

                {expanded && (
                  <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
                    {JSON.stringify(
                      studentQuestion.evaluation.breakdown,
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {!isStudentQuestion && (
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>
              Correct:{" "}
              <strong className="text-emerald-600">
                {analysisQuestion.correct}
              </strong>
            </span>

            <span>
              Incorrect:{" "}
              <strong className="text-red-600">
                {analysisQuestion.incorrect}
              </strong>
            </span>

            <span>
              Unanswered:{" "}
              <strong className="text-gray-700">
                {analysisQuestion.unanswered}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-gray-900">
        {value}
      </p>

      {note && (
        <p className="mt-0.5 text-[11px] text-gray-400">
          {note}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function TeacherExamPerformancePage() {
  const [exams, setExams] = useState<Exam[]>([]);

  const [courses, setCourses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const [overview, setOverview] = useState({
    totalExams: 0,
    totalAttempts: 0,
    averagePercentage: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0,
  });

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedExamId, setSelectedExamId] = useState<string | null>(
    null
  );

  const [detail, setDetail] = useState<ExamDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [studentSearch, setStudentSearch] = useState("");

  /* =====================================================
     LOAD EXAMS
  ===================================================== */

  async function fetchExams() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("course", selectedCourse);
      params.set("subject", selectedSubject);

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/Teacher-Exam-Performance?${params.toString()}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load exams.");
      }

      setExams(data.exams || []);
      setCourses(data.courses || []);
      setSubjects(data.subjects || []);
      setOverview(
        data.overview || {
          totalExams: 0,
          totalAttempts: 0,
          averagePercentage: 0,
          completedEvaluations: 0,
          pendingEvaluations: 0,
        }
      );
    } catch (error: any) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(fetchExams, 300);

    return () => clearTimeout(timer);
  }, [selectedCourse, selectedSubject, search]);

  /* =====================================================
     LOAD EXAM DETAILS
  ===================================================== */

  async function openExam(examId: string) {
    try {
      setSelectedExamId(examId);
      setDetail(null);
      setSelectedStudent(null);
      setStudentSearch("");
      setDetailLoading(true);
      setError("");

      const response = await fetch(
        `/api/Teacher-Exam-Performance/${examId}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load exam details."
        );
      }

      setDetail(data);
    } catch (error: any) {
      setError(error.message || "Unable to load exam.");
      setSelectedExamId(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeExam() {
    setSelectedExamId(null);
    setDetail(null);
    setSelectedStudent(null);
  }

  /* =====================================================
     FILTER STUDENTS
  ===================================================== */

  const filteredStudents = useMemo(() => {
    if (!detail) return [];

    const query = studentSearch.toLowerCase().trim();

    if (!query) return detail.students || [];

    return (detail.students || []).filter((student) =>
      [
        student.student?.name || "",
        student.student?.email || "",
        student.student?.username || "",
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [detail, studentSearch]);

  /* =====================================================
     STUDENT DETAIL VIEW
  ===================================================== */

  if (selectedStudent && detail) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => setSelectedStudent(null)}
            className="mb-4 text-sm font-semibold text-purple-700 hover:underline"
          >
            ← Back to student results
          </button>

          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {selectedStudent.student.name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedStudent.student.email}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {detail.exam.title}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 px-4 py-3 text-center">
                <p className="text-xs text-purple-600">
                  Rank
                </p>

                <p className="text-2xl font-bold text-purple-800">
                  #{selectedStudent.rank}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Percentage"
              value={`${selectedStudent.percentage}%`}
            />

            <Stat
              label="Marks"
              value={`${selectedStudent.obtainedMarks}/${selectedStudent.totalMarks}`}
            />

            <Stat
              label="Correct"
              value={selectedStudent.correctCount}
            />

            <Stat
              label="Time taken"
              value={formatDuration(
                selectedStudent.timeSpentSeconds
              )}
            />
          </div>

          <div className="mb-5 grid grid-cols-3 gap-3">
            <Stat
              label="Correct"
              value={selectedStudent.correctCount}
            />

            <Stat
              label="Incorrect"
              value={selectedStudent.incorrectCount}
            />

            <Stat
              label="Unanswered"
              value={selectedStudent.unansweredCount}
            />
          </div>

          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">
                  Submitted
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {formatDateTime(selectedStudent.submittedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Evaluation
                </p>

                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                    selectedStudent.evaluationStatus
                  )}`}
                >
                  {titleCase(selectedStudent.evaluationStatus)}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Result status
                </p>

                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                    selectedStudent.resultStatus
                  )}`}
                >
                  {titleCase(selectedStudent.resultStatus)}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Published at
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {formatDateTime(selectedStudent.publishedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">
              Question-wise analysis
            </h2>

            <span className="text-xs text-gray-500">
              {selectedStudent.questions?.length || 0} questions
            </span>
          </div> */}

          <div className="space-y-3">
            {(selectedStudent.questions || []).map(
              (question, index) => (
                <QuestionCard
                  key={`${question.questionId}_${question.version}_${index}`}
                  question={question}
                  index={index}
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     EXAM DETAIL VIEW
  ===================================================== */

  if (selectedExamId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={closeExam}
            className="mb-4 text-sm font-semibold text-purple-700 hover:underline"
          >
            ← Back to exams
          </button>

          {detailLoading ? (
            <div className="rounded-xl border bg-white p-16 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-purple-700" />

              <p className="mt-3 text-sm text-gray-500">
                Loading examination...
              </p>
            </div>
          ) : detail ? (
            <>
              {/* EXAM HEADER */}

              <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                        {titleCase(detail.exam.testType)}
                      </span>

                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                        {titleCase(detail.exam.status)}
                      </span>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
                      {detail.exam.title}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                      {detail.exam.course} · {detail.exam.subject}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(detail.exam.schedule.startTime)}
                    </p>
                  </div>

                  <div className="flex gap-5 rounded-xl bg-purple-50 px-4 py-3">
                    <div>
                      <p className="text-xs text-purple-600">
                        Questions
                      </p>

                      <p className="text-xl font-bold text-purple-900">
                        {detail.exam.totalQuestions}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-purple-600">
                        Total marks
                      </p>

                      <p className="text-xl font-bold text-purple-900">
                        {detail.exam.totalMarks}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-purple-600">
                        Duration
                      </p>

                      <p className="text-xl font-bold text-purple-900">
                        {detail.exam.schedule.durationMinutes}m
                      </p>
                    </div>
                  </div>
                </div>

                {detail.exam.chapters?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                    {detail.exam.chapters.map((chapter) => (
                      <span
                        key={chapter}
                        className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                      >
                        {chapter}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SUMMARY */}

              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                  label="Participated"
                  value={detail.summary.attempts}
                  note="Submitted attempts"
                />

                <Stat
                  label="Average"
                  value={`${detail.summary.averagePercentage}%`}
                  note={`${detail.summary.averageMarks} average marks`}
                />

                <Stat
                  label="Highest"
                  value={`${detail.summary.highestPercentage}%`}
                />

                <Stat
                  label="Pending evaluation"
                  value={detail.summary.pendingEvaluations}
                  note={`${detail.summary.completedEvaluations} completed`}
                />
              </div>

              {/* STUDENT RESULTS */}

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Student results
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Individual performance
                  </p>
                </div>

                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-purple-500 sm:max-w-xs"
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {filteredStudents.length === 0 ? (
                  <div className="p-10 text-center text-sm text-gray-500">
                    No submitted student results found.
                  </div>
                ) : (
                  <>
                    {/* DESKTOP */}

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500">
                          <tr>
                            <th className="px-4 py-3">Rank</th>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Marks</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3">Correct</th>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {filteredStudents.map((student) => (
                            <tr
                              key={student._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 font-semibold text-gray-700">
                                #{student.rank}
                              </td>

                              <td className="px-4 py-3">
                                <p className="font-semibold text-gray-900">
                                  {student.student.name}
                                </p>

                                <p className="text-xs text-gray-400">
                                  {student.student.email}
                                </p>
                              </td>

                              <td className="px-4 py-3 font-semibold">
                                {student.obtainedMarks}/
                                {student.totalMarks}
                              </td>

                              <td
                                className={`px-4 py-3 font-bold ${percentageColor(
                                  student.percentage
                                )}`}
                              >
                                {student.percentage}%
                              </td>

                              <td className="px-4 py-3 text-gray-700">
                                {student.correctCount}/
                                {student.totalQuestions}
                              </td>

                              <td className="px-4 py-3 text-gray-600">
                                {formatDuration(
                                  student.timeSpentSeconds
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass(
                                    student.evaluationStatus
                                  )}`}
                                >
                                  {titleCase(student.evaluationStatus)}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() =>
                                    setSelectedStudent(student)
                                  }
                                  className="whitespace-nowrap text-xs font-semibold text-purple-700 hover:underline"
                                >
                                  Analyse →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE */}

                    <div className="space-y-2 p-3 md:hidden">
                      {filteredStudents.map((student) => (
                        <button
                          key={student._id}
                          onClick={() => setSelectedStudent(student)}
                          className="w-full rounded-lg border border-gray-200 p-3 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900">
                                {student.student.name}
                              </p>

                              <p className="truncate text-xs text-gray-400">
                                {student.student.email}
                              </p>
                            </div>

                            <div className="text-right">
                              <p
                                className={`font-bold ${percentageColor(
                                  student.percentage
                                )}`}
                              >
                                {student.percentage}%
                              </p>

                              <p className="text-xs text-gray-500">
                                #{student.rank}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-gray-500">
                            <span>
                              {student.obtainedMarks}/
                              {student.totalMarks} marks
                            </span>

                            <span>
                              {student.correctCount} correct
                            </span>

                            <span>
                              {formatDuration(student.timeSpentSeconds)}
                            </span>
                          </div>

                          <p className="mt-2 text-right text-xs font-semibold text-purple-700">
                            View analysis →
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              {error || "Unable to load examination details."}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN DASHBOARD
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Exam Performance
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Analyse examination results and student performance.
            </p>
          </div>

          <button
            onClick={fetchExams}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        {/* OVERVIEW */}

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Examinations"
            value={overview.totalExams}
          />

          <Stat
            label="Student attempts"
            value={overview.totalAttempts}
          />

          <Stat
            label="Average performance"
            value={`${overview.averagePercentage}%`}
          />

          <Stat
            label="Pending evaluation"
            value={overview.pendingEvaluations}
          />
        </div>

        {/* FILTERS */}

        <div className="mb-5 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 md:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search examination..."
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
          />

          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedSubject("all");
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500"
          >
            <option value="all">All courses</option>

            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500"
          >
            <option value="all">All subjects</option>

            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* EXAM LIST */}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            Examination history
          </h2>

          <span className="text-xs text-gray-500">
            {exams.length} exams
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
            <div
              className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200"
              style={{ borderTopColor: PURPLE }}
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading examinations...
            </p>
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="font-semibold text-gray-800">
              No examinations found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Examination</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Attempts</th>
                      <th className="px-4 py-3">Average</th>
                      <th className="px-4 py-3">Highest</th>
                      <th className="px-4 py-3">Evaluation</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {exams.map((exam) => (
                      <tr
                        key={exam._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">
                            {exam.title}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {exam.subject} · {titleCase(exam.testType)}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {exam.course}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(exam.schedule?.startTime)}
                        </td>

                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {exam.stats?.attempts ?? 0}
                        </td>

                        <td
                          className={`px-4 py-3 font-semibold ${percentageColor(
                            exam.stats?.averagePercentage ?? 0
                          )}`}
                        >
                          {exam.stats?.averagePercentage ?? 0}%
                        </td>

                        <td className="px-4 py-3 font-semibold text-emerald-600">
                          {exam.stats?.highestPercentage ?? 0}%
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600">
                            {exam.stats?.completedEvaluations ?? 0}/
                            {exam.stats?.attempts ?? 0} completed
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openExam(exam._id)}
                            className="whitespace-nowrap rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE LIST */}

            <div className="space-y-2 md:hidden">
              {exams.map((exam) => (
                <button
                  key={exam._id}
                  onClick={() => openExam(exam._id)}
                  className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {exam.title}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {exam.course} · {exam.subject}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(exam.schedule?.startTime)}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs font-semibold text-purple-700">
                      View →
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-[11px] text-gray-400">
                        Attempts
                      </p>

                      <p className="mt-1 font-bold text-gray-900">
                        {exam.stats?.attempts ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Average
                      </p>

                      <p
                        className={`mt-1 font-bold ${percentageColor(
                          exam.stats?.averagePercentage ?? 0
                        )}`}
                      >
                        {exam.stats?.averagePercentage ?? 0}%
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Highest
                      </p>

                      <p className="mt-1 font-bold text-emerald-600">
                        {exam.stats?.highestPercentage ?? 0}%
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}