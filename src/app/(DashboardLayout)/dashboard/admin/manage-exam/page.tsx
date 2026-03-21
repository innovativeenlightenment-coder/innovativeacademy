"use client";
export const dynamic = "force-dynamic";

import {
  Box,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Edit, Delete } from "@mui/icons-material";
import PageContainer from "../../components/container/PageContainer";
import QuestionTypeSelector from "../../components/questionTypeSelector";

/* ================= TYPES ================= */

type TeacherExamType = "monthly" | "quarterly";

type TeacherExam = {
  _id: string;
  testType: TeacherExamType;
  teacherName: string;
  course: string;
  startTime: string;
  endTime: string;
  secondsPerQuestion: number;
  totalQuestions: number;
  questionIds: string[];
  createdAt: string;
};

/* ================= HELPERS ================= */

const formatDuration = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins <= 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
};

const getDateISO = (startISO: string) =>
  new Date(startISO).toISOString().slice(0, 10);

const getWindowLabel = (startISO: string, endISO: string) => {
  const st = new Date(startISO);
  const et = new Date(endISO);
  return `${st.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${et.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

/* ================= COMPONENT ================= */

export default function ManageTeacherExams() {
  const [exams, setExams] = useState<TeacherExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ---- filtering (selector is ONLY for filtering) ---- */
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  const [filterType, setFilterType] = useState<"" | TeacherExamType>("");
  const [filterTeacher, setFilterTeacher] = useState("");

  /* ---- edit modal ---- */
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [editType, setEditType] = useState<TeacherExamType>("monthly");
  const [editCourse, setEditCourse] = useState("");
  const [editDate, setEditDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  /* ================= FETCH ================= */

  const fetchExams = async () => {
    setIsLoading(true);
    const res = await fetch("/api/Get-Exam", { cache: "no-store" });
    const json = await res.json();
    setExams(json.exams || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  /* ================= DERIVED ================= */

  const teachers = useMemo(
    () => Array.from(new Set(exams.map((e) => e.teacherName))),
    [exams]
  );

  const courses = useMemo(
    () => Array.from(new Set(exams.map((e) => e.course))),
    [exams]
  );

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (filterType && e.testType !== filterType) return false;
      if (filterTeacher && e.teacherName !== filterTeacher) return false;
      if (filterCourse && e.course !== filterCourse) return false;
      return true;
    });
  }, [exams, filterType, filterTeacher, filterCourse]);

  const editingExam = useMemo(
    () => exams.find((e) => e._id === editId),
    [exams, editId]
  );

  /* ================= ACTIONS ================= */

  const openEdit = (exam: TeacherExam) => {
    setEditId(exam._id);
    setEditTeacher(exam.teacherName);
    setEditType(exam.testType);
    setEditCourse(exam.course);
    setEditDate(getDateISO(exam.startTime));
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    const startTime = new Date(`${editDate}T09:00:00`).toISOString();
    const endTime = new Date(`${editDate}T21:00:00`).toISOString();

    const res = await fetch("/api/Edit-Exam", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editId,
        teacherName: editTeacher,
        testType: editType,
        course: editCourse,
        startTime,
        endTime,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      setExams((prev) =>
        prev.map((e) => (e._id === editId ? json.exam : e))
      );
      setEditOpen(false);
      alert("Exam updated");
    } else {
      alert("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    await fetch(`/api/Delete-Exam?id=${id}`, { method: "DELETE" });
    setExams((prev) => prev.filter((e) => e._id !== id));
  };

  /* ================= UI ================= */

  return (
    <PageContainer title="Manage Exams" description="Edit or delete exams">
      <Box mb={3}>
        <Typography variant="h4" mb={3}>
          Manage Exams
        </Typography>

        <QuestionTypeSelector
          onCourseChange={setFilterCourse}
          onSubjectChange={setFilterSubject}
          onChapterChange={setFilterChapter}
          onLevelChange={setFilterLevel}
          title={null}
          isSubmitted={false}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {["Teacher", "Type", "Course", "Date", "Window", "Questions", "Actions"].map(
                (h) => (
                  <TableCell key={h} sx={{ fontWeight: 600 }}>
                    {h}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExams.map((exam) => (
              <TableRow key={exam._id}>
                <TableCell>{exam.teacherName}</TableCell>
                <TableCell>{exam.testType}</TableCell>
                <TableCell>{exam.course}</TableCell>
                <TableCell>{new Date(exam.startTime).toLocaleDateString()}</TableCell>
                <TableCell>{getWindowLabel(exam.startTime, exam.endTime)}</TableCell>
                <TableCell>{exam.totalQuestions}</TableCell>
                <TableCell>
                  <IconButton onClick={() => openEdit(exam)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(exam._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredExams.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {isLoading ? "Loading..." : "No exams found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ================= EDIT MODAL ================= */}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Exam</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Teacher"
                select
                fullWidth
                value={editTeacher}
                onChange={(e) => setEditTeacher(e.target.value)}
              >
                {teachers.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Exam Type"
                select
                fullWidth
                value={editType}
                onChange={(e) => setEditType(e.target.value as TeacherExamType)}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Course"
                select
                fullWidth
                value={editCourse}
                onChange={(e) => setEditCourse(e.target.value)}
              >
                {courses.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField label="Window" value="09:00 AM - 09:00 PM" fullWidth disabled />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Estimated Time"
                fullWidth
                value={formatDuration(
                  (editingExam?.totalQuestions ?? 0) *
                    (editingExam?.secondsPerQuestion ?? 20)
                )}
                disabled
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
