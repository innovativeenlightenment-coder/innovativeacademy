// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { TextField, Button, Box, Typography, Alert } from "@mui/material";

// export default function LoginPage() {
//   const router = useRouter();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     const res = await fetch("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form),
//     });
//     const data = await res.json();
//     setMessage(data.message);
//     setLoading(false);
//     // console.log(data.success)
//     if (data.success){
//        router.push("/dashboard");
//     }
//  };

//   return (
//     <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <Box className="bg-white p-8 rounded-2xl shadow-md w-96">
//         <Typography variant="h5" textAlign="center" mb={2}>
//            <p className=" text-2xl text-blue-500">TestPrep </p>
//         </Typography>
//         {message && <Alert severity="info">{message}</Alert>}
//         <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
//           <TextField label="Email" name="email" type="email" onChange={handleChange} required />
//           <TextField label="Password" name="password" type="password" onChange={handleChange} required />
//           <Button type="submit" variant="contained" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </Button>
//         </form>

//         <Button
//           variant="outlined"
//           color="secondary"
//           fullWidth
//           sx={{ mt: 2 }}
//           onClick={() => window.location.href = "/api/auth/google"}
//         >
//           Continue with Google
//         </Button>

//         <Typography variant="body2" textAlign="center" mt={2}>
//           Forgot Password?{" "}
//           <span
//             className="text-blue-600 cursor-pointer"
//             onClick={() => router.push("/reset-password/")}
//           >
//             Reset here
//           </span>
//         </Typography>

//         <Typography variant="body2" textAlign="center" mt={1}>
//           Don’t have an account?{" "}
//           <span 
//             className="text-blue-600 cursor-pointer text-sm"
//             onClick={() => router.push("/signup")}
//           >
//             Sign up
//           </span>
//         </Typography>
//       </Box>
//     </Box>
//   );
// }

// end of shayan Code




"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
const [loginLoading,setLoginLoading]=useState<Boolean>(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage(data.message);
    setLoading(false);
    
    if (data.success) {
      setLoginLoading(true)
      router.push("/dashboard");
    }
    else{
      setMessage(data.message||"Failed To Login")
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white">
      {/* LEFT LOGIN SECTION */}
      <div className="lg:w-[35%] w-full bg-white text-gray-800 flex flex-col justify-center items-center p-8 md:p-10">
        <h1 className="text-3xl font-bold mb-4 text-blue-600">Welcome Back</h1>
        <p className="text-sm mb-6 text-gray-600">
          Sign In to continue your preparation journeys
        </p>

        {message && (
          <div className="bg-blue-100 text-blue-700 p-2 mb-3 rounded-md w-full text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-500"
          >
            {loading ? "Logging in..." : loginLoading ? "Redirecting to Dashboard": "Login"}
          </button>
        </form>

        <button
          onClick={() => (window.location.href = "/api/auth/google")}
          className="border mt-4 py-2 rounded-md w-full max-w-sm hover:bg-gray-100"
        >
          Continue with Google
        </button>

        <p className="text-sm mt-4 text-gray-600">
          Don’t have an account?{" "}
          <Link
            className="text-blue-600 font-medium cursor-pointer p-0.5"
            href={"/signup"}
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* CENTER DEVICE MOCKUP */}
      <div className="lg:w-[25%] w-full flex justify-center items-center py-12 relative bg-[#oklch(26.6% 0.065 152.934)]">
        <div className="bg-gray-800 w-52 h-96 rounded-3xl shadow-2xl flex flex-col justify-center items-center text-center text-white relative">
          <h2 className="text-lg font-semibold mb-2">TestPrep Mobile</h2>
          <p className="text-sm px-4 mb-3 text-gray-400">
            Learn anywhere. Practice smarter. Track progress easily.
          </p>
          <div className="absolute bottom-[-45px] bg-white text-gray-700 rounded-xl shadow-lg p-4 w-64">
            <p className="font-bolder text-blue-600 text-sm mb-2">
              Why Students Love InnovativeTestPrep?
            </p>
            <ul className="text-sm space-y-1">
              <li>📊 AI Rank Predictor</li>
              <li>🎯 1000+ Mock Tests</li>
              <li>🏆 Trusted by 50,000+ Learners</li>
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT INFORMATION DIV */}
      <div className="lg:w-[40%] w-full flex flex-col justify-center px-8 md:px-12 py-10 bg-gradient-to-br from-blue-700 via-blue-700 to-blue-700 rounded-t-[3rem] lg:rounded-l-[3rem]   border-2  border-blue-600 lg:rounded-t-none  shadow-lg">
        <h1 className="text-4xl font-bolder mb-2">
          <span className="text-white">Innovative</span>
          <span className="text-yellow-400">TestPrep</span>
        </h1>
        <h2 className="text-2xl font-bolder mb-4">
          Empower Your Learning Journey
        </h2>
        <p className="text-sm text-blue-100 mb-6">
          Join thousands of students improving their skills with our interactive
          mock tests, expert teachers, and real-time progress tracking.
        </p>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <BookOpen className="text-yellow-300 w-8 h-8 mb-2" />
            <p className="font-semibold text-white text-sm">1000+ Tests</p>
            <p className="text-blue-100 text-xs">Practice Anytime</p>
          </div>

          <div className="flex flex-col items-center">
            <Users className="text-green-300 w-8 h-8 mb-2" />
            <p className="font-semibold text-white text-sm">10K+ Students</p>
            <p className="text-blue-100 text-xs">Active Learners</p>
          </div>

          <div className="flex flex-col items-center">
            <GraduationCap className="text-pink-300 w-8 h-8 mb-2" />
            <p className="font-semibold text-white text-sm">Certified Tutors</p>
            <p className="text-blue-100 text-xs">Expert Guidance</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-blue-200 italic">
          Trusted by schools and parents nationwide.
        </p>
      </div>
    </div>
  );
}

