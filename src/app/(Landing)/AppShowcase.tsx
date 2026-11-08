"use client";

import React, { useState } from "react";
import {
  Download,
  Smartphone,
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Play,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";


type DownloadStatus = "idle" | "downloading" | "done" | "error";

const APK_URL = "/app/innovative-academy.apk";

// Add your YouTube video ID here when your app recording is ready.
// Example: "dQw4w9WgXcQ"
const YOUTUBE_VIDEO_ID = "EBmr8j3915g";

const features = [
  { icon: BookOpen, label: "Daily Lectures" },
  { icon: Brain, label: "Smart Revision" },
  { icon: Target, label: "Practice & Tests" },
  { icon: TrendingUp, label: "Progress Analysis" },
];

export default function AppShowcase() {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const startDownload = async () => {
    if (status === "downloading") return;

    setStatus("downloading");
    setProgress(0);
    setErrorMessage("");

    try {
      const response = await fetch(APK_URL);

      if (!response.ok || !response.body) {
        throw new Error("Unable to download the APK.");
      }

      const totalSize = Number(response.headers.get("Content-Length"));

      if (!totalSize || totalSize <= 0) {
        throw new Error("File size unavailable for progress tracking.");
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedSize = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        if (value) {
          chunks.push(value);
          receivedSize += value.length;

          setProgress(
            Math.min(100, Math.round((receivedSize / totalSize) * 100))
          );
        }
      }

      const blob = new Blob(chunks as BlobPart[], {
        type: "application/vnd.android.package-archive",
      });

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = "innovative-academy.apk";

      document.body.appendChild(link);
      link.click();
      link.remove();

      // Keep the object URL alive briefly for the browser download.
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);

      setProgress(100);
      setStatus("done");
    } catch (error) {
      console.error("APK download failed:", error);

      // Fallback: let the browser download the APK directly.
      setStatus("error");
      setErrorMessage(
        "Progress download unavailable. Use the direct download option."
      );
    }
  };

  return (
    <section
      id="academy-app"
      className="bg-white px-4 py-7 sm:px-6 lg:py-9"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#160B2E] text-white shadow-xl shadow-purple-200/50">

          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-purple-600/30 blur-[90px]" />
            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-indigo-600/20 blur-[80px]" />

            <div
              className="absolute inset-0 opacity-[0.055]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="grid items-center gap-6 px-5 py-6 sm:px-8 sm:py-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-9 lg:px-10">

            {/* LEFT CONTENT */}
            <div className="relative z-10">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-400/10 px-3 py-1 text-[10px] font-bold tracking-wider text-purple-200">
                <Sparkles size={13} />
                INNOVATIVE ACADEMY APP
              </div>

              <h2 className="max-w-xl text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                Learning beyond
                <span className="block bg-gradient-to-r from-purple-300 via-fuchsia-200 to-indigo-300 bg-clip-text text-transparent">
                  the classroom.
                </span>
              </h2>

              <p className="mt-2 max-w-lg text-xs leading-6 text-purple-100/70 sm:text-sm">
                Lectures, revision, practice and progress tracking — your
                complete learning experience in one app.
              </p>

              {/* Features */}
              <div className="mt-5 grid max-w-lg grid-cols-2 gap-x-4 gap-y-3">
                {features.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.07] text-purple-200">
                      <Icon size={16} />
                    </div>

                    <span className="text-xs font-medium text-white/90">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Download button */}
              <div className="mt-5 max-w-md">
                <button
                  type="button"
                  onClick={startDownload}
                  disabled={status === "downloading"}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-purple-900 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-50 disabled:cursor-wait disabled:opacity-90"
                >
                  {status === "downloading" ? (
                    <LoaderCircle size={19} className="animate-spin" />
                  ) : status === "done" ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Download size={19} />
                  )}

                  <span>
                    {status === "downloading"
                      ? `Downloading ${progress}%`
                      : status === "done"
                      ? "Download Started"
                      : "Download Android App"}
                  </span>

                  {status === "idle" && (
                    <ArrowUpRight
                      size={17}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  )}
                </button>

                {/* Download progress */}
                {status === "downloading" && (
                  <div className="mt-2.5">
                    <div className="mb-1.5 flex justify-between text-[11px] text-purple-200">
                      <span>Downloading APK...</span>
                      <span>{progress}%</span>
                    </div>

                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-white/15"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-300 transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {status === "done" && (
                  <p className="mt-2 text-[11px] text-green-300">
                    <CheckCircle2 size={13} className="mr-1 inline" />
                    Your download has been initiated.
                  </p>
                )}

                {status === "error" && (
                  <div className="mt-2 text-[11px] text-purple-200">
                    <p>{errorMessage}</p>
                    <a
                      href={APK_URL}
                      download="innovative-academy.apk"
                      className="mt-1 inline-block font-semibold text-white underline underline-offset-4"
                    >
                      Download APK directly
                    </a>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-[10px] text-purple-200/70">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={13} />
                    Official IA App
                  </span>

                  <span className="flex items-center gap-1">
                    <Smartphone size={13} />
                    Android
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT VIDEO PREVIEW */}
            <div className="relative mx-auto w-full max-w-[400px]">
              <div className="absolute inset-5 rounded-full bg-purple-500/20 blur-[65px]" />

              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] p-1.5 shadow-xl backdrop-blur-sm">
                <div className="relative aspect-video max-h-[220px] overflow-hidden rounded-xl bg-[#21143D]">
                  {YOUTUBE_VIDEO_ID ? (
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}`}
                      title="Innovative Academy App Demonstration"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-purple-500/40 to-indigo-500/30 text-white shadow-lg">
                        <Smartphone size={28} />
                      </div>

                      <p className="text-base font-bold text-white">
                        Inside Innovative Academy
                      </p>

                      <p className="mt-1 text-[11px] text-purple-200/70">
                        App walkthrough coming soon
                      </p>

                      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold tracking-wider text-purple-200">
                        <Play size={11} fill="currentColor" />
                        APP PREVIEW
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-2.5 py-2">
                  <div>
                    <p className="text-[11px] font-bold text-white">
                      Innovative Academy
                    </p>
                    <p className="text-[9px] text-purple-200/60">
                      Learn. Practise. Improve.
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-200">
                    <Sparkles size={15} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
