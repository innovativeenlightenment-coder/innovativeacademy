"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  ListSubheader,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  AutoAwesomeRounded,
  CheckCircleRounded,
  Close,
  DeleteOutline,
  ExpandLess,
  ExpandMore,
  Search,
  VisibilityOutlined,
  MenuBookRounded,
  QuizRounded,
  SettingsRounded,
  AddRounded,
} from "@mui/icons-material";

import RenderMath from "@/lib/renderMaths";

import {
  LEARNING_SKILL_GROUPS,
} from "@/utils/learningSkills";

// =============================================
// TYPES
// =============================================

type ChapterItem = {
  name: string;
  questionCount: number;
};

type QuestionContent = {
  type: "text" | "math" | "image" | "diagram" | "table" | "video";
  value?: string;
  url?: string;
  alt?: string;
};

type QuestionOption = {
  optionId: string;
  content: QuestionContent[];
};

type Question = {
  _id: string;
  questionId: string;
  version: number;
  course: string;
  subject: string;
  chapter: string;
  subtopic: string;
  type: string;
  skills?: string[];
  prompt: QuestionContent[];
  response: any;
  options: QuestionOption[];
  answerKey: any;
  evaluation: any;
  steps: any[];
  parts: any[];
  solution: {
    explanation: QuestionContent[];
    videoUrl?: string;
  };
  status: string;
};

type TestType = "weekly" | "monthly" | "quarterly" | "chapter";

type DistributionMode = "same" | "sets";

const PAGE_SIZE = 25;

const QUESTION_TYPES = [
  "mcq",
  "multi_select",
  "true_false",
  "one_word",
  "fill_blank",
  "name_following",
  "definition",
  "reasoning",
  "explanation",
  "differentiate",
  "matching",
  "ordering",
  "numerical",
  "stepwise",
  "derivation",
  "diagram",
  "diagram_label",
  "drawing",
  "graph",
  "table",
  "case_based",
  "assertion_reason",
  "application",
  "experiment",
  "activity",
  "oral",
  "multi_part",
  "other",
];

// =============================================
// LEARNING SKILLS
// =============================================

const LEARNING_SKILLS = LEARNING_SKILL_GROUPS.flatMap(
  (group) =>
    group.skills.map((skill) => ({
      ...skill,
      category: group.category,
    }))
);

const getSkillLabel = (skillId: string) => {
  return (
    LEARNING_SKILLS.find((skill) => skill.id === skillId)?.label ||
    formatLabel(skillId)
  );
};

// =============================================
// HELPERS
// =============================================

const purple = "#6D28D9";
const border = "#E9E7F0";

const getLocalDate = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatLabel = (value: string) =>
  (value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getPromptText = (question: Question) =>
  question.prompt
    ?.map((item) => item.value || "")
    .filter(Boolean)
    .join(" ") || "Question";

const getContentUrl = (item: QuestionContent) =>
  item.url || item.value || "";

const panelSx = {
  border: `1px solid ${border}`,
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  boxShadow: "0 2px 12px rgba(15,23,42,0.025)",
};

const sectionTitleSx = {
  fontWeight: 850,
  letterSpacing: "-0.35px",
  color: "#171329",
};

// =============================================
// QUESTION CONTENT
// =============================================

function QuestionContentView({
  content,
  onImageClick,
}: {
  content: QuestionContent[];
  onImageClick?: (src: string, alt: string) => void;
}) {
  return (
    <Stack spacing={1}>
      {content?.map((item, index) => {
        if (item.type === "image" || item.type === "diagram") {
          const url = getContentUrl(item);

          if (!url) return null;

          const alt = item.alt || "Question illustration";

          return (
            <Box
              key={index}
              onClick={() => onImageClick?.(url, alt)}
              role={onImageClick ? "button" : undefined}
              tabIndex={onImageClick ? 0 : undefined}
              onKeyDown={(event) => {
                if (
                  onImageClick &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  onImageClick(url, alt);
                }
              }}
              sx={{
                position: "relative",
                display: "inline-flex",
                alignSelf: "flex-start",
                maxWidth: "100%",
                cursor: onImageClick ? "zoom-in" : "default",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#FAFAFC",
                border: "1px solid #E9E7F0",
                "&:hover .image-zoom-hint": {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="img"
                src={url}
                alt={alt}
                loading="lazy"
                sx={{
                  display: "block",
                  maxWidth: "100%",
                  width: "auto",
                  maxHeight: 150,
                  objectFit: "contain",
                  borderRadius: 2,
                }}
              />

              {onImageClick && (
                <Chip
                  className="image-zoom-hint"
                  label="Click to zoom"
                  size="small"
                  sx={{
                    position: "absolute",
                    right: 8,
                    bottom: 8,
                    bgcolor: "rgba(23,19,41,0.78)",
                    color: "#fff",
                    fontSize: 11,
                    opacity: { xs: 1, sm: 0 },
                    transition: "opacity .2s",
                    pointerEvents: "none",
                  }}
                />
              )}
            </Box>
          );
        }

        if (item.type === "video") {
          const url = getContentUrl(item);

          return url ? (
            <Typography
              key={index}
              component="a"
              href={url}
              target="_blank"
              rel="noreferrer"
              color="primary"
            >
              View attached video
            </Typography>
          ) : null;
        }

        return (
          <Box key={index} sx={{ overflowX: "auto" }}>
            <RenderMath text={item.value || ""} />
          </Box>
        );
      })}
    </Stack>
  );
}

// =============================================
// QUESTION SKILLS
// =============================================

function QuestionSkills({
  skills,
}: {
  skills?: string[];
}) {
  if (!skills?.length) return null;

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={0.5}
      mt={1}
    >
      {skills.map((skill) => (
        <Chip
          key={skill}
          size="small"
          label={getSkillLabel(skill)}
          variant="outlined"
          sx={{
            fontSize: 11,
            height: 24,
            borderColor: "#DDD2FA",
            color: "#6D28D9",
            bgcolor: "#FAF8FF",
          }}
        />
      ))}
    </Stack>
  );
}

// =============================================
// MAIN PAGE
// =============================================

export default function AddTestPaper() {
  const router = useRouter();

  // =============================================
  // ACADEMIC SCOPE
  // =============================================

  const [courses, setCourses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<
    ChapterItem[]
  >([]);

  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  const [filtersLoading, setFiltersLoading] = useState(false);
  const [filterError, setFilterError] = useState("");

  // =============================================
  // QUESTIONS
  // =============================================

  const [questions, setQuestions] = useState<Question[]>([]);

  const [questionCache, setQuestionCache] = useState<
    Record<string, Question>
  >({});

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const [questionPage, setQuestionPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [questionSearch, setQuestionSearch] = useState("");
  const [questionTypeFilter, setQuestionTypeFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionError, setQuestionError] = useState("");

  const [previewQuestion, setPreviewQuestion] =
    useState<Question | null>(null);

  // =============================================
  // EXAM SETTINGS
  // =============================================

  const [teacherList, setTeacherList] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [testType, setTestType] = useState<TestType>("chapter");

  const [examDate, setExamDate] = useState(getLocalDate());
  const [durationMinutes, setDurationMinutes] = useState(60);

  const [defaultMarks, setDefaultMarks] = useState(4);

  const [distributionMode, setDistributionMode] =
    useState<DistributionMode>("same");

  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  const [settingsExpanded, setSettingsExpanded] = useState(true);

  // =============================================
  // SAVE
  // =============================================

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");



  const [zoomedImage, setZoomedImage] = useState<{
  src: string;
  alt: string;
} | null>(null);

  // =============================================
  // FILTER DATA
  // =============================================

  const fetchFilterData = useCallback(
    async (
      selectedCourse = "",
      selectedSubject = ""
    ) => {
      setFiltersLoading(true);
      setFilterError("");

      try {
        const params = new URLSearchParams({
          status: "published",
        });

        if (selectedCourse) {
          params.set("course", selectedCourse);
        }

        if (selectedSubject) {
          params.set("subject", selectedSubject);
        }

        const response = await fetch(
          `/api/QuestionBank-Filters?${params.toString()}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load academic filters."
          );
        }

        if (!selectedCourse && !selectedSubject) {
          setCourses(result.courses || []);
        }

        if (selectedCourse && !selectedSubject) {
          setSubjects(result.subjects || []);
        }

        if (selectedCourse && selectedSubject) {
          setAvailableChapters(result.chapters || []);
        }
      } catch (error) {
        setFilterError(
          error instanceof Error
            ? error.message
            : "Unable to load filters."
        );
      } finally {
        setFiltersLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  // =============================================
  // RESET SELECTION
  // =============================================

  const resetQuestionSelection = () => {
    setQuestions([]);
    setQuestionCache({});
    setSelectedQuestions([]);
    setQuestionPage(1);
  };

  const handleCourseChange = async (value: string) => {
    setCourse(value);
    setSubject("");
    setSelectedChapters([]);

    setSubjects([]);
    setAvailableChapters([]);

    resetQuestionSelection();

    if (value) {
      await fetchFilterData(value, "");
    }
  };

  const handleSubjectChange = async (value: string) => {
    setSubject(value);
    setSelectedChapters([]);
    setAvailableChapters([]);

    resetQuestionSelection();

    if (value) {
      await fetchFilterData(course, value);
    }
  };

  const handleChapterChange = (value: string[]) => {
    setSelectedChapters(value);
    resetQuestionSelection();
  };

  const selectedChapterDetails = useMemo(
    () =>
      availableChapters.filter((chapter) =>
        selectedChapters.includes(chapter.name)
      ),
    [availableChapters, selectedChapters]
  );

  const availableQuestionCount = useMemo(
    () =>
      selectedChapterDetails.reduce(
        (sum, chapter) => sum + chapter.questionCount,
        0
      ),
    [selectedChapterDetails]
  );

  // =============================================
  // FETCH QUESTIONS
  // =============================================

  const fetchQuestions = useCallback(
    async (pageNumber: number) => {
      if (!course || !subject || selectedChapters.length === 0) {
        setQuestions([]);
        return;
      }

      setQuestionsLoading(true);
      setQuestionError("");

      try {
        const params = new URLSearchParams({
          page: String(pageNumber),
          limit: String(PAGE_SIZE),
          course,
          subject,
          chapters: selectedChapters.join(","),
          status: "published",
        });

        if (questionSearch.trim()) {
          params.set("search", questionSearch.trim());
        }

        if (questionTypeFilter !== "all") {
          params.set("type", questionTypeFilter);
        }

        // New Learning Skills filter.
        if (skillFilter !== "all") {
          params.set("skill", skillFilter);
        }

        const response = await fetch(
          `/api/Fetch-Exam-Questions?${params.toString()}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              result.message ||
              "Unable to load questions."
          );
        }

        const fetched: Question[] = result.questions || [];

        setQuestions(fetched);

        setTotalQuestions(result.pagination?.total || 0);

        setTotalPages(
          Math.max(1, result.pagination?.totalPages || 1)
        );

        setQuestionCache((previous) => {
          const updated = { ...previous };

          fetched.forEach((question) => {
            updated[question._id] = question;
          });

          return updated;
        });
      } catch (error) {
        setQuestionError(
          error instanceof Error
            ? error.message
            : "Unable to load questions."
        );
      } finally {
        setQuestionsLoading(false);
      }
    },
    [
      course,
      subject,
      selectedChapters,
      questionSearch,
      questionTypeFilter,
      skillFilter,
    ]
  );

  useEffect(() => {
    if (!course || !subject || selectedChapters.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      fetchQuestions(questionPage);
    }, 250);

    return () => clearTimeout(timer);
  }, [
    fetchQuestions,
    questionPage,
    course,
    subject,
    selectedChapters,
  ]);

  // =============================================
  // QUESTION SELECTION
  // =============================================

  const isSelected = (id: string) =>
    selectedQuestions.includes(id);

  const toggleQuestion = (question: Question) => {
    setSelectedQuestions((previous) =>
      previous.includes(question._id)
        ? previous.filter((id) => id !== question._id)
        : [...previous, question._id]
    );
  };

  const togglePageSelection = (checked: boolean) => {
    const pageIds = questions.map((question) => question._id);

    setSelectedQuestions((previous) => {
      if (!checked) {
        return previous.filter((id) => !pageIds.includes(id));
      }

      return Array.from(new Set([...previous, ...pageIds]));
    });
  };

  const removeQuestion = (id: string) => {
    setSelectedQuestions((previous) =>
      previous.filter((item) => item !== id)
    );
  };

  const selectedQuestionObjects = useMemo(
    () =>
      selectedQuestions
        .map((id) => questionCache[id])
        .filter((question): question is Question => Boolean(question)),
    [selectedQuestions, questionCache]
  );

  const allPageSelected =
    questions.length > 0 &&
    questions.every((question) =>
      selectedQuestions.includes(question._id)
    );

  const selectedMarks = selectedQuestions.length * defaultMarks;

  // =============================================
  // AUTOMATIC SET DISTRIBUTION
  // =============================================

  const setSummary = useMemo(() => {
    const setA = selectedQuestions.filter(
      (_, index) => index % 2 === 0
    );

    const setB = selectedQuestions.filter(
      (_, index) => index % 2 !== 0
    );

    return {
      setACount: setA.length,
      setBCount: setB.length,
      setAMarks: setA.length * defaultMarks,
      setBMarks: setB.length * defaultMarks,
    };
  }, [selectedQuestions, defaultMarks]);

  // =============================================
  // TEACHERS
  // =============================================

  useEffect(() => {
    const controller = new AbortController();

    async function loadTeachers() {
      try {
        const response = await fetch("/api/Get-Teacher-List", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (response.ok && result.ok) {
          setTeacherList(result.list || []);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(error);
      }
    }

    loadTeachers();

    return () => controller.abort();
  }, []);

  // =============================================
  // SAVE EXAM
  // =============================================

  const handleSaveExam = async () => {
    if (saving) return;

    setSaveError("");

    if (!title.trim()) {
      setSaveError("Enter an examination title.");
      return;
    }

    if (!teacherName.trim()) {
      setSaveError("Select or enter the assigned teacher.");
      return;
    }

    if (!course || !subject || selectedChapters.length === 0) {
      setSaveError("Select a course, subject and chapter.");
      return;
    }

    if (selectedQuestions.length === 0) {
      setSaveError("Select at least one question.");
      return;
    }

    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      durationMinutes > 600
    ) {
      setSaveError("Enter a valid examination duration.");
      return;
    }

    if (
      !Number.isFinite(defaultMarks) ||
      defaultMarks < 0.5
    ) {
      setSaveError("Marks per question must be at least 0.5.");
      return;
    }

    if (!examDate || examDate < getLocalDate()) {
      setSaveError("You cannot schedule an examination in the past.");
      return;
    }

    if (
      distributionMode === "sets" &&
      selectedQuestions.length % 2 !== 0
    ) {
      setSaveError(
        "Select an even number of questions to create two equal sets."
      );
      return;
    }

    if (selectedQuestionObjects.length !== selectedQuestions.length) {
      setSaveError(
        "Some selected questions are missing from the question cache. Please refresh your selection."
      );
      return;
    }

    // India examination window: 09:00 AM – 09:00 PM.
    const startTime = new Date(
      `${examDate}T09:00:00+05:30`
    );

    const endTime = new Date(
      `${examDate}T21:00:00+05:30`
    );

    setSaving(true);

    try {
      const questionIds = selectedQuestions.map((id, index) => ({
        id,
        marks: defaultMarks,
        setId:
          distributionMode === "sets"
            ? index % 2 === 0
              ? "A"
              : "B"
            : "A",
      }));

      const payload = {
        title: title.trim(),
        testType,
        teacherName: teacherName.trim(),

        course,
        subject,
        chapters: selectedChapters,

        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),

        durationMinutes,

        distribution: {
          mode: distributionMode,
          shuffleQuestions,
          shuffleOptions,
        },

        questionIds,

        sets:
          distributionMode === "sets"
            ? [
                { setId: "A", name: "Set A" },
                { setId: "B", name: "Set B" },
              ]
            : [],
      };

      const response = await fetch("/api/Save-Exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to create examination."
        );
      }

      router.push("/dashboard/admin/manage-exam");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setSaving(false);
    }
  };

  // =============================================
  // QUESTION CARD
  // =============================================

  const renderQuestionCard = (question: Question) => {
    const selected = isSelected(question._id);

    return (
      <Card
        key={question._id}
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          borderColor: selected ? purple : border,
          bgcolor: selected ? "#FAF8FF" : "#FFFFFF",
          transition: "all .15s ease",
        }}
      >
        <CardContent
          sx={{
            p: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={1.5}
          >
            <Checkbox
              checked={selected}
              onChange={() => toggleQuestion(question)}
              sx={{ mt: -0.5 }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={0.75}
                >
                  <Chip
                    label={formatLabel(question.type)}
                    color="primary"
                    size="small"
                  />
                </Stack>

                <IconButton
                  size="small"
                  onClick={() => setPreviewQuestion(question)}
                >
                  <VisibilityOutlined fontSize="small" />
                </IconButton>
              </Stack>

              <Box mt={1.5}>
                <QuestionContentView
                  content={question.prompt || []}
                  onImageClick={(src, alt) =>
    setZoomedImage({ src, alt })
  }
                />
              </Box>

              <QuestionSkills skills={question.skills} />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={1.5}
                flexWrap="wrap"
                gap={1}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {question.chapter} · {question.subtopic || "General"}
                </Typography>

                {selected && (
                  <Chip
                    icon={<CheckCircleRounded />}
                    label="Added"
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // =============================================
  // PAGE
  // =============================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F7F7FB",
        px: { xs: 1.5, sm: 3, lg: 4 },
        py: { xs: 2, sm: 3 },
        pb: { xs: 13, sm: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>

        {/* HEADER */}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          gap={2}
        >
          <Box>
            <Button
              startIcon={<ArrowBack />}
              size="small"
              onClick={() => router.back()}
              sx={{ mb: 1, color: "text.secondary" }}
            >
              Back
            </Button>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  bgcolor: "#F0EAFE",
                  color: purple,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <AutoAwesomeRounded fontSize="large" />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 18 },
                    fontWeight: 700,
                    letterSpacing: "-1px",
                    color: "#171329",
                  }}
                >
                  Create Examination
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Select questions, set details and create your paper.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Chip
            icon={<QuizRounded />}
            color="primary"
            label={`${selectedQuestions.length} selected`}
            sx={{
              fontWeight: 800,
              display: { xs: "none", sm: "flex" },
            }}
          />
        </Stack>

        {/* =====================================
            1. ACADEMIC SCOPE
        ===================================== */}

        <Paper sx={{ ...panelSx, p: { xs: 2, sm: 3 }, mb: 2.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            mb={2.5}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "#F0EAFE",
                color: purple,
              }}
            >
              <MenuBookRounded />
            </Box>

            <Box>
              <Typography sx={sectionTitleSx}>
                1. Select syllabus
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Which course and chapters should this exam cover?
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={courses}
                value={course || null}
                loading={filtersLoading}
                onChange={(_, value) =>
                  handleCourseChange(value || "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Course"
                    placeholder="Select course"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={subjects}
                value={subject || null}
                disabled={!course}
                loading={filtersLoading}
                onChange={(_, value) =>
                  handleSubjectChange(value || "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subject"
                    placeholder="Select subject"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={availableChapters}
                value={selectedChapterDetails}
                disabled={!subject}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option.name === value.name
                }
                onChange={(_, values) =>
                  handleChapterChange(
                    values.map((item) => item.name)
                  )
                }
                renderOption={(props, option, { selected }) => {
                  const { key, ...rest } = props;

                  return (
                    <Box
                      component="li"
                      key={key}
                      {...rest}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Checkbox
                        checked={selected}
                        size="small"
                      />

                      <Box>
                        <Typography fontWeight={700}>
                          {option.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {option.questionCount} questions
                        </Typography>
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chapters"
                    placeholder="Select chapters"
                  />
                )}
              />
            </Grid>
          </Grid>

          {selectedChapters.length > 0 && (
            <Box mt={2}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap={1}
              >
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={0.75}
                >
                  {selectedChapters.map((chapter) => (
                    <Chip
                      key={chapter}
                      label={chapter}
                      size="small"
                      color="primary"
                      variant="outlined"
                      onDelete={() =>
                        handleChapterChange(
                          selectedChapters.filter(
                            (item) => item !== chapter
                          )
                        )
                      }
                    />
                  ))}
                </Stack>

                <Typography
                  variant="body2"
                  fontWeight={750}
                  color="primary.main"
                >
                  {availableQuestionCount} available questions
                </Typography>
              </Stack>
            </Box>
          )}

          {filterError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {filterError}
            </Alert>
          )}
        </Paper>

        {/* =====================================
            2. QUESTION SELECTION
        ===================================== */}

        <Paper
          sx={{
            ...panelSx,
            mb: 2.5,
            overflow: "hidden",
          }}
        >
          <Box p={{ xs: 2, sm: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2.5}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: "#F0EAFE",
                    color: purple,
                  }}
                >
                  <QuizRounded />
                </Box>

                <Box>
                  <Typography sx={sectionTitleSx}>
                    2. Select questions
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Add the questions you want in your examination.
                  </Typography>
                </Box>
              </Stack>

              <Chip
                color="primary"
                label={`${selectedQuestions.length} selected`}
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            {!course || !subject || selectedChapters.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  bgcolor: "#FAFAFC",
                  borderRadius: 3,
                  border: `1px dashed ${border}`,
                }}
              >
                <MenuBookRounded
                  sx={{
                    fontSize: 38,
                    color: "#A78BFA",
                    mb: 1,
                  }}
                />

                <Typography fontWeight={800}>
                  Select your syllabus first
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Your published questions will appear here.
                </Typography>
              </Box>
            ) : (
              <>
                {/* SEARCH AND FILTERS */}

                <Grid container spacing={1.5} mb={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      size="small"
                      value={questionSearch}
                      onChange={(event) => {
                        setQuestionSearch(event.target.value);
                        setQuestionPage(1);
                      }}
                      placeholder="Search questions..."
                      InputProps={{
                        startAdornment: (
                          <Search
                            sx={{
                              mr: 1,
                              color: "text.secondary",
                            }}
                          />
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Question type"
                      value={questionTypeFilter}
                      onChange={(event) => {
                        setQuestionTypeFilter(event.target.value);
                        setQuestionPage(1);
                      }}
                    >
                      <MenuItem value="all">All types</MenuItem>

                      {QUESTION_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {formatLabel(type)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3.5}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Learning skill"
                      value={skillFilter}
                      onChange={(event) => {
                        setSkillFilter(event.target.value);
                        setQuestionPage(1);
                      }}
                    >
                      <MenuItem value="all">All skills</MenuItem>

                      {LEARNING_SKILL_GROUPS.map((group) => [
                        <ListSubheader key={`header-${group.category}`}>
                          {group.category}
                        </ListSubheader>,

                        ...group.skills.map((skill) => (
                          <MenuItem
                            key={skill.id}
                            value={skill.id}
                          >
                            {skill.label}
                          </MenuItem>
                        )),
                      ])}
                    </TextField>
                  </Grid>
                </Grid>

                {/* PAGE SELECTION */}

                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    gap={1}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allPageSelected}
                          indeterminate={
                            selectedQuestions.some((id) =>
                              questions.some(
                                (question) => question._id === id
                              )
                            ) && !allPageSelected
                          }
                          onChange={(event) =>
                            togglePageSelection(
                              event.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography fontWeight={750}>
                          Select all questions on this page
                        </Typography>
                      }
                    />

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {totalQuestions} matching questions
                    </Typography>
                  </Stack>
                </Paper>

                {/* QUESTIONS */}

                {questionsLoading ? (
                  <Box py={7} textAlign="center">
                    <CircularProgress />

                    <Typography
                      color="text.secondary"
                      mt={1}
                    >
                      Loading questions...
                    </Typography>
                  </Box>
                ) : questionError ? (
                  <Alert severity="error">
                    {questionError}
                  </Alert>
                ) : questions.length === 0 ? (
                  <Box py={6} textAlign="center">
                    <Typography fontWeight={800}>
                      No questions found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Try changing your search or filters.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {questions.map(renderQuestionCard)}
                  </Stack>
                )}

                {/* PAGINATION */}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1.5}
                  mt={3}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Page {questionPage} of {totalPages}
                  </Typography>

                  <Pagination
                    count={totalPages}
                    page={questionPage}
                    onChange={(_, value) =>
                      setQuestionPage(value)
                    }
                    disabled={
                      questionsLoading || totalPages <= 1
                    }
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </>
            )}
          </Box>
        </Paper>

        {/* =====================================
            SELECTED QUESTIONS
        ===================================== */}

        {selectedQuestionObjects.length > 0 && (
          <Paper
            sx={{
              ...panelSx,
              mb: 2.5,
              overflow: "hidden",
            }}
          >
            <Box p={{ xs: 2, sm: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
              >
                <Box>
                  <Typography sx={sectionTitleSx}>
                    Your question paper
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {selectedQuestions.length} questions added
                  </Typography>
                </Box>

                <Chip
                  color="success"
                  icon={<CheckCircleRounded />}
                  label="Ready"
                />
              </Stack>
            </Box>

            <Divider />

            {selectedQuestionObjects.map((question, index) => (
              <Stack
                key={question._id}
                direction="row"
                alignItems="center"
                spacing={1.5}
                p={1.5}
                sx={{
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 25 }}
                >
                  {index + 1}
                </Typography>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={650}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    <RenderMath
                      text={getPromptText(question)}
                    />
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {question.chapter} · {formatLabel(question.type)}
                  </Typography>
                </Box>

                <IconButton
                  color="error"
                  size="small"
                  onClick={() => removeQuestion(question._id)}
                >
                  <DeleteOutline />
                </IconButton>
              </Stack>
            ))}
          </Paper>
        )}

        {/* =====================================
            3. EXAM DETAILS
        ===================================== */}

        <Paper
          id="exam-settings"
          sx={{
            ...panelSx,
            mb: 2.5,
            overflow: "hidden",
          }}
        >
          <Box
            onClick={() =>
              setSettingsExpanded((previous) => !previous)
            }
            sx={{
              p: { xs: 2, sm: 3 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "#F0EAFE",
                  color: purple,
                }}
              >
                <SettingsRounded />
              </Box>

              <Box>
                <Typography sx={sectionTitleSx}>
                  3. Examination details
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Set the date, duration, marks and paper type.
                </Typography>
              </Box>
            </Stack>

            <IconButton>
              {settingsExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Collapse in={settingsExpanded}>
            <Divider />

            <Box p={{ xs: 2, sm: 3 }}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Examination title"
                  placeholder="e.g. Science Chapter Assessment"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                />

                <Grid container gap={2.5}>
                  <Grid item xs={12} sm={5.85}>
                    <Autocomplete
                      freeSolo
                      options={teacherList}
                      value={teacherName}
                      onChange={(_, value) =>
                        setTeacherName(value || "")
                      }
                      onInputChange={(_, value) =>
                        setTeacherName(value)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned teacher"
                          placeholder="Select or enter teacher"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={5.85}>
                    <TextField
                      select
                      fullWidth
                      label="Examination type"
                      value={testType}
                      onChange={(event) =>
                        setTestType(
                          event.target.value as TestType
                        )
                      }
                    >
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="quarterly">Quarterly</MenuItem>
                      <MenuItem value="chapter">
                        Chapter test
                      </MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={5.85}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Examination date"
                      value={examDate}
                      onChange={(event) =>
                        setExamDate(event.target.value)
                      }
                      inputProps={{
                        min: getLocalDate(),
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={5.85}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Duration (minutes)"
                      value={durationMinutes}
                      onChange={(event) =>
                        setDurationMinutes(
                          Number(event.target.value)
                        )
                      }
                      inputProps={{
                        min: 1,
                        max: 600,
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider />

                {/* MARKS */}

                <Box>
                  <Typography fontWeight={850} mb={0.5}>
                    Marks per question
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={1.5}
                  >
                    One setting for the entire paper. No need to edit
                    individual questions.
                  </Typography>

                  <TextField
                    fullWidth
                    type="number"
                    value={defaultMarks}
                    onChange={(event) =>
                      setDefaultMarks(
                        Number(event.target.value)
                      )
                    }
                    inputProps={{
                      min: 0.5,
                      step: 0.5,
                    }}
                  />
                </Box>

                <Divider />

                {/* DISTRIBUTION */}

                <Box>
                  <Typography fontWeight={850} mb={0.5}>
                    Question paper type
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                  >
                    Choose how students receive the paper.
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        onClick={() =>
                          setDistributionMode("same")
                        }
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          cursor: "pointer",
                          border: `1.5px solid ${
                            distributionMode === "same"
                              ? purple
                              : border
                          }`,
                          bgcolor:
                            distributionMode === "same"
                              ? "#FAF8FF"
                              : "#FFFFFF",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: `2px solid ${
                                distributionMode === "same"
                                  ? purple
                                  : "#B9B5C5"
                              }`,
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {distributionMode === "same" && (
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: purple,
                                }}
                              />
                            )}
                          </Box>

                          <Typography fontWeight={850}>
                            Same paper
                          </Typography>
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1}
                        >
                          All students receive the same question paper.
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper
                        onClick={() =>
                          setDistributionMode("sets")
                        }
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          cursor: "pointer",
                          border: `1.5px solid ${
                            distributionMode === "sets"
                              ? purple
                              : border
                          }`,
                          bgcolor:
                            distributionMode === "sets"
                              ? "#FAF8FF"
                              : "#FFFFFF",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              border: `2px solid ${
                                distributionMode === "sets"
                                  ? purple
                                  : "#B9B5C5"
                              }`,
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            {distributionMode === "sets" && (
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  bgcolor: purple,
                                }}
                              />
                            )}
                          </Box>

                          <Typography fontWeight={850}>
                            Set A and Set B
                          </Typography>
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={1}
                        >
                          Questions are automatically divided into two
                          balanced sets.
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {distributionMode === "sets" && (
                    <Alert
                      severity={
                        selectedQuestions.length > 0 &&
                        selectedQuestions.length % 2 !== 0
                          ? "warning"
                          : "info"
                      }
                      sx={{ mt: 2 }}
                    >
                      {selectedQuestions.length % 2 !== 0
                        ? "Select one more question to make the two sets equal."
                        : `Set A: ${setSummary.setACount} questions · ${setSummary.setAMarks} marks. Set B: ${setSummary.setBCount} questions · ${setSummary.setBMarks} marks.`}
                    </Alert>
                  )}
                </Box>

                <Divider />

                {/* SHUFFLE */}

                <Box>
                  <Typography fontWeight={850} mb={1}>
                    Randomisation
                  </Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={shuffleQuestions}
                        onChange={(event) =>
                          setShuffleQuestions(
                            event.target.checked
                          )
                        }
                      />
                    }
                    label="Shuffle question order"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={shuffleOptions}
                        onChange={(event) =>
                          setShuffleOptions(
                            event.target.checked
                          )
                        }
                      />
                    }
                    label="Shuffle answer options"
                  />
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </Paper>

        {/* =====================================
            EXAM SUMMARY
        ===================================== */}

        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            background:
              "linear-gradient(120deg, #F2EDFF, #FAF8FF)",
            border: "1px solid #E2D7FF",
            mb: 2,
          }}
        >
          <Typography
            fontWeight={900}
            color="#25164D"
            fontSize={18}
          >
            Examination overview
          </Typography>

          <Grid container spacing={2} mt={0.5}>
            {[
              {
                value: selectedChapters.length,
                label: "Chapters",
              },
              {
                value:
                  distributionMode === "sets"
                    ? setSummary.setACount
                    : selectedQuestions.length,
                label: "Questions / paper",
              },
              {
                value:
                  distributionMode === "sets"
                    ? setSummary.setAMarks
                    : selectedMarks,
                label: "Total marks",
              },
              {
                value: durationMinutes,
                label: "Minutes",
              },
            ].map((item) => (
              <Grid item xs={6} sm={3} key={item.label}>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  color="#25164D"
                >
                  {item.value}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {item.label}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Divider
            sx={{
              my: 2,
              borderColor: "#DED3F8",
            }}
          />

          <Typography variant="body2" color="text.secondary">
            {course} · {subject} · {formatLabel(testType)}
          </Typography>

          <Stack
            direction="row"
            flexWrap="wrap"
            gap={0.75}
            mt={1}
          >
            {selectedChapters.map((chapter) => (
              <Chip
                key={chapter}
                size="small"
                label={chapter}
              />
            ))}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={2}
          >
            Examination window: 09:00 AM – 09:00 PM
          </Typography>
        </Paper>

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        {/* CREATE */}

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={1.5}
        >
          <Button
            variant="outlined"
            onClick={() => router.back()}
            fullWidth
            sx={{
              maxWidth: { sm: 180 },
              py: 1.3,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={
              saving ? (
                <CircularProgress
                  size={19}
                  color="inherit"
                />
              ) : (
                <AddRounded />
              )
            }
            disabled={
              saving ||
              selectedQuestions.length === 0 ||
              (distributionMode === "sets" &&
                selectedQuestions.length % 2 !== 0)
            }
            onClick={handleSaveExam}
            sx={{
              width: { xs: "100%", sm: "auto" },
              px: 5,
              py: 1.5,
              borderRadius: 2.5,
              fontWeight: 850,
              boxShadow: "0 5px 15px rgba(109,40,217,0.2)",
            }}
          >
            {saving ? "Creating..." : "Create examination"}
          </Button>
        </Stack>
      </Box>

      {/* =====================================
          QUESTION PREVIEW
      ===================================== */}

      <Dialog
        open={Boolean(previewQuestion)}
        onClose={() => setPreviewQuestion(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography fontWeight={900}>
                Question preview
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Review the complete question.
              </Typography>
            </Box>

            <IconButton
              onClick={() => setPreviewQuestion(null)}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {previewQuestion && (
            <Box>
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={0.75}
                mb={2}
              >
                <Chip
                  label={formatLabel(previewQuestion.type)}
                  color="primary"
                />

                <Chip
                  label={`Version ${previewQuestion.version}`}
                  variant="outlined"
                />
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {previewQuestion.course} · {previewQuestion.subject} ·{" "}
                {previewQuestion.chapter} · {previewQuestion.subtopic}
              </Typography>

              <QuestionSkills skills={previewQuestion.skills} />

              <Typography fontWeight={850} mt={3} mb={1.5}>
                Question
              </Typography>

              <QuestionContentView
                content={previewQuestion.prompt || []}
                onImageClick={(src, alt) =>
    setZoomedImage({ src, alt })
  }
              />

              {previewQuestion.options?.length > 0 && (
                <>
                  <Divider sx={{ my: 2.5 }} />

                  <Typography fontWeight={850} mb={1.5}>
                    Options
                  </Typography>

                  <Stack spacing={1}>
                    {previewQuestion.options.map(
                      (option, index) => (
                        <Paper
                          key={option.optionId || index}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={0.5}
                          >
                            Option {index + 1}
                          </Typography>

                          <QuestionContentView
                            content={option.content || []}
                            onImageClick={(src, alt) =>
    setZoomedImage({ src, alt })
  }
                          />
                        </Paper>
                      )
                    )}
                  </Stack>
                </>
              )}

              {previewQuestion.solution?.explanation?.length > 0 && (
                <>
                  <Divider sx={{ my: 2.5 }} />

                  <Typography fontWeight={850} mb={1.5}>
                    Solution explanation
                  </Typography>

                  <QuestionContentView
                    content={
                      previewQuestion.solution.explanation
                    }
                    onImageClick={(src, alt) =>
    setZoomedImage({ src, alt })
  }
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          {previewQuestion && (
            <Button
              variant="contained"
              onClick={() => {
                toggleQuestion(previewQuestion);
                setPreviewQuestion(null);
              }}
            >
              {isSelected(previewQuestion._id)
                ? "Remove from paper"
                : "Add to paper"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

<Dialog
  open={Boolean(zoomedImage)}
  onClose={() => setZoomedImage(null)}
  maxWidth={false}
  fullWidth
  PaperProps={{
    sx: {
      m: { xs: 1, sm: 3 },
      width: "100%",
      maxWidth: 1200,
      height: { xs: "90vh", sm: "92vh" },
      bgcolor: "#111827",
      borderRadius: 3,
      overflow: "hidden",
    },
  }}
>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      px: 2,
      py: 1,
      bgcolor: "#1F2937",
      color: "#fff",
    }}
  >
    <Typography fontWeight={700}>
      Image Preview
    </Typography>

    <IconButton
      onClick={() => setZoomedImage(null)}
      sx={{ color: "#fff" }}
    >
      <Close />
    </IconButton>
  </Box>

  <DialogContent
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 1,
      bgcolor: "#111827",
      overflow: "auto",
    }}
  >
    {zoomedImage && (
      <Box
        component="img"
        src={zoomedImage.src}
        alt={zoomedImage.alt}
        sx={{
          display: "block",
          maxWidth: "100%",
          maxHeight: "calc(90vh - 80px)",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          borderRadius: 1,
        }}
      />
    )}
  </DialogContent>
</Dialog>
      {/* =====================================
          MOBILE SELECTION BAR
      ===================================== */}

      {selectedQuestions.length > 0 && (
        <Paper
          elevation={12}
          sx={{
            display: {
              xs: "flex",
              sm: "none",
            },
            position: "fixed",
            bottom: 10,
            left: 10,
            right: 10,
            zIndex: 20,
            p: 1.5,
            borderRadius: 3,
            alignItems: "center",
            justifyContent: "space-between",
            border: `1px solid ${border}`,
          }}
        >
          <Box>
            <Typography fontWeight={900}>
              {selectedQuestions.length} selected
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {selectedMarks} marks
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => {
              setSettingsExpanded(true);

              document
                .getElementById("exam-settings")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
          >
            Review exam
          </Button>
        </Paper>
      )}
    </Box>
  );
}