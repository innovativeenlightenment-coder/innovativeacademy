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
// const [resultInsight, setResultInsight] = useState("");
// const [emotionSet, setEmotionSet] = useState<{ left: string; right: string; title: string } | null>(null);
// // const [gainedPoints, setGainedPoints] = useState(0);
// // const [progress, setProgress] = useState(10);
// // const [showPoints, setShowPoints] = useState(false);


// // const [xpSteps, setXpSteps] = useState<
// //   { label: string; value: number; visible: boolean }[]
// // >([]);

// // const [totalXP, setTotalXP] = useState(0);


// // useEffect(() => {
// //   if (!openResultModal) return;

// //   // Reset everything
// //   setProgress(0);
// //   setShowPoints(false);
// //   setTotalXP(0);

// //   const steps = [
// //     { label: "Base XP (Test Attempt)", value: XP_CONFIG.base },
// //     { label: "Performance Bonus", value: XP_CONFIG.performance },
// //     { label: "Discipline Bonus", value: XP_CONFIG.discipline },
// //     { label: "Time Mastery Bonus", value: XP_CONFIG.time },
// //   ];

// //   setXpSteps(steps.map(s => ({ ...s, visible: false })));

// //   let accumulated = 0;

// //   steps.forEach((step, index) => {
// //     setTimeout(() => {
// //       accumulated += step.value;

// //       setXpSteps(prev =>
// //         prev.map((s, i) =>
// //           i === index ? { ...s, visible: true } : s
// //         )
// //       );

// //       setTotalXP(accumulated);
// //     }, 600 * (index + 1));
// //   });

// //   // After all XP lines
// //   setTimeout(() => {
// //     setShowPoints(true);

// //     // Smooth progress animation (single run)
// //     const target = 60; // pretend user is now at 60%
// //     let start = 0;
// //     const duration = 1200;
// //     const startTime = performance.now();

// //     const animate = (time: number) => {
// //       const elapsed = time - startTime;
// //       const progressValue = Math.min(
// //         start + (elapsed / duration) * target,
// //         target
// //       );
// //       setProgress(progressValue);

// //       if (elapsed < duration) {
// //         requestAnimationFrame(animate);
// //       }
// //     };

// //     requestAnimationFrame(animate);
// //   }, 600 * (steps.length + 1));

// // }, [openResultModal]);


// // After your sessionStorage parsing and state setup
// useEffect(() => {
//   if (!loading) {
//     const result = buildTestInsight({
//       correct: correctCount,
//       incorrect: incorrectCount,
//       unanswered: unansweredCount,
//       percentage: Number(percentage),
//       duration: test.duration,
//       timeLeft: test.timeLeft,
//       subject: test.subject,
//       chapter: test.chapter,
//     });

//     setResultInsight(result.insight);
//     setEmotionSet(result.emotion);
//     setGainedPoints(result.gainedPoints);
//     setOpenResultModal(true);
//   }
// }, [loading, correctCount, incorrectCount, unansweredCount, percentage, test]);


// // useEffect(() => {
// //   if (!openResultModal) return;

// //   setProgress(10);
// //   setShowPoints(false);

// //   const start = 10;
// //   const end = 40;
// //   const duration = 2000; // ms
// //   const startTime = performance.now();

// //   const animate = (time: number) => {
// //     const elapsed = time - startTime;
// //     const progressValue = Math.min(
// //       start + (elapsed / duration) * (end - start),
// //       end
// //     );

// //     setProgress(progressValue);

// //     if (progressValue < end) {
// //       requestAnimationFrame(animate);
// //     } else {
// //       setShowPoints(true);
// //     }
// //   };

// //   requestAnimationFrame(animate);
// // }, [openResultModal]);


// // XP + Level
// const [currentLevel, setCurrentLevel] = useState(1);
// const [nextLevel, setNextLevel] = useState(2);
// const [levelName, setLevelName] = useState("");
// const [pointsBefore, setPointsBefore] = useState(0);
// const [pointsAfter, setPointsAfter] = useState(0);

// // Progress %
// const [progress, setProgress] = useState(0);

// // XP breakdown animation
// const [xpSteps, setXpSteps] = useState<
//   { label: string; value: number; visible: boolean }[]
// >([
//   { label: "Base XP", value: 0, visible: false },
//   { label: "Score Bonus", value: 0, visible: false },
//   { label: "Time Bonus", value: 0, visible: false },
// ]);

// const [totalXP, setTotalXP] = useState(0);
// const [showPoints, setShowPoints] = useState(false);
// const [gainedPoints, setGainedPoints] = useState(0);


// // useEffect(() => {
// //   if (!openResultModal) return;

// //   const runXPFlow = async () => {
// //     // reset UI
// //     setProgress(0);
// //     setShowPoints(false);
// //     setTotalXP(0);
// //     setXpSteps((s) => s.map(x => ({ ...x, visible: false, value: 0 })));
// //     const userData=await getCurrentUser()
// //     const res = await fetch("/api/Add-Points", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         userId: userData.user._id, // 🔴 make sure this exists
// //         scorePercent: Number(percentage),
// //         timeUsed: test.duration - test.timeLeft,
// //         totalTime: test.duration,
// //         attemptedQuestions: ((questions.length)+1)-(unansweredCount+1),
// //     totalQuestions: (questions.length)+1,
// //       }),
// //     });

// //     const data = await res.json();

// //     if (!data.success) return;

// //     // save backend truth
// //     setCurrentLevel(data.level);
// //     setLevelName(data.levelName);
// //     setPointsBefore(data.previousPoints);
// //     setPointsAfter(data.totalPoints);
// //     setGainedPoints(data.gainedPoints);
// //     setNextLevel(data.level + 1);

// //     animateXP(data);
// //   };

// //   runXPFlow();
// // }, [openResultModal]);

// // const animateXP = async (data: any) => {
// //   const steps = [
// //     { label: "Base XP", value: 20 },
// //     { label: "Score Bonus", value: data.gainedPoints >= 40 ? 20 : 0 },
// //     {
// //       label: "Time Bonus",
// //       value: data.gainedPoints > 40 ? data.gainedPoints - 40 : 0,
// //     },
// //   ];

// //   let runningTotal = 0;

// //   for (let i = 0; i < steps.length; i++) {
// //     await delay(500);

// //     animateNumber(0, steps[i].value, (val) => {
// //       setXpSteps((prev) => {
// //         const copy = [...prev];
// //         copy[i] = { ...copy[i], value: val, visible: true };
// //         return copy;
// //       });
// //     });

// //     runningTotal += steps[i].value;
// //   }

// //   // show total
// //   await delay(400);
// //   animateNumber(0, runningTotal, (val) => setTotalXP(val));

// //   // fly XP to bar
// //   await delay(600);
// //   setShowPoints(true);

// //   // progress bar move
// //   await delay(300);
// //   animateProgress();
// // };

// // const animateProgress = () => {
// //   // get current & next level ranges
// //   const currentLevelData = LEVELS.find(
// //     (l) => l.level === currentLevel
// //   );
// //   const nextLevelData = LEVELS.find(
// //     (l) => l.level === nextLevel
// //   );

// //   if (!currentLevelData || !nextLevelData) return;

// //   const levelRange =
// //     nextLevelData.minPoints - currentLevelData.minPoints;

// //   const progressPercent =
// //     ((pointsAfter - currentLevelData.minPoints) / levelRange) * 100;

// //   animateNumber(0, progressPercent, (val) =>
// //     setProgress(val)
// //   );

// //   // optional sound
// //   new Audio("/sounds/xp.mp3").play().catch(() => {});
// // };

// useEffect(() => {
//   if (!openResultModal) return;

//   const runXPFlow = async () => {
//     // reset UI
//     setProgress(0);
//     setShowPoints(false);
//     setTotalXP(0);
//     setXpSteps((s) => s.map((x) => ({ ...x, visible: false, value: 0 })));

//     const userData = await getCurrentUser();

//     const res = await fetch("/api/Add-Points", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         userId: userData.user._id,
//         scorePercent: Number(percentage),
//         timeUsed: test.duration - test.timeLeft,
//         totalTime: test.duration,
//         attemptedQuestions: questions.length - unansweredCount,
//         totalQuestions: questions.length,
//       }),
//     });

//     const data = await res.json();
//     if (!data.success) return;

//     // Save backend truth
//     setCurrentLevel(data.level);
//     setLevelName(data.levelName);
//     setPointsBefore(data.previousPoints);
//     setPointsAfter(data.totalPoints);
//     setNextLevel(data.level + 1);

//     // Use points breakdown from backend
//     const steps = [
//       { label: "Base XP", value: data.pointsBreakdown.basePoints },
//       { label: "Score Bonus", value: data.pointsBreakdown.scorePoints },
//       { label: "Time Bonus", value: data.pointsBreakdown.timePoints },
//     ];

//     // Animate XP step by step
//     let runningTotal = 0;
//     for (let i = 0; i < steps.length; i++) {
//       await delay(500);

//       animateNumber(0, steps[i].value, (val) => {
//         setXpSteps((prev) => {
//           const copy = [...prev];
//           copy[i] = { ...copy[i], value: val, visible: true };
//           return copy;
//         });
//       });

//       runningTotal += steps[i].value;
//     }

//     // Animate total XP
//     await delay(400);
//     animateNumber(0, runningTotal, (val) => setTotalXP(val));

//     // Fly points to progress bar
//     await delay(600);
//     setShowPoints(true);

//     // Animate progress bar
//     await delay(300);
//     animateProgressBar(data);
//   };

//   runXPFlow();
// }, [openResultModal]);

// // -----------------------
// // Progress Bar Animation
// // -----------------------
// const animateProgressBar = (data: any) => {
//   const currentLevelData = LEVELS.find((l) => l.level === data.level);
// const nextLevelData = LEVELS.find((l) => l.level === data.level + 1);

// // If currentLevelData is missing, fallback to first level
// if (!currentLevelData) return;

// // If max level, hide progress bar
// if (!nextLevelData || data.level === LEVELS[LEVELS.length - 1].level) {
//   setProgress(100);
//   return;
// }

// const levelRange = nextLevelData.minPoints - currentLevelData.minPoints;
// const pointsIntoLevel = data.totalPoints - currentLevelData.minPoints;
// const targetPercent = Math.min((pointsIntoLevel / levelRange) * 100, 100);

// animateNumber(0, targetPercent, (val) => setProgress(val));


//   // Play XP sound
//   new Audio("/sounds/xp.mp3").play().catch(() => {});
// };

// // -----------------------
// // Generic number animation helper
// // -----------------------
// function animateNumber(start: number, end: number, callback: (val: number) => void, duration = 800) {
//   const startTime = performance.now();
//   const step = (time: number) => {
//     const elapsed = time - startTime;
//     const progress = Math.min(elapsed / duration, 1);
//     const value = Math.round(start + (end - start) * progress);
//     callback(value);
//     if (progress < 1) requestAnimationFrame(step);
//   };
//   requestAnimationFrame(step);
// }

// // -----------------------
// // Simple delay
// // -----------------------
// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }


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

// const handleDownload = (e: { preventDefault: () => void; }) => {
//   e.preventDefault();
//   const element = document.getElementById("result-pdf");
//   if (!element) return;
// setGeneratingPdf(true);
//   // Show element for PDF rendering
//   element.style.display = "block";

//     const parts = [`${test.course}`];
//   if (test.subject && test.subject !== "-") parts.push(test.subject);
//   if (test.chapter && test.chapter !== "-") parts.push(test.chapter);
//   if (test.date) parts.push(new Date(test.date).toISOString().slice(0, 10));
//   const filename = `test-result-${parts.join('-')}.pdf`;

//   const opt = {
//     margin:       0.2, // mm
//     filename:     filename,
//     image:        { type: "jpeg", quality: 1 },
//     html2canvas:  { dpi: 300, useCORS: true, scrollY: 0, scale: 2 },
//     jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" },
//     pagebreak:    { mode: ["avoid-all", "css", "legacy"] },
//   };

//   html2pdf().set(opt).from(element).save().then(() => {
//     element.style.display = "none"; // hide after PDF
//     setGeneratingPdf(false);
//   });
// };

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
      {/* Print-specific CSS */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          .MuiBox-root {
            break-inside: avoid;
          }
          
          .MuiCard-root {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          
          .MuiTableContainer-root {
            break-inside: avoid;
          }
          
          .MuiTableRow-root {
            break-inside: avoid;
          }
          
          .MuiTableCell-root {
            border: 1px solid #ddd !important;
          }
          
          .MuiButton-root {
            display: none !important;
          }
          
          .MuiChip-root {
            border: 1px solid #ddd !important;
          }
          
          .MuiIcon-root {
            display: none !important;
          }
          
          .MuiGrid-container {
            break-inside: avoid;
          }
          
          .MuiGrid-item {
            break-inside: avoid;
          }
          
          /* Ensure proper page breaks */
          .MuiCard-root:first-child {
            page-break-after: auto;
          }
          
          .MuiCard-root:last-child {
            page-break-before: auto;
          }
          
          /* Hide action buttons when printing */
          .print-hide {
            display: none !important;
          }
        }
          @keyframes floatUp {
  0% { transform: translateY(0); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: translateY(-24px); opacity: 0; }
}
  @keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(-10px);
  }
}

      `}</style>
      
      <Box sx={{
        maxWidth: "100vw",
        "@media (min-width: 1200px)": {
          maxWidth: "calc(100vw - 335px)",
        },
        overflowX: "hidden",
        margin:'0 auto',
      }}>
        <PageContainer title="Test Result" description="View your test results">
          <Box p={3}>
            {/* Header with Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }} className="print-hide">
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Test Results
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  id="download-btn"
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  sx={{ 
                    backgroundColor: '#4caf50',
                    '&:hover': { backgroundColor: '#45a049' }
                  }}
                  disabled={generatingPdf}
                >
                  {generatingPdf ? "Generating PDF" : "Download PDF"}
                </Button>
                {/* <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ borderColor: '#1976d2', color: '#1976d2' }}
                >
                  Print
                </Button> */}
              </Box>
            </Box>


{/* Show Result Card */}
            <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3 }} className="web-only">
              <CardContent sx={{ p: 2 }}>
                {/* Academy Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Innovative Academy
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Excellence in Education
                    </Typography>
                  </Box>
                  <Box>                  <span 
  className="chip" 
  style={{ backgroundColor: "#1976d2", color: "white", fontWeight: 700, padding: "4px 22px 4px 22px", fontSize: "1rem", flexWrap:"wrap", gap:"10px" , verticalAlign: "middle" }}
>
  {test.course.toUpperCase()}
</span>
</Box>

                
                </Box>

                {/* Test Details Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2.5} lg={2}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <SchoolIcon sx={{ fontSize: 25, color: '#1976d2', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                        {test.course}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Course
                      </Typography>
                    </Box>
                  </Grid>
                  {test.subject && test.subject !== "-" && (
                    <Grid item xs={12} sm={6} md={2.5} lg={2}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <AssignmentIcon sx={{ fontSize: 25, color: '#ff9800', mb: 0.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                          {test.subject}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Subject
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {test.chapter && test.chapter !== "-" && (
                    <Grid item xs={12} sm={6} md={2.5} lg={2}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <MenuBookIcon sx={{ fontSize: 25, color: '#9c27b0', mb: 0.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                          {test.chapter}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Chapter
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} md={2.5} lg={2}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <TimerIcon sx={{ fontSize: 25, color: '#4caf50', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                        {/* test.duration is in seconds; show hrs:mins when appropriate */}
                                                                     {/* {test.duration >= 3600
                                                                            ? `${test.duration / 3600}h ${test.duration % 3600 / 60}m`
                                                                        : test.duration >= 60
                                                                                           ? `${test.duration / 60}m`
                                                                          : `${test.duration}s`} */}
                                                                          {formatDuration(test.duration)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.5} lg={2}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                       <EmojiEventsIcon  sx={{ fontSize: 25, color: '#0f5d7eff', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                        {test.questionIds.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Questions
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Score Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#e8f5e8', 
                      border: '2px solid #4caf50',
                      textAlign: 'center',
                      p: 1
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 25, color: '#4caf50', mb: 0.5 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#2e7d32' }}>
                        {correctCount}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#2e7d32' }}>
                        Correct
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#ffebee', 
                      border: '2px solid #f44336',
                      textAlign: 'center',
                      p: 1
                    }}>
                      <CancelIcon sx={{ fontSize: 25, color: '#f44336', mb: 0.5 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#c62828' }}>
                        {incorrectCount}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#c62828' }}>
                        Incorrect
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#f5f5f5', 
                      border: '2px solid #9e9e9e',
                      textAlign: 'center',
                      p: 1
                    }}>
                      <HelpIcon sx={{ fontSize: 25, color: '#9e9e9e', mb: 0.5 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#616161' }}>
                        {unansweredCount}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#616161' }}>
                        Skipped
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#e3f2fd', 
                      border: '2px solid #2196f3',
                      textAlign: 'center',
                      p: 1
                    }}>
                      <EmojiEventsIcon sx={{ fontSize: 25, color: '#2196f3', mb: 0.5, textAlign: "center", margin: "auto" }} />
                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#1976d2' }}>
                        {score}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#1976d2' }}>
                        Score
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#fff3e0', 
                      border: '2px solid #ff9800',
                      textAlign: 'center',
                      p: 1
                    }}>
                       <PercentIcon sx={{ fontSize: 25, color: '#ff9800', mb: 0.5 }}  /> 

                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#f57c00' }}>
                        {percentage}%
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#f57c00' }}>
                        Percentage
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Grade Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: getGradeColor(parseFloat(percentage)),
                  borderRadius: 2,
                  mb: 1
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'semibold', 
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    Grade: {getGrade(parseFloat(percentage))}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
                    {parseFloat(percentage) >= 60 ? 'Congratulations! You passed!' : 'Keep practicing to improve!'}
                  </Typography>
                </Box>

                {/* Test Date */}
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  mb: 3,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 'semibold' }}>
                    Test Date: {new Date(test.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>

                {/* Question-wise Analysis */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'semibold', mb: 3, color: '#1976d2' }}>
                    Question-wise Analysis
                  </Typography>
                  
                  <TableContainer component={Paper} elevation={1} sx={{ border: "1px solid #e0e0e0" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ 
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            fontSize: "12px",
                            py: 2,
                            px: 1,
                            maxWidth: "60px",
                            fontWeight: 'semibold'
                          }}>
                            No.
                          </TableCell>
                          <TableCell sx={{ 
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            fontSize: "12px",
                            py: 2,
                            px: 1,
                            fontWeight: 'semibold'
                          }}>
                            Question & Options
                          </TableCell>
                          <TableCell sx={{ 
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            fontSize: "12px",
                            py: 2,
                            px: 1,
                            maxWidth: "250px",
                            fontWeight: 'semibold'
                          }}>
                            Hint
                          </TableCell>
                          <TableCell sx={{ 
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            fontSize: "12px",
                            py: 2,
                            px: 1,
                            maxWidth: "220px",
                            fontWeight: 'semibold'
                          }}>
                            Your Answer & Result
                          </TableCell>
                        </TableRow>
                      </TableHead>
                     
                     <TableBody>
  {test.testType === "mock"
    ?
    
     Array.from(
        questions.reduce((acc, q, i) => {
          const group = acc.get(q.subject) || [];
          group.push({ ...q, index: i });
          acc.set(q.subject, group);
          return acc;
        }, new Map<string, (Question & { index: number })[]>())
      ).map(([subject, subjectQuestions]) => (
        <React.Fragment key={subject}>
          {/* Subject Header Row */}
          <TableRow>
            <TableCell colSpan={4} align="center" sx={{
              fontWeight: 'bold',
              fontSize: "14px",
              backgroundColor: "#e0e0e0",
              textTransform: "uppercase",
            }}>
              {subject}
            </TableCell>
          </TableRow>

          {/* Only show questions where q.subject === subject */}
          {subjectQuestions.map((q, subjIdx) => {
            console.log(subjectQuestions,subject)
            console.log("Rendering question:", q._id, "under subject:", subject);
            if (q.subject !== subject) return null;

            const answerObj = answers.find(a => a.id === q._id);
            const selected = answerObj;
            const result =
              selected?.selected.toLowerCase() === "skipped"
                ? "⧗ Skipped"
                : selected?.selected === q.answer
                ? "✅ Correct"
                : "❌ Incorrect";
            const color =
              result === "✅ Correct"
                ? "#4caf50"
                : result === "❌ Incorrect"
                ? "#f44336"
                : "#9e9e9e";
console.log("Selected answer:", selected?.selected, "Correct answer:", q.answer, "Result:", result, subjIdx);
            return (
              <TableRow key={q._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                <TableCell sx={{
                  border: "1px solid #e0e0e0",
                  py: 2,
                  px: 1,
                  textAlign: "center",
                  maxWidth: "60px"
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', color: '#1976d2' }}>
                    {subjIdx + 1}
                  </Typography>
                </TableCell>

                <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    {q.questionType === "text" ? (
                      <Typography variant="body1" sx={{ fontSize: "12px", fontWeight: 500, mb: 2 }}>
                        {q.question.text}
                      </Typography>
                    ) : (
                      <Box component="img"
                        src={q.question.imgUrl}
                        alt="question"
                        crossOrigin="anonymous"
                        sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', mb: 2 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ pl: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'semibold', mb: 1, color: '#666' }}>
                      Options:
                    </Typography>
                    {q.options.map((option, idx) => (
                      <Box key={idx} sx={{
                        mb: 1,
                        pl: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <span className="chip" style={{ backgroundColor: "#e3f2fd", color: "#2A3547", fontWeight:"300", padding: "6px 12px" }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {q.optionType === "text" ? (
                          <Typography variant="body2" sx={{ fontSize: "12px" }}>
                            {option.text}
                          </Typography>
                        ) : (
                          <Box component="img"
                            src={option.imgUrl}
                            alt="option"
                            crossOrigin="anonymous"
                            sx={{ maxWidth: '60px', objectFit: 'contain' }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </TableCell>

                <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 2, maxWidth: "240px", minWidth:"180px" }}>
                  {q.hintType === "text" ? (
                    <Typography variant="body2" sx={{ fontSize: "12px", fontStyle: 'italic' }}>
                      {q.hint.text || "—"}
                    </Typography>
                  ) : (
                    <Box component="img"
                      src={q.hint.imgUrl}
                      alt="hint"
                      crossOrigin="anonymous"
                      sx={{ maxWidth: '100%', objectFit: 'contain' }}
                    />
                  )}
                </TableCell>

                <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 1.5, maxWidth: "220px", minWidth:"180px" }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'semibold' }}>
                      Your Answer: <b>{selected?.selected || "Skipped"}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'semibold' }}>
                      Correct Answer: <b>{q.answer}</b>
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <span className="chip" style={{ backgroundColor: color, color: "white", padding: "6px 12px" }}>
                      {result}
                    </span>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </React.Fragment>
      ))
    : questions.map((q, i) => {
        // Fallback for non-mock testType (unchanged)
        const answerObj = answers.find(a => a.id === q._id);
        const selected = answerObj;
        const result =
          selected?.selected.toLowerCase() === "skipped"
            ? "⧗ Skipped"
            : selected?.selected === q.answer
            ? "✅ Correct"
            : "❌ Incorrect";
        const color =
          result === "✅ Correct"
            ? "#4caf50"
            : result === "❌ Incorrect"
            ? "#f44336"
            : "#9e9e9e";

        return (
          <TableRow key={i}>
            <TableCell sx={{
              border: "1px solid #e0e0e0",
              py: 2,
              px: 1,
              textAlign: "center",
              maxWidth: "60px"
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'semibold', color: '#1976d2' }}>
                {i + 1}
              </Typography>
            </TableCell>

            <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 2 }}>
              {/* Question and Options */}
              <Box sx={{ mb: 2 }}>
                {q.questionType === "text" ? (
                  <Typography variant="body1" sx={{ fontSize: "12px", fontWeight: 500, mb: 2 }}>
                    {q.question.text}
                  </Typography>
                ) : (
                  <Box component="img"
                    src={q.question.imgUrl}
                    alt="question"
                    crossOrigin="anonymous"
                    sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', mb: 2 }}
                  />
                )}
              </Box>

              <Box sx={{ pl: 2, borderTop: "1px solid #e0e0e0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'semibold', mb: 1, color: '#666' }}>
                  Options:
                </Typography>
                {q.options.map((option, idx) => (
                  <Box key={idx} sx={{
                    mb: 1,
                    pl: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <span className="chip" style={{ backgroundColor: "#e3f2fd", color: "#2A3547", fontWeight:"300", padding: "6px 12px" }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {q.optionType === "text" ? (
                      <Typography variant="body2" sx={{ fontSize: "12px" }}>
                        {option.text}
                      </Typography>
                    ) : (
                      <Box component="img"
                        src={option.imgUrl}
                        alt="option"
                        crossOrigin="anonymous"
                        sx={{ maxWidth: '60px', objectFit: 'contain' }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </TableCell>

            <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 2, maxWidth: "240px", minWidth:"180px" }}>
              {q.hintType === "text" ? (
                <Typography variant="body2" sx={{ fontSize: "12px", fontStyle: 'italic' }}>
                  {q.hint.text || "—"}
                </Typography>
              ) : (
                <Box component="img"
                  src={q.hint.imgUrl}
                  alt="hint"
                  crossOrigin="anonymous"
                  sx={{ maxWidth: '100%', objectFit: 'contain' }}
                />
              )}
            </TableCell>

            <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 1.5, maxWidth: "220px", minWidth:"180px" }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'semibold' }}>
                  Your Answer: <b>{selected?.selected || "Skipped"}</b>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'semibold' }}>
                  Correct Answer: <b>{q.answer}</b>
                </Typography>
                <Divider sx={{ my: 1 }} />
                <span className="chip" style={{ backgroundColor: color, color: "white", padding: "6px 12px" }}>
                  {result}
                </span>
              </Box>
            </TableCell>
          </TableRow>
        );
      })}
</TableBody>

                    </Table>
                  </TableContainer>
                </Box>
              </CardContent>
            </Card>


            {/* For PDF */}
             <Card id="result-pdf" sx={{ mb: 4, boxShadow: 3, borderRadius: 3,}} className="pdf-only">
              <CardContent sx={{ p: 2 }}>
                {/* Academy Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2
                }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Innovative Academy
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Excellence in Education
                    </Typography>
                  </Box>
                  <span 
  className="chip" 
  style={{ backgroundColor: "#1976d2", color: "white", fontWeight: 700, padding: "0px 22px 12px 22px", fontSize: "1rem", verticalAlign: "middle" }}
>
  {test.course.toUpperCase()}
</span>
                
                </Box>

                {/* Test Details Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <SchoolIcon sx={{ fontSize: 25, color: '#1976d2', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                        {test.course}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Course
                      </Typography>
                    </Box>
                  </Grid>
                  {test.subject && test.subject !== "-" && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <AssignmentIcon sx={{ fontSize: 25, color: '#ff9800', mb: 0.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                          {test.subject}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Subject
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {test.chapter && test.chapter !== "-" && (
                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ textAlign: 'center', p: 1 }}>
                        <MenuBookIcon sx={{ fontSize: 25, color: '#9c27b0', mb: 0.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                          {test.chapter}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Chapter
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <TimerIcon sx={{ fontSize: 25, color: '#4caf50', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                        {formatDuration(test.duration)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                       <EmojiEventsIcon  sx={{ fontSize: 25, color: '#0f5d7eff', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'semibold' }}>
                        {test.questionIds.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Questions
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Score Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#e8f5e8', 
                      border: '2px solid #4caf50',
                      textAlign: 'center',
                      p: 1
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 25, color: '#4caf50', mb: 0.5 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#2e7d32' }}>
                        {correctCount}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#2e7d32' }}>
                        Correct
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#ffebee', 
                      border: '2px solid #f44336',
                      textAlign: 'center',
                      p: 1
                    }}>
                      <CancelIcon sx={{ fontSize: 25, color: '#f44336', mb: 0.5 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#c62828' }}>
                        {incorrectCount}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#c62828' }}>
                        Incorrect
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#f5f5f5', 
                      border: '2px solid #9e9e9e',
                      textAlign: 'center',
                      p: 1
                    }}>
                      <HelpIcon sx={{ fontSize: 25, color: '#9e9e9e', mb: 0.5 }} />
                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#616161' }}>
                        {unansweredCount}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#616161' }}>
                        Skipped
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#e3f2fd', 
                      border: '2px solid #2196f3',
                      textAlign: 'center',
                      p: 1
                    }}>
                      <EmojiEventsIcon sx={{ fontSize: 25, color: '#2196f3', mb: 0.5, textAlign: "center", margin: "auto" }} />
                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#1976d2' }}>
                        {score}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#1976d2' }}>
                        Score
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Card sx={{ 
                      backgroundColor: '#fff3e0', 
                      border: '2px solid #ff9800',
                      textAlign: 'center',
                      p: 1
                    }}>
                       <PercentIcon sx={{ fontSize: 25, color: '#ff9800', mb: 0.5 }}  /> 

                      <Typography variant="h4" sx={{ fontWeight: 'semibold', color: '#f57c00' }}>
                        {percentage}%
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'semibold', color: '#f57c00' }}>
                        Percentage
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Grade Display */}
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: getGradeColor(parseFloat(percentage)),
                  borderRadius: 2,
                  mb: 1
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'semibold', 
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    Grade: {getGrade(parseFloat(percentage))}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
                    {parseFloat(percentage) >= 60 ? 'Congratulations! You passed!' : 'Keep practicing to improve!'}
                  </Typography>
                </Box>

                {/* Test Date */}
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2,
                  mb: 3,
                  border: '1px solid #e0e0e0'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 'semibold' }}>
                    Test Date: {new Date(test.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>

                {/* Question-wise Analysis */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'semibold', mb: 3, color: '#1976d2' }}>
                    Question-wise Analysis
                  </Typography>
                  
                  <TableContainer component={Paper} elevation={1} sx={{ border: "1px solid #e0e0e0" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ 
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            fontSize: "12px",
                            py: 2,
                            px: 1,
                            maxWidth: "60px",
                            fontWeight: 'semibold'
                          }}>
                            No.
                          </TableCell>
                          <TableCell sx={{ 
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            fontSize: "12px",
                            py: 2,
                            px: 1,
                            fontWeight: 'semibold'
                          }}>
                            Question & Options
                          </TableCell>
                          <TableCell sx={{ 
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            fontSize: "12px",
                            py: 2,
                            px: 1,
                            maxWidth: "250px",
                            fontWeight: 'semibold'
                          }}>
                            Hint
                          </TableCell>
                          <TableCell sx={{ 
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                            fontSize: "12px",
                            py: 2,
                            px: 1,
                            maxWidth: "220px",
                            fontWeight: 'semibold'
                          }}>
                            Your Answer & Result
                          </TableCell>
                        </TableRow>
                      </TableHead>
                                <TableBody>
  {test.testType === "mock"
    ?
    
     Array.from(
        questions.reduce((acc, q, i) => {
          const group = acc.get(q.subject) || [];
          group.push({ ...q, index: i });
          acc.set(q.subject, group);
          return acc;
        }, new Map<string, (Question & { index: number })[]>())
      ).map(([subject, subjectQuestions]) => (
        <React.Fragment key={subject}>
          {/* Subject Header Row */}
          <TableRow>
            <TableCell colSpan={4} align="center" sx={{
              fontWeight: 'bold',
              fontSize: "14px",
              backgroundColor: "#e0e0e0",
              textTransform: "uppercase",
            }}>
              {subject}
            </TableCell>
          </TableRow>

          {/* Only show questions where q.subject === subject */}
          {subjectQuestions.map((q, subjIdx) => {
            console.log(subjectQuestions,subject)
            console.log("Rendering question:", q._id, "under subject:", subject);
            if (q.subject !== subject) return null;

            const answerObj = answers.find(a => a.id === q._id);
            const selected = answerObj;
            const result =
              selected?.selected.toLowerCase() === "skipped"
                ? "⧗ Skipped"
                : selected?.selected === q.answer
                ? "✅ Correct"
                : "❌ Incorrect";
            const color =
              result === "✅ Correct"
                ? "#4caf50"
                : result === "❌ Incorrect"
                ? "#f44336"
                : "#9e9e9e";
console.log("Selected answer:", selected?.selected, "Correct answer:", q.answer, "Result:", result, subjIdx);
            return (
              <TableRow key={q._id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                <TableCell sx={{
                  border: "1px solid #e0e0e0",
                  py: 2,
                  px: 1,
                  textAlign: "center",
                  maxWidth: "60px"
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'semibold', color: '#1976d2' }}>
                    {subjIdx + 1}
                  </Typography>
                </TableCell>

                <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    {q.questionType === "text" ? (
                      <Typography variant="body1" sx={{ fontSize: "12px", fontWeight: 500, mb: 2 }}>
                        {q.question.text}
                      </Typography>
                    ) : (
                      <Box component="img"
                        src={q.question.imgUrl}
                        alt="question"
                        crossOrigin="anonymous"
                        sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', mb: 2 }}
                      />
                    )}
                  </Box>

                  <Box sx={{ pl: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'semibold', mb: 1, color: '#666' }}>
                      Options:
                    </Typography>
                    {q.options.map((option, idx) => (
                      <Box key={idx} sx={{
                        mb: 1,
                        pl: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <span className="chip" style={{ backgroundColor: "#e3f2fd", color: "#2A3547", fontWeight:"300", padding: "6px 12px" }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {q.optionType === "text" ? (
                          <Typography variant="body2" sx={{ fontSize: "12px" }}>
                            {option.text}
                          </Typography>
                        ) : (
                          <Box component="img"
                            src={option.imgUrl}
                            alt="option"
                            crossOrigin="anonymous"
                            sx={{ maxWidth: '60px', objectFit: 'contain' }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </TableCell>

                <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 2, maxWidth: "240px", minWidth:"180px" }}>
                  {q.hintType === "text" ? (
                    <Typography variant="body2" sx={{ fontSize: "12px", fontStyle: 'italic' }}>
                      {q.hint.text || "—"}
                    </Typography>
                  ) : (
                    <Box component="img"
                      src={q.hint.imgUrl}
                      alt="hint"
                      crossOrigin="anonymous"
                      sx={{ maxWidth: '100%', objectFit: 'contain' }}
                    />
                  )}
                </TableCell>

                <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 1.5, maxWidth: "220px", minWidth:"180px" }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'semibold' }}>
                      Your Answer: <b>{selected?.selected || "Skipped"}</b>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 'semibold' }}>
                      Correct Answer: <b>{q.answer}</b>
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <span className="chip" style={{ backgroundColor: color, color: "white", padding: "6px 12px" }}>
                      {result}
                    </span>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </React.Fragment>
      ))
    : questions.map((q, i) => {
        // Fallback for non-mock testType (unchanged)
        const answerObj = answers.find(a => a.id === q._id);
        const selected = answerObj;
        const result =
          selected?.selected.toLowerCase() === "skipped"
            ? "⧗ Skipped"
            : selected?.selected === q.answer
            ? "✅ Correct"
            : "❌ Incorrect";
        const color =
          result === "✅ Correct"
            ? "#4caf50"
            : result === "❌ Incorrect"
            ? "#f44336"
            : "#9e9e9e";

        return (
          <TableRow key={i}>
            <TableCell sx={{
              border: "1px solid #e0e0e0",
              py: 2,
              px: 1,
              textAlign: "center",
              maxWidth: "60px"
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'semibold', color: '#1976d2' }}>
                {i + 1}
              </Typography>
            </TableCell>

            <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 2 }}>
              {/* Question and Options */}
              <Box sx={{ mb: 2 }}>
                {q.questionType === "text" ? (
                  <Typography variant="body1" sx={{ fontSize: "12px", fontWeight: 500, mb: 2 }}>
                    {q.question.text}
                  </Typography>
                ) : (
                  <Box component="img"
                    src={q.question.imgUrl}
                    alt="question"
                    crossOrigin="anonymous"
                    sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', mb: 2 }}
                  />
                )}
              </Box>

              <Box sx={{ pl: 2, borderTop: "1px solid #e0e0e0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'semibold', mb: 1, color: '#666' }}>
                  Options:
                </Typography>
                {q.options.map((option, idx) => (
                  <Box key={idx} sx={{
                    mb: 1,
                    pl: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <span className="chip" style={{ backgroundColor: "#e3f2fd", color: "#2A3547", fontWeight:"300", padding: "6px 12px" }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {q.optionType === "text" ? (
                      <Typography variant="body2" sx={{ fontSize: "12px" }}>
                        {option.text}
                      </Typography>
                    ) : (
                      <Box component="img"
                        src={option.imgUrl}
                        alt="option"
                        crossOrigin="anonymous"
                        sx={{ maxWidth: '60px', objectFit: 'contain' }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </TableCell>

            <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 2, maxWidth: "240px", minWidth:"180px" }}>
              {q.hintType === "text" ? (
                <Typography variant="body2" sx={{ fontSize: "12px", fontStyle: 'italic' }}>
                  {q.hint.text || "—"}
                </Typography>
              ) : (
                <Box component="img"
                  src={q.hint.imgUrl}
                  alt="hint"
                  crossOrigin="anonymous"
                  sx={{ maxWidth: '100%', objectFit: 'contain' }}
                />
              )}
            </TableCell>

            <TableCell sx={{ border: "1px solid #e0e0e0", py: 2, px: 1.5, maxWidth: "220px", minWidth:"180px" }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'semibold' }}>
                  Your Answer: <b>{selected?.selected || "Skipped"}</b>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'semibold' }}>
                  Correct Answer: <b>{q.answer}</b>
                </Typography>
                <Divider sx={{ my: 1 }} />
                <span className="chip" style={{ backgroundColor: color, color: "white", padding: "6px 12px" }}>
                  {result}
                </span>
              </Box>
            </TableCell>
          </TableRow>
        );
      })}
</TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </CardContent>
            </Card>
            </Box>

                <ResultModal
        openResultModal={openResultModal}
        handleClose={() => setOpenResultModal(false)}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        unansweredCount={unansweredCount}
        percentage={Number(percentage)}
        questions={questions}
        test={test}
      />
           {/* <Dialog
  open={openResultModal}
  onClose={handleClose}
  PaperProps={{
    sx: {
      borderRadius: 4,
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      overflow: "visible",
      p: 0,
    },
  }}
>
  <Box
    sx={{
      width: { xs: 320, sm: 480, md: 540 },
      p: 4,
      borderRadius: 4,
      background: "linear-gradient(180deg, #ffffff, #f0f4f8)",
      position: "relative",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
    }}
  >
    
    <Box
      sx={{
        position: "absolute",
        top: -28,
        left: -28,
        fontSize: 48,
        transform: "rotate(-15deg)",
      }}
    >
      🎓
    </Box>
    <Box
      sx={{
        position: "absolute",
        top: -28,
        right: -28,
        fontSize: 48,
        transform: "rotate(15deg)",
      }}
    >
      🏆
    </Box>

    
    <Typography
      variant="h5"
      sx={{ fontWeight: 700, color: "#0f172a", mt: 1 }}
    >
      {emotionSet?.title || "Result"}
    </Typography>

   
    <Typography
      sx={{
        fontSize: 15,
        color: "#334155",
        lineHeight: 1.6,
        px: 2,
        textAlign: "center",
      }}
    >
      {resultInsight}
    </Typography>

    <Box sx={{ width: "100%", mt: 2, position: "relative" }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 12,
          borderRadius: 6,
          backgroundColor: "#e2e8f0",
          "& .MuiLinearProgress-bar": {
            borderRadius: 6,
            background: "linear-gradient(90deg, #4ade80, #3b82f6)",
            transition: "width 1s ease-in-out",
          },
        }}
      />
      <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 1,
  }}
>
  
  <Box className="hex">
    <Typography>{currentLevel}</Typography>
  </Box>

  <Box className="hex muted">
    <Typography>{nextLevel}</Typography>
  </Box>
</Box>

<Box sx={{ width: "100%", mt: 2 }}>
  {xpSteps.map((step, i) =>
    step.visible ? (
      <Box
        key={i}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          py: 0.5,
          animation: "fadeSlideIn 0.4s ease",
        }}
      >
        <Typography sx={{ color: "#475569", fontSize: 14 }}>
          {step.label}
        </Typography>
        <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
          +{step.value}
        </Typography>
      </Box>
    ) : null
  )}

  {totalXP > 0 && (
    <Box
      sx={{
        mt: 1.5,
        pt: 1,
        borderTop: "1px dashed #cbd5f5",
        display: "flex",
        justifyContent: "space-between",
        px: 2,
        fontWeight: 700,
        animation: "fadeSlideIn 0.5s ease",
      }}
    >
      <Typography>Total XP</Typography>
      <Typography color="#2563eb">{totalXP}</Typography>
    </Box>
  )}
</Box>

    
      {showPoints && (
        <Typography
          sx={{
            position: "absolute",
            right: 8,
            top: -28,
            fontWeight: 700,
            color: "#2563eb",
            animation: "floatUp 1.2s ease forwards",
          }}
        >
          +{gainedPoints} 🎯
        </Typography>
      )}
    </Box>

   
    <Box sx={{ mt: 3, display: "flex", gap: 3 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          bgcolor: "#e0f2fe",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        📚
      </Box>
      <Box
        sx={{
          width: 64,
          height: 64,
          bgcolor: "#fef3c7",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        ⭐
      </Box>
      <Box
        sx={{
          width: 64,
          height: 64,
          bgcolor: "#ede9fe",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        🏅
      </Box>
    </Box>
  </Box>
</Dialog> */}


        </PageContainer>
      </Box>
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
