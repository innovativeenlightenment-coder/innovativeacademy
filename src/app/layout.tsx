"use client";
import { baselightTheme } from "@/utils/theme/DefaultColors";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import "./globals.css";
import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router=useRouter()
//   const isLoad=useUser().isLoaded
//   const isSignIn=useUser().isSignedIn
// const [isLoading,setIsLoading]=useState(true)

axios.defaults.withCredentials = true;

// 2️⃣ Fetch override (only once)
if (typeof window !== "undefined" && !(window as any)._fetchOverridden) {
  const originalFetch = window.fetch;
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    return originalFetch(input, { ...init, credentials: "include" });
  };
  (window as any)._fetchOverridden = true;
}
// useEffect(() => {
//   if (!isLoad) return; // Wait until Clerk has finish loading

//   if (isSignIn) {
//     fetch("/api/Save-User", { method: "POST" });
//     setIsLoading(false);
//   } else {
//     router.push("/");
//   }
// }, [isSignIn, isLoad]);

// if(isLoading){
//   return <Loading />
// }
  return (
          <html lang="en">
      <body >
    {/* <ClerkProvider> */}
      
        <ThemeProvider theme={baselightTheme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {children}
        </ThemeProvider>
    {/* </ClerkProvider> */}
      </body>
    </html>

  );
}
