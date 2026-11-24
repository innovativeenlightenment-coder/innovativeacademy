"use client";

import React, { useEffect, useState } from "react";

import {
  styled,
  Container,
  Box,
} from "@mui/material";

import Header from "./layout/header/Header";
import Sidebar from "./layout/sidebar/Sidebar";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import Loading from "./loading";
import { getCurrentUser } from "@/lib/getCurrentUser";

const MainWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  overflowX: "hidden",

  backgroundColor:
    theme.palette.mode === "dark"
      ? "#0b1020"
      : "#f5f7fb",

  color: theme.palette.text.primary,

  transition: "background-color 180ms ease",
}));

const PageWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 0%",
  minWidth: 0,
  minHeight: "100vh",
  paddingBottom: "40px",
  flexDirection: "column",

  backgroundColor: "transparent",
  color: theme.palette.text.primary,

  overflowX: "hidden",
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [isTrialActive, setIsTrialActive] =
    useState<boolean>(true);

  const [isSubscribed, setIsSubscribed] =
    useState<boolean>(true);

  // Hidden sidebar routes
  const hideSidebarPaths = [
    "/dashboard/student/test",
  ];

  const shouldHideSidebar =
    hideSidebarPaths.includes(pathname);

  const isTestPage =
    pathname.includes("/student/test") &&
    !pathname.includes("/student/test-record");

  // Authentication and trial validation
  useEffect(() => {
    let active = true;

    async function fetchUser() {
      try {
        const data = await getCurrentUser();

        if (!active) return;

        if (!data?.success || !data.user) {
          router.push("/login");
          return;
        }

        const user = data.user;

        setIsTrialActive(user.isTrialActive);
        setIsSubscribed(user.isSubscribed);

        // Subscribed users are allowed
        if (user.isSubscribed) return;

        // Missing trial dates
        if (!user.trialStart || !user.trialEnd) {
          router.push("/#not_allowed");
          return;
        }

        // Check trial expiry
        const now = new Date();
        const end = new Date(user.trialEnd);

        if (now >= end) {
          router.push("/#not_allowed");
        }
      } catch (error) {
        console.error("Authentication check failed:", error);

        if (active) {
          router.push("/login");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      active = false;
    };
  }, [router]);

  // Close mobile drawer after navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return <Loading />;
  }

  const hasAccess =
    isSubscribed || isTrialActive;

  return (
    <MainWrapper className="mainwrapper">

      {/* SIDEBAR */}
      {!shouldHideSidebar && hasAccess && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onSidebarClose={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* MAIN CONTENT */}
      <PageWrapper className="page-wrapper">

        <Header
          hide={shouldHideSidebar || !hasAccess}
          toggleMobileSidebar={() =>
            setMobileSidebarOpen(true)
          }
        />

        <Container
          maxWidth={false}
          sx={{
            pt: { xs: 2, md: 3 },
            px: {
              xs: 1.5,
              sm: 2.5,
              lg: 3,
            },
            pb: 2,

            width: "100%",
            maxWidth: "100%",
            minWidth: 0,

            boxSizing: "border-box",
            overflowX: "hidden",
          }}
        >
          <Box
            sx={{
              minHeight: "calc(100vh - 180px)",
              width: "100%",
              minWidth: 0,
            }}
          >
            {children}
          </Box>
        </Container>

      </PageWrapper>
    </MainWrapper>
  );
}