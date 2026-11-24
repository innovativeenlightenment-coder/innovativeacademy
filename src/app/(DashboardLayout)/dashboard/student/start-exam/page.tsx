"use client";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
  Dialog,
DialogTitle,
DialogContent,
DialogActions,
FormControlLabel,
Checkbox,
} from "@mui/material";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarMonthRounded,
  AccessTimeRounded,
  MenuBookRounded,
  ArrowForwardRounded,
  AssignmentRounded,
  CheckCircleRounded,
  ScheduleRounded,
  EmojiEventsRounded,
  AutoAwesomeRounded,
  RefreshRounded,
  HourglassTopRounded,
  PlayArrowRounded,
  ScienceRounded,
  InfoOutlined,
WarningAmberRounded,
ShieldRounded,
TimerOutlined,
WifiRounded,
FactCheckRounded,
} from "@mui/icons-material";

import PageContainer from "../../components/container/PageContainer";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { useRouter } from "next/navigation";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type ExamStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "completed"
  | "cancelled";

type TabKey = "upcoming" | "ongoing" | "completed";

type SecondsPerQuestion = {
  easy: number;
  moderate: number;
  difficult: number;
  extreme: number;
};

type ExamSchedule = {
  startTime: string;
  endTime: string;
  durationMinutes: number;
};

type ExamQuestion = {
  _id?: string;
  questionId?: string;
  difficulty?: string;
  level?: string;
  [key: string]: any;
};

type TeacherExam = {
  _id: string;
  title: string;
  testType: string;
  teacherName: string;
  course: string;
  subject: string;
  chapters: string[];

  schedule: ExamSchedule;

  status: ExamStatus;

  totalQuestions?: number;
  totalMarks?: number;

  questions?: ExamQuestion[];
  questionIds?: string[];

  distribution?: {
    mode: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };

  secondsPerQuestion?: SecondsPerQuestion;

  createdAt?: string;
};

type ExamRecord = {
  _id: string;
  examId?: string;
  email: string;
  testType: string;
  course: string;
  createdAt: string;
  questionIds?: string[];
  resultStatus?: "pending" | "published";
  publishAt?: string | null;
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const PURPLE = "#6D28D9";

const normalizeCourse = (course?: string) =>
  (course || "").trim().toLowerCase();

const getExamStart = (exam: TeacherExam) =>
  exam?.schedule?.startTime || "";

const getExamEnd = (exam: TeacherExam) =>
  exam?.schedule?.endTime || "";

const getExamQuestionIds = (exam: TeacherExam): string[] => {
  if (Array.isArray(exam.questionIds) && exam.questionIds.length) {
    return exam.questionIds.map(String);
  }

  if (Array.isArray(exam.questions)) {
    return exam.questions
      .map((question) =>
        String(question._id || question.questionId || "")
      )
      .filter(Boolean);
  }

  return [];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "Not specified";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Not specified";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString?: string) => {
  if (!dateString) return "--:--";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeSecondsPerQuestion = (
  value?: SecondsPerQuestion
): SecondsPerQuestion => ({
  easy: Number(value?.easy ?? 10),
  moderate: Number(value?.moderate ?? 20),
  difficult: Number(value?.difficult ?? 45),
  extreme: Number(value?.extreme ?? 60),
});

const getQuestionCount = (exam: TeacherExam) =>
  Number(
    exam.totalQuestions ??
      exam.questions?.length ??
      exam.questionIds?.length ??
      0
  );

const getExamTitle = (exam: TeacherExam) =>
  exam.title?.trim() || `${exam.subject || "Examination"} Test`;

const getExamCategory = (
  exam: TeacherExam,
  now: number
): TabKey => {
  const start = new Date(getExamStart(exam)).getTime();
  const end = new Date(getExamEnd(exam)).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "completed";
  }

  if (now < start) return "upcoming";

  if (now <= end) return "ongoing";

  return "completed";
};

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function StudentExamsPage() {
  const router = useRouter();
const startingLock = useRef(false);
  const [tab, setTab] = useState<TabKey>("ongoing");
const [rulesOpen, setRulesOpen] = useState(false);
const [rulesAccepted, setRulesAccepted] = useState(false);
const [selectedExamId, setSelectedExamId] = useState("");
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [records, setRecords] = useState<ExamRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState("");
  const [error, setError] = useState("");


  const openExamRules = (examId: string) => {
  if (startingLock.current || startingId) return;

  setSelectedExamId(examId);
  setRulesAccepted(false);
  setRulesOpen(true);
};

const confirmAndStartExam = async () => {
  if (!rulesAccepted || !selectedExamId) return;

  setRulesOpen(false);

  await startExam(selectedExamId);
};

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const userData = await getCurrentUser();

      if (!userData?.success || !userData.user) {
        router.push("/login");
        return;
      }

      const email = userData.user.email;

      // Supports both:
      // ["Foundation 8th", "Foundation 9th"]
      // "Foundation 8th,Foundation 9th"

      const rawCourses = userData.user.courses;

      const courses = Array.isArray(rawCourses)
        ? rawCourses
        : typeof rawCourses === "string"
          ? rawCourses.split(",")
          : [];

     const normalizedCourses = Array.from(
  new Set(
    courses
      .map((course: string) => String(course).trim())
      .filter(Boolean)
  )
);

      const courseQuery = normalizedCourses
        .map(encodeURIComponent)
        .join(",");

      const examUrl = courseQuery
        ? `/api/Get-Exam?course=${courseQuery}`
        : "/api/Get-Exam";

      const [examResponse, recordResponse] = await Promise.all([
        fetch(examUrl, {
          cache: "no-store",
        }),

        fetch("/api/Exam-Record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
          cache: "no-store",
        }),
      ]);

      if (!examResponse.ok) {
        throw new Error("Unable to load scheduled examinations.");
      }

      if (!recordResponse.ok) {
        throw new Error("Unable to load your examination records.");
      }

      const examJson = await examResponse.json();
      const recordJson = await recordResponse.json();

      if (!examJson.success) {
        throw new Error(
          examJson.error || "Failed to fetch examinations."
        );
      }

      // New exam structure uses schedule.startTime/endTime.
      // Normalize the response so the UI always receives the
      // current structure.

      const normalizedExams: TeacherExam[] = (
        examJson.exams || []
      ).map((exam: any) => ({
        ...exam,

        title: exam.title || "",

        subject: exam.subject || "",

        chapters: Array.isArray(exam.chapters)
          ? exam.chapters
          : [],

        schedule: {
          startTime:
            exam.schedule?.startTime ||
            exam.startTime ||
            "",

          endTime:
            exam.schedule?.endTime ||
            exam.endTime ||
            "",

          durationMinutes: Number(
            exam.schedule?.durationMinutes ?? 0
          ),
        },

        questions: Array.isArray(exam.questions)
          ? exam.questions
          : [],

        questionIds: Array.isArray(exam.questionIds)
          ? exam.questionIds
          : [],

        status: exam.status || "scheduled",
      }));

      setExams(normalizedExams);

      const allRecords: ExamRecord[] =
        recordJson.records ||
        [
          ...(recordJson.ongoing || []),
          ...(recordJson.completed || []),
        ];

      setRecords(allRecords);
    } catch (err) {
      console.error("Fetch exams error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading examinations."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --------------------------------------------------
  // FIND EXAM RECORD
  // --------------------------------------------------

  const findRecordForExam = useCallback(
  (exam: TeacherExam) => {
    return records.find(
      (record) => String(record.examId) === String(exam._id)
    );
  },
  [records]
);

  // --------------------------------------------------
  // SUBMISSION STATUS
  // --------------------------------------------------

const submittedByExamId = useMemo(() => {
  const map = new Map<string, boolean>();

  for (const exam of exams) {
    const record = records.find(
      (item) =>
        String(item.examId) === String(exam._id)
    );

    map.set(exam._id, Boolean(record));
  }

  return map;
}, [exams, records]);

  // --------------------------------------------------
  // RESULT PUBLISHED
  // --------------------------------------------------

  const isResultPublished = (record?: ExamRecord) => {
    if (!record) return false;

    if (record.resultStatus === "published") {
      return true;
    }

    return (
      !!record.publishAt &&
      new Date(record.publishAt).getTime() <= Date.now()
    );
  };

  // --------------------------------------------------
  // CATEGORIZE EXAMS
  // --------------------------------------------------

const categorized = useMemo(() => {
  const now = Date.now();

  const upcoming: TeacherExam[] = [];
  const ongoing: TeacherExam[] = [];
  const completed: TeacherExam[] = [];

  for (const exam of exams) {
    if (
      exam.status === "draft" ||
      exam.status === "cancelled"
    ) {
      continue;
    }

    const start = new Date(
      getExamStart(exam)
    ).getTime();

    const end = new Date(
      getExamEnd(exam)
    ).getTime();

    // Invalid schedule
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start
    ) {
      completed.push(exam);
      continue;
    }

    const submitted =
      submittedByExamId.get(exam._id) === true;

    // Submitted examinations always go to Completed.
    if (submitted) {
      completed.push(exam);
      continue;
    }

    // Not started yet.
    if (now < start) {
      upcoming.push(exam);
      continue;
    }

    // Schedule is active and student has not submitted.
    if (now <= end) {
      ongoing.push(exam);
      continue;
    }

    // Schedule ended without submission.
    completed.push(exam);
  }

  upcoming.sort(
    (a, b) =>
      new Date(getExamStart(a)).getTime() -
      new Date(getExamStart(b)).getTime()
  );

  ongoing.sort(
    (a, b) =>
      new Date(getExamStart(a)).getTime() -
      new Date(getExamStart(b)).getTime()
  );

  completed.sort(
    (a, b) =>
      new Date(getExamEnd(b)).getTime() -
      new Date(getExamEnd(a)).getTime()
  );

  return {
    upcoming,
    ongoing,
    completed,
  };
}, [exams, submittedByExamId]);

  const list = categorized[tab];

  // --------------------------------------------------
  // START EXAM
  // --------------------------------------------------
const startExam = async (examId: string) => {
  if (
    startingLock.current ||
    startingId ||
    submittedByExamId.get(examId)
  ) {
    return;
  }

  startingLock.current = true;
  setStartingId(examId);
  setError("");

  try {
    const response = await fetch("/api/Start-Exam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ examId }),
      cache: "no-store",
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(
        json?.error ||
          json?.message ||
          "Failed to start examination."
      );
    }

    const exam = json.exam;
    const questions = Array.isArray(json.questions)
      ? json.questions
      : [];

    if (!questions.length) {
      throw new Error(
        "No questions are available for this examination."
      );
    }

    const durationSec = Number(exam?.durationSec);

    if (
      !Number.isFinite(durationSec) ||
      durationSec <= 0
    ) {
      throw new Error("Invalid examination duration.");
    }

    const examEndMs = new Date(exam?.endTime).getTime();

    if (!Number.isFinite(examEndMs)) {
      throw new Error(
        "Invalid examination end time received from the server."
      );
    }

    const now = Date.now();

    const calculatedEndTime =
      now + durationSec * 1000;

    const attemptEndTime = Math.min(
      calculatedEndTime,
      examEndMs
    );

    if (attemptEndTime <= now) {
      throw new Error(
        "This examination has already ended."
      );
    }

    const currentExam = {
      examId: exam.examId,
      title: exam.title || "Examination",
      testType: exam.testType || "exam",
      teacherName: exam.teacherName || "",

      course: exam.course || "",
      subject: exam.subject || "",

      chapters: Array.isArray(exam.chapters)
        ? exam.chapters
        : [],

      durationSec,

      totalQuestions: Number(
        exam.totalQuestions || questions.length
      ),

      totalMarks: Number(exam.totalMarks || 0),

      startTime: exam.startTime,
      endTime: exam.endTime,

      secondsPerQuestion: exam.secondsPerQuestion,
      distribution: exam.distribution,

      // Preserve all question and Learning Skills data.
      questions,
    };

    // Clear previous attempt data.
    sessionStorage.removeItem(
      "studentExamAnswersV2"
    );

    sessionStorage.removeItem(
      "currentExam"
    );

    sessionStorage.removeItem(
      "studentExamEndTimeV2"
    );

    sessionStorage.setItem(
      "currentExam",
      JSON.stringify(currentExam)
    );

    sessionStorage.setItem(
      "studentExamEndTimeV2",
      String(attemptEndTime)
    );

    window.location.href =
      "/dashboard/student/exam";

  } catch (err) {
    console.error("Start exam error:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong."
    );

    startingLock.current = false;
    setStartingId("");
  }
};




  // --------------------------------------------------
// MINIMAL EXAM CARD
// --------------------------------------------------

const ExamCard = ({
  exam,
  status,
}: {
  exam: TeacherExam;
  status: TabKey;
}) => {
  const submitted = submittedByExamId.get(exam._id) === true;

  const record =
    status === "completed" ? findRecordForExam(exam) : undefined;

  const published =
    status === "completed" && isResultPublished(record);

  const isStarting = startingId === exam._id;

  const chapters = exam.chapters || [];

  const statusConfig = {
    ongoing: {
      label: "Available",
      color: "#15803D",
      bg: "#DCFCE7",
      border: "#BBF7D0",
    },
    upcoming: {
      label: "Upcoming",
      color: "#1D4ED8",
      bg: "#DBEAFE",
      border: "#BFDBFE",
    },
    completed: {
      label: submitted ? "Submitted" : "Closed",
      color: "#64748B",
      bg: "#F1F5F9",
      border: "#E2E8F0",
    },
  }[status];

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E9E5F3",
        borderRadius: 2,
        background: "#FFFFFF",
        overflow: "hidden",
        transition: "0.2s ease",

        "&:hover": {
          borderColor: "#C4B5FD",
          boxShadow: "0 4px 14px rgba(76,29,149,0.07)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 1.5,
          "&:last-child": { pb: 1.5 },
        }}
      >
        {/* TITLE + STATUS */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 800,
                color: "#21133D",
                textTransform: "capitalize",
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getExamTitle(exam)}
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: "#8B849B",
                mt: 0.2,
              }}
            >
              {exam.subject || "General"} · {exam.testType || "Exam"}
            </Typography>
          </Box>

          <Chip
            label={statusConfig.label}
            size="small"
            sx={{
              height: 21,
              fontSize: 9,
              fontWeight: 750,
              color: statusConfig.color,
              background: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
        </Stack>

        {/* DATE + TIME */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            mt: 1,
            color: "#64748B",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarMonthRounded sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
              {formatDate(getExamStart(exam))}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <AccessTimeRounded sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
              {formatTime(getExamStart(exam))} –{" "}
              {formatTime(getExamEnd(exam))}
            </Typography>
          </Stack>
        </Stack>

        {/* CHAPTERS */}
        {chapters.length > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={0.5}
            sx={{ mt: 1 }}
          >
            {chapters.map((chapter) => (
              <Chip
                key={chapter}
                label={chapter}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 9,
                  fontWeight: 600,
                  color: "#6D28D9",
                  background: "#F5F3FF",
                  borderRadius: 1,
                  "& .MuiChip-label": {
                    px: 0.8,
                  },
                }}
              />
            ))}
          </Stack>
        )}

        {/* ACTION */}
        {(status === "ongoing" && !submitted) ||
        (status === "upcoming") ||
        (status === "completed" && submitted && published && record?._id) ||
        (status === "completed" && submitted && !published) ||
        (status === "completed" && !submitted) ? (
          <Box sx={{ mt: 1.2 }}>
            {status === "ongoing" && !submitted && (
              <Button
                fullWidth
                size="small"
                variant="contained"
                disabled={!!startingId}
                onClick={() => openExamRules(exam._id)}
                endIcon={
                  isStarting ? (
                    <CircularProgress size={13} color="inherit" />
                  ) : (
                    <PlayArrowRounded sx={{ fontSize: 17 }} />
                  )
                }
                sx={{
                  minHeight: 30,
                  py: 0.4,
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontSize: 11,
                  fontWeight: 750,
                  background: "#6D28D9",
                  boxShadow: "none",
                  "&:hover": {
                    background: "#5B21B6",
                    boxShadow: "none",
                  },
                }}
              >
                {isStarting ? "Starting..." : "Start Examination"}
              </Button>
            )}

            {status === "upcoming" && (
              <Typography
                sx={{
                  fontSize: 10,
                  color: "#64748B",
                  textAlign: "center",
                  py: 0.4,
                }}
              >
                Examination has not started yet
              </Typography>
            )}

            {status === "completed" &&
              submitted &&
              published &&
              record?._id && (
                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                 onClick={() => {
  router.push(
    `/dashboard/student/exam-result/${record._id}`
  );
}}
                  sx={{
                    minHeight: 30,
                    py: 0.4,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: 11,
                    fontWeight: 750,
                    background: "#059669",
                    boxShadow: "none",
                    "&:hover": {
                      background: "#047857",
                      boxShadow: "none",
                    },
                  }}
                >
                  View Result
                </Button>
              )}

            {status === "completed" &&
              submitted &&
              !published && (
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#B45309",
                    textAlign: "center",
                    fontWeight: 700,
                    py: 0.4,
                  }}
                >
                  Result Awaited
                </Typography>
              )}

           
            {status === "completed" && !submitted && (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      mt: 0.5,
    }}
  >
    <Chip
      icon={<ScheduleRounded />}
      label="Not Attended"
      size="small"
      sx={{
        height: 25,
        fontSize: 10,
        fontWeight: 750,
        color: "#B45309",
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        borderRadius: 1.5,
        "& .MuiChip-icon": {
          color: "#B45309",
          fontSize: 15,
        },
      }}
    />
  </Box>
)}
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};
  
  // --------------------------------------------------
  // STAT CARD
  // --------------------------------------------------

  const StatCard = ({
    title,
    count,
    subtitle,
    icon,
    color,
    background,
    active,
    onClick,
  }: {
    title: string;
    count: number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    background: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: 3.5,
        border: active
          ? `1.5px solid ${color}`
          : "1px solid #EEEAF4",
        background: active ? background : "#FFFFFF",
        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow:
            "0 8px 24px rgba(30, 20, 50, 0.06)",
        },
      }}
    >
      <CardContent sx={{ p: 2.3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
              color="#777085"
            >
              {title}
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 850,
                color: "#25183D",
                mt: 1,
                letterSpacing: -1,
              }}
            >
              {count.toString().padStart(2, "0")}
            </Typography>

            <Typography
              variant="caption"
              color="#9690A4"
            >
              {subtitle}
            </Typography>
          </Box>

          <Avatar
            variant="rounded"
            sx={{
              width: 49,
              height: 49,
              borderRadius: 2.5,
              background: color,
              color: "#FFFFFF",
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );

  // --------------------------------------------------
  // MAIN UI
  // --------------------------------------------------

  return (
    <PageContainer
      title="Examinations"
      description="Your scheduled examinations"
    >
      <Dialog
  open={rulesOpen}
  onClose={() => {
    if (startingId) return;
    setRulesOpen(false);
  }}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      borderRadius: 3,
      overflow: "hidden",
      mx: 2,
    },
  }}
>
  {/* HEADER */}

  <Box
    sx={{
      p: 2.5,
      color: "#FFFFFF",
      background:
        "linear-gradient(120deg, #3B0764, #6D28D9)",
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar
        sx={{
          bgcolor: "rgba(255,255,255,0.17)",
          color: "#FFFFFF",
        }}
      >
        <FactCheckRounded />
      </Avatar>

      <Box>
        <Typography fontWeight={850} fontSize={19}>
          Examination Instructions
        </Typography>

        <Typography
          fontSize={12}
          sx={{ color: "#DDD6FE", mt: 0.3 }}
        >
          Please read these instructions before starting.
        </Typography>
      </Box>
    </Stack>
  </Box>

  <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
    {/* IMPORTANT NOTICE */}

    <Alert
      severity="warning"
      icon={<WarningAmberRounded />}
      sx={{
        mb: 2.5,
        borderRadius: 2,
        fontSize: 12,
      }}
    >
      Once your examination starts, the examination timer
      begins. Make sure you are ready before proceeding.
    </Alert>

    <Typography
      fontWeight={800}
      fontSize={14}
      color="#25183D"
      mb={1.5}
    >
      General Rules
    </Typography>

    <Stack spacing={2}>
      {[
        {
          icon: <TimerOutlined />,
          title: "Time Management",
          description:
            "The examination has a fixed time limit. The timer will continue running once the examination starts.",
        },
        {
          icon: <ShieldRounded />,
          title: "One Submission",
          description:
            "You are allowed only one submission for this examination. Check your answers before submitting.",
        },
        {
          icon: <InfoOutlined />,
          title: "Do Not Refresh or Close",
          description:
            "Do not refresh the page, close the browser, or navigate away from the examination while attempting it.",
        },
        {
          icon: <WifiRounded />,
          title: "Internet Connection",
          description:
            "Ensure that you have a stable internet connection before starting. Avoid switching networks during the examination.",
        },
        {
          icon: <FactCheckRounded />,
          title: "Read Questions Carefully",
          description:
            "Read every question and its instructions carefully. Attempt questions independently.",
        },
      ].map((rule, index) => (
        <Stack
          key={index}
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#F5F3FF",
              color: "#6D28D9",
              borderRadius: 2,
            }}
          >
            {rule.icon}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography
              fontSize={13}
              fontWeight={800}
              color="#302344"
            >
              {index + 1}. {rule.title}
            </Typography>

            <Typography
              fontSize={12}
              color="#777085"
              lineHeight={1.65}
              mt={0.3}
            >
              {rule.description}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>

    <Divider sx={{ my: 2.5 }} />

    {/* AGREEMENT */}

    <FormControlLabel
      control={
        <Checkbox
          checked={rulesAccepted}
          onChange={(event) =>
            setRulesAccepted(event.target.checked)
          }
          sx={{
            color: "#A78BFA",
            "&.Mui-checked": {
              color: "#6D28D9",
            },
          }}
        />
      }
      label={
        <Typography
          fontSize={12}
          fontWeight={650}
          color="#43365B"
        >
          I have read and understood all the examination
          instructions. I am ready to begin.
        </Typography>
      }
      sx={{
        alignItems: "flex-start",
        mx: 0,
      }}
    />
  </DialogContent>

  {/* ACTIONS */}

  <DialogActions
    sx={{
      px: 2.5,
      pb: 2.5,
      pt: 0,
      gap: 1,
      flexDirection: { xs: "column-reverse", sm: "row" },
    }}
  >
    <Button
      fullWidth
      variant="outlined"
      onClick={() => setRulesOpen(false)}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 750,
        borderColor: "#DDD6E8",
        color: "#64748B",
      }}
    >
      Not Now
    </Button>

    <Button
      fullWidth
      variant="contained"
      disabled={!rulesAccepted || !!startingId}
      onClick={confirmAndStartExam}
      endIcon={
        startingId ? (
          <CircularProgress size={15} color="inherit" />
        ) : (
          <PlayArrowRounded />
        )
      }
      sx={{
        borderRadius: 2,
        py: 1.1,
        textTransform: "none",
        fontWeight: 800,
        bgcolor: "#6D28D9",
        boxShadow: "none",
        "&:hover": {
          bgcolor: "#5B21B6",
          boxShadow: "none",
        },
      }}
    >
      {startingId ? "Starting..." : "I Agree — Start Exam"}
    </Button>
  </DialogActions>
</Dialog>
      <Box
        sx={{
          width: "100%",
          maxWidth: 1500,
          mx: "auto",
        }}
      >
        {/* HERO SECTION */}

        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: { xs: 3, md: 4 },
            p: { xs: 2.7, sm: 3.5, md: 4.5 },
            mb: 3.5,
            color: "#FFFFFF",
            background:
              "linear-gradient(115deg, #3B0764 0%, #5B21B6 48%, #7C3AED 100%)",
            boxShadow:
              "0 14px 35px rgba(76, 29, 149, 0.18)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 260,
              height: 260,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.12)",
              right: -65,
              top: -125,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 190,
              height: 190,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.10)",
              right: 55,
              bottom: -130,
            }}
          />

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            mb={2}
            sx={{ position: "relative" }}
          >
            <AutoAwesomeRounded
              sx={{
                fontSize: 17,
                color: "#DDD6FE",
              }}
            />

            <Typography
              variant="overline"
              sx={{
                letterSpacing: 2,
                color: "#DDD6FE",
                fontWeight: 800,
                lineHeight: 1.5,
              }}
            >
              YOUR LEARNING JOURNEY
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={3}
            sx={{ position: "relative" }}
          >
            <Box sx={{ maxWidth: 600 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 850,
                  letterSpacing: -1,
                  fontSize: {
                    xs: 27,
                    sm: 34,
                    md: 40,
                  },
                  lineHeight: 1.2,
                }}
              >
                Your Examinations
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1.5,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.8,
                  maxWidth: 470,
                  fontSize: { xs: 13, sm: 15 },
                }}
              >
                Every examination is an opportunity to
                challenge yourself, strengthen your concepts
                and measure your progress.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2.3,
                py: 1.7,
                borderRadius: 3,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Avatar
                sx={{
                  width: 43,
                  height: 43,
                  background: "rgba(255,255,255,0.17)",
                }}
              >
                <EmojiEventsRounded />
              </Avatar>

              <Box>
                <Typography
                  variant="body2"
                  fontWeight={800}
                >
                  Learn. Practice. Improve.
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: "#DDD6FE" }}
                >
                  Your progress matters.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* ERROR */}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchAll}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* STATISTICS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 2,
            mb: 4,
          }}
        >
          <StatCard
            title="Upcoming"
            count={categorized.upcoming.length}
            subtitle="Scheduled for you"
            icon={<CalendarMonthRounded />}
            color="#2563EB"
            background="#EFF6FF"
            active={tab === "upcoming"}
            onClick={() => setTab("upcoming")}
          />

          <StatCard
            title="Ongoing"
            count={categorized.ongoing.length}
            subtitle="Available to attempt"
            icon={<AssignmentRounded />}
            color="#7C3AED"
            background="#F5F3FF"
            active={tab === "ongoing"}
            onClick={() => setTab("ongoing")}
          />

          <StatCard
            title="Completed"
            count={categorized.completed.length}
            subtitle="Previous examinations"
            icon={<CheckCircleRounded />}
            color="#059669"
            background="#ECFDF5"
            active={tab === "completed"}
            onClick={() => setTab("completed")}
          />
        </Box>

        {/* EXAM SECTION HEADER */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={2.5}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={850}
              color="#241638"
            >
              Examination Schedule
            </Typography>

            <Typography
              variant="body2"
              color="#898397"
              mt={0.5}
            >
              Manage and attempt your scheduled examinations.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={fetchAll}
            disabled={loading}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#DDD6E8",
              color: "#5B21B6",

              "&:hover": {
                borderColor: PURPLE,
                background: "#F5F3FF",
              },
            }}
          >
            Refresh
          </Button>
        </Stack>

        {/* TABS */}

        <Box
          sx={{
            borderBottom: "1px solid #EEEAF4",
            mb: 3,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,

              "& .MuiTab-root": {
                minHeight: 48,
                textTransform: "none",
                fontWeight: 750,
                fontSize: 13,
                color: "#817A91",
                px: 2.5,
              },

              "& .Mui-selected": {
                color: `${PURPLE} !important`,
              },

              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 5,
                backgroundColor: PURPLE,
              },
            }}
          >
            <Tab
              value="ongoing"
              label={`Ongoing (${categorized.ongoing.length})`}
            />

            <Tab
              value="upcoming"
              label={`Upcoming (${categorized.upcoming.length})`}
            />

            <Tab
              value="completed"
              label={`Completed (${categorized.completed.length})`}
            />
          </Tabs>
        </Box>

        {/* LOADING / EMPTY / EXAMS */}

        {loading ? (
          <Box
            sx={{
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress
              size={35}
              sx={{ color: PURPLE }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Loading your examinations...
            </Typography>
          </Box>
        ) : list.length === 0 ? (
          <Box
            sx={{
              py: 7,
              px: 2,
              textAlign: "center",
              border: "1px dashed #D8D0E5",
              borderRadius: 4,
              background:
                "linear-gradient(180deg, #FCFAFF, #FFFFFF)",
            }}
          >
            <Avatar
              sx={{
                width: 65,
                height: 65,
                mx: "auto",
                mb: 2,
                background: "#F3E8FF",
                color: PURPLE,
              }}
            >
              {tab === "ongoing" ? (
                <AssignmentRounded fontSize="large" />
              ) : tab === "upcoming" ? (
                <CalendarMonthRounded fontSize="large" />
              ) : (
                <CheckCircleRounded fontSize="large" />
              )}
            </Avatar>

            <Typography
              variant="h6"
              fontWeight={800}
              color="#302344"
            >
              {tab === "ongoing"
                ? "No ongoing examinations"
                : tab === "upcoming"
                  ? "No upcoming examinations"
                  : "No completed examinations yet"}
            </Typography>

            <Typography
              variant="body2"
              color="#8B849B"
              mt={1}
            >
              {tab === "ongoing"
                ? "Your available examinations will appear here."
                : tab === "upcoming"
                  ? "Newly scheduled examinations will appear here."
                  : "Your attempted examinations and results will appear here."}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2.5,
              alignItems: "start",
            }}
            
          >
            {list.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                status={tab}
              />
            ))}
          </Box>
        )}

        {/* FOOTER */}

        <Box
          sx={{
            mt: 5,
            py: 2,
            borderTop: "1px solid #EEEAF4",
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography
            variant="caption"
            color="#A19AAC"
          >
            Innovative Academy · Learn with understanding,
            grow with confidence.
          </Typography>
        </Box>
      </Box>
    </PageContainer>
  );
}