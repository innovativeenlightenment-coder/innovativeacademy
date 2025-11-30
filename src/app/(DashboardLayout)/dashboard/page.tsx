// "use client";

// import { useEffect, useState } from 'react';
// import { useUser } from '@clerk/nextjs';
// import { redirect, useRouter } from 'next/navigation';
// import PageContainer from '@/app/(DashboardLayout)/dashboard/components/container/PageContainer';
// import { Box } from '@mui/material';
// import Loading from './loading';
// import PricingSection from '@/app/(Landing)/components/PricingSection';



// const Dashboard = async() => {

//   const { isLoaded, isSignedIn, user } = useUser();
//   const router = useRouter();

//   const [role, setRole] = useState<string | null>(null);
//   const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
//   const [loading, setLoading] = useState(true);
 
//   useEffect(() => {
//     if (!isLoaded) return; // Wait until Clerk is ready

//     if (!isSignedIn) {
//       router.push("/login"); // Redirect on client
//       return;
//     }

//     // Fetch role from backend
//     async function fetchUserData() {
//       try {
//         const res = await fetch("/api/Get-Current-User");
//         const data = await res.json();
//         if (res.ok && data.user?.role && data.user?.isSubscribed) {
//           setRole(data.user.role);
//           setIsSubscribed(data.user.isSubscribed)
//           console.log(isSubscribed)
//         }
//       } catch (error) {
//         console.error("Failed to fetch role:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUserData();
//   }, [isLoaded, isSignedIn]);

//   if (!isLoaded || loading) {
//     return <Loading />;
//   }

//   return (
//     <PageContainer title="Dashboard" description="This is Dashboard">
//       <div className="p-8 text-xl">
//         Welcome, <strong>{user?.username}</strong> <br />
//         {
// isSubscribed==true?(        
//         <span className="text-gray-500">Role: {role}</span>
// ):(
//   // <h2>Subscrition Needed</h2>
// <PricingSection />
// )
// }
//       </div>
//     </PageContainer>
//   );
// };

// export default Dashboard;


"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/dashboard/components/container/PageContainer';
import Loading from './loading';
import PricingSection from '@/app/(Landing)/components/PricingSection';
import SubscriptionPage from '@/app/(Landing)/components/SubscriptionPage';

const Dashboard = () => {
  // const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
const [user,setUser]=useState({name:"",username:""})
  const [role, setRole] = useState<string | null>(null);
  
  const [name, setName] = useState<string>("");
  
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   if (!isLoaded) return;

  //   if (!isSignedIn) {
  //     router.push("/login");
  //     return;
  //   }

  //   async function fetchUserData() {
  //     try {
  //      const res = await fetch("/api/Get-Current-User", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ userId: user?.id }),
  //   });
  //       const data = await res.json();
  //       if (data.success && data.user?.role && data.user?.isSubscribed) {
  //        setRole(data.user.role);
  //       //  console.log(data.user)
  //       setName(data.user.name)
  //         setIsSubscribed(data.user.isSubscribed)
  //               }
  //     } catch (error) {
  //       console.error("Failed to fetch role:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // if (isSignedIn) {
  //   // delay fetch until cookies are in place
  //   const timer = setTimeout(fetchUserData, 200);
  //   return () => clearTimeout(timer);
  // } else {
  //   router.push("/login");
  // }
  // }, [isLoaded, isSignedIn, router]);
useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/Get-Current-User", { method: "GET" });
        const data = await res.json();

        if (data?.success && data.user) {
   setUser(data.user)
   setRole(data.user.role)
   setName(data.user.name)
   
          setIsSubscribed(data.user.isSubscribed ?? true);
          
          setIsTrialActive(data.user.isTrialActive ?? true);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  if (loading) return <Loading />;

  return (
    <PageContainer title="Dashboard" description="This is Dashboard">
      <div className="p-8 text-xl">
            
          <p>Welcome, <strong>{name||user.username || "User"}</strong></p>
       
      </div>
    </PageContainer>
  );
};

export default Dashboard;
