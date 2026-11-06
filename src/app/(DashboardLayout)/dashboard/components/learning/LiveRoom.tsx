
"use client";

import { useEffect, useState } from "react";
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
  jwt: string;
  appId: string;
  roomName: string;
  isModerator: boolean;
  displayName: string;
  email?: string;
  message?: string;
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

  useEffect(() => {
    let cancelled = false;

    async function getToken() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/Live-Class/jaas-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({ sessionId }),
        });

        const data: TokenResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to join live class.");
        }

        if (!data.jwt || !data.appId || !data.roomName) {
          throw new Error("Invalid classroom authentication response.");
        }

        if (!cancelled) {
          setMeeting(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to join classroom."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (sessionId) getToken();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p>Connecting to classroom...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-slate-950 p-6 text-center text-white">
        <p className="mb-2 text-lg font-semibold">Unable to join classroom</p>
        <p className="text-sm text-slate-300">
          {error || "Classroom information is unavailable."}
        </p>
        <button
          onClick={onLeave}
          className="mt-5 rounded-lg bg-white px-5 py-2 font-medium text-slate-900"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div  className={
    isTeacher
      ? "fixed inset-0 z-[99999] bg-black"
      : "relative w-full overflow-hidden rounded-xl bg-black"
  }>
    
      <JaaSMeeting
        appId={meeting.appId}
        roomName={meeting.roomName}
        jwt={meeting.jwt}
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
            "fullscreen",
            "hangup",
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        }}
        userInfo={{
          displayName: meeting.displayName,
          email: meeting.email || "",
        }}
     getIFrameRef={(parentNode: HTMLDivElement) => {
  parentNode.style.width = "100%";
  parentNode.style.height = "100%";
  parentNode.style.minHeight = "100vh";
  parentNode.style.border = "0";
}}
      />
    </div>
  );
}
