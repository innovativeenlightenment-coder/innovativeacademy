"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    const data = await res.json();
    setMsg(data.message);
    setLoading(false);
    if (data.success) router.push("/login");
  };

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Box className="bg-white p-8 rounded-2xl shadow-md w-96">
        <Typography variant="h5" textAlign="center" mb={2}>
          Reset Password
        </Typography>
        {msg && <Alert severity="info">{msg}</Alert>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <TextField
            label="New Password"
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}
