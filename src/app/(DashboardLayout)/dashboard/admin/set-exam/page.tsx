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
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionTypeSelector from "../../components/questionTypeSelector";
import RenderMath from "@/lib/renderMaths";

interface QuestionType {
  _id: string;
  questionType: string;
  question: { imgUrl: string; text: string };
  answer: string;
  chapter: string;
  course: string;
  level: string;
  subject: string;
  secondsPerQuestion?: Record<string, number>;
}

const marksPerQuestion = 4;
const secondsPerQuestion: Record<"easy" | "moderate" | "difficult" | "extreme", number> = {
  easy: 20,
  moderate: 35,
  difficult: 60,
  extreme: 90,
};

const formatDuration = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins <= 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
};

const getAverageSecondsPerQuestion = (seconds: Record<string, number>) => {
  const values = Object.values(seconds);
  return values.reduce((sum, sec) => sum + sec, 0) / Math.max(values.length, 1);
};

export default function AddTestPaper() {
  const router = useRouter();

  // modal fields
  const [teacherName, setTeacherName] = useState("");
  const [testType, setTestType] = useState<"" | "monthly" | "quarterly">("");
  const [examCourse, setExamCourse] = useState(""); // ✅ course asked in modal
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [TeacherList, setTeacherList] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  // selector only for filtering
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterChapter, setFilterChapter] = useState("");

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionType[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [IsScheduling, setIsScheduling]=useState(false);

  const coursesFromQuestions = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.course) set.add(q.course);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const fetchQuestions = async () => {
    const res = await fetch(`/api/Fetch-QuestionBank`, { cache: "no-store" });
    const json = await res.json();
    if (json.questions) setQuestions(json.questions);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  useEffect(() => {
    const fetchTeacherList = async () => {
      const res = await fetch(`/api/Get-Teacher-List`, { cache: "no-store" });
      const json = await res.json();
      if (json.list) setTeacherList(json.list);
    };
    fetchTeacherList();
  }, []);

  const filterQuestions = (qs: QuestionType[], c: string, s: string, ch: string): QuestionType[] => {
    const filtered = qs.filter((q) => {
      const matchCourse = c ? q.course?.toLowerCase() === c.toLowerCase() : true;
      const matchSubject = s ? q.subject?.toLowerCase() === s.toLowerCase() : true;
      const matchChapter = ch ? q.chapter?.toLowerCase() === ch.toLowerCase() : true;
      return matchCourse && matchSubject && matchChapter;
    });
    setFilteredQuestions(filtered);
    return filtered;
  };

  useEffect(() => {
    filterQuestions(questions, filterCourse, filterSubject, filterChapter);
  }, [questions, filterCourse, filterSubject, filterChapter]);

  const handleScheduleExam = async () => {
    setIsScheduling(true)
    if (!date || !teacherName || !testType || !examCourse || selectedIds.length === 0) {
      alert("Please select exam type, exam course, date, teacher and questions");
      setIsScheduling(false);
      return;
    }

    // fixed 9am-9pm window
    const startTime = new Date(`${date}T09:00:00`).toISOString();
    const endTime = new Date(`${date}T21:00:00`).toISOString();

    const res = await fetch("/api/Save-Exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testType, // "monthly" | "quarterly"
        teacherName,
        course: examCourse, // ✅ store course from modal
        startTime,
        endTime,
        secondsPerQuestion,
        questionIds: selectedIds,
      }),
    });

    if (res.ok) {
      alert("Exam scheduled successfully");

      // reset UI
      setSelectedIds([]);
      setFilterChapter("");
      setFilterCourse("");
      setFilterSubject("");

      setDate(new Date().toISOString().slice(0, 10));
      setTeacherName("");
      setTestType("");
      setExamCourse("");

      setFilteredQuestions([]);
      setShowModal(false);
 setIsScheduling(false)
      router.push("/dashboard");
    } else {
      const err = await res.json().catch(() => null);
      alert(err?.error || "Failed to schedule exam");
    }
  };

  return (
    <Box p={4}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" mb={3}>
          Schedule Exams
        </Typography>

        {selectedIds.length > 0 && (
          <Grid item xs={12} md={4} textAlign="center">
            <Button variant="contained" color="primary" onClick={() => setShowModal(true)}>
              Schedule Exam ({selectedIds.length})
            </Button>
          </Grid>
        )}
      </Box>

      {/* ✅ Selector is ONLY for filtering */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <QuestionTypeSelector
            onCourseChange={setFilterCourse}
            onSubjectChange={setFilterSubject}
            onChapterChange={setFilterChapter}
            onLevelChange={() => {}}
            isSubmitted={true}
            title={null}
          />
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow style={{ background: "#efefef" }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        filteredQuestions.length > 0 &&
                        filteredQuestions.every((q) => selectedIds.includes(q._id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSelected = [...selectedIds];
                          filteredQuestions.forEach((q) => {
                            if (!newSelected.includes(q._id)) newSelected.push(q._id);
                          });
                          setSelectedIds(newSelected);
                        } else {
                          const newSelected = selectedIds.filter(
                            (id) => !filteredQuestions.find((q) => q._id === id)
                          );
                          setSelectedIds(newSelected);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Question</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Chapter</TableCell>
                  <TableCell>Correct Answer</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {/* Selected first */}
                {filteredQuestions
                  .filter((q) => selectedIds.includes(q._id))
                  .map((q) => (
                    <TableRow
                      key={q._id}
                      sx={{ backgroundColor: selectedIds.includes(q._id) ? "#e3f2fd" : undefined }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked onChange={() => toggleSelect(q._id)} />
                      </TableCell>

                      <TableCell>
                        {q.questionType === "image" ? (
                          <img src={q.question?.imgUrl || ""} style={{ maxWidth: 180 }} />
                        ) : (
                          <RenderMath text={q.question?.text || "-"} />
                        )}
                        {/* q.question?.text || "-" */}
                      </TableCell>

                      <TableCell>{q.level}</TableCell>
                      <TableCell>{q.course}</TableCell>
                      <TableCell>{q.subject}</TableCell>
                      <TableCell>{q.chapter}</TableCell>
                      <TableCell>{q.answer}</TableCell>
                    </TableRow>
                  ))}

                {/* Not selected */}
                {filteredQuestions
                  .filter((q) => !selectedIds.includes(q._id))
                  .map((q) => (
                    <TableRow key={q._id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(q._id)}
                          onChange={() => toggleSelect(q._id)}
                        />
                      </TableCell>

                      <TableCell>
                        {q.questionType === "image" ? (
                          <img src={q.question?.imgUrl || ""} style={{ maxWidth: 180 }} />
                        ) : (
                          q.question?.text || "-"
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
        </Grid>
      </Grid>

      {/* Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Confirm Exam Schedule</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Teacher */}
            <Grid item xs={12}>
              <TextField
                label="Teacher Name"
                select
                fullWidth
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
              >
                {TeacherList.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Exam Type */}
            <Grid item xs={12}>
              <TextField
                label="Exam Type"
                select
                fullWidth
                value={testType}
                onChange={(e) => setTestType(e.target.value as any)}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
              </TextField>
            </Grid>

            {/* ✅ Course asked in modal (stored) */}
            <Grid item xs={12}>
              <TextField
                label="Course (for exam)"
                select
                fullWidth
                value={examCourse}
                onChange={(e) => setExamCourse(e.target.value)}
              >
                {coursesFromQuestions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Date */}
            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                value={typeof date === "string" ? date : new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>

            {/* Fixed Window */}
            <Grid item xs={6}>
              <TextField
                label="Exam Window"
                value="09:00 AM - 09:00 PM"
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

            {/* Total Questions */}
            <Grid item xs={6}>
              <TextField
                label="Total Questions"
                value={selectedIds.length}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

            {/* Time per Q */}
            <Grid item xs={6}>
              <TextField
                label="Average Time per Question"
                value={`${Math.round(getAverageSecondsPerQuestion(secondsPerQuestion))} sec`}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

            {/* Estimated total time */}
            <Grid item xs={6}>
              <TextField
                label="Estimated Total Time"
                value={formatDuration(
                  Math.round(selectedIds.length * getAverageSecondsPerQuestion(secondsPerQuestion))
                )}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

            {/* Total Marks */}
            <Grid item xs={6}>
              <TextField
                label="Total Marks"
                value={selectedIds.length * marksPerQuestion}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="secondary">
            Cancel
          </Button>

          <Button onClick={handleScheduleExam} disabled={IsScheduling} color="primary" variant="contained">
            Schedule Exam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
