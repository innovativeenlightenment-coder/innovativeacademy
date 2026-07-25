

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getCurrentUser } from "@/lib/getCurrentUser";

import { toPng } from "html-to-image";

// ---------------- TYPES ----------------

interface Exam {
  _id: string;
  testType: string;
  course: string;
  totalQuestions: number;
  totalMarks: number;
}

interface RecordType {
  name: string;
  email: string;
  score: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  duration: number;
  timeLeft: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  score: number;
  percentage: number;
}

interface Analytics {
  rank: number;
  percentile: string;
  totalStudents: number;
}
interface SubjectAnalysis {
  subject: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  percentage: number;
}

interface ChapterAnalysis {
  chapter: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  score: number;
  percentage: number;
}

interface DifficultyAnalysis {
  difficulty: string;
  total: number;
  correct: number;
  incorrect: number;
  skipped: number;
  percentage: number;
}

interface QuestionReview {
  questionId: string;
  subject: string;
  chapter: string;
  difficulty: string;
  question: {
    text?: string;
    imgUrl?: string;
  };
  options: {
    text?: string;
    imgUrl?: string;
  }[];
  hint: {
    text?: string;
    imgUrl?: string;
  };
  correctAnswer: string;
  selectedAnswer: string;
  status: "correct" | "incorrect" | "skipped";
}

interface ApiResponse {
  success: boolean;

  exam: Exam;

  record: RecordType;

  analytics: Analytics;

  topperList: Student[];

  positiveMarking: number;
  negativeMarking: number;
  totalMarksObtained: number;

  subjectAnalysis: SubjectAnalysis[];

  chapterAnalysis: ChapterAnalysis[];

  difficultyAnalysis: DifficultyAnalysis[];

  questionReview: QuestionReview[];

  strongestSubject: string | null;
  weakestSubject: string | null;

  strongestChapter: string | null;
  weakestChapter: string | null;

  marksLost: {
    wrong: number;
    skipped: number;
    total: number;
  };
}
// ---------------- COMPONENT ----------------

export default function ResultPage() {
  const { id } = useParams() as { id: string };
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      try {
        const userData = await getCurrentUser();
        const email = userData?.user?.email;

        const res = await fetch(
          `/api/Exam-Result-Details?examId=${id}&email=${email}`
        );

        const json: ApiResponse = await res.json();
        setData(json);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  // const handleDownload = async () => {
  //   if (!resultRef.current) return;

  //   const canvas = await html2canvas(resultRef.current);
  //   const imgData = canvas.toDataURL("image/png");

  //   const pdf = new jsPDF();
  //   const width = pdf.internal.pageSize.getWidth();
  //   const height = (canvas.height * width) / canvas.width;

  //   pdf.addImage(imgData, "PNG", 0, 0, width, height);
  //   pdf.save("result.pdf");
  // };

  

const handleDownload = async () => {
  if (!resultRef.current) return;

  try {
    const dataUrl = await toPng(resultRef.current, {
      cacheBust: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = "Exam-Result.png";
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Download failed:", error);
  }
};

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Result...
      </div>
    );

  if (!data) return <div>Result not found</div>;

  const {
  exam,
  record,
  analytics,
  topperList,
  positiveMarking,
  negativeMarking,
  totalMarksObtained,

  subjectAnalysis,
  chapterAnalysis,
  difficultyAnalysis,
  questionReview,

  strongestSubject,
  weakestSubject,

  strongestChapter,
  weakestChapter,

  marksLost,
} = data;

  const accuracy =
    record.correct + record.incorrect === 0
      ? 0
      : Number(
          (
            (record.correct /
              (record.correct + record.incorrect)) *
            100
          ).toFixed(2)
        );

  const speed =
    record.duration === 0
      ? 0
      : Number(
          (
            exam.totalQuestions /
            (record.duration / 60)
          ).toFixed(2)
        );

  const percentageWidth = Math.max(
    0,
    (record.score / exam.totalMarks) * 100
  );

  const strongest = subjectAnalysis.find(
  (s) => s.subject === strongestSubject
);

const weakest = subjectAnalysis.find(
  (s) => s.subject === weakestSubject
);

  const marksData = [
    { name: "Positive", value: positiveMarking },
    { name: "Negative", value: negativeMarking },
    { name: "Total Obtained", value: totalMarksObtained },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="max-w-6xl mx-auto">

        {/* DOWNLOAD BUTTON */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md"
          >
            Download Result
          </button>
        </div>

        <div
          ref={resultRef}
          className="bg-white shadow-xl rounded-2xl p-8 space-y-10"
        >
        {/* ================= PERFORMANCE DASHBOARD ================= */}

<div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">

  {/* SCORE */}
  <div className="rounded-2xl border bg-white p-6 shadow-sm">
    <p className="text-sm text-gray-500">
      Final Score
    </p>

    <h2 className="text-4xl font-bold mt-2">
      {record.score}
      <span className="text-lg text-gray-400">
        {" "}
        / {exam.totalMarks}
      </span>
    </h2>

    <p className="text-indigo-600 font-semibold mt-2">
      {record.percentage.toFixed(2)}%
    </p>

    <div className="w-full bg-gray-200 rounded-full h-3 mt-5">
      <div
        className="bg-indigo-600 h-3 rounded-full"
        style={{
          width: `${percentageWidth}%`,
        }}
      />
    </div>
  </div>

  {/* RANK */}

  <div className="rounded-2xl border bg-white p-6 shadow-sm">

    <p className="text-sm text-gray-500">
      Overall Rank
    </p>

    <h2 className="text-4xl font-bold mt-2">
      #{analytics.rank}
    </h2>

    <p className="mt-2 text-gray-600">
      Out of {analytics.totalStudents} Students
    </p>

    <div className="mt-4">

      <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">

        Better than {analytics.percentile}%

      </span>

    </div>

  </div>

  {/* ACCURACY */}

  <div className="rounded-2xl border bg-white p-6 shadow-sm">

    <p className="text-sm text-gray-500">

      Accuracy

    </p>

    <h2 className="text-4xl font-bold mt-2">

      {accuracy}%

    </h2>

    <div className="mt-5 space-y-2 text-sm">

      <div className="flex justify-between">

        <span>Correct</span>

        <span className="font-semibold text-green-600">

          {record.correct}

        </span>

      </div>

      <div className="flex justify-between">

        <span>Incorrect</span>

        <span className="font-semibold text-red-600">

          {record.incorrect}

        </span>

      </div>

      <div className="flex justify-between">

        <span>Skipped</span>

        <span className="font-semibold text-gray-600">

          {record.unanswered}

        </span>

      </div>

    </div>

  </div>

  {/* MARKS LOST */}

  <div className="rounded-2xl border bg-white p-6 shadow-sm">

    <p className="text-sm text-gray-500">

      Marks Lost

    </p>

    <h2 className="text-4xl font-bold text-red-500 mt-2">

      {marksLost.total}

    </h2>

    <div className="mt-5 space-y-2 text-sm">

      <div className="flex justify-between">

        <span>Wrong Answers</span>

        <span>

          -{marksLost.wrong}

        </span>

      </div>

      <div className="flex justify-between">

        <span>Skipped</span>

        <span>

          -{marksLost.skipped}

        </span>

      </div>

    </div>

  </div>

  {/* STRONGEST */}

  <div className="rounded-2xl border bg-green-50 p-6 shadow-sm">

    <p className="text-sm text-gray-500">

      Strongest Subject

    </p>

    <h2 className="text-3xl font-bold text-green-700 mt-3">

      {strongestSubject || "-"}

    </h2>

    <p className="mt-3 text-sm text-gray-600">

      {strongest?.correct ?? 0} Correct

      / {strongest?.total ?? 0}

    </p>

  </div>

  {/* WEAKEST */}

  <div className="rounded-2xl border bg-red-50 p-6 shadow-sm">

    <p className="text-sm text-gray-500">

      Needs Improvement

    </p>

    <h2 className="text-3xl font-bold text-red-600 mt-3">

      {weakestSubject || "-"}

    </h2>

    <p className="mt-3 text-sm text-gray-600">

      {weakest?.correct ?? 0} Correct

      / {weakest?.total ?? 0}

    </p>

  </div>

</div>

          {/* ===== ANALYSIS SECTION ===== */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Correct / Incorrect Pie */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">
                Question Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Correct", value: record.correct },
                      { name: "Incorrect", value: record.incorrect },
                      { name: "Unanswered", value: record.unanswered },
                    ]}
                    dataKey="value"
                    outerRadius={100}
                    label
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#9ca3af" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Difficulty Chart */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">
                Marks Distribution
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={marksData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

         {/* ================= SUBJECT PERFORMANCE ================= */}

<div className="bg-white rounded-2xl border shadow-sm p-6">

  <div className="mb-6">

    <h2 className="text-2xl font-bold">
      Subject Performance
    </h2>

    <p className="text-gray-500 mt-1">
      See where you performed well and where you need improvement.
    </p>

  </div>

  <div className="space-y-5">

    {subjectAnalysis.map((subject) => {

      const progress =
        subject.total === 0
          ? 0
          : (subject.correct / subject.total) * 100;

      return (

        <div
          key={subject.subject}
          className="border rounded-xl p-5 hover:shadow-md transition"
        >

          <div className="flex justify-between items-center mb-3">

            <div>

              <h3 className="text-lg font-semibold">
                {subject.subject}
              </h3>

              <p className="text-sm text-gray-500">

                {subject.correct} Correct · {subject.incorrect} Wrong · {subject.skipped} Skipped

              </p>

            </div>

            <div className="text-right">

              <div className="text-xl font-bold">

                {subject.score}

              </div>

              <div className="text-sm text-gray-500">

                Marks

              </div>

            </div>

          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">

            <div
              className={`h-3 rounded-full ${
                progress >= 80
                  ? "bg-green-500"
                  : progress >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <div className="mt-4 grid grid-cols-4 gap-3 text-center">

            <div>

              <p className="text-xs text-gray-500">
                Accuracy
              </p>

              <p className="font-semibold">

                {subject.percentage}%

              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Correct
              </p>

              <p className="font-semibold text-green-600">

                {subject.correct}

              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Wrong
              </p>

              <p className="font-semibold text-red-600">

                {subject.incorrect}

              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Skipped
              </p>

              <p className="font-semibold text-gray-600">

                {subject.skipped}

              </p>

            </div>

          </div>

        </div>

      );

    })}

  </div>

</div>
{/* ================= LEADERBOARD ================= */}

<div className="bg-white rounded-2xl border shadow-sm p-6">

  <div className="flex items-center justify-between mb-6">

    <div>

      <h2 className="text-2xl font-bold">
        🏆 Top Performers
      </h2>

      <p className="text-gray-500 mt-1">
        Top students in this exam
      </p>

    </div>

    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
      {analytics.totalStudents} Students
    </div>

  </div>

  <div className="space-y-4">

    {topperList.map((student, index) => {

      const isYou = student.email === record.email;

      return (

        <div
          key={student._id}
          className={`flex items-center justify-between rounded-xl border p-4 transition ${
            isYou
              ? "border-indigo-500 bg-indigo-50"
              : "hover:bg-gray-50"
          }`}
        >

          <div className="flex items-center gap-4">

            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
              ${
                index === 0
                  ? "bg-yellow-400 text-white"
                  : index === 1
                  ? "bg-gray-300 text-gray-700"
                  : index === 2
                  ? "bg-orange-300 text-white"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              #{index + 1}
            </div>

            <div>

              <div className="font-semibold text-lg">

                {student.name}

                {isYou && (
                  <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                    YOU
                  </span>
                )}

              </div>

              <div className="text-gray-500 text-sm">

                {student.percentage.toFixed(2)}%

              </div>

            </div>

          </div>

          <div className="text-right">

            <div className="text-2xl font-bold text-indigo-600">

              {student.score}

            </div>

            <div className="text-xs text-gray-500">

              Marks

            </div>

          </div>

        </div>

      );

    })}

  </div>

</div>
        </div>
      </div>
    </div>
  );
}