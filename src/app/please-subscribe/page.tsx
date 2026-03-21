"use client";

import SubscriptionPage from "@/app/(Landing)/components/SubscriptionPage";
import PageContainer from "@/app/(DashboardLayout)/dashboard/components/container/PageContainer";
import { Button, Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
// import { useClerk } from "@clerk/clerk-react";
import { useEffect } from "react";


const PleaseSubscribe = () => {
  const router = useRouter();
// const { signOut } = useClerk();

async function handleLogout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
  });
  const data = await res.json();
  
  if (data.success) {
    // Optionally redirect to login page
    window.location.href = "/please-subscribe";
  }
}

  // useEffect(()=>{
  // handleLogout();
  // },[])
  return (
    <PageContainer title="Please Subscribe" description="This is the subscription page">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          gap: 3,
        }}
        className="bg-gray-50"
      >
         <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/")}
          sx={{ mt: 2, borderRadius: "12px", px: 3, py: 1 }}
        >
          Contact Us | Call - 9335092385 
        </Button>
        {/* Your existing component */}
        <SubscriptionPage />

        {/* ✅ New button */}
      
      </Box>
    </PageContainer>
  );
};

export default PleaseSubscribe;
