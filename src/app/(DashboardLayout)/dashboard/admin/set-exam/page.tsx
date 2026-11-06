
"use client";

import {
  Box,
  Button,
  Checkbox,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  DialogTitle,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  Pagination,
  CircularProgress,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionTypeSelector from "../../components/questionTypeSelector";
import RenderMath from "@/lib/renderMaths";

interface QuestionType {
  _id: string;
  questionType: string;
  question: {
    imgUrl: string;
    text: string;
  };
  answer: string;
  chapter: string;
  course: string;
  level: string;
  subject: string;
}

type TestType = "" | "weekly" | "monthly" | "quarterly";

const PAGE_SIZE = 25;
const MARKS_PER_QUESTION = 4;

const secondsPerQuestion = {
  easy: 20,
  moderate: 35,
  difficult: 60,
  extreme: 90,
};

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDuration = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  if (mins <= 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;

  return `${mins} min ${secs} sec`;
};

const getAverageSecondsPerQuestion = () => {
  const values = Object.values(secondsPerQuestion);

  return (
    values.reduce((sum, sec) => sum + sec, 0) /
    values.length
  );
};

export default function AddTestPaper() {
  const router = useRouter();

  // =====================================
  // EXAM MODAL STATES
  // =====================================

  const [teacherName, setTeacherName] = useState("");
  const [testType, setTestType] = useState<TestType>("");
  const [examCourse, setExamCourse] = useState("");
  const [date, setDate] = useState(getLocalDate());

  const [TeacherList, setTeacherList] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [IsScheduling, setIsScheduling] = useState(false);

  // =====================================
  // QUESTION FILTER STATES
  // =====================================

  const [filterCourse, setFilterCourse] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");

  // =====================================
  // PAGINATION STATES
  // =====================================

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState("");

  // =====================================
  // QUESTION STATES
  // =====================================

  // Only contains questions from current page
  const [questions, setQuestions] = useState<QuestionType[]>([]);

  // All selected IDs are preserved across pages
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Courses are returned independently by API
  const [allCourses, setAllCourses] = useState<string[]>([]);

  // =====================================
  // FETCH QUESTIONS (PAGINATED)
  // =====================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      setQuestionError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
        });

        if (filterCourse) {
          params.set("course", filterCourse);
        }

        if (filterSubject) {
          params.set("subject", filterSubject);
        }

        if (filterChapter) {
          params.set("chapter", filterChapter);
        }

        const res = await fetch(
          `/api/Fetch-QuestionBank?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(
            json.error || "Failed to fetch questions"
          );
        }

        setQuestions(json.questions || []);

        setTotalQuestions(
          json.pagination?.total || 0
        );

        setTotalPages(
          json.pagination?.totalPages || 0
        );

        setAllCourses(json.courses || []);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Fetch questions error:", error);

        setQuestionError(
          error instanceof Error
            ? error.message
            : "Failed to load questions"
        );

        setQuestions([]);
        setTotalQuestions(0);
        setTotalPages(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      controller.abort();
    };
  }, [page, filterCourse, filterSubject, filterChapter]);

  // =====================================
  // FETCH TEACHER LIST
  // =====================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchTeacherList = async () => {
      try {
        const res = await fetch(
          "/api/Get-Teacher-List",
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const json = await res.json();

        if (res.ok && json.list) {
          setTeacherList(json.list);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Teacher list error:", error);
      }
    };

    fetchTeacherList();

    return () => controller.abort();
  }, []);

  // =====================================
  // QUESTION SELECTION
  // =====================================

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  // Select/deselect all questions on CURRENT PAGE
  const handleSelectAll = (
    checked: boolean
  ) => {
    const currentPageIds = questions.map((q) => q._id);

    if (checked) {
      setSelectedIds((prev) => {
        const updated = new Set(prev);

        currentPageIds.forEach((id) => {
          updated.add(id);
        });

        return Array.from(updated);
      });
    } else {
      setSelectedIds((prev) =>
        prev.filter(
          (id) => !currentPageIds.includes(id)
        )
      );
    }
  };

  const allCurrentPageSelected =
    questions.length > 0 &&
    questions.every((q) =>
      selectedIds.includes(q._id)
    );

  const someCurrentPageSelected =
    questions.some((q) =>
      selectedIds.includes(q._id)
    );

  // =====================================
  // FILTER HANDLERS
  // =====================================

  const handleCourseFilter = (value: string) => {
    setFilterCourse(value);
    setPage(1);
  };

  const handleSubjectFilter = (value: string) => {
    setFilterSubject(value);
    setPage(1);
  };

  const handleChapterFilter = (value: string) => {
    setFilterChapter(value);
    setPage(1);
  };

  // =====================================
  // SCHEDULE EXAM
  // =====================================

  const handleScheduleExam = async () => {
    if (
      !date ||
      !teacherName ||
      !testType ||
      !examCourse ||
      selectedIds.length === 0
    ) {
      alert(
        "Please select exam type, course, date, teacher and questions"
      );
      return;
    }

    if (IsScheduling) return;

    // Validate date
    const startDate = new Date(
      `${date}T09:00:00`
    );

    const endDate = new Date(
      `${date}T21:00:00`
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      alert("Invalid exam date");
      return;
    }

    setIsScheduling(true);

    try {
      const res = await fetch("/api/Save-Exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testType,
          teacherName,
          course: examCourse,

          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),

          secondsPerQuestion,

          // Includes selections from ALL pages
          questionIds: selectedIds,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.error || "Failed to schedule exam"
        );
      }

      alert("Exam scheduled successfully!");

      // Reset exam states
      setSelectedIds([]);

      setFilterCourse("");
      setFilterSubject("");
      setFilterChapter("");

      setPage(1);

      setDate(getLocalDate());
      setTeacherName("");
      setTestType("");
      setExamCourse("");

      setShowModal(false);

      router.push("/dashboard");
    } catch (error) {
      console.error("Exam scheduling error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while scheduling exam"
      );
    } finally {
      setIsScheduling(false);
    }
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <Box p={4}>

      {/* =====================================
          HEADER
      ===================================== */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5">
          Schedule Exams
        </Typography>

        {selectedIds.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowModal(true)}
          >
            Schedule Exam ({selectedIds.length})
          </Button>
        )}
      </Box>

      {/* =====================================
          FILTERS
      ===================================== */}

      <Grid container spacing={2}>

        <Grid item xs={12}>
          <QuestionTypeSelector
            onCourseChange={handleCourseFilter}
            onSubjectChange={handleSubjectFilter}
            onChapterChange={handleChapterFilter}
            onLevelChange={() => {}}
            isSubmitted={true}
            title={null}
          />
        </Grid>

        {/* =====================================
            QUESTION TABLE
        ===================================== */}

        <Grid item xs={12}>

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              maxHeight: 500,
              overflow: "auto",
            }}
          >
            <Table stickyHeader>

              <TableHead>
                <TableRow
                  sx={{
                    background: "#efefef",
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allCurrentPageSelected}
                      indeterminate={
                        someCurrentPageSelected &&
                        !allCurrentPageSelected
                      }
                      onChange={(e) =>
                        handleSelectAll(
                          e.target.checked
                        )
                      }
                    />
                  </TableCell>

                  <TableCell sx={{ minWidth: 300 }}>
                    Question
                  </TableCell>

                  <TableCell sx={{ minWidth: 120 }}>
                    Level
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    Course
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    Subject
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    Chapter
                  </TableCell>

                  <TableCell sx={{ minWidth: 150 }}>
                    Correct Answer
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>

                {/* LOADING */}

                {isLoadingQuestions && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 5 }}
                    >
                      <CircularProgress size={28} />

                      <Typography
                        color="text.secondary"
                        mt={1}
                      >
                        Loading questions...
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* ERROR */}

                {!isLoadingQuestions &&
                  questionError && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 4 }}
                      >
                        <Typography color="error">
                          {questionError}
                        </Typography>

                        <Button
                          sx={{ mt: 1 }}
                          onClick={() =>
                            setPage((prev) => prev)
                          }
                        >
                          Reload
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}

                {/* EMPTY */}

                {!isLoadingQuestions &&
                  !questionError &&
                  questions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 5 }}
                      >
                        <Typography color="text.secondary">
                          No questions found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                {/* SELECTED QUESTIONS FIRST */}

                {!isLoadingQuestions &&
                  questions
                    .filter((q) =>
                      selectedIds.includes(q._id)
                    )
                    .map((q) => (
                      <TableRow
                        key={q._id}
                        sx={{
                          backgroundColor: "#e3f2fd",
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={true}
                            onChange={() =>
                              toggleSelect(q._id)
                            }
                          />
                        </TableCell>

                        <TableCell>
                          {q.questionType === "image" ? (
                            <img
                              src={q.question?.imgUrl}
                              alt="Question"
                              style={{
                                maxWidth: 180,
                                maxHeight: 140,
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <p
                              style={{
                                wordBreak: "break-word",
                                margin: 0,
                              }}
                            >
                              <RenderMath
                                text={
                                  q.question?.text || "-"
                                }
                              />
                            </p>
                          )}
                        </TableCell>

                        <TableCell>{q.level}</TableCell>
                        <TableCell>{q.course}</TableCell>
                        <TableCell>{q.subject}</TableCell>
                        <TableCell>{q.chapter}</TableCell>
                        <TableCell>{q.answer}</TableCell>
                      </TableRow>
                    ))}

                {/* NOT SELECTED QUESTIONS */}

                {!isLoadingQuestions &&
                  questions
                    .filter(
                      (q) =>
                        !selectedIds.includes(q._id)
                    )
                    .map((q) => (
                      <TableRow key={q._id}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={false}
                            onChange={() =>
                              toggleSelect(q._id)
                            }
                          />
                        </TableCell>

                        <TableCell>
                          {q.questionType === "image" ? (
                            <img
                              src={q.question?.imgUrl}
                              alt="Question"
                              style={{
                                maxWidth: 180,
                                maxHeight: 140,
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <p
                              style={{
                                wordBreak: "break-word",
                                margin: 0,
                              }}
                            >
                              <RenderMath
                                text={
                                  q.question?.text || "-"
                                }
                              />
                            </p>
                          )}
                        </TableCell>

                        <TableCell>{q.level}</TableCell>
                        <TableCell>{q.course}</TableCell>
                        <TableCell>{q.subject}</TableCell>
                        <TableCell>{q.chapter}</TableCell>
                        <TableCell>{q.answer}</TableCell>
                      </TableRow>
                    ))}

              </TableBody>
            </Table>
          </TableContainer>

          {/* =====================================
              PAGINATION FOOTER
          ===================================== */}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            py={2}
          >

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Showing{" "}
                {totalQuestions === 0
                  ? 0
                  : (page - 1) * PAGE_SIZE + 1}
                {" - "}
                {Math.min(
                  page * PAGE_SIZE,
                  totalQuestions
                )}
                {" of "}
                {totalQuestions} questions
              </Typography>

              <Typography
                variant="body2"
                fontWeight={600}
                color="primary"
              >
                {selectedIds.length} questions selected
                across all pages
              </Typography>
            </Box>

            <Pagination
              count={Math.max(totalPages, 1)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              disabled={
                isLoadingQuestions ||
                totalPages <= 1
              }
              showFirstButton
              showLastButton
            />

          </Box>
        </Grid>
      </Grid>

      {/* =====================================
          EXAM SCHEDULE MODAL
      ===================================== */}

      <Dialog
        open={showModal}
        onClose={() => {
          if (!IsScheduling) {
            setShowModal(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          Confirm Exam Schedule
        </DialogTitle>

        <DialogContent dividers>

          <Grid container spacing={2}>

            {/* TEACHER */}

            <Grid item xs={12}>
              <TextField
                label="Teacher Name"
                select
                fullWidth
                value={teacherName}
                onChange={(e) =>
                  setTeacherName(e.target.value)
                }
              >
                {TeacherList.map((item) => (
                  <MenuItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* EXAM TYPE */}

            <Grid item xs={12}>
              <TextField
                label="Exam Type"
                select
                fullWidth
                value={testType}
                onChange={(e) =>
                  setTestType(
                    e.target.value as TestType
                  )
                }
              >
                <MenuItem value="weekly">
                  Weekly
                </MenuItem>

                <MenuItem value="monthly">
                  Monthly
                </MenuItem>

                <MenuItem value="quarterly">
                  Quarterly
                </MenuItem>
              </TextField>
            </Grid>

            {/* EXAM COURSE */}

            <Grid item xs={12}>
              <TextField
                label="Course (for exam)"
                select
                fullWidth
                value={examCourse}
                onChange={(e) =>
                  setExamCourse(e.target.value)
                }
              >
                {allCourses.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* DATE */}

            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Grid>

            {/* EXAM WINDOW */}

            <Grid item xs={6}>
              <TextField
                label="Exam Window"
                value="09:00 AM - 09:00 PM"
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
            </Grid>

            {/* TOTAL QUESTIONS */}

            <Grid item xs={6}>
              <TextField
                label="Total Questions"
                value={selectedIds.length}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
            </Grid>

            {/* AVERAGE TIME */}

            <Grid item xs={6}>
              <TextField
                label="Average Time per Question"
                value={`${Math.round(
                  getAverageSecondsPerQuestion()
                )} sec`}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
            </Grid>

            {/* ESTIMATED TIME */}

            <Grid item xs={6}>
              <TextField
                label="Estimated Total Time"
                value={formatDuration(
                  Math.round(
                    selectedIds.length *
                      getAverageSecondsPerQuestion()
                  )
                )}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
            </Grid>

            {/* TOTAL MARKS */}

            <Grid item xs={6}>
              <TextField
                label="Total Marks"
                value={
                  selectedIds.length *
                  MARKS_PER_QUESTION
                }
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions>

          <Button
            onClick={() => setShowModal(false)}
            color="secondary"
            disabled={IsScheduling}
          >
            Cancel
          </Button>

          <Button
            onClick={handleScheduleExam}
            disabled={IsScheduling}
            color="primary"
            variant="contained"
          >
            {IsScheduling
              ? "Scheduling..."
              : "Schedule Exam"}
          </Button>

        </DialogActions>
      </Dialog>
    </Box>
  );
}
