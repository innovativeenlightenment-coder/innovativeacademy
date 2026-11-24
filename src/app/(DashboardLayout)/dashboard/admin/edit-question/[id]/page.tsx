"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import SetQuestion, {
  createEmptyQuestion,
  QuestionData,
} from "../../set-question-bank/question";

import { getCurrentUser } from "@/lib/getCurrentUser";

import {
  isLearningSkillId,
  type LearningSkillId,
} from "@/utils/learningSkills";

/* =========================================================
   TYPES
========================================================= */

type AcademicData = {
  course: string;
  subject: string;
  chapter: string;
  subtopic: string;
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeSkills(value: unknown): LearningSkillId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const validSkills: LearningSkillId[] = [];

  for (const skill of value) {
    if (
      typeof skill === "string" &&
      isLearningSkillId(skill) &&
      !validSkills.includes(skill)
    ) {
      validSkills.push(skill);
    }
  }

  return validSkills;
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [question, setQuestion] = useState<QuestionData>(
    createEmptyQuestion()
  );

  const [academic, setAcademic] = useState<AcademicData>({
    course: "",
    subject: "",
    chapter: "",
    subtopic: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     FETCH QUESTION
  ========================================================= */

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/Get-Question/${id}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "Unable to load question."
        );
      }

      const fetchedQuestion = result.question;

      if (!fetchedQuestion) {
        throw new Error("Question data not found.");
      }

      /* -----------------------------------------
         ACADEMIC DETAILS
      ----------------------------------------- */

      setAcademic({
        course:
          fetchedQuestion.academic?.course ??
          fetchedQuestion.course ??
          "",

        subject:
          fetchedQuestion.academic?.subject ??
          fetchedQuestion.subject ??
          "",

        chapter:
          fetchedQuestion.academic?.chapter ??
          fetchedQuestion.chapter ??
          "",

        subtopic:
          fetchedQuestion.academic?.subtopic ??
          fetchedQuestion.subtopic ??
          "",
      });

      /* -----------------------------------------
         REMOVE DATABASE FIELDS
      ----------------------------------------- */

      const {
        _id,
        questionId,
        version,
        academic: questionAcademic,
        difficulty,
        status,
        uploadedBy,
        createdAt,
        updatedAt,
        category,
        ...questionData
      } = fetchedQuestion;

      /* -----------------------------------------
         NORMALIZE QUESTION-LEVEL SKILLS
      ----------------------------------------- */

      const normalizedSkills = normalizeSkills(
        questionData.skills
      );

      /* -----------------------------------------
         NORMALIZE STEP-LEVEL SKILLS
      ----------------------------------------- */

      const normalizedSteps = Array.isArray(
        questionData.steps
      )
        ? questionData.steps.map((step: any) => ({
            ...step,
            skills: normalizeSkills(step.skills),
          }))
        : [];

      /* -----------------------------------------
         FINAL QUESTION DATA
      ----------------------------------------- */

      const normalizedQuestion: QuestionData = {
        ...createEmptyQuestion(),
        ...questionData,

        skills: normalizedSkills,

        steps: normalizedSteps,
      };

      setQuestion(normalizedQuestion);
    } catch (err: any) {
      console.error("Fetch question error:", err);

      setError(
        err.message ||
          "Something went wrong while loading."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id, fetchQuestion]);

  /* =========================================================
     UPDATE QUESTION
  ========================================================= */

  const handleQuestionChange = (
    _qNo: number,
    updated: QuestionData
  ) => {
    setQuestion(updated);
    setSuccess("");
    setError("");
  };

  /* =========================================================
     SAVE QUESTION
  ========================================================= */

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await getCurrentUser();
      const userId = data.user?._id;

      if (!userId) {
        throw new Error(
          "Unable to identify the current user. Please log in again."
        );
      }

      // Normalize skills again before sending.
      const payload: QuestionData = {
        ...question,

        skills: normalizeSkills(question.skills),

        steps: (question.steps || []).map((step) => ({
          ...step,
          skills: normalizeSkills(step.skills),
        })),
      };

      const response = await fetch(
        `/api/Edit-Question/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,

            data: {
              ...payload,
              academic,
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "Failed to update question."
        );
      }

      setSuccess("Question updated successfully.");

      router.push(
        "/dashboard/admin/manage-questionBank"
      );
    } catch (err: any) {
      console.error("Save question error:", err);

      setError(
        err.message ||
          "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />

          <Typography color="text.secondary">
            Loading question...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (error && !question.prompt?.length) {
    return (
      <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>

        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>

          <Button
            variant="contained"
            onClick={fetchQuestion}
          >
            Retry
          </Button>
        </Stack>
      </Box>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <Box
      sx={{
        maxWidth: 1050,
        mx: "auto",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2, sm: 4 },
        pb: 12,
      }}
    >
      {/* HEADER */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        <Button
          onClick={() => router.back()}
          color="inherit"
          sx={{
            minWidth: 40,
            px: 1,
          }}
        >
          <ArrowBackRoundedIcon />
        </Button>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <EditRoundedIcon
              color="primary"
              fontSize="small"
            />

            <Typography
              variant="h5"
              fontWeight={800}
            >
              Edit Question
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Update the question and save your changes.
          </Typography>
        </Box>
      </Stack>

      {/* ACADEMIC DETAILS */}

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight={700}
        >
          QUESTION LOCATION
        </Typography>

        <Typography fontWeight={700} sx={{ mt: 0.5 }}>
          {academic.course}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {academic.subject} / {academic.chapter}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Subtopic: {academic.subtopic || "Not specified"}
        </Typography>
      </Paper>

      {/* STATUS MESSAGES */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* QUESTION EDITOR */}

      <SetQuestion
        qNo={1}
        data={question}
        onChange={handleQuestionChange}
      />

      {/* STICKY SAVE PANEL */}

      <Box
        sx={{
          maxWidth: 1050,
          mx: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          backgroundColor: "#fff",
          borderTop: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          mt: 2,
          py: 1.5,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} fontSize={14}>
            Save your changes
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Existing question will be updated.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={
            saving ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <SaveRoundedIcon />
            )
          }
          disabled={saving || loading}
          onClick={handleSave}
          sx={{
            borderRadius: 2,
            px: { xs: 2, sm: 4 },
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
}