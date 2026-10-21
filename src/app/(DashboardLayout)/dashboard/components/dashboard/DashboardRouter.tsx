"use client";

import { useEffect, useState } from "react";
import { Alert } from "@mui/material";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Loading from "../../loading";

import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";

type DashboardRole = "admin" | "teacher" | "student" | "school" | "college";

export default function DashboardRouter() {
  const [role, setRole] = useState<DashboardRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const data = await getCurrentUser();

        if (!data?.success || !data.user) {
          window.location.href = "/login";
          return;
        }

        const userRole = String(data.user.role ?? "").trim().toLowerCase();
        const validRoles: DashboardRole[] = ["admin", "teacher", "student", "school", "college"];

        if (validRoles.includes(userRole as DashboardRole)) {
          if (active) setRole(userRole as DashboardRole);
        } else if (active) {
          setError("Your account role is missing or invalid.");
        }
      } catch (err) {
        console.error("Dashboard auth check failed:", err);
        if (active) setError("Unable to load your dashboard. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;
  if (error) return <Alert severity="error">{error}</Alert>;

  switch (role) {
    case "student": return <StudentDashboard />;
    case "teacher": return <TeacherDashboard />;
    case "admin": return <AdminDashboard />;
    case "school":
    case "college":
      return <Alert severity="info">Your {role} dashboard is not part of this three-dashboard implementation yet.</Alert>;
    default: return <Alert severity="warning">Dashboard unavailable.</Alert>;
  }
}
