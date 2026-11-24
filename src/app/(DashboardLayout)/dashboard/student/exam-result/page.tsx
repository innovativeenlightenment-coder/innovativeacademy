"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  RefreshRounded,
  TrendingUpRounded,
  EmojiEventsRounded,
  AssignmentRounded,
  CheckCircleRounded,
  CancelRounded,
  ScheduleRounded,
  ArrowForwardRounded,
  MenuBookRounded,
  InsightsRounded,
  AccessTimeRounded,
  WorkspacePremiumRounded,
  PsychologyRounded,
  CalendarMonthRounded,
  TaskAltRounded,
  QueryStatsRounded,
} from "@mui/icons-material";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from "recharts";

/* =========================================================
   TYPES
========================================================= */

type ExamResult = {
  recordId: string;
  examId: string;
  title: string;
  testType: string;
  course: string;
  subject: string;
  chapters: string[];
  teacherName: string;

  submittedAt: string | null;
  publishedAt: string | null;
  publishAt: string | null;

  resultStatus: string;
  evaluationStatus: string;
  published: boolean;

  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;

  correctCount: number;
  incorrectCount: number;

  totalMarks: number;
  obtainedMarks: number;
  percentage: number | null;

  allowedSeconds: number;
  timeSpentSeconds: number;

  questionAttemptCount: number;
};

type SkillAnalysis = {
  skillId: string;
  name: string;

  attempts: number;
  correct: number;
  incorrect: number;
  pending: number;

  accuracy: number | null;

  marksAwarded: number;
  totalMarks: number;

  masteryScore?: number | null;
  masteryStatus?: string;
};

type ChapterAnalysis = {
  chapter: string;

  total: number;
  correct: number;
  incorrect: number;
  pending: number;

  accuracy: number | null;

  marksAwarded: number;
  totalMarks: number;
};

type GrowthItem = {
  examNumber: number;
  title: string;
  date: string | null;
  percentage: number;
};

type MasteryAnalysis = {
  skillId: string;

  masteryScore: number;
  masteryStatus?: string;

  course?: string;
  subject?: string;

  nextReviewAt?: string | null;
  lastPracticedAt?: string | null;

  evidence?: {
    totalAttempts?: number;
    correctAttempts?: number;
    partiallyCorrect?: number;
    incorrectAttempts?: number;
    skippedAttempts?: number;
    independentAttempts?: number;
  };

  recentEvidence?: {
    recentTotal?: number;
    recentCorrect?: number;
    recentMarksAwarded?: number;
    recentAvailableMarks?: number;
  };

  performance?: {
    averageMarksPercentage?: number;
    independentAccuracy?: number;
  };

  trends?: {
    direction?: string;
    consecutiveCorrect?: number;
    consecutiveIncorrect?: number;
  };
};

type ApiResponse = {
  success: boolean;

  student?: {
    name: string;
  };

  summary?: {
    totalExams: number;
    publishedExams: number;
    pendingExams: number;

    averagePercentage: number;
    bestPercentage: number;

    totalCorrect: number;
    totalIncorrect: number;
  };

  results?: ExamResult[];
  skillAnalysis?: SkillAnalysis[];
  masteryAnalysis?: MasteryAnalysis[];
  chapterAnalysis?: ChapterAnalysis[];
  growth?: GrowthItem[];

  message?: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const PURPLE = "#6D28D9";
const GREEN = "#16A34A";
const RED = "#DC2626";
const ORANGE = "#EA580C";
const BLUE = "#2563EB";

const ANSWER_COLORS = [
  GREEN,
  RED,
  "#9CA3AF",
];

const SKILL_COLORS = [
  "#6D28D9",
  "#2563EB",
  "#0D9488",
  "#EA580C",
  "#DB2777",
  "#7C3AED",
  "#0891B2",
  "#65A30D",
  "#9333EA",
  "#CA8A04",
  "#475569",
  "#0284C7",
  "#C026D3",
  "#059669",
  "#B45309",
];

/* =========================================================
   HELPERS
========================================================= */

function safeNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function formatPercentage(value: number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${Math.round(value)}%`;
}

function formatDate(date?: string | null) {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(seconds: number) {
  const total = Math.max(
    0,
    Math.floor(safeNumber(seconds))
  );

  if (total < 60) return "<1 min";

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes} min`;
}

function getMasteryColor(score: number) {
  if (score >= 80) return GREEN;
  if (score >= 60) return BLUE;
  if (score >= 40) return ORANGE;

  return RED;
}

function getMasteryLabel(score: number) {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Developing";

  return "Needs practice";
}

function getTrendLabel(direction?: string) {
  const value = (direction || "").toLowerCase();

  if (value.includes("improv") || value.includes("up")) {
    return "Improving";
  }

  if (value.includes("declin") || value.includes("down")) {
    return "Declining";
  }

  if (value.includes("stable")) {
    return "Stable";
  }

  return "Not enough data";
}

/* =========================================================
   REUSABLE UI
========================================================= */

function SectionHeading({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      mb={2.5}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1.3}
        minWidth={0}
      >
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "13px",
              bgcolor: "#F3EFFF",
              color: PURPLE,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}

        <Box minWidth={0}>
          <Typography
            fontWeight={800}
            fontSize={{ xs: 17, sm: 19 }}
            color="#171326"
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              fontSize={12.5}
              color="text.secondary"
              mt={0.3}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {action}
    </Stack>
  );
}

function Panel({
  children,
  sx = {},
}: {
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #EEEAF5",
        borderRadius: {
          xs: "18px",
          sm: "22px",
        },
        bgcolor: "#FFFFFF",
        height: "100%",
        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            sm: 2.5,
          },
          "&:last-child": {
            pb: {
              xs: 2,
              sm: 2.5,
            },
          },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  background,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color: string;
  background: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #EEEAF5",
        borderRadius: "19px",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography
            fontSize={12.5}
            fontWeight={700}
            color="text.secondary"
          >
            {title}
          </Typography>

          <Box
            sx={{
              width: 39,
              height: 39,
              borderRadius: "13px",
              bgcolor: background,
              color,
              display: "grid",
              placeItems: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography
          fontSize={{
            xs: 25,
            sm: 29,
          }}
          fontWeight={850}
          letterSpacing="-1px"
          color="#171326"
        >
          {value}
        </Typography>

        <Typography
          fontSize={11.5}
          color="text.secondary"
          mt={0.5}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   GROWTH CHART TOOLTIP
========================================================= */

function GrowthTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload as GrowthItem | undefined;

  if (!item) return null;

  return (
    <Box
      sx={{
        bgcolor: "#171326",
        color: "#FFFFFF",
        px: 1.7,
        py: 1.3,
        borderRadius: "12px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
      }}
    >
      <Typography fontSize={11} color="#C4B5FD">
        {item.title}
      </Typography>

      <Typography
        fontWeight={800}
        fontSize={21}
        mt={0.4}
      >
        {formatPercentage(item.percentage)}
      </Typography>

      <Typography fontSize={10.5} color="#D1D5DB">
        {formatDate(item.date)}
      </Typography>
    </Box>
  );
}

/* =========================================================
   ANSWER DISTRIBUTION — SINGLE DONUT
========================================================= */

function AnswerDistribution({
  correct,
  incorrect,
  unanswered,
}: {
  correct: number;
  incorrect: number;
  unanswered: number;
}) {
  const total = correct + incorrect + unanswered;

  const chartData = [
    {
      name: "Correct",
      value: correct,
    },
    {
      name: "Incorrect",
      value: incorrect,
    },
    {
      name: "Unanswered",
      value: unanswered,
    },
  ].filter((item) => item.value > 0);

  const percentage =
    total > 0
      ? Math.round((correct / total) * 100)
      : 0;

  return (
    <Panel>
      <SectionHeading
        title="Answer distribution"
        subtitle="Distribution of your published exam attempts"
        icon={<QueryStatsRounded />}
      />

      {total === 0 ? (
        <Box
          sx={{
            minHeight: 220,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <Box>
            <InsightsRounded
              sx={{
                fontSize: 38,
                color: "#C4B5FD",
              }}
            />

            <Typography fontWeight={700} mt={1}>
              No answer data yet
            </Typography>

            <Typography
              fontSize={12}
              color="text.secondary"
              mt={0.5}
            >
              Your answer distribution will appear after results are published.
            </Typography>
          </Box>
        </Box>
      ) : (
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          alignItems="center"
          justifyContent="space-around"
          gap={2}
          sx={{
            minHeight: 225,
          }}
        >
          <Box
            sx={{
              width: 205,
              height: 205,
              position: "relative",
              flexShrink: 0,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={66}
                  outerRadius={91}
                  paddingAngle={3}
                  stroke="none"
                  cornerRadius={5}
                >
                  {chartData.map((entry) => {
                    const index = [
                      "Correct",
                      "Incorrect",
                      "Unanswered",
                    ].indexOf(entry.name);

                    return (
                      <Cell
                        key={entry.name}
                        fill={ANSWER_COLORS[index]}
                      />
                    );
                  })}
                </Pie>

                <ChartTooltip
                  formatter={(value: any, name: any) => [
                    `${value} questions`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                pointerEvents: "none",
              }}
            >
              <Typography
                fontSize={29}
                fontWeight={850}
                color="#171326"
                lineHeight={1.1}
              >
                {percentage}%
              </Typography>

              <Typography
                fontSize={11}
                color="text.secondary"
                mt={0.4}
              >
                Correct
              </Typography>
            </Box>
          </Box>

          <Stack
            spacing={2}
            sx={{
              width: "100%",
              maxWidth: 220,
            }}
          >
            {[
              {
                label: "Correct",
                value: correct,
                color: GREEN,
              },
              {
                label: "Incorrect",
                value: incorrect,
                color: RED,
              },
              {
                label: "Unanswered",
                value: unanswered,
                color: "#9CA3AF",
              },
            ].map((item) => (
              <Stack
                key={item.label}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: item.color,
                    }}
                  />

                  <Typography
                    fontSize={13}
                    color="#514B60"
                  >
                    {item.label}
                  </Typography>
                </Stack>

                <Typography
                  fontWeight={800}
                  fontSize={14}
                >
                  {item.value}
                </Typography>
              </Stack>
            ))}

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                fontSize={12}
                color="text.secondary"
              >
                Total questions
              </Typography>

              <Typography
                fontWeight={800}
                fontSize={13}
              >
                {total}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Panel>
  );
}

/* =========================================================
   SKILL ANALYSIS — ONE COMBINED DONUT
========================================================= */

function SkillsToPractise({
  skills,
}: {
  skills: SkillAnalysis[];
}) {
  const chartData = useMemo(() => {
    return skills
      .filter((skill) => safeNumber(skill.attempts) > 0)
      .map((skill) => {
        const attempts = safeNumber(skill.attempts);
        const correct = safeNumber(skill.correct);

        return {
          name: skill.name,
          attempts,
          correct,
          incorrect: safeNumber(skill.incorrect),
          pending: safeNumber(skill.pending),
          accuracy:
            skill.accuracy === null ||
            skill.accuracy === undefined
              ? attempts > 0
                ? Math.round((correct / attempts) * 100)
                : 0
              : clamp(safeNumber(skill.accuracy)),
        };
      })
      .sort((a, b) => b.attempts - a.attempts);
  }, [skills]);

  const totalAttempts = chartData.reduce(
    (sum, skill) => sum + skill.attempts,
    0
  );

  const totalCorrect = chartData.reduce(
    (sum, skill) => sum + skill.correct,
    0
  );

  const overallAccuracy =
    totalAttempts > 0
      ? Math.round((totalCorrect / totalAttempts) * 100)
      : 0;

  return (
    <Panel>
      <SectionHeading
        title="Skill analysis"
        subtitle="Your performance across all assessed learning skills"
        icon={<PsychologyRounded />}
      />

      {chartData.length === 0 ? (
        <Box
          sx={{
            minHeight: 260,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <PsychologyRounded
            sx={{
              fontSize: 42,
              color: "#C4B5FD",
            }}
          />

          <Typography fontWeight={750} mt={1}>
            Skill analysis not available yet
          </Typography>

          <Typography
            fontSize={12}
            color="text.secondary"
            mt={0.5}
            maxWidth={260}
          >
            Skill-wise performance will appear after you attempt
            questions associated with learning skills.
          </Typography>
        </Box>
      ) : (
        <>
          {/* OVERVIEW */}

          <Stack
            direction="row"
            justifyContent="space-between"
            gap={1}
            mb={1}
          >
            <Box>
              <Typography
                fontSize={26}
                fontWeight={850}
                color="#211936"
              >
                {overallAccuracy}%
              </Typography>

              <Typography
                fontSize={11}
                color="text.secondary"
              >
                Overall skill accuracy
              </Typography>
            </Box>

            <Box textAlign="right">
              <Typography
                fontSize={26}
                fontWeight={850}
                color="#211936"
              >
                {chartData.length}
              </Typography>

              <Typography
                fontSize={11}
                color="text.secondary"
              >
                Skills assessed
              </Typography>
            </Box>
          </Stack>

          {/* SINGLE DONUT */}

          <Box
            sx={{
              width: "100%",
              height: 235,
              position: "relative",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="attempts"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={67}
                  outerRadius={96}
                  paddingAngle={3}
                  stroke="none"
                  cornerRadius={5}
                >
                  {chartData.map((skill, index) => (
                    <Cell
                      key={skill.name}
                      fill={
                        SKILL_COLORS[
                          index % SKILL_COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>

                <ChartTooltip
                  formatter={(
                    value: any,
                    _name: any,
                    props: any
                  ) => {
                    const skill = props.payload;

                    return [
                      `${value} attempts · ${skill.accuracy}% accuracy`,
                      skill.name,
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <Typography
                fontSize={29}
                fontWeight={850}
                color="#211936"
                lineHeight={1.1}
              >
                {totalAttempts}
              </Typography>

              <Typography
                fontSize={11}
                color="text.secondary"
                mt={0.4}
              >
                Total attempts
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

              {/* COMPACT SKILL LEGEND */}

<Box
  sx={{
    display: "flex",
    flexWrap: "wrap",
    gap: 1.2,
    mt: 1,
  }}
>
  {chartData.map((skill, index) => (
    <Stack
      key={skill.name}
      direction="row"
      alignItems="center"
      gap={0.7}
      sx={{
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      <Box
        sx={{
          width: 9,
          height: 9,
          borderRadius: "3px",
          bgcolor:
            SKILL_COLORS[index % SKILL_COLORS.length],
          flexShrink: 0,
        }}
      />

      <Typography
        fontSize={11}
        color="#514B60"
        sx={{
          overflowWrap: "anywhere",
        }}
      >
        {skill.name}
      </Typography>
    </Stack>
  ))}
</Box>
       </>
      )}
    </Panel>
  );
}

/* =========================================================
   CHAPTER PERFORMANCE
========================================================= */

function ChapterPerformance({
  chapters,
}: {
  chapters: ChapterAnalysis[];
}) {
  const chapterData = useMemo(() => {
    return [...chapters]
      .filter(
        (chapter) =>
          chapter.total > 0 &&
          chapter.accuracy !== null &&
          chapter.accuracy !== undefined
      )
      .sort(
        (a, b) =>
          safeNumber(b.accuracy) -
          safeNumber(a.accuracy)
      )
      .slice(0, 7)
      .map((chapter) => ({
        ...chapter,
        displayName:
          chapter.chapter.length > 22
            ? `${chapter.chapter.slice(0, 20)}…`
            : chapter.chapter,
        score: clamp(safeNumber(chapter.accuracy)),
      }));
  }, [chapters]);

  return (
    <Panel>
      <SectionHeading
        title="Chapter performance"
        subtitle="Compare your accuracy across chapters"
        icon={<MenuBookRounded />}
      />

      {chapterData.length === 0 ? (
        <Box
          py={4}
          textAlign="center"
        >
          <MenuBookRounded
            sx={{
              fontSize: 34,
              color: "#C4B5FD",
            }}
          />

          <Typography fontWeight={700} mt={1}>
            No chapter data available
          </Typography>

          <Typography
            fontSize={12}
            color="text.secondary"
            mt={0.5}
          >
            Chapter performance will appear as you complete exams.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: Math.max(220, chapterData.length * 43),
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chapterData}
              layout="vertical"
              margin={{
                top: 4,
                right: 22,
                left: 5,
                bottom: 4,
              }}
              barCategoryGap={13}
            >
              <CartesianGrid
                stroke="#F0ECF6"
                horizontal={false}
              />

              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{
                  fontSize: 10,
                  fill: "#8B8499",
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="displayName"
                width={112}
                tick={{
                  fontSize: 10,
                  fill: "#514B60",
                }}
                axisLine={false}
                tickLine={false}
              />

              <ChartTooltip
                cursor={{
                  fill: "#F7F4FC",
                }}
                formatter={(value: any) => [
                  `${Math.round(Number(value))}%`,
                  "Accuracy",
                ]}
                labelFormatter={(label) => `Chapter: ${label}`}
              />

              <Bar
                dataKey="score"
                name="Accuracy"
                radius={[0, 7, 7, 0]}
                maxBarSize={19}
              >
                {chapterData.map((entry) => (
                  <Cell
                    key={entry.chapter}
                    fill={
                      entry.score >= 75
                        ? GREEN
                        : entry.score >= 50
                          ? ORANGE
                          : RED
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Panel>
  );
}

/* =========================================================
   LONG-TERM MASTERY
========================================================= */

function MasterySection({
  mastery,
  skills,
}: {
  mastery: MasteryAnalysis[];
  skills: SkillAnalysis[];
}) {
  const skillNameMap = useMemo(() => {
    return new Map(
      skills.map((skill) => [
        skill.skillId,
        skill.name,
      ])
    );
  }, [skills]);

  const items = useMemo(() => {
    return [...mastery]
      .sort(
        (a, b) =>
          safeNumber(a.masteryScore) -
          safeNumber(b.masteryScore)
      )
      .slice(0, 6);
  }, [mastery]);

  return (
    <Panel>
      <SectionHeading
        title="Long-term skill mastery"
        subtitle="Your progress based on accumulated learning evidence"
        icon={<WorkspacePremiumRounded />}
      />

      {items.length === 0 ? (
        <Box py={3} textAlign="center">
          <Typography fontWeight={700}>
            Mastery analysis is building
          </Typography>

          <Typography
            fontSize={12}
            color="text.secondary"
            mt={0.5}
          >
            More practice will help build your long-term skill profile.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {items.map((item) => {
            const score = clamp(
              safeNumber(item.masteryScore) * 100
            );

            const color = getMasteryColor(score);

            const name =
              skillNameMap.get(item.skillId) ||
              item.skillId;

            const trend = getTrendLabel(
              item.trends?.direction
            );

            return (
              <Box
                key={item.skillId}
                sx={{
                  border: "1px solid #EEEAF5",
                  borderRadius: "15px",
                  p: 1.8,
                  minWidth: 0,
                }}
              >
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  justifyContent="space-between"
                  gap={1}
                >
                  <Typography
                    fontWeight={750}
                    fontSize={13}
                    color="#282239"
                    sx={{
                      overflowWrap: "anywhere",
                    }}
                  >
                    {name}
                  </Typography>

                  <Chip
                    size="small"
                    label={getMasteryLabel(score)}
                    sx={{
                      bgcolor: `${color}12`,
                      color,
                      fontWeight: 750,
                      fontSize: 10,
                      flexShrink: 0,
                    }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  alignItems="baseline"
                  gap={0.6}
                  mt={2}
                >
                  <Typography
                    fontSize={26}
                    fontWeight={850}
                    color={color}
                  >
                    {Math.round(score)}%
                  </Typography>

                  <Typography
                    fontSize={10}
                    color="text.secondary"
                  >
                    mastery
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={score}
                  sx={{
                    height: 6,
                    borderRadius: 10,
                    mt: 1,
                    bgcolor: "#F0EDF5",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 10,
                      bgcolor: color,
                    },
                  }}
                />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={1.6}
                  gap={1}
                >
                  <Typography
                    fontSize={10.5}
                    color="text.secondary"
                  >
                    {item.evidence?.totalAttempts ?? 0} attempts
                  </Typography>

                  <Typography
                    fontSize={10.5}
                    fontWeight={700}
                    color={
                      trend === "Improving"
                        ? GREEN
                        : trend === "Declining"
                          ? RED
                          : "text.secondary"
                    }
                  >
                    {trend}
                  </Typography>
                </Stack>

                {item.nextReviewAt && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={0.6}
                    mt={1.2}
                  >
                    <CalendarMonthRounded
                      sx={{
                        fontSize: 13,
                        color: "#8B8499",
                      }}
                    />

                    <Typography
                      fontSize={10}
                      color="text.secondary"
                    >
                      Review: {formatDate(item.nextReviewAt)}
                    </Typography>
                  </Stack>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Panel>
  );
}

/* =========================================================
   PENDING RESULTS
========================================================= */

function PendingResults({
  results,
}: {
  results: ExamResult[];
}) {
  const pending = results.filter(
    (item) => !item.published
  );

  if (pending.length === 0) {
    return null;
  }

  return (
    <Panel>
      <SectionHeading
        title="Results awaiting publication"
        subtitle="Submitted exams that are not published yet"
        icon={<ScheduleRounded />}
      />

      <Stack spacing={1.2}>
        {pending.map((exam) => (
          <Box
            key={exam.recordId}
            sx={{
              p: 1.6,
              borderRadius: "14px",
              bgcolor: "#FFFBEB",
              border: "1px solid #FDE68A",
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              justifyContent="space-between"
              gap={1}
            >
              <Box minWidth={0}>
                <Typography
                  fontWeight={750}
                  fontSize={13}
                  color="#29213B"
                >
                  {exam.title}
                </Typography>

                <Typography
                  fontSize={11}
                  color="text.secondary"
                  mt={0.4}
                >
                  {exam.subject} · {exam.course}
                </Typography>

                <Typography
                  fontSize={10.5}
                  color="text.secondary"
                  mt={0.4}
                >
                  Submitted: {formatDate(exam.submittedAt)}
                </Typography>
              </Box>

              <Chip
                icon={
                  <ScheduleRounded
                    sx={{
                      fontSize: "15px !important",
                    }}
                  />
                }
                label="Awaiting result"
                size="small"
                sx={{
                  bgcolor: "#FEF3C7",
                  color: "#92400E",
                  fontWeight: 750,
                  fontSize: 10.5,
                }}
              />
            </Stack>
          </Box>
        ))}
      </Stack>
    </Panel>
  );
}

/* =========================================================
   EXAM HISTORY
========================================================= */

function ExamHistory({
  results,
}: {
  results: ExamResult[];
}) {
  const publishedResults = results
    .filter((exam) => exam.published)
    .sort((a, b) => {
      const dateA = new Date(
        a.submittedAt || 0
      ).getTime();

      const dateB = new Date(
        b.submittedAt || 0
      ).getTime();

      return dateB - dateA;
    });

  return (
    <Panel>
      <SectionHeading
        title="Exam history"
        subtitle="Your recently completed and published exams"
        icon={<AssignmentRounded />}
      />

      {publishedResults.length === 0 ? (
        <Box
          py={4}
          textAlign="center"
        >
          <AssignmentRounded
            sx={{
              fontSize: 38,
              color: "#C4B5FD",
            }}
          />

          <Typography fontWeight={750} mt={1}>
            No published results yet
          </Typography>

          <Typography
            fontSize={12}
            color="text.secondary"
            mt={0.5}
          >
            Your completed exams will appear here after publication.
          </Typography>

          <Button
            component={Link}
            href="/dashboard/student/exams"
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: PURPLE,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 750,
            }}
          >
            Explore exams
          </Button>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {publishedResults.map((exam) => {
            const percentage = clamp(
              safeNumber(exam.percentage)
            );

            const scoreColor =
              percentage >= 75
                ? GREEN
                : percentage >= 50
                  ? ORANGE
                  : RED;

            return (
              <Box
                key={exam.recordId}
                sx={{
                  border: "1px solid #EEEAF5",
                  borderRadius: "16px",
                  p: {
                    xs: 1.7,
                    sm: 2,
                  },
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#C4B5FD",
                    bgcolor: "#FCFAFF",
                  },
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "stretch",
                    sm: "center",
                  }}
                  gap={2}
                >
                  <Box
                    flex={1}
                    minWidth={0}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                    >
                      <Typography
                        fontWeight={800}
                        fontSize={14}
                        color="#29213B"
                        sx={{
                          overflowWrap: "anywhere",
                        }}
                      >
                        {exam.title}
                      </Typography>

                      <Chip
                        label={exam.testType || "Exam"}
                        size="small"
                        sx={{
                          height: 21,
                          bgcolor: "#F3EFFF",
                          color: PURPLE,
                          fontSize: 9.5,
                          fontWeight: 750,
                        }}
                      />
                    </Stack>

                    <Typography
                      fontSize={11.5}
                      color="text.secondary"
                      mt={0.7}
                    >
                      {exam.subject} · {exam.course}
                    </Typography>

                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1.5}
                      mt={1.4}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.5}
                      >
                        <CalendarMonthRounded
                          sx={{
                            fontSize: 14,
                            color: "#9B93AA",
                          }}
                        />

                        <Typography
                          fontSize={10.5}
                          color="text.secondary"
                        >
                          {formatDate(exam.submittedAt)}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.5}
                      >
                        <TaskAltRounded
                          sx={{
                            fontSize: 14,
                            color: "#9B93AA",
                          }}
                        />

                        <Typography
                          fontSize={10.5}
                          color="text.secondary"
                        >
                          {exam.answeredCount}/{exam.totalQuestions} answered
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.5}
                      >
                        <AccessTimeRounded
                          sx={{
                            fontSize: 14,
                            color: "#9B93AA",
                          }}
                        />

                        <Typography
                          fontSize={10.5}
                          color="text.secondary"
                        >
                          {formatDuration(exam.timeSpentSeconds)}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1.5}
                      mt={1.5}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.5}
                      >
                        <CheckCircleRounded
                          sx={{
                            fontSize: 14,
                            color: GREEN,
                          }}
                        />

                        <Typography
                          fontSize={10.5}
                          color="text.secondary"
                        >
                          {exam.correctCount} correct
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.5}
                      >
                        <CancelRounded
                          sx={{
                            fontSize: 14,
                            color: RED,
                          }}
                        />

                        <Typography
                          fontSize={10.5}
                          color="text.secondary"
                        >
                          {exam.incorrectCount} incorrect
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={0.5}
                      >
                        <ScheduleRounded
                          sx={{
                            fontSize: 14,
                            color: "#9CA3AF",
                          }}
                        />

                        <Typography
                          fontSize={10.5}
                          color="text.secondary"
                        >
                          {exam.unansweredCount} unanswered
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 130,
                      },
                      textAlign: {
                        xs: "left",
                        sm: "right",
                      },
                    }}
                  >
                    <Typography
                      fontSize={27}
                      fontWeight={850}
                      color={scoreColor}
                    >
                      {formatPercentage(exam.percentage)}
                    </Typography>

                    <Typography
                      fontSize={10.5}
                      color="text.secondary"
                    >
                      {exam.obtainedMarks} / {exam.totalMarks} marks
                    </Typography>

                    <Button
                      component={Link}
                      href={`/dashboard/student/exam-result/${exam.recordId}`}
                      endIcon={<ArrowForwardRounded />}
                      size="small"
                      sx={{
                        mt: 1,
                        color: PURPLE,
                        fontWeight: 800,
                        textTransform: "none",
                        fontSize: 11,
                      }}
                    >
                      View report
                    </Button>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Panel>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MyResultsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH RESULTS
  ======================================================= */

  const fetchResults = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const response = await fetch("/api/Exam-Result", {
          credentials: "same-origin",
          cache: "no-store",
        });

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load your results."
          );
        }

        setData(result);
      } catch (err) {
        console.error("Exam results fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your results."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  /* =======================================================
     DATA
  ======================================================= */

  const summary = data?.summary;

  const results = data?.results || [];
  const skills = data?.skillAnalysis || [];
  const mastery = data?.masteryAnalysis || [];
  const chapters = data?.chapterAnalysis || [];
  const growth = data?.growth || [];

  const publishedResults = useMemo(
    () => results.filter((exam) => exam.published),
    [results]
  );

  const unansweredCount = useMemo(
    () =>
      publishedResults.reduce(
        (total, exam) =>
          total + safeNumber(exam.unansweredCount),
        0
      ),
    [publishedResults]
  );

  const growthData = useMemo(() => {
    return [...growth]
      .sort(
        (a, b) => a.examNumber - b.examNumber
      )
      .map((item) => ({
        ...item,
        percentage: clamp(
          safeNumber(item.percentage)
        ),
        chartLabel: `Exam ${item.examNumber}`,
      }));
  }, [growth]);

  const bestScore = safeNumber(
    summary?.bestPercentage
  );

  const averageScore = safeNumber(
    summary?.averagePercentage
  );

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          maxWidth: 1450,
          mx: "auto",
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Skeleton
          variant="rounded"
          height={175}
          sx={{ borderRadius: 4 }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mt: 2,
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={item}
              variant="rounded"
              height={125}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, 1fr)",
            },
            gap: 2,
            mt: 2,
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={item}
              variant="rounded"
              height={300}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (error && !data) {
    return (
      <Box
        sx={{
          maxWidth: 700,
          mx: "auto",
          p: 3,
          mt: 5,
        }}
      >
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchResults()}
            >
              Retry
            </Button>
          }
          sx={{ borderRadius: 3 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1450,
        mx: "auto",
        p: {
          xs: 1.5,
          sm: 2.5,
          md: 3,
        },
        pb: 6,
      }}
    >
      {/* ================================================
          HEADER
      ================================================ */}

      <Box
        sx={{
          borderRadius: {
            xs: "19px",
            sm: "25px",
          },
          p: {
            xs: 2.2,
            sm: 3.5,
          },
          background:
            "linear-gradient(115deg, #2E1065 0%, #5B21B6 50%, #7C3AED 100%)",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
            right: -75,
            top: -110,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.13)",
            right: 110,
            bottom: -110,
          }}
        />

        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
          position="relative"
        >
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
            >
              <InsightsRounded
                sx={{ color: "#DDD6FE" }}
              />

              <Typography
                fontSize={11}
                fontWeight={800}
                letterSpacing={1.2}
                color="#DDD6FE"
                textTransform="uppercase"
              >
                Learning analytics
              </Typography>
            </Stack>

            <Typography
              fontSize={{
                xs: 25,
                sm: 32,
              }}
              fontWeight={850}
              letterSpacing="-0.8px"
              mt={1.4}
            >
              My Results
            </Typography>

            <Typography
              fontSize={{
                xs: 12,
                sm: 13,
              }}
              color="#E9D5FF"
              mt={0.7}
            >
              Welcome back, {data?.student?.name || "Student"}.
              Here&apos;s your learning progress.
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              mt={2.3}
            >
              <Chip
                icon={
                  <EmojiEventsRounded
                    sx={{
                      color: "#FDE68A !important",
                    }}
                  />
                }
                label={`${formatPercentage(bestScore)} best score`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.13)",
                  color: "#FFFFFF",
                  fontWeight: 750,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            </Stack>
          </Box>

          <Tooltip title="Refresh results">
            <span>
              <IconButton
                onClick={() => fetchResults(true)}
                disabled={refreshing}
                sx={{
                  bgcolor: "rgba(255,255,255,0.14)",
                  color: "#FFFFFF",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.22)",
                  },
                }}
              >
                {refreshing ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  <RefreshRounded />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* ================================================
          ERROR NOTICE
      ================================================ */}

      {error && (
        <Alert
          severity="warning"
          sx={{
            mt: 2,
            borderRadius: 3,
          }}
          action={
            <Button
              size="small"
              color="inherit"
              onClick={() => fetchResults(true)}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* ================================================
          SUMMARY METRICS
      ================================================ */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: {
            xs: 1.2,
            sm: 1.8,
          },
          mt: 2,
        }}
      >
        <MetricCard
          title="Total exams"
          value={summary?.totalExams ?? 0}
          subtitle={`${summary?.publishedExams ?? 0} published`}
          icon={<AssignmentRounded />}
          color={PURPLE}
          background="#F3EFFF"
        />

        <MetricCard
          title="Average score"
          value={formatPercentage(averageScore)}
          subtitle="Across published exams"
          icon={<TrendingUpRounded />}
          color={BLUE}
          background="#EFF6FF"
        />

        <MetricCard
          title="Best score"
          value={formatPercentage(bestScore)}
          subtitle="Your highest exam score"
          icon={<EmojiEventsRounded />}
          color="#D97706"
          background="#FFFBEB"
        />

        <MetricCard
          title="Correct answers"
          value={summary?.totalCorrect ?? 0}
          subtitle={`${summary?.totalIncorrect ?? 0} incorrect`}
          icon={<CheckCircleRounded />}
          color={GREEN}
          background="#F0FDF4"
        />
      </Box>

      {/* ================================================
          MAIN CHARTS
      ================================================ */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1.35fr 0.85fr",
          },
          gap: 2,
          mt: 2.2,
        }}
      >
        {/* EXAM GROWTH */}

        <Panel>
          <SectionHeading
            title="Your exam growth"
            subtitle="How your scores have changed across exams"
            icon={<TrendingUpRounded />}
          />

          {growthData.length < 2 ? (
            <Box
              sx={{
                height: 250,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                px: 2,
              }}
            >
              <Box>
                <TrendingUpRounded
                  sx={{
                    fontSize: 42,
                    color: "#C4B5FD",
                  }}
                />

                <Typography fontWeight={750} mt={1}>
                  Your growth chart is getting ready
                </Typography>

                <Typography
                  fontSize={12}
                  color="text.secondary"
                  mt={0.5}
                  maxWidth={280}
                >
                  Complete at least two exams with published results
                  to see your performance trend.
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Box>
                  <Typography
                    fontSize={29}
                    fontWeight={850}
                    color="#211936"
                  >
                    {formatPercentage(
                      growthData[growthData.length - 1].percentage
                    )}
                  </Typography>

                  <Typography
                    fontSize={10.5}
                    color="text.secondary"
                  >
                    Latest exam score
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={`${growthData.length} exams`}
                  sx={{
                    bgcolor: "#F3EFFF",
                    color: PURPLE,
                    fontWeight: 750,
                  }}
                />
              </Stack>

              <Box
                sx={{
                  width: "100%",
                  height: 225,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={growthData}
                    margin={{
                      top: 12,
                      right: 9,
                      left: -22,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="growthGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={PURPLE}
                          stopOpacity={0.25}
                        />

                        <stop
                          offset="95%"
                          stopColor={PURPLE}
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 5"
                      stroke="#EEEAF5"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="chartLabel"
                      tick={{
                        fontSize: 10,
                        fill: "#8B8499",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{
                        fontSize: 10,
                        fill: "#8B8499",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <ChartTooltip
                      content={<GrowthTooltip />}
                    />

                    <Area
                      type="monotone"
                      dataKey="percentage"
                      stroke={PURPLE}
                      strokeWidth={3}
                      fill="url(#growthGradient)"
                      activeDot={{
                        r: 6,
                        stroke: "#FFFFFF",
                        strokeWidth: 3,
                        fill: PURPLE,
                      }}
                      dot={{
                        r: 3,
                        fill: "#FFFFFF",
                        stroke: PURPLE,
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </>
          )}
        </Panel>

        {/* ANSWER DISTRIBUTION */}

        <AnswerDistribution
          correct={safeNumber(summary?.totalCorrect)}
          incorrect={safeNumber(summary?.totalIncorrect)}
          unanswered={unansweredCount}
        />
      </Box>

      {/* ================================================
          SKILLS + CHAPTERS
      ================================================ */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 2,
          mt: 2,
        }}
      >
        <SkillsToPractise skills={skills} />

        <ChapterPerformance chapters={chapters} />
      </Box>

      {/* ================================================
          LONG-TERM MASTERY
      ================================================ */}

      <Box mt={2}>
        <MasterySection
          mastery={mastery}
          skills={skills}
        />
      </Box>

      {/* ================================================
          PENDING RESULTS
      ================================================ */}

      <Box mt={2}>
        <PendingResults results={results} />
      </Box>

      {/* ================================================
          EXAM HISTORY
      ================================================ */}

      <Box mt={2}>
        <ExamHistory results={results} />
      </Box>

    
    </Box>
  );
}