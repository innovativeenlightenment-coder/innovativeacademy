"use client";

import { useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  LinearProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Question } from "@/types/questionType";
import Loading from "@/app/loading";
import PageContainer from "../../components/container/PageContainer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import TimerIcon from '@mui/icons-material/Timer';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
   LooksOne as QuestionIcon, 
  Score as ScoreIcon, 
  Percent as PercentIcon 
} from '@mui/icons-material';
import QuizIcon from '@mui/icons-material/Quiz';
import { TrophyIcon } from "lucide-react";

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// @ts-ignore
import html2pdf from "html2pdf.js";
import React from "react";
import { progress } from "framer-motion";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { LEVELS } from "@/utils/level_config";
import ResultModal from "./resultModal";
import RenderMath from "@/lib/renderMaths";


function buildTestInsight(params: {
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  duration: number;
  timeLeft: number;
  subject: string;
  chapter: string;
}) {
  const insight = generateInsight(params);

  const emotion =
    params.percentage >= 80
      ? { left: "🌟", right: "🔥", title: "Well Done" }
      : params.percentage >= 50
      ? { left: "🙂", right: "📈", title: "Moving Forward" }
      : params.percentage >= 30
      ? { left: "🌱", right: "🧠", title: "Learning Phase" }
      : { left: "🤍", right: "🌤️", title: "Keep Going" };

  const gainedPoints = Math.floor(6 + Math.random() * 10);

  return {
    insight,
    emotion,
    gainedPoints,
  };
}


const XP_CONFIG = {
  base: 20,
  performance: 15,
  discipline: 5,
  time: 10,
};


export default function ResultPage() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, number>>({});
  const [test, setTest] = useState<{
    course: string;
    chapter: string;
    subject: string;
    questionIds: string[];
    date: string;
    duration: number;
     timeLeft: number;
    totalMarks: number;
    testType: string;
  }>({
    course: "-",
    chapter: "-",
    subject: "-",
    questionIds: [],
    date: "-",
    duration: 0,
    timeLeft:0,
    totalMarks: 0,
    testType: "-"
  });
const [generatingPdf, setGeneratingPdf] = useState(false);
  const [answers, setAnswers] = useState<{ id: string; ans: string; selected: string; }[]>([]);

  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [percentage, setPercentage] = useState("0");



  
 const [openResultModal, setOpenResultModal] = useState(false);

  useEffect(() => {
    // open result modal once result is ready
    setOpenResultModal(true);
  }, []);


  useEffect(() => {
    const stored = sessionStorage.getItem("testResult");

    if (!stored) {
      // If no stored data, try to redirect back to test selection
      window.location.href = '/dashboard/student/start-practice-test';
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const { result, questions, submittedAnswers, testDetails } = parsed;

      setQuestions(questions || []);
      setTest(testDetails);
        setSubmittedAnswers(submittedAnswers || {});
        // If result.Answers present use it, otherwise construct from submittedAnswers + questions
        if (result?.Answers && result.Answers.length > 0) {
          setAnswers(result.Answers);
        } else {
          const fallback: { id: string; ans: string; selected: string; }[] = [];
          (questions || []).forEach((q: any) => {
            const sel = (submittedAnswers || {})[q._id];
            fallback.push({ id: q._id, ans: q.answer || "", selected: sel || "Skipped" });
          });
          setAnswers(fallback);
        }

      setCorrectCount(result?.correct || 0);
      setIncorrectCount(result?.incorrect || 0);
      setUnansweredCount(result?.unanswered?.length || 0);
      setScore(result?.score || 0);
      setPercentage(result?.percentage?.toFixed?.(2) || "0.00");

      setLoading(false);
      
      // Keep data for 5 minutes
      setTimeout(() => sessionStorage.removeItem("testResult"), 30000000); //300000
    } catch (err) {
      console.error("Session parse error:", err);
      setLoading(false);
    }
  }, []);

const handleDownload = async (e: { preventDefault: () => void }) => {
  e.preventDefault();
  const element = document.getElementById("result-pdf");
  if (!element) return;

  setGeneratingPdf(true);
  element.style.display = "block";

  const parts = [`${test.course}`];
  if (test.subject && test.subject !== "-") parts.push(test.subject);
  if (test.chapter && test.chapter !== "-") parts.push(test.chapter);
  if (test.date) parts.push(new Date(test.date).toISOString().slice(0, 10));
  const filename = `test-result-${parts.join('-')}.pdf`;

  const opt = {
    margin:       0.2,
    filename:     filename,
    image:        { type: "jpeg", quality: 1 },
    html2canvas:  { dpi: 300, useCORS: true, scrollY: 0, scale: 2 },
    jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak:    { mode: ["avoid-all", "css", "legacy"] },
  };

  const html2pdf = (await import("html2pdf.js")).default;
  
  html2pdf().set(opt).from(element).save().then(() => {
    element.style.display = "none";
    setGeneratingPdf(false);
  });
};


// const handlePrint = () => {
//     window.print();
//   };

  if (loading) {
    return <Loading />;
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "#4caf50";
    if (percentage >= 80) return "#8bc34a";
    if (percentage >= 70) return "#ff9800";
    if (percentage >= 60) return "#ff5722";
    return "#f44336";
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    return "F";
  };

const formatDuration = (totalSeconds: number) => {
  // Ensure integer seconds

  const seconds = Math.floor(totalSeconds);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  let parts = [];

  if (h > 0) parts.push(`${h} ${h === 1 ? 'hr' : 'hrs'}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? 'min' : 'mins'}`);
  if (s > 0 || parts.length === 0) parts.push(`${s} ${s === 1 ? 'sec' : 'secs'}`);

  return parts.join(' ');
};





  return (
    <>
    
 <>
 
  <div className="min-h-screen bg-[#f7f8fc] px-4 py-6 md:px-8">
    <div className="mx-auto max-w-6xl">

      {/* ================= TOP BAR ================= */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Practice Test
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900 md:text-3xl">
            Test Review
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {test.course}
            {test.subject && test.subject !== "-" && ` • ${test.subject}`}
            {test.chapter && test.chapter !== "-" && ` • ${test.chapter}`}
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={generatingPdf}
          className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {generatingPdf ? "Generating..." : "Download Result"}
        </button>
      </div>


      {/* ================= RESULT HERO ================= */}

      <div
        className="mb-5 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200"
      >
        <div className="grid md:grid-cols-[1fr_220px]">

          {/* LEFT */}

          <div className="p-6 md:p-8">

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                🎯
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Your performance
                </p>

                <h2 className="text-xl font-bold text-gray-900">
                  {Number(percentage) >= 80
                    ? "Great work!"
                    : Number(percentage) >= 60
                    ? "Good attempt!"
                    : "Keep improving!"}
                </h2>
              </div>
            </div>


            {/* PROGRESS */}

            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  Accuracy
                </span>

                <span className="font-bold text-gray-900">
                  {percentage}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(Number(percentage), 0),
                      100
                    )}%`,
                    backgroundColor: getGradeColor(
                      Number(percentage)
                    ),
                  }}
                />
              </div>
            </div>


            {/* STATS */}

            <div className="grid grid-cols-3 gap-3">

              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-xs font-medium text-green-700">
                  Correct
                </p>

                <p className="mt-1 text-2xl font-bold text-green-700">
                  {correctCount}
                </p>
              </div>


              <div className="rounded-2xl bg-red-50 p-4">
                <p className="text-xs font-medium text-red-700">
                  Wrong
                </p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  {incorrectCount}
                </p>
              </div>


              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-600">
                  Skipped
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-700">
                  {unansweredCount}
                </p>
              </div>

            </div>

          </div>


          {/* SCORE */}

          <div className="flex flex-col items-center justify-center bg-gray-900 p-8 text-white">

            <p className="text-sm text-gray-400">
              Score
            </p>

            <p className="mt-2 text-6xl font-bold">
              {score}
            </p>

            <div className="mt-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              Grade {getGrade(Number(percentage))}
            </div>

            <p className="mt-5 text-center text-xs text-gray-400">
              {correctCount} correct out of {questions.length}
            </p>

          </div>

        </div>
      </div>


      {/* ================= WHAT TO DO NEXT ================= */}

      <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

        <div className="mb-5">
          <p className="text-sm font-semibold text-indigo-600">
            AFTER THIS TEST
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900">
            What should you focus on?
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <div className="mb-3 text-xl">
              💪
            </div>

            <h3 className="font-bold text-green-800">
              Keep your strengths
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              You answered {correctCount} questions correctly.
              Don't just move on—understand why those answers
              were correct.
            </p>
          </div>


          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="mb-3 text-xl">
              🎯
            </div>

            <h3 className="font-bold text-red-800">
              Fix your mistakes
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              You have {incorrectCount} incorrect answers.
              These are your most important questions to review.
            </p>
          </div>


          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="mb-3 text-xl">
              📚
            </div>

            <h3 className="font-bold text-amber-800">
              Attempt the skipped ones
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              You skipped {unansweredCount} questions.
              Try them again after revision.
            </p>
          </div>

        </div>
      </div>


      {/* ================= QUESTION REVIEW ================= */}

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

        <div className="mb-6">

          <p className="text-sm font-semibold text-indigo-600">
            LEARN FROM YOUR TEST
          </p>

          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            Question Review
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Don't just see the answer. Understand what you need
            to improve next time.
          </p>

        </div>


        <div className="space-y-4">

          {questions.map((question, index) => {

            /*
             * IMPORTANT:
             * Keep your existing submittedAnswers structure.
             * We only use it here to display the result.
             */

            const selectedAnswer =
              submittedAnswers[question._id];

            const selectedLetter =
              selectedAnswer !== undefined &&
              selectedAnswer !== null
                ? String.fromCharCode(65 + Number(selectedAnswer))
                : "";

            const correctLetter = question.answer;

            const isSkipped =
              selectedAnswer === undefined ||
              selectedAnswer === null;

            const isCorrect =
              !isSkipped &&
              selectedLetter === correctLetter;

            const isIncorrect =
              !isSkipped &&
              selectedLetter !== correctLetter;


            return (
              <div
                key={question._id}
                className={`overflow-hidden rounded-2xl border ${
                  isCorrect
                    ? "border-green-200"
                    : isIncorrect
                    ? "border-red-200"
                    : "border-gray-200"
                }`}
              >

                {/* QUESTION HEADER */}

                <div
                  className={`flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between ${
                    isCorrect
                      ? "bg-green-50"
                      : isIncorrect
                      ? "bg-red-50"
                      : "bg-gray-50"
                  }`}
                >

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="font-bold text-gray-900">
                      Q{index + 1}
                    </span>

                    <span className="text-gray-300">
                      |
                    </span>

                    <span className="text-sm text-gray-600">
                      {question.subject}
                    </span>

                    <span className="text-gray-300">
                      •
                    </span>

                    <span className="text-sm text-gray-600">
                      {question.chapter}
                    </span>

                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500">
                      {question.level}
                    </span>

                  </div>


                  <div>

                    {isCorrect && (
                      <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                        ✓ CORRECT
                      </span>
                    )}

                    {isIncorrect && (
                      <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                        ✕ NEEDS REVIEW
                      </span>
                    )}

                    {isSkipped && (
                      <span className="rounded-full bg-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600">
                        ○ SKIPPED
                      </span>
                    )}

                  </div>

                </div>


                {/* QUESTION BODY */}

                <div className="p-5">

                  {/* QUESTION */}

                  <div className="mb-5">

                    {question.question?.text && (
  <div className="text-base font-semibold leading-7 text-gray-900 md:text-lg">
    <RenderMath text={question.question.text} />
  </div>
)}

                    {question.question?.imgUrl && (
                      <img
                        src={question.question.imgUrl}
                        alt={`Question ${index + 1}`}
                        className="mt-4 max-h-72 rounded-xl object-contain"
                      />
                    )}

                  </div>


                  {/* OPTIONS */}

                  <div className="grid gap-3 md:grid-cols-2">

                    {question.options.map(
                      (option, optionIndex) => {

                        const letter =
                          String.fromCharCode(
                            65 + optionIndex
                          );

                        const correct =
                          letter === correctLetter;

                        const selected =
                          letter === selectedLetter;


                        return (
                          <div
                            key={optionIndex}
                            className={`rounded-xl border p-4 ${
                              correct
                                ? "border-green-300 bg-green-50"
                                : selected
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 bg-gray-50/50"
                            }`}
                          >

                            <div className="flex items-start gap-3">

                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                  correct
                                    ? "bg-green-200 text-green-800"
                                    : selected
                                    ? "bg-red-200 text-red-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {letter}
                              </div>


                              <div className="flex-1">

                               {option.text && (
  <div className="text-sm leading-6 text-gray-800">
    <RenderMath text={option.text} />
  </div>
)}

                                {option.imgUrl && (
                                  <img
                                    src={option.imgUrl}
                                    alt={`Option ${letter}`}
                                    className="mt-2 max-h-36 rounded-lg object-contain"
                                  />
                                )}

                              </div>


                              {correct && (
                                <span className="text-xs font-bold text-green-700">
                                  Correct
                                </span>
                              )}

                              {selected && !correct && (
                                <span className="text-xs font-bold text-red-700">
                                  You chose
                                </span>
                              )}

                            </div>

                          </div>
                        );

                      }
                    )}

                  </div>


                  {/* ANSWER RESULT */}

                  <div className="mt-5 grid gap-3 md:grid-cols-2">

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Your answer
                      </p>

                      <p
                        className={`mt-1 text-lg font-bold ${
                          isCorrect
                            ? "text-green-600"
                            : isIncorrect
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {isSkipped
                          ? "Not attempted"
                          : selectedLetter}
                      </p>

                    </div>


                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                        Correct answer
                      </p>

                      <p className="mt-1 text-lg font-bold text-green-700">
                        {correctLetter}
                      </p>

                    </div>

                  </div>


                  {/* HINT */}

                  {question.hint &&
                    (question.hint.text ||
                      question.hint.imgUrl) && (

                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">

                      <div className="flex items-start gap-3">

                        <span className="text-lg">
                          💡
                        </span>

                        <div>

                          <p className="text-sm font-bold text-indigo-700">
                            Hint
                          </p>

                      {question.hint.text && (
  <div className="mt-1 text-sm leading-6 text-gray-700">
    <RenderMath text={question.hint.text} />
  </div>
)}
                          {question.hint.imgUrl && (
                            <img
                              src={question.hint.imgUrl}
                              alt="Hint"
                              className="mt-3 max-h-40 rounded-lg object-contain"
                            />
                          )}

                        </div>

                      </div>

                    </div>
                  )}


                  {/* LEARNING MESSAGE */}

                  <div className="mt-4">

                    {isCorrect && (
                      <div className="rounded-xl bg-green-50 px-4 py-3">
                        <p className="text-sm font-medium text-green-700">
                          ✓ Good. You understood this question.
                          Keep this concept strong.
                        </p>
                      </div>
                    )}

                    {isIncorrect && (
                      <div className="rounded-xl bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-red-700">
                          ⚠ You should review this question.
                          Check the correct answer and hint, then
                          try a similar question again.
                        </p>
                      </div>
                    )}

                    {isSkipped && (
                      <div className="rounded-xl bg-gray-50 px-4 py-3">
                        <p className="text-sm font-medium text-gray-600">
                          📚 You skipped this question. Try it again
                          after revising {question.chapter}.
                        </p>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>


      {/* ================= FINAL MESSAGE ================= */}

      <div className="mt-6 rounded-3xl bg-gray-900 p-8 text-center text-white">

        <p className="text-2xl font-bold">
          Your mistakes are your study list. 🚀
        </p>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-400">
          Don't just check your score and leave.
          Review the incorrect and skipped questions,
          understand them, and come back stronger in your next test.
        </p>

      </div>

    </div>


    {/* ================= PDF AREA ================= */}

    <div
      id="result-pdf"
      style={{ display: "none" }}
      className="bg-white p-8"
    >

      <h1 className="text-2xl font-bold">
        Practice Test Result
      </h1>

      <p className="mt-2">
        {test.course} • {test.subject} • {test.chapter}
      </p>

      <div className="mt-5">
        <p>
          Score: <b>{score}</b>
        </p>

        <p>
          Percentage: <b>{percentage}%</b>
        </p>

        <p>
          Correct: <b>{correctCount}</b>
        </p>

        <p>
          Incorrect: <b>{incorrectCount}</b>
        </p>

        <p>
          Skipped: <b>{unansweredCount}</b>
        </p>
      </div>

    </div>
  </div>
</>
    </>
  );
}

function generateInsight(params: {
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  duration: number;
  timeLeft?: number;
  subject: string;
  chapter: string;
}) {
  const {
    correct,
    incorrect,
    unanswered,
    percentage,
    duration,
    timeLeft = 0,
    subject,
    chapter,
  } = params;

  const attempted = correct + incorrect;
  const total = attempted + unanswered;
  const attemptRatio = total ? attempted / total : 0;
  const timeUsedRatio = duration ? (duration - timeLeft) / duration : 0;

  // 🌱 Low score but high courage
  if (percentage < 40 && attemptRatio > 0.75) {
    return "Even when results feel low, showing up fully is a powerful habit. This effort builds inner strength that marks can’t measure.";
  }

  // 🧠 Calm effort, no panic
  if (timeUsedRatio < 0.8 && percentage >= 40) {
    return "You stayed calm and controlled throughout the test. That emotional balance is a real-life skill, not just an exam skill.";
  }

  // 🔁 Learning phase
  if (incorrect > correct) {
    return "Mistakes today are feedback, not failure. Every strong performer has passed through this exact phase.";
  }

  // 🔥 High focus attempt
  if (attemptRatio > 0.9) {
    return "You faced almost every question without avoidance. That courage to try is what separates learners from quitters.";
  }

  // ⏳ Time struggle but persistence
  if (timeUsedRatio > 0.95) {
    return "You pushed till the very end. Persistence under pressure is a rare and valuable trait.";
  }

  // 🌟 Strong performance
  if (percentage >= 80) {
    return `This test reflects maturity in ${chapter}. Keep this rhythm — not for marks, but for mastery.`;
  }

  // 🌈 Neutral encouragement
  return "Progress is not loud every day. Quiet effort like this compounds into confidence over time.";
}

function getEmotionSet(percentage: number) {
  if (percentage >= 80)
    return { left: "🌟", right: "🔥", title: "Well Done" };

  if (percentage >= 50)
    return { left: "🙂", right: "📈", title: "Moving Forward" };

  if (percentage >= 30)
    return { left: "🌱", right: "🧠", title: "Learning Phase" };

  return { left: "🤍", right: "🌤️", title: "Keep Going" };
}

const delay = (ms: number) =>
  new Promise((res) => setTimeout(res, ms));

const animateNumber = (
  from: number,
  to: number,
  cb: (v: number) => void
) => {
  const duration = 600;
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(from + (to - from) * progress);
    cb(value);
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};
