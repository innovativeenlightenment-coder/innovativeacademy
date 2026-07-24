"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/Save-Feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token") || "", // your normal auth
      },
      body: JSON.stringify({ rating, message }),
    });

    const json = await res.json();
    setLoading(false);
    setMsg(json.message);

    if (json.success) {
      setRating(0);
      setMessage("");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Give Feedback</h2>

      {msg && (
        <p className="mb-4 p-2 rounded bg-green-100 text-green-600 font-medium">
          {msg}
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">

        {/* Rating Stars */}
        <div className="flex gap-2">
          {[1,2,3,4,5].map((star) => (
            <button
              type="button"
              key={star}
              className={`text-2xl ${
                rating >= star ? "text-yellow-500" : "text-gray-400"
              }`}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          placeholder="Your Feedback..."
          className="w-full p-2 border rounded"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
