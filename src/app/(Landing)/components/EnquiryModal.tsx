// components/EnquiryModal.tsx
"use client";

import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EnquiryModal({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    class: "",
    phone: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/enquiry", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const message = `New Enquiry:
Name: ${form.name}
Class: ${form.class}
Phone: ${form.phone}`;

      window.open(
        `https://wa.me/919421567466?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      alert("Enquiry submitted! Click SEND in WhatsApp.");

      setForm({ name: "", class: "", phone: "" });
      onClose();
    } catch (err) {
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Student Enquiry</h2>

        <p className="text-sm text-gray-500 mb-4">
          We will call you within 5 minutes 🚀
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Student Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />

          <select
            value={form.class}
            onChange={(e) =>
              setForm({ ...form, class: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Class</option>
            <option value="5">Class 5</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>

          <input
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {/* Actions */}
        <div className="mt-4 flex justify-between">
          <a
            href="tel:919421567466"
            className="text-indigo-600 text-sm"
          >
            📞 Call Now
          </a>

          <button
            onClick={onClose}
            className="text-gray-500 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}