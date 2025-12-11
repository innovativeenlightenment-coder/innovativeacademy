"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [err, setError] = useState("");
  const [verifing, setVerifing] = useState(false);

  const [timer, setTimer] = useState(0); // resend cooldown timer
  const router = useRouter();

  // ------------------------------
  // VERIFY USER OTP
  // ------------------------------
  const verifyUser = async () => {
    if (!otp) return setError("Please enter OTP");

    try {
      setVerifing(true);
      setError("");

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      setVerifing(false);

      if (data.success) {
        router.push("/login");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Verification failed");
      setVerifing(false);
    }
  };

  // ------------------------------
  // RESEND OTP
  // ------------------------------
  const resendOtp = async () => {
    if (!email) return setError("Invalid email");

    // setTimer(30); // 30 seconds cooldown

    // const interval = setInterval(() => {
    //   setTimer((t) => {
    //     if (t === 1) clearInterval(interval);
    //     return t - 1;
    //   });
    // }, 1000);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError("Failed to resend OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Error while resending OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-sm p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">
          Verify Email
        </h1>

        <p className="text-center text-gray-300 text-sm mb-6">
          Enter the OTP sent to <span className="font-semibold">{email}</span>
        </p>

        {err && (
          <div className="mb-4 px-3 py-2 rounded bg-red-100 text-red-700 text-sm text-center">
            {err}
          </div>
        )}

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full mb-4 rounded-lg border border-gray-300 bg-white/80 px-3 py-2 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <button
          disabled={verifing}
          onClick={verifyUser}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition"
        >
          {verifing ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="text-xs text-center text-gray-300 mt-5">
          Didn’t receive OTP?{" "}
          <button
            onClick={resendOtp}
            disabled={timer > 0}
            className="text-blue-300 hover:underline disabled:opacity-40"
          >
            {timer > 0 ? `Wait ${timer}s` : "Resend OTP"}
          </button>
        </p>
      </div>
    </div>
  );
}
