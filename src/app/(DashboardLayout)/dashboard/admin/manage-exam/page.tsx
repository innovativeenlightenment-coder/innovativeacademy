"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  CalendarMonth,
  Delete,
  Edit,
  EventAvailable,
  Search,
  Quiz,
  Refresh,
  Close,
  School,
  AccessTime,
  Shuffle,
} from "@mui/icons-material";

import PageContainer from "../../components/container/PageContainer";

type TeacherExamType = "weekly" | "monthly" | "quarterly" | "chapter";

type TeacherExam = {
  _id: string;
  title: string;
  testType: TeacherExamType;
  teacherName: string;
  course: string;
  subject: string;
  chapters: string[];

  schedule: {
    startTime: string;
    endTime: string;
    durationMinutes: number;
  };

  questions: any[];

  distribution: {
    mode: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
  };

  status: string;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  updatedAt?: string;
};

const formatDateTime = (value?: string | Date) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value?: string) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getLocalDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDuration = (minutes: number) => {
  if (!minutes || minutes < 0) return "Not set";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours && remainingMinutes) {
    return `${hours} hr ${remainingMinutes} min`;
  }

  if (hours) return `${hours} hr`;

  return `${remainingMinutes} min`;
};

const typeColors: Record<
  TeacherExamType,
  "primary" | "success" | "warning" | "info"
> = {
  weekly: "primary",
  monthly: "success",
  quarterly: "warning",
  chapter: "info",
};

const statusColors: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  scheduled: "success",
  draft: "warning",
  completed: "default",
  cancelled: "error",
};

export default function ManageTeacherExams() {
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [editType, setEditType] =
    useState<TeacherExamType>("weekly");
  const [editCourse, setEditCourse] = useState("");
  const [editDate, setEditDate] = useState("");

  const fetchExams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/Get-Exam", {
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to fetch exams.");
      }

      setExams(json.exams || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const teachers = useMemo(
    () =>
      Array.from(
        new Set(exams.map((exam) => exam.teacherName).filter(Boolean))
      ),
    [exams]
  );

  const courses = useMemo(
    () =>
      Array.from(
        new Set(exams.map((exam) => exam.course).filter(Boolean))
      ),
    [exams]
  );

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        exam.title?.toLowerCase().includes(query) ||
        exam.teacherName?.toLowerCase().includes(query) ||
        exam.course?.toLowerCase().includes(query) ||
        exam.subject?.toLowerCase().includes(query) ||
        exam.testType?.toLowerCase().includes(query);

      const matchesType =
        !filterType || exam.testType === filterType;

      const matchesTeacher =
        !filterTeacher || exam.teacherName === filterTeacher;

      const matchesCourse =
        !filterCourse || exam.course === filterCourse;

      const matchesStatus =
        !filterStatus || exam.status === filterStatus;

      return (
        matchesSearch &&
        matchesType &&
        matchesTeacher &&
        matchesCourse &&
        matchesStatus
      );
    });
  }, [
    exams,
    search,
    filterType,
    filterTeacher,
    filterCourse,
    filterStatus,
  ]);

  const stats = useMemo(
    () => ({
      total: exams.length,
      weekly: exams.filter((e) => e.testType === "weekly").length,
      monthly: exams.filter((e) => e.testType === "monthly").length,
      quarterly: exams.filter((e) => e.testType === "quarterly").length,
    }),
    [exams]
  );

  const editingExam = useMemo(
    () => exams.find((e) => e._id === editId),
    [exams, editId]
  );

  const openEdit = (exam: TeacherExam) => {
    setEditId(exam._id);
    setEditTitle(exam.title || "");
    setEditTeacher(exam.teacherName || "");
    setEditType(exam.testType || "weekly");
    setEditCourse(exam.course || "");
    setEditDate(getLocalDate(exam.schedule?.startTime));

    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editDate || !editTeacher || !editCourse || !editTitle) {
      return;
    }

    try {
      setSaving(true);

      const existingSchedule = editingExam?.schedule;

      if (!existingSchedule?.startTime || !existingSchedule?.endTime) {
        throw new Error("Exam schedule information is missing.");
      }

      const oldStart = new Date(existingSchedule.startTime);
      const oldEnd = new Date(existingSchedule.endTime);

      const startTime = new Date(
        `${editDate}T${String(oldStart.getHours()).padStart(2, "0")}:${String(
          oldStart.getMinutes()
        ).padStart(2, "0")}:00`
      ).toISOString();

      const endTime = new Date(
        `${editDate}T${String(oldEnd.getHours()).padStart(2, "0")}:${String(
          oldEnd.getMinutes()
        ).padStart(2, "0")}:00`
      ).toISOString();

      const res = await fetch("/api/Edit-Exam", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editId,
          title: editTitle,
          teacherName: editTeacher,
          testType: editType,
          course: editCourse,
          schedule: {
            ...existingSchedule,
            startTime,
            endTime,
          },
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Update failed.");
      }

      await fetchExams();
      setEditOpen(false);
    } catch (err: any) {
      alert(err.message || "Unable to update exam.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) {
      return;
    }

    try {
      setDeletingId(id);

      const res = await fetch(`/api/Delete-Exam?id=${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Delete failed.");
      }

      setExams((prev) => prev.filter((exam) => exam._id !== id));
    } catch (err: any) {
      alert(err.message || "Unable to delete exam.");
    } finally {
      setDeletingId("");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterTeacher("");
    setFilterCourse("");
    setFilterStatus("");
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
  }: {
    title: string;
    value: number;
    icon: ReactNode;
    color: string;
    subtitle: string;
  }) => (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid #E8EAF0",
        borderRadius: 3,
        transition: "0.2s",
        "&:hover": {
          borderColor: color,
          transform: "translateY(-3px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={800} mt={1}>
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: `${color}15`,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <PageContainer
      title="Manage Exams"
      description="Manage and organize teacher examinations"
    >
      <Box sx={{ pb: 4 }}>
        {/* HEADER */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={4}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  bgcolor: "#6D28D9",
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Quiz />
              </Box>

              <Typography variant="h4" fontWeight={800}>
                Manage Exams
              </Typography>
            </Stack>

            <Typography color="text.secondary" mt={1}>
              View, organize and manage all scheduled examinations.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchExams}
            disabled={isLoading}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Refresh
          </Button>
        </Stack>

        {/* STATISTICS */}

        <Grid container spacing={2.5} mb={4}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Exams"
              value={stats.total}
              icon={<Quiz />}
              color="#6D28D9"
              subtitle="All examinations"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Weekly Exams"
              value={stats.weekly}
              icon={<CalendarMonth />}
              color="#2563EB"
              subtitle="Weekly assessments"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Monthly Exams"
              value={stats.monthly}
              icon={<EventAvailable />}
              color="#059669"
              subtitle="Monthly assessments"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Quarterly Exams"
              value={stats.quarterly}
              icon={<School />}
              color="#D97706"
              subtitle="Quarterly assessments"
            />
          </Grid>
        </Grid>

        {/* FILTERS */}

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            border: "1px solid #E8EAF0",
            borderRadius: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mb={2}
            spacing={1}
          >
            <Box>
              <Typography fontWeight={750} fontSize={17}>
                Examination Records
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {filteredExams.length} exam(s) found
              </Typography>
            </Box>

            <Button
              onClick={clearFilters}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Clear filters
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search exams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.25}>
              <TextField
                select
                fullWidth
                size="small"
                label="Exam Type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="chapter">Chapter wise</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.25}>
              <TextField
                select
                fullWidth
                size="small"
                label="Teacher"
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
              >
                <MenuItem value="">All Teachers</MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher} value={teacher}>
                    {teacher}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.25}>
              <TextField
                select
                fullWidth
                size="small"
                label="Course"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.25}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* ERROR */}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchExams}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* TABLE */}

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #E8EAF0",
            borderRadius: 3,
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 1150 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8F7FC" }}>
                {[
                  "Teacher",
                  "Examination",
                  "Course / Subject",
                  "Chapters",
                  "Date",
                  "Time Window",
                  "Duration",
                  "Questions",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      fontWeight: 750,
                      color: "#475569",
                      py: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={30} />
                    <Typography color="text.secondary" mt={2}>
                      Loading examinations...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <Quiz
                      sx={{
                        fontSize: 45,
                        color: "#6D28D9",
                        mb: 1,
                      }}
                    />

                    <Typography fontWeight={700}>
                      No examinations found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mt={0.5}
                    >
                      Try changing your search or filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map((exam) => (
                  <TableRow
                    key={exam._id}
                    hover
                    sx={{
                      "& td": {
                        py: 2,
                        borderBottom: "1px solid #F0F0F4",
                      },
                    }}
                  >
                    {/* TEACHER */}

                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "#EDE9FE",
                            color: "#6D28D9",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {exam.teacherName?.charAt(0)?.toUpperCase() || "T"}
                        </Avatar>

                        <Typography fontWeight={650}>
                          {exam.teacherName || "Unknown"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* EXAMINATION */}

                    <TableCell>
                      <Stack spacing={0.7}>
                        <Typography fontWeight={700}>
                          {exam.title || "Untitled Exam"}
                        </Typography>

                        <Chip
                          label={`${exam.testType
                            ?.charAt(0)
                            .toUpperCase()}${exam.testType?.slice(1) || ""} Exam`}
                          color={typeColors[exam.testType] || "default"}
                          size="small"
                          variant="outlined"
                          sx={{ width: "fit-content", fontWeight: 650 }}
                        />
                      </Stack>
                    </TableCell>

                    {/* COURSE / SUBJECT */}

                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={700}>
                          {exam.course}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {exam.subject || "No subject"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* CHAPTERS */}

                    <TableCell>
                      <Stack spacing={0.5}>
                        {(exam.chapters || []).slice(0, 2).map((chapter) => (
                          <Chip
                            key={chapter}
                            label={chapter}
                            size="small"
                            variant="outlined"
                          />
                        ))}

                        {(exam.chapters?.length || 0) > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{exam.chapters.length - 2} more
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* DATE */}

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(exam.schedule?.startTime)}
                      </Typography>
                    </TableCell>

                    {/* TIME WINDOW */}

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTime
                          sx={{ fontSize: 17, color: "text.secondary" }}
                        />

                        <Typography variant="body2">
                          {formatTime(exam.schedule?.startTime)}
                          {" – "}
                          {formatTime(exam.schedule?.endTime)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* DURATION */}

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDuration(
                          exam.schedule?.durationMinutes || 0
                        )}
                      </Typography>
                    </TableCell>

                    {/* QUESTIONS */}

                    <TableCell>
                      <Stack spacing={0.5}>
                        <Chip
                          label={`${exam.totalQuestions ?? exam.questions?.length ?? 0} Questions`}
                          size="small"
                          sx={{
                            bgcolor: "#F3F0FA",
                            color: "#6D28D9",
                            fontWeight: 700,
                          }}
                        />

                        <Typography variant="caption" color="text.secondary">
                          {exam.totalMarks ?? 0} Marks
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <Chip
                        label={exam.status || "Unknown"}
                        color={statusColors[exam.status] || "default"}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>

                    {/* ACTIONS */}

                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => openEdit(exam)}
                          sx={{
                            bgcolor: "#EFF6FF",
                            color: "#2563EB",
                            "&:hover": { bgcolor: "#DBEAFE" },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          disabled={deletingId === exam._id}
                          onClick={() => handleDelete(exam._id)}
                          sx={{
                            bgcolor: "#FEF2F2",
                            color: "#DC2626",
                            "&:hover": { bgcolor: "#FEE2E2" },
                          }}
                        >
                          {deletingId === exam._id ? (
                            <CircularProgress size={17} />
                          ) : (
                            <Delete fontSize="small" />
                          )}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* EDIT DIALOG */}

        <Dialog
          open={editOpen}
          onClose={() => !saving && setEditOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Edit Examination
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Update the examination details.
                </Typography>
              </Box>

              <IconButton
                onClick={() => setEditOpen(false)}
                disabled={saving}
              >
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                label="Exam Title"
                fullWidth
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <TextField
                label="Teacher"
                select
                fullWidth
                value={editTeacher}
                onChange={(e) => setEditTeacher(e.target.value)}
              >
                {teachers.map((teacher) => (
                  <MenuItem key={teacher} value={teacher}>
                    {teacher}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Exam Type"
                select
                fullWidth
                value={editType}
                onChange={(e) =>
                  setEditType(e.target.value as TeacherExamType)
                }
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="chapter">Chapter Wise</MenuItem>
              </TextField>

              <TextField
                label="Course"
                select
                fullWidth
                value={editCourse}
                onChange={(e) => setEditCourse(e.target.value)}
              >
                {courses.map((course) => (
                  <MenuItem key={course} value={course}>
                    {course}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Examination Date"
                type="date"
                fullWidth
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Start Time"
                    value={formatTime(editingExam?.schedule?.startTime)}
                    fullWidth
                    disabled
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="End Time"
                    value={formatTime(editingExam?.schedule?.endTime)}
                    fullWidth
                    disabled
                  />
                </Grid>
              </Grid>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#F8F7FC",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Questions
                  </Typography>

                  <Typography fontWeight={750}>
                    {editingExam?.totalQuestions ??
                      editingExam?.questions?.length ??
                      0}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Marks
                  </Typography>

                  <Typography fontWeight={750}>
                    {editingExam?.totalMarks ?? 0}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Exam Duration
                  </Typography>

                  <Typography fontWeight={750}>
                    {formatDuration(
                      editingExam?.schedule?.durationMinutes || 0
                    )}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setEditOpen(false)}
              disabled={saving}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={
                saving ||
                !editDate ||
                !editTeacher ||
                !editCourse ||
                !editTitle
              }
              sx={{
                bgcolor: "#6D28D9",
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                "&:hover": { bgcolor: "#5B21B6" },
              }}
            >
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}