
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuestionTypeSelector from "@/app/(DashboardLayout)/dashboard/components/questionTypeSelector";

interface Coverage {
  _id: string;
  dateKey: string;
  course: string;
  subject: string;
  chapter: string;
  subtopics: string[];
}

interface LearningVideo {
  _id: string;
  type: "daily" | "oneShot";
  date?: string;
  subject: string;
  chapter?: string;
  title: string;
  description?: string;
  duration?: number;
  youtubeVideoId?: string;
  isPublished: boolean;
}

interface Participant {
  _id: string;
  name: string;
  username?: string;
  email?: string;
  avatar?: string;
  courses?: string[];
  course?: string;
  class?: string;
  role?: string;
}

interface ActiveLiveSession {
  _id: string;
  title: string;
  roomName: string;
  status: "live" | "ended";
  startedBy: {
    _id: string;
    name?: string;
    username?: string;
  } | string;
  participantIds: string[];
  startedAt: string;
  createdAt: string;
  canEnd: boolean;
}

type AccordionSection = "coverage" | "live" | "recordings";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200/60 transition hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateKey(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.videos)) return data.videos;
  if (Array.isArray(data?.coverage)) return data.coverage;
  if (Array.isArray(data?.participants)) return data.participants;
  if (Array.isArray(data?.users)) return data.users;
  return [];
}

// IMPORTANT: Your metadata API returns { success, level, values }.
// This function now reads values correctly.
function getMetadataNames(data: any): string[] {
  const source = Array.isArray(data?.values)
    ? data.values
    : getArray(data);

  return source
    .map((item: any) => {
      if (typeof item === "string") return item;
      return item?.name || item?.title || item?.value || "";
    })
    .filter(
      (value: string) =>
        typeof value === "string" && value.trim().length > 0
    );
}

function getErrorMessage(data: any, fallback: string) {
  return data?.error || data?.message || fallback;
}

export default function DailyLecturesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialDate = searchParams.get("date");
  const defaultDate = isValidDateKey(initialDate)
    ? initialDate
    : getLocalDate();

  const todayDate = getLocalDate();

  const [coverageDate, setCoverageDate] = useState(defaultDate);
  const [recordingDate, setRecordingDate] = useState(defaultDate);
  const [showCoverageForm, setShowCoverageForm] = useState(false);

  const [openSection, setOpenSection] =
    useState<AccordionSection | null>(null);

  const toggleSection = (section: AccordionSection) => {
    setOpenSection((current) =>
      current === section ? null : section
    );
  };

  // =========================================================
  // SHARED UI STATE
  // =========================================================

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const showMessage = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  // =========================================================
  // TEACHING COVERAGE
  // =========================================================

  const [availableSubtopics, setAvailableSubtopics] = useState<
    string[]
  >([]);

  const [subtopicsLoading, setSubtopicsLoading] = useState(false);
  const [subtopicsError, setSubtopicsError] = useState("");

  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");

  const [selectedSubtopics, setSelectedSubtopics] = useState<
    string[]
  >([]);

  const [manualSubtopic, setManualSubtopic] = useState("");

  const [coverageList, setCoverageList] = useState<Coverage[]>([]);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [coverageSaving, setCoverageSaving] = useState(false);

  const [editingCoverageId, setEditingCoverageId] = useState<
    string | null
  >(null);

  // Only fetch subtopics here.
  // Course, subject and chapter are supplied by QuestionTypeSelector.
  const fetchMetadata = useCallback(
    async (params: Record<string, string> = {}) => {
      const query = new URLSearchParams({
        level: "subtopics",
        ...params,
      });

      const response = await fetch(
        `/api/QuestionBankV2/metadata?${query.toString()}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Could not load question bank metadata."
          )
        );
      }

      return getMetadataNames(data);
    },
    []
  );

  // Fetch subtopics after course + subject + chapter are selected.
  useEffect(() => {
    if (!course || !subject || !chapter) {
      setAvailableSubtopics([]);
      setSubtopicsError("");
      setSubtopicsLoading(false);
      return;
    }

    let active = true;

    const loadSubtopics = async () => {
      setSubtopicsLoading(true);
      setSubtopicsError("");
      setAvailableSubtopics([]);

      try {
        const topics = await fetchMetadata({
          course,
          subject,
          chapter,
        });

        if (active) {
          setAvailableSubtopics(topics);
        }
      } catch (error) {
        if (active) {
          setAvailableSubtopics([]);
          setSubtopicsError(
            error instanceof Error
              ? error.message
              : "Could not load subtopics."
          );
        }
      } finally {
        if (active) {
          setSubtopicsLoading(false);
        }
      }
    };

    loadSubtopics();

    return () => {
      active = false;
    };
  }, [course, subject, chapter, fetchMetadata]);

  const loadCoverage = useCallback(async () => {
    setCoverageLoading(true);

    try {
      const response = await fetch(
        `/api/Daily-Class-Coverage?date=${encodeURIComponent(
          coverageDate
        )}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Could not load coverage.")
        );
      }

      setCoverageList(getArray(data.coverages));
    } catch (error) {
      console.error(error);
      setCoverageList([]);
    } finally {
      setCoverageLoading(false);
    }
  }, [coverageDate]);

  useEffect(() => {
    loadCoverage();
  }, [loadCoverage]);

  const loadActiveSessions = useCallback(async () => {
  setActiveSessionLoading(true);

  try {
    const response = await fetch("/api/Live-Class/status", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        getErrorMessage(data, "Unable to fetch active classes.")
      );
    }

    setActiveSessions(
      Array.isArray(data.sessions) ? data.sessions : []
    );
  } catch (error) {
    console.error("Active live classes:", error);

    showMessage(
      error instanceof Error
        ? error.message
        : "Unable to check active classes.",
      "error"
    );
  } finally {
    setActiveSessionLoading(false);
  }
}, []);

useEffect(() => {
  loadActiveSessions();
}, [loadActiveSessions]);

const joinActiveClass = (sessionId: string) => {
  const query = new URLSearchParams({
    date: todayDate,
  });

  router.push(
    `/dashboard/admin/live-class/${sessionId}?${query.toString()}`
  );
};
const endActiveClass = (sessionId: string) => {
  router.push(
    `/dashboard/admin/live-class/${sessionId}?date=${todayDate}&action=end`
  );
};
  const resetCoverageForm = () => {
    setEditingCoverageId(null);
    setCourse("");
    setSubject("");
    setChapter("");
    setSelectedSubtopics([]);
    setManualSubtopic("");
    setAvailableSubtopics([]);
    setSubtopicsError("");
    setShowCoverageForm(false);
  };

  const editCoverage = (item: Coverage) => {
    setEditingCoverageId(item._id);

    setCourse(item.course);
    setSubject(item.subject);
    setChapter(item.chapter);

    setSelectedSubtopics(item.subtopics || []);
    setManualSubtopic("");
    setShowCoverageForm(true);
    setOpenSection("coverage");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCourseChange = (value: string) => {
    setCourse(value);
    setSubject("");
    setChapter("");
    setSelectedSubtopics([]);
    setManualSubtopic("");
    setAvailableSubtopics([]);
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setChapter("");
    setSelectedSubtopics([]);
    setManualSubtopic("");
    setAvailableSubtopics([]);
  };

  const handleChapterChange = (value: string) => {
    setChapter(value);
    setSelectedSubtopics([]);
    setManualSubtopic("");
  };

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

  const saveCoverage = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!course || !subject || !chapter) {
      showMessage(
        "Please select course, subject and chapter.",
        "error"
      );
      return;
    }

    setCoverageSaving(true);

    try {
      const response = await fetch("/api/Daily-Class-Coverage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateKey: coverageDate,
          course,
          subject,
          chapter,
          subtopics: selectedSubtopics,
          ...(editingCoverageId
            ? { _id: editingCoverageId }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Could not save coverage.")
        );
      }

      showMessage(
        editingCoverageId
          ? "Teaching coverage updated."
          : "Teaching coverage saved."
      );

      resetCoverageForm();
      await loadCoverage();
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Could not save coverage.",
        "error"
      );
    } finally {
      setCoverageSaving(false);
    }
  };

  const deleteCoverage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coverage?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/Daily-Class-Coverage/${id}`,
        { method: "DELETE" }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Could not delete coverage.")
        );
      }

      showMessage("Coverage deleted.");
      await loadCoverage();
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Could not delete coverage.",
        "error"
      );
    }
  };

  // =========================================================
  // LIVE CLASS
  // =========================================================

  const [liveTitle, setLiveTitle] = useState("");
const [startingLive, setStartingLive] = useState(false);

const [activeSessions, setActiveSessions] = useState<
  ActiveLiveSession[]
>([]);

const [activeSessionLoading, setActiveSessionLoading] =
  useState(true);
  
  // =========================================================
  // PARTICIPANTS
  // =========================================================

  const [participants, setParticipants] = useState<Participant[]>(
    []
  );

  const [participantsLoading, setParticipantsLoading] =
    useState(false);

  const [selectedParticipants, setSelectedParticipants] = useState<
    string[]
  >([]);

  const [studentSearch, setStudentSearch] = useState("");

  const loadParticipants = useCallback(async () => {
    setParticipantsLoading(true);

    try {
      const response = await fetch(
        "/api/Live-Class/participants",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Could not load students.")
        );
      }

      setParticipants(getArray(data));
    } catch (error) {
      console.error(error);

      showMessage(
        error instanceof Error
          ? error.message
          : "Could not load students.",
        "error"
      );
    } finally {
      setParticipantsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  const getParticipantClass = (person: Participant) => {
    const values = [
      ...(person.courses || []),
      person.course || "",
      person.class || "",
    ]
      .join(" ")
      .toLowerCase();

    if (values.includes("9")) return "Foundation 9th";
    if (values.includes("8")) return "Foundation 8th";

    return "Other";
  };

  const foundation8 = participants.filter(
    (person) =>
      getParticipantClass(person) === "Foundation 8th"
  );

  const foundation9 = participants.filter(
    (person) =>
      getParticipantClass(person) === "Foundation 9th"
  );

  const otherStudents = participants.filter(
    (person) => getParticipantClass(person) === "Other"
  );

  const filteredParticipants = useMemo(() => {
    const search = studentSearch.trim().toLowerCase();

    if (!search) return participants;

    return participants.filter((person) =>
      `${person.name} ${person.username || ""} ${
        person.email || ""
      }`
        .toLowerCase()
        .includes(search)
    );
  }, [participants, studentSearch]);

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleGroup = (group: Participant[]) => {
    const ids = group.map((person) => person._id);

    const allSelected =
      ids.length > 0 &&
      ids.every((id) => selectedParticipants.includes(id));

    if (allSelected) {
      setSelectedParticipants((previous) =>
        previous.filter((id) => !ids.includes(id))
      );
    } else {
      setSelectedParticipants((previous) =>
        Array.from(new Set([...previous, ...ids]))
      );
    }
  };

  const groupSelectedCount = (group: Participant[]) =>
    group.filter((person) =>
      selectedParticipants.includes(person._id)
    ).length;

  const selectAllVisible = () => {
    const ids = filteredParticipants.map(
      (person) => person._id
    );

    const allSelected =
      ids.length > 0 &&
      ids.every((id) => selectedParticipants.includes(id));

    if (allSelected) {
      setSelectedParticipants((previous) =>
        previous.filter((id) => !ids.includes(id))
      );
    } else {
      setSelectedParticipants((previous) =>
        Array.from(new Set([...previous, ...ids]))
      );
    }
  };

  // =========================================================
  // START LIVE CLASS
  // =========================================================

  const startLiveClass = async () => {
    const alreadyHasActiveClass = activeSessions.some((session) => {
  if (!session.canEnd) return false;

  const startedById =
    typeof session.startedBy === "object"
      ? session.startedBy?._id
      : session.startedBy;

  return !!startedById;
});

if (alreadyHasActiveClass) {
  showMessage(
    "You already have an active classroom. Join or end it first.",
    "error"
  );
  return;
}
    if (!liveTitle.trim()) {
      showMessage("Please enter a class title.", "error");
      return;
    }

    if (selectedParticipants.length === 0) {
      showMessage(
        "Please select students for the live class.",
        "error"
      );
      return;
    }

    setStartingLive(true);

    try {
      const response = await fetch("/api/Live-Class/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: liveTitle.trim(),
          participantIds: selectedParticipants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Could not start live class.")
        );
      }

      const session = data.session || data.data || data;
      const sessionId = session._id || session.sessionId;

      if (!sessionId) {
        throw new Error(
          "The server did not return a session ID."
        );
      }

      const query = new URLSearchParams({
        date: todayDate,
      });

      router.push(
        `/dashboard/admin/live-class/${sessionId}?${query.toString()}`
      );
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Could not start class.",
        "error"
      );

      setStartingLive(false);
    }
  };

  // =========================================================
  // RECORDED DAILY VIDEOS
  // =========================================================

  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  const loadVideos = useCallback(async () => {
    setVideosLoading(true);

    try {
      const query = new URLSearchParams({
        type: "daily",
        date: recordingDate,
        includeUnpublished: "true",
      });

      const response = await fetch(
        `/api/learning-videos?${query.toString()}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Could not load recorded lectures."
          )
        );
      }

      setVideos(getArray(data));
    } catch (error) {
      console.error(error);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  }, [recordingDate]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // =========================================================
  // UI COMPONENTS
  // =========================================================

  const SectionHeader = ({
    title,
    subtitle,
    section,
    icon,
    badge,
    gradient,
    iconBackground,
  }: {
    title: string;
    subtitle: string;
    section: AccordionSection;
    icon: string;
    badge?: string;
    gradient: string;
    iconBackground: string;
  }) => {
    const isOpen = openSection === section;

    return (
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className={`group flex w-full items-center justify-between gap-3 p-4 text-left transition sm:px-6 ${
          isOpen ? "bg-white" : "bg-white hover:bg-slate-50"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${iconBackground} text-xl text-white shadow-lg transition group-hover:scale-105`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold tracking-tight text-slate-900 sm:text-base">
                {title}
              </h2>

              {badge && (
                <span
                  className={`rounded-full bg-gradient-to-r ${gradient} px-2.5 py-1 text-[10px] font-bold text-white`}
                >
                  {badge}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
            isOpen
              ? "rotate-180 border-violet-200 bg-violet-50 text-violet-700"
              : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-violet-200 group-hover:text-violet-600"
          }`}
        >
          <span className="text-lg">⌄</span>
        </div>
      </button>
    );
  };

  const StudentGroup = ({
    title,
    students,
    color,
  }: {
    title: string;
    students: Participant[];
    color: string;
  }) => {
    const selectedCount = groupSelectedCount(students);

    const allSelected =
      students.length > 0 &&
      selectedCount === students.length;

    return (
      <button
        type="button"
        onClick={() => toggleGroup(students)}
        disabled={students.length === 0}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
          allSelected
            ? "border-violet-300 bg-violet-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-violet-200"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`h-3 w-3 shrink-0 rounded-full ${color}`}
          />

          <div>
            <p className="text-sm font-bold text-slate-800">
              {title}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {students.length} students
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-bold text-violet-700">
            {selectedCount}/{students.length}
          </span>

          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
              allSelected
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-slate-300 text-transparent"
            }`}
          >
            ✓
          </span>
        </div>
      </button>
    );
  };

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_rgba(139,92,246,0.12),_transparent_35%),radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.10),_transparent_35%),#f8f9ff] px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-4">

    {/* PAGE HEADER */}
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#312e81] via-[#5b21b6] to-[#4338ca] p-4 text-white shadow-lg shadow-violet-200/40 sm:p-6">
  <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[26px] border-white/5" />
  <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />

  <div className="relative flex flex-wrap items-center justify-between gap-3">
    <div>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-violet-100">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
        Innovative Academy · Teacher Workspace
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Daily Lectures
      </h1>

      <p className="mt-1 max-w-xl text-xs text-violet-100 sm:text-sm">
        Manage classrooms, track teaching progress and organize recorded sessions.
      </p>
    </div>

    <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-xl">🎓</span>
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-violet-200">
          Workspace
        </p>
        <p className="text-xs font-bold">Teaching Hub</p>
      </div>
    </div>
  </div>

  <div className="relative mt-4 grid grid-cols-3 gap-3 border-t border-white/15 pt-3">
    <div>
      <p className="text-lg font-extrabold">{coverageList.length}</p>
      <p className="text-[10px] text-violet-200">Coverage entries</p>
    </div>

    <div>
      <p className="text-lg font-extrabold">{participants.length}</p>
      <p className="text-[10px] text-violet-200">Students</p>
    </div>

    <div>
      <p className="text-lg font-extrabold">{videos.length}</p>
      <p className="text-[10px] text-violet-200">Recordings</p>
    </div>
  </div>
</div>

{/* ACTIVE LIVE CLASSROOMS */}

<section className="mt-3">
  <div className="mb-2 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      <h2 className="text-sm font-extrabold text-slate-800">
        Active Classrooms
      </h2>
      {activeSessions.length > 0 && (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          {activeSessions.length}
        </span>
      )}
    </div>

    <button
      type="button"
      onClick={loadActiveSessions}
      disabled={activeSessionLoading}
      className="text-xs font-semibold text-violet-600 hover:text-violet-800 disabled:opacity-50"
    >
      {activeSessionLoading ? "Checking..." : "↻ Refresh"}
    </button>
  </div>

  {activeSessionLoading ? (
    <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
      Loading classrooms...
    </p>
  ) : activeSessions.length === 0 ? (
    <p className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-xs text-slate-500">
      No active classrooms.
    </p>
  ) : (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {activeSessions.map((session) => (
        <div
          key={session._id}
          className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-violet-200 hover:shadow-md"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wide text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              LIVE
            </span>

            <span className="text-[10px] text-slate-400">
              {session.participantIds?.length || 0} students
            </span>
          </div>

          <h3 className="truncate text-sm font-bold text-slate-800">
            {session.title}
          </h3>

          <p className="mt-1 truncate text-[10px] text-slate-400">
            {typeof session.startedBy === "object" && session.startedBy
              ? `By ${session.startedBy.name || session.startedBy.username || "Teacher"}`
              : "Live session"}
            {" · "}
            {new Date(session.startedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => joinActiveClass(session._id)}
              className={`${primaryButton} min-w-0 flex-1 !rounded-lg !px-2 !py-2 !text-xs`}
            >
              Join
            </button>

            {session.canEnd && (
              <button
                type="button"
                onClick={() => endActiveClass(session._id)}
                className="min-w-0 flex-1 rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
              >
                End Class
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</section>

        {/* MESSAGE */}
        {message && (
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{messageType === "success" ? "✓" : "!"}</span>
              <span>{message}</span>
            </div>

            <button
              type="button"
              onClick={() => setMessage("")}
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* LIVE CLASSROOM */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(30,41,59,0.04)] transition">
          <SectionHeader
            title="Live Classroom"
            subtitle=""
            section="live"
            icon="🎥"
            badge="LIVE"
            gradient="from-rose-500 to-orange-500"
            iconBackground="from-rose-500 to-orange-500"
          />

          {openSection === "live" && (

            <div className="border-t border-slate-100 bg-gradient-to-br from-rose-50/30 via-white to-violet-50/30 p-4 sm:p-6">
              <div className="mb-5 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Class title
                </label>

                <input
                  value={liveTitle}
                  onChange={(event) =>
                    setLiveTitle(event.target.value)
                  }
                  placeholder="e.g. Foundation 9th - Science - Laws of Motion"
                  className={inputClass}
                  maxLength={120}
                />

                <p className="mt-2 text-xs text-slate-400">
                  Students will see this title when they view the
                  live class.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Select students
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Choose an entire group or individual students.
                    </p>
                  </div>

                  <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                    {selectedParticipants.length} selected
                  </span>
                </div>

                {participantsLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
                    Loading students...
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StudentGroup
                      title="Foundation 8th"
                      students={foundation8}
                      color="bg-blue-500"
                    />

                    <StudentGroup
                      title="Foundation 9th"
                      students={foundation9}
                      color="bg-violet-500"
                    />
                  </div>
                )}

                {otherStudents.length > 0 && (
                  <StudentGroup
                    title="Other students"
                    students={otherStudents}
                    color="bg-slate-400"
                  />
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-800">
                      Individual selection
                    </h4>

                    <button
                      type="button"
                      onClick={selectAllVisible}
                      className="text-xs font-bold text-violet-700 hover:text-violet-900"
                    >
                      Select / Deselect visible
                    </button>
                  </div>

                  <input
                    value={studentSearch}
                    onChange={(event) =>
                      setStudentSearch(event.target.value)
                    }
                    placeholder="Search student..."
                    className={inputClass}
                  />

                  <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/70 p-1.5">
                    {participantsLoading ? (
                      <p className="p-5 text-center text-sm text-slate-400">
                        Loading students...
                      </p>
                    ) : filteredParticipants.length === 0 ? (
                      <p className="p-5 text-center text-sm text-slate-400">
                        No students found.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {filteredParticipants.map((person) => {
                          const checked =
                            selectedParticipants.includes(
                              person._id
                            );

                          return (
                            <label
                              key={person._id}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition ${
                                checked
                                  ? "bg-violet-100/80"
                                  : "hover:bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  toggleParticipant(person._id)
                                }
                                className="h-4 w-4 accent-violet-600"
                              />

                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                {person.avatar ? (
                                  <img
                                    src={person.avatar}
                                    alt=""
                                    className="h-9 w-9 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white">
                                    {person.name
                                      ?.charAt(0)
                                      ?.toUpperCase()}
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {person.name}
                                  </p>

                                  <p className="truncate text-xs text-slate-400">
                                    {person.username ||
                                      person.email ||
                                      ""}
                                  </p>
                                </div>
                              </div>

                              {checked && (
                                <span className="text-xs font-bold text-violet-700">
                                  Selected
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {selectedParticipants.length > 0 && (
                  <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-violet-900">
                        {selectedParticipants.length} students selected
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedParticipants([])
                        }
                        className="text-xs font-bold text-red-500 hover:text-red-700"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {participants
                        .filter((person) =>
                          selectedParticipants.includes(person._id)
                        )
                        .map((person) => (
                          <span
                            key={person._id}
                            className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700"
                          >
                            {person.name}

                            <button
                              type="button"
                              onClick={() =>
                                toggleParticipant(person._id)
                              }
                              className="font-bold text-violet-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={startLiveClass}
                 disabled={
  startingLive ||
  participantsLoading ||
  activeSessionLoading ||
  selectedParticipants.length === 0 ||
  !liveTitle.trim() ||
  activeSessions.some((session) => {
    const startedById =
      typeof session.startedBy === "object"
        ? session.startedBy?._id
        : session.startedBy;

    return session.canEnd && !!startedById;
  })
}
                  className={`${primaryButton} w-full py-4 text-base`}
                >
                  {startingLive ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Starting classroom...
                    </>
                  ) : (
                    <>▶ Start Live Class</>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400">
                  Your selected students will be able to join this
                  class.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* TEACHING COVERAGE */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(30,41,59,0.04)] transition">
          <SectionHeader
            title="Teaching Coverage"
            subtitle=""
            section="coverage"
            icon="📚"
            badge={`${coverageList.length} SAVED`}
            gradient="from-violet-500 to-indigo-500"
            iconBackground="from-violet-600 to-indigo-600"
          />

          {openSection === "coverage" && (
            <div className="border-t border-slate-100 bg-gradient-to-br from-violet-50/40 via-white to-cyan-50/30 p-4 sm:p-6">
              {/* DATE + ACTION */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Teaching schedule
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Select the date for your coverage record.
                  </p>
                </div>

                <input
                  id="coverage-date"
                  type="date"
                  value={coverageDate}
                  onChange={(event) => {
                    setCoverageDate(event.target.value);
                    resetCoverageForm();
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />
              </div>

              {!showCoverageForm && (
                <button
                  type="button"
                  onClick={() => setShowCoverageForm(true)}
                  className={`${primaryButton} mb-5`}
                >
                  <span className="text-lg leading-none">+</span>
                  Add Teaching Coverage
                </button>
              )}

              {showCoverageForm && (
                <form
                  onSubmit={saveCoverage}
                  className="overflow-hidden rounded-3xl border border-violet-200 bg-white shadow-lg shadow-violet-100/50"
                >
                  {/* FORM HEADER */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 px-4 py-4 text-white sm:px-6">
                    <div className="pointer-events-none absolute -right-5 -top-12 h-36 w-36 rounded-full border-[20px] border-white/10" />

                    <div className="relative flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
                          Learning progress
                        </p>
                        <h3 className="mt-1 text-lg font-extrabold">
                          {editingCoverageId
                            ? "Update Teaching Coverage"
                            : "Plan Class Coverage"}
                        </h3>
                        <p className="mt-1 text-xs text-violet-100">
                          Choose the class, chapter and topics covered.
                        </p>
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl">
                        🎯
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-4 sm:p-6">
                    {/* CLASS SELECTION */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-xs font-extrabold text-violet-700">
                          01
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">
                            Select learning path
                          </h4>
                          <p className="text-xs text-slate-400">
                            Course → Subject → Chapter
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                        <QuestionTypeSelector
                          title={null}
                          isSubmitted={false}
                          new={false}
                          initialCourse={course}
                          initialSubject={subject}
                          initialChapter={chapter}
                          onCourseChange={handleCourseChange}
                          onSubjectChange={handleSubjectChange}
                          onChapterChange={handleChapterChange}
                        />
                      </div>
                    </div>

                    {/* SUBTOPICS */}
                    {chapter && (
                      <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-violet-50/70">
                        <div className="border-b border-cyan-100/80 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-lg text-white shadow-md shadow-cyan-100">
                                ✨
                              </div>

                              <div>
                                <h4 className="text-sm font-extrabold text-slate-900">
                                  Learning objectives
                                </h4>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  Select the subtopics covered today.
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-extrabold text-violet-700 shadow-sm">
                              {selectedSubtopics.length} selected
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 p-4">
                          {subtopicsLoading ? (
                            <div className="flex items-center justify-center gap-3 rounded-xl border border-cyan-100 bg-white p-6 text-sm text-slate-500">
                              <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                              Loading learning objectives...
                            </div>
                          ) : subtopicsError ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                              <p className="font-bold">
                                Could not load subtopics
                              </p>
                              <p className="mt-1">{subtopicsError}</p>
                            </div>
                          ) : availableSubtopics.length > 0 ? (
                            <div>
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Available subtopics
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedSubtopics(
                                      selectedSubtopics.length ===
                                        availableSubtopics.length
                                        ? []
                                        : [...availableSubtopics]
                                    )
                                  }
                                  className="text-xs font-bold text-violet-700 hover:text-violet-900"
                                >
                                  {availableSubtopics.every((topic) =>
                                    selectedSubtopics.includes(topic)
                                  )
                                    ? "Clear selection"
                                    : "Select all"}
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {availableSubtopics.map((topic, index) => {
                                  const checked =
                                    selectedSubtopics.includes(topic);

                                  const styles = [
                                    "border-violet-200 bg-violet-50 text-violet-800",
                                    "border-cyan-200 bg-cyan-50 text-cyan-800",
                                    "border-blue-200 bg-blue-50 text-blue-800",
                                    "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
                                  ];

                                  const activeStyles = [
                                    "border-violet-600 bg-violet-600 text-white shadow-violet-200",
                                    "border-cyan-600 bg-cyan-600 text-white shadow-cyan-200",
                                    "border-blue-600 bg-blue-600 text-white shadow-blue-200",
                                    "border-fuchsia-600 bg-fuchsia-600 text-white shadow-fuchsia-200",
                                  ];

                                  return (
                                    <button
                                      key={topic}
                                      type="button"
                                      onClick={() =>
                                        toggleSubtopic(topic)
                                      }
                                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${
                                        checked
                                          ? `${activeStyles[index % 4]} shadow-md`
                                          : `${styles[index % 4]} hover:shadow-md`
                                      }`}
                                    >
                                      <span
                                        className={`flex h-4 w-4 items-center justify-center rounded-md border text-[10px] ${
                                          checked
                                            ? "border-white/50 bg-white/20 text-white"
                                            : "border-current/30"
                                        }`}
                                      >
                                        {checked ? "✓" : ""}
                                      </span>
                                      {topic}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-cyan-200 bg-white/80 p-5 text-center">
                              <div className="text-2xl">📖</div>
                              <p className="mt-2 text-sm font-bold text-slate-700">
                                No subtopics found
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                You can add a custom subtopic below or
                                leave this section empty.
                              </p>
                            </div>
                          )}

                          {/* CUSTOM SUBTOPIC */}
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                              Add custom learning objective
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
                                placeholder="Enter a subtopic..."
                                className={inputClass}
                              />

                              <button
                                type="button"
                                onClick={addManualSubtopic}
                                disabled={!manualSubtopic.trim()}
                                className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-40"
                              >
                                + Add
                              </button>
                            </div>
                          </div>

                          {/* SELECTED SUBTOPICS */}
                          {selectedSubtopics.length > 0 && (
                            <div className="rounded-xl border border-violet-100 bg-white p-3">
                              <div className="mb-3 flex items-center justify-between gap-2">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-violet-800">
                                  Selected objectives
                                </p>

                                <span className="text-xs text-slate-400">
                                  {selectedSubtopics.length} topics
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {selectedSubtopics.map((topic) => (
                                  <span
                                    key={topic}
                                    className="inline-flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800"
                                  >
                                    {topic}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleSubtopic(topic)
                                      }
                                      className="font-extrabold text-violet-400 transition hover:text-red-500"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* FORM ACTIONS */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="submit"
                        disabled={coverageSaving}
                        className={primaryButton}
                      >
                        {coverageSaving
                          ? "Saving..."
                          : editingCoverageId
                            ? "✓ Update Coverage"
                            : "✓ Save Coverage"}
                      </button>

                      <button
                        type="button"
                        onClick={resetCoverageForm}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* SAVED COVERAGE */}
              <div className="mt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900">
                      Saved teaching coverage
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Your recorded teaching progress for this date.
                    </p>
                  </div>

                  <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                    {coverageList.length} entries
                  </span>
                </div>

                {coverageLoading ? (
                  <div className="rounded-2xl border border-slate-100 bg-white py-10 text-center text-sm text-slate-400">
                    Loading coverage...
                  </div>
                ) : coverageList.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center">
                    <div className="text-3xl">📝</div>
                    <p className="mt-3 text-sm font-bold text-slate-700">
                      No coverage saved yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Add the chapters and subtopics taught on this
                      date.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {coverageList.map((item, index) => (
                      <div
                        key={item._id}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                      >
                        <div className="flex gap-3 p-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-lg text-violet-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900">
                                  {item.chapter}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {item.course} · {item.subject}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => editCoverage(item)}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteCoverage(item._id)
                                  }
                                  className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {item.subtopics?.length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {item.subtopics.map((topic) => (
                                  <span
                                    key={topic}
                                    className="rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-3 text-xs text-slate-400">
                                No specific subtopics recorded.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* RECORDED LECTURES */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(30,41,59,0.04)] transition">
          <SectionHeader
            title="Recorded Lectures"
            subtitle=""
            section="recordings"
            icon="▶"
            badge={`${videos.length} VIDEOS`}
            gradient="from-cyan-500 to-blue-600"
            iconBackground="from-cyan-500 to-blue-600"
          />

          {openSection === "recordings" && (
            <div className="border-t border-slate-100 bg-gradient-to-br from-cyan-50/30 via-white to-blue-50/30 p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Lecture archive
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Select a date to browse recorded sessions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id="recording-date"
                    type="date"
                    value={recordingDate}
                    onChange={(event) =>
                      setRecordingDate(event.target.value)
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  />

                  <button
                    type="button"
                    onClick={loadVideos}
                    className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2.5 text-xs font-bold text-cyan-800 transition hover:bg-cyan-100"
                  >
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {videosLoading ? (
                <div className="rounded-2xl border border-slate-100 bg-white py-10 text-center text-sm text-slate-400">
                  Loading recorded lectures...
                </div>
              ) : videos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
                  <div className="text-4xl">🎬</div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No recorded lectures found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    No daily recorded videos are available for this
                    date.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                {videos.map((video) => (
  <div
    key={video._id}
    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
  >
 
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-bold text-slate-900">
            {video.title}
          </h4>

          <p className="mt-1 text-xs text-slate-500">
            {video.subject}
            {video.chapter ? ` · ${video.chapter}` : ""}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
            video.isPublished
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {video.isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {video.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {video.description}
        </p>
      )}

      {video.duration ? (
        <p className="mt-3 text-xs font-semibold text-slate-400">
          ◷ {video.duration} minutes
        </p>
      ) : null}

      <button
        type="button"
        onClick={() =>
          router.push(`/dashboard/admin/daily-lectures/${video._id}`)
        }
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98]"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5.14v13.72c0 .78.85 1.26 1.52.85l10.7-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
        </svg>
        Watch Lecture
      </button>
    </div>
  </div>
))}
</div>
              )}
            </div>
          )}
        </section>

       
      </div>
    </main>
  );
}
