
"use client";

import { useEffect, useRef, useState } from "react";
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
}

interface TokenResponse {
  success: boolean;
  token: string;
  roomName: string;
  isModerator: boolean;
  error?: string;
}

export default function LiveRoom({
  sessionId,
  isTeacher = false,
  onApiReady,
  onLeave,
}: LiveRoomProps) {
  const [meeting, setMeeting] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const meetingRef = useRef<HTMLDivElement>(null);

  // Fetch meeting authentication
  useEffect(() => {
    let cancelled = false;

    async function getToken() {
      try {
        setLoading(true);
        setError("");
        setMeeting(null);

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
          throw new Error(
            data.error || "Unable to join live class."
          );
        }

        if (!data.token || !data.roomName) {
          throw new Error(
            "Invalid classroom authentication response."
          );
        }

        if (!cancelled) {
          setMeeting(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to join classroom."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (sessionId) {
      getToken();
    } else {
      setError("Invalid classroom session.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Keep fullscreen state synchronized, including when Esc is pressed.
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        document.fullscreenElement === meetingRef.current
      );
    }

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
  }, []);

  // Enter or exit full-screen mode
  async function toggleFullscreen() {
    const element = meetingRef.current;

    if (!element) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await element.requestFullscreen();
      }
    } catch (err) {
      console.error("FULLSCREEN ERROR:", err);
    }
  }

  const appId = process.env.NEXT_PUBLIC_JAAS_APP_ID;

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-[360px] w-full items-center justify-center rounded-2xl bg-slate-950 p-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-purple-500" />

          <h2 className="text-lg font-semibold">
            Connecting to classroom
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Please wait while we prepare your meeting...
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error || !meeting || !appId) {
    const errorMessage = error
      ? error
      : !appId
      ? "JaaS App ID is not configured."
      : "Classroom information is unavailable.";

    return (
      <div className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-2xl bg-slate-950 p-6 text-center text-white">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-3xl text-red-400">
          !
        </div>

        <h2 className="text-xl font-bold">
          Unable to join classroom
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-400">
          {errorMessage}
        </p>

        <button
          onClick={onLeave}
          className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div
      ref={meetingRef}
      className={`flex w-full flex-col overflow-hidden bg-slate-950 ${
        isFullscreen
          ? "h-dvh rounded-none"
          : "h-[clamp(360px,76dvh,900px)] rounded-2xl border border-slate-800 shadow-2xl"
      }`}
    >
      {/* Custom classroom header */}
      <div className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
            <img src="/images/logos/Innovative_Academy_Logo_icon_dark.png" className='w-8' />
        

          <span className="ml-1 flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            LIVE
          </span>
        </div>

        {/* Fullscreen button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 sm:text-sm"
          title={
            isFullscreen
              ? "Exit full screen (Esc)"
              : "Enter full screen"
          }
        >
          {isFullscreen ? (
            <>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" />
              </svg>
              <span className="hidden sm:inline">Exit Full Screen</span>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />
              </svg>
              <span className="hidden sm:inline">Full Screen</span>
            </>
          )}
        </button>
      </div>

      {/* JaaS meeting area */}
      <div className="min-h-0 w-full flex-1 bg-black">
        <JaaSMeeting
          appId={appId}
          roomName={meeting.roomName}
          jwt={meeting.token}
          onApiReady={(api: any) => {
            onApiReady?.(api);

            api.addListener("readyToClose", () => {
              onLeave?.();
            });
          }}
          onReadyToClose={() => onLeave?.()}
          configOverwrite={{
            startWithAudioMuted: !isTeacher,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "raisehand",
              "tileview",
              
              "hangup",
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          }}
          userInfo={{
            displayName: "Innovative Academy User",
            email: "",
          }}
          getIFrameRef={(parentNode: HTMLDivElement) => {
            parentNode.style.width = "100%";
            parentNode.style.height = "100%";
            parentNode.style.minHeight = "0";
            parentNode.style.border = "0";
          }}
        />
      </div>
    </div>
  );
}
