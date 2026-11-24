import { NextRequest } from "next/server";
import { Types } from "mongoose";

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePositiveInt(
  value: string | null,
  fallback: number,
  max: number
) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), max);
}

export function isValidObjectId(id: string) {
  return Types.ObjectId.isValid(id);
}

export function buildQuestionBankFilter(
  request: NextRequest
) {
  const params = request.nextUrl.searchParams;

  const filter: Record<string, any> = {};

  const exactFilters = [
    "course",
    "subject",
    "chapter",
    "subtopic",
    "type",
    "category",
    "difficulty",
    "status",
    "selection.level",
    "verification.status",
  ];

  for (const field of exactFilters) {
    const value = params.get(field);

    if (value && value !== "all") {
      filter[field] = value;
    }
  }

  const purpose = params.get("purpose");

  if (purpose && purpose !== "all") {
    filter["selection.purpose"] = purpose;
  }

  const search = params.get("search")?.trim();

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { questionId: regex },
      { course: regex },
      { subject: regex },
      { chapter: regex },
      { subtopic: regex },
      { "prompt.value": regex },
      { "options.content.value": regex },
      { "solution.explanation.value": regex },
      { "steps.instruction.value": regex },
      { "steps.explanation.value": regex },
      { "parts.prompt.value": regex },
      { "parts.options.content.value": regex },
      { "learning.objective": regex },
      { "learning.skills.name": regex },
      { "selection.tags": regex },
    ];
  }

  const fromDate = params.get("fromDate");
  const toDate = params.get("toDate");

  if (fromDate || toDate) {
    filter.createdAt = {};

    if (fromDate) {
      const start = new Date(fromDate);

      if (!Number.isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
    }

    if (toDate) {
      const end = new Date(toDate);

      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (!Object.keys(filter.createdAt).length) {
      delete filter.createdAt;
    }
  }

  return filter;
}

export function removeMongoFields(document: any) {
  const {
    _id,
    __v,
    createdAt,
    updatedAt,
    ...rest
  } = document;

  return rest;
}