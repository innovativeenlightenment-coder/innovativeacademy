
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import LiveRoom from "@/app/(DashboardLayout)/dashboard/components/learning/LiveRoom";

interface LiveSession {
  _id: string;
  title: string;
  status: "live" | "ended";
}

type MetadataLevel = "courses" | "subjects" | "chapters" | "subtopics";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-gray-100";

function getErrorMessage(data: any, fallback: string) {
  return data?.error || data?.message || fallback;
}

function getMetadataNames(data: any): string[] {
  const values = Array.isArray(data?.values) ? data.values : [];

  return Array.from(
    new Set(
      values
        .map((item: any) => {
          if (typeof item === "string") return item.trim();
          return String(item?.name || item?.title || item?.value || "").trim();
        })
        .filter(Boolean)
    )
  );
}

export default function TeacherLiveClassPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = params.sessionId as string;
  const selectedDate = searchParams.get("date");
const shouldAutoEnd = searchParams.get("action") === "end";

  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");

  // Coverage modal
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [coverageSaving, setCoverageSaving] = useState(false);
  const [coverageError, setCoverageError] = useState("");

  // Metadata
  const [courses, setCourses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [availableSubtopics, setAvailableSubtopics] = useState<string[]>([]);

  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [manualSubtopic, setManualSubtopic] = useState("");

  const [metadataLoading, setMetadataLoading] = useState({
    courses: false,
    subjects: false,
    chapters: false,
    subtopics: false,
  });

  const [metadataError, setMetadataError] = useState({
    courses: "",
    subjects: "",
    chapters: "",
    subtopics: "",
  });

  const returnToDailyLectures = useCallback(() => {
    const query = selectedDate
      ? `?date=${encodeURIComponent(selectedDate)}`
      : "";

    router.replace(`/dashboard/admin/daily-lectures${query}`);
  }, [router, selectedDate]);

  // =========================================================
  // LOAD LIVE SESSION
  // =========================================================

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/Live-Class/status", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Could not load live class.")
        );
      }

      const sessions: LiveSession[] = Array.isArray(data.sessions)
        ? data.sessions
        : [];

      const current = sessions.find(
        (item) => String(item._id) === String(sessionId)
      );

      if (!current || current.status !== "live") {
        throw new Error("This live classroom is no longer available.");
      }

      setSession(current);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load classroom."
      );
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId, loadSession]);

  // =========================================================
  // METADATA API
  // =========================================================

  const fetchMetadata = useCallback(
    async (
      level: MetadataLevel,
      params: Record<string, string> = {},
      signal?: AbortSignal
    ) => {
      const query = new URLSearchParams({ level, ...params });

      const response = await fetch(
        `/api/QuestionBankV2/metadata?${query.toString()}`,
        {
          cache: "no-store",
          signal,
        }
      );

      const data = await response.json();

      if (!response.ok || data?.success === false) {
        throw new Error(
          getErrorMessage(data, "Could not load metadata.")
        );
      }

      return getMetadataNames(data);
    },
    []
  );

const jitsiApiRef = useRef<any>(null);

const recordingControlsRef = useRef<{
  stopRecording: () => Promise<void>;
} | null>(null);

const endingClassRef = useRef(false);
const autoEndStartedRef = useRef(false);

const [jitsiReady, setJitsiReady] = useState(false);
const [recordingReady, setRecordingReady] = useState(false);

const handleApiReady = useCallback((api: any) => {
  jitsiApiRef.current = api;
  setJitsiReady(true);
}, []);

const handleRecordingControlsReady = useCallback(
  (controls: { stopRecording: () => Promise<void> }) => {
    recordingControlsRef.current = controls;
    setRecordingReady(true);
  },
  []
);

const handleRoomLeave = useCallback(() => {
  if (endingClassRef.current) return;
  returnToDailyLectures();
}, [returnToDailyLectures]);
  // Load courses when modal opens
  useEffect(() => {
    if (!showCoverageModal) return;

    const controller = new AbortController();

    setMetadataLoading((previous) => ({
      ...previous,
      courses: true,
    }));

    setMetadataError((previous) => ({
      ...previous,
      courses: "",
    }));

    fetchMetadata("courses", {}, controller.signal)
      .then((values) => {
        if (!controller.signal.aborted) {
          setCourses(values);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setMetadataError((previous) => ({
            ...previous,
            courses:
              err instanceof Error ? err.message : "Could not load courses.",
          }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMetadataLoading((previous) => ({
            ...previous,
            courses: false,
          }));
        }
      });

    return () => controller.abort();
  }, [showCoverageModal, fetchMetadata]);

  // Load subjects
  useEffect(() => {
    if (!showCoverageModal || !course) {
      setSubjects([]);
      return;
    }

    const controller = new AbortController();

    setMetadataLoading((previous) => ({
      ...previous,
      subjects: true,
    }));

    setMetadataError((previous) => ({
      ...previous,
      subjects: "",
    }));

    fetchMetadata("subjects", { course }, controller.signal)
      .then((values) => {
        if (!controller.signal.aborted) {
          setSubjects(values);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setMetadataError((previous) => ({
            ...previous,
            subjects:
              err instanceof Error ? err.message : "Could not load subjects.",
          }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMetadataLoading((previous) => ({
            ...previous,
            subjects: false,
          }));
        }
      });

    return () => controller.abort();
  }, [showCoverageModal, course, fetchMetadata]);

  // Load chapters
  useEffect(() => {
    if (!showCoverageModal || !course || !subject) {
      setChapters([]);
      return;
    }

    const controller = new AbortController();

    setMetadataLoading((previous) => ({
      ...previous,
      chapters: true,
    }));

    setMetadataError((previous) => ({
      ...previous,
      chapters: "",
    }));

    fetchMetadata("chapters", { course, subject }, controller.signal)
      .then((values) => {
        if (!controller.signal.aborted) {
          setChapters(values);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setMetadataError((previous) => ({
            ...previous,
            chapters:
              err instanceof Error ? err.message : "Could not load chapters.",
          }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMetadataLoading((previous) => ({
            ...previous,
            chapters: false,
          }));
        }
      });

    return () => controller.abort();
  }, [showCoverageModal, course, subject, fetchMetadata]);

  // Load subtopics
  useEffect(() => {
    if (!showCoverageModal || !course || !subject || !chapter) {
      setAvailableSubtopics([]);
      return;
    }

    const controller = new AbortController();

    setMetadataLoading((previous) => ({
      ...previous,
      subtopics: true,
    }));

    setMetadataError((previous) => ({
      ...previous,
      subtopics: "",
    }));

    fetchMetadata(
      "subtopics",
      { course, subject, chapter },
      controller.signal
    )
      .then((values) => {
        if (!controller.signal.aborted) {
          setAvailableSubtopics(values);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setMetadataError((previous) => ({
            ...previous,
            subtopics:
              err instanceof Error
                ? err.message
                : "Could not load subtopics.",
          }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMetadataLoading((previous) => ({
            ...previous,
            subtopics: false,
          }));
        }
      });

    return () => controller.abort();
  }, [showCoverageModal, course, subject, chapter, fetchMetadata]);

  // =========================================================
  // END CLASS
  // =========================================================

const endClass = async (skipConfirmation = false) => {
  if (ending || showCoverageModal || endingClassRef.current) return;

  if (
    !skipConfirmation &&
    !window.confirm(
      "End this live class for everyone? The recording will also be stopped and saved."
    )
  ) {
    return;
  }

  setEnding(true);
  setError("");

  try {
    // 1. Stop and save the recording.
    if (recordingControlsRef.current) {
      await recordingControlsRef.current.stopRecording();
    }

    // 2. End the session in MongoDB.
    const response = await fetch("/api/Live-Class/end", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        getErrorMessage(data, "Could not end the class.")
      );
    }

    // 3. Prevent room-leave callback from navigating away.
    endingClassRef.current = true;

    // 4. End Jitsi conference.
    try {
      jitsiApiRef.current?.executeCommand("endConference");
    } catch (jitsiError) {
      console.error("Jitsi end conference error:", jitsiError);
    }

    // 5. Show coverage modal.
    setSession((previous) =>
      previous ? { ...previous, status: "ended" } : previous
    );

    setShowCoverageModal(true);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Could not end the class."
    );
  } finally {
    setEnding(false);
  }
};

useEffect(() => {
  if (!shouldAutoEnd) return;
  if (!session || session.status !== "live") return;
  if (!jitsiReady || !recordingReady) return;
  if (ending || showCoverageModal) return;
  if (autoEndStartedRef.current) return;

  autoEndStartedRef.current = true;

  void endClass(true);
}, [
  shouldAutoEnd,
  session,
  jitsiReady,
  recordingReady,
  ending,
  showCoverageModal,
]);

  // =========================================================
  // COVERAGE FORM
  // =========================================================

  const toggleSubtopic = (topic: string) => {
    setSelectedSubtopics((previous) =>
      previous.includes(topic)
        ? previous.filter((item) => item !== topic)
        : [...previous, topic]
    );
  };

  const addManualSubtopic = () => {
    const topic = manualSubtopic.trim();

    if (!topic) return;

    const exists = selectedSubtopics.some(
      (item) => item.toLowerCase() === topic.toLowerCase()
    );

    if (!exists) {
      setSelectedSubtopics((previous) => [...previous, topic]);
    }

    setManualSubtopic("");
  };

  const saveCoverage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!course || !subject || !chapter) {
      setCoverageError("Please select course, subject and chapter.");
      return;
    }

    setCoverageSaving(true);
    setCoverageError("");

    try {
      const response = await fetch("/api/Daily-Class-Coverage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateKey: selectedDate || new Date().toLocaleDateString("en-CA"),
          course,
          subject,
          chapter,
          subtopics: selectedSubtopics,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Could not save teaching coverage.")
        );
      }

      returnToDailyLectures();
    } catch (err) {
      setCoverageError(
        err instanceof Error
          ? err.message
          : "Could not save teaching coverage."
      );
    } finally {
      setCoverageSaving(false);
    }
  };

  const skipCoverage = () => {
    returnToDailyLectures();
  };

  
  // =========================================================
  // LOADING / ERROR STATES
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <p className="text-sm text-gray-500">Opening classroom...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-bold text-gray-900">
          Classroom unavailable
        </h1>

        <p className="mt-2 text-sm text-gray-500">{error}</p>

        <button
          onClick={returnToDailyLectures}
          className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
        >
          Back to Daily Lectures
        </button>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-3 md:p-6">
      {/* SIMPLE CLASSROOM HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
  <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />
  {ending
    ? "ENDING CLASS..."
    : shouldAutoEnd
    ? "PREPARING TO END"
    : "LIVE CLASS"}
</div>

          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
            {session?.title}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={returnToDailyLectures}
            disabled={ending || showCoverageModal}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Leave
          </button>

         <button
  onClick={() => endClass(false)}
  disabled={ending || showCoverageModal}
  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
>
  {ending ? "Ending..." : "End Class"}
</button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* LIVE ROOM */}
       {session && !showCoverageModal && (
  <LiveRoom
    sessionId={session._id}
    isTeacher={true}
    onApiReady={handleApiReady}
    onRecordingControlsReady={handleRecordingControlsReady}
    onLeave={handleRoomLeave}
  />
)}
   

      {/* ================================================= */}
      {/* POST-CLASS COVERAGE MODAL */}
      {/* ================================================= */}

    {showCoverageModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] md:left-64 md:p-5">
    <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

      {/* MODAL HEADER */}
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-white p-5 sm:p-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            CLASS ENDED
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            Save Teaching Coverage
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Record what was taught in this class.
          </p>
        </div>

        <button
          type="button"
          onClick={skipCoverage}
          disabled={coverageSaving}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg text-gray-500 transition hover:bg-gray-200 disabled:opacity-50"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* SCROLLABLE MODAL BODY */}
      <form
        onSubmit={saveCoverage}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="space-y-5 p-5 sm:p-6">

          {coverageError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {coverageError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">

            {/* COURSE */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Course
              </label>

              <select
                value={course}
                disabled={metadataLoading.courses}
                onChange={(event) => {
                  setCourse(event.target.value);
                  setSubject("");
                  setChapter("");
                  setSelectedSubtopics([]);
                  setAvailableSubtopics([]);
                }}
                className={inputClass}
              >
                <option value="">
                  {metadataLoading.courses
                    ? "Loading courses..."
                    : "Select course"}
                </option>

                {courses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {metadataError.courses && (
                <div className="mt-1 flex items-center gap-2 text-xs text-red-600">
                  <span>{metadataError.courses}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCoverageModal(false);
                      setTimeout(() => setShowCoverageModal(true), 0);
                    }}
                    className="font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* SUBJECT */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Subject
              </label>

              <select
                value={subject}
                disabled={!course || metadataLoading.subjects}
                onChange={(event) => {
                  setSubject(event.target.value);
                  setChapter("");
                  setSelectedSubtopics([]);
                }}
                className={inputClass}
              >
                <option value="">
                  {!course
                    ? "Select course first"
                    : metadataLoading.subjects
                    ? "Loading subjects..."
                    : "Select subject"}
                </option>

                {subjects.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {metadataError.subjects && (
                <p className="mt-1 text-xs text-red-600">
                  {metadataError.subjects}
                </p>
              )}
            </div>

            {/* CHAPTER */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Chapter
              </label>

              <select
                value={chapter}
                disabled={!subject || metadataLoading.chapters}
                onChange={(event) => {
                  setChapter(event.target.value);
                  setSelectedSubtopics([]);
                }}
                className={inputClass}
              >
                <option value="">
                  {!subject
                    ? "Select subject first"
                    : metadataLoading.chapters
                    ? "Loading chapters..."
                    : "Select chapter"}
                </option>

                {chapters.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {metadataError.chapters && (
                <p className="mt-1 text-xs text-red-600">
                  {metadataError.chapters}
                </p>
              )}
            </div>
          </div>

          {/* SUBTOPICS */}
          {chapter && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-semibold text-gray-800">
                    Subtopics
                  </label>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Select the topics covered during this class.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  {selectedSubtopics.length} selected
                </span>
              </div>

              {metadataLoading.subtopics ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  Loading subtopics...
                </div>
              ) : metadataError.subtopics ? (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                  {metadataError.subtopics}
                </div>
              ) : availableSubtopics.length > 0 ? (
                <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/50 p-3 sm:grid-cols-2">
                  {availableSubtopics.map((topic) => {
                    const checked = selectedSubtopics.includes(topic);

                    return (
                      <label
                        key={topic}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                          checked
                            ? "border-violet-300 bg-violet-50 text-violet-800"
                            : "border-gray-200 bg-white text-gray-700 hover:border-violet-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSubtopic(topic)}
                          className="h-4 w-4 accent-violet-600"
                        />
                        <span>{topic}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
                  No subtopics found. You can add them manually or leave
                  this empty.
                </p>
              )}

              {/* CUSTOM SUBTOPIC */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold text-gray-600">
                  Add custom subtopic
                </label>

                <div className="flex gap-2">
                  <input
                    value={manualSubtopic}
                    onChange={(event) =>
                      setManualSubtopic(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addManualSubtopic();
                      }
                    }}
                    placeholder="Enter subtopic..."
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={addManualSubtopic}
                    className="shrink-0 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* SELECTED SUBTOPICS */}
              {selectedSubtopics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSubtopics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => toggleSubtopic(topic)}
                        className="font-bold text-violet-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={skipCoverage}
            disabled={coverageSaving}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Skip for now
          </button>

          <button
            type="submit"
            disabled={
              coverageSaving ||
              !course ||
              !subject ||
              !chapter
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {coverageSaving ? "Saving..." : "Save Coverage"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}
