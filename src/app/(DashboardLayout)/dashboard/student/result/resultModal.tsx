import React, { useEffect, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";
import { LEVELS } from "@/utils/level_config";

import { getCurrentUser } from "@/lib/getCurrentUser"; // your function to get current user

type XPStep = { label: string; value: number; visible: boolean };


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

  return {
    insight,
    emotion,
    
  };
}


const XP_CONFIG = {
  base: 20,
  performance: 15,
  discipline: 5,
  time: 10,
};

export default function ResultModal({
  openResultModal,
  handleClose,
  correctCount,
  incorrectCount,
  unansweredCount,
  percentage,
  questions,
  test,
}: {
  openResultModal: boolean;
  handleClose: () => void;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentage: number;
  questions: any[];
  test: { duration: number; timeLeft: number; subject: string; chapter: string };
}) {
  const [resultInsight, setResultInsight] = useState("");
  const [emotionSet, setEmotionSet] = useState<{ left: string; right: string; title: string } | null>(null);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [nextLevel, setNextLevel] = useState(2);
  const [levelName, setLevelName] = useState("");
  const [pointsBefore, setPointsBefore] = useState(0);
  const [pointsAfter, setPointsAfter] = useState(0);

  const [progress, setProgress] = useState(0);
  const [xpSteps, setXpSteps] = useState<XPStep[]>([
    { label: "Base XP", value: 0, visible: false },
    { label: "Score Bonus", value: 0, visible: false },
    { label: "Time Bonus", value: 0, visible: false },
  ]);
  const [totalXP, setTotalXP] = useState(0);
  const [showPoints, setShowPoints] = useState(false);
  const [gainedPoints, setGainedPoints] = useState(0);

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const animateNumber = (from: number, to: number, callback: (val: number) => void, duration = 500) => {
    const startTime = performance.now();
    const frame = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = from + (to - from) * progress;
      callback(Math.floor(value));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  useEffect(() => {
    if (!openResultModal) return;

    const runXPFlow = async () => {
      setProgress(0);
      setShowPoints(false);
      setTotalXP(0);
      setXpSteps((s) => s.map((x) => ({ ...x, visible: false, value: 0 })));

      const userData = await getCurrentUser();
      const res = await fetch("/api/Add-Points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.user._id,
          scorePercent: Number(percentage),
          timeUsed: test.duration - test.timeLeft,
          totalTime: test.duration,
          attemptedQuestions: questions.length - unansweredCount,
          totalQuestions: questions.length,
        }),
      });

   const data = await res.json();
if (!data.success) return;

// Fetch updated user snapshot
const newUserDataRes = await fetch("/api/auth/Get-Current-User", {
  method: "GET",
  credentials: "include",
});

if (!newUserDataRes.ok) {
  throw new Error("Failed to fetch updated user");
}

const newUserData = await newUserDataRes.json();

// Store updated user globally
sessionStorage.setItem("currentUser", JSON.stringify(newUserData));

      // Save backend truth
      setCurrentLevel(data.level);
      setLevelName(data.levelName);
      setPointsBefore(data.previousPoints);
      setPointsAfter(data.totalPoints);
      setGainedPoints(data.gainedPoints);
      setNextLevel(data.nextLevelMin ? data.level + 1 : data.level);

      // Animate XP Steps
      const steps: XPStep[] = [
        { label: "Base XP", value: data.pointsBreakdown.basePoints || 0, visible: false },
        { label: "Score Bonus", value: data.pointsBreakdown.scorePoints || 0, visible: false },
        { label: "Time Bonus", value: data.pointsBreakdown.timePoints || 0, visible: false },
      ];

      let runningTotal = 0;
      for (let i = 0; i < steps.length; i++) {
        await delay(500);
        animateNumber(0, steps[i].value, (val) => {
          setXpSteps((prev) => {
            const copy = [...prev];
            copy[i] = { ...copy[i], value: val, visible: true };
            return copy;
          });
        });
        runningTotal += steps[i].value;
      }

      // Animate total XP
      await delay(400);
      animateNumber(0, runningTotal, (val) => setTotalXP(val));

      // Show fly points
      await delay(600);
      setShowPoints(true);

      // Animate progress bar
      await delay(300);
      const currentLevelData = LEVELS.find((l) => l.level === data.level);
      const nextLevelData = LEVELS.find((l) => l.level === data.level + 1);

      if (currentLevelData && nextLevelData) {
        const levelRange = nextLevelData.minPoints - currentLevelData.minPoints;
        const progressPercent = ((data.totalPoints - currentLevelData.minPoints) / levelRange) * 100;
        animateNumber(0, progressPercent, setProgress, 1200);
      } else {
        setProgress(100); // max level
      }

      new Audio("/sounds/xp.mp3").play().catch(() => {});
    };

    runXPFlow();
  }, [openResultModal]);


  useEffect(() => {
  
    const result = buildTestInsight({
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: unansweredCount,
      percentage: Number(percentage),
      duration: test.duration,
      timeLeft: test.timeLeft,
      subject: test.subject,
      chapter: test.chapter,
    });

    setResultInsight(result.insight);
    setEmotionSet(result.emotion);
    
  
}, [correctCount, incorrectCount, unansweredCount, percentage, test]);

  return (
  <Box> <Dialog
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
        {/* Floating emojis */}
        <Box sx={{ position: "absolute", top: -28, left: -28, fontSize: 48, transform: "rotate(-15deg)" }}>🎓</Box>
        <Box sx={{ position: "absolute", top: -28, right: -28, fontSize: 48, transform: "rotate(15deg)" }}>🏆</Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", mt: 1 }}>
         {emotionSet?.left} {emotionSet?.title} {emotionSet?.right}
        </Typography>

        <Typography sx={{ fontSize: 15, color: "#334155", lineHeight: 1.6, px: 2, textAlign: "center" }}>
          {resultInsight}
        </Typography>

        {/* Progress + Hex */}
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
                transition: "width 0.4s ease-in-out",
              },
            }}
          />

          {/* Current Level Hex */}
          {progress < 100 && (
            <Box
              sx={{
                position: "absolute",
                top: -40,
                left: 10,
                transform: "translateX(-50%)",
                width: 40,
                height: 40,
                bgcolor: "#e0f2fe",
                clipPath: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 700,
              }}
            >
              {currentLevel}
            </Box>
          )}

          {/* Next Level Hex */}
          {nextLevel !== currentLevel && (
            <Box
              sx={{
                position: "absolute",
                top: -40,
                right: 0,
                width: 40,
                height: 40,
                bgcolor: "#f0f0f0",
                clipPath: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: 700,
                color: "#94a3b8",
              }}
            >
              {nextLevel}
            </Box>
          )}

          {/* XP Steps */}
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
                  <Typography sx={{ color: "#475569", fontSize: 14 }}>{step.label}</Typography>
                  <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>+{step.value}</Typography>
                </Box>
              ) : null
            )}

         
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
         
          </Box>

          {/* Fly Points */}
          {/* {showPoints && (
            <Box
              sx={{
                position: "absolute",
                right: 8,
                top: -28,
                fontWeight: 700,
                color: "#2563eb",
                animation: "floatUp 1s forwards",
                "@keyframes floatUp": {
                  "0%": { transform: "translateY(0)", opacity: 1 },
                  "100%": { transform: "translateY(-40px)", opacity: 0 },
                },
              }}
            >
              +{gainedPoints} 🎯
            </Box>
          )} */}
        </Box>

        {/* Badges */}
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
    </Dialog>
    </Box>
  );
}
