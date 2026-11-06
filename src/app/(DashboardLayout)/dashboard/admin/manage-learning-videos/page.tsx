
"use client";

import { FormEvent, useEffect, useState } from "react";
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
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export default function ManageLearningVideosPage() {
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

  const [liveForm, setLiveForm] = useState({
    title: "",
    subject: "Physics",
    description: "",
  });

  const [liveSession, setLiveSession] =
    useState<LiveSessionInfo | null>(null);

  const [liveLoading, setLiveLoading] = useState(true);
  const [startingLive, setStartingLive] = useState(false);
  const [endingLive, setEndingLive] = useState(false);
  const [showLiveRoom, setShowLiveRoom] = useState(false);
  const [meetingApi, setMeetingApi] = useState<any>(null);

  const [message, setMessage] = useState("");
  const [liveMessage, setLiveMessage] = useState("");


  // useEffect(() => {
  //   if (showLiveRoom) {
  //     sessionStorage.setItem("hideSidebar", "true");
  //   } else {
  //     sessionStorage.removeItem("hideSidebar");
  //   }
  // }, [showLiveRoom]);

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

  async function checkLiveStatus() {
    try {
      setLiveLoading(true);

      const response = await fetch("/api/Live-Class/status", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to check live status.");
      }

      setLiveSession(data.isLive ? data.session : null);
    } catch (error) {
      setLiveMessage(
        error instanceof Error ? error.message : "Unable to check live status."
      );
    } finally {
      setLiveLoading(false);
    }
  }

  useEffect(() => {
    fetchVideos();
    checkLiveStatus();
  }, []);

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

      setVideos((previous) => previous.filter((video) => video._id !== id));
      setMessage("Video deleted successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete video."
      );
    } finally {
      setDeletingId("");
    }
  }

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
          title: liveForm.title,
          subject: liveForm.subject,
          description: liveForm.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to start live class.");
      }

      setLiveSession(data.session);
      setShowLiveRoom(true);
      setLiveForm({ title: "", subject: "Physics", description: "" });
      setLiveMessage(
        data.alreadyLive
          ? "Your live class is already running."
          : "Live class started."
      );
      
    } catch (error) {
      setLiveMessage(
        error instanceof Error ? error.message : "Unable to start live class."
      );
      
    } finally {
      setStartingLive(false);
    }
  }

  async function endLiveClass() {
    if (!liveSession) return;

    if (!window.confirm("Are you sure you want to end this live class?")) {
      return;
    }

    setEndingLive(true);
    setLiveMessage("");

    try {
      const response = await fetch("/api/Live-Class/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: liveSession._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to end live class.");
      }

      try {
        meetingApi?.executeCommand("endConference");
      } catch (error) {
        console.error("Unable to close meeting iframe:", error);
      }

      setShowLiveRoom(false);
      setMeetingApi(null);
      setLiveSession(null);
      setLiveMessage("Live class ended. Upload its recording as a daily lecture.");
      
    } catch (error) {
      setLiveMessage(
        error instanceof Error ? error.message : "Unable to end live class."
      );
      
    } finally {
      setEndingLive(false);
    }
  }

  const dailyCount = videos.filter((video) => video.type === "daily").length;
  const oneShotCount = videos.filter((video) => video.type === "oneShot").length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Manage Learning Videos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage recorded daily lectures and one-shot videos.
          </p>
        </div>

        <div className="rounded-xl bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700">
          {videos.length} Total Videos
        </div>
      </div>

      {/* Independent Live Classroom */}
      <section className="overflow-hidden rounded-2xl border border-purple-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Live Classroom
            </h2>
            <p className="text-sm text-gray-600">
              Start a live class independently of recorded lectures.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              liveSession
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {liveLoading ? "Checking..." : liveSession ? "LIVE NOW" : "NOT LIVE"}
          </span>
        </div>

        <div className="space-y-5 p-5">
          {liveMessage && (
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              {liveMessage}
            </p>
          )}

          {liveLoading ? (
            <p className="text-sm text-gray-500">Checking live classroom...</p>
          ) : liveSession ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                  Current live class
                </p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  {liveSession.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {liveSession.subject}
                </p>
                {liveSession.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {liveSession.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowLiveRoom((value) => !value)}
                  className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700"
                >
                  {showLiveRoom ? "Hide Classroom" : "Enter Classroom"}
                </button>

                {liveSession.canEnd && (
                  <button
                    type="button"
                    onClick={endLiveClass}
                    disabled={endingLive}
                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {endingLive ? "Ending..." : "End Live Class"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={checkLiveStatus}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Refresh Status
                </button>
              </div>

              {showLiveRoom && (
                <LiveRoom
                  sessionId={liveSession._id}
                  isTeacher
                  onApiReady={setMeetingApi}
                  onLeave={() => {
                    setShowLiveRoom(false);
                    setMeetingApi(null);
                  }}
                />
                
              )}
            </div>
          ) : (
            <form onSubmit={startLiveClass} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Live Class Title</label>
                <input
                  className={inputClass}
                  placeholder="Example: Introduction to Motion"
                  value={liveForm.title}
                  onChange={(event) =>
                    setLiveForm({
                      ...liveForm,
                      title: event.target.value,
                    })
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
                    setLiveForm({
                      ...liveForm,
                      subject: event.target.value,
                    })
                  }
                >
                  {["Physics", "Chemistry", "Biology", "Mathematics", "Other"].map(
                    (subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className={labelClass}>Description (optional)</label>
                <input
                  className={inputClass}
                  placeholder="Class 9 - Motion chapter"
                  value={liveForm.description}
                  onChange={(event) =>
                    setLiveForm({
                      ...liveForm,
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={startingLive || !liveForm.title.trim()}
                  className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {startingLive ? "Starting..." : "Start Live Class"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Recorded video form */}
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
                {["Physics", "Chemistry", "Biology", "Mathematics", "Other"].map(
                  (subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  )
                )}
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
                YouTube Video ID {type === "oneShot" ? "(required)" : "(optional)"}
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
            className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {creating ? "Adding..." : "Add Learning Video"}
          </button>

          {message && (
            <p className="text-sm text-gray-600">{message}</p>
          )}
        </form>
      </section>

      {/* Existing recorded videos */}
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
                        {video.type === "daily" ? "Daily Lecture" : "One-Shot"}
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

                      {video.type === "daily" && !video.youtubeVideoId && (
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
                    {deletingId === video._id ? "Deleting..." : "Delete"}
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
