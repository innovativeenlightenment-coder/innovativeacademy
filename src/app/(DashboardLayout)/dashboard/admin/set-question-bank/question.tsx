"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import FunctionsRoundedIcon from "@mui/icons-material/FunctionsRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import ListSubheader from "@mui/material/ListSubheader";

import { MathfieldElement } from "mathlive";
import "mathlive";

import RenderMath from "@/lib/renderMaths";

import {
  LEARNING_SKILL_GROUPS,
  getLearningSkillLabel,
  type LearningSkillId,
} from "@/utils/learningSkills";

/* =========================================================
   TYPES
========================================================= */

export type ContentItem = {
  type: "text" | "image";
  value: string;
  url: string;
};

export type OptionData = {
  id: string;
  content: ContentItem[];
};

export type AnswerData = {
  content: ContentItem[];
  acceptedAnswers: string[];
};

export type StepData = {
  prompt: ContentItem[];
  answerType: "mcq" | "text";
  options: OptionData[];
  correctOptionId: string;
  answer: AnswerData;
  skills: LearningSkillId[];
};

export type QuestionFormat = "mcq" | "answer" | "steps";

export type QuestionData = {
  format: QuestionFormat;
  skills: LearningSkillId[];
  prompt: ContentItem[];
  options: OptionData[];
  correctOptionId: string;
  answer: AnswerData;
  steps: StepData[];
  explanation: ContentItem[];
  teacherChecked: boolean;
};

/* =========================================================
   HELPERS
========================================================= */

export const emptyContent = (): ContentItem[] => [
  { type: "text", value: "", url: "" },
];

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const makeOption = (): OptionData => ({
  id: makeId(),
  content: emptyContent(),
});

/**
 * Automatically collects all unique skills from stepwise questions.
 *
 * The main question skills are always the union of its step skills.
 */
export const getQuestionSkills = (
  steps: StepData[]
): LearningSkillId[] => {
  const skills = new Set<LearningSkillId>();

  (steps ?? []).forEach((step) => {
    (step.skills ?? []).forEach((skill) => {
      skills.add(skill);
    });
  });

  return Array.from(skills);
};

/* =========================================================
   EMPTY QUESTION
========================================================= */

export const createEmptyQuestion = (): QuestionData => ({
  format: "mcq",

  skills: [],

  prompt: emptyContent(),

  options: [
    { id: makeId(), content: emptyContent() },
    { id: makeId(), content: emptyContent() },
  ],

  correctOptionId: "",

  answer: {
    content: emptyContent(),
    acceptedAnswers: [],
  },

  steps: [],

  explanation: [],

  teacherChecked: false,
});

/* =========================================================
   IMAGE READER
========================================================= */

const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));

    reader.onerror = () =>
      reject(new Error("Image reading failed"));

    reader.readAsDataURL(file);
  });

/* =========================================================
   MATH FIELD EDITOR
========================================================= */

function MathFieldEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (latex: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  const fieldRef = useRef<MathfieldElement | null>(null);

  const latestOnChange = useRef(onChange);

  useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return;

    const field = new MathfieldElement();

    field.setAttribute("virtual-keyboard-mode", "onfocus");
    field.setAttribute("smart-mode", "true");
    field.setAttribute(
      "placeholder",
      "Tap here and write your equation"
    );

    field.style.display = "block";
    field.style.width = "100%";
    field.style.minHeight = "66px";
    field.style.padding = "13px";
    field.style.fontSize = "1.35rem";
    field.style.border = "1px solid #cbd5e1";
    field.style.borderRadius = "12px";
    field.style.background = "#ffffff";

    field.value = value;

    const handleInput = () => {
      latestOnChange.current(field.value);
    };

    field.addEventListener("input", handleInput);

    hostRef.current.replaceChildren(field);

    fieldRef.current = field;

    return () => {
      field.removeEventListener("input", handleInput);

      fieldRef.current = null;

      hostRef.current?.replaceChildren();
    };
  }, []);

  useEffect(() => {
    if (
      fieldRef.current &&
      fieldRef.current.value !== value
    ) {
      fieldRef.current.value = value;
    }
  }, [value]);

  const insert = (latex: string) => {
    const field = fieldRef.current;

    if (!field) return;

    field.focus();

    field.insert(latex);

    latestOnChange.current(field.value);
  };

  const tools = [
    { label: "½", latex: "\\frac{#@}{#?}" },
    { label: "x²", latex: "^{2}" },
    { label: "x³", latex: "^{3}" },
    { label: "√", latex: "\\sqrt{#@}" },
    { label: "×", latex: "\\times" },
    { label: "÷", latex: "\\div" },
    { label: "π", latex: "\\pi" },
    { label: "θ", latex: "\\theta" },
    { label: "°", latex: "^{\\circ}" },
    { label: "=", latex: "=" },
    { label: "≠", latex: "\\neq" },
    { label: "±", latex: "\\pm" },
  ];

  return (
    <Stack spacing={1}>
      <Box
        ref={hostRef}
        sx={{
          minWidth: 0,

          "& math-field": {
            color: "text.primary",
            "--hue": "258",
            "--selection-background-color": "#ddd6fe",
          },
        }}
      />

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{
            display: "block",
            mb: 0.75,
          }}
        >
          QUICK MATHS SYMBOLS
        </Typography>

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={0.75}
          useFlexGap
        >
          {tools.map((tool) => (
            <Button
              key={tool.label}
              size="small"
              variant="outlined"
              color="inherit"
              onClick={() => insert(tool.latex)}
              sx={{
                minWidth: 39,
                minHeight: 36,
                px: 1,
                borderRadius: 1.75,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {tool.label}
            </Button>
          ))}
        </Stack>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        Tap the equation area to type. On mobile, the maths
        keyboard opens when you focus it.
      </Typography>
    </Stack>
  );
}

/* =========================================================
   CONTENT EDITOR
========================================================= */

function ContentEditor({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: ContentItem[];
  onChange: (value: ContentItem[]) => void;
  compact?: boolean;
}) {
  const content = value || [];

  const isEquation = (item: ContentItem) =>
    item.type === "text" &&
    item.value.startsWith("$") &&
    item.value.endsWith("$");

  const equationValue = (item: ContentItem) =>
    item.value.startsWith("$") &&
    item.value.endsWith("$")
      ? item.value.slice(1, -1)
      : item.value;

  const updateItem = (
    index: number,
    patch: Partial<ContentItem>
  ) =>
    onChange(
      content.map((item, i) =>
        i === index
          ? { ...item, ...patch }
          : item
      )
    );

  const addText = () =>
    onChange([
      ...content,
      { type: "text", value: "", url: "" },
    ]);

  // Equations are saved as ordinary text ContentItems wrapped in $...$.
  const addEquation = () =>
    onChange([
      ...content,
      { type: "text", value: "$$", url: "" },
    ]);

  const addImage = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }

    try {
      const base64 = await readImage(file);

      onChange([
        ...content,
        {
          type: "image",
          value: "",
          url: base64,
        },
      ]);
    } catch {
      alert("Unable to read this image.");
    }
  };

  const remove = (index: number) =>
    onChange(
      content.filter((_, i) => i !== index)
    );

  return (
    <Stack spacing={1.25}>
      {label && (
        <Typography
          variant="subtitle2"
          fontWeight={800}
        >
          {label}
        </Typography>
      )}

      {content.map((item, index) => {
        const equation = isEquation(item);

        return (
          <Paper
            key={`${item.type}-${index}`}
            variant="outlined"
            sx={{
              p: compact ? 1 : 1.25,
              borderRadius: 2,

              borderColor: equation
                ? "primary.light"
                : "divider",

              bgcolor: equation
                ? "rgba(99,102,241,0.035)"
                : "background.paper",
            }}
          >
            {item.type === "image" ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
              >
                <Box
                  component="img"
                  src={item.url}
                  alt="Question attachment"
                  sx={{
                    maxWidth: 150,
                    maxHeight: 100,
                    objectFit: "contain",
                    borderRadius: 1,
                  }}
                />

                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                  >
                    Image attached
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Up to 5 MB
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => remove(index)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Chip
                    size="small"
                    color={equation ? "primary" : "default"}
                    variant={equation ? "filled" : "outlined"}
                    icon={
                      equation
                        ? <FunctionsRoundedIcon />
                        : undefined
                    }
                    label={equation ? "Equation" : "Text"}
                  />

                  <Box flex={1} />

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => remove(index)}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>

                {equation ? (
                  <>
                    <MathFieldEditor
                      key={`equation-${index}`}
                      value={equationValue(item)}
                      onChange={(latex) =>
                        updateItem(index, {
                          value: `$${latex}$`,
                        })
                      }
                    />

                    {equationValue(item).trim() && (
                      <Box
                        sx={{
                          mt: 0.5,
                          px: 1.5,
                          py: 1,
                          borderRadius: 1.5,
                          bgcolor: "background.default",
                          overflowX: "auto",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={0.5}
                        >
                          Student view
                        </Typography>

                        <RenderMath
                          text={`$${equationValue(item)}$`}
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      multiline
                      minRows={compact ? 1 : 2}
                      maxRows={8}
                      size="small"
                      placeholder="Write your text here..."
                      value={item.value}
                      onChange={(e) =>
                        updateItem(index, {
                          value: e.target.value,
                        })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />

                    {/\$[^$]+\$/.test(item.value) && (
                      <Box
                        sx={{
                          px: 1.25,
                          py: 0.75,
                          bgcolor: "background.default",
                          borderRadius: 1.5,
                          overflowX: "auto",
                        }}
                      >
                        <RenderMath text={item.value} />
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            )}
          </Paper>
        );
      })}

      <Stack
        direction="row"
        spacing={0.75}
        flexWrap="wrap"
        useFlexGap
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={addText}
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Add text
        </Button>

        <Button
          size="small"
          variant="contained"
          startIcon={<FunctionsRoundedIcon />}
          onClick={addEquation}
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Add equation
        </Button>

        <Button
          size="small"
          variant="outlined"
          component="label"
          startIcon={<ImageOutlinedIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Add image

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => {
              void addImage(e.currentTarget.files?.[0]);
              e.currentTarget.value = "";
            }}
          />
        </Button>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        Add text, equations or diagrams in the order you
        want them to appear.
      </Typography>
    </Stack>
  );
}

/* =========================================================
   OPTION EDITOR
========================================================= */

function OptionEditor({
  options,
  onChange,
  correctOptionId,
  onCorrectChange,
}: {
  options: OptionData[];
  onChange: (options: OptionData[]) => void;
  correctOptionId: string;
  onCorrectChange: (id: string) => void;
}) {
  const update = (
    id: string,
    content: ContentItem[]
  ) =>
    onChange(
      options.map((option) =>
        option.id === id
          ? { ...option, content }
          : option
      )
    );

  const remove = (id: string) => {
    onChange(
      options.filter((option) => option.id !== id)
    );

    if (correctOptionId === id) {
      onCorrectChange("");
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography fontWeight={800}>
          Answer options
        </Typography>

        <Button
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={() =>
            onChange([...options, makeOption()])
          }
        >
          Add option
        </Button>
      </Stack>

      {options.map((option, index) => (
        <Paper
          key={option.id}
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
          }}
        >
          <Stack spacing={1}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Chip
                size="small"
                label={String.fromCharCode(65 + index)}
              />

              <Box flex={1} />

              <FormControlLabel
                sx={{ mr: 0 }}
                control={
                  <Checkbox
                    size="small"
                    checked={correctOptionId === option.id}
                    onChange={() =>
                      onCorrectChange(option.id)
                    }
                  />
                }
                label={
                  <Typography variant="body2">
                    Correct
                  </Typography>
                }
              />

              <IconButton
                size="small"
                color="error"
                onClick={() => remove(option.id)}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <ContentEditor
              label=""
              value={option.content}
              onChange={(content) =>
                update(option.id, content)
              }
              compact
            />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

/* =========================================================
   ANSWER EDITOR
========================================================= */

function AnswerEditor({
  answer,
  onChange,
}: {
  answer: AnswerData;
  onChange: (answer: AnswerData) => void;
}) {
  return (
    <Stack spacing={1.5}>
      <ContentEditor
        label="Expected answer"
        value={answer.content}
        onChange={(content) =>
          onChange({
            ...answer,
            content,
          })
        }
      />

      <TextField
        fullWidth
        size="small"
        multiline
        minRows={2}
        label="Other accepted answers (optional)"
        placeholder="One accepted answer per line"
        value={(answer.acceptedAnswers ?? []).join("\n")}
        onChange={(e) =>
          onChange({
            ...answer,
            acceptedAnswers: e.target.value.split("\n"),
          })
        }
        helperText="Use this for alternative spellings or equivalent text answers."
      />
    </Stack>
  );
}

/* =========================================================
   SKILLS SELECTOR
========================================================= */

function SkillsSelector({
  value,
  onChange,
  label = "Learning skills",
}: {
  value: LearningSkillId[];
  onChange: (skills: LearningSkillId[]) => void;
  label?: string;
}) {
  const selectedSkills = value ?? [];

  const allSkills = LEARNING_SKILL_GROUPS.flatMap(
    (group) =>
      group.skills.map((skill) => ({
        ...skill,
        category: group.category,
      }))
  );

  const selectedItems = allSkills.filter((skill) =>
    selectedSkills.includes(skill.id)
  );

  const menuItems: React.ReactNode[] = [];

  // Selected skills section
  if (selectedItems.length > 0) {
    menuItems.push(
      <ListSubheader
        key="selected-heading"
        sx={{
          fontWeight: 800,
          color: "success.main",
          bgcolor: "background.paper",
        }}
      >
        SELECTED SKILLS ({selectedItems.length})
      </ListSubheader>
    );

    selectedItems.forEach((skill) => {
      menuItems.push(
        <MenuItem
          key={skill.id}
          value={skill.id}
          dense
        >
          <Checkbox
            checked
            size="small"
            sx={{
              mr: 1,
              pointerEvents: "none",
            }}
          />

          <Box flex={1} minWidth={0}>
            <Typography variant="body2">
              {skill.label}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {skill.category}
            </Typography>
          </Box>
        </MenuItem>
      );
    });
  }

  // Remaining skills grouped by category
  LEARNING_SKILL_GROUPS.forEach((group) => {
    const remainingSkills = group.skills.filter(
      (skill) => !selectedSkills.includes(skill.id)
    );

    if (remainingSkills.length === 0) return;

    menuItems.push(
      <ListSubheader
        key={`heading-${group.category}`}
        sx={{
          fontWeight: 800,
          color: "primary.main",
          bgcolor: "background.paper",
        }}
      >
        {group.category}
      </ListSubheader>
    );

    remainingSkills.forEach((skill) => {
      menuItems.push(
        <MenuItem
          key={skill.id}
          value={skill.id}
          dense
        >
          <Checkbox
            checked={false}
            size="small"
            sx={{
              mr: 1,
              pointerEvents: "none",
            }}
          />

          <Typography variant="body2">
            {skill.label}
          </Typography>
        </MenuItem>
      );
    });
  });

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>

      <Select
        multiple
        value={selectedSkills}
        label={label}
        onChange={(event) => {
          const nextValue = event.target.value;

          onChange(
            typeof nextValue === "string"
              ? (nextValue.split(",") as LearningSkillId[])
              : (nextValue as LearningSkillId[])
          );
        }}
        renderValue={(selected) => {
          const ids = selected as LearningSkillId[];

          return (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                maxHeight: 65,
                overflowY: "auto",
              }}
            >
              {ids.map((id) => (
                <Chip
                  key={id}
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={getLearningSkillLabel(id)}
                />
              ))}
            </Box>
          );
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 380,
              minWidth: 280,
            },
          },
        }}
        sx={{
          borderRadius: 2,
        }}
      >
        {menuItems}
      </Select>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5 }}
      >
        {selectedSkills.length} skills selected
      </Typography>
    </FormControl>
  );
}

/* =========================================================
   STEP EDITOR
========================================================= */

function StepEditor({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: StepData;
  index: number;
  onChange: (step: StepData) => void;
  onRemove: () => void;
}) {
  const changeType = (
    answerType: "mcq" | "text"
  ) => {
    onChange({
      ...step,

      answerType,

      options:
        answerType === "mcq"
          ? (
              step.options?.length
                ? step.options
                : [makeOption(), makeOption()]
            )
          : [],

      correctOptionId: "",

      answer: {
        content: emptyContent(),
        acceptedAnswers: [],
      },
    });
  };

  return (
    <Accordion
      defaultExpanded
      disableGutters
      variant="outlined"
      sx={{
        borderRadius: "12px !important",
        overflow: "hidden",

        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRoundedIcon />}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            width: "100%",
            pr: 1,
          }}
        >
          <Chip
            size="small"
            color="primary"
            label={`Step ${index + 1}`}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {step.answerType === "mcq"
              ? "Select an option"
              : "Type an answer"}
          </Typography>

          <Box flex={1} />

          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={2}>
          <ContentEditor
            label="Step instruction"
            value={step.prompt ?? []}
            onChange={(prompt) =>
              onChange({
                ...step,
                prompt,
              })
            }
          />

          {/* Skills belong to individual steps */}
          <SkillsSelector
            label="Skills tested in this step"
            value={step.skills ?? []}
            onChange={(skills) =>
              onChange({
                ...step,
                skills,
              })
            }
          />

          <FormControl
            size="small"
            fullWidth
          >
            <InputLabel>
              Student response
            </InputLabel>

            <Select
              label="Student response"
              value={step.answerType}
              onChange={(e) =>
                changeType(
                  e.target.value as "mcq" | "text"
                )
              }
            >
              <MenuItem value="text">
                Type an answer
              </MenuItem>

              <MenuItem value="mcq">
                Select an option
              </MenuItem>
            </Select>
          </FormControl>

          {step.answerType === "mcq" ? (
            <OptionEditor
              options={step.options ?? []}
              onChange={(options) =>
                onChange({
                  ...step,
                  options,
                })
              }
              correctOptionId={step.correctOptionId}
              onCorrectChange={(correctOptionId) =>
                onChange({
                  ...step,
                  correctOptionId,
                })
              }
            />
          ) : (
            <AnswerEditor
              answer={step.answer}
              onChange={(answer) =>
                onChange({
                  ...step,
                  answer,
                })
              }
            />
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

/* =========================================================
   MAIN QUESTION EDITOR
========================================================= */

export default function SetQuestion({
  qNo,
  data,
  onChange,
  onRemove,
  onDuplicate,
}: {
  qNo: number;
  data: QuestionData;
  onChange: (qNo: number, data: QuestionData) => void;
  isSubmitted?: boolean;
  onRemove?: () => void;
  onDuplicate?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  /* =====================================================
     UPDATE QUESTION
  ===================================================== */

  const update = (patch: Partial<QuestionData>) => {
    onChange(qNo, {
      ...data,
      ...patch,
    });
  };

  /* =====================================================
     ADD STEP
  ===================================================== */

  const addStep = () => {
    const nextIndex = data.steps.length;

    const updatedSteps: StepData[] = [
      ...data.steps,
      {
        prompt: emptyContent(),

        answerType: "text",

        options: [],

        correctOptionId: "",

        answer: {
          content: emptyContent(),
          acceptedAnswers: [],
        },

        skills: [],
      },
    ];

    update({
      steps: updatedSteps,

      skills: getQuestionSkills(updatedSteps),
    });

    window.setTimeout(() => {
      document
        .getElementById(
          `question-${qNo}-step-${nextIndex}`
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 80);
  };

  /* =====================================================
     UPDATE STEP

     Every step update recalculates question-level skills.
  ===================================================== */

  const updateStep = (
    index: number,
    nextStep: StepData
  ) => {
    const updatedSteps = data.steps.map(
      (step, i) =>
        i === index ? nextStep : step
    );

    update({
      steps: updatedSteps,

      skills: getQuestionSkills(updatedSteps),
    });
  };

  /* =====================================================
     REMOVE STEP

     Recalculate main question skills after removal.
  ===================================================== */

  const removeStep = (index: number) => {
    const updatedSteps = data.steps.filter(
      (_, i) => i !== index
    );

    update({
      steps: updatedSteps,

      skills: getQuestionSkills(updatedSteps),
    });
  };

  /* =====================================================
     CHANGE QUESTION FORMAT
  ===================================================== */

  const changeFormat = (
    format: QuestionFormat
  ) => {
    update({
      format,

      // Switching to stepwise starts with no selected skills.
      // Switching away from stepwise also clears derived skills.
      skills:
        format === "steps" || data.format === "steps"
          ? []
          : (data.skills ?? []),

      options:
        format === "mcq"
          ? (
              data.options?.length
                ? data.options
                : [makeOption(), makeOption()]
            )
          : [],

      correctOptionId: "",

      answer: {
        content: emptyContent(),
        acceptedAnswers: [],
      },

      steps: [],
    });
  };

  /* =====================================================
     QUESTION SUMMARY
  ===================================================== */

  const formatLabel =
    data.format === "mcq"
      ? "Multiple choice"
      : data.format === "answer"
        ? "Written answer"
        : "Step-by-step";

  const summary = (data.prompt ?? [])
    .filter(
      (item) =>
        item.type === "text" &&
        item.value.trim()
    )
    .map((item) => item.value)
    .join(" ")
    .slice(0, 100);

  // Stepwise question skills are always derived from steps.
  const questionSkills =
    data.format === "steps"
      ? getQuestionSkills(data.steps ?? [])
      : (data.skills ?? []);

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Accordion
        expanded={expanded}
        onChange={(_, open) => setExpanded(open)}
        disableGutters
        elevation={0}
        sx={{
          "&:before": {
            display: "none",
          },
        }}
      >
        {/* =================================================
            QUESTION HEADER
        ================================================= */}

        <AccordionSummary
          expandIcon={<ExpandMoreRoundedIcon />}
          sx={{
            px: 2.5,
            py: 0.5,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{
              width: "100%",
              pr: 1,
            }}
          >
            <Chip
              label={`Q${qNo + 1}`}
              color="primary"
            />

            <Box
              flex={1}
              minWidth={0}
            >
              <Box
                sx={{
                  fontWeight: 800,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <RenderMath
                  text={summary || "New question"}
                />
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {formatLabel} · {questionSkills.length} skills
              </Typography>
            </Box>

            {data.teacherChecked && (
              <Chip
                size="small"
                color="success"
                label="Checked"
              />
            )}

            {onDuplicate && (
              <Tooltip title="Duplicate question">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onRemove && (
              <Tooltip title="Remove question">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </AccordionSummary>

        <Divider />

        {/* =================================================
            QUESTION BODY
        ================================================= */}

        <AccordionDetails
          sx={{
            p: {
              xs: 2,
              sm: 2.5,
            },
          }}
        >
          <Stack spacing={2.5}>
            {/* QUESTION PROMPT */}

            <ContentEditor
              label="Question prompt"
              value={data.prompt ?? []}
              onChange={(prompt) =>
                update({ prompt })
              }
            />

            {/* QUESTION FORMAT */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
            >
              <FormControl
                fullWidth
                size="small"
              >
                <InputLabel>
                  Answer format
                </InputLabel>

                <Select
                  label="Answer format"
                  value={data.format}
                  onChange={(e) =>
                    changeFormat(
                      e.target.value as QuestionFormat
                    )
                  }
                >
                  <MenuItem value="mcq">
                    Multiple choice (MCQ)
                  </MenuItem>

                  <MenuItem value="answer">
                    Written answer
                  </MenuItem>

                  <MenuItem value="steps">
                    Step-by-step question
                  </MenuItem>
                </Select>
              </FormControl>

              {/* 
                Only MCQ and One-word questions have
                manually selected question-level skills.

                Stepwise skills are automatically derived
                from individual steps.
              */}
{data.format !== "steps" && (
  <SkillsSelector
    value={data.skills ?? []}
    onChange={(skills) => update({ skills })}
  />
)}
             
            </Stack>

            {/* =================================================
                MCQ FORMAT
            ================================================= */}

            {data.format === "mcq" && (
              <OptionEditor
                options={data.options ?? []}
                onChange={(options) =>
                  update({ options })
                }
                correctOptionId={data.correctOptionId}
                onCorrectChange={(correctOptionId) =>
                  update({ correctOptionId })
                }
              />
            )}

            {/* =================================================
                ONE-WORD / DIRECT ANSWER FORMAT
            ================================================= */}

            {data.format === "answer" && (
              <AnswerEditor
                answer={data.answer}
                onChange={(answer) =>
                  update({ answer })
                }
              />
            )}

            {/* =================================================
                STEPWISE FORMAT
            ================================================= */}

            {data.format === "steps" && (
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography fontWeight={800}>
                      Solution steps
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Assign skills separately to each step.
                      Question-level skills are generated automatically.
                    </Typography>
                  </Box>
                </Stack>

                {data.steps.length === 0 && (
                  <Alert severity="info">
                    Add the first step to build a
                    step-by-step question.
                  </Alert>
                )}

                {data.steps.map((step, index) => (
                  <Box
                    key={index}
                    id={`question-${qNo}-step-${index}`}
                    sx={{
                      scrollMarginTop: 100,
                    }}
                  >
                    <StepEditor
                      step={step}
                      index={index}
                      onChange={(next) =>
                        updateStep(index, next)
                      }
                      onRemove={() =>
                        removeStep(index)
                      }
                    />
                  </Box>
                ))}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={addStep}
                  sx={{
                    py: 1.1,
                    borderStyle: "dashed",
                    borderRadius: 2,
                  }}
                >
                  Add next step
                </Button>
              </Stack>
            )}

            <Divider />

            {/* =================================================
                EXPLANATION
            ================================================= */}

            <ContentEditor
              label="Explanation / teacher solution (optional)"
              value={data.explanation ?? []}
              onChange={(explanation) =>
                update({ explanation })
              }
            />

            {/* =================================================
                TEACHER VERIFICATION
            ================================================= */}

            <FormControlLabel
              control={
                <Checkbox
                  checked={data.teacherChecked}
                  onChange={(e) =>
                    update({
                      teacherChecked: e.target.checked,
                    })
                  }
                />
              }
              label={
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  I have reviewed this question and its
                  correct answer
                </Typography>
              }
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}