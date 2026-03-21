// "use client";
// export const dynamic = "force-dynamic";

// import {
//   Box,
//   Typography,
//   Tabs,
//   Tab,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   Chip,
// } from "@mui/material";
// import { useEffect, useMemo, useState } from "react";
// import PageContainer from "../../components/container/PageContainer";

// type TeacherExamType = "monthly" | "quarterly";
// type TabKey = "upcoming" | "ongoing" | "completed";

// type TeacherExam = {
//   _id: string;
//   testType: TeacherExamType;
//   teacherName: string;
//   course: string;
//   startTime: string; // ISO
//   endTime: string; // ISO
//   secondsPerQuestion?: number; // default 20
//   totalQuestions?: number;
//   questionIds?: string[];
//   createdAt?: string;
// };

// type TestRecord = {
//   _id: string;
//   email: string;
//   testType: "practice" | "monthly" | "quarterly";
//   course: string;
//   createdAt: string; // ISO
// };

// const formatWindow = (startISO: string, endISO: string) => {
//   const st = new Date(startISO);
//   const et = new Date(endISO);
//   const date = st.toLocaleDateString();
//   const t1 = st.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   const t2 = et.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   return { date, time: `${t1} - ${t2}` };
// };

// const formatDuration = (sec: number) => {
//   const mins = Math.floor(sec / 60);
//   const s = sec % 60;
//   if (mins <= 0) return `${s} sec`;
//   if (s === 0) return `${mins} min`;
//   return `${mins} min ${s} sec`;
// };

// const inRange = (t: number, start: number, end: number) => t >= start && t <= end;

// export default function StudentExamsPage() {
//   const [tab, setTab] = useState<TabKey>("upcoming");
//   const [exams, setExams] = useState<TeacherExam[]>([]);
//   const [records, setRecords] = useState<TestRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [startingId, setStartingId] = useState("");

//   const fetchAll = async () => {
//     setLoading(true);

//     // ✅ Use wherever you store student email
//     const email =
//       localStorage.getItem("email") ||
//       sessionStorage.getItem("email") ||
//       "";

//     // 1) fetch scheduled exams
//     const resExams = await fetch("/api/Get-Exam", { cache: "no-store" });
//     const jsonExams = await resExams.json();
//     setExams(jsonExams.exams || []);

//     // 2) fetch student test records (monthly/quarterly) from DB
//     // IMPORTANT: adapt this endpoint name if yours is different.
//     // Expecting: { records: TestRecord[] }
//     const resRec = await fetch("/api/exam-records", {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       cache: "no-store",
//     //   body: JSON.stringify({ email }),
//     });
//     const jsonRec = await resRec.json();
//     setRecords(jsonRec.records || []);

//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   // ✅ Determine "submitted" by DB record time within exam window + same testType + same course
//   const submittedByExamId = useMemo(() => {
//     const map = new Map<string, boolean>();

//     const monthQuarterRecords = records.filter(
//       (r) => r.testType === "monthly" || r.testType === "quarterly"
//     );

//     for (const ex of exams) {
//       const startMs = new Date(ex.startTime).getTime();
//       const endMs = new Date(ex.endTime).getTime();

//       const submitted = monthQuarterRecords.some((r) => {
//         if (r.testType !== ex.testType) return false;
//         if ((r.course || "").trim().toLowerCase() !== (ex.course || "").trim().toLowerCase())
//           return false;

//         const createdMs = new Date(r.createdAt).getTime();
//         return inRange(createdMs, startMs, endMs);
//       });

//       map.set(ex._id, submitted);
//     }

//     return map;
//   }, [exams, records]);

//   const categorized = useMemo(() => {
//     const now = Date.now();
//     const upcoming: TeacherExam[] = [];
//     const ongoing: TeacherExam[] = [];
//     const completed: TeacherExam[] = [];

//     for (const e of exams) {
//       const isSubmitted = submittedByExamId.get(e._id) === true;

//       // ✅ submitted => always completed
//       if (isSubmitted) {
//         completed.push(e);
//         continue;
//       }

//       const st = new Date(e.startTime).getTime();
//       const et = new Date(e.endTime).getTime();

//       if (now < st) upcoming.push(e);
//       else if (now >= st && now <= et) ongoing.push(e);
//       else completed.push(e);
//     }

//     upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
//     ongoing.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
//     completed.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

//     return { upcoming, ongoing, completed };
//   }, [exams, submittedByExamId]);

//   const list = categorized[tab];

//   const startExam = async (examId: string) => {
//     // ✅ extra guard
//     if (submittedByExamId.get(examId) === true) return;

//     try {
//       setStartingId(examId);

//       const res = await fetch("/api/Start-Exam", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ examId }),
//       });

//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         alert(json?.error || "Failed to start exam");
//         setStartingId("");
//         return;
//       }

//       const exam = json.exam;
//       const questions = json.questions || [];

//       const secondsPerQuestion = Number(exam?.secondsPerQuestion ?? 20);
//       const durationSec = Number(exam?.durationSec ?? questions.length * secondsPerQuestion);

//       const examEndMs = new Date(exam.endTime).getTime();
//       const targetEnd = Math.min(Date.now() + durationSec * 1000, examEndMs);

//       sessionStorage.setItem(
//         "currentTest",
//         JSON.stringify({
//           testType: exam.testType, // monthly/quarterly
//           course: exam.course,
//           subject: "",
//           chapter: "",
//           chapterLevel: null,
//           email:exam.email,
//           secondsPerQuestion,
//           questions,
//         })
//       );
//       sessionStorage.setItem("testEndTime", String(targetEnd));

//       // ✅ change this to your actual test page route
//       window.location.href = "/dashboard/student/test?exam";
//     } catch (e) {
//       console.error(e);
//       alert("Something went wrong");
//       setStartingId("");
//     }
//   };

//   const statusChip = (t: TabKey) => {
//     if (t === "upcoming") return <Chip label="Upcoming" color="info" size="small" />;
//     if (t === "ongoing") return <Chip label="Ongoing" color="success" size="small" />;
//     return <Chip label="Completed" color="default" size="small" />;
//   };

//   return (
//     <PageContainer title="Exams" description="Scheduled exams">
//       <Box mb={2}>
//         <Typography variant="h4" mb={2}>
//           Exams
//         </Typography>

//         <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
//           <Tab value="upcoming" label={`Upcoming (${categorized.upcoming.length})`} />
//           <Tab value="ongoing" label={`Ongoing (${categorized.ongoing.length})`} />
//           <Tab value="completed" label={`Completed (${categorized.completed.length})`} />
//         </Tabs>
//       </Box>

//       <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
//         <Table stickyHeader>
//           <TableHead>
//             <TableRow>
//               {[
//                 "Status",
//                 "Type",
//                 "Date",
//                 "Time",
//                 "Questions",
//                 "Duration",
//                 "Action",
//               ].map((h) => (
//                 <TableCell
//                   key={h}
//                   sx={{ fontWeight: 600, backgroundColor: "#f4f5f7" }}
//                 >
//                   {h}
//                 </TableCell>
//               ))}
//             </TableRow>
//           </TableHead>

//         <TableBody>
//             {list.map((exam) => {
//               const { date, time } = formatWindow(exam.startTime, exam.endTime);

//               const secPerQ = Number(exam.secondsPerQuestion ?? 20);
//               const totalQ = Number(exam.totalQuestions ?? exam.questionIds?.length ?? 0);
//               const durationSec = totalQ * secPerQ;

//               const isSubmitted = submittedByExamId.get(exam._id) === true;

//               return (
//                 <TableRow key={exam._id}>
//                   <TableCell>{statusChip(tab)}</TableCell>
//                   <TableCell sx={{ textTransform: "capitalize" }}>{exam.testType}</TableCell>
//                   <TableCell>{date}</TableCell>
//                   <TableCell>{time}</TableCell>
//                   <TableCell>{totalQ}</TableCell>
//                   <TableCell>{formatDuration(durationSec)}</TableCell>

//                   <TableCell>
//                     {/* ✅ If submitted => no Start button, always show Submitted */}
//                     {isSubmitted ? (
//                       <Chip label="Submitted" color="success" size="small" />
//                     ) : tab == "ongoing" ? (
//                       <Button
//                         variant="contained"
//                         onClick={() => startExam(exam._id)}
//                         // disabled={startingId === exam._id}
//                       >
//                         {/* {startingId === exam._id ? "Starting..." : "Start Test"} */}
//                         Start Test
//                       </Button>
//                     ) : (
//                       <Button variant="outlined" disabled>
//                         {tab == "upcoming" ? "Not Started" : "Closed"}
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               );
//             })}

//             {list.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={7} align="center">
//                   {loading ? "Loading..." : "No exams found"}
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Box mt={2} display="flex" gap={2}>
//         <Button variant="outlined" onClick={fetchAll} disabled={loading}>
//           Refresh
//         </Button>
//       </Box>
//     </PageContainer>
//   );
// }

"use client";
export const dynamic = "force-dynamic";

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/container/PageContainer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { useRouter } from "next/navigation";

type TeacherExamType = "monthly" | "quarterly";
type TabKey = "upcoming" | "ongoing" | "completed";

type TeacherExam = {
  _id: string;
  testType: TeacherExamType;
  teacherName: string;
  course: string;
  startTime: string; // ISO
  endTime: string; // ISO
  secondsPerQuestion?: number; // default 20
  totalQuestions?: number;
  questionIds?: string[];
  createdAt?: string;
};

type ExamRecord = {
  _id: string;
  email: string;
  testType: "practice" | "monthly" | "quarterly";
  course: string;
  createdAt: string; // ISO
  questionIds?: string[];
  resultStatus?: "pending" | "published";
  publishAt?: string | null;
};

const formatWindow = (startISO: string, endISO: string) => {
  const st = new Date(startISO);
  const et = new Date(endISO);
  const date = st.toLocaleDateString();
  const t1 = st.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const t2 = et.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time: `${t1} - ${t2}` };
};

const formatDuration = (sec: number) => {
  const mins = Math.floor(sec / 60);
  const s = sec % 60;
  if (mins <= 0) return `${s} sec`;
  if (s === 0) return `${mins} min`;
  return `${mins} min ${s} sec`;
};

const inRange = (t: number, start: number, end: number) => t >= start && t <= end;

export default function StudentExamsPage() {
  const [tab, setTab] = useState<TabKey>("upcoming");
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState("");
const router=useRouter()
  const fetchAll = async () => {
    setLoading(true);

    // 1) fetch scheduled exams
    const resExams = await fetch("/api/Get-Exam", { cache: "no-store" });
    const jsonExams = await resExams.json();
    setExams(jsonExams.exams || []);

    // 2) fetch student records from backend (current user)
    // ✅ IMPORTANT: this endpoint should return only current user records in backend
    // e.g. { success: true, records: ExamRecord[] }
    // OR { success: true, ongoing: [], completed: [], ... }
      const user_data = await getCurrentUser();
     if (user_data?.success && user_data.user) {
   let email=user_data.user.email
    const resRec = await fetch("/api/Exam-Record",  
      {method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email }),
  cache: "no-store",});
    const jsonRec = await resRec.json();

    const allRecords: ExamRecord[] =
      (jsonRec.records as ExamRecord[]) ||
      ([...(jsonRec.ongoing || []), ...(jsonRec.completed || [])] as ExamRecord[]) ||
      [];

    setRecords(allRecords);

    setLoading(false);
     }else{
       router.push("/login");
     }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ✅ Find best matching record for an exam (questionIds overlap OR time-window fallback)
  const findRecordForExam = (exam: TeacherExam) => {
    const exQ = new Set((exam.questionIds || []).map(String));
    const startMs = new Date(exam.startTime).getTime();
    const endMs = new Date(exam.endTime).getTime();

    return records.find((r) => {
      if (r.testType !== exam.testType) return false;
      if ((r.course || "").trim().toLowerCase() !== (exam.course || "").trim().toLowerCase())
        return false;

      // 1) Best match: questionIds overlap (avoid false matches using small threshold)
      const rQ = (r.questionIds || []).map(String);
      if (exQ.size && rQ.length) {
        let common = 0;
        for (const id of rQ) {
          if (exQ.has(id)) {
            common++;
            if (common >= 3) return true;
          }
        }
      }

      // 2) Fallback: createdAt in window
      const createdMs = new Date(r.createdAt).getTime();
      return inRange(createdMs, startMs, endMs);
    });
  };

  const isResultPublished = (rec?: ExamRecord) => {
    if (!rec) return false;
    if (rec.resultStatus === "published") return true;
    if (rec.publishAt && new Date(rec.publishAt).getTime() <= Date.now()) return true;
    return false;
  };

  // ✅ Determine "submitted" by matching record (same testType + same course + overlap/time-window)
  const submittedByExamId = useMemo(() => {
    const map = new Map<string, boolean>();

    const monthQuarterRecords = records.filter(
      (r) => r.testType === "monthly" || r.testType === "quarterly"
    );

    for (const ex of exams) {
      const startMs = new Date(ex.startTime).getTime();
      const endMs = new Date(ex.endTime).getTime();
      const exQ = new Set((ex.questionIds || []).map(String));

      const submitted = monthQuarterRecords.some((r) => {
        if (r.testType !== ex.testType) return false;
        if ((r.course || "").trim().toLowerCase() !== (ex.course || "").trim().toLowerCase())
          return false;

        // 1) Best: questionIds overlap threshold
        const rQ = (r.questionIds || []).map(String);
        if (exQ.size && rQ.length) {
          let common = 0;
          for (const id of rQ) {
            if (exQ.has(id)) {
              common++;
              if (common >= 3) return true;
            }
          }
        }

        // 2) fallback: createdAt inside window
        const createdMs = new Date(r.createdAt).getTime();
        return inRange(createdMs, startMs, endMs);
      });

      map.set(ex._id, submitted);
    }

    return map;
  }, [exams, records]);

  const categorized = useMemo(() => {
    const now = Date.now();
    const upcoming: TeacherExam[] = [];
    const ongoing: TeacherExam[] = [];
    const completed: TeacherExam[] = [];

    for (const e of exams) {
      const isSubmitted = submittedByExamId.get(e._id) === true;

      // ✅ submitted => always completed
      if (isSubmitted) {
        completed.push(e);
        continue;
      }

      const st = new Date(e.startTime).getTime();
      const et = new Date(e.endTime).getTime();

      if (now < st) upcoming.push(e);
      else if (now >= st && now <= et) ongoing.push(e);
      else completed.push(e);
    }

    upcoming.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    ongoing.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    completed.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

    return { upcoming, ongoing, completed };
  }, [exams, submittedByExamId]);

  const list = categorized[tab];

  const startExam = async (examId: string) => {
    // ✅ extra guard
    if (submittedByExamId.get(examId) === true) return;

    try {
      setStartingId(examId);

      const res = await fetch("/api/Start-Exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json?.error || "Failed to start exam");
        setStartingId("");
        return;
      }

      const exam = json.exam;
      const questions = json.questions || [];

      const secondsPerQuestion = Number(exam?.secondsPerQuestion ?? 20);
      const durationSec = Number(exam?.durationSec ?? questions.length * secondsPerQuestion);

      const examEndMs = new Date(exam.endTime).getTime();
      const targetEnd = Math.min(Date.now() + durationSec * 1000, examEndMs);

      sessionStorage.setItem(
        "currentTest",
        JSON.stringify({
          examId,
          testType: exam.testType, // monthly/quarterly
          course: exam.course,
          subject: "",
          chapter: "",
          chapterLevel: null,
          // ✅ email should NOT be stored from exam (teacher exam does not have email)
          secondsPerQuestion,
          questions,
        })
      );
      sessionStorage.setItem("testEndTime", String(targetEnd));

      // ✅ change this to your actual test page route
      window.location.href = "/dashboard/student/test?exam";
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
      setStartingId("");
    }
  };

  const statusChip = (t: TabKey) => {
    if (t === "upcoming") return <Chip label="Upcoming" color="info" size="small" />;
    if (t === "ongoing") return <Chip label="Ongoing" color="success" size="small" />;
    return <Chip label="Completed" color="default" size="small" />;
  };

  return (
    <PageContainer title="Exams" description="Scheduled exams">
      <Box mb={2}>
        <Typography variant="h4" mb={2}>
          Exams
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab value="upcoming" label={`Upcoming (${categorized.upcoming.length})`} />
          <Tab value="ongoing" label={`Ongoing (${categorized.ongoing.length})`} />
          <Tab value="completed" label={`Completed (${categorized.completed.length})`} />
        </Tabs>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {["Status", "Type", "Date", "Time", "Questions", "Duration", "Action"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 600, backgroundColor: "#f4f5f7" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {list.map((exam) => {
              const { date, time } = formatWindow(exam.startTime, exam.endTime);

              const secPerQ = Number(exam.secondsPerQuestion ?? 20);
              const totalQ = Number(exam.totalQuestions ?? exam.questionIds?.length ?? 0);
              const durationSec = totalQ * secPerQ;

              const isSubmitted = submittedByExamId.get(exam._id) === true;
              const rec = tab === "completed" ? findRecordForExam(exam) : undefined;
              const published = tab === "completed" ? isResultPublished(rec) : false;

              return (
                <TableRow key={exam._id}>
                  <TableCell>{statusChip(tab)}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>{exam.testType}</TableCell>
                  <TableCell>{date}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell>{totalQ}</TableCell>
                  <TableCell>{formatDuration(durationSec)}</TableCell>

                  <TableCell>
                    {/* ✅ Completed: if submitted show Result or Pending. Ongoing/Upcoming keep same behavior */}
                    {isSubmitted ? (
                      tab === "completed" ? (
                        published ? (
                          <Button
                            variant="contained"
                            onClick={() => {
                              if (!rec?._id) return;
                              sessionStorage.setItem("resultRecordId", rec._id);
                              window.location.href = `/dashboard/student/result?rid=${rec._id}`;
                            }}
                          >
                            View Result
                          </Button>
                        ) : (
                          <Chip label="Result Pending" color="warning" size="small" />
                        )
                      ) : (
                        <Chip label="Submitted" color="success" size="small" />
                      )
                    ) : tab === "ongoing" ? (
                      <Button
                        variant="contained"
                        onClick={() => startExam(exam._id)}
                        // disabled={startingId === exam._id}
                      >
                        {/* {startingId === exam._id ? "Starting..." : "Start Test"} */}
                        Start Test
                      </Button>
                    ) : (
                      <Button variant="outlined" disabled>
                        {tab === "upcoming" ? "Not Started" : "Closed"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {loading ? "Loading..." : "No exams found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" gap={2}>
        <Button variant="outlined" onClick={fetchAll} disabled={loading}>
          Refresh
        </Button>
      </Box>
    </PageContainer>
  );
}
