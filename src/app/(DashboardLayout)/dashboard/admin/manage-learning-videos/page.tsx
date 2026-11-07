
"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import LiveRoom from "../../components/learning/LiveRoom";

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

interface LiveSessionInfo {
  _id: string;
  title: string;
  subject: string;
  description?: string;
  roomName: string;
  startedAt?: string;
  canEnd?: boolean;
  startedBy?: {
    _id?: string;
    name?: string;
    username?: string;
  } | string;
}

interface Participant {
  _id: string;
  name: string;
  username?: string;
  email?: string;
  avatar?: string;
  courses: string[];
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

const buttonClass =
  "rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export default function ManageLearningVideosPage() {
  // Recorded videos
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [type, setType] = useState<"daily" | "oneShot">("daily");

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    subject: "Physics",
    chapter: "",
    title: "",
    description: "",
    duration: "",
    youtubeVideoId: "",
    isPublished: true,
  });

  // Live class form
  const [liveForm, setLiveForm] = useState({
    title: "",
    subject: "Physics",
    description: "",
  });

  // Live sessions
  const [liveSessions, setLiveSessions] = useState<LiveSessionInfo[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [startingLive, setStartingLive] = useState(false);
  const [endingId, setEndingId] = useState("");

  // Currently opened meeting
  const [activeSession, setActiveSession] =
    useState<LiveSessionInfo | null>(null);

  const [showLiveRoom, setShowLiveRoom] = useState(false);
  const [meetingApi, setMeetingApi] = useState<any>(null);

  // Participants
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [participantSearch, setParticipantSearch] = useState("");

  // Messages
  const [message, setMessage] = useState("");
  const [liveMessage, setLiveMessage] = useState("");

  // --------------------------------------------------
  // FETCH RECORDED VIDEOS
  // --------------------------------------------------

  async function fetchVideos() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/learning-videos?includeUnpublished=true",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load videos.");
      }

      setVideos(Array.isArray(data) ? data : data.videos || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load videos."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // FETCH LIVE SESSIONS
  // --------------------------------------------------

  const checkLiveStatus = useCallback(async () => {
    try {
      setLiveLoading(true);

      const response = await fetch("/api/Live-Class/status", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to check live status."
        );
      }

      setLiveSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (error) {
      setLiveMessage(
        error instanceof Error
          ? error.message
          : "Unable to check live status."
      );
    } finally {
      setLiveLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // FETCH PARTICIPANTS
  // --------------------------------------------------

  const fetchParticipants = useCallback(async () => {
    try {
      setParticipantsLoading(true);

      const response = await fetch("/api/Live-Class/participants", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to load students."
        );
      }

      setParticipants(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      setLiveMessage(
        error instanceof Error
          ? error.message
          : "Unable to load students."
      );
    } finally {
      setParticipantsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    checkLiveStatus();
    fetchParticipants();
  }, [checkLiveStatus, fetchParticipants]);

  // --------------------------------------------------
  // PARTICIPANT SELECTION
  // --------------------------------------------------

  const filteredParticipants = useMemo(() => {
    const search = participantSearch.trim().toLowerCase();

    if (!search) return participants;

    return participants.filter((student) => {
      return (
        student.name?.toLowerCase().includes(search) ||
        student.username?.toLowerCase().includes(search) ||
        student.email?.toLowerCase().includes(search)
      );
    });
  }, [participants, participantSearch]);

  const foundation8Students = useMemo(
    () =>
      participants.filter((student) =>
        student.courses?.includes("Foundation 8th")
      ),
    [participants]
  );

  const foundation9Students = useMemo(
    () =>
      participants.filter((student) =>
        student.courses?.includes("Foundation 9th")
      ),
    [participants]
  );

  function toggleStudent(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selected) => selected !== id)
        : [...previous, id]
    );
  }

  function toggleGroup(groupStudents: Participant[]) {
    const groupIds = groupStudents.map((student) => student._id);

    const allSelected =
      groupIds.length > 0 &&
      groupIds.every((id) => selectedIds.includes(id));

    setSelectedIds((previous) => {
      if (allSelected) {
        return previous.filter((id) => !groupIds.includes(id));
      }

      return Array.from(new Set([...previous, ...groupIds]));
    });
  }

  function isGroupSelected(groupStudents: Participant[]) {
    return (
      groupStudents.length > 0 &&
      groupStudents.every((student) => selectedIds.includes(student._id))
    );
  }

  // --------------------------------------------------
  // CREATE RECORDED VIDEO
  // --------------------------------------------------

  async function createVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setMessage("");

    try {
      if (type === "daily" && !form.date) {
        throw new Error("Please select a lecture date.");
      }

      if (type === "oneShot" && !form.chapter.trim()) {
        throw new Error("Please enter the chapter name.");
      }

      if (type === "oneShot" && !form.youtubeVideoId.trim()) {
        throw new Error("YouTube video ID is required for one-shot videos.");
      }

      const payload = {
        type,
        date: type === "daily" ? form.date : undefined,
        subject: form.subject,
        chapter: form.chapter,
        title: form.title,
        description: form.description,
        duration: form.duration ? Number(form.duration) : undefined,
        youtubeVideoId: form.youtubeVideoId.trim() || undefined,
        isPublished: form.isPublished,
      };

      const response = await fetch("/api/learning-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create video.");
      }

      setMessage("Learning video added successfully.");

      setForm((previous) => ({
        ...previous,
        chapter: "",
        title: "",
        description: "",
        duration: "",
        youtubeVideoId: "",
      }));

      await fetchVideos();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create video."
      );
    } finally {
      setCreating(false);
    }
  }

  // --------------------------------------------------
  // DELETE RECORDED VIDEO
  // --------------------------------------------------

  async function deleteVideo(id: string) {
    if (!window.confirm("Delete this learning video?")) return;

    setDeletingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/learning-videos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete video.");
      }

      setVideos((previous) =>
        previous.filter((video) => video._id !== id)
      );

      setMessage("Video deleted successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete video."
      );
    } finally {
      setDeletingId("");
    }
  }

  // --------------------------------------------------
  // START LIVE CLASS
  // --------------------------------------------------

  async function startLiveClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!liveForm.title.trim() || !liveForm.subject.trim()) {
      setLiveMessage("Enter a title and subject first.");
      return;
    }

    setStartingLive(true);
    setLiveMessage("");

    try {
      const response = await fetch("/api/Live-Class/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: liveForm.title.trim(),
          subject: liveForm.subject,
          description: liveForm.description.trim(),
          participantIds: selectedIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to start live class."
        );
      }

      if (!data.session) {
        throw new Error("The server did not return the new live session.");
      }

      setLiveForm({
        title: "",
        subject: "Physics",
        description: "",
      });

      setSelectedIds([]);
      setParticipantSearch("");

      setActiveSession(data.session);
      setShowLiveRoom(true);
      setMeetingApi(null);

      setLiveMessage("Live class started successfully.");

      await checkLiveStatus();
    } catch (error) {
      setLiveMessage(
        error instanceof Error
          ? error.message
          : "Unable to start live class."
      );
    } finally {
      setStartingLive(false);
    }
  }

  // --------------------------------------------------
  // JOIN LIVE CLASS
  // --------------------------------------------------

  function joinLiveClass(session: LiveSessionInfo) {
    setActiveSession(session);
    setMeetingApi(null);
    setShowLiveRoom(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // CLOSE LIVE ROOM VIEW
  // --------------------------------------------------

  function closeLiveRoom() {
    try {
      meetingApi?.executeCommand("hangup");
    } catch (error) {
      console.error("Unable to leave meeting:", error);
    }

    setShowLiveRoom(false);
    setActiveSession(null);
    setMeetingApi(null);
  }

  // --------------------------------------------------
  // END A PARTICULAR LIVE CLASS
  // --------------------------------------------------

  async function endLiveClass(session: LiveSessionInfo) {
    if (
      !window.confirm(
        `Are you sure you want to end "${session.title}"?`
      )
    ) {
      return;
    }

    setEndingId(session._id);
    setLiveMessage("");

    try {
      const response = await fetch("/api/Live-Class/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to end live class."
        );
      }

      if (activeSession?._id === session._id) {
        try {
          meetingApi?.executeCommand("endConference");
        } catch (error) {
          console.error("Unable to close meeting iframe:", error);
        }

        setShowLiveRoom(false);
        setActiveSession(null);
        setMeetingApi(null);
      }

      setLiveSessions((previous) =>
        previous.filter((item) => item._id !== session._id)
      );

      setLiveMessage(
        "Live class ended. Upload its recording as a daily lecture."
      );

      await checkLiveStatus();
    } catch (error) {
      setLiveMessage(
        error instanceof Error
          ? error.message
          : "Unable to end live class."
      );
    } finally {
      setEndingId("");
    }
  }

  const dailyCount = videos.filter(
    (video) => video.type === "daily"
  ).length;

  const oneShotCount = videos.filter(
    (video) => video.type === "oneShot"
  ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      {/* PAGE HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Manage Learning Videos
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage live classrooms, recorded lectures and one-shot videos.
          </p>
        </div>

        <div className="rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700">
          {videos.length} Total Videos
        </div>
      </div>

      {/* LIVE CLASSROOM */}

      <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-purple-50 to-white px-5 py-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Live Classroom
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Start and manage multiple live classes simultaneously.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            {liveLoading
              ? "Checking..."
              : `${liveSessions.length} Active`}
          </div>
        </div>

        <div className="space-y-6 p-5">
          {liveMessage && (
            <div className="rounded-xl border border-purple-100 bg-purple-50 p-3 text-sm text-purple-800">
              {liveMessage}
            </div>
          )}

          {/* ACTIVE MEETING ROOM */}

          {showLiveRoom && activeSession && (
            <div className="space-y-4 rounded-2xl border border-purple-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wide text-red-600">
                      Classroom Open
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {activeSession.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {activeSession.subject}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeLiveRoom}
                  className={`${buttonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-100`}
                >
                  Leave Classroom
                </button>
              </div>

              <LiveRoom
                sessionId={activeSession._id}
                isTeacher
                onApiReady={setMeetingApi}
                onLeave={() => {
                  setShowLiveRoom(false);
                  setActiveSession(null);
                  setMeetingApi(null);
                }}
              />
            </div>
          )}

          {/* ACTIVE SESSIONS LIST */}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900">
                  Active Live Classes
                </h3>

                <p className="text-xs text-gray-500">
                  Join or manage your available classrooms.
                </p>
              </div>

              <button
                type="button"
                onClick={checkLiveStatus}
                disabled={liveLoading}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {liveLoading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {liveLoading && liveSessions.length === 0 ? (
              <div className="rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
                Loading active classrooms...
              </div>
            ) : liveSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <div className="mb-2 text-3xl">🎓</div>

                <h4 className="font-semibold text-gray-800">
                  No active live classes
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                  Start a classroom below. It will appear here immediately.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {liveSessions.map((session) => (
                  <article
                    key={session._id}
                    className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-purple-300 hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        LIVE NOW
                      </span>

                      <span className="text-xs text-gray-500">
                        {session.subject}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900">
                      {session.title}
                    </h4>

                    {session.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {session.description}
                      </p>
                    )}

                    {session.startedBy &&
                      typeof session.startedBy === "object" && (
                        <p className="mt-2 text-xs text-gray-400">
                          Started by{" "}
                          {session.startedBy.name ||
                            session.startedBy.username ||
                            "Teacher"}
                        </p>
                      )}

                    {session.startedAt && (
                      <p className="mt-1 text-xs text-gray-400">
                        Started{" "}
                        {new Date(session.startedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => joinLiveClass(session)}
                        className={`${buttonClass} flex-1 bg-purple-600 text-white hover:bg-purple-700`}
                      >
                        {activeSession?._id === session._id &&
                        showLiveRoom
                          ? "Classroom Open"
                          : "Join Classroom"}
                      </button>

                      {session.canEnd && (
                        <button
                          type="button"
                          onClick={() => endLiveClass(session)}
                          disabled={endingId === session._id}
                          className={`${buttonClass} border border-red-200 bg-white text-red-600 hover:bg-red-50`}
                        >
                          {endingId === session._id
                            ? "Ending..."
                            : "End"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* START NEW CLASS */}

          <div className="border-t border-gray-100 pt-6">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                Start a New Live Class
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Choose the students who should have access to this classroom.
              </p>
            </div>

            <form onSubmit={startLiveClass} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Live Class Title
                  </label>

                  <input
                    className={inputClass}
                    placeholder="Example: Introduction to Motion"
                    value={liveForm.title}
                    onChange={(event) =>
                      setLiveForm((previous) => ({
                        ...previous,
                        title: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Subject</label>

                  <select
                    className={inputClass}
                    value={liveForm.subject}
                    onChange={(event) =>
                      setLiveForm((previous) => ({
                        ...previous,
                        subject: event.target.value,
                      }))
                    }
                  >
                    {[
                      "Physics",
                      "Chemistry",
                      "Biology",
                      "Mathematics",
                      "Other",
                    ].map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Description (optional)
                  </label>

                  <input
                    className={inputClass}
                    placeholder="Class 9 - Motion chapter"
                    value={liveForm.description}
                    onChange={(event) =>
                      setLiveForm((previous) => ({
                        ...previous,
                        description: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* STUDENT SELECTION */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      Select Participants
                    </h4>

                    <p className="mt-1 text-xs text-gray-500">
                      Select a complete class or choose individual students.
                    </p>
                  </div>

                  <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700">
                    {selectedIds.length} Selected
                  </span>
                </div>

                {/* CLASS GROUPS */}

                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-purple-200 bg-white p-4 transition hover:bg-purple-50">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Foundation 8th
                      </p>

                      <p className="text-xs text-gray-500">
                        {foundation8Students.length} students
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isGroupSelected(foundation8Students)}
                      disabled={foundation8Students.length === 0}
                      onChange={() => toggleGroup(foundation8Students)}
                      className="h-5 w-5 accent-purple-600"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-purple-200 bg-white p-4 transition hover:bg-purple-50">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Foundation 9th
                      </p>

                      <p className="text-xs text-gray-500">
                        {foundation9Students.length} students
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isGroupSelected(foundation9Students)}
                      disabled={foundation9Students.length === 0}
                      onChange={() => toggleGroup(foundation9Students)}
                      className="h-5 w-5 accent-purple-600"
                    />
                  </label>
                </div>

                {/* SEARCH */}

                <div className="mb-3">
                  <input
                    className={inputClass}
                    placeholder="Search students by name, username or email..."
                    value={participantSearch}
                    onChange={(event) =>
                      setParticipantSearch(event.target.value)
                    }
                  />
                </div>

                {/* STUDENT LIST */}

                {participantsLoading ? (
                  <div className="rounded-lg bg-white p-6 text-center text-sm text-gray-500">
                    Loading students...
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="rounded-lg bg-white p-6 text-center text-sm text-gray-500">
                    No matching students found.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                    {filteredParticipants.map((student) => (
                      <label
                        key={student._id}
                        className="flex cursor-pointer items-center gap-3 border-b border-gray-100 p-3 last:border-b-0 hover:bg-purple-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(student._id)}
                          onChange={() => toggleStudent(student._id)}
                          className="h-4 w-4 shrink-0 accent-purple-600"
                        />

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-purple-100 text-sm font-bold text-purple-700">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            student.name?.charAt(0)?.toUpperCase() || "S"
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {student.name}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {student.username || student.email || "Student"}
                          </p>
                        </div>

                        <div className="hidden flex-wrap justify-end gap-1 sm:flex">
                          {student.courses.map((course) => (
                            <span
                              key={course}
                              className="rounded-full bg-purple-50 px-2 py-1 text-[10px] font-medium text-purple-700"
                            >
                              {course.replace("Foundation ", "")}
                            </span>
                          ))}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* SELECTED STUDENTS */}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    {selectedIds.length} participant(s) will be allowed to join.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    disabled={selectedIds.length === 0}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-40"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* START BUTTON */}

              <button
                type="submit"
                disabled={
                  startingLive ||
                  !liveForm.title.trim() ||
                  participantsLoading
                }
                className={`${buttonClass} w-full bg-purple-600 text-white shadow-sm hover:bg-purple-700 sm:w-auto`}
              >
                {startingLive
                  ? "Creating Classroom..."
                  : "Start New Live Class →"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* RECORDED VIDEO FORM */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            Add Learning Video
          </h2>

          <p className="text-sm text-gray-500">
            Add a recorded daily lecture or one-shot video.
          </p>
        </div>

        <form onSubmit={createVideo} className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setType("daily")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                type === "daily"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Daily Lecture
            </button>

            <button
              type="button"
              onClick={() => setType("oneShot")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                type === "oneShot"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              One-Shot
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {type === "daily" && (
              <div>
                <label className={labelClass}>Lecture Date</label>

                <input
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                  required
                />
              </div>
            )}

            <div>
              <label className={labelClass}>Subject</label>

              <select
                className={inputClass}
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
              >
                {[
                  "Physics",
                  "Chemistry",
                  "Biology",
                  "Mathematics",
                  "Other",
                ].map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {type === "oneShot" && (
              <div>
                <label className={labelClass}>Chapter</label>

                <input
                  className={inputClass}
                  value={form.chapter}
                  onChange={(event) =>
                    setForm({ ...form, chapter: event.target.value })
                  }
                  placeholder="Chapter name"
                  required
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className={labelClass}>Video Title</label>

              <input
                className={inputClass}
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="Enter video title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>

              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Description (optional)"
              />
            </div>

            <div>
              <label className={labelClass}>Duration (minutes)</label>

              <input
                type="number"
                min="1"
                className={inputClass}
                value={form.duration}
                onChange={(event) =>
                  setForm({ ...form, duration: event.target.value })
                }
                placeholder="Example: 45"
              />
            </div>

            <div>
              <label className={labelClass}>
                YouTube Video ID{" "}
                {type === "oneShot" ? "(required)" : "(optional)"}
              </label>

              <input
                className={inputClass}
                value={form.youtubeVideoId}
                onChange={(event) =>
                  setForm({ ...form, youtubeVideoId: event.target.value })
                }
                placeholder="YouTube video ID"
                required={type === "oneShot"}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                setForm({ ...form, isPublished: event.target.checked })
              }
              className="h-4 w-4 accent-purple-600"
            />

            Publish this video
          </label>

          <button
            type="submit"
            disabled={creating}
            className={`${buttonClass} bg-purple-600 text-white hover:bg-purple-700`}
          >
            {creating ? "Adding..." : "Add Learning Video"}
          </button>

          {message && (
            <p className="text-sm text-gray-600">{message}</p>
          )}
        </form>
      </section>

      {/* EXISTING RECORDED VIDEOS */}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              All Learning Videos
            </h2>

            <p className="text-sm text-gray-500">
              {dailyCount} daily lectures · {oneShotCount} one-shot videos
            </p>
          </div>

          <button
            type="button"
            onClick={fetchVideos}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Loading videos...
          </p>
        ) : videos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
            No learning videos added yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => (
              <article
                key={video._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                        {video.type === "daily"
                          ? "Daily Lecture"
                          : "One-Shot"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          video.isPublished
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {video.isPublished ? "Published" : "Draft"}
                      </span>

                      {video.type === "daily" &&
                        !video.youtubeVideoId && (
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Recording Pending
                          </span>
                        )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900">
                      {video.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      {video.subject}
                      {video.chapter ? ` · ${video.chapter}` : ""}
                      {video.date ? ` · ${video.date.slice(0, 10)}` : ""}
                      {video.duration ? ` · ${video.duration} min` : ""}
                    </p>

                    {video.description && (
                      <p className="mt-2 text-sm text-gray-500">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteVideo(video._id)}
                    disabled={deletingId === video._id}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === video._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
