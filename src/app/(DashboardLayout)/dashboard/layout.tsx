"use client";
import { styled, Container, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import Header from "./layout/header/Header";
import Sidebar from "./layout/sidebar/Sidebar";
import { usePathname, useRouter } from "next/navigation";

import Loading from "./loading";
import { getCurrentUser } from "@/lib/getCurrentUser";


const MainWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  backgroundColor:
    theme.palette.mode === "dark" ? "#0b1020" : "#f5f7fb",
  color: theme.palette.text.primary,
  transition: "background-color 180ms ease",
}));

const PageWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  minWidth: 0,
  minHeight: "100vh",
  paddingBottom: "40px",
  flexDirection: "column",
  zIndex: 1,
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
}));


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isTrialActive, setIsTrialActive] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);

  // ✅ track screen width properly
  const [screenWidth, setScreenWidth] = useState<number>(1200);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // hide sidebar paths
  const hideSidebarPaths = ["/dashboard/student/test"];
  const shouldHideSidebar = hideSidebarPaths.includes(pathname);
  const isTestPage = pathname.includes("/student/test")&&!pathname.includes("/student/test-record");

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUser();

        if (data?.success && data.user) {
   
          setIsTrialActive(data.user.isTrialActive);
          
          setIsSubscribed(data.user.isSubscribed);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  
  useEffect(()=>{
  const fetchUser=async()=>{
    const data = await getCurrentUser();

          if (data?.success && data.user) {
     const user=data.user
      if (!user) {
        return router.push("/");
      }
  
      // 1. If subscribed → allow
      if (user.isSubscribed) {
        return 
      }
  
      // 2. If no trial data → block
      if (!user.trialStart || !user.trialEnd) {
        return  router.push("/#not_allowed");
      }
  
      // 3. Check if trial expired
      const now = new Date();
       const start = new Date(user.trialStart);
      const end = new Date(user.trialEnd);
  console.log(now,start,end)
      if (now >= end) {
       return  router.push("/#not_allowed");
       alert()
      }
     
    }
  }
  fetchUser()
  },[])
  

  if (isLoading) return <Loading />;

  // ✅ Width logic (NO flicker now)
  console.log(isTestPage,isSubscribed,isTrialActive,screenWidth)
  const maxWidth = isTestPage
    ? "100vw"
    : isSubscribed || isTrialActive
    ? screenWidth >= 1200
      ? "calc(100vw - 277px)" // sidebar space
      : "100vw"
    : "100vw";
// console.log(shouldHideSidebar, isSubscribed)
  return (
    <MainWrapper className="mainwrapper">
      {/* Sidebar */}
      {!shouldHideSidebar && (isSubscribed||isTrialActive) && (
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          isMobileSidebarOpen={isMobileSidebarOpen}
          onSidebarClose={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main wrapper */}
      <PageWrapper
        className="page-wrapper"
        style={{
          maxWidth,
          marginLeft: 0,
        }}
      >
        
        <Header
          hide={shouldHideSidebar || (!isSubscribed&&!isTrialActive)}
          toggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

       <Container
  maxWidth={false}
  sx={{
    pt: { xs: 2, md: 3 },
    px: { xs: 1.5, sm: 2.5, lg: 3 },
    pb: 2,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflowX: "hidden",
    boxSizing: "border-box",
  }}
>
  <Box sx={{ minHeight: "calc(100vh - 180px)", minWidth: 0 }}>
    {children}
  </Box>
</Container>
      </PageWrapper>
    </MainWrapper>
  );
}
