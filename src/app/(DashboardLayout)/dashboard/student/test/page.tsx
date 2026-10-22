"use client";

import { useEffect, useRef, useState } from "react";

import QuestionCard from "../../components/questionCard";
import Loading from "@/app/loading";
import { Question } from "@/types/questionType";
import { getCurrentUser } from "@/lib/getCurrentUser";

import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>(
    {}
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [subjectTab, setSubjectTab] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const testRef = useRef<any>(null);
  const questionRefs = useRef<Array<HTMLDivElement | null>>([]);
const [durationTest,setDurationTest]=useState(0)


  const [chapter, setChapter] = useState<string>("");

  
  // ---------------- LOAD TEST ----------------
  useEffect(() => {
    const saved = sessionStorage.getItem("currentTest");
    if (!saved) {
      alert("No active test found");
      window.location.href = "/dashboard/student/start-practice-test";
      return;
    }
console.log('get', saved)
    const test = JSON.parse(saved);
    testRef.current = test;
setChapter(test.chapter)
    setQuestions(test.questions || []);
    setSubjectTab(test.subject || "");


const levelCounts = test.questions.reduce((acc: Record<string, number>, q: Question) => {
            const level = q.level || "unknown";
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          }, {});
          console.log("Difficulty Levels:", levelCounts);
         
const duration = (levelCounts["Easy"]||levelCounts["easy"] ) * 10 + (levelCounts["Moderate"]||levelCounts["moderate"] ) * 20 + (levelCounts["Difficult"] ||levelCounts["difficult"]) * 35 + (levelCounts["Extreme"]||levelCounts["extreme"]) * 60;

setDurationTest(duration)
    let endTime = Number(sessionStorage.getItem("testEndTime"));
    if (!endTime) {
      endTime = Date.now() + duration * 1000;
      sessionStorage.setItem("testEndTime", String(endTime));
    }

    setTimeLeft(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    setLoading(false);
  }, []);

// ---------------- TIMER ----------------
const isSubmittingRef = useRef(false); // prevent double submit

useEffect(() => {
  const interval = setInterval(() => {
    const endTime = Number(sessionStorage.getItem("testEndTime"));
    if (!endTime) return;

    const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    setTimeLeft(diff);

    // auto-submit when timer reaches 0
    // if (diff <= 0 && !isSubmittingRef.current) {
    //   isSubmittingRef.current = true; // mark as submitted
    //   clearInterval(interval);
    //   handleSubmit();
    // }
    if (diff <= 0 && !isSubmittingRef.current) {
      // isSubmittingRef.current = true;
      document.getElementById("submitBtn")?.click();
      clearInterval(interval);
      // handleSubmit(true); // ✅ auto submit (no confirm)
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  let warningCount = 0;

  const handleVisibilityChange = () => {
    // ✅ When user comes back visible, redirect if pending
    if (!document.hidden) {
      const pending = sessionStorage.getItem("pendingRedirectUrl");
      if (pending) {
        sessionStorage.removeItem("pendingRedirectUrl");
        window.location.href = pending;
      }
      return;
    }

    // from here => hidden
    if (isSubmittingRef.current) return;

    warningCount++;

    if (warningCount === 1) {
      alert("⚠️ Do not switch tabs. Next time test will auto-submit.");
      return;
    }
    
    console.log("aaaa",questions.length,isSubmittingRef)
    alert("❌ Test auto-submitted due to tab switching.");
    // isSubmittingRef.current = true; // ✅ lock
    document.getElementById("submitBtn")?.click();
    // handleSubmit(true);
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", handleVisibilityChange);
}, []);



// ---------------- BLOCK BACK BUTTON ----------------
useEffect(() => {
  const handlePopState = () => {
    if (isSubmittingRef.current) return;
    history.pushState(null, "", location.href);
    alert("Back navigation is disabled during the test.");
  };

  history.pushState(null, "", location.href);
  window.addEventListener("popstate", handlePopState);

  return () => window.removeEventListener("popstate", handlePopState);
}, []);


// ---------------- BLOCK REFRESH ----------------
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isSubmittingRef.current) return; // ✅ allow submit redirect
    e.preventDefault();
    e.returnValue = "Test in progress. Leaving will submit the test.";
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () =>
    window.removeEventListener("beforeunload", handleBeforeUnload);
}, []);


  const subjects = Array.from(new Set(questions.map(q => q.subject)));
  const filteredQuestions =
    subjects.length > 1
      // ? questions.filter(q => q.subject === subjectTab)
      ?questions
      : questions;

  const handleSelectOption = (qid: string, idx: number) => {
    setSelectedOptions(prev => ({ ...prev, [qid]: idx }));
  };

  const scrollToQuestion = (idx: number) => {
    questionRefs.current[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const answeredCount = filteredQuestions.filter(
    q => selectedOptions[q._id] !== undefined
  ).length;
  const leftCount = filteredQuestions.length - answeredCount;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

const handleSubmit = async (auto: boolean = false) => {
  console.log(questions.length,isSubmittingRef)
  
  isSubmittingRef.current = true;

  try {
    // detect exam mode
    const params = new URLSearchParams(window.location.search);
    const isExamMode =
      params.has("exam") &&
      (params.get("exam") === null ||
        params.get("exam") === "" ||
        params.get("exam") === "1" ||
        params.get("exam") === "true");

    // build answers
    const answers = questions.map((q) => {
      const selectedIdx = selectedOptions[q._id];
      return {
        id: q._id,
        ans: q.answer,
        selected:
          selectedIdx !== undefined
            ? String.fromCharCode(65 + selectedIdx)
            : "Skipped",
      };
    });

    const correct = answers.filter(
      (a) => a.selected !== "Skipped" && a.ans === a.selected
    ).length;

    const incorrect = answers.filter(
      (a) => a.selected !== "Skipped" && a.ans !== a.selected
    ).length;

    const unanswered = answers.filter((a) => a.selected === "Skipped");

    const marksPerQuestion = 4;
    const negativeMarks = 1;
    const maxMarks = questions.length * marksPerQuestion;
    const score = correct * marksPerQuestion - incorrect * negativeMarks;
    const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0;

    const test = testRef.current;
    const currentTest=sessionStorage.getItem("currentTest")
    const parsedCurrentTest = JSON.parse(String(currentTest));
    const endpoint = isExamMode ? "/api/Submit-Exam" : "/api/Save-Test-Records";
  const userData=await getCurrentUser()
let currUser=userData.user

    const payload = isExamMode
      ? {
          correct,
          incorrect,
          unanswered,
          Answers: answers,
          score,
          percentage,
examId:parsedCurrentTest.examId,
          testType: test.testType,
          email: currUser.email,
          course: test.course,
          timeLeft,
          duration: durationTest,
username:currUser.username,
name:currUser.name,
          questionIds: questions.map((q) => q._id),
        }
      : {
          correct,
          incorrect,
          unanswered,
          Answers: answers,
          score,
          percentage,
instantResult:{
          result: { correct, incorrect, unanswered, score, percentage, Answers: answers },
          questions,
          submittedAnswers: selectedOptions,
          testDetails: {
            course: test.course,
            subject: test.subject,
            timeLeft,
            chapter: test.chapter,
            questionIds: questions.map((q) => q._id),
            date: new Date().toISOString(),
            duration: durationTest,
            totalMarks: questions.length,
            testType: test.testType,
          },
        },
          testType: test.testType,
          level: test.chapterLevel,
          email: test.email,
          course: test.course,
          timeLeft,
          subject: test.subject,
          duration: durationTest,
          chapter: test.chapter,
        };
console.log(payload)
    // ✅ keepalive helps when tab is hidden (tab-switch submit)
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "Submit failed");
    }

    // ✅ remove only test session keys
    sessionStorage.removeItem("currentTest");
    sessionStorage.removeItem("testEndTime");
    sessionStorage.removeItem("testAnswers");

    // ✅ for normal mode: save result for result page
    if (!isExamMode) {
      sessionStorage.setItem(
        "testResult",
        JSON.stringify({
          result: { correct, incorrect, unanswered, score, percentage, Answers: answers },
          questions,
          submittedAnswers: selectedOptions,
          testDetails: {
            course: test.course,
            subject: test.subject,
            timeLeft,
            chapter: test.chapter,
            questionIds: questions.map((q) => q._id),
            date: new Date().toISOString(),
            duration: durationTest,
            totalMarks: questions.length,
            testType: test.testType,
          },
        })
      );
    }

    // ✅ redirect URL
    const redirectUrl = isExamMode
      ? "/dashboard/student/exam?examSubmitted=1"
      : "/dashboard/student/result";

    // ✅ if tab is hidden, redirect may be blocked → delay redirect until visible
    if (document.hidden) {
      sessionStorage.setItem("pendingRedirectUrl", redirectUrl);
      return;
    }

    window.location.href = redirectUrl;
  } catch (err) {
    console.error(err);
    alert("Submit failed. Please try again.");
    isSubmittingRef.current = false;
  }
};

useEffect(() => {
  const onVis = () => {
    if (!document.hidden) {
      const pending = sessionStorage.getItem("pendingRedirectUrl");
      if (pending) {
        sessionStorage.removeItem("pendingRedirectUrl");
        window.location.href = pending;
      }
    }
  };
  document.addEventListener("visibilitychange", onVis);
  return () => document.removeEventListener("visibilitychange", onVis);
}, []);

const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [navigatorOpen, setNavigatorOpen] = useState(false);

const currentQuestion = filteredQuestions[currentQuestionIndex];

const goToQuestion = (index: number) => {
  if (index >= 0 && index < filteredQuestions.length) {
    setCurrentQuestionIndex(index);
    setNavigatorOpen(false);
  }
};

useEffect(() => {
  setCurrentQuestionIndex((index) =>
    Math.min(index, Math.max(0, filteredQuestions.length - 1))
  );
}, [filteredQuestions.length]);

// const [navigatorOpen, setNavigatorOpen] = useState(false);

  if (loading) return <Loading />;


return (
  <Box
    sx={{
      height: "100dvh",
      width: "100%",
      display: "flex",
      gap: { xs: 0, md: 2 },
      p: { xs: 0, md: 2 },
      boxSizing: "border-box",
      overflow: "hidden",
      bgcolor: "#F5F7FB",
      color: "#172033",
      fontFamily: "inherit",
    }}
  >
    {/* =====================================================
        MAIN TEST AREA
    ===================================================== */}
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: { xs: 0, md: "20px" },
        bgcolor: "#FFFFFF",
        border: { xs: "none", md: "1px solid #E8ECF3" },
      }}
    >
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          height: 56,
          minHeight: 56,
          px: { xs: 1.5, sm: 2.5, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E8ECF3",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              bgcolor: "#EEE9FF",
              color: "#6D28D9",
              fontSize: 17,
              fontWeight: 900,
            }}
          >
            IA
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 13, sm: 14 },
                fontWeight: 800,
                lineHeight: 1.3,
                color: "#172033",
              }}
            >
              Assessment
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: "#8992A5",
                lineHeight: 1.3,
              }}
            >
              Test in progress
            </Typography>
          </Box>
        </Box>

        {/* Desktop progress */}
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "#68738A",
              whiteSpace: "nowrap",
            }}
          >
            {answeredCount} of {filteredQuestions.length} answered
          </Typography>

          <Box
            sx={{
              width: 100,
              height: 6,
              bgcolor: "#E9EAF2",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${
                  filteredQuestions.length > 0
                    ? Math.min(
                        100,
                        (answeredCount / filteredQuestions.length) * 100
                      )
                    : 0
                }%`,
                height: "100%",
                bgcolor: "#6D28D9",
                borderRadius: 10,
                transition: "width 200ms ease",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ================= FIXED MOBILE STATUS BAR ================= */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 1.5,
          py: 1,
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E8ECF3",
          zIndex: 5,
        }}
      >
        {/* Timer */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: "9px",
              bgcolor: "#F1EBFF",
              color: "#6D28D9",
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            ◷
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 9,
                color: "#8790A3",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              TIME LEFT
            </Typography>

            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 900,
                lineHeight: 1.4,
                color: timeLeft <= 60 ? "#DC2626" : "#172033",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Box>

        {/* Answered */}
        <Box sx={{ textAlign: "center", flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.3,
              fontWeight: 900,
              color: "#15803D",
            }}
          >
            {answeredCount}
          </Typography>

          <Typography
            sx={{
              fontSize: 9,
              fontWeight: 700,
              color: "#8790A3",
            }}
          >
            ANSWERED
          </Typography>
        </Box>

        {/* Remaining */}
        <Box sx={{ textAlign: "center", flexShrink: 0 }}>
          <Typography
            sx={{
              fontSize: 17,
              lineHeight: 1.3,
              fontWeight: 900,
              color: "#D97706",
            }}
          >
            {leftCount}
          </Typography>

          <Typography
            sx={{
              fontSize: 9,
              fontWeight: 700,
              color: "#8790A3",
            }}
          >
            LEFT
          </Typography>
        </Box>

        {/* Mobile navigator */}
        <Button
          onClick={() => setNavigatorOpen(true)}
          variant="outlined"
          sx={{
            minWidth: 0,
            px: 1.25,
            py: 0.75,
            borderRadius: "10px",
            borderColor: "#DDD6FE",
            color: "#6D28D9",
            fontSize: 11,
            fontWeight: 800,
            textTransform: "none",
            flexShrink: 0,
          }}
        >
          Questions
        </Button>
      </Box>

      {/* ================= SCROLLABLE QUESTION AREA ================= */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          p: {
            xs: 1.25,
            sm: 2,
            md: 2.5,
            lg: 3,
          },
          "&::-webkit-scrollbar": {
            width: 5,
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#D6DAE5",
            borderRadius: 10,
          },
        }}
      >
        {/* ================= DESKTOP: ONE QUESTION ================= */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: "100%",
            maxWidth: 900,
            mx: "auto",
          }}
        >
          {currentQuestion ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#6D28D9",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    QUESTION {currentQuestionIndex + 1}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#8790A3",
                      mt: 0.25,
                    }}
                  >
                    Select the best answer.
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#707A90",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentQuestionIndex + 1} / {filteredQuestions.length}
                </Typography>
              </Box>

              <QuestionCard
                index={currentQuestionIndex}
                data={currentQuestion}
                selectedOption={
                  selectedOptions[currentQuestion._id] ?? null
                }
                onSelect={(optionIndex) =>
                  handleSelectOption(currentQuestion._id, optionIndex)
                }
              />

              {/* Previous / Next */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  disabled={currentQuestionIndex === 0}
                  onClick={() =>
                    goToQuestion(currentQuestionIndex - 1)
                  }
                  sx={{
                    minHeight: 42,
                    px: 2.5,
                    borderRadius: "12px",
                    borderColor: "#DDE2EC",
                    color: "#45516A",
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#6D28D9",
                      bgcolor: "#F7F4FF",
                    },
                  }}
                >
                  ← Previous
                </Button>

                {currentQuestionIndex < filteredQuestions.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={() =>
                      goToQuestion(currentQuestionIndex + 1)
                    }
                    sx={{
                      minHeight: 42,
                      px: 3,
                      borderRadius: "12px",
                      bgcolor: "#6D28D9",
                      fontSize: 13,
                      fontWeight: 800,
                      textTransform: "none",
                      boxShadow: "0 4px 12px rgba(109,40,217,0.18)",
                      "&:hover": {
                        bgcolor: "#5B21B6",
                        boxShadow:
                          "0 6px 16px rgba(109,40,217,0.24)",
                      },
                    }}
                  >
                    Next Question →
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmittingRef.current}
                    sx={{
                      minHeight: 42,
                      px: 3,
                      borderRadius: "12px",
                      bgcolor: "#15803D",
                      fontSize: 13,
                      fontWeight: 800,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#166534",
                      },
                    }}
                  >
                    Submit Test →
                  </Button>
                )}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                py: 10,
                textAlign: "center",
                color: "#8790A3",
              }}
            >
              <Typography fontWeight={700}>
                No questions available.
              </Typography>
            </Box>
          )}
        </Box>

        {/* ================= MOBILE: ALL QUESTIONS ================= */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            gap: 2,
            width: "100%",
            maxWidth: 680,
            mx: "auto",
          }}
        >
          {/* Mobile progress */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "14px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E8ECF3",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#34405A",
                }}
              >
                Your progress
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#6D28D9",
                }}
              >
                {answeredCount}/{filteredQuestions.length}
              </Typography>
            </Box>

            <Box
              sx={{
                width: "100%",
                height: 5,
                borderRadius: 10,
                bgcolor: "#EEEAF8",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${
                    filteredQuestions.length > 0
                      ? Math.min(
                          100,
                          (answeredCount / filteredQuestions.length) * 100
                        )
                      : 0
                  }%`,
                  height: "100%",
                  bgcolor: "#6D28D9",
                  borderRadius: 10,
                  transition: "width 200ms ease",
                }}
              />
            </Box>
          </Box>

          {filteredQuestions.map((question, index) => {
            const isAnswered =
              selectedOptions[question._id] !== undefined &&
              selectedOptions[question._id] !== null;

            return (
              <Box
                key={question._id}
                id={`question-${index}`}
                sx={{ scrollMarginTop: 12 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 1,
                    px: 0.25,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.8,
                      color: "#6D28D9",
                      textTransform: "uppercase",
                    }}
                  >
                    Question {index + 1}
                  </Typography>

                  <Box
                    sx={{
                      px: 1,
                      py: 0.4,
                      borderRadius: "7px",
                      bgcolor: isAnswered ? "#DCFCE7" : "#EEF0F5",
                      color: isAnswered ? "#15803D" : "#707A90",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {isAnswered ? "ANSWERED" : "NOT ANSWERED"}
                  </Box>
                </Box>

                <QuestionCard
                  index={index}
                  data={question}
                  selectedOption={
                    selectedOptions[question._id] ?? null
                  }
                  onSelect={(optionIndex) =>
                    handleSelectOption(question._id, optionIndex)
                  }
                />
              </Box>
            );
          })}

          {/* Mobile submit */}
          {filteredQuestions.length > 0 && (
            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E8ECF3",
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#202A40",
                }}
              >
                Ready to submit?
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  mb: 1.75,
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: "#7A8498",
                }}
              >
                You have answered {answeredCount} of{" "}
                {filteredQuestions.length} questions.
                {leftCount > 0
                  ? ` ${leftCount} questions remain unanswered.`
                  : " All questions have been answered."}
              </Typography>

              <Button
                fullWidth
                id="submitBtn"
                variant="contained"
                onClick={() => handleSubmit(false)}
                disabled={isSubmittingRef.current}
                sx={{
                  minHeight: 46,
                  borderRadius: "12px",
                  bgcolor: "#15803D",
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#166534",
                  },
                }}
              >
                Submit Test
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>

    {/* =====================================================
        DESKTOP SIDEBAR — ROUNDED DASHBOARD
    ===================================================== */}
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        width: 350,
        minWidth: 270,
        flexShrink: 0,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        bgcolor: "#171B2E",
        color: "#FFFFFF",
        border: "1px solid #282D43",
        borderRadius: "22px",
        boxShadow: "0 8px 30px rgba(23,27,46,0.10)",
      }}
    >
      {/* Timer */}
      <Box sx={{ px: 2, pt: 1 }}>
        <Box
          sx={{
            p: 1.25,
            borderRadius: "14px",
            bgcolor: "rgba(255,255,255,0.055)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 40,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: 1,
                fontVariantNumeric: "tabular-nums",
                color: timeLeft <= 60 ? "#FCA5A5" : "#FFFFFF",
              }}
            >
              {formatTime(timeLeft)}
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 800,
                color: "#9CA5C0",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                textAlign: "right",
              }}
            >
              Time
              <br />
              remaining
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 1.25,
              height: 4,
              borderRadius: 10,
              bgcolor: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: "100%",
                bgcolor: timeLeft <= 60 ? "#F87171" : "#A78BFA",
                borderRadius: 10,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Answer statistics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          px: 2,
          pt: 1,
        }}
      >
        <Box
          sx={{
            p: 1,
            borderRadius: "12px",
            bgcolor: "rgba(34,197,94,0.09)",
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: 13,
              color: "#A8B3C9",
            }}
          >
            Answered
          </Typography>

          <Typography
            component="span"
            sx={{
              ml: 1,
              fontSize: 17,
              fontWeight: 800,
              color: "#86EFAC",
              lineHeight: 1.2,
            }}
          >
            {answeredCount}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1,
            borderRadius: "12px",
            bgcolor: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.15)",
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: 13,
              color: "#A8B3C9",
            }}
          >
            Remaining
          </Typography>

          <Typography
            component="span"
            sx={{
              ml: 1,
              fontSize: 17,
              fontWeight: 800,
              color: "#FCD34D",
              lineHeight: 1.2,
            }}
          >
            {leftCount}
          </Typography>
        </Box>
      </Box>

      {/* Question navigator */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 2,
          pt: 2,
          pb: 1.5,
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#3C425B",
            borderRadius: 10,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: "#FFFFFF",
            }}
          >
            Question navigator
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: "#9CA5C0",
            }}
          >
            {filteredQuestions.length} total
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {filteredQuestions.map((question, index) => {
            const isAnswered =
              selectedOptions[question._id] !== undefined &&
              selectedOptions[question._id] !== null;

            const isCurrent = index === currentQuestionIndex;

            return (
              <Button
                key={question._id}
                onClick={() => goToQuestion(index)}
                disableRipple
               
sx={{
  minWidth: 0,
  height: 37,
  p: 0,
  borderRadius: "9px",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "none",

  color: isCurrent
    ? "#FFFFFF"
    : isAnswered
    ? "#15803D"
    : "#58647A",

  bgcolor: isCurrent
    ? "#6D28D9"
    : isAnswered
    ? "#DCFCE7"
    : "#FFFFFF",

  border: isCurrent
    ? "1px solid #6D28D9"
    : isAnswered
    ? "1px solid #86EFAC"
    : "1px solid #DDE2EC",

  "&:hover": {
    bgcolor: isCurrent
      ? "#5B21B6"
      : isAnswered
      ? "#BBF7D0"
      : "#F1F3F9",
  },
}}

              >
                {index + 1}
              </Button>
            );
          })}
        </Box>

        {/* Legend */}
        {/* <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {[
            { label: "Current question", color: "#8B5CF6" },
            { label: "Answered", color: "#22C55E" },
            { label: "Not answered", color: "#596078" },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "3px",
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />

              <Typography
                sx={{
                  fontSize: 11,
                  color: "#B5BDD0",
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box> */}
      </Box>

      {/* Submit area */}
      {/* <Box
        sx={{
          flexShrink: 0,
          p: 2,
          pt: 1.5,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Button
          fullWidth
          id="submitBtn"
          variant="contained"
          onClick={() => handleSubmit(false)}
          disabled={isSubmittingRef.current}
          sx={{
            minHeight: 45,
            borderRadius: "12px",
            bgcolor: "#7C3AED",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 800,
            textTransform: "none",
            boxShadow: "0 5px 16px rgba(124,58,237,0.2)",
            "&:hover": {
              bgcolor: "#6D28D9",
              boxShadow: "0 6px 20px rgba(124,58,237,0.3)",
            },
          }}
        >
          Submit Test →
        </Button>

        <Typography
          sx={{
            mt: 1,
            textAlign: "center",
            fontSize: 10,
            color: "#8992AA",
          }}
        >
          Review your answers before submitting.
        </Typography>
      </Box> */}
    </Box>

    {/* =====================================================
        MOBILE QUESTION NAVIGATOR
    ===================================================== */}
    <Dialog
      open={navigatorOpen}
      onClose={() => setNavigatorOpen(false)}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          bgcolor: "#FFFFFF",
          backgroundImage: "none",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E8ECF3",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 800,
              color: "#172033",
            }}
          >
            Question navigator
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 12,
              color: "#8790A3",
            }}
          >
            Tap a number to jump to that question.
          </Typography>
        </Box>

        <IconButton
          onClick={() => setNavigatorOpen(false)}
          size="small"
          aria-label="Close question navigator"
          sx={{
            color: "#657089",
            bgcolor: "#F1F3F8",
            "&:hover": {
              bgcolor: "#E7EAF2",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: 2.5,
          maxHeight: "60dvh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 1.25,
          }}
        >
          {filteredQuestions.map((question, index) => {
            const isAnswered =
              selectedOptions[question._id] !== undefined &&
              selectedOptions[question._id] !== null;

            const isCurrent = index === currentQuestionIndex;

            return (
              <Button
                key={question._id}
                onClick={() => {
                  goToQuestion(index);
                  setNavigatorOpen(false);

                  // On mobile, scroll the selected question into view.
                  requestAnimationFrame(() => {
                    document
                      .getElementById(`question-${index}`)
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                  });
                }}
                sx={{
                  minWidth: 0,
                  height: 44,
                  p: 0,
                  borderRadius: "11px",
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "none",
                  color: isCurrent
                    ? "#FFFFFF"
                    : isAnswered
                    ? "#15803D"
                    : "#58647A",
                  bgcolor: isCurrent
                    ? "#6D28D9"
                    : isAnswered
                    ? "#DCFCE7"
                    : "#F0F2F7",
                  border: isCurrent
                    ? "1px solid #6D28D9"
                    : "1px solid transparent",
                  "&:hover": {
                    bgcolor: isCurrent
                      ? "#5B21B6"
                      : isAnswered
                      ? "#BBF7D0"
                      : "#E4E7F0",
                  },
                }}
              >
                {index + 1}
              </Button>
            );
          })}
        </Box>

        <Box
          sx={{
            mt: 2.5,
            p: 1.75,
            borderRadius: "12px",
            bgcolor: "#F6F4FF",
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 800,
              color: "#5B21B6",
            }}
          >
            {answeredCount} answered · {leftCount} remaining
          </Typography>
        </Box>

        <Button
          fullWidth
          onClick={() => setNavigatorOpen(false)}
          sx={{
            mt: 2,
            minHeight: 44,
            borderRadius: "11px",
            bgcolor: "#6D28D9",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 800,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#5B21B6",
            },
          }}
        >
          Return to test
        </Button>
      </DialogContent>
    </Dialog>
  </Box>
);

 
}


