// "use client";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   TextField,
//   Button,
//   Box,
//   Typography,
//   Alert,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
//   CircularProgress,
// } from "@mui/material";

// export default function SignupPage() {
//   const router = useRouter();
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "student",
//     username: "",
//     course: "",
//     isIndividual: true,
//     avatar: null as File | null,
//   });

//   const [courses, setCourses] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState("");
//   const [fetching, setFetching] = useState(true);

//   // 🧠 Fetch all available courses from your API
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch(`/api/Get-availage-filter?type=all`);
//         const json = await res.json();
//         if (json.success) {
//           const list = Array.from(new Set((json.data as any[]).map((d) => d.course as string)));
//           setCourses(list);

//         }
//       } catch (err) {
//         console.error("Failed to fetch courses", err);
//       } finally {
//         setFetching(false);
//       }
//     })();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSelect = (e: any) => {
//     setForm({ ...form, course: e.target.value });
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setForm({ ...form, avatar: e.target.files[0] });
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     const body = new FormData();
//     Object.entries(form).forEach(([key, value]) => {
//       if (value !== null) body.append(key, value as any);
//     });

//     const res = await fetch("/api/auth/sign-up", { method: "POST", body });
//     const data = await res.json();
//     setMsg(data.message);
//     setLoading(false);
//     // if (data.success) {
//     // router.push(data.redirect || "/verify?email=" + form.email);
//     // }

//   };

//   return (
//     <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <Box className="bg-white p-6 rounded-2xl shadow-md w-96">
//         <Typography variant="h5" textAlign="center" mb={2}>
//          <p className=" text-2xl text-blue-500">TestPrep </p> <p className=" text-sm text-gray-300">Create an Acoount</p>
//         </Typography>
//         {msg && <Alert severity={msg.includes("success") ? "success" : "info"}>{msg}</Alert>}

//         <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
//           <TextField label="Name" name="name" onChange={handleChange} required />
//           <TextField label="Email" name="email" type="email" onChange={handleChange} required />
//           <TextField label="Password" name="password" type="password" onChange={handleChange} required />
//             <TextField label="Mobile" name="mobile" type="number" onChange={handleChange} required />

//           {/* <TextField label="Username" name="username" onChange={handleChange} required />

//           <TextField select label="Role" name="role" value={form.role} onChange={handleChange}>
//             <MenuItem value="student">Student</MenuItem>
//             <MenuItem value="teacher">Teacher</MenuItem>
//             <MenuItem value="college">College</MenuItem>
//             <MenuItem value="admin">Admin</MenuItem>
//           </TextField> */}

//           {/* Course Selector */}
//           {
//             form.role && (form.role == "student" || form.role == 'teacher') &&

//             <FormControl fullWidth>
//               <InputLabel>Course</InputLabel>
//               <Select
//                 value={form.course}
//                 onChange={handleSelect}
//                 label="Course"
//                 disabled={fetching}
//               >
//                 {fetching && (
//                   <MenuItem value="">
//                     <CircularProgress size={18} sx={{ mr: 1 }} /> Loading...
//                   </MenuItem>
//                 )}
//                 {courses.map((c) => (
//                   <MenuItem key={c} value={c}>
//                     {c}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           }
//           <Button variant="outlined" component="label">
//             Upload Avatar
//             <input type="file" hidden accept="image/*" onChange={handleFile} />
//           </Button>

//           <Button type="submit" variant="contained" disabled={loading}>
//             {loading ? "Creating..." : "Sign Up"}
//           </Button>
//         </form>

//         <Typography variant="body2" textAlign="center" mt={2}>
//           Already have an account?{" "}
//           <span className="text-blue-600  text-sm cursor-pointer" onClick={() => router.push("/login")}>
//             Login
//           </span>
//         </Typography>
//       </Box>
//     </Box>
//   );
// }


// end of shayan code




"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FormState = {
  name: string;
  email: string;
  password: string;
  mobile: string;
  role: string;
  username?: string;
  course: string;
  isIndividual?: boolean;
  avatar: File | null;
};

export default function SignupPage() {
  const router = useRouter();
  const revokeRef = useRef<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "student",
    username: "",
    course: "",
    isIndividual: true,
    avatar: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [courses, setCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [fetching, setFetching] = useState(true);

  // Rotating slogans
  const slogans = ["Join. Learn. Succeed.", "Practice Smart. Score High.", "Master Concepts, Beat Exams."];
  const [sIdx, setSIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSIdx((i) => (i + 1) % slogans.length), 2500);
    return () => clearInterval(t);
  }, []);

  // Fetch courses (keeps endpoint)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/Get-availage-filter?type=all`);
        const json = await res.json();
        if (json && json.success) {
          const list = Array.from(new Set((json.data as any[]).map((d) => (d.course as string) || "General")));
          setCourses(list);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  // clean up object URL on unmount / new file
  useEffect(() => {
    return () => {
      if (revokeRef.current) {
        URL.revokeObjectURL(revokeRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((s) => ({ ...s, avatar: file }));
      if (revokeRef.current) URL.revokeObjectURL(revokeRef.current);
      const url = URL.createObjectURL(file);
      revokeRef.current = url;
      setPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) body.append(key, value as any);
      });

      const res = await fetch("/api/auth/sign-up", { method: "POST", body });
      const data = await res.json();
      setMsg(data?.message || "Server returned no message");
      // keep original redirect logic commented
      if (data.success) router.push("/verify-your-email?email="+form.email);
    } catch (err) {
      console.error(err);
      setMsg("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" min-h-screen flex items-center justify-center bg-sky-500 px-4 py-8">
      <div className=" w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-lg">
        {/* LEFT: FORM (compact inputs, upload preview at top-right) */}
        <div className="bg-white p-6 md:p-10 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h4 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">Create Your Account</h4>
                <p className="text-sm text-slate-500 mt-1">Boost Your Confidence, Boost Your Scores</p>
              </div>

              {/* Upload / Preview (top-right) */}
              <label
                htmlFor="avatar"
                className="relative ml-4 cursor-pointer group"
                title="Upload your avatar"
              >
                <input id="avatar" type="file" accept="image/*" onChange={handleFile} className="sr-only" />
                <div className="w-25 h-25 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition transform group-hover:scale-105">
                  {preview ? (
                    <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v4h16v-4M12 12V4m0 0l4 4m-4-4L8 8" />
                    </svg>
                  )}
                </div>
                <div className="absolute -right-2 -bottom-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
                  Upload Avtar
                </div>
              </label>
            </div>

            {msg && (
              <div className={`mb-4 px-3 py-2 rounded text-center text-sm ${msg.toLowerCase().includes("success") ? "bg-green-50 text-green-800" : "bg-blue-50 text-blue-800"}`}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Full name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email address"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="username"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />

              <input
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                required
                placeholder="Mobile number"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />

              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                disabled={fetching}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                {fetching ? <option>Loading courses...</option> : <><option value="">Select course</option>{courses.map((c) => (<option key={c} value={c}>{c}</option>))}</>}
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition"
              >
                {loading ? "Creating..." : "Sign Up"}
              </button>
            </form>

            <div className="text-center mt-4 text-sm text-slate-600 relative z-50">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 font-medium cursor-pointer">
              <span>Sign In
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: Info / Advertising (Bright & Energetic) */}
        <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8 md:p-10 flex flex-col justify-between text-white">
          {/* floating decorative shapes */}
          {/* <div className="absolute -right-20 -top-16 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-blob"></div> */}
          <div className="absolute -left-12 bottom-8 w-56 h-56 rounded-full bg-white/5 blur-2xl animate-blob animation-delay-2000"></div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bolder mb-4 tracking-tight">
              Innovative<span className="text-yellow-300">TestPrep</span>
            </h2>
            <h1 className="text-xl md:text-3xl font-bolder tracking-tight leading-tight text-blue-200">Achieve Your Dream Rank</h1>
            <p className="mt-3 text-lg md:text-xl font-semibold text-indigo-900">{slogans[sIdx]}</p>

            <p className="mt-4 text-sm md:text-base text-indigo-100 max-w-xl">Smart practice tests • Topic-wise analytics • Personalized study plan • Live doubt support — everything you need to convert your preparation into results.</p>

            {/* badges */}
            <div className="flex gap-2 mt-6">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur">1000+ Mock Tests</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur">AI Rank Predictor</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur">Live Doubt Sessions</span>
            </div>
          </div>

          {/* floating student images */}
          <div className="relative z-10 mt-6 flex items-center gap-4">
            <img src="https://images.pexels.com/photos/6550402/pexels-photo-6550402.jpeg" alt="s1" className="w-30 h-50 rounded-lg object-cover transform transition-all hover:scale-105 animate-float" />
            <img src="https://images.pexels.com/photos/5053732/pexels-photo-5053732.jpeg" alt="s2" className="w-30 h-50 rounded-lg object-cover transform transition-all hover:scale-105 animate-float animation-delay-500" />
            <img src="https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg" alt="s3" className="w-40 h-50 rounded-lg object-cover transform transition-all hover:scale-105 animate-float animation-delay-1000" />
            <div className="ml-auto text-sm text-indigo-100">Trusted <span className="font-semibold text-white">50,000+ Students</span></div>
          </div>
        </div>
      </div>

      {/* Inline CSS for small custom keyframes */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes blob {
          0% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-10px) scale(1.05); opacity: 0.9; }
          100% { transform: translateY(0px) scale(1); opacity: 0.7; }
        }
        .animate-blob { animation: blob 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
}

