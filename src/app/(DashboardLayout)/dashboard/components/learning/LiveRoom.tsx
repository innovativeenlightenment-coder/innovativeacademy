
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";

const JaaSMeeting = dynamic(
  () => import("@jitsi/react-sdk").then((mod) => mod.JaaSMeeting),
  { ssr: false }
);

interface LiveRoomProps {
  sessionId: string;
  isTeacher?: boolean;
  onApiReady?: (api: any) => void;
  onLeave?: () => void;
  onRecordingControlsReady?: (controls: {
    stopRecording: () => Promise<void>;
  }) => void;
}

interface TokenResponse {
  success: boolean;
  token: string;
  roomName: string;
  isModerator: boolean;
  error?: string;
}

type ConnectionStatus =
  | "connecting"
  | "connected"
  | "unstable"
  | "disconnected";

type JitsiListener = {
  event: string;
  handler: (...args: any[]) => void;
};

export default function LiveRoom({
  sessionId,
  isTeacher = false,
  onApiReady,
  onLeave,
  onRecordingControlsReady,
}: LiveRoomProps) {
  const [meeting, setMeeting] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connection, setConnection] =
    useState<ConnectionStatus>("connecting");

  const [isRecording, setIsRecording] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [recordingError, setRecordingError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMutingAll, setIsMutingAll] = useState(false);
  const [muteMessage, setMuteMessage] = useState("");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const listenersRef = useRef<JitsiListener[]>([]);
const focusTimeoutsRef = useRef<number[]>([]);

  const leaveCalledRef = useRef(false);
  const endingRef = useRef(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopPromiseRef = useRef<Promise<void> | null>(null);
  const stopResolveRef = useRef<(() => void) | null>(null);

  // --------------------------------------------------
  // FETCH MEETING TOKEN
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function initializeMeeting() {
      try {
        setLoading(true);
        setError("");
        setMeeting(null);
        setConnection("connecting");

        const response = await fetch("/api/Live-Class/jaas-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({ sessionId }),
        });

        const data: TokenResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to join classroom.");
        }

        if (!data.token || !data.roomName) {
          throw new Error("Invalid classroom response.");
        }

        if (!cancelled) {
          setMeeting(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to connect to classroom."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!sessionId) {
      setError("Invalid classroom session.");
      setLoading(false);
    } else {
      void initializeMeeting();
    }

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // --------------------------------------------------
  // RECORDING FILE DOWNLOAD
  // --------------------------------------------------

  const saveRecording = useCallback((blob: Blob) => {
    if (!blob.size) {
      setRecordingError("The recording file is empty.");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    link.href = url;
    link.download = `Innovative-Academy-${date}.webm`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60_000);
  }, []);

  // --------------------------------------------------
  // RELEASE RECORDING DEVICES
  // --------------------------------------------------

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
    recorderRef.current = null;

    setIsRecording(false);
    setIsStartingRecording(false);
  }, []);

  // --------------------------------------------------
  // STOP RECORDING
  // --------------------------------------------------

  const stopRecording = useCallback((): Promise<void> => {
    if (stopPromiseRef.current) {
      return stopPromiseRef.current;
    }

    const recorder = recorderRef.current;

    if (!recorder || recorder.state === "inactive") {
      releaseStream();
      return Promise.resolve();
    }

    stopPromiseRef.current = new Promise<void>((resolve) => {
      stopResolveRef.current = resolve;

      try {
        recorder.stop();
      } catch (err) {
        console.error("Recording stop error:", err);

        releaseStream();
        stopPromiseRef.current = null;
        stopResolveRef.current = null;

        resolve();
      }
    });

    return stopPromiseRef.current;
  }, [releaseStream]);

  // --------------------------------------------------
  // START TEACHER CAMERA + MICROPHONE RECORDING
  // --------------------------------------------------

  const startRecording = useCallback(async () => {
    if (
      !isTeacher ||
      recorderRef.current ||
      isStartingRecording
    ) {
      return;
    }

    setRecordingError("");
    setIsStartingRecording(true);

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setRecordingError(
        "Camera and microphone recording is not supported by this browser."
      );
      setIsStartingRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      if (!videoTracks.length || !audioTracks.length) {
        throw new Error(
          "Both camera and microphone are required for recording."
        );
      }

      if (
        videoTracks[0].readyState !== "live" ||
        audioTracks[0].readyState !== "live"
      ) {
        throw new Error(
          "The camera or microphone is not available."
        );
      }

      const supportedMimeType = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      if (!supportedMimeType) {
        throw new Error(
          "Your browser does not support WebM recording."
        );
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType,
        videoBitsPerSecond: 4_000_000,
        audioBitsPerSecond: 128_000,
      });

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("Recording error:", event);
        setRecordingError(
          "A recording error occurred. Stop and restart recording if necessary."
        );
      };

      recorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "video/webm",
          });

          saveRecording(blob);
        } catch (err) {
          console.error("Unable to save recording:", err);
          setRecordingError("Unable to save the recording.");
        } finally {
          chunksRef.current = [];
          releaseStream();

          stopPromiseRef.current = null;

          const resolve = stopResolveRef.current;
          stopResolveRef.current = null;
          resolve?.();
        }
      };

      recorderRef.current = recorder;

      recorder.start(1000);
      setIsRecording(true);
      setIsStartingRecording(false);
    } catch (err) {
      console.error("Unable to start recording:", err);

      setRecordingError(
        err instanceof Error
          ? err.message
          : "Unable to access camera and microphone."
      );

      releaseStream();
    }
  }, [
    isTeacher,
    isStartingRecording,
    saveRecording,
    releaseStream,
  ]);

  // Allow the parent page to stop recording before ending the class.
  useEffect(() => {
    onRecordingControlsReady?.({ stopRecording });
  }, [onRecordingControlsReady, stopRecording]);

  // --------------------------------------------------
  // TEACHER: MUTE ALL PARTICIPANTS
  // --------------------------------------------------

  const muteEveryone = useCallback(() => {
    const api = apiRef.current;

    if (!isTeacher || !api || isMutingAll) {
      return;
    }

    try {
      setIsMutingAll(true);
      setMuteMessage("");

      api.executeCommand("muteEveryone", "audio");

      setMuteMessage("Mute-all command sent.");

      window.setTimeout(() => {
        setMuteMessage("");
      }, 3500);
    } catch (err) {
      console.error("Mute everyone failed:", err);
      setMuteMessage("Unable to mute participants.");
    } finally {
      setIsMutingAll(false);
    }
  }, [isTeacher, isMutingAll]);

  // --------------------------------------------------
  // FULLSCREEN
  // --------------------------------------------------

  const toggleFullscreen = useCallback(async () => {
    const wrapper = wrapperRef.current;

    if (!wrapper) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await wrapper.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  useEffect(() => {
    const updateFullscreen = () => {
      setIsFullscreen(
        document.fullscreenElement === wrapperRef.current
      );
    };

    document.addEventListener("fullscreenchange", updateFullscreen);

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        updateFullscreen
      );
    };
  }, []);

  // --------------------------------------------------
  // CLEAR TEACHER-FOCUS RETRY TIMERS
  // --------------------------------------------------

const clearFocusTimeouts = useCallback(() => {
  focusTimeoutsRef.current.forEach((timeout) => {
    window.clearTimeout(timeout);
  });

  focusTimeoutsRef.current = [];
}, []);

  // --------------------------------------------------
  // JITSI EVENT CLEANUP
  // --------------------------------------------------

  const removeListeners = useCallback(() => {
    const api = apiRef.current;

    if (api?.removeEventListener) {
      listenersRef.current.forEach(({ event, handler }) => {
        try {
          api.removeEventListener(event, handler);
        } catch (err) {
          console.warn(`Unable to remove ${event}`, err);
        }
      });
    }

    listenersRef.current = [];
  }, []);

  const registerEvent = useCallback(
    (
      api: any,
      event: string,
      handler: (...args: any[]) => void
    ) => {
      if (!api?.addEventListener) return;

      api.addEventListener(event, handler);
      listenersRef.current.push({ event, handler });
    },
    []
  );

  // --------------------------------------------------
  // LEAVE
  // --------------------------------------------------

  const handleLeave = useCallback(async () => {
    if (leaveCalledRef.current) return;

    leaveCalledRef.current = true;

    await stopRecording();

    if (!endingRef.current) {
      onLeave?.();
    }
  }, [stopRecording, onLeave]);

  useEffect(() => {
    leaveCalledRef.current = false;
    endingRef.current = false;
  }, [sessionId]);

  // --------------------------------------------------
  // STUDENT: FOCUS TEACHER
  // --------------------------------------------------

  const focusTeacher = useCallback(
    async (api: any, attempt = 0) => {
      if (isTeacher || !api) return;

      try {
        const participants = await api.getParticipantsInfo?.();

        const teacher = participants?.find(
          (participant: any) =>
            participant.role === "moderator"
        );

        const teacherId =
          teacher?.participantId || teacher?.id;

        if (teacherId) {
          api.executeCommand("setTileView", false);

          api.executeCommand(
            "setLargeVideoParticipant",
            teacherId,
            "camera"
          );

          return;
        }

        // Participant roles may arrive after the student joins.
        // Retry a few times rather than giving up immediately.
        if (attempt < 4) {
          const timeout = window.setTimeout(() => {
            void focusTeacher(api, attempt + 1);
          }, 800);

          focusTimeoutsRef.current.push(timeout);
        }
      } catch (err) {
        console.warn("Unable to focus teacher:", err);

        if (attempt < 4) {
          const timeout = window.setTimeout(() => {
            void focusTeacher(api, attempt + 1);
          }, 800);

          focusTimeoutsRef.current.push(timeout);
        }
      }
    },
    [isTeacher]
  );

  // --------------------------------------------------
  // JITSI READY
  // --------------------------------------------------

  const handleApiReady = useCallback(
    (api: any) => {
      removeListeners();
      clearFocusTimeouts();

      apiRef.current = api;
      onApiReady?.(api);

      try {
        api.executeCommand("setTileView", Boolean(isTeacher));
      } catch (err) {
        console.warn("Unable to set meeting layout:", err);
      }

      registerEvent(api, "videoConferenceJoined", () => {
        setConnection("connected");

        if (!isTeacher) {
          void focusTeacher(api);
        }
      });

      registerEvent(api, "participantJoined", () => {
        if (!isTeacher) {
          void focusTeacher(api);
        }
      });

      registerEvent(
        api,
        "participantRoleChanged",
        (event: any) => {
          if (
            !isTeacher &&
            event?.role === "moderator"
          ) {
            const teacherId = event?.id || event?.participantId;

            if (teacherId) {
              try {
                api.executeCommand("setTileView", false);
                api.executeCommand(
                  "setLargeVideoParticipant",
                  teacherId,
                  "camera"
                );
              } catch (err) {
                console.warn("Unable to pin teacher:", err);
                void focusTeacher(api);
              }
            } else {
              void focusTeacher(api);
            }
          }
        }
      );

      registerEvent(api, "connectionInterrupted", () => {
        setConnection("unstable");
      });

      registerEvent(api, "connectionRestored", () => {
        setConnection("connected");

        if (!isTeacher) {
          void focusTeacher(api);
        }
      });

      registerEvent(api, "connectionFailed", () => {
        setConnection("disconnected");
      });

      registerEvent(api, "videoConferenceLeft", () => {
        setConnection("disconnected");
      });

      registerEvent(api, "readyToClose", () => {
        void handleLeave();
      });
    },
    [
      removeListeners,
      clearFocusTimeouts,
      onApiReady,
      registerEvent,
      isTeacher,
      focusTeacher,
      handleLeave,
    ]
  );

  // --------------------------------------------------
  // UNMOUNT CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      removeListeners();
      clearFocusTimeouts();

      const recorder = recorderRef.current;

      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch (err) {
          console.warn("Recording cleanup failed:", err);

          streamRef.current?.getTracks().forEach((track) => {
            track.stop();
          });
        }
      } else {
        streamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });
      }

      apiRef.current = null;
    };
  }, [removeListeners, clearFocusTimeouts]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center rounded-2xl bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-purple-500" />

          <p className="font-semibold">
            Connecting to classroom...
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (
    error ||
    !meeting ||
    !process.env.NEXT_PUBLIC_JAAS_APP_ID
  ) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl bg-slate-950 p-6 text-center text-white">
        <h2 className="text-xl font-bold">
          Unable to join classroom
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-400">
          {error || "JaaS App ID is missing."}
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // CLASSROOM
  // --------------------------------------------------

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden bg-black ${
        isFullscreen
          ? "h-[100dvh] w-screen rounded-none"
          : "h-[clamp(420px,80dvh,950px)] rounded-2xl"
      }`}
    >
      {/* TEACHER CONTROLS */}
      {isTeacher && (
        <div className="absolute right-3 top-3 z-[100] flex flex-wrap items-start justify-end gap-2">
          <button
            type="button"
            onClick={muteEveryone}
            disabled={isMutingAll}
            title="Mute all participants' microphones"
            className="rounded-full border border-white/20 bg-slate-900/90 px-3 py-2.5 text-xs font-bold text-white shadow-xl transition hover:bg-slate-700 disabled:opacity-60"
          >
            {isMutingAll ? "Muting..." : "Mute all"}
          </button>

          <button
            type="button"
            onClick={
              isRecording
                ? () => void stopRecording()
                : () => void startRecording()
            }
            disabled={isStartingRecording}
            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-xl transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isRecording
                ? "bg-red-600 text-white"
                : "bg-white text-slate-900"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRecording
                  ? "animate-pulse bg-white"
                  : "bg-red-500"
              }`}
            />

            {isStartingRecording
              ? "Starting..."
              : isRecording
                ? "REC · STOP"
                : "REC"}
          </button>

          {recordingError && (
            <div className="w-full max-w-[260px] rounded-lg bg-red-950 px-3 py-2 text-xs text-red-200">
              {recordingError}
            </div>
          )}

          {muteMessage && (
            <div className="w-full max-w-[220px] rounded-lg bg-slate-900/95 px-3 py-2 text-right text-xs text-white">
              {muteMessage}
            </div>
          )}
        </div>
      )}

      {/* CUSTOM FULLSCREEN BUTTON */}
      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        className="absolute bottom-3 right-3 z-[100] rounded-lg border border-white/15 bg-black/75 px-3 py-2 text-xs font-semibold text-white transition hover:bg-black"
      >
        {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      </button>

      {/* CONNECTION STATUS */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[100] flex items-center gap-2 rounded-lg bg-black/70 px-3 py-2 text-[10px] font-semibold text-white">
        <span
          className={`h-2 w-2 rounded-full ${
            connection === "connected"
              ? "bg-emerald-400"
              : connection === "unstable"
                ? "bg-amber-400"
                : connection === "disconnected"
                  ? "bg-red-500"
                  : "animate-pulse bg-amber-400"
          }`}
        />

        {connection.toUpperCase()}
      </div>

      {/* JITSI MEETING */}
      <JaaSMeeting
        appId={process.env.NEXT_PUBLIC_JAAS_APP_ID!}
        roomName={meeting.roomName}
        jwt={meeting.token}
        onApiReady={handleApiReady}
        onReadyToClose={() => void handleLeave()}
        configOverwrite={{
          startWithAudioMuted: !isTeacher,
          startWithVideoMuted: !isTeacher,

          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,

          localRecording: {
            disable: true,
          },

          toolbarConfig: {
            alwaysVisible: false,
            timeout: 3000,
            initialTimeout: 5000,
          },

          // Request up to 1080p where supported.
          // Actual quality adapts to device and network conditions.
          resolution: 1080,
          disableSimulcast: false,

          videoQuality: {
            enableAdaptiveMode: true,
          },
        }}
        interfaceConfigOverwrite={{
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "raisehand",
            "tileview",
            "settings",
            "hangup",
          ],

          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        }}
        getIFrameRef={(iframe: HTMLDivElement) => {
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.minHeight = "0";
          iframe.style.border = "0";
        }}
      />
    </div>
  );
}
