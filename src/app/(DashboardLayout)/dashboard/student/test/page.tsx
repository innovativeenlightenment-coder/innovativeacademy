// "use client";

// import { IconButton } from "@mui/material";
// import { ArrowBack, ArrowForward } from "@mui/icons-material";
// import { useEffect, useState, useRef } from "react";
// import {
//   Box,
//   Grid,
//   Button,
//   Typography,
//   Tabs,
//   Tab,
//   Paper,
// } from "@mui/material";
// import QuestionCard from "../../components/questionCard";
// import { Question } from "@/types/questionType";
// import Loading from "@/app/loading";

// const QUESTIONS_PER_PANEL_PAGE = 25;

// export default function TestPage() {
//   // ----------------- STATE -----------------
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>(
//     {}
//   );
//   const [timeLeft, setTimeLeft] = useState<number>(0);
//   const [subjectTab, setSubjectTab] = useState<string>("");
//   const [panelPageBySubject, setPanelPageBySubject] = useState<
//     Record<string, number>
//   >({});
//   const [loading, setLoading] = useState<boolean>(true);

//   const [duration, setDuration] = useState<number>(0);

//   const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

//   // Test meta from session
//   const testRef = useRef<any>(null);

//   // ----------------- LOAD FROM SESSION -----------------
//   useEffect(() => {
// //     const saved = sessionStorage.getItem("currentTest");
// //     if (!saved) {
// //       alert("No active test found");
// //       window.location.href = "/";
// //       return;
// //     }

// //     const test = JSON.parse(saved);
// //     testRef.current = test;

// //     setQuestions(test.questions || []);

// //    const subjectsInTest = Array.from(
// //   new Set(test.questions.map((q: Question) => String(q.subject)))
// // );

// // setSubjectTab(String(subjectsInTest[0]) || "");

// //     setDuration(test.questions.length * 60);
// //     setTimeLeft(test.questions.length * 60);

// //     const endTime = Date.now() + test.questions.length * 60 * 1000;
// //     sessionStorage.setItem("testEndTime", String(endTime));

// //     setLoading(false);


//     const saved = sessionStorage.getItem("currentTest");

//   if (!saved) {
//     alert("No active test found");
//     window.location.href = "/dashboard/student";
//     return;
//   }

//   const parsed = JSON.parse(saved);

//   setQuestions(parsed.questions);
//   setDuration(parsed.testType === "practice" ? 1800 : parsed.testType === "monthly" ? 3600 : 5400);
//   setSubjectTab(parsed.subject || "");
//   setTimeLeft(Math.floor((parsed.startTime + duration * 1000 - Date.now()) / 1000));

//   setLoading(false);
//   }, []);

//   // ----------------- TAB CHANGE -----------------
//   const handleTabChange = (_: any, val: string) => {
//     setSubjectTab(val);
//     setPanelPageBySubject((prev) => ({ ...prev, [val]: prev[val] || 1 }));
//   };

//   // ----------------- PAGINATION -----------------
//   const activePage = panelPageBySubject[subjectTab] || 1;
//   const changePage = (page: number) => {
//     setPanelPageBySubject((prev) => ({ ...prev, [subjectTab]: page }));
//   };

//   // ----------------- TIMER -----------------
//   useEffect(() => {
//     const savedEnd = sessionStorage.getItem("testEndTime");
//     if (!savedEnd) return;

//     const endTime = parseInt(savedEnd, 10);

//     const interval = setInterval(() => {
//       const diff = Math.max(
//         0,
//         Math.floor((endTime - Date.now()) / 1000)
//       );
//       setTimeLeft(diff);

//       if (diff <= 0) {
//         clearInterval(interval);
//         handleSubmit();
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [questions.length]);

//   // ----------------- SELECT OPTION -----------------
//   const handleSelectOption = (qid: string, idx: number) => {
//     setSelectedOptions((prev) => ({ ...prev, [qid]: idx }));
//   };

//   // ----------------- FORMAT TIME -----------------
//   const formatTime = (sec: number) => {
//     const h = Math.floor(sec / 3600);
//     const m = Math.floor((sec % 3600) / 60);
//     const s = sec % 60;
//     return `${h > 0 ? h + ":" : ""}${m
//       .toString()
//       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   // ----------------- FILTER QUESTIONS -----------------
//   const subjects = Array.from(new Set(questions.map((q) => q.subject)));
//   const filteredQuestions = questions.filter(
//     (q) => q.subject === subjectTab
//   );

//   const totalPanelPages = Math.ceil(
//     filteredQuestions.length / QUESTIONS_PER_PANEL_PAGE
//   );

//   const panelQuestions = filteredQuestions.slice(
//     (activePage - 1) * QUESTIONS_PER_PANEL_PAGE,
//     activePage * QUESTIONS_PER_PANEL_PAGE
//   );

//   // ----------------- SCROLL -----------------
//   const scrollToQuestion = (idx: number) => {
//     questionRefs.current[idx]?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//   };

//   // ----------------- STICKY TIMER -----------------
//   const [isTimerSticky, setIsTimerSticky] = useState(false);
//   useEffect(() => {
//     const handleScroll = () => setIsTimerSticky(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // ----------------- SUBMIT -----------------
//   const handleSubmit = async () => {
//     if (!questions.length) return;

//     const test = testRef.current;

//     const answers = questions.map((q) => {
//       const selectedIdx = selectedOptions[q._id];
//       return {
//         id: q._id,
//         ans: q.answer,
//         selected:
//           selectedIdx !== undefined
//             ? String.fromCharCode(65 + selectedIdx)
//             : "Skipped",
//       };
//     });

//     const correct = answers.filter(
//       (a) => a.selected !== "Skipped" && a.ans === a.selected
//     ).length;

//     const incorrect = answers.filter(
//       (a) => a.selected !== "Skipped" && a.ans !== a.selected
//     ).length;

//     const unanswered = answers.filter(
//       (a) => a.selected === "Skipped"
//     );

// const marksPerQuestion = 4;
// const negativeMarks = 1;

// const maxMarks = questions.length * marksPerQuestion;
// const score = correct * marksPerQuestion - incorrect * negativeMarks;

// const percentage =
//   maxMarks > 0 ? (score / maxMarks) * 100 : 0;


//     await fetch("/api/Save-Test-Records", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         correct,
//         incorrect,
//         unanswered,
//         Answers: answers,
//         score,
//         testType:"practice",
//         percentage,
//         level: test.chapterLevel,
//         email: test.email,
//         course: test.course,
//         subject: test.subject,
//         chapter: test.chapter,
//       }),
//     });

//     sessionStorage.removeItem("currentTest");
//     sessionStorage.removeItem("testEndTime");

//     window.location.href = "/dashboard/student/result";
//   };

//   if (loading) return <Loading />;

//   const answeredCount = filteredQuestions.filter(
//     (q) => selectedOptions[q._id] !== undefined
//   ).length;

//   const leftCount = filteredQuestions.length - answeredCount;

//   // ----------------- UI (UNCHANGED) -----------------
//   return (
//     <Box>
//       {/* TOP BAR */}
//       {(subjects.length > 1 || questions.length > 25) && (
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: { xs: "column", md: "row" },
//             alignItems: "center",
//             justifyContent: subjects.length > 1 ? "space-between" : "end",
//             border: "1px solid #ddd",
//             borderRadius: 2,
//             bgcolor: "#fff",
//             px: 2,
//             py: 1,
//             mb: 1,
//             zIndex: 99,
//           }}
//         >
//           {subjects.length > 1 && (
//             <Tabs
//               value={subjectTab}
//               onChange={handleTabChange}
//               variant="scrollable"
//               scrollButtons="auto"
//               sx={{ flexGrow: 1 }}
//             >
//               {subjects.map((sub) => (
//                 <Tab key={sub} label={sub} value={sub} />
//               ))}
//             </Tabs>
//           )}

//           {totalPanelPages > 1 && (
//             <Box>{/* pagination stays same */}</Box>
//           )}
//         </Box>
//       )}

//       {/* MAIN GRID */}
//       <Grid container gap={2} flexWrap="nowrap">
//         {/* LEFT */}
//         <Grid item xs={12} md={8}>
//           <Box
//   sx={{
//     py: 1,
//     px: 2,
//     borderRadius: 2,
//     position: isTimerSticky ? "fixed" : "relative",
//     top: isTimerSticky ? 60 : "auto",
//     bgcolor: "#fff59d",
//     border: "1px solid #fdd835",
//     display: "flex",
//     flexDirection: { xs: "column", sm: "row" },
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 1,
//     mb: 2,
//     zIndex: 100,
//   }}
// >
//   <Typography
//     variant="body1"
//     sx={{ fontWeight: 600 }}
//   >
//     ⏱ Time Left: {formatTime(timeLeft)}
//   </Typography>
//   <Typography
//     variant="body1"
//     sx={{ fontWeight: 600 }}
//   >
//     📝 Ques Left: {leftCount}
//   </Typography>
// </Box>


//           {panelQuestions.map((q, idx) => {
//             const globalIdx =
//               (activePage - 1) * QUESTIONS_PER_PANEL_PAGE + idx;
//             return (
//               <div
//                 key={q._id}
//                 ref={(el) => (questionRefs.current[globalIdx] = el)}
//               >
//                 <QuestionCard
//                   index={globalIdx}
//                   data={q}
//                   selectedOption={selectedOptions[q._id] ?? null}
//                   onSelect={(opt) =>
//                     handleSelectOption(q._id, opt)
//                   }
//                 />
//               </div>
//             );
//           })}
//         </Grid>

//         {/* RIGHT */}
//         <Grid item xs={0} md={4} sx={{ display: { xs: "none", md: "block" } }}>
//           <Paper
//             sx={{
//               position: "fixed",
//               top: 175,
//               width: "27%",
//               p: 2,
//               borderRadius: 3,
//               maxHeight: "80vh",
//               overflowY: "auto",
//             }}
//           >
//             <Typography variant="h6">Questions</Typography>

//             <Box mt={2} mb={2} display="flex" justifyContent="space-between">
//               <Typography color="success.main">
//                 Answered: {answeredCount}
//               </Typography>
//               <Typography color="error">
//                 Unanswered: {leftCount}
//               </Typography>
//             </Box>

//             <Grid container spacing={1}>
//               {panelQuestions.map((q, idx) => {
//                 const globalIdx =
//                   (activePage - 1) * QUESTIONS_PER_PANEL_PAGE + idx;
//                 const answered =
//                   selectedOptions[q._id] !== undefined;

//                 return (
//                   <Grid item xs={2} key={q._id}>
//                     <button
//                       style={{
//                         width: "100%",
//                         fontWeight: 600,
//                         padding: "5px",
//                         borderRadius: "4px",
//                         backgroundColor: answered
//                           ? "#4caf50"
//                           : "#f9f9f9",
//                         color: answered ? "#fff" : "#000",
//                         border: "1px solid #ccc",
//                       }}
//                       onClick={() =>
//                         scrollToQuestion(globalIdx)
//                       }
//                     >
//                       {globalIdx + 1}
//                     </button>
//                   </Grid>
//                 );
//               })}
//             </Grid>

//             <Button
//               fullWidth
//               color="error"
//               variant="contained"
//               sx={{ mt: 1 }}
//               onClick={handleSubmit}
//             >
//               Submit Test
//             </Button>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import QuestionCard from "../../components/questionCard";
import Loading from "@/app/loading";
import { Question } from "@/types/questionType";

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

    setQuestions(test.questions || []);
    setSubjectTab(test.subject || "");


    const duration =
      test.testType === "practice"
        ? 3000
        : test.testType === "monthly"
        ? 6000
        : 9000;
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
    if (diff <= 0 && !isSubmittingRef.current) {
      isSubmittingRef.current = true; // mark as submitted
      clearInterval(interval);
      handleSubmit();
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);

  // ---------------- TAB SWITCH DETECTION ----------------
useEffect(() => {
  let warningCount = 0;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      warningCount++;

      if (warningCount === 1) {
        alert("⚠️ Do not switch tabs. Next time test will auto-submit.");
      } else {
        alert("❌ Test auto-submitted due to tab switching.");
        handleSubmit();
      }
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () =>
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
}, []);

// ---------------- TAB SWITCH DETECTION ----------------
useEffect(() => {
  let warningCount = 0;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      warningCount++;

      if (warningCount === 1) {
        alert("⚠️ Do not switch tabs. Next time test will auto-submit.");
      } else {
        alert("❌ Test auto-submitted due to tab switching.");
        handleSubmit();
      }
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () =>
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
}, []);

// ---------------- BLOCK BACK BUTTON ----------------
useEffect(() => {
  history.pushState(null, "", location.href);

  const handlePopState = () => {
    history.pushState(null, "", location.href);
    alert("Back navigation is disabled during the test.");
  };

  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, []);

// ---------------- BLOCK REFRESH ----------------
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
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
      ? questions.filter(q => q.subject === subjectTab)
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

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!questions.length) return;

    const answers = questions.map(q => {
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
      a => a.selected !== "Skipped" && a.ans === a.selected
    ).length;
    const incorrect = answers.filter(
      a => a.selected !== "Skipped" && a.ans !== a.selected
    ).length;
    const unanswered = answers.filter(a => a.selected === "Skipped");

    const marksPerQuestion = 4;
    const negativeMarks = 1;
    const maxMarks = questions.length * marksPerQuestion;
    const score = correct * marksPerQuestion - incorrect * negativeMarks;
    const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0;

    const test = testRef.current;

    await fetch("/api/Save-Test-Records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correct,
        incorrect,
        unanswered,
        Answers: answers,
        score,
        percentage,
        testType: test.testType,
        level: test.chapterLevel,
        email: test.email,
        course: test.course,
        timeLeft,
        subject: test.subject,
           duration: durationTest, // in sec
        chapter: test.chapter,
      }),
    });

    sessionStorage.clear();
     sessionStorage.setItem(
        "testResult",
        JSON.stringify({
          result: { correct, incorrect, unanswered, score, percentage, Answers: answers },
          questions,
          submittedAnswers: selectedOptions,
          testDetails: {
            course:test.course,
            subject:test.subject,
            timeLeft,
            chapter:test.chapter,
            questionIds: questions.map(q => q._id),
            date: new Date().toISOString(),
            duration: durationTest, // in sec
            totalMarks: questions.length,
            testType:test.testType
          }
        })
      );
    window.location.href = "/dashboard/student/result";
  };

  if (loading) return <Loading />;

  return (
    <Box px={2}>
      {/* SUBJECT TABS */}
      {subjects.length > 1 && (
        <Tabs
          value={subjectTab}
          onChange={(_, v) => setSubjectTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 1 }}
        >
          {subjects.map(sub => (
            <Tab key={sub} label={sub} value={sub} />
          ))}
        </Tabs>
      )}

      <Grid container spacing={2}>
        {/* LEFT SIDE */}
        <Grid item xs={12} md={8}>
          {/* TIMER BAR */}
          <Box
            sx={{
              position: "fixed",
              // top: 70,
              minWidth:"200px",
              zIndex: 10,
              bgcolor: "#fff59d",
              border: "1px solid #fdd835",
              borderRadius: 2,
              p: 2,
              px:"28px",
              // width:"80%",
              display: "flex",
              justifyContent: "space-between",
              mb: 10, // 👈 space so it doesn't overlap question
            }}
          >
        
            <Typography fontWeight={600} mr="12px">
              Time Left: {formatTime(timeLeft)}
            </Typography>
            
                <Typography fontWeight={600} mr="12px">
              |
            </Typography>
            <Typography fontWeight={600}>
               Ques Left: {leftCount}
            </Typography>
          </Box>

<div style={{marginTop:"80px"}}>
          {filteredQuestions.map((q, idx) => (
            <div key={q._id} ref={el => (questionRefs.current[idx] = el)}>
              <QuestionCard
                index={idx}
                data={q}
                selectedOption={selectedOptions[q._id] ?? null}
                onSelect={opt => handleSelectOption(q._id, opt)}
              />
            </div>
          ))}
          </div>

          {/* MOBILE SUBMIT BUTTON */}
          <Box sx={{ display: { xs: "block", md: "none" }, mt: 3 }}>
            <Button
              fullWidth
              color="error"
              variant="contained"
              size="large"
              onClick={handleSubmit}
            >
              Submit Test
            </Button>
          </Box>
        </Grid>

        {/* RIGHT SIDE (DESKTOP ONLY) */}
        <Grid item md={4} sx={{ display: { xs: "none", md: "block" } }}>
          
          <Paper
            sx={{
              position: "fixed",
              top: 90,
              p: 2,
              borderRadius: 3,
              maxHeight: "80vh",
              overflowY: "auto",
                           
              width: "30%",
            }}
          >

            <Typography variant="h6">Questions</Typography>

            <Box display="flex" justifyContent="space-between" my={1}>
              <Typography color="success.main">
                Answered: {answeredCount}
              </Typography>
              <Typography color="error.main">
                Unanswered: {leftCount}
              </Typography>
            </Box>

            <Grid container spacing={1}>
              {filteredQuestions.map((q, idx) => {
                const answered = selectedOptions[q._id] !== undefined;
                return (
                  <Grid item xs={2} key={q._id}>
                    <button
                      onClick={() => scrollToQuestion(idx)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        borderRadius: 4,
                        fontWeight: 600,
                        background: answered ? "#4caf50" : "#eee",
                        color: answered ? "#fff" : "#000",
                        border: "1px solid #ccc",
                      }}
                    >
                      {idx + 1}
                    </button>
                  </Grid>
                );
              })}
            </Grid>

            <Button
              fullWidth
              color="error"
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleSubmit}
            >
              Submit Test
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
