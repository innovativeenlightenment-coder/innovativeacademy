'use client'

// import { useUser } from "@clerk/nextjs";
import { Suspense, useEffect, useState } from "react";
import ContactSection from "./components/ContactSection";
import ExamsSection from "./components/ExamsSection";
import FeaturesSection from "./components/FeaturesSection";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import PricingSection from "./components/PricingSection";
import TestimonialsSection from "./components/TestimonialsSection";
import { Box } from "@mui/material";
import Loading from "../loading";
import { redirect, useRouter } from "next/navigation";
// import "./landing.css";
import SubscriptionPage from "./components/SubscriptionPage"
import WhyUs from "./components/WhyUs"
import { VolumeX, Volume2 } from "lucide-react";
import axios from "axios";

// Simple skeleton loader for video
function VideoSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-200 animate-pulse">
      <span className="text-gray-500">Loading video...</span>
    </div>
  );
}

export default function Home() {
  const router = useRouter()
  // const [isLoading, setIsLoading] = useState(true)
// const [user,setUser]=useState({username:"",_id:""})


//   useEffect(() => {
//     async function fetchUser() {
//       try {
//         const res = await fetch("/api/auth/Get-Current-User", { method: "GET" });
//         const data = await res.json();

//         if (data?.success && data.user) {
   
//           setUser(data.user);
//         } else {
//           router.push("/login");
//         }
//       } catch (err) {
//         console.error("Auth check failed:", err);
//         router.push("/login");
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchUser();
//   }, [router]);

  // useEffect(() => {
  //   if (!isLoaded) return; // Wait until Clerk has finished loading

  //   setIsLoading(false);

  //   if (isSignedIn) {
  //     fetch("/api/Save-User/", { method: "POST" });
  //     // router.push("/dashboard")

  //   }
  // }, [isSignedIn, isLoaded]);

//   useEffect(() => {
  
//   setIsLoading(false);

//   if (user?.username) {
//     fetch("/api/Save-User/", { method: "POST",body:JSON.stringify({ userId: user?._id }), });
   
//   }
// }, [user]);
// useEffect(()=>{
//   if (user?.username) {
//   console.log(user?.username)
//   }
//    async function fetchData() {
//         const res = await fetch(`/api/Fetch-Users`);
//       const data=await res.json()
//         console.log(data)
//       }
//       setTimeout(()=>{

//         fetchData()
//       },2000)
// },[])
  // if (isLoading) {
  //   return <Loading />
  // }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      <Box
        className={`hidden sm:block w-full text-center p-1 font-medium transition-colors duration-500 ${"bg-slate-900 text-yellow-800 tracking-wide"
          }`}
      >
        <div className="  text-center w-full justify-center gap-4 items-center hidden sm:flex">
          <h1 className="bg-slate-900 p-2 pl-1 font-bold text-xl text-yellow-500 text-shadow-pink-50 tracking-wider ">🎉 Special Offer </h1>  <h2 className=" p-1 font-bold text-sn text-amber-100">Practice with Purpose. Perform with Confidence — Enroll Today!</h2> <h2 className="border-3 border-amber-50 bg-green-600 p-2 font-bold rounded-2xl text-white"> 20% off </h2><h1 className="ml-28 text-xl text-white font-bold"> | Speak to us | 9335092385</h1>

        </div>

      </Box>

      <Navbar />
      <Box component="main">

        <HeroSection />
        <WhyUs />
        <FeaturesSection />
        {/* <ExamsSection /> */}
        <SubscriptionPage />
        {/* <PricingSection /> */}
        <TestimonialsSection />
        <ContactSection />
        <div

          className=" rounded-lg fixed shadow-lg hidden sm:block overflow-hidden left-5 bottom-4"
          style={{ width: "230px", height: "130px" }}
        >
          <Suspense fallback={<VideoSkeleton />}>
<iframe
  src="https://www.youtube.com/embed/s97oMJe5pYY?autoplay=1&mute=1&loop=1&playlist=s97oMJe5pYY"
  title="Shayan Ali’s Impressive Science Exhibition Project | Class 7 Student Presentation"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerPolicy="strict-origin-when-cross-origin"
  allowFullScreen
  className="w-full h-full"
/>


            {/* allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"  */}
            {/* <iframe width="640" height="360" src="https://www.youtube.com/embed/s97oMJe5pYY" title="&quot;Shayan Ali’s Impressive Science Exhibition Project | Class 7 Student Presentation&quot;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}
            {/* <track
        src="/path/to/captions.vtt"
        kind="subtitles"
        srcLang="en"
        label="English"
      /> */}
            {/* Your browser does not support the video tag.
    </video> */}
          </Suspense>
        </div>
      </Box>
      <Footer />
    </Box>
  );
}
