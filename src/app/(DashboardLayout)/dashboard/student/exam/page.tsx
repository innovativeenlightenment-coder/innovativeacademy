"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import RenderMath from "@/lib/renderMaths";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  CheckCircleRounded,
  CloseRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  FullscreenRounded,
  FullscreenExitRounded,
  ImageOutlined,
  MenuRounded,
  NavigateBeforeRounded,
  NavigateNextRounded,
  ScheduleRounded,
  SendRounded,
  WarningAmberRounded,
} from "@mui/icons-material";

/* =========================================================
   TYPES
========================================================= */

type ContentBlock = {
  type: "text" | "math" | "image" | "diagram" | "table" | "video";
  value?: any;
  url?: string;
  alt?: string;
};

type Option = {
  optionId: string;
  content: ContentBlock[];
};

type ResponseDefinition = {
  mode: string;
  inputMode?: string;
  config?: any;
};

type ExamStep = {
  stepId: string;
  order: number;
  title?: any;
  instruction?: any;
  response: ResponseDefinition;
  options?: Option[];

  // Learning skills assigned to this step
  skills?: string[];
};

type ExamPart = {
  partId: string;
  order: number;
  prompt: ContentBlock[];
  response: ResponseDefinition;
  options?: Option[];
  steps?: ExamStep[];

  // Learning skills assigned to this part
  skills?: string[];
};

type ExamQuestion = {
  _id: string;
  questionId: string;
  version: number;
  qNo: number;
  marks: number;
  setId?: string | null;
  type: string;
  category?: string;
  prompt: ContentBlock[];
  response: ResponseDefinition;
  options?: Option[];
  steps?: ExamStep[];
  parts?: ExamPart[];

  // Question-level learning skills
  skills?: string[];
};


type ExamData = {
  examId: string;
  title: string;
  testType?: string;
  course?: string;
  subject?: string;
  chapters?: string[];
  durationSec: number;
  totalQuestions: number;
  totalMarks: number;
  startTime?: string;
  endTime?: string;
  questions: ExamQuestion[];
};

type AnswerValue = any;

/* =========================================================
   CONSTANTS
========================================================= */

const EXAM_KEY = "currentExam";
const ANSWERS_KEY = "studentExamAnswersV2";
const END_TIME_KEY = "studentExamEndTimeV2";

// Change this only if your exam listing page has another route.
const START_EXAM_ROUTE = "/dashboard/student/start-exam";

const PURPLE = "#6D28D9";
const PURPLE_DARK = "#5B21B6";
const LIGHT_PURPLE = "#F3E8FF";

const DARK = "#171B2E";
const BACKGROUND = "#F5F7FB";

const CONTENT_TYPES = [
  "text",
  "math",
  "image",
  "diagram",
  "table",
  "video",
];

/* =========================================================
   HELPERS
========================================================= */

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
}

function isContentBlock(value: any): value is ContentBlock {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.type === "string" &&
    CONTENT_TYPES.includes(value.type)
  );
}

function normalizeContent(content: any): ContentBlock[] {
  if (content === null || content === undefined) return [];

  if (Array.isArray(content)) {
    return content.flatMap((item) => {
      if (isContentBlock(item)) return [item];

      if (
        item &&
        typeof item === "object" &&
        "value" in item
      ) {
        return [
          {
            type: "text" as const,
            value: item.value,
          },
        ];
      }

      if (
        typeof item === "string" ||
        typeof item === "number"
      ) {
        return [
          {
            type: "text" as const,
            value: String(item),
          },
        ];
      }

      return [];
    });
  }

  if (isContentBlock(content)) return [content];

  if (typeof content === "string" || typeof content === "number") {
    return [{ type: "text", value: String(content) }];
  }

  return [];
}

function getDisplayValue(item: any, fallback: any = "") {
  if (
    item &&
    typeof item === "object" &&
    !Array.isArray(item)
  ) {
    return (
      item.content ??
      item.label ??
      item.text ??
      item.value ??
      fallback
    );
  }

  return item ?? fallback;
}

function emptyResponse(response?: ResponseDefinition): AnswerValue {
  switch (response?.mode) {
    case "select_one":
    case "number_choice":
    case "math_choice":
    case "diagram_select":
      return { optionId: "" };

    case "select_many":
      return { optionIds: [] };

    case "fill_blanks":
      return { blanks: {} };

    case "matching":
      return { matches: {} };

    case "ordering":
      return { order: [] };

    case "word_bank":
      return { words: [] };

    case "stepwise":
      return { steps: {} };

    default:
      return { content: "" };
  }
}

function emptyQuestionResponse(question: ExamQuestion): AnswerValue {
  if (question.parts?.length) return { parts: {} };
  if (question.steps?.length) return { steps: {} };

  return emptyResponse(question.response);
}

function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isEmpty);
  }

  if (typeof value === "object") {
    const values = Object.values(value);

    return values.length === 0 || values.every(isEmpty);
  }

  return false;
}

function getStepAnswerPreview(answer: any, options?: Option[]) {
  if (isEmpty(answer)) return "Not answered yet";

  if (typeof answer?.content === "string" && answer.content.trim()) {
    return answer.content.trim();
  }

  if (answer?.optionId) {
    const option = options?.find(
      (item) => item.optionId === answer.optionId
    );
    return option ? "Option selected" : "Answer selected";
  }

  if (Array.isArray(answer?.optionIds) && answer.optionIds.length) {
    return `${answer.optionIds.length} options selected`;
  }

  if (Array.isArray(answer?.words) && answer.words.length) {
    return `${answer.words.length} words selected`;
  }

  if (Array.isArray(answer?.order) && answer.order.length) {
    return "Order arranged";
  }

  if (answer?.blanks && Object.keys(answer.blanks).length) {
    return "Blanks filled";
  }

  if (answer?.matches && Object.keys(answer.matches).length) {
    return "Matching completed";
  }

  return "Answer saved";
}

function isQuestionAnswered(
  question: ExamQuestion,
  answer: AnswerValue
) {
  if (!answer) return false;

  if (question.parts?.length) {
    return question.parts.some((part) => {
      const partAnswer = answer.parts?.[part.partId];

      if (!partAnswer) return false;

      if (part.steps?.length) {
        return part.steps.some((step) =>
          !isEmpty(partAnswer.steps?.[step.stepId])
        );
      }

      return !isEmpty(partAnswer);
    });
  }

  if (question.steps?.length) {
    return question.steps.some((step) =>
      !isEmpty(answer.steps?.[step.stepId])
    );
  }

  return !isEmpty(answer);
}

function containsLatex(value: string) {
  return (
    /\\\([\s\S]*?\\\)/.test(value) ||
    /\\\[[\s\S]*?\\\]/.test(value) ||
    /\$\$[\s\S]*?\$\$/.test(value) ||
    /\$[^$]+\$/.test(value) ||
    /\\begin\{/.test(value)
  );
}

/* =========================================================
   RICH VALUE
========================================================= */

function RichValue({ value }: { value: any }) {
  if (value === null || value === undefined) return null;

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const text = String(value);

    if (containsLatex(text)) {
      return <RenderMath text={text} />;
    }

    return (
      <Typography
        component="span"
        sx={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
          overflowWrap: "anywhere",
        }}
      >
        {text}
      </Typography>
    );
  }

  if (typeof value === "boolean") {
    return <>{value ? "Yes" : "No"}</>;
  }

  if (isContentBlock(value)) {
    return <Content content={[value]} />;
  }

  if (Array.isArray(value)) {
    if (!value.length) return null;

    if (value.every(isContentBlock)) {
      return <Content content={value} />;
    }

    return (
      <Stack spacing={0.5}>
        {value.map((item, index) => (
          <Box key={index}>
            <RichValue value={item} />
          </Box>
        ))}
      </Stack>
    );
  }

  if (typeof value === "object") {
    if ("content" in value) {
      return <RichValue value={value.content} />;
    }

    if ("value" in value) {
      return <RichValue value={value.value} />;
    }

    return (
      <Typography
        component="span"
        sx={{ overflowWrap: "anywhere" }}
      >
        {JSON.stringify(value)}
      </Typography>
    );
  }

  return null;
}

/* =========================================================
   CONTENT RENDERER
========================================================= */

function Content({ content }: { content?: any }) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    null
  );

  const blocks = normalizeContent(content);

  if (!blocks.length) return null;

  return (
    <>
      <Stack spacing={1.25}>
        {blocks.map((item, index) => {
          if (
            item.type === "image" ||
            item.type === "diagram"
          ) {
            if (!item.url) return null;

            return (
              <Box
                key={index}
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  my: 0.5,
                }}
              >
                <Box
                  onClick={() => setImagePreview(item.url!)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setImagePreview(item.url!);
                    }
                  }}
                  sx={{
                    position: "relative",
                    maxWidth: "100%",
                    overflow: "hidden",
                    borderRadius: 2,
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    cursor: "zoom-in",
                    pointerEvents: "auto",
                  }}
                >
                  <Box
                    component="img"
                    src={item.url}
                    alt={item.alt || "Question image"}
                    loading="lazy"
                    sx={{
                      display: "block",
                      width: "auto",
                      height: "auto",
                      maxWidth: "100%",
                      maxHeight: {
                        xs: 115,
                        sm: 125,
                        md: 130,
                      },
                      objectFit: "contain",
                      cursor: "zoom-in",
                    }}
                  />

                  <Box
                    sx={{
                      position: "absolute",
                      right: 6,
                      bottom: 6,
                      width: 27,
                      height: 27,
                      display: "grid",
                      placeItems: "center",
                      color: "#FFFFFF",
                      backgroundColor: "rgba(23,27,46,0.75)",
                      borderRadius: 1.5,
                      pointerEvents: "none",
                    }}
                  >
                    <ImageOutlined fontSize="small" />
                  </Box>
                </Box>
              </Box>
            );
          }

          if (item.type === "video") {
            if (!item.url) return null;

            return (
              <Box
                key={index}
                sx={{
                  width: "100%",
                  maxWidth: 550,
                  mx: "auto",
                }}
              >
                <Box
                  component="video"
                  src={item.url}
                  controls
                  sx={{
                    width: "100%",
                    borderRadius: 2,
                    backgroundColor: "#000",
                  }}
                />
              </Box>
            );
          }

          if (item.type === "math") {
            return (
              <Box
                key={index}
                sx={{
                  overflowX: "auto",
                  py: 0.4,
                  color: DARK,
                  "&::-webkit-scrollbar": { height: 4 },
                }}
              >
                <RenderMath
                  text={
                    typeof item.value === "string"
                      ? item.value
                      : String(item.value ?? "")
                  }
                />
              </Box>
            );
          }

          if (item.type === "table") {
            return (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  overflowX: "auto",
                  backgroundColor: "#FAFBFF",
                }}
              >
                <RichValue value={item.value} />
              </Paper>
            );
          }

          return (
            <Box
              key={index}
              sx={{
                fontSize: 15,
                lineHeight: 1.75,
                color: "#273044",
                overflowWrap: "anywhere",
              }}
            >
              <RichValue value={item.value} />
            </Box>
          );
        })}
      </Stack>

      {imagePreview && (
        <Box
          role="dialog"
          aria-modal="true"
          aria-label="Expanded image preview"
          onClick={() => setImagePreview(null)}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 25000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 1, sm: 3 },
            backgroundColor: "rgba(8, 12, 24, 0.94)",
            cursor: "zoom-out",
          }}
        >
          <IconButton
            aria-label="Close image preview"
            onClick={() => setImagePreview(null)}
            sx={{
              position: "absolute",
              top: { xs: 8, sm: 18 },
              right: { xs: 8, sm: 18 },
              zIndex: 1,
              color: "#FFFFFF",
              backgroundColor: "rgba(255,255,255,0.14)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.24)" },
            }}
          >
            <CloseRounded />
          </IconButton>
          <Box
            component="img"
            src={imagePreview}
            alt="Expanded question image"
            onClick={(event: React.MouseEvent<HTMLImageElement>) => event.stopPropagation()}
            sx={{
              display: "block",
              width: "auto",
              height: "auto",
              maxWidth: "96vw",
              maxHeight: "92dvh",
              objectFit: "contain",
              cursor: "default",
              borderRadius: 1,
              boxShadow: "0 20px 80px rgba(0,0,0,0.45)",
            }}
          />
          <Typography
            sx={{
              position: "absolute",
              bottom: 12,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "rgba(255,255,255,0.72)",
              fontSize: 11,
              pointerEvents: "none",
            }}
          >
            Tap outside the image or close to return
          </Typography>
        </Box>
      )}
    </>
  );
}

/* =========================================================
   RESPONSE INPUT
========================================================= */

const responsePaperSx = {
  borderRadius: 2,
  borderColor: "#E5E7EB",
  transition: "all 0.15s ease",
  "&:hover": {
    borderColor: "#C4B5FD",
  },
};

function ResponseInput({
  definition,
  options,
  value,
  onChange,
}: {
  definition: ResponseDefinition;
  options?: Option[];
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const rawMode = String(
    definition?.mode || definition?.inputMode || "short_text"
  ).toLowerCase();

  // Support legacy and alternate response-mode names used by question data.
  const modeAliases: Record<string, string> = {
    text: "short_text",
    text_input: "short_text",
    single_line: "short_text",
    textarea: "long_text",
    text_area: "long_text",
    multiline: "long_text",
    paragraph: "long_text",
    numeric: "number",
    integer: "number",
    decimal: "number",
  };
  const mode = modeAliases[rawMode] || rawMode;
  const config = definition?.config ?? {};
  const safeOptions = Array.isArray(options) ? options : [];

  const safeValue =
    value && typeof value === "object"
      ? value
      : emptyResponse(definition);

  const optionLabel = (option: Option) => (
    <Content content={option?.content} />
  );

  /* SELECT ONE */

  if (
    [
      "select_one",
      "number_choice",
      "math_choice",
      "diagram_select",
    ].includes(mode)
  ) {
    return (
      <FormControl fullWidth>
        <RadioGroup
          value={safeValue.optionId ?? ""}
          onChange={(event) =>
            onChange({ optionId: event.target.value })
          }
        >
          <Stack spacing={1}>
            {safeOptions.map((option, index) => {
              const selected =
                safeValue.optionId === option.optionId;

              return (
                <Paper
                  key={option.optionId ?? index}
                  variant="outlined"
                  sx={{
                    ...responsePaperSx,
                    borderColor: selected ? PURPLE : "#E5E7EB",
                    backgroundColor: selected
                      ? "#FAF5FF"
                      : "#FFFFFF",
                  }}
                >
                  <FormControlLabel
                    value={option.optionId}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: PURPLE,
                          "&.Mui-checked": { color: PURPLE },
                        }}
                      />
                    }
                    label={
                      <Box
                        sx={{
                          py: 0.8,
                          pr: 1,
                          width: "100%",
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          color="text.secondary"
                        >
                          OPTION {String.fromCharCode(65 + index)}
                        </Typography>

                        {optionLabel(option)}
                      </Box>
                    }
                    sx={{
                      m: 0,
                      p: 0.75,
                      width: "100%",
                      alignItems: "center",
                    }}
                  />
                </Paper>
              );
            })}
          </Stack>
        </RadioGroup>
      </FormControl>
    );
  }

  /* SELECT MANY */

  if (mode === "select_many") {
    const selected: string[] = Array.isArray(
      safeValue.optionIds
    )
      ? safeValue.optionIds
      : [];

    return (
      <Stack spacing={1}>
        {safeOptions.map((option, index) => {
          const checked = selected.includes(option.optionId);

          return (
            <Paper
              key={option.optionId ?? index}
              variant="outlined"
              onClick={() => {
                const updated = checked
                  ? selected.filter((id) => id !== option.optionId)
                  : [...selected, option.optionId];

                onChange({ optionIds: updated });
              }}
              sx={{
                ...responsePaperSx,
                p: 1.3,
                cursor: "pointer",
                borderColor: checked ? PURPLE : "#E5E7EB",
                backgroundColor: checked
                  ? "#FAF5FF"
                  : "#FFFFFF",
              }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  aria-label={`Option ${index + 1}`}
                  style={{
                    width: 17,
                    height: 17,
                    accentColor: PURPLE,
                    flexShrink: 0,
                  }}
                />

                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    color="text.secondary"
                  >
                    OPTION {String.fromCharCode(65 + index)}
                  </Typography>

                  {optionLabel(option)}
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  /* FILL BLANKS */

  if (mode === "fill_blanks") {
    const blankIds: string[] =
      config.blankIds ??
      config.blanks?.map((blank: any, index: number) =>
        typeof blank === "string"
          ? blank
          : String(blank.blankId ?? blank.id ?? index)
      ) ??
      [];

    const blanks = safeValue.blanks ?? {};

    return (
      <Stack spacing={1.2}>
        {blankIds.map((blankId, index) => (
          <Box key={blankId}>
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              mb={0.5}
              display="block"
            >
              BLANK {index + 1}
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder={`Enter answer ${index + 1}`}
              value={blanks[blankId] ?? ""}
              onChange={(event) =>
                onChange({
                  blanks: {
                    ...blanks,
                    [blankId]: event.target.value,
                  },
                })
              }
            />
          </Box>
        ))}
      </Stack>
    );
  }

  /* MATCHING */

  if (mode === "matching") {
    const leftItems = Array.isArray(config.leftItems)
      ? config.leftItems
      : [];

    const rightItems = Array.isArray(config.rightItems)
      ? config.rightItems
      : [];

    const matches = safeValue.matches ?? {};

    return (
      <Stack spacing={1}>
        {leftItems.map((item: any, index: number) => {
          const leftId = String(
            item?.id ??
              item?.itemId ??
              item?.leftId ??
              `left-${index}`
          );

          return (
            <Paper
              key={leftId}
              variant="outlined"
              sx={{
                ...responsePaperSx,
                p: 1.3,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                mb={1}
              >
                <Box
                  sx={{
                    width: 27,
                    height: 27,
                    borderRadius: 1.5,
                    backgroundColor: LIGHT_PURPLE,
                    color: PURPLE,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>

                <Box flex={1} minWidth={0}>
                  <RichValue
                    value={getDisplayValue(
                      item,
                      `Item ${index + 1}`
                    )}
                  />
                </Box>
              </Stack>

              <TextField
                select
                fullWidth
                size="small"
                label="Matching item"
                value={matches[leftId] ?? ""}
                onChange={(event) =>
                  onChange({
                    matches: {
                      ...matches,
                      [leftId]: event.target.value,
                    },
                  })
                }
              >
                <MenuItem value="">Choose an answer</MenuItem>

                {rightItems.map(
                  (right: any, rightIndex: number) => {
                    const rightId = String(
                      right?.id ??
                        right?.itemId ??
                        right?.rightId ??
                        `right-${rightIndex}`
                    );

                    return (
                      <MenuItem key={rightId} value={rightId}>
                        <RichValue
                          value={getDisplayValue(
                            right,
                            `Option ${rightIndex + 1}`
                          )}
                        />
                      </MenuItem>
                    );
                  }
                )}
              </TextField>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  /* ORDERING */

  if (mode === "ordering") {
    const items = Array.isArray(config.items)
      ? config.items
      : safeOptions;

    const itemIds = items.map((item: any, index: number) =>
      typeof item === "string"
        ? item
        : String(
            item?.itemId ??
              item?.id ??
              item?.optionId ??
              `item-${index}`
          )
    );

    const savedOrder: string[] = Array.isArray(safeValue.order)
      ? safeValue.order
      : [];

    const validOrder = savedOrder.filter((id) =>
      itemIds.includes(id)
    );

    const currentOrder = [
      ...validOrder,
      ...itemIds.filter((id:string) => !validOrder.includes(id)),
    ];

    const moveItem = (index: number, direction: number) => {
      const target = index + direction;

      if (target < 0 || target >= currentOrder.length) return;

      const updated = [...currentOrder];

      [updated[index], updated[target]] = [
        updated[target],
        updated[index],
      ];

      onChange({ order: updated });
    };

    return (
      <Stack spacing={1}>
        <Alert severity="info" sx={{ py: 0, borderRadius: 2 }}>
          Arrange the items in the correct order.
        </Alert>

        {currentOrder.map((id, index) => {
          const itemIndex = itemIds.indexOf(id);
          const item = items[itemIndex];

          return (
            <Paper
              key={id}
              variant="outlined"
              sx={{
                ...responsePaperSx,
                p: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1.5,
                  backgroundColor: LIGHT_PURPLE,
                  color: PURPLE,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </Box>

              <Box flex={1} minWidth={0}>
                <RichValue
                  value={
                    typeof item === "string"
                      ? item
                      : getDisplayValue(item, `Item ${itemIndex + 1}`)
                  }
                />
              </Box>

              <Stack spacing={0}>
                <IconButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                >
                  <ExpandLessRounded fontSize="small" />
                </IconButton>

                <IconButton
                  size="small"
                  disabled={index === currentOrder.length - 1}
                  onClick={() => moveItem(index, 1)}
                >
                  <ExpandMoreRounded fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  /* WORD BANK */

  if (mode === "word_bank") {
    const selected: string[] = Array.isArray(safeValue.words)
      ? safeValue.words
      : [];

    return (
      <Stack spacing={1}>
        {safeOptions.map((option, index) => {
          const checked = selected.includes(option.optionId);

          return (
            <Paper
              key={option.optionId ?? index}
              variant="outlined"
              onClick={() => {
                const updated = checked
                  ? selected.filter((id) => id !== option.optionId)
                  : [...selected, option.optionId];

                onChange({ words: updated });
              }}
              sx={{
                ...responsePaperSx,
                p: 1.3,
                cursor: "pointer",
                borderColor: checked ? PURPLE : "#E5E7EB",
                backgroundColor: checked ? "#FAF5FF" : "#FFFFFF",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  style={{
                    accentColor: PURPLE,
                    width: 17,
                    height: 17,
                  }}
                />

                <Box flex={1}>{optionLabel(option)}</Box>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    );
  }

  /* TEXT / NUMBER / MATH / DRAWING */

  if (
    [
      "short_text",
      "long_text",
      "math_builder",
      "number",
      "diagram_label",
      "drawing",
      "oral",
    ].includes(mode)
  ) {
    const isLong =
      mode === "long_text" || mode === "drawing";

    return (
      <Stack spacing={1}>
        {mode === "math_builder" && (
          <Alert severity="info" sx={{ py: 0, borderRadius: 2 }}>
            Write your mathematical answer clearly.
          </Alert>
        )}

        <TextField
          fullWidth
          disabled={false}
          autoComplete="off"
          multiline={isLong}
          minRows={isLong ? 4 : 2}
          maxRows={isLong ? 10 : 4}
          type={mode === "number" ? "number" : "text"}
          placeholder={
            mode === "math_builder"
              ? "Write your mathematical answer..."
              : mode === "number"
                ? "Enter your answer..."
                : "Write your answer here..."
          }
          value={String(safeValue.content ?? "")}
          onChange={(event) =>
            onChange({ content: event.target.value })
          }
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          inputProps={{
            readOnly: false,
            "aria-label": "Your answer",
          }}
          sx={{
            width: "100%",
            userSelect: "text",
            WebkitUserSelect: "text",
            pointerEvents: "auto",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#FFFFFF",
              pointerEvents: "auto",
            },
            "& .MuiInputBase-input, & textarea": {
              userSelect: "text !important",
              WebkitUserSelect: "text !important",
              pointerEvents: "auto",
              cursor: "text",
            },
          }}
        />
      </Stack>
    );
  }

  if (mode === "file_upload") {
    return (
      <Alert severity="info">
        File upload is not enabled in this exam interface yet.
      </Alert>
    );
  }

  // Unknown/legacy response modes are treated as free-text rather than
  // leaving students with no usable answer control.
  return (
    <TextField
      fullWidth
      multiline
      minRows={4}
      maxRows={10}
      autoComplete="off"
      placeholder="Write your answer here..."
      value={String(safeValue.content ?? "")}
      onChange={(event) => onChange({ content: event.target.value })}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      inputProps={{ readOnly: false, "aria-label": "Your answer" }}
      sx={{
        width: "100%",
        userSelect: "text",
        WebkitUserSelect: "text",
        pointerEvents: "auto",
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          backgroundColor: "#FFFFFF",
          pointerEvents: "auto",
        },
        "& .MuiInputBase-input, & textarea": {
          userSelect: "text !important",
          WebkitUserSelect: "text !important",
          pointerEvents: "auto",
          cursor: "text",
        },
      }}
    />
  );
}

/* =========================================================
   STEPWISE QUESTION
========================================================= */

function StepwiseQuestion({
  steps,
  answer,
  onChange,
}: {
  steps: ExamStep[];
  answer: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const stepAnswers = answer?.steps ?? {};
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const firstPending = sortedSteps.find(
    (step) => isEmpty(stepAnswers[step.stepId])
  );
  const [activeStepId, setActiveStepId] = useState<string | null>(
    firstPending?.stepId ?? sortedSteps[0]?.stepId ?? null
  );

  // If the active step no longer exists (for example, a changed question),
  // fall back to the first pending step without touching saved answers.
  useEffect(() => {
    if (
      activeStepId &&
      !steps.some((step) => step.stepId === activeStepId)
    ) {
      setActiveStepId(firstPending?.stepId ?? sortedSteps[0]?.stepId ?? null);
    }
  }, [activeStepId, steps, firstPending?.stepId]);

  const completedCount = sortedSteps.filter(
    (step) => !isEmpty(stepAnswers[step.stepId])
  ).length;

  return (
    <Stack spacing={1.25}>
      <Paper
        variant="outlined"
        sx={{
          p: 1.3,
          borderRadius: 2.5,
          borderColor: "#DDD6FE",
          background: "linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.8}>
          <Box>
            <Typography fontWeight={900} fontSize={13} color={DARK}>
              Solve step by step
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your previous answers stay visible when a step is collapsed.
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${completedCount}/${sortedSteps.length} done`}
            sx={{
              fontWeight: 900,
              color: PURPLE,
              backgroundColor: "#EDE9FE",
            }}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={sortedSteps.length ? (completedCount / sortedSteps.length) * 100 : 0}
          sx={{
            height: 5,
            borderRadius: 5,
            backgroundColor: "#EDE9FE",
            "& .MuiLinearProgress-bar": { backgroundColor: PURPLE },
          }}
        />
      </Paper>

      {sortedSteps.map((step, index) => {
        const stepAnswer = stepAnswers[step.stepId];
        const stepAnswered = !isEmpty(stepAnswer);
        const expanded = activeStepId === step.stepId;
        const preview = getStepAnswerPreview(stepAnswer, step.options);
        const selectedOption = step.options?.find(
          (option) => option.optionId === stepAnswer?.optionId
        );
        const isLast = index === sortedSteps.length - 1;

        return (
          <Paper
            key={step.stepId}
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              borderColor: expanded ? "#A78BFA" : stepAnswered ? "#BBF7D0" : "#E5E7EB",
              borderWidth: expanded ? 2 : 1,
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              transition: "border-color 0.15s ease",
            }}
          >
            <Box
              component="button"
              type="button"
              aria-expanded={expanded}
              onClick={() => setActiveStepId(expanded ? null : step.stepId)}
              sx={{
                width: "100%",
                border: 0,
                textAlign: "left",
                cursor: "pointer",
                px: { xs: 1.2, sm: 1.5 },
                py: 1.2,
                display: "flex",
                alignItems: "flex-start",
                gap: 1.1,
                backgroundColor: expanded ? "#FAF5FF" : stepAnswered ? "#F0FDF4" : "#F8FAFC",
                color: "inherit",
                font: "inherit",
              }}
            >
              <Box
                sx={{
                  width: 31,
                  height: 31,
                  borderRadius: 1.5,
                  backgroundColor: stepAnswered ? "#16A34A" : expanded ? PURPLE : "#EDE9FE",
                  color: stepAnswered || expanded ? "#FFFFFF" : PURPLE,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {stepAnswered ? <CheckCircleRounded sx={{ fontSize: 18 }} /> : index + 1}
              </Box>

              <Box flex={1} minWidth={0}>
                <Stack direction="row" alignItems="center" spacing={0.7} flexWrap="wrap">
                  <Typography fontWeight={900} fontSize={14} component="span">
                    <RichValue value={step.title || `Step ${index + 1}`} />
                  </Typography>
                  <Chip
                    size="small"
                    label={stepAnswered ? "Answered" : "Pending"}
                    sx={{
                      height: 20,
                      fontSize: 9,
                      fontWeight: 900,
                      backgroundColor: stepAnswered ? "#DCFCE7" : "#F3F4F6",
                      color: stepAnswered ? "#15803D" : "#64748B",
                    }}
                  />
                </Stack>
                {step.instruction && (
                  <Box sx={{ mt: 0.35, fontSize: 12, lineHeight: 1.55, color: "text.secondary" }}>
                    <RichValue value={step.instruction} />
                  </Box>
                )}
                {!expanded && (
                  <Box
                    sx={{
                      mt: 0.65,
                      px: 1,
                      py: 0.65,
                      borderRadius: 1.5,
                      backgroundColor: stepAnswered ? "#FFFFFF" : "#F1F5F9",
                      border: "1px solid",
                      borderColor: stepAnswered ? "#DCFCE7" : "#E2E8F0",
                    }}
                  >
                    <Typography
                      component="div"
                      sx={{
                        fontSize: 12,
                        color: stepAnswered ? "#166534" : "#64748B",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {selectedOption ? (
                        <Content content={selectedOption.content} />
                      ) : (
                        preview
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
              {expanded ? <ExpandLessRounded sx={{ mt: 0.4 }} /> : <ExpandMoreRounded sx={{ mt: 0.4 }} />}
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
              <Box sx={{ p: { xs: 1.2, sm: 1.6 }, borderTop: "1px solid #E5E7EB" }}>
                <Typography
                  variant="overline"
                  sx={{ display: "block", mb: 0.7, color: PURPLE, fontWeight: 900, letterSpacing: 0.8, fontSize: 10 }}
                >
                  YOUR ANSWER
                </Typography>
                <ResponseInput
                  definition={step.response}
                  options={step.options}
                  value={stepAnswer ?? emptyResponse(step.response)}
                  onChange={(updated) =>
                    onChange({
                      steps: {
                        ...stepAnswers,
                        [step.stepId]: updated,
                      },
                    })
                  }
                />
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} mt={1.5}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setActiveStepId(null)}
                    sx={{ textTransform: "none", fontWeight: 800, color: "text.secondary" }}
                  >
                    Collapse
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={isLast ? <CheckCircleRounded /> : <NavigateNextRounded />}
                    onClick={() => {
                      const nextStep = sortedSteps[index + 1];
                      setActiveStepId(nextStep?.stepId ?? null);
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 900,
                      borderRadius: 1.5,
                      backgroundColor: PURPLE,
                      boxShadow: "none",
                      "&:hover": { backgroundColor: PURPLE_DARK, boxShadow: "none" },
                    }}
                  >
                    {isLast ? "Review steps" : "Save & next step"}
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
}

/* =========================================================
   PARTS QUESTION
========================================================= */

function PartsQuestion({
  parts,
  answer,
  onChange,
}: {
  parts: ExamPart[];
  answer: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const partAnswers = answer?.parts ?? {};

  const sortedParts = [...parts].sort(
    (a, b) => a.order - b.order
  );

  return (
    <Stack spacing={1.5}>
      {sortedParts.map((part, index) => {
        const currentAnswer = partAnswers[part.partId] ?? {};

        return (
          <Paper
            key={part.partId}
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              borderColor: "#E5E7EB",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1.1,
                backgroundColor: "#F8FAFC",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <Chip
                size="small"
                label={`PART ${String.fromCharCode(65 + index)}`}
                sx={{
                  height: 25,
                  fontWeight: 900,
                  color: PURPLE,
                  backgroundColor: LIGHT_PURPLE,
                }}
              />
            </Box>

            <Box sx={{ p: { xs: 1.4, sm: 1.8 } }}>
              {part.prompt?.length > 0 && (
                <Box mb={1.5}>
                  <Content content={part.prompt} />
                </Box>
              )}

              {part.steps?.length ? (
                <StepwiseQuestion
                  steps={part.steps}
                  answer={currentAnswer}
                  onChange={(updated) =>
                    onChange({
                      parts: {
                        ...partAnswers,
                        [part.partId]: updated,
                      },
                    })
                  }
                />
              ) : (
                <ResponseInput
                  definition={part.response}
                  options={part.options}
                  value={
                    currentAnswer &&
                    typeof currentAnswer === "object"
                      ? currentAnswer
                      : emptyResponse(part.response)
                  }
                  onChange={(updated) =>
                    onChange({
                      parts: {
                        ...partAnswers,
                        [part.partId]: updated,
                      },
                    })
                  }
                />
              )}
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
}

/* =========================================================
   QUESTION NUMBER
========================================================= */

function QuestionNumber({
  index,
  active,
  answered,
  onClick,
  dark = false,
}: {
  index: number;
  active: boolean;
  answered: boolean;
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <Tooltip
      title={`Question ${index + 1} ${
        answered ? "• Answered" : "• Not answered"
      }`}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Go to question ${index + 1}`}
        onClick={onClick}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            onClick();
          }
        }}
        sx={{
          aspectRatio: "1",
          display: "grid",
          placeItems: "center",
          borderRadius: 1.5,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 900,
          userSelect: "none",
          color:
            active || answered
              ? "#FFFFFF"
              : dark
                ? "#FFFFFF"
                : DARK,
          backgroundColor: active
            ? dark
              ? "#8B5CF6"
              : PURPLE
            : answered
              ? dark
                ? "#15803D"
                : "#16A34A"
              : dark
                ? "#343951"
                : "#F3F4F6",
          border: active
            ? "2px solid #C4B5FD"
            : "2px solid transparent",
          "&:hover": {
            filter: "brightness(1.12)",
          },
          "&:focus-visible": {
            outline: `2px solid ${PURPLE}`,
            outlineOffset: 2,
          },
        }}
      >
        {index + 1}
      </Box>
    </Tooltip>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function StudentExamPage() {
  const router = useRouter();

  const [exam, setExam] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, AnswerValue>
  >({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [tabWarning, setTabWarning] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenRequired, setFullscreenRequired] = useState(true);

  const answersRef = useRef<Record<string, AnswerValue>>({});
  const submitGuard = useRef(false);
  const timerFrozenRef = useRef(false);
  const remainingTimeAtSubmitRef = useRef<number | null>(null);
  const tabSwitchCount = useRef(0);
  const lastVisibilityState = useRef(false);

  /* =======================================================
     LOAD EXAM
  ======================================================= */

  useEffect(() => {
    try {
      const storedExam = sessionStorage.getItem(EXAM_KEY);

      if (!storedExam) {
        setError("No active exam found. Please start your exam again.");
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(storedExam);

      const loadedExam: ExamData = {
        ...parsed,
        questions: Array.isArray(parsed.questions)
          ? parsed.questions
          : [],
      };

      if (
        !loadedExam.examId ||
        !loadedExam.questions.length
      ) {
        setError("The exam data is invalid or incomplete.");
        setLoading(false);
        return;
      }

      const savedAnswers = sessionStorage.getItem(ANSWERS_KEY);
      const parsedAnswers = savedAnswers
        ? JSON.parse(savedAnswers)
        : {};

      answersRef.current =
        parsedAnswers &&
        typeof parsedAnswers === "object"
          ? parsedAnswers
          : {};

      setAnswers(answersRef.current);
      setExam(loadedExam);

      let endTime = Number(
        sessionStorage.getItem(END_TIME_KEY)
      );

      if (!endTime || Number.isNaN(endTime)) {
        endTime = loadedExam.endTime
          ? new Date(loadedExam.endTime).getTime()
          : Date.now() + (loadedExam.durationSec ?? 0) * 1000;

        sessionStorage.setItem(
          END_TIME_KEY,
          String(endTime)
        );
      }

      setTimeLeft(
        Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      );
    } catch (err) {
      console.error("Exam loading error:", err);
      setError("Unable to load exam data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const questions = exam?.questions ?? [];
  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(() => {
    if (!exam) return 0;

    return exam.questions.filter((question) =>
      isQuestionAnswered(
        question,
        answers[question._id]
      )
    ).length;
  }, [exam, answers]);

  const unansweredCount = Math.max(
    0,
    questions.length - answeredCount
  );

  const progress = questions.length
    ? (answeredCount / questions.length) * 100
    : 0;

  const currentAnswer = currentQuestion
    ? answers[currentQuestion._id] ??
      emptyQuestionResponse(currentQuestion)
    : {};

  const currentAnswered = currentQuestion
    ? isQuestionAnswered(
        currentQuestion,
        answers[currentQuestion._id]
      )
    : false;

  /* =======================================================
     SAVE ANSWER
  ======================================================= */

  const saveAnswer = useCallback(
    (questionId: string, updatedAnswer: AnswerValue) => {
      if (submitGuard.current) return;

      const updated = {
        ...answersRef.current,
        [questionId]: updatedAnswer,
      };

      answersRef.current = updated;
      setAnswers(updated);

      try {
        sessionStorage.setItem(
          ANSWERS_KEY,
          JSON.stringify(updated)
        );
      } catch (err) {
        console.error("Unable to save exam answer:", err);
      }
    },
    []
  );

  /* =======================================================
     SUBMIT EXAM
  ======================================================= */

  const submitExam = useCallback(
    async (automatic = false) => {
      // Ref guard is synchronous: it blocks rapid clicks before React rerenders.
      if (!exam || submitGuard.current) return;

      submitGuard.current = true;
      timerFrozenRef.current = true;

      // Freeze the remaining time exactly once. If the request fails after the
      // server saved the record, retry with the same time and same answers.
      if (remainingTimeAtSubmitRef.current === null) {
        const endTime = Number(
          sessionStorage.getItem(END_TIME_KEY)
        );

        const remainingTime = endTime
          ? Math.max(
              0,
              Math.floor((endTime - Date.now()) / 1000)
            )
          : 0;

        remainingTimeAtSubmitRef.current = remainingTime;
        setTimeLeft(remainingTime);
      }

      setSubmitting(true);
      setError("");
      setTabWarning(false);
      setNavigatorOpen(false);

      try {
        const payload = {
          examId: exam.examId,
          examResponses: exam.questions.map((question) => ({
            questionDocumentId: question._id,
            questionId: question.questionId,
            version: question.version,
            setId: question.setId ?? null,
            response:
              answersRef.current[question._id] ??
              emptyQuestionResponse(question),
          })),
          automatic,
          timeLeft: remainingTimeAtSubmitRef.current,
        };

        const response = await fetch("/api/Submit-Exam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify(payload),
        });

        // Read response defensively. A proxy/network error can return an empty
        // or non-JSON body even when the database write has already succeeded.
        const result = await response.json().catch(() => null);

        if (
          result?.success === true ||
          result?.alreadySubmitted === true
        ) {
          sessionStorage.removeItem(EXAM_KEY);
          sessionStorage.removeItem(ANSWERS_KEY);
          sessionStorage.removeItem(END_TIME_KEY);
          window.location.replace(START_EXAM_ROUTE);
          return;
        }

        const message =
          result?.message ||
          (response.status
            ? `Submission could not be confirmed (HTTP ${response.status}). Please retry.`
            : "Submission could not be confirmed. Please retry.");

        throw new Error(message);
      } catch (err: any) {
        console.error("Exam submission error:", err);

        // Keep timerFrozenRef and remainingTimeAtSubmitRef unchanged. The
        // student can retry without losing time or changing the submitted data.
        submitGuard.current = false;
        setSubmitting(false);
        setError(
          err?.message ||
            "Submission could not be confirmed. Please retry."
        );
      }
    },
    [exam]
  );

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (!exam || submitting || timerFrozenRef.current) return;

    const interval = window.setInterval(() => {
      const endTime = Number(
        sessionStorage.getItem(END_TIME_KEY)
      );

      if (!endTime || submitGuard.current || timerFrozenRef.current) return;

      const remaining = Math.max(
        0,
        Math.floor((endTime - Date.now()) / 1000)
      );

      setTimeLeft(remaining);

      if (remaining <= 0) {
        window.clearInterval(interval);
        submitExam(true);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [exam, submitting, submitExam]);

  /* =======================================================
     TAB SWITCH DETECTION
  ======================================================= */

  useEffect(() => {
    const handleVisibilityChange = () => {
      const hidden = document.visibilityState === "hidden";

      if (
        hidden &&
        !lastVisibilityState.current &&
        !submitGuard.current
      ) {
        tabSwitchCount.current += 1;

        if (tabSwitchCount.current === 1) {
          setTabWarning(true);
        } else {
          submitExam(true);
        }
      }

      lastVisibilityState.current = hidden;
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [submitExam]);

  /* =======================================================
     PREVENT ACCIDENTAL REFRESH
  ======================================================= */

  useEffect(() => {
    const handleBeforeUnload = (
      event: BeforeUnloadEvent
    ) => {
      if (!submitGuard.current && exam) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [exam]);

  /* =======================================================
     FULLSCREEN
  ======================================================= */

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      setFullscreenRequired(false);
    } catch (err) {
      console.error("Fullscreen request failed:", err);
      setError(
        "Fullscreen could not be enabled. Please allow fullscreen in your browser and try again."
      );
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);

      setIsFullscreen(active);

      if (!active && exam && !submitting) {
        setFullscreenRequired(true);
      } else if (active) {
        setFullscreenRequired(false);
      }
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, [exam, submitting]);

  /* =======================================================
     QUESTION NAVIGATION
  ======================================================= */

  const goToQuestion = (index: number) => {
    if (submitting || index < 0 || index >= questions.length) return;

    setCurrentIndex(index);
    setNavigatorOpen(false);
  };

  const nextQuestion = () => {
    goToQuestion(currentIndex + 1);
  };

  const previousQuestion = () => {
    goToQuestion(currentIndex - 1);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1500,
          display: "grid",
          placeItems: "center",
          backgroundColor: BACKGROUND,
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress sx={{ color: PURPLE }} />

          <Typography fontWeight={800} color="text.secondary">
            Preparing your examination...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* =======================================================
     INVALID EXAM
  ======================================================= */

  if (!exam || !currentQuestion) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 1500,
          display: "grid",
          placeItems: "center",
          backgroundColor: BACKGROUND,
          p: 2,
        }}
      >
        <Paper
          sx={{
            maxWidth: 420,
            width: "100%",
            p: 3,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <WarningAmberRounded
            sx={{ fontSize: 46, color: "#DC2626", mb: 1 }}
          />

          <Typography fontWeight={900} fontSize={20} mb={1}>
            Unable to open examination
          </Typography>

          <Typography color="text.secondary" mb={2.5}>
            {error || "No active exam was found."}
          </Typography>

          <Button
            variant="contained"
            onClick={() =>
              router.replace(START_EXAM_ROUTE)
            }
            sx={{
              backgroundColor: PURPLE,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Return to exams
          </Button>
        </Paper>
      </Box>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: BACKGROUND,
        display: "flex",
        flexDirection: "column",
        color: DARK,
        userSelect: "text",
        WebkitUserSelect: "text",
        // Keep form controls interactive even inside the fullscreen exam shell.
        "& .MuiInputBase-root": {
          pointerEvents: "auto",
        },
        "& .MuiInputBase-input, & .MuiSelect-select, & textarea, & input": {
          userSelect: "text !important",
          WebkitUserSelect: "text !important",
          pointerEvents: "auto",
        },
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          flexShrink: 0,
          minHeight: { xs: 54, sm: 58 },
          px: { xs: 1.2, sm: 2 },
          py: 0.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          gap: 1,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ minWidth: 0, flex: 1 }}
        >
          <Box
            component="img"
            src="/images/logos/Innovative_Academy_Logo_icon.png"
            alt="Innovative Academy"
            sx={{
              width: 31,
              height: 31,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />

          <Box minWidth={0}>
            <Typography
              fontWeight={900}
              fontSize={{ xs: 12, sm: 14 }}
              noWrap
            >
              {exam.title}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                display: "block",
                fontSize: 10,
              }}
            >
              {exam.course}
              {exam.subject ? ` • ${exam.subject}` : ""}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.7}
        >
          <Chip
            icon={<ScheduleRounded />}
            label={formatTime(timeLeft)}
            sx={{
              height: 32,
              fontWeight: 900,
              fontSize: 13,
              color: timeLeft <= 300 ? "#DC2626" : PURPLE,
              backgroundColor:
                timeLeft <= 300 ? "#FEF2F2" : LIGHT_PURPLE,
              "& .MuiChip-icon": {
                color: "inherit",
                fontSize: 17,
              },
            }}
          />

          <Tooltip title="Fullscreen">
            <IconButton
              onClick={enterFullscreen}
              size="small"
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 1.5,
                display: { xs: "none", md: "inline-flex" },
              }}
            >
              {isFullscreen ? (
                <FullscreenExitRounded fontSize="small" />
              ) : (
                <FullscreenRounded fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Button
            onClick={() => setNavigatorOpen(true)}
            startIcon={<MenuRounded />}
            sx={{
              display: { xs: "none", sm: "inline-flex", md: "none" },
              minWidth: "auto",
              px: 0.7,
              color: DARK,
              fontSize: 12,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Questions
          </Button>

        </Stack>
      </Box>

      {/* MOBILE PROGRESS */}

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          px: 1.5,
          py: 0.8,
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          mb={0.5}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={800}>
            QUESTION {currentIndex + 1} OF {questions.length}
          </Typography>

          <Typography variant="caption" fontWeight={800} color={PURPLE}>
            {answeredCount} answered · {unansweredCount} left
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            borderRadius: 5,
            backgroundColor: "#EDE9FE",
            "& .MuiLinearProgress-bar": {
              backgroundColor: PURPLE,
            },
          }}
        />
      </Box>

      {/* BODY */}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: 1.2,
          p: { xs: 0, sm: 1, lg: 1.2 },
          overflow: "hidden",
        }}
      >
        {/* QUESTION WORKSPACE */}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
            borderRadius: { xs: 0, sm: 2.5 },
            border: { xs: 0, sm: "1px solid #E5E7EB" },
            overflow: "hidden",
          }}
        >
          {/* QUESTION HEADER */}

          <Box
            sx={{
              px: { xs: 1.5, sm: 2 },
              py: 1,
              borderBottom: "1px solid #E5E7EB",
              flexShrink: 0,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                minWidth={0}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 1.5,
                    backgroundColor: LIGHT_PURPLE,
                    color: PURPLE,
                    fontWeight: 900,
                    fontSize: 14,
                  }}
                >
                  {currentIndex + 1}
                </Box>

                <Box minWidth={0}>
                  <Typography fontWeight={900} fontSize={14}>
                    Question {currentIndex + 1}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    fontSize={10}
                  >
                    {currentQuestion.category ||
                      currentQuestion.type ||
                      "Question"}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                spacing={0.6}
              >
                <Chip
                  size="small"
                  label={`${currentQuestion.marks} ${
                    currentQuestion.marks === 1 ? "Mark" : "Marks"
                  }`}
                  sx={{
                    height: 24,
                    backgroundColor: "#F3F4F6",
                    fontWeight: 800,
                    fontSize: 10,
                  }}
                />

                <Chip
                  size="small"
                  icon={
                    currentAnswered ? (
                      <CheckCircleRounded />
                    ) : undefined
                  }
                  label={currentAnswered ? "Answered" : "Pending"}
                  sx={{
                    height: 24,
                    display: { xs: "none", sm: "inline-flex" },
                    backgroundColor: currentAnswered
                      ? "#DCFCE7"
                      : "#F3F4F6",
                    color: currentAnswered
                      ? "#15803D"
                      : "#64748B",
                    fontWeight: 800,
                    fontSize: 10,
                    "& .MuiChip-icon": {
                      color: "inherit",
                      fontSize: 14,
                    },
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          {/* QUESTION SCROLL AREA */}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: { xs: 1.5, sm: 2, md: 2.5 },
              py: { xs: 1.3, sm: 1.7 },
              "&::-webkit-scrollbar": {
                width: 5,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#D1D5DB",
                borderRadius: 5,
              },
            }}
          >
            {/* QUESTION PROMPT */}

            <Box mb={1.6}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.8}
                mb={0.8}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: PURPLE,
                  }}
                />

                <Typography
                  variant="overline"
                  fontWeight={900}
                  color={PURPLE}
                  letterSpacing={1}
                  fontSize={10}
                >
                  QUESTION
                </Typography>
              </Stack>

              <Content content={currentQuestion.prompt} />
            </Box>

            <Divider sx={{ mb: 1.6 }} />

            {/* ANSWER AREA */}

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1.2}
              >
                <Typography fontWeight={900} fontSize={15}>
                  Your answer
                </Typography>

                <Chip
                  size="small"
                  icon={<CheckCircleRounded />}
                  label="Auto-saved"
                  sx={{
                    height: 23,
                    backgroundColor: "#F0FDF4",
                    color: "#15803D",
                    fontWeight: 700,
                    fontSize: 10,
                    "& .MuiChip-icon": {
                      color: "#15803D",
                      fontSize: 14,
                    },
                  }}
                />
              </Stack>

              {currentQuestion.parts?.length ? (
                <PartsQuestion
                  key={currentQuestion._id}
                  parts={currentQuestion.parts}
                  answer={currentAnswer}
                  onChange={(updated) =>
                    saveAnswer(currentQuestion._id, updated)
                  }
                />
              ) : currentQuestion.steps?.length ? (
                <StepwiseQuestion
                  key={currentQuestion._id}
                  steps={currentQuestion.steps}
                  answer={currentAnswer}
                  onChange={(updated) =>
                    saveAnswer(currentQuestion._id, updated)
                  }
                />
              ) : (
                <ResponseInput
                  definition={currentQuestion.response}
                  options={currentQuestion.options}
                  value={currentAnswer}
                  onChange={(updated) =>
                    saveAnswer(currentQuestion._id, updated)
                  }
                />
              )}
            </Box>
          </Box>

          {/* QUESTION FOOTER */}

          <Box
            sx={{
              flexShrink: 0,
              px: { xs: 1.2, sm: 2 },
              pt: 0.9,
              pb: { xs: "calc(8px + env(safe-area-inset-bottom))", sm: 0.9 },
              borderTop: "1px solid #E5E7EB",
              backgroundColor: "#FFFFFF",
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ mb: 1, py: 0.2, fontSize: 12 }}
              >
                {error} Your timer is paused. Use Retry submit to safely check the saved submission.
              </Alert>
            )}
           <Stack
  direction="row"
  alignItems="center"
  justifyContent="space-between"
  spacing={1}
>
  {/* PREVIOUS */}

  <Button
    variant="outlined"
    size="small"
    startIcon={<NavigateBeforeRounded />}
    disabled={currentIndex === 0 || submitting}
    onClick={previousQuestion}
    sx={{
      borderRadius: 1.5,
      textTransform: "none",
      fontWeight: 800,
      borderColor: "#D1D5DB",
      color: DARK,
      minWidth: 0,
      px: { xs: 1.5, sm: 2 },
      flex: 1,
    }}
  >
    Previous
  </Button>

  {/* QUESTION COUNTER */}

  <Typography
    variant="caption"
    color="text.secondary"
    sx={{
      display: { xs: "none", sm: "block" },
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    {currentIndex + 1} / {questions.length}
  </Typography>

  {/* NEXT OR SUBMIT */}

  {currentIndex === questions.length - 1 ? (
    <Button
      variant="contained"
      size="small"
      endIcon={
        submitting ? (
          <CircularProgress size={15} color="inherit" />
        ) : (
          <SendRounded />
        )
      }
      onClick={() => void submitExam(false)}
      disabled={submitting || submitGuard.current}
      sx={{
        backgroundColor: submitting ? "#64748B" : "#15803D",
        borderRadius: 1.5,
        textTransform: "none",
        fontWeight: 900,
        minWidth: 0,
        px: { xs: 1.5, sm: 2 },
        flex: 1,
        boxShadow: "none",
        "&:hover": {
          backgroundColor: "#166534",
          boxShadow: "none",
        },
        "&.Mui-disabled": {
          color: "#FFFFFF",
          opacity: 0.8,
        },
      }}
    >
      {submitting
        ? "Submitting..."
        : error
          ? "Retry submit"
          : "Submit exam"}
    </Button>
  ) : (
    <Button
      variant="contained"
      size="small"
      endIcon={<NavigateNextRounded />}
      onClick={nextQuestion}
      disabled={submitting}
      sx={{
        backgroundColor: PURPLE,
        borderRadius: 1.5,
        textTransform: "none",
        fontWeight: 900,
        minWidth: 0,
        px: { xs: 1.5, sm: 2 },
        flex: 1,
        boxShadow: "none",
        "&:hover": {
          backgroundColor: PURPLE_DARK,
          boxShadow: "none",
        },
      }}
    >
      Next
    </Button>
  )}
</Stack>
          </Box>
        </Box>

        {/* COMPACT DESKTOP SIDEBAR */}

        <Box
          sx={{
            width: 218,
            flexShrink: 0,
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            minHeight: 0,
            backgroundColor: DARK,
            borderRadius: 2.5,
            overflow: "hidden",
            color: "#FFFFFF",
          }}
        >
          <Box sx={{ px: 1.5, py: 1.4 }}>
            <Typography
              variant="overline"
              sx={{
                color: "#A5B4FC",
                fontWeight: 900,
                letterSpacing: 1,
                fontSize: 10,
              }}
            >
              EXAM PROGRESS
            </Typography>

            <Stack
              direction="row"
              alignItems="baseline"
              spacing={0.5}
              mt={0.3}
            >
              <Typography
                fontSize={27}
                fontWeight={900}
                color="#C4B5FD"
              >
                {answeredCount}
              </Typography>

              <Typography
                variant="caption"
                color="#A1A1AA"
              >
                / {questions.length} answered
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                mt: 0.8,
                height: 5,
                borderRadius: 5,
                backgroundColor: "#343951",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#A78BFA",
                  borderRadius: 5,
                },
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              mt={0.8}
            >
              <Typography variant="caption" color="#86EFAC">
                {answeredCount} done
              </Typography>

              <Typography variant="caption" color="#FCA5A5">
                {unansweredCount} left
              </Typography>
            </Stack>
          </Box>

          <Divider sx={{ borderColor: "#343951" }} />

          {/* QUESTION GRID */}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: 1.5,
              py: 1.3,
            }}
          >
            <Typography
              fontWeight={900}
              fontSize={11}
              mb={1.2}
              letterSpacing={0.5}
            >
              QUESTIONS
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 0.7,
              }}
            >
              {questions.map((question, index) => (
                <QuestionNumber
                  key={question._id}
                  index={index}
                  active={currentIndex === index}
                  answered={isQuestionAnswered(
                    question,
                    answers[question._id]
                  )}
                  dark
                  onClick={() => goToQuestion(index)}
                />
              ))}
            </Box>

            <Stack spacing={0.8} mt={2}>
              {[
                ["#8B5CF6", "Current"],
                ["#15803D", "Answered"],
                ["#343951", "Not answered"],
              ].map(([color, label]) => (
                <Stack
                  key={label}
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: 0.8,
                      backgroundColor: color,
                    }}
                  />

                  <Typography
                    variant="caption"
                    color="#D1D5DB"
                    fontSize={10}
                  >
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

        </Box>
      </Box>

      {/* MOBILE NAVIGATOR */}

      <Dialog
        open={navigatorOpen}
        onClose={() => setNavigatorOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.5,
          }}
        >
          <Box>
            <Typography fontWeight={900}>
              Question navigator
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {answeredCount} of {questions.length} answered
            </Typography>
          </Box>

          <IconButton onClick={() => setNavigatorOpen(false)}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              py: 0.5,
            }}
          >
            {questions.map((question, index) => (
              <QuestionNumber
                key={question._id}
                index={index}
                active={currentIndex === index}
                answered={isQuestionAnswered(
                  question,
                  answers[question._id]
                )}
                onClick={() => goToQuestion(index)}
              />
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setNavigatorOpen(false)}
            sx={{
              backgroundColor: PURPLE,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Continue exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* TAB SWITCH WARNING */}

      <Dialog
        open={tabWarning}
        onClose={() => setTabWarning(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningAmberRounded
              sx={{ fontSize: 30, color: "#D97706" }}
            />

            <Typography fontWeight={900}>
              Stay on your examination
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            fontSize={13}
            lineHeight={1.7}
          >
            You switched away from the examination window.
            Please stay on this page until your exam is completed.
          </Typography>

          <Alert severity="warning" sx={{ mt: 1.5 }}>
            Switching away again may automatically submit your exam.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setTabWarning(false)}
            sx={{
              backgroundColor: PURPLE,
              textTransform: "none",
              fontWeight: 900,
            }}
          >
            Return to examination
          </Button>
        </DialogActions>
      </Dialog>

      {/* FULLSCREEN REQUIRED OVERLAY */}

      {fullscreenRequired && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 3000,
            display: "grid",
            placeItems: "center",
            backgroundColor: "rgba(15,23,42,0.96)",
            p: 2,
          }}
        >
          <Paper
            sx={{
              width: "100%",
              maxWidth: 410,
              p: { xs: 2.5, sm: 3 },
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                mx: "auto",
                mb: 1.5,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                backgroundColor: LIGHT_PURPLE,
                color: PURPLE,
              }}
            >
              <FullscreenRounded sx={{ fontSize: 32 }} />
            </Box>

            <Typography fontWeight={900} fontSize={21} mb={1}>
              Fullscreen examination
            </Typography>

            <Typography
              color="text.secondary"
              fontSize={13}
              lineHeight={1.7}
              mb={2}
            >
              Your examination is designed for fullscreen mode.
              Enter fullscreen to continue.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 1.5, textAlign: "left" }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={enterFullscreen}
              startIcon={<FullscreenRounded />}
              sx={{
                py: 1.2,
                backgroundColor: PURPLE,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 900,
                "&:hover": {
                  backgroundColor: PURPLE_DARK,
                },
              }}
            >
              Enter fullscreen & continue
            </Button>
          </Paper>
        </Box>
      )}

      {/* SUBMISSION OVERLAY */}

      {submitting && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            pointerEvents: "auto",
            backgroundColor: "rgba(12, 16, 32, 0.96)",
            backdropFilter: "blur(8px)",
            display: "grid",
            placeItems: "center",
            p: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "min(92vw, 390px)",
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              textAlign: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
          <Stack alignItems="center" spacing={1.5}>
            <CircularProgress
              size={48}
              thickness={4}
              sx={{ color: PURPLE }}
            />

            <Typography
              fontWeight={900}
              fontSize={17}
              textAlign="center"
            >
              Submitting your examination...
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              Your answers are being securely saved. Do not close or refresh this page.
            </Typography>
          </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}