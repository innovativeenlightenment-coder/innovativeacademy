"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const params = useParams();
  const otp = params?.otp as string; // ✅ safely extract dynamic param
  const router = useRouter();

  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    if (!otp) return; // wait until otp is available

    const verifyUser = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus("✅ Email verified successfully!");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setStatus("❌ " + data.message);
        }
      } catch (err) {
        console.error(err);
        setStatus("❌ Verification failed");
      }
    };

    verifyUser();
  }, [otp, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">{status}</p>
    </div>
  );
}
