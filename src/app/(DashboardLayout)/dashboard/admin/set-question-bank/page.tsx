"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SetQuestion, {
  createEmptyQuestion,
  QuestionData,
  ContentItem,
} from "./question";

import QuestionTypeSelector from "../../components/questionTypeSelector";
import PageContainer from "../../components/container/PageContainer";
import { getCurrentUser } from "@/lib/getCurrentUser";

const hasContent = (content: ContentItem[] = []) =>
  content.some(
    (item) =>
      (item.type === "text" && item.value.trim().length > 0) ||
      (item.type === "image" && item.url.trim().length > 0)
  );

const hasValidAnswer = (answer: QuestionData["answer"]) =>
  Boolean(
    hasContent(answer?.content || []) ||
    answer?.acceptedAnswers?.some(
      (accepted) => typeof accepted === "string" && accepted.trim().length > 0
    )
  );

// Return clear, teacher-friendly reasons instead of silently disabling Upload.
const getQuestionIssues = (question: QuestionData): string[] => {
  const issues: string[] = [];

  if (!hasContent(question.prompt)) {
    issues.push("Add the question text, an equation or an image.");
  }

  if (question.format === "mcq") {
    const validOptions = question.options.filter((option) => hasContent(option.content));

    if (validOptions.length < 2) {
      issues.push("Add at least two non-empty answer options.");
    }

    if (!validOptions.some((option) => option.id === question.correctOptionId)) {
      issues.push("Select which answer option is correct.");
    }
  } else if (question.format === "answer") {
    if (!hasValidAnswer(question.answer)) {
      issues.push("Add the expected written answer.");
    }
  } else if (question.format === "steps") {
    if (question.steps.length === 0) {
      issues.push("Add at least one solution step.");
    }

    question.steps.forEach((step, index) => {
      const stepNumber = index + 1;

      if (!hasContent(step.prompt)) {
        issues.push(`Step ${stepNumber}: add the step instruction.`);
      }

      if (step.answerType === "mcq") {
        const validOptions = step.options.filter((option) => hasContent(option.content));

        if (validOptions.length < 2) {
          issues.push(`Step ${stepNumber}: add at least two answer options.`);
        }

        if (!validOptions.some((option) => option.id === step.correctOptionId)) {
          issues.push(`Step ${stepNumber}: select the correct option.`);
        }
      } else if (!hasValidAnswer(step.answer)) {
        issues.push(`Step ${stepNumber}: add the expected answer.`);
      }
    });
  }

  return issues;
};

export default function SetQuestionBank() {
  const [userId, setUserId] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [subtopic, setSubtopic] = useState("");

  const [questions, setQuestions] = useState<QuestionData[]>([
    createEmptyQuestion(),
  ]);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const result = await getCurrentUser();
        if (active && result?.success && result?.user?._id) {
          setUserId(String(result.user._id));
        }
      } catch (err) {
        console.error("User loading error:", err);
        if (active) setError("Unable to load your account. Refresh and try again.");
      } finally {
        if (active) setUserLoading(false);
      }
    };

    void loadUser();
    return () => {
      active = false;
    };
  }, []);

  const updateQuestion = (index: number, data: QuestionData) => {
    setQuestions((previous) =>
      previous.map((question, i) => (i === index ? data : question))
    );
  };

  const addQuestion = () => {
    const nextIndex = questions.length;
    setQuestions((previous) => [...previous, createEmptyQuestion()]);

    window.setTimeout(() => {
      document
        .getElementById(`question-card-${nextIndex}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const duplicateQuestion = (index: number) => {
    setQuestions((previous) => {
      const copy = JSON.parse(JSON.stringify(previous[index])) as QuestionData;
      copy.teacherChecked = false;
      return [...previous.slice(0, index + 1), copy, ...previous.slice(index + 1)];
    });
  };

  const removeQuestion = (index: number) =>
    setQuestions((previous) =>
      previous.length === 1
        ? [createEmptyQuestion()]
        : previous.filter((_, i) => i !== index)
    );

  const handleCourseChange = (value: string) => {
    setCourse(value);
    setSubject("");
    setChapter("");
    setSubtopic("");
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setChapter("");
    setSubtopic("");
  };

  const handleChapterChange = (value: string) => {
    setChapter(value);
    setSubtopic("");
  };

  const academicReady = Boolean(
    course.trim() && subject.trim() && chapter.trim() && subtopic.trim()
  );

  const questionIssues = useMemo(
    () => questions.map((question) => getQuestionIssues(question)),
    [questions]
  );

  const completeCount = questionIssues.filter((issues) => issues.length === 0).length;

  const allComplete = questions.length > 0 && completeCount === questions.length;

  const saveBlockers = [
    ...(!userId && !userLoading ? ["Your account could not be identified. Refresh the page and try again."] : []),
    ...(!academicReady ? ["Complete the course, subject, chapter and subtopic details."] : []),
    ...questionIssues.flatMap((issues, index) =>
      issues.map((issue) => `Question ${index + 1}: ${issue}`)
    ),
  ];

  const canSave =
    !saving &&
    !userLoading &&
    Boolean(userId) &&
    academicReady &&
    allComplete;

  const saveQuestions = async () => {
    setError("");

    if (!userId) {
      setError("Your account information is unavailable. Please refresh the page.");
      return;
    }
    if (!academicReady) {
      setError("Complete the course, subject, chapter and subtopic details first.");
      return;
    }
    if (!allComplete) {
      setError("Complete the question prompt, answer and required options/steps before saving.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/Set_QuestionBank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          academic: { course, subject, chapter, subtopic },
          data: questions,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to save questions.");
      }

      alert(`${result.savedCount ?? questions.length} questions saved successfully.`);
      setQuestions([createEmptyQuestion()]);
      setSubtopic("");
    } catch (err) {
      console.error("Question saving error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) {
    return (
      <Box minHeight="50vh" display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="Question Bank">
      <Stack spacing={3} sx={{ maxWidth: 1100, mx: "auto", pb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} letterSpacing={-0.8}>
            Question builder
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Set the topic once, create questions, add equations or images, then save.
          </Typography>
        </Box>

        {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight={800}>1. Academic details</Typography>
              <Typography variant="body2" color="text.secondary">
                Every question in this upload will use these details.
              </Typography>
            </Box>

            <QuestionTypeSelector
              title="Course, subject and chapter"
              new={true}
              isSubmitted={false}
              onCourseChange={handleCourseChange}
              onSubjectChange={handleSubjectChange}
              onChapterChange={handleChapterChange}
            />

            <TextField
              fullWidth
              size="small"
              label="Subtopic"
              placeholder="e.g. Newton's Second Law"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              disabled={!chapter}
            />
          </Stack>
        </Paper>

        <Stack spacing={1.5}>
          <Box>
            <Typography fontWeight={800}>2. Build questions</Typography>
            <Typography variant="body2" color="text.secondary">
              {questions.length} question{questions.length === 1 ? "" : "s"} · {completeCount} complete
            </Typography>
          </Box>

          {questions.map((question, index) => (
            <Box key={index} id={`question-card-${index}`} sx={{ scrollMarginTop: 110 }}>
              <SetQuestion
                qNo={index}
                data={question}
                onChange={updateQuestion}
                onDuplicate={() => duplicateQuestion(index)}
                onRemove={() => removeQuestion(index)}
              />
            </Box>
          ))}

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<AddRoundedIcon />}
            onClick={addQuestion}
            disabled={saving}
            sx={{ py: 1.35, borderRadius: 2.5, borderStyle: "dashed", fontWeight: 800 }}
          >
            Add next question
          </Button>
        </Stack>

        {!canSave && !saving && saveBlockers.length > 0 && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography fontWeight={800} variant="body2" sx={{ mb: 0.5 }}>
              Why is upload disabled?
            </Typography>
            <Stack component="ul" spacing={0.35} sx={{ pl: 2.5, my: 0 }}>
              {saveBlockers.slice(0, 6).map((reason, index) => (
                <Typography component="li" variant="body2" key={`${index}-${reason}`}>
                  {reason}
                </Typography>
              ))}
            </Stack>
            {saveBlockers.length > 6 && (
              <Typography variant="caption" display="block" sx={{ mt: 0.75 }}>
                And {saveBlockers.length - 6} more item(s). Complete the questions above.
              </Typography>
            )}
          </Alert>
        )}

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            position: "sticky",
            bottom: 12,
            zIndex: 5,
            bgcolor: "background.paper",
            boxShadow: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box flex={1}>
              <Typography fontWeight={800}>
                Ready to upload? {completeCount}/{questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {canSave
                  ? "Everything is ready. You can upload now."
                  : saving
                    ? "Uploading your questions..."
                    : "Upload is disabled until the items below are fixed."}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={17} color="inherit" /> : <CloudUploadOutlinedIcon />}
              onClick={saveQuestions}
              disabled={!canSave}
              sx={{ minWidth: { sm: 210 }, py: 1.2, fontWeight: 800 }}
            >
              {saving ? "Uploading..." : "Save question bank"}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </PageContainer>
  );
}
