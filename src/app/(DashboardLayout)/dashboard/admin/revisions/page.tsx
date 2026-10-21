
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

type ActivityType = "mcq" | "rapid_fire" | "explain" | "flashcard";
type Difficulty = "easy" | "moderate" | "difficult";

type ActivityDraft = {
  type: ActivityType;
  prompt: string;
  imageUrl: string;
  options: string[];
  optionType: "text" | "image";
  optionImages: string[];
  optionsInQuestionImage: boolean;
  correctAnswer: string;
  explanation: string;
  hintType: "text" | "image";
  hint: string;
  hintImageUrl: string;
  difficulty: Difficulty;
  timeLimitSeconds: number;
};

type Student = {
  id: string;
  name: string;
  username: string;
  email: string;
};

type Revision = {
  id: string;
  title: string;
  course: string;
  subject: string;
  chapter: string;
  topic: string;
  dueDate: string;
  activityCount: number;
  studentStatuses: {
    studentId: string;
    studentName: string;
    status: string;
  }[];
};

type StructureRow = {
  course?: string;
  subject?: string;
  chapter?: string;
  level?: string;
};

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const blankActivity = (type: ActivityType = "mcq"): ActivityDraft => ({
  type,
  prompt: "",
  imageUrl: "",
  options:
    type === "mcq" || type === "rapid_fire"
      ? ["", "", "", ""]
      : [],
  optionType: "text",
  optionImages: ["", "", "", ""],
  optionsInQuestionImage: false,
  correctAnswer: "",
  explanation: "",
  hintType: "text",
  hint: "",
  hintImageUrl: "",
  difficulty: "moderate",
  timeLimitSeconds: 15,
});

const field =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

const label = "block text-sm font-semibold text-slate-700";

const typeLabels: Record<ActivityType, string> = {
  mcq: "MCQ",
  rapid_fire: "Rapid Fire",
  explain: "Explain",
  flashcard: "Flashcard",
};

const typeIcons: Record<ActivityType, string> = {
  mcq: "☑",
  rapid_fire: "⚡",
  explain: "✎",
  flashcard: "▤",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function isImageFile(file: File) {
  return file.type.startsWith("image/") && file.size > 0 && file.size <= MAX_IMAGE_SIZE;
}

function pendingImage(key: string) {
  return `pending:${key}`;
}

function isPendingImage(value: string) {
  return value.startsWith("pending:");
}

function isCloudinaryImage(value: string) {
  return value.startsWith("https://res.cloudinary.com/");
}

export default function TeacherRevisionsPage() {
  const [courses, setCourses] = useState<string[]>([]);
  const [course, setCourse] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [structure, setStructure] = useState<StructureRow[]>([]);

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [assignedDate, setAssignedDate] = useState(today());
  const [dueDate, setDueDate] = useState(today());

  const [assignToAll, setAssignToAll] = useState(true);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityDraft[]>([
    blankActivity(),
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showBuilder, setShowBuilder] = useState(true);
  const [expandedActivity, setExpandedActivity] = useState<number | null>(0);

  // Images stay in the browser until Publish. They are sent to the single API.
  const [imageFiles, setImageFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const previewUrls = useRef<Record<string, string>>({});

  useEffect(() => {
    return () => {
      Object.values(previewUrls.current).forEach((url) =>
        URL.revokeObjectURL(url)
      );
      previewUrls.current = {};
    };
  }, []);

  const structureForCourse = useMemo(
    () => structure.filter((row) => row.course?.trim() === course),
    [structure, course]
  );

  const subjects = useMemo(
    () =>
      Array.from(
        new Set(
          structureForCourse
            .map((row) => row.subject?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ),
    [structureForCourse]
  );

  const chapters = useMemo(
    () =>
      Array.from(
        new Set(
          structureForCourse
            .filter((row) => row.subject?.trim() === subject)
            .map((row) => row.chapter?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ),
    [structureForCourse, subject]
  );

  const loadRevisions = useCallback(async (selectedCourse = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/revision-teacher${selectedCourse ? `?course=${encodeURIComponent(selectedCourse)}` : ""}`,
        { cache: "no-store" }
      );

      const result: unknown = await response.json().catch(() => null);

      if (
        !response.ok ||
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        result.success !== true
      ) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : `Unable to load revisions (HTTP ${response.status}).`;

        throw new Error(message);
      }

      const data = result as {
        courses?: unknown;
        course?: unknown;
        students?: unknown;
        revisions?: unknown;
      };

      const availableCourses = Array.isArray(data.courses)
        ? data.courses.filter(
            (value): value is string => typeof value === "string"
          )
        : [];

      setCourses(availableCourses);

      const responseCourse =
        typeof data.course === "string" ? data.course : "";

      setCourse((current) =>
        selectedCourse && availableCourses.includes(selectedCourse)
          ? selectedCourse
          : current && availableCourses.includes(current)
            ? current
            : responseCourse || availableCourses[0] || ""
      );

      setStudents(
        Array.isArray(data.students) ? (data.students as Student[]) : []
      );

      setRevisions(
        Array.isArray(data.revisions) ? (data.revisions as Revision[]) : []
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to load revisions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRevisions();
  }, [loadRevisions]);

  useEffect(() => {
    let cancelled = false;

    async function loadStructure() {
      try {
        const response = await fetch("/api/Get-availage-filter?type=all", {
          cache: "no-store",
        });

        const result: unknown = await response.json().catch(() => null);

        if (
          !response.ok ||
          !result ||
          typeof result !== "object" ||
          !("success" in result) ||
          result.success !== true
        ) {
          const message =
            result &&
            typeof result === "object" &&
            "message" in result &&
            typeof result.message === "string"
              ? result.message
              : `Unable to load course chapters (HTTP ${response.status}).`;

          throw new Error(message);
        }

        if (!cancelled) {
          setStructure(
            "data" in result && Array.isArray(result.data)
              ? (result.data as StructureRow[])
              : []
          );
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load course chapters."
          );
        }
      }
    }

    void loadStructure();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSubject((current) =>
      subjects.includes(current) ? current : subjects[0] || ""
    );
  }, [course, subjects]);

  useEffect(() => {
    setChapter((current) =>
      chapters.includes(current) ? current : chapters[0] || ""
    );
  }, [subject, chapters]);

  function updateActivity(index: number, patch: Partial<ActivityDraft>) {
    setActivities((current) =>
      current.map((activity, i) =>
        i === index ? { ...activity, ...patch } : activity
      )
    );
  }

  function updateOption(index: number, optionIndex: number, value: string) {
    setActivities((current) =>
      current.map((activity, i) =>
        i !== index
          ? activity
          : {
              ...activity,
              options: activity.options.map((option, j) =>
                j === optionIndex ? value : option
              ),
            }
      )
    );
  }

  function setLocalPreview(key: string, file?: File) {
    const previous = previewUrls.current[key];

    if (previous) URL.revokeObjectURL(previous);

    if (!file) {
      delete previewUrls.current[key];

      setPreviews((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });

      return;
    }

    const nextUrl = URL.createObjectURL(file);
    previewUrls.current[key] = nextUrl;
    setPreviews((current) => ({ ...current, [key]: nextUrl }));
  }

  function removeStoredFile(key: string) {
    setImageFiles((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });

    setLocalPreview(key);
  }

  async function handleImage(
    index: number,
    key: "imageUrl" | "hintImageUrl",
    file?: File
  ) {
    const fileKey = `${index}-${key}`;

    if (!file) {
      removeStoredFile(fileKey);
      updateActivity(index, { [key]: "" });
      return;
    }

    if (!isImageFile(file)) {
      setError("Choose an image of 5 MB or smaller.");
      return;
    }

    setError("");
    setLocalPreview(fileKey, file);
    setImageFiles((current) => ({ ...current, [fileKey]: file }));
    updateActivity(index, { [key]: pendingImage(fileKey) });
  }

  async function handleOptionImage(
    index: number,
    optionIndex: number,
    file?: File
  ) {
    const fileKey = `${index}-option-${optionIndex}`;

    if (!file) {
      removeStoredFile(fileKey);

      setActivities((current) =>
        current.map((activity, i) =>
          i !== index
            ? activity
            : {
                ...activity,
                optionImages: activity.optionImages.map((image, j) =>
                  j === optionIndex ? "" : image
                ),
              }
        )
      );

      return;
    }

    if (!isImageFile(file)) {
      setError("Choose an image of 5 MB or smaller.");
      return;
    }

    setError("");
    setLocalPreview(fileKey, file);
    setImageFiles((current) => ({ ...current, [fileKey]: file }));

    setActivities((current) =>
      current.map((activity, i) =>
        i !== index
          ? activity
          : {
              ...activity,
              optionImages: activity.optionImages.map((image, j) =>
                j === optionIndex ? pendingImage(fileKey) : image
              ),
            }
      )
    );
  }

  function clearOptionImages(index: number) {
    for (let optionIndex = 0; optionIndex < 4; optionIndex += 1) {
      removeStoredFile(`${index}-option-${optionIndex}`);
    }
  }

  function addActivity(type: ActivityType) {
    setActivities((current) => [...current, blankActivity(type)]);
    setExpandedActivity(activities.length);
  }

  function removeActivity(index: number) {
    // Revoke previews for the deleted activity and shift later image keys.
    Object.keys(previewUrls.current).forEach((key) => {
      const match = key.match(/^(\d+)-/);
      if (match && Number(match[1]) === index) {
        URL.revokeObjectURL(previewUrls.current[key]);
        delete previewUrls.current[key];
      }
    });

    const remapRecord = <T,>(record: Record<string, T>) => {
      const next: Record<string, T> = {};

      for (const [key, value] of Object.entries(record)) {
        const match = key.match(/^(\d+)-(.*)$/);

        if (!match) {
          next[key] = value;
          continue;
        }

        const oldIndex = Number(match[1]);

        if (oldIndex === index) continue;

        const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
        next[`${newIndex}-${match[2]}`] = value;
      }

      return next;
    };

    setImageFiles((current) => remapRecord(current));

    setPreviews((current) => {
      const next = remapRecord(current);

      // Keep the preview ref in sync with the remapped state.
      previewUrls.current = remapRecord(previewUrls.current);

      return next;
    });

    setActivities((current) => current.filter((_, i) => i !== index));
    setExpandedActivity(null);
  }

  function toggleStudent(id: string, checked: boolean) {
    setStudentIds((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id)
    );
  }

  function clearForm() {
    Object.values(previewUrls.current).forEach((url) =>
      URL.revokeObjectURL(url)
    );

    previewUrls.current = {};
    setPreviews({});
    setImageFiles({});

    setTitle("");
    setInstructions("");
    setTopic("");
    setAssignedDate(today());
    setDueDate(today());
    setActivities([blankActivity()]);
    setExpandedActivity(0);
    setAssignToAll(true);
    setStudentIds([]);
  }

  function hasImage(value: string) {
    if (isCloudinaryImage(value)) return true;
    if (!isPendingImage(value)) return false;

    const fileKey = value.slice("pending:".length);
    return Boolean(imageFiles[fileKey]);
  }

  async function publish(event: FormEvent) {
    event.preventDefault();

    if (!course || !title.trim() || !subject || !chapter) {
      setError("Choose a class, title, subject, and chapter before publishing.");
      return;
    }

    if (dueDate < assignedDate) {
      setError("Deadline cannot be before the assigned date.");
      return;
    }

    for (let index = 0; index < activities.length; index += 1) {
      const activity = activities[index];
      const number = index + 1;
      const isChoice =
        activity.type === "mcq" || activity.type === "rapid_fire";

      if (!activity.prompt.trim() && !hasImage(activity.imageUrl)) {
        setError(
          `Question ${number}: add question text or select a question image.`
        );
        return;
      }

      if (activity.imageUrl && !hasImage(activity.imageUrl)) {
        setError(`Question ${number}: select the question image again.`);
        return;
      }

      if (isChoice) {
        if (activity.optionsInQuestionImage) {
          if (!hasImage(activity.imageUrl)) {
            setError(
              `Question ${number}: select the image containing the answer options.`
            );
            return;
          }

          if (!["A", "B", "C", "D"].includes(activity.correctAnswer)) {
            setError(
              `Question ${number}: choose the correct option A, B, C, or D.`
            );
            return;
          }
        } else if (activity.optionType === "text") {
          if (
            activity.options.length !== 4 ||
            activity.options.some((option) => !option.trim())
          ) {
            setError(`Question ${number}: fill all four text options.`);
            return;
          }

          if (!["A", "B", "C", "D"].includes(activity.correctAnswer)) {
            setError(
              `Question ${number}: choose the correct option A, B, C, or D.`
            );
            return;
          }
        } else {
          if (
            activity.optionImages.length !== 4 ||
            activity.optionImages.some((image) => !hasImage(image))
          ) {
            setError(`Question ${number}: select all four option images.`);
            return;
          }

          if (!["A", "B", "C", "D"].includes(activity.correctAnswer)) {
            setError(
              `Question ${number}: choose the correct option A, B, C, or D.`
            );
            return;
          }
        }
      } else if (!activity.correctAnswer.trim()) {
        setError(
          `Question ${number}: add the answer or back of the flashcard.`
        );
        return;
      }

      if (
        activity.hintType === "image" &&
        !hasImage(activity.hintImageUrl)
      ) {
        setError(
          `Question ${number}: select the hint image or switch the hint type to text.`
        );
        return;
      }
    }

    if (!assignToAll && !studentIds.length) {
      setError(
        "Select at least one student or assign the revision to the whole class."
      );
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payloadActivities = activities.map((activity) => ({
        ...activity,
        correctAnswer:
          activity.type === "mcq" || activity.type === "rapid_fire"
            ? activity.correctAnswer.toUpperCase()
            : activity.correctAnswer.trim(),
      }));

      // One request contains all revision fields and all selected image files.
      const formData = new FormData();

      formData.append("course", course);
      formData.append("title", title);
      formData.append("instructions", instructions);
      formData.append("subject", subject);
      formData.append("chapter", chapter);
      formData.append("topic", topic);
      formData.append("assignedDate", assignedDate);
      formData.append("dueDate", dueDate);
      formData.append("assignToAll", String(assignToAll));
      formData.append("studentIds", JSON.stringify(studentIds));
      formData.append("activities", JSON.stringify(payloadActivities));

      for (const [key, file] of Object.entries(imageFiles)) {
        formData.append(key, file, file.name);
      }

      const response = await fetch("/api/revision-teacher", {
        method: "POST",
        body: formData,
        cache: "no-store",
      });

      const result: unknown = await response.json().catch(() => null);

      if (
        !response.ok ||
        !result ||
        typeof result !== "object" ||
        !("success" in result) ||
        result.success !== true
      ) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : `Unable to publish revision (HTTP ${response.status}).`;

        throw new Error(message);
      }

      const successResult = result as {
        questionBankInsertedCount?: number;
      };

      clearForm();

      setNotice(
        successResult.questionBankInsertedCount
          ? `Revision published. ${successResult.questionBankInsertedCount} MCQ/Rapid Fire question(s) were also added to Question Bank.`
          : "Revision published successfully."
      );

      setShowBuilder(false);
      await loadRevisions(course);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to publish revision."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F6FC] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-br from-violet-950 via-violet-800 to-indigo-700 p-6 text-white shadow-lg sm:p-8">
          <a
            href="/dashboard/admin/attendance"
            className="text-sm text-violet-200 hover:text-white"
          >
            ← Study Calendar
          </a>

          <div className="mt-6 grid gap-5 md:grid-cols-[1fr_260px] md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
                Innovative Academy
              </p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                Revision Studio
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-violet-100">
                Create a revision session in a few steps. Add questions,
                choose students, publish.
              </p>
            </div>

            <label className="block text-sm font-semibold text-violet-100">
              Class / course
              <select
                value={course}
                onChange={(event) => {
                  setCourse(event.target.value);
                  void loadRevisions(event.target.value);
                }}
                disabled={!courses.length}
                className="mt-2 w-full rounded-xl border border-white/20 bg-white px-3 py-3 text-sm font-semibold text-violet-950"
              >
                {courses.length ? (
                  courses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))
                ) : (
                  <option value="">No classes assigned</option>
                )}
              </select>
            </label>
          </div>
        </header>

        {(error || notice) && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || notice}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowBuilder((value) => !value)}
            className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white hover:bg-violet-800"
          >
            {showBuilder ? "Hide builder" : "+ Create revision"}
          </button>

          <a
            href="/dashboard/admin/attendance"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Attendance & homework
          </a>
        </div>

        {showBuilder && (
          <form
            onSubmit={publish}
            className="space-y-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <div>
              <h2 className="text-xl font-bold">New revision</h2>
              <p className="mt-1 text-sm text-slate-500">
                Start with the session details, then add any mix of question
                types.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className={label}>
                Revision title
                <input
                  required
                  maxLength={160}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Friction revision"
                  className={field}
                />
              </label>

              <label className={label}>
                Subject
                <select
                  required
                  value={subject}
                  onChange={(event) => {
                    setSubject(event.target.value);
                    setChapter("");
                  }}
                  className={field}
                >
                  {subjects.length ? (
                    subjects.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))
                  ) : (
                    <option value="">No subjects found for this course</option>
                  )}
                </select>
              </label>

              <label className={label}>
                Chapter
                <select
                  required
                  value={chapter}
                  onChange={(event) => setChapter(event.target.value)}
                  className={field}
                >
                  {chapters.length ? (
                    chapters.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))
                  ) : (
                    <option value="">No chapters found for this subject</option>
                  )}
                </select>
              </label>

              <label className={label}>
                Topic (optional)
                <input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Specific concept"
                  className={field}
                />
              </label>

              <label className={label}>
                Assign date
                <input
                  type="date"
                  required
                  value={assignedDate}
                  onChange={(event) => setAssignedDate(event.target.value)}
                  className={field}
                />
              </label>

              <label className={label}>
                Deadline
                <input
                  type="date"
                  required
                  min={assignedDate}
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={field}
                />
              </label>
            </div>

            <label className={label}>
              Instructions (optional)
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                rows={2}
                maxLength={3000}
                placeholder="Any short note for students"
                className={field}
              />
            </label>

            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Images are kept ready while you edit and uploaded securely when
              you publish. Maximum image size: 5 MB.
            </p>

            <section className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-bold">
                    Questions{" "}
                    <span className="text-sm font-medium text-slate-400">
                      ({activities.length})
                    </span>
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Tap a type to add a question. Edit questions below.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    ["mcq", "rapid_fire", "explain", "flashcard"] as ActivityType[]
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addActivity(type)}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-100"
                    >
                      + {typeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>

              {activities.map((activity, index) => {
                const isChoice =
                  activity.type === "mcq" ||
                  activity.type === "rapid_fire";
                const expanded = expandedActivity === index;

                return (
                  <article
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-lg text-violet-800">
                        {typeIcons[activity.type]}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedActivity(expanded ? null : index)
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block text-sm font-bold">
                          {index + 1}. {typeLabels[activity.type]}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {activity.prompt || "New question — click to edit"}
                        </span>
                      </button>

                      {activity.type === "rapid_fire" && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          {activity.timeLimitSeconds}s
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        disabled={activities.length === 1 || saving}
                        aria-label="Remove question"
                        className="rounded-lg px-2 py-1 text-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                      >
                        ×
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedActivity(expanded ? null : index)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold"
                      >
                        {expanded ? "Close" : "Edit"}
                      </button>
                    </div>

                    {expanded && (
                      <div className="space-y-4 p-4">
                        <label className={label}>
                          {activity.type === "flashcard"
                            ? "Front of card"
                            : "Question / prompt"}
                          <textarea
                            required={!activity.imageUrl}
                            value={activity.prompt}
                            onChange={(event) =>
                              updateActivity(index, {
                                prompt: event.target.value,
                              })
                            }
                            rows={2}
                            maxLength={4000}
                            placeholder="Type the question or select an image"
                            className={field}
                          />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                          <label className={label}>
                            Question image (optional)
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.currentTarget.value = "";
                                void handleImage(index, "imageUrl", file);
                              }}
                              className="mt-2 block w-full text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:font-semibold file:text-violet-800"
                            />
                          </label>

                          {(previews[`${index}-imageUrl`] ||
                            (isCloudinaryImage(activity.imageUrl)
                              ? activity.imageUrl
                              : "")) && (
                            <div className="flex items-start gap-2">
                              <img
                                src={
                                  previews[`${index}-imageUrl`] ||
                                  activity.imageUrl
                                }
                                alt="Question preview"
                                className="max-h-24 max-w-36 rounded-lg border object-contain"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  void handleImage(index, "imageUrl")
                                }
                                className="text-xs font-semibold text-rose-600"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>

                        {isChoice && (
                          <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-bold">Answer options</p>

                              <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                                {(["text", "image"] as const).map(
                                  (optionType) => (
                                    <button
                                      key={optionType}
                                      type="button"
                                      onClick={() => {
                                        clearOptionImages(index);
                                        updateActivity(index, {
                                          optionType,
                                          options: ["", "", "", ""],
                                          optionImages: ["", "", "", ""],
                                          correctAnswer: "",
                                        });
                                      }}
                                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                                        activity.optionType === optionType
                                          ? "bg-violet-700 text-white"
                                          : "text-slate-600"
                                      }`}
                                    >
                                      {optionType === "text"
                                        ? "Text options"
                                        : "Image options"}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>

                            <label className="mt-3 flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
                              <input
                                type="checkbox"
                                checked={activity.optionsInQuestionImage}
                                disabled={!hasImage(activity.imageUrl)}
                                onChange={(event) =>
                                  updateActivity(index, {
                                    optionsInQuestionImage:
                                      event.target.checked,
                                    correctAnswer: "",
                                  })
                                }
                                className="mt-0.5 h-4 w-4 accent-violet-700"
                              />
                              <span>
                                <strong>
                                  Answer options are already included in the
                                  question image
                                </strong>
                                <span className="mt-1 block text-xs text-violet-700">
                                  Upload a question image containing the
                                  choices. Text/image option fields remain
                                  available, but are not used when this is
                                  enabled.
                                </span>
                              </span>
                            </label>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {[0, 1, 2, 3].map((optionIndex) => {
                                const optionKey = `${index}-option-${optionIndex}`;
                                const optionLetter = String.fromCharCode(
                                  65 + optionIndex
                                );

                                return (
                                  <div
                                    key={optionIndex}
                                    className="rounded-xl border border-slate-200 bg-white p-3"
                                  >
                                    <p className="mb-1 text-xs font-bold text-slate-500">
                                      Option {optionLetter}
                                    </p>

                                    {activity.optionType === "text" ? (
                                      <input
                                        required={
                                          !activity.optionsInQuestionImage
                                        }
                                        value={
                                          activity.options[optionIndex] || ""
                                        }
                                        onChange={(event) =>
                                          updateOption(
                                            index,
                                            optionIndex,
                                            event.target.value
                                          )
                                        }
                                        placeholder={`Option ${optionLetter}`}
                                        className={field}
                                      />
                                    ) : (
                                      <>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(event) => {
                                            const file =
                                              event.target.files?.[0];
                                            event.currentTarget.value = "";
                                            void handleOptionImage(
                                              index,
                                              optionIndex,
                                              file
                                            );
                                          }}
                                          className="block w-full text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-violet-100 file:px-2 file:py-1.5 file:font-semibold file:text-violet-800"
                                        />

                                        {(previews[optionKey] ||
                                          (isCloudinaryImage(
                                            activity.optionImages[optionIndex] ||
                                              ""
                                          )
                                            ? activity.optionImages[optionIndex]
                                            : "")) && (
                                          <div className="mt-2 flex items-start gap-2">
                                            <img
                                              src={
                                                previews[optionKey] ||
                                                activity.optionImages[
                                                  optionIndex
                                                ]
                                              }
                                              alt={`Option ${optionLetter}`}
                                              className="max-h-24 max-w-full rounded-lg border object-contain"
                                            />
                                            <button
                                              type="button"
                                              onClick={() =>
                                                void handleOptionImage(
                                                  index,
                                                  optionIndex
                                                )
                                              }
                                              className="text-xs font-semibold text-rose-600"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        )}

                                        <input
                                          value={
                                            activity.options[optionIndex] || ""
                                          }
                                          onChange={(event) =>
                                            updateOption(
                                              index,
                                              optionIndex,
                                              event.target.value
                                            )
                                          }
                                          placeholder="Optional label"
                                          className={field}
                                        />
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <label className={`${label} mt-3`}>
                              Correct option
                              <select
                                required
                                value={activity.correctAnswer}
                                onChange={(event) =>
                                  updateActivity(index, {
                                    correctAnswer: event.target.value,
                                  })
                                }
                                className={field}
                              >
                                <option value="">Choose correct answer</option>
                                {[0, 1, 2, 3].map((optionIndex) => {
                                  const letter = String.fromCharCode(
                                    65 + optionIndex
                                  );
                                  const optionText =
                                    activity.options[optionIndex]?.trim();
                                  const disabled =
                                    !activity.optionsInQuestionImage &&
                                    activity.optionType === "text" &&
                                    !optionText;

                                  return (
                                    <option
                                      key={letter}
                                      value={letter}
                                      disabled={disabled}
                                    >
                                      {letter}
                                      {activity.optionsInQuestionImage
                                        ? " · In question image"
                                        : activity.optionType === "text"
                                          ? ` · ${optionText || "Empty option"}`
                                          : " · Image"}
                                    </option>
                                  );
                                })}
                              </select>
                            </label>
                          </div>
                        )}

                        {!isChoice && (
                          <label className={label}>
                            {activity.type === "flashcard"
                              ? "Back of card / answer"
                              : "Model answer"}
                            <textarea
                              required
                              value={activity.correctAnswer}
                              onChange={(event) =>
                                updateActivity(index, {
                                  correctAnswer: event.target.value,
                                })
                              }
                              rows={2}
                              maxLength={5000}
                              placeholder="Write the answer students should learn"
                              className={field}
                            />
                          </label>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className={label}>
                            Difficulty
                            <select
                              value={activity.difficulty}
                              onChange={(event) =>
                                updateActivity(index, {
                                  difficulty: event.target.value as Difficulty,
                                })
                              }
                              className={field}
                            >
                              <option value="easy">Easy</option>
                              <option value="moderate">Moderate</option>
                              <option value="difficult">Difficult</option>
                            </select>
                          </label>

                          {activity.type === "rapid_fire" && (
                            <label className={label}>
                              Time limit
                              <select
                                value={activity.timeLimitSeconds}
                                onChange={(event) =>
                                  updateActivity(index, {
                                    timeLimitSeconds: Number(
                                      event.target.value
                                    ),
                                  })
                                }
                                className={field}
                              >
                                <option value={15}>15 seconds</option>
                                <option value={20}>20 seconds</option>
                              </select>
                            </label>
                          )}
                        </div>

                        <details className="rounded-xl border border-slate-200 px-3 py-2.5">
                          <summary className="cursor-pointer text-sm font-semibold text-violet-800">
                            Hint & explanation (optional)
                          </summary>

                          <div className="mt-3 space-y-3">
                            <label className={label}>
                              Explanation
                              <textarea
                                value={activity.explanation}
                                onChange={(event) =>
                                  updateActivity(index, {
                                    explanation: event.target.value,
                                  })
                                }
                                rows={2}
                                maxLength={5000}
                                placeholder="Optional explanation"
                                className={field}
                              />
                            </label>

                            <label className={label}>
                              Hint type
                              <select
                                value={activity.hintType}
                                onChange={(event) => {
                                  if (activity.hintType === "image") {
                                    removeStoredFile(
                                      `${index}-hintImageUrl`
                                    );
                                  }

                                  updateActivity(index, {
                                    hintType: event.target.value as
                                      | "text"
                                      | "image",
                                    hint: "",
                                    hintImageUrl: "",
                                  });
                                }}
                                className={field}
                              >
                                <option value="text">Text hint</option>
                                <option value="image">Image hint</option>
                              </select>
                            </label>

                            {activity.hintType === "text" ? (
                              <label className={label}>
                                Hint
                                <textarea
                                  value={activity.hint}
                                  onChange={(event) =>
                                    updateActivity(index, {
                                      hint: event.target.value,
                                    })
                                  }
                                  rows={2}
                                  maxLength={5000}
                                  placeholder="A small clue to guide the student"
                                  className={field}
                                />
                              </label>
                            ) : (
                              <div>
                                <label className={label}>
                                  Hint image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => {
                                      const file = event.target.files?.[0];
                                      event.currentTarget.value = "";
                                      void handleImage(
                                        index,
                                        "hintImageUrl",
                                        file
                                      );
                                    }}
                                    className="mt-2 block w-full text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:font-semibold file:text-violet-800"
                                  />
                                </label>

                                {(previews[`${index}-hintImageUrl`] ||
                                  (isCloudinaryImage(activity.hintImageUrl)
                                    ? activity.hintImageUrl
                                    : "")) && (
                                  <div className="mt-2 flex items-start gap-2">
                                    <img
                                      src={
                                        previews[`${index}-hintImageUrl`] ||
                                        activity.hintImageUrl
                                      }
                                      alt="Hint preview"
                                      className="max-h-28 rounded-lg border object-contain"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleImage(index, "hintImageUrl")
                                      }
                                      className="text-xs font-semibold text-rose-600"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>

            <section className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-bold">Assign to students</h3>

              <label className="mt-3 flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={assignToAll}
                  onChange={(event) => setAssignToAll(event.target.checked)}
                  className="h-4 w-4 accent-violet-700"
                />
                Everyone in {course || "this class"}
              </label>

              {!assignToAll && (
                <div className="mt-3 max-h-52 space-y-1 overflow-y-auto rounded-xl bg-slate-50 p-2">
                  {students.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 rounded-lg p-2 text-sm hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={studentIds.includes(student.id)}
                        onChange={(event) =>
                          toggleStudent(student.id, event.target.checked)
                        }
                        className="h-4 w-4 accent-violet-700"
                      />
                      <span>{student.name}</span>
                      <span className="ml-auto text-xs text-slate-400">
                        {student.username || student.email}
                      </span>
                    </label>
                  ))}

                  {!students.length && (
                    <p className="p-2 text-sm text-slate-500">
                      No students found.
                    </p>
                  )}
                </div>
              )}
            </section>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={clearForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear form
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  !course ||
                  !title.trim() ||
                  !activities.length ||
                  !subject ||
                  !chapter ||
                  (!assignToAll && !studentIds.length)
                }
                className="rounded-xl bg-violet-700 px-6 py-3 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50"
              >
                {saving ? "Publishing…" : "Publish revision →"}
              </button>
            </div>
          </form>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Published revisions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Track which students have started or completed each revision.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">
              Loading revisions…
            </div>
          ) : revisions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-bold">Nothing published yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Create your first revision above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {revisions.map((revision) => {
                const completed = revision.studentStatuses.filter(
                  (student) => student.status === "completed"
                ).length;

                const attempted = revision.studentStatuses.filter(
                  (student) => student.status === "attempted"
                ).length;

                const total = revision.studentStatuses.length;
                const percentage = total
                  ? Math.round((completed / total) * 100)
                  : 0;

                return (
                  <article
                    key={revision.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
                          {revision.subject || revision.course}
                        </p>
                        <h3 className="mt-2 font-bold">{revision.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {[revision.chapter, revision.topic]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800">
                        {revision.activityCount} questions
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-xs text-emerald-700">Completed</p>
                        <p className="mt-1 text-xl font-bold text-emerald-800">
                          {completed}
                        </p>
                      </div>

                      <div className="rounded-xl bg-amber-50 p-3">
                        <p className="text-xs text-amber-700">In progress</p>
                        <p className="mt-1 text-xl font-bold text-amber-800">
                          {attempted}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-3">
                        <p className="text-xs text-slate-600">Not started</p>
                        <p className="mt-1 text-xl font-bold text-slate-800">
                          {total - completed - attempted}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      Deadline: {revision.dueDate || "—"}
                    </p>

                    <details className="mt-4 border-t border-slate-100 pt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-violet-700">
                        View student progress
                      </summary>

                      <div className="mt-3 space-y-2">
                        {revision.studentStatuses.map((student) => (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
                          >
                            <span className="text-sm">
                              {student.studentName}
                            </span>
                            <span className="text-xs font-semibold capitalize text-slate-500">
                              {student.status.replaceAll("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-400">
          Innovative Academy · Revision Studio
        </footer>
      </div>
    </main>
  );
}
