"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode, ChangeEvent } from "react";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Add,
  CheckCircleOutline,
  CloseRounded,
  Delete,
  Edit,
  ExpandMore,
  FileDownload,
  FileUpload,
  MoreVert,
  Refresh,
  Search,
  SelectAll,
  Tune,
  ZoomIn,
} from "@mui/icons-material";

import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

import PageContainer from "../../components/container/PageContainer";
import Loading from "../../loading";
import QuestionTypeSelector from "../../components/questionTypeSelector";

import { getCurrentUser } from "@/lib/getCurrentUser";
import RenderMath from "@/lib/renderMaths";
import {
  getLearningSkillLabel,
  isLearningSkillId,
  type LearningSkillId,
} from "@/utils/learningSkills";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

type ContentItem = {
  type?: string;
  value?: string;
  url?: string;
  alt?: string;
};

type QuestionOption = {
  optionId?: string;
  content?: ContentItem[];
};

type QuestionResponse = {
  mode?: string;
  inputMode?: string;
  config?: Record<string, any>;
};

type QuestionStep = {
  stepId?: string;
  order?: number;
  title?: string;
  instruction?: ContentItem[];
  response?: QuestionResponse;
  options?: QuestionOption[];
  answerKey?: any;
  explanation?: ContentItem[];
  skills?: LearningSkillId[];
};

type QuestionPart = {
  partId?: string;
  order?: number;
  prompt?: ContentItem[];
  response?: QuestionResponse;
  options?: QuestionOption[];
  answerKey?: any;
  evaluation?: {
    mode?: string;
    method?: string;
    rules?: Record<string, any>;
  };
  steps?: QuestionStep[];
  explanation?: ContentItem[];
  skills?: LearningSkillId[];
};

interface QuestionData {
  _id: string;
  questionId?: string;
  version?: number;

  course?: string;
  subject?: string;
  chapter?: string;
  subtopic?: string;

  type?: string;
  skills?: LearningSkillId[];

  prompt?: ContentItem[];
  response?: QuestionResponse;

  options?: QuestionOption[];
  answerKey?: any;

  evaluation?: {
    mode?: string;
    method?: string;
    rules?: Record<string, any>;
  };

  steps?: QuestionStep[];
  parts?: QuestionPart[];

  solution?: {
    explanation?: ContentItem[];
    videoUrl?: string;
  };

  learning?: {
    conceptIds?: string[];
  };

  selection?: {
    purpose?: string[];
    variantGroupId?: string;
  };

  verification?: {
    status?: string;
    remarks?: string;
    checkedBy?: string;
    checkedAt?: string;
  };

  status?: string;
  uploadedBy?: string;
  source?: string;
  createdAt?: string;

  question?: {
    text?: string | null;
    imgUrl?: string | null;
  };

  answer?: string;

  hint?: {
    text?: string | null;
    imgUrl?: string | null;
  };
}

type Filters = {
  search: string;
  course: string;
  subject: string;
  chapter: string;
  fromDate: string;
  toDate: string;
};

const initialFilters: Filters = {
  search: "",
  course: "",
  subject: "",
  chapter: "",
  fromDate: "",
  toDate: "",
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

const reviewStatuses = [
  { value: "", label: "All questions" },
  { value: "pending", label: "Pending review" },
  { value: "verified", label: "Verified" },
  { value: "needs_correction", label: "Needs correction" },
];

function getReviewStatus(status?: string) {
  switch (status) {
    case "verified":
      return {
        label: "Verified",
        color: "success" as const,
        icon: <CheckCircleOutline fontSize="small" />,
      };

    case "needs_correction":
      return {
        label: "Needs correction",
        color: "error" as const,
        icon: undefined,
      };

    default:
      return {
        label: "Pending review",
        color: "warning" as const,
        icon: undefined,
      };
  }
}

function formatLabel(value?: string) {
  if (!value) return "";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function hasContent(items?: ContentItem[]) {
  if (!Array.isArray(items)) return false;

  return items.some((item) => {
    if (!item) return false;

    return Boolean(item.value?.trim() || item.url?.trim());
  });
}

function hasAnswerData(value: any): boolean {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  if (typeof value === "string") {
    return Boolean(value.trim());
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(hasAnswerData);
  }

  if (typeof value === "object") {
    if (value.optionId) return true;

    if (value.content && hasContent(value.content)) return true;

    return Object.values(value).some(hasAnswerData);
  }

  return false;
}

function hasOptions(options?: QuestionOption[]) {
  return Boolean(
    options?.some((option) => hasContent(option.content))
  );
}

function getOptionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

function getCorrectOptionId(answer: any): string | undefined {
  if (typeof answer === "string") return answer;
  if (answer && typeof answer === "object") return answer.optionId;
  return undefined;
}

function isOptionCorrect(
  option: QuestionOption,
  index: number,
  answer: any
) {
  const correctId = getCorrectOptionId(answer);

  if (!correctId) return false;

  return (
    option.optionId === correctId ||
    (!option.optionId && correctId === getOptionLetter(index)) ||
    correctId === getOptionLetter(index)
  );
}

function hasResponseInfo(response?: QuestionResponse) {
  return Boolean(response?.mode || response?.inputMode);
}

function hasEvaluationInfo(evaluation?: QuestionData["evaluation"]) {
  return Boolean(evaluation?.mode || evaluation?.method);
}

function SkillChips({
  skills,
  label,
}: {
  skills?: LearningSkillId[];
  label?: string;
}) {
const validSkills: LearningSkillId[] = Array.isArray(skills)
  ? Array.from(
      new Set(
        skills.filter(
          (skill): skill is LearningSkillId =>
            typeof skill === "string" && isLearningSkillId(skill)
        )
      )
    )
  : [];

  if (!validSkills.length) return null;

  return (
    <Box sx={{ mt: 1, minWidth: 0 }}>
      {label && (
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={800}
          sx={{ display: "block", mb: 0.65, letterSpacing: "0.04em" }}
        >
          {label}
        </Typography>
      )}
      <Stack direction="row" flexWrap="wrap" gap={0.65}>
        {validSkills.map((skill) => (
          <Chip
            key={skill}
            size="small"
            variant="outlined"
            color="primary"
            label={getLearningSkillLabel(skill)}
            sx={{ maxWidth: "100%", height: "auto", minHeight: 24, "& .MuiChip-label": { whiteSpace: "normal", py: 0.35 } }}
          />
        ))}
      </Stack>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/*                             CONTENT RENDERER                               */
/* -------------------------------------------------------------------------- */

function ContentRenderer({
  items,
  compact = false,
}: {
  items?: ContentItem[];
  compact?: boolean;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState("");

  if (!hasContent(items)) return null;

  return (
    <>
      <Stack
        spacing={compact ? 0.75 : 1.25}
        sx={{ minWidth: 0, width: "100%" }}
      >
        {items!.map((item, index) => {
          if (!item) return null;

          if (
            (item.type === "image" || item.type === "diagram") &&
            item.url
          ) {
            return (
              <Box
                key={index}
                sx={{
                  width: "100%",
                  maxWidth: compact ? 320 : 460,
                  minWidth: 0,
                }}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={() => {
                    setSelectedImage(item.url!);
                    setSelectedImageAlt(
                      item.alt || "Question illustration"
                    );
                  }}
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: compact ? 140 : 210,
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    cursor: "zoom-in",
                    overflow: "hidden",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                    "&:hover .zoom-icon": {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={item.url}
                    alt={item.alt || "Question illustration"}
                    loading="lazy"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />

                  <Box
                    className="zoom-icon"
                    sx={{
                      position: "absolute",
                      right: 8,
                      bottom: 8,
                      width: 30,
                      height: 30,
                      borderRadius: 1.5,
                      bgcolor: "rgba(0,0,0,0.7)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: { xs: 1, sm: 0 },
                      transition: "opacity 0.2s",
                    }}
                  >
                    <ZoomIn fontSize="small" />
                  </Box>
                </Box>

                {item.alt && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {item.alt}
                  </Typography>
                )}
              </Box>
            );
          }

          if (item.type === "video" && item.url) {
            return (
              <Button
                key={index}
                size="small"
                variant="outlined"
                href={item.url}
                target="_blank"
                rel="noreferrer"
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                }}
              >
                Open video
              </Button>
            );
          }

          if (item.type === "table" && item.value) {
            return (
              <Box
                key={index}
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  overflowX: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  "& table": {
                    borderCollapse: "collapse",
                    width: "100%",
                  },
                  "& td, & th": {
                    border: "1px solid",
                    borderColor: "divider",
                    p: 1,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: item.value }}
              />
            );
          }

          if (item.value) {
            return (
              <Box
                key={index}
                sx={{
                  minWidth: 0,
                  width: "100%",
                  overflowWrap: "anywhere",
                  lineHeight: compact ? 1.6 : 1.75,
                  "& p": { my: 0 },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                  },
                }}
              >
                <RenderMath text={item.value} />
              </Box>
            );
          }

          return null;
        })}
      </Stack>

      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 180,
          }}
        >
          <IconButton
            onClick={() => setSelectedImage(null)}
            aria-label="Close image preview"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
          >
            <CloseRounded />
          </IconButton>

          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt={selectedImageAlt}
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                               ANSWER RENDERER                              */
/* -------------------------------------------------------------------------- */

function AnswerRenderer({
  value,
  options,
}: {
  value: any;
  options?: QuestionOption[];
}) {
  if (!hasAnswerData(value)) return null;

  if (typeof value === "string" || typeof value === "number") {
    return (
      <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
        <RenderMath text={String(value)} />
      </Box>
    );
  }

  if (typeof value === "boolean") {
    return (
      <Typography variant="body2" fontWeight={600}>
        {String(value)}
      </Typography>
    );
  }

  if (Array.isArray(value)) {
    return (
      <Stack spacing={0.75}>
        {value.map((item, index) => (
          <AnswerRenderer
            key={index}
            value={item}
            options={options}
          />
        ))}
      </Stack>
    );
  }

  if (typeof value === "object") {
    if (value.optionId && options?.length) {
      const index = options.findIndex(
        (option) => option.optionId === value.optionId
      );

      if (index < 0) return null;

      return (
        <Stack spacing={0.75}>
          <Chip
            size="small"
            color="success"
            label={`Option ${getOptionLetter(index)}`}
            sx={{
              alignSelf: "flex-start",
              fontWeight: 800,
            }}
          />

          <ContentRenderer
            items={options[index].content}
            compact
          />
        </Stack>
      );
    }

    if (value.content && Array.isArray(value.content)) {
      return (
        <ContentRenderer
          items={value.content}
          compact
        />
      );
    }

    if (
      value.acceptedAnswers &&
      Array.isArray(value.acceptedAnswers)
    ) {
      return (
        <Stack spacing={0.75}>
          {value.acceptedAnswers.map((answer: any, index: number) => (
            <Box key={index}>
              <RenderMath text={String(answer)} />
            </Box>
          ))}
        </Stack>
      );
    }

    const entries = Object.entries(value).filter(
      ([, item]) => hasAnswerData(item)
    );

    if (!entries.length) return null;

    return (
      <Stack spacing={0.75}>
        {entries.map(([key, item]) => (
          <Box
            key={key}
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(90px, auto) minmax(0, 1fr)",
              alignItems: "start",
              gap: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              color="text.secondary"
            >
              {formatLabel(key)}
            </Typography>

            <Box sx={{ minWidth: 0 }}>
              <AnswerRenderer
                value={item}
                options={options}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              DETAIL COMPONENTS                             */
/* -------------------------------------------------------------------------- */

function DetailPanel({
  title,
  children,
  fullWidth = false,
}: {
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  if (children === null || children === undefined) return null;

  return (
    <Box
      sx={{
        minWidth: 0,
        gridColumn: fullWidth ? "1 / -1" : "auto",
      }}
    >
      <Typography
        variant="caption"
        fontWeight={800}
        color="text.secondary"
        sx={{
          display: "block",
          mb: 0.75,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.25, sm: 1.75 },
          borderRadius: 2,
          minWidth: 0,
          height: "100%",
          bgcolor: "background.paper",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}

function OptionList({
  options,
  answer,
}: {
  options?: QuestionOption[];
  answer?: any;
}) {
  if (!hasOptions(options)) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
        },
        gap: 1,
      }}
    >
      {options!.map((option, index) => {
        if (!hasContent(option.content)) return null;

        const correct = isOptionCorrect(option, index, answer);

        return (
          <Paper
            key={option.optionId || index}
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              p: 1.25,
              minWidth: 0,
              borderRadius: 1.75,
              borderColor: correct ? "success.main" : "divider",
              bgcolor: correct ? "success.50" : "background.paper",
            }}
          >
            <Box
              sx={{
                width: 27,
                height: 27,
                flexShrink: 0,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: correct ? "success.main" : "action.selected",
                color: correct ? "white" : "text.primary",
                fontWeight: 800,
                fontSize: "0.8rem",
              }}
            >
              {getOptionLetter(index)}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <ContentRenderer
                items={option.content}
                compact
              />

              {correct && (
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="success.main"
                  sx={{ display: "block", mt: 0.75 }}
                >
                  Correct answer
                </Typography>
              )}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}

function ResponseInfo({
  response,
}: {
  response?: QuestionResponse;
}) {
  if (!hasResponseInfo(response)) return null;

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={0.75}
    >
      {response?.mode && (
        <Chip
          size="small"
          variant="outlined"
          label={`Mode: ${formatLabel(response.mode)}`}
        />
      )}

      {response?.inputMode && (
        <Chip
          size="small"
          variant="outlined"
          label={`Input: ${formatLabel(response.inputMode)}`}
        />
      )}
    </Stack>
  );
}

function EvaluationInfo({
  evaluation,
}: {
  evaluation?: QuestionData["evaluation"];
}) {
  if (!hasEvaluationInfo(evaluation)) return null;

  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={0.75}
    >
      {evaluation?.mode && (
        <Chip
          size="small"
          variant="outlined"
          label={`Evaluation: ${formatLabel(evaluation.mode)}`}
        />
      )}

      {evaluation?.method && (
        <Chip
          size="small"
          variant="outlined"
          label={`Method: ${formatLabel(evaluation.method)}`}
        />
      )}
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */
/*                              STEP COMPONENT                                */
/* -------------------------------------------------------------------------- */

function StepCard({
  step,
  index,
}: {
  step: QuestionStep;
  index: number;
}) {
  const instructionExists = hasContent(step.instruction);
  const optionsExist = hasOptions(step.options);
  const answerExists = hasAnswerData(step.answerKey);
  const explanationExists = hasContent(step.explanation);
  const responseExists = hasResponseInfo(step.response);

  if (
    !step.title &&
    !instructionExists &&
    !optionsExist &&
    !answerExists &&
    !explanationExists &&
    !responseExists &&
    !(step.skills?.length)
  ) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2,
        minWidth: 0,
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mb: 1.25 }}
      >
        <Chip
          size="small"
          color="primary"
          label={`Step ${index + 1}`}
          sx={{ fontWeight: 800 }}
        />

        {step.title && (
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{ minWidth: 0, overflowWrap: "anywhere" }}
          >
            {step.title}
          </Typography>
        )}
      </Stack>

      {instructionExists && (
        <ContentRenderer
          items={step.instruction}
          compact
        />
      )}

      <SkillChips skills={step.skills} label="Skills tested in this step" />

      {responseExists && (
        <Box sx={{ mt: 1.25 }}>
          <ResponseInfo response={step.response} />
        </Box>
      )}

      {optionsExist && (
        <Box sx={{ mt: 1.25 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={800}
            sx={{ display: "block", mb: 0.75 }}
          >
            OPTIONS
          </Typography>

          <OptionList
            options={step.options}
            answer={step.answerKey}
          />
        </Box>
      )}

      {answerExists && (
        <Box
          sx={{
            mt: 1.25,
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: "success.50",
            border: "1px solid",
            borderColor: "success.100",
          }}
        >
          <Typography
            variant="caption"
            color="success.main"
            fontWeight={800}
            sx={{ display: "block", mb: 0.5 }}
          >
            STEP ANSWER
          </Typography>

          <AnswerRenderer
            value={step.answerKey}
            options={step.options}
          />
        </Box>
      )}

      {explanationExists && (
        <Box sx={{ mt: 1.25 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={800}
            sx={{ display: "block", mb: 0.5 }}
          >
            EXPLANATION
          </Typography>

          <ContentRenderer
            items={step.explanation}
            compact
          />
        </Box>
      )}
    </Paper>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PART COMPONENT                                */
/* -------------------------------------------------------------------------- */

function PartCard({
  part,
  index,
}: {
  part: QuestionPart;
  index: number;
}) {
  const promptExists = hasContent(part.prompt);
  const optionsExist = hasOptions(part.options);
  const answerExists = hasAnswerData(part.answerKey);
  const explanationExists = hasContent(part.explanation);

  const steps = (part.steps || []).filter(
    (step) =>
      step.title ||
      hasContent(step.instruction) ||
      hasOptions(step.options) ||
      hasAnswerData(step.answerKey) ||
      hasContent(step.explanation) ||
      hasResponseInfo(step.response) ||
      Boolean(step.skills?.length)
  );

  if (
    !promptExists &&
    !optionsExist &&
    !answerExists &&
    !explanationExists &&
    !steps.length &&
    !(part.skills?.length)
  ) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.25, sm: 1.75 },
        borderRadius: 2,
        minWidth: 0,
        bgcolor: "background.default",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mb: 1.25 }}
      >
        <Chip
          size="small"
          color="primary"
          label={`Part ${index + 1}`}
          sx={{ fontWeight: 800 }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {steps.length
            ? `${steps.length} solution step${steps.length === 1 ? "" : "s"}`
            : "Question part"}
        </Typography>
      </Stack>

      {promptExists && (
        <ContentRenderer
          items={part.prompt}
          compact
        />
      )}

      <SkillChips skills={part.skills} label="Skills tested in this part" />

      {hasResponseInfo(part.response) && (
        <Box sx={{ mt: 1.25 }}>
          <ResponseInfo response={part.response} />
        </Box>
      )}

      {optionsExist && (
        <Box sx={{ mt: 1.25 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={800}
            sx={{ display: "block", mb: 0.75 }}
          >
            OPTIONS
          </Typography>

          <OptionList
            options={part.options}
            answer={part.answerKey}
          />
        </Box>
      )}

      {answerExists && (
        <Box
          sx={{
            mt: 1.25,
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: "success.50",
            border: "1px solid",
            borderColor: "success.100",
          }}
        >
          <Typography
            variant="caption"
            color="success.main"
            fontWeight={800}
            sx={{ display: "block", mb: 0.5 }}
          >
            ANSWER
          </Typography>

          <AnswerRenderer
            value={part.answerKey}
            options={part.options}
          />
        </Box>
      )}

      {explanationExists && (
        <Box sx={{ mt: 1.25 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={800}
            sx={{ display: "block", mb: 0.5 }}
          >
            EXPLANATION
          </Typography>

          <ContentRenderer
            items={part.explanation}
            compact
          />
        </Box>
      )}

      {steps.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Divider sx={{ mb: 1.25 }} />

          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={800}
            sx={{ display: "block", mb: 1 }}
          >
            SOLUTION STEPS
          </Typography>

          <Stack spacing={1}>
            {steps.map((step, stepIndex) => (
              <StepCard
                key={step.stepId || stepIndex}
                step={step}
                index={stepIndex}
              />
            ))}
          </Stack>
        </Box>
      )}

      {hasEvaluationInfo(part.evaluation) && (
        <Box sx={{ mt: 1.25 }}>
          <EvaluationInfo evaluation={part.evaluation} />
        </Box>
      )}
    </Paper>
  );
}

/* -------------------------------------------------------------------------- */
/*                            QUESTION DETAILS                                */
/* -------------------------------------------------------------------------- */

function QuestionDetails({
  question,
  onEdit,
  onDelete,
}: {
  question: QuestionData;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const review = getReviewStatus(question.verification?.status);

  const answer = question.answerKey ?? question.answer;

  const optionsExist = hasOptions(question.options);
  const answerExists = hasAnswerData(answer);
  const responseExists = hasResponseInfo(question.response);
  const evaluationExists = hasEvaluationInfo(question.evaluation);

  const explanationExists =
    hasContent(question.solution?.explanation) ||
    Boolean(question.hint?.text?.trim()) ||
    Boolean(question.hint?.imgUrl) ||
    Boolean(question.solution?.videoUrl);

  const steps = (question.steps || []).filter(
    (step) =>
      step.title ||
      hasContent(step.instruction) ||
      hasOptions(step.options) ||
      hasAnswerData(step.answerKey) ||
      hasContent(step.explanation) ||
      hasResponseInfo(step.response) ||
      Boolean(step.skills?.length)
  );

  const parts = (question.parts || []).filter(
    (part) =>
      hasContent(part.prompt) ||
      hasOptions(part.options) ||
      hasAnswerData(part.answerKey) ||
      hasContent(part.explanation) ||
      Boolean(part.steps?.length) ||
      Boolean(part.skills?.length)
  );

  const hasReviewInfo =
    question.verification?.checkedBy ||
    question.verification?.checkedAt ||
    question.verification?.remarks;

  return (
    <Stack spacing={1.75}>
      <DetailPanel title="Learning skills" fullWidth>
        <SkillChips skills={question.skills} />
        {!question.skills?.length && (
          <Typography variant="body2" color="text.secondary">
            No learning skills assigned to this question.
          </Typography>
        )}
      </DetailPanel>

      {(responseExists ||
        optionsExist ||
        answerExists ||
        evaluationExists) && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
            alignItems: "stretch",
          }}
        >
          {responseExists && (
            <DetailPanel title="Response format">
              <ResponseInfo response={question.response} />
            </DetailPanel>
          )}

          {optionsExist && (
            <DetailPanel title="Answer options" fullWidth>
              <OptionList
                options={question.options}
                answer={answer}
              />
            </DetailPanel>
          )}

          {answerExists && (
            <DetailPanel title="Correct answer">
              <AnswerRenderer
                value={answer}
                options={question.options}
              />
            </DetailPanel>
          )}

          {evaluationExists && (
            <DetailPanel title="Evaluation">
              <EvaluationInfo evaluation={question.evaluation} />
            </DetailPanel>
          )}
        </Box>
      )}

      {steps.length > 0 && (
        <DetailPanel title="Solution steps" fullWidth>
          <Stack spacing={1.25}>
            {steps.map((step, index) => (
              <StepCard
                key={step.stepId || index}
                step={step}
                index={index}
              />
            ))}
          </Stack>
        </DetailPanel>
      )}

      {parts.length > 0 && (
        <DetailPanel title="Question parts" fullWidth>
          <Stack spacing={1.25}>
            {parts.map((part, index) => (
              <PartCard
                key={part.partId || index}
                part={part}
                index={index}
              />
            ))}
          </Stack>
        </DetailPanel>
      )}

      {explanationExists && (
        <DetailPanel title="Explanation and hints" fullWidth>
          <Stack spacing={1.25}>
            {hasContent(question.solution?.explanation) && (
              <ContentRenderer
                items={question.solution?.explanation}
                compact
              />
            )}

            {question.hint?.text?.trim() && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="text.secondary"
                >
                  HINT
                </Typography>

                <Box sx={{ mt: 0.5 }}>
                  <RenderMath text={question.hint.text} />
                </Box>
              </Box>
            )}

            {question.hint?.imgUrl && (
              <ContentRenderer
                items={[
                  {
                    type: "image",
                    url: question.hint.imgUrl,
                    alt: "Hint",
                  },
                ]}
                compact
              />
            )}

            {question.solution?.videoUrl && (
              <Button
                variant="outlined"
                size="small"
                href={question.solution.videoUrl}
                target="_blank"
                rel="noreferrer"
                sx={{ alignSelf: "flex-start" }}
              >
                Watch solution video
              </Button>
            )}
          </Stack>
        </DetailPanel>
      )}

      <DetailPanel title="Review information" fullWidth>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          flexWrap="wrap"
          gap={1.5}
        >
          <Chip
            size="small"
            label={review.label}
            color={review.color}
            icon={review.icon}
            sx={{ fontWeight: 700 }}
          />

          {question.verification?.checkedBy && (
            <Typography variant="body2" color="text.secondary">
              Reviewed by:{" "}
              <strong>{question.verification.checkedBy}</strong>
            </Typography>
          )}

          {question.verification?.checkedAt && (
            <Typography variant="body2" color="text.secondary">
              {new Date(
                question.verification.checkedAt
              ).toLocaleDateString()}
            </Typography>
          )}

          {!hasReviewInfo && (
            <Typography variant="caption" color="text.secondary">
              No additional review details.
            </Typography>
          )}
        </Stack>

        {question.verification?.remarks && (
          <Alert severity="info" sx={{ mt: 1.25 }}>
            {question.verification.remarks}
          </Alert>
        )}
      </DetailPanel>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<Edit />}
          onClick={onEdit}
          sx={{
            minHeight: 42,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Edit question
        </Button>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={onDelete}
          sx={{
            minHeight: 42,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Delete question
        </Button>
      </Stack>
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */
/*                               QUESTION ROW                                 */
/* -------------------------------------------------------------------------- */

function QuestionRow({
  question,
  expanded,
  onExpand,
  selected,
  selectionMode,
  onSelect,
  onEdit,
  onDelete,
  onQuickVerify,
  verifying,
}: {
  question: QuestionData;
  expanded: boolean;
  onExpand: () => void;
  selected: boolean;
  selectionMode: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onQuickVerify: () => void;
  verifying: boolean;
}) {
  const review = getReviewStatus(question.verification?.status);

  const prompt = question.prompt || [];
  const hasLegacyQuestion = !prompt.length && question.question?.text;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        overflow: "hidden",
        borderColor: selected
          ? "primary.main"
          : expanded
            ? "primary.light"
            : "divider",
        bgcolor: selected ? "primary.50" : "background.paper",
        transition: "border-color 0.2s, background-color 0.2s",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: { xs: 0.75, sm: 1.5 },
          p: { xs: 1.25, sm: 1.75 },
        }}
      >
        {selectionMode && (
          <Checkbox
            size="small"
            checked={selected}
            onChange={onSelect}
            sx={{ mt: -0.5, ml: -0.75 }}
            inputProps={{
              "aria-label": "Select question",
            }}
          />
        )}

        <Box
          onClick={onExpand}
          sx={{
            flex: 1,
            minWidth: 0,
            cursor: "pointer",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            spacing={0.75}
            sx={{ mb: 0.75 }}
          >
            {question.subject && (
              <Typography
                variant="caption"
                fontWeight={800}
                color="primary.main"
              >
                {question.subject}
              </Typography>
            )}

            {question.chapter && (
              <Typography variant="caption" color="text.secondary">
                {question.subject ? " / " : ""}
                {question.chapter}
              </Typography>
            )}

            {question.subtopic && (
              <Typography variant="caption" color="text.secondary">
                / {question.subtopic}
              </Typography>
            )}
          </Stack>

          <Box
            sx={{
              fontSize: { xs: "0.9rem", sm: "0.95rem" },
              lineHeight: 1.65,
              fontWeight: 600,
              overflowWrap: "anywhere",
              minWidth: 0,
              "& img": {
                maxWidth: "100%",
                height: "auto",
              },
              "& p": { my: 0 },
            }}
          >
            {hasLegacyQuestion ? (
              <RenderMath text={question.question?.text || ""} />
            ) : prompt.length ? (
              <ContentRenderer items={prompt} compact />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No question text available.
              </Typography>
            )}
          </Box>

          {question.question?.imgUrl && !prompt.length && (
            <Box sx={{ mt: 1 }}>
              <ContentRenderer
                items={[
                  {
                    type: "image",
                    url: question.question.imgUrl,
                    alt: "Question",
                  },
                ]}
                compact
              />
            </Box>
          )}

          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            spacing={0.75}
            sx={{ mt: 1 }}
          >
            <Chip
              size="small"
              label={review.label}
              color={review.color}
              sx={{
                height: 23,
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            />

            {question.type && (
              <Typography variant="caption" color="text.secondary">
                {formatLabel(question.type)}
              </Typography>
            )}

            {!!question.skills?.length && (
              <Typography variant="caption" color="text.secondary">
                · {question.skills.length} learning skill{question.skills.length === 1 ? "" : "s"}
              </Typography>
            )}

            {question.version && question.version > 1 && (
              <Chip
                size="small"
                variant="outlined"
                label={`v${question.version}`}
                sx={{ height: 21 }}
              />
            )}
          </Stack>
        </Box>

        {/* ROW ACTIONS */}

        <Stack
          direction="row"
          alignItems="center"
          spacing={0}
          sx={{ flexShrink: 0, ml: "auto" }}
        >
          {!selectionMode && (
            <>
              {question.verification?.status !== "verified" && (
                <Tooltip title="Mark as verified">
                  <span>
                    <IconButton
                      size="small"
                      color="success"
                      disabled={verifying}
                      onClick={(event) => {
                        event.stopPropagation();
                        onQuickVerify();
                      }}
                    >
                      {verifying ? (
                        <CircularProgress size={17} />
                      ) : (
                        <CheckCircleOutline fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              )}

              <Tooltip title="Edit question">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete question">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}

          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onExpand();
            }}
            aria-label={expanded ? "Hide details" : "Show details"}
          >
            <ExpandMore
              sx={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />

        <Box sx={{ p: { xs: 1.25, sm: 2 } }}>
          <QuestionDetails
            question={question}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Box>
      </Collapse>
    </Paper>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function ManageQuestionBank() {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [reviewTab, setReviewTab] = useState("");

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [user, setUser] = useState<{ _id: string }>({ _id: "" });

  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Quick verification state
  const [verifyingId, setVerifyingId] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  /* -------------------------------- FILTERS -------------------------------- */

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
    setSelectedQuestions([]);
    setExpandedId(null);
  };

  const activeFilterCount = [
    filters.course,
    filters.subject,
    filters.chapter,
    filters.fromDate,
    filters.toDate,
  ].filter(Boolean).length;

  const hasActiveFilters =
    Object.values(filters).some(Boolean) || Boolean(reviewTab);

  const queryFor = useCallback(
    (targetPage: number, limit: number) => {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(limit),
        search: filters.search.trim(),
        course: filters.course,
        subject: filters.subject,
        chapter: filters.chapter,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        verificationStatus: reviewTab,
      });

      return params.toString();
    },
    [filters, reviewTab]
  );

  const clearFilters = () => {
    setFilters(initialFilters);
    setReviewTab("");
    setPage(0);
    setSelectedQuestions([]);
    setExpandedId(null);
  };

  const changeReviewTab = (value: string) => {
    setReviewTab(value);
    setPage(0);
    setSelectedQuestions([]);
    setExpandedId(null);
  };

  /* ------------------------------ AUTHENTICATION -------------------------- */

  useEffect(() => {
    let alive = true;

    async function loadUser() {
      try {
        const data = await getCurrentUser();

        if (!alive) return;

        if (data?.success && data.user) {
          setUser({ _id: data.user._id });
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Authentication check failed:", err);

        if (alive) router.push("/login");
      } finally {
        if (alive) setAuthLoading(false);
      }
    }

    loadUser();

    return () => {
      alive = false;
    };
  }, [router]);

  /* ----------------------------- FETCH QUESTIONS ------------------------- */

  useEffect(() => {
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/Fetch-QuestionBank?${queryFor(page + 1, rowsPerPage)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message || data.error || "Could not load questions."
          );
        }

        setQuestions(data.questions || []);
        setTotalQuestions(data.pagination?.total ?? 0);

        setSelectedQuestions((previous) =>
          previous.filter((id) =>
            (data.questions || []).some(
              (q: QuestionData) => q._id === id
            )
          )
        );

        setExpandedId((previous) =>
          (data.questions || []).some(
            (q: QuestionData) => q._id === previous
          )
            ? previous
            : null
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Question fetch failed:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Could not load questions."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, filters.search.trim() ? 300 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [queryFor, page, rowsPerPage, refreshKey]);

  /* ---------------------------- QUICK VERIFICATION ------------------------ */

  const handleQuickVerify = async (id: string) => {
    if (verifyingId) return;

    if (!user._id) {
      setError("User authentication is not ready.");
      return;
    }

    try {
      setVerifyingId(id);
      setError("");
      setSuccessMessage("");

      const res = await fetch("/api/Quick-Verify-Question", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          userId: user._id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Failed to verify question."
        );
      }

      setSuccessMessage("Question verified successfully.");

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Quick verification failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to verify question."
      );
    } finally {
      setVerifyingId("");
    }
  };

  /* ------------------------------- SELECTION ------------------------------ */

  const allPageSelected =
    questions.length > 0 &&
    questions.every((q) => selectedQuestions.includes(q._id));

  const selectedOnCurrentPage = questions.filter((question) =>
    selectedQuestions.includes(question._id)
  ).length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions((prev) =>
        Array.from(
          new Set([
            ...prev,
            ...questions.map((question) => question._id),
          ])
        )
      );
    } else {
      const currentIds = new Set(questions.map((q) => q._id));

      setSelectedQuestions((prev) =>
        prev.filter((id) => !currentIds.has(id))
      );
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedQuestions([]);
  };

  /* -------------------------------- DELETE -------------------------------- */

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Delete this question? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/Delete-Question/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || data.error || "Failed to delete question."
        );
      }

      setSuccessMessage("Question deleted successfully.");

      setSelectedQuestions((prev) =>
        prev.filter((selected) => selected !== id)
      );

      if (expandedId === id) {
        setExpandedId(null);
      }

      if (questions.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);

      window.alert(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  /* ----------------------------- BULK DELETE ------------------------------ */

  const handleBulkDelete = async () => {
    if (!selectedQuestions.length || isBulkDeleting) return;

    const idsToDelete = [...selectedQuestions];
    const count = idsToDelete.length;

    if (
      !window.confirm(
        `Delete ${count} selected question${count === 1 ? "" : "s"}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsBulkDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/Bulk-Delete-Questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: idsToDelete,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete selected questions."
        );
      }

      const deletedCount = data.deletedCount ?? count;

      setSuccessMessage(
        `${deletedCount} question${deletedCount === 1 ? "" : "s"} deleted successfully.`
      );

      setSelectedQuestions([]);
      setSelectionMode(false);
      setExpandedId(null);

      if (questions.length <= count && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Bulk delete failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete selected questions."
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  /* -------------------------------- IMPORT -------------------------------- */

  const handleExcelUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!user._id) {
      window.alert("User authentication is not ready. Please try again.");
      event.target.value = "";
      return;
    }

    try {
      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.SheetNames[0];

      if (!firstSheet) {
        throw new Error("The Excel file has no worksheet.");
      }

      const jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[firstSheet],
        { defval: "" }
      );

      if (!jsonData.length) {
        throw new Error("No rows found in the Excel file.");
      }

      const res = await fetch("/api/Import-Questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: jsonData,
          userId: user._id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || data.error || "Failed to import questions."
        );
      }

      setSuccessMessage(
        `${data.importedCount ?? jsonData.length} questions imported successfully.`
      );

      setPage(0);
      clearFilters();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);

      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to import questions."
      );
    } finally {
      event.target.value = "";
      setMenuAnchor(null);
    }
  };

  /* -------------------------------- EXPORT -------------------------------- */

  const handleDownloadExcel = async () => {
    setIsExporting(true);

    try {
      const firstResponse = await fetch(
        `/api/Fetch-QuestionBank?${queryFor(1, 100)}`,
        { cache: "no-store" }
      );

      const firstData = await firstResponse.json();

      if (!firstResponse.ok || !firstData.success) {
        throw new Error(
          firstData.message ||
            firstData.error ||
            "Could not export questions."
        );
      }

      const allQuestions: QuestionData[] = [
        ...(firstData.questions || []),
      ];

      const totalPages = firstData.pagination?.totalPages || 0;

      for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
        const res = await fetch(
          `/api/Fetch-QuestionBank?${queryFor(currentPage, 100)}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.message ||
              data.error ||
              `Export failed on page ${currentPage}.`
          );
        }

        allQuestions.push(...(data.questions || []));
      }

      const exportData = allQuestions.map((q) => ({
        questionId: q.questionId || q._id,
        version: q.version ?? 1,
        course: q.course || "",
        subject: q.subject || "",
        chapter: q.chapter || "",
        subtopic: q.subtopic || "",
        type: q.type || "",
        skills: JSON.stringify(q.skills || []),
        prompt: JSON.stringify(q.prompt || []),
        response: JSON.stringify(q.response || {}),
        options: JSON.stringify(q.options || []),
        answerKey: JSON.stringify(q.answerKey ?? null),
        evaluation: JSON.stringify(q.evaluation || {}),
        steps: JSON.stringify(q.steps || []),
        parts: JSON.stringify(q.parts || []),
        solution: JSON.stringify(q.solution || {}),
        learning: JSON.stringify(q.learning || {}),
        selection: JSON.stringify(q.selection || {}),
        verification: JSON.stringify(q.verification || {}),
        status: q.status || "",
        uploadedBy: q.uploadedBy || "",
        source: q.source || "",
        createdAt: q.createdAt || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const exportWorkbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        exportWorkbook,
        worksheet,
        "Question Library"
      );

      XLSX.writeFile(
        exportWorkbook,
        "InnovativeAcademy_QuestionLibrary.xlsx"
      );

      setSuccessMessage("Question library exported successfully.");
    } catch (err) {
      console.error(err);

      window.alert(
        err instanceof Error ? err.message : "Failed to export questions."
      );
    } finally {
      setIsExporting(false);
      setMenuAnchor(null);
    }
  };

  /* -------------------------------- DERIVED ------------------------------- */

  const pageStart = totalQuestions
    ? page * rowsPerPage + 1
    : 0;

  const pageEnd = Math.min(
    (page + 1) * rowsPerPage,
    totalQuestions
  );

  const totalPages = Math.max(
    1,
    Math.ceil(totalQuestions / rowsPerPage)
  );

  /* -------------------------------- LOADING ------------------------------- */

  if (authLoading) return <Loading />;

  /* ---------------------------------- UI ---------------------------------- */

  return (
    <PageContainer
      title="Question Library"
      description="Find, review and manage academy questions"
    >
      <Box sx={{ pb: 5 }}>
        {/* HEADER */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ mb: 2.5 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                fontSize: { xs: "1rem", sm: "1.5rem" },
                letterSpacing: "-0.5px",
              }}
            >
              Question Library
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {totalQuestions.toLocaleString()} questions
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.75}>
            <IconButton
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              aria-label="More actions"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <MoreVert />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() =>
                router.push("/dashboard/admin/set-question-bank")
              }
              sx={{
                borderRadius: 2,
                whiteSpace: "nowrap",
                minHeight: 42,
                px: { xs: 1.25, sm: 2 },
              }}
            >
              Add question
            </Button>
          </Stack>
        </Stack>

        {/* ACTION MENU */}

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem component="label" sx={{ gap: 1 }}>
            <FileUpload fontSize="small" />
            Import Excel

            <input
              hidden
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelUpload}
            />
          </MenuItem>

          <MenuItem
            onClick={handleDownloadExcel}
            disabled={isExporting || totalQuestions === 0}
            sx={{ gap: 1 }}
          >
            {isExporting ? (
              <CircularProgress size={18} />
            ) : (
              <FileDownload fontSize="small" />
            )}

            Export Excel
          </MenuItem>

          <MenuItem
            onClick={() => {
              setRefreshKey((prev) => prev + 1);
              setMenuAnchor(null);
            }}
            sx={{ gap: 1 }}
          >
            <Refresh fontSize="small" />
            Refresh
          </MenuItem>
        </Menu>

        {/* NOTIFICATIONS */}

        {successMessage && (
          <Alert
            severity="success"
            onClose={() => setSuccessMessage("")}
            sx={{ mb: 2 }}
          >
            {successMessage}
          </Alert>
        )}

        {/* SEARCH */}

        <Paper
          variant="outlined"
          sx={{
            p: 0.75,
            borderRadius: 2.5,
            mb: 1.5,
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search questions, chapters or topics..."
            value={filters.search}
            onChange={(event) =>
              setFilter("search", event.target.value)
            }
            InputProps={{
              disableUnderline: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <IconButton
                  size="small"
                  onClick={() => setFilter("search", "")}
                  aria-label="Clear search"
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              ) : null,
            }}
            sx={{ px: 1, py: 0.5 }}
          />
        </Paper>

        {/* REVIEW FILTERS */}

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            overflowX: "auto",
            pb: 1,
            mb: 1,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {reviewStatuses.map((status) => {
            const active = reviewTab === status.value;

            return (
              <Button
                key={status.value}
                onClick={() => changeReviewTab(status.value)}
                variant={active ? "contained" : "outlined"}
                color={active ? "primary" : "inherit"}
                sx={{
                  flexShrink: 0,
                  borderRadius: 5,
                  textTransform: "none",
                  fontWeight: active ? 700 : 500,
                  minHeight: 35,
                  px: 1.75,
                  fontSize: "0.8rem",
                }}
              >
                {status.label}
              </Button>
            );
          })}
        </Stack>

        {/* TOOLBAR: FILTERS + SELECTION */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Button
            startIcon={<Tune />}
            endIcon={
              <ExpandMore
                sx={{
                  transform: filtersOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            }
            onClick={() => setFiltersOpen((prev) => !prev)}
            color="inherit"
            sx={{
              textTransform: "none",
              justifyContent: "flex-start",
              alignSelf: "flex-start",
            }}
          >
            Filters

            {activeFilterCount > 0 && (
              <Chip
                size="small"
                color="primary"
                label={activeFilterCount}
                sx={{ ml: 1, height: 21 }}
              />
            )}
          </Button>

          {!selectionMode ? (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SelectAll />}
              onClick={() => {
                setSelectionMode(true);
                setSelectedQuestions([]);
              }}
              sx={{
                minHeight: 40,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                alignSelf: { xs: "stretch", sm: "auto" },
              }}
            >
              Select questions
            </Button>
          ) : (
            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              spacing={0.75}
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: "primary.50",
                border: "1px solid",
                borderColor: "primary.200",
              }}
            >
              <Chip
                size="small"
                color="primary"
                label={`${selectedQuestions.length} selected`}
                sx={{ fontWeight: 800 }}
              />

              <Button
                size="small"
                color="error"
                variant="contained"
                startIcon={
                  isBulkDeleting ? (
                    <CircularProgress size={15} color="inherit" />
                  ) : (
                    <Delete />
                  )
                }
                disabled={
                  selectedQuestions.length === 0 ||
                  isBulkDeleting
                }
                onClick={handleBulkDelete}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {isBulkDeleting ? "Deleting..." : "Delete selected"}
              </Button>

              <Button
                size="small"
                color="inherit"
                disabled={isBulkDeleting}
                onClick={exitSelectionMode}
                sx={{ textTransform: "none" }}
              >
                Cancel
              </Button>
            </Stack>
          )}
        </Stack>

        {/* FILTER PANEL */}

        <Collapse in={filtersOpen} unmountOnExit>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2.5,
              mb: 2,
            }}
          >
            <Typography fontWeight={700} sx={{ mb: 1.5 }}>
              Course and chapter
            </Typography>

            <QuestionTypeSelector
              onLevelChange={() => {}}
              onCourseChange={(value: string) =>
                setFilter("course", value)
              }
              onSubjectChange={(value: string) =>
                setFilter("subject", value)
              }
              onChapterChange={(value: string) =>
                setFilter("chapter", value)
              }
              title={null}
              isSubmitted={false}
            />

            <Divider sx={{ my: 2 }} />

            <Typography fontWeight={700} sx={{ mb: 1.5 }}>
              Upload date
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
            >
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From"
                value={filters.fromDate}
                onChange={(event) =>
                  setFilter("fromDate", event.target.value)
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: filters.toDate || undefined,
                }}
              />

              <TextField
                fullWidth
                size="small"
                type="date"
                label="To"
                value={filters.toDate}
                onChange={(event) =>
                  setFilter("toDate", event.target.value)
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: filters.fromDate || undefined,
                }}
              />
            </Stack>

            {activeFilterCount > 0 && (
              <Stack
                direction="row"
                justifyContent="flex-end"
                sx={{ mt: 1.5 }}
              >
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </Stack>
            )}
          </Paper>
        </Collapse>

        {/* ACTIVE FILTERS */}

        {hasActiveFilters && (
          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            sx={{ mb: 1.5, gap: 0.75 }}
          >
            {Object.entries(filters)
              .filter(([, value]) => Boolean(value))
              .map(([key, value]) => (
                <Chip
                  key={key}
                  size="small"
                  label={`${formatLabel(key)}: ${value}`}
                  onDelete={() =>
                    setFilter(key as keyof Filters, "")
                  }
                />
              ))}

            {reviewTab && (
              <Chip
                size="small"
                label={
                  reviewStatuses.find(
                    (item) => item.value === reviewTab
                  )?.label || reviewTab
                }
                onDelete={() => changeReviewTab("")}
              />
            )}

            <Button
              size="small"
              onClick={clearFilters}
              sx={{ minWidth: 0 }}
            >
              Clear all
            </Button>
          </Stack>
        )}

        {/* ERROR */}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setRefreshKey((prev) => prev + 1)}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* QUESTION LIST HEADER */}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Typography fontWeight={800}>
            Questions
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {totalQuestions
              ? `${pageStart}–${pageEnd} of ${totalQuestions}`
              : "No questions"}
          </Typography>
        </Stack>

        {/* SELECT ALL */}

        {selectionMode && questions.length > 0 && (
          <Paper
            variant="outlined"
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "action.hover",
            }}
          >
            <Checkbox
              size="small"
              checked={allPageSelected}
              indeterminate={
                selectedOnCurrentPage > 0 && !allPageSelected
              }
              onChange={(event) =>
                toggleSelectAll(event.target.checked)
              }
            />

            <Typography variant="body2" fontWeight={600}>
              Select all on this page
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: "auto" }}
            >
              {selectedOnCurrentPage}/{questions.length}
            </Typography>
          </Paper>
        )}

        {/* QUESTION LIST */}

        <Stack spacing={1}>
          {isLoading ? (
            <Paper
              variant="outlined"
              sx={{
                p: 5,
                borderRadius: 2.5,
                textAlign: "center",
              }}
            >
              <CircularProgress size={28} />

              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 1.5 }}
              >
                Loading questions...
              </Typography>
            </Paper>
          ) : questions.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 4, sm: 6 },
                textAlign: "center",
                borderRadius: 2.5,
              }}
            >
              <Search
                sx={{
                  fontSize: 38,
                  color: "text.disabled",
                  mb: 1,
                }}
              />

              <Typography fontWeight={750}>
                No questions found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Try another search or remove some filters.
              </Typography>

              {hasActiveFilters && (
                <Button
                  sx={{ mt: 1.5 }}
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </Paper>
          ) : (
            questions.map((question) => (
              <QuestionRow
                key={question._id}
                question={question}
                expanded={expandedId === question._id}
                onExpand={() =>
                  setExpandedId((prev) =>
                    prev === question._id ? null : question._id
                  )
                }
                selected={selectedQuestions.includes(question._id)}
                selectionMode={selectionMode}
                onSelect={() => toggleSelect(question._id)}
                onEdit={() =>
                  router.push(
                    `/dashboard/admin/edit-question/${question._id}`
                  )
                }
                onDelete={() => handleDelete(question._id)}
                onQuickVerify={() =>
                  handleQuickVerify(question._id)
                }
                verifying={verifyingId === question._id}
              />
            ))
          )}
        </Stack>

        {/* PAGINATION */}

        {!isLoading && totalQuestions > 0 && (
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2.5,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Per page
                </Typography>

                <TextField
                  select
                  size="small"
                  value={rowsPerPage}
                  onChange={(event) => {
                    setRowsPerPage(Number(event.target.value));
                    setPage(0);
                    setSelectedQuestions([]);
                    setExpandedId(null);
                  }}
                  sx={{ width: 80 }}
                >
                  {[10, 15, 25, 50, 100].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, value) => {
                  setPage(value - 1);
                  setSelectedQuestions([]);
                  setExpandedId(null);
                }}
                color="primary"
                size="small"
                siblingCount={0}
                boundaryCount={1}
              />
            </Stack>
          </Paper>
        )}
      </Box>
    </PageContainer>
  );
}