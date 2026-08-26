// "use client";

// import { FormEvent, useEffect, useState } from "react";

// interface LearningVideo {
//   _id: string;
//   type: "daily" | "oneShot";
//   date?: string;
//   subject: string;
//   chapter?: string;
//   title: string;
//   description?: string;
//   duration?: number;
//   youtubeVideoId: string;
//   isPublished: boolean;
// }

// const subjects = [
//   "Physics",
//   "Chemistry",
//   "Mathematics",
//   "Biology",
// ];

// export default function ManageLearningVideosPage() {
//   const [videos, setVideos] = useState<LearningVideo[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [creating, setCreating] = useState(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   const [type, setType] =
//     useState<"daily" | "oneShot">("daily");

//   const [form, setForm] = useState({
//     date: "",
//     subject: "Physics",
//     chapter: "",
//     title: "",
//     description: "",
//     duration: "",
//     youtubeVideoId: "",
//     isPublished: true,
//   });

//   // -----------------------------
//   // FETCH ALL VIDEOS
//   // -----------------------------

//   async function fetchVideos() {
//     try {
//       setLoading(true);

//       const response = await fetch(
//         "/api/learning-videos?includeUnpublished=true"
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch videos");
//       }

//       const data = await response.json();

//       setVideos(data);
//     } catch (error) {
//       console.error(error);
//       alert("Failed to load learning videos.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchVideos();
//   }, []);

//   // -----------------------------
//   // FORM UPDATE
//   // -----------------------------

//   function updateForm(
//     field: string,
//     value: string | boolean
//   ) {
//     setForm((previous) => ({
//       ...previous,
//       [field]: value,
//     }));
//   }

//   // -----------------------------
//   // RESET FORM
//   // -----------------------------

//   function resetForm() {
//     setForm({
//       date: "",
//       subject: "Physics",
//       chapter: "",
//       title: "",
//       description: "",
//       duration: "",
//       youtubeVideoId: "",
//       isPublished: true,
//     });
//   }

//   // -----------------------------
//   // CREATE VIDEO
//   // -----------------------------

//   async function handleSubmit(
//     event: FormEvent<HTMLFormElement>
//   ) {
//     event.preventDefault();

//     try {
//       setCreating(true);

//       const response = await fetch(
//         "/api/learning-videos",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             type,

//             date:
//               type === "daily"
//                 ? form.date
//                 : undefined,

//             subject: form.subject,

//             chapter:
//               type === "oneShot"
//                 ? form.chapter
//                 : undefined,

//             title: form.title,

//             description:
//               form.description || undefined,

//             duration:
//               form.duration
//                 ? Number(form.duration)
//                 : undefined,

//             youtubeVideoId:
//               form.youtubeVideoId,

//             isPublished: form.isPublished,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         alert(
//           data.message ||
//             "Failed to create video."
//         );

//         return;
//       }

//       resetForm();

//       await fetchVideos();

//       alert("Video added successfully!");
//     } catch (error) {
//       console.error(error);

//       alert(
//         "Something went wrong while adding the video."
//       );
//     } finally {
//       setCreating(false);
//     }
//   }

//   // -----------------------------
//   // DELETE VIDEO
//   // -----------------------------

//   async function handleDelete(id: string) {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this video?"
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       setDeletingId(id);

//       const response = await fetch(
//         `/api/learning-videos/${id}`,
//         {
//           method: "DELETE",
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         alert(
//           data.message ||
//             "Failed to delete video."
//         );

//         return;
//       }

//       setVideos((previous) =>
//         previous.filter(
//           (video) => video._id !== id
//         )
//       );
//     } catch (error) {
//       console.error(error);

//       alert(
//         "Something went wrong while deleting."
//       );
//     } finally {
//       setDeletingId(null);
//     }
//   }

//   return (
//     <main className="mx-auto max-w-7xl px-4 py-8">

//       {/* =================================
//           HEADER
//       ================================= */}

//       <div className="mb-8">

//         <p className="text-sm font-semibold text-blue-600">
//           ADMIN
//         </p>

//         <h1 className="mt-1 text-3xl font-bold text-gray-900">
//           Manage Learning Videos
//         </h1>

//         <p className="mt-2 text-gray-500">
//           Add and manage daily lectures and
//           one-shots.
//         </p>

//       </div>

//       <div className="grid gap-8 lg:grid-cols-[380px_1fr]">

//         {/* =================================
//             ADD VIDEO
//         ================================= */}

//         <div className="h-fit rounded-2xl border bg-white p-6">

//           <h2 className="text-xl font-bold">
//             Add Video
//           </h2>

//           {/* VIDEO TYPE */}

//           <div className="mt-5 grid grid-cols-2 gap-2">

//             <button
//               type="button"
//               onClick={() => setType("daily")}
//               className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
//                 type === "daily"
//                   ? "bg-black text-white"
//                   : "bg-white text-gray-700 hover:bg-gray-50"
//               }`}
//             >
//               Daily Lecture
//             </button>

//             <button
//               type="button"
//               onClick={() => setType("oneShot")}
//               className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
//                 type === "oneShot"
//                   ? "bg-black text-white"
//                   : "bg-white text-gray-700 hover:bg-gray-50"
//               }`}
//             >
//               One-Shot
//             </button>

//           </div>

//           {/* FORM */}

//           <form
//             onSubmit={handleSubmit}
//             className="mt-6 space-y-4"
//           >

//             {/* DATE */}

//             {type === "daily" && (
//               <div>

//                 <label className="mb-1 block text-sm font-medium">
//                   Lecture Date
//                 </label>

//                 <input
//                   type="date"
//                   value={form.date}
//                   onChange={(e) =>
//                     updateForm(
//                       "date",
//                       e.target.value
//                     )
//                   }
//                   required
//                   className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
//                 />

//               </div>
//             )}

//             {/* SUBJECT */}

//             <div>

//               <label className="mb-1 block text-sm font-medium">
//                 Subject
//               </label>

//               <select
//                 value={form.subject}
//                 onChange={(e) =>
//                   updateForm(
//                     "subject",
//                     e.target.value
//                   )
//                 }
//                 className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
//               >

//                 {subjects.map((subject) => (
//                   <option
//                     key={subject}
//                     value={subject}
//                   >
//                     {subject}
//                   </option>
//                 ))}

//               </select>

//             </div>

//             {/* CHAPTER */}

//             {type === "oneShot" && (
//               <div>

//                 <label className="mb-1 block text-sm font-medium">
//                   Chapter
//                 </label>

//                 <input
//                   type="text"
//                   value={form.chapter}
//                   onChange={(e) =>
//                     updateForm(
//                       "chapter",
//                       e.target.value
//                     )
//                   }
//                   placeholder="e.g. Motion"
//                   required
//                   className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
//                 />

//               </div>
//             )}

//             {/* TITLE */}

//             <div>

//               <label className="mb-1 block text-sm font-medium">
//                 Title
//               </label>

//               <input
//                 type="text"
//                 value={form.title}
//                 onChange={(e) =>
//                   updateForm(
//                     "title",
//                     e.target.value
//                   )
//                 }
//                 placeholder={
//                   type === "daily"
//                     ? "Motion - Introduction"
//                     : "Motion - Complete One Shot"
//                 }
//                 required
//                 className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
//               />

//             </div>

//             {/* DESCRIPTION */}

//             <div>

//               <label className="mb-1 block text-sm font-medium">
//                 Description
//               </label>

//               <textarea
//                 value={form.description}
//                 onChange={(e) =>
//                   updateForm(
//                     "description",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Short description..."
//                 rows={3}
//                 className="w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-black"
//               />

//             </div>

//             {/* DURATION */}

//             <div>

//               <label className="mb-1 block text-sm font-medium">
//                 Duration (minutes)
//               </label>

//               <input
//                 type="number"
//                 min="1"
//                 value={form.duration}
//                 onChange={(e) =>
//                   updateForm(
//                     "duration",
//                     e.target.value
//                   )
//                 }
//                 placeholder="45"
//                 className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
//               />

//             </div>

//             {/* YOUTUBE VIDEO ID */}

//             <div>

//               <label className="mb-1 block text-sm font-medium">
//                 YouTube Video ID
//               </label>

//               <input
//                 type="text"
//                 value={form.youtubeVideoId}
//                 onChange={(e) =>
//                   updateForm(
//                     "youtubeVideoId",
//                     e.target.value
//                   )
//                 }
//                 placeholder="dQw4w9WgXcQ"
//                 required
//                 className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
//               />

//               <p className="mt-1 text-xs text-gray-500">
//                 Example:
//                 youtube.com/watch?v=
//                 <span className="font-medium">
//                   dQw4w9WgXcQ
//                 </span>
//               </p>

//             </div>

//             {/* PUBLISHED */}

//             <label className="flex cursor-pointer items-center gap-2 text-sm">

//               <input
//                 type="checkbox"
//                 checked={form.isPublished}
//                 onChange={(e) =>
//                   updateForm(
//                     "isPublished",
//                     e.target.checked
//                   )
//                 }
//                 className="h-4 w-4"
//               />

//               <span>
//                 Publish immediately
//               </span>

//             </label>

//             {/* SUBMIT */}

//             <button
//               type="submit"
//               disabled={creating}
//               className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {creating
//                 ? "Adding..."
//                 : "Add Video"}
//             </button>

//           </form>

//         </div>

//         {/* =================================
//             VIDEO LIST
//         ================================= */}

//         <div>

//           {/* LIST HEADER */}

//           <div className="mb-4 flex items-center justify-between">

//             <div>

//               <h2 className="text-xl font-bold">
//                 All Videos
//               </h2>

//               <p className="mt-1 text-sm text-gray-500">
//                 Published and unpublished videos
//               </p>

//             </div>

//             <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
//               {videos.length}
//             </span>

//           </div>

//           {/* LOADING */}

//           {loading && (
//             <div className="rounded-2xl border bg-white p-12 text-center text-gray-500">
//               Loading videos...
//             </div>
//           )}

//           {/* EMPTY */}

//           {!loading && videos.length === 0 && (
//             <div className="rounded-2xl border bg-gray-50 p-12 text-center">

//               <div className="text-4xl">
//                 🎥
//               </div>

//               <h3 className="mt-4 font-semibold">
//                 No learning videos
//               </h3>

//               <p className="mt-1 text-sm text-gray-500">
//                 Add your first lecture or one-shot
//                 using the form.
//               </p>

//             </div>
//           )}

//           {/* VIDEOS */}

//           {!loading && videos.length > 0 && (
//             <div className="space-y-3">

//               {videos.map((video) => (

//                 <div
//                   key={video._id}
//                   className="rounded-2xl border bg-white p-4 transition hover:shadow-sm"
//                 >

//                   <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

//                     {/* INFO */}

//                     <div className="min-w-0">

//                       {/* BADGES */}

//                       <div className="flex flex-wrap items-center gap-2">

//                         <span
//                           className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
//                             video.type === "daily"
//                               ? "bg-blue-50 text-blue-600"
//                               : "bg-purple-50 text-purple-600"
//                           }`}
//                         >
//                           {video.type === "daily"
//                             ? "Daily Lecture"
//                             : "One-Shot"}
//                         </span>

//                         <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
//                           {video.subject}
//                         </span>

//                         {video.isPublished ? (
//                           <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
//                             Published
//                           </span>
//                         ) : (
//                           <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
//                             Draft
//                           </span>
//                         )}

//                       </div>

//                       {/* TITLE */}

//                       <h3 className="mt-2 truncate font-semibold text-gray-900">
//                         {video.title}
//                       </h3>

//                       {/* EXTRA INFO */}

//                       <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">

//                         {video.type === "daily" &&
//                           video.date && (
//                             <span>
//                               {new Date(
//                                 video.date
//                               ).toLocaleDateString(
//                                 "en-IN",
//                                 {
//                                   day: "numeric",
//                                   month: "short",
//                                   year: "numeric",
//                                 }
//                               )}
//                             </span>
//                           )}

//                         {video.type === "oneShot" &&
//                           video.chapter && (
//                             <span>
//                               {video.chapter}
//                             </span>
//                           )}

//                         {video.duration && (
//                           <span>
//                             {video.duration} min
//                           </span>
//                         )}

//                       </div>

//                     </div>

//                     {/* DELETE */}

//                     <button
//                       type="button"
//                       onClick={() =>
//                         handleDelete(video._id)
//                       }
//                       disabled={
//                         deletingId === video._id
//                       }
//                       className="shrink-0 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
//                     >
//                       {deletingId === video._id
//                         ? "Deleting..."
//                         : "Delete"}
//                     </button>

//                   </div>

//                 </div>

//               ))}

//             </div>
//           )}

//         </div>

//       </div>

//     </main>
//   );
// }

"use client";

import { FormEvent, useEffect, useState } from "react";

interface LearningVideo {
  _id: string;
  type: "daily" | "oneShot";
  date?: string;
  subject: string;
  chapter?: string;
  title: string;
  description?: string;
  duration?: number;
  youtubeVideoId: string;
  isPublished: boolean;
}

const subjects = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
];

export default function ManageLearningVideosPage() {
  const [videos, setVideos] = useState<LearningVideo[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [type, setType] =
    useState<"daily" | "oneShot">("daily");

  const [form, setForm] = useState({
    date: "",
    subject: "Physics",
    chapter: "",
    title: "",
    description: "",
    duration: "",
    youtubeVideoId: "",
    isPublished: true,
  });

  // -----------------------------
  // FETCH ALL VIDEOS
  // -----------------------------

  async function fetchVideos() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/learning-videos?includeUnpublished=true"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();

      setVideos(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load learning videos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  // -----------------------------
  // FORM UPDATE
  // -----------------------------

  function updateForm(
    field: string,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  // -----------------------------
  // RESET FORM
  // -----------------------------

  function resetForm() {
    setForm({
      date: "",
      subject: "Physics",
      chapter: "",
      title: "",
      description: "",
      duration: "",
      youtubeVideoId: "",
      isPublished: true,
    });
  }

  // -----------------------------
  // CREATE VIDEO
  // -----------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setCreating(true);

      const response = await fetch(
        "/api/learning-videos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,

            date:
              type === "daily"
                ? form.date
                : undefined,

            subject: form.subject,

            chapter:
              type === "oneShot"
                ? form.chapter
                : undefined,

            title: form.title,

            description:
              form.description || undefined,

            duration:
              form.duration
                ? Number(form.duration)
                : undefined,

            youtubeVideoId:
              form.youtubeVideoId,

            isPublished: form.isPublished,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to create video."
        );

        return;
      }

      resetForm();

      await fetchVideos();

      alert("Video added successfully!");
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while adding the video."
      );
    } finally {
      setCreating(false);
    }
  }

  // -----------------------------
  // DELETE VIDEO
  // -----------------------------

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch(
        `/api/learning-videos/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to delete video."
        );

        return;
      }

      setVideos((previous) =>
        previous.filter(
          (video) => video._id !== id
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while deleting."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1450px]">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-7">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-xs font-bold tracking-wide text-blue-700">
                  CONTENT MANAGEMENT
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Manage Learning Videos
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Add, organize and manage daily lectures
                and chapter-wise one-shot videos for
                your students.
              </p>
            </div>

            {/* TOTAL */}

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M15 10L19.5 7.5V16.5L15 14M4 6.5H14C15.1 6.5 16 7.4 16 8.5V15.5C16 16.6 15.1 17.5 14 17.5H4C2.9 17.5 2 16.6 2 15.5V8.5C2 7.4 2.9 6.5 4 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Videos
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {videos.length}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">

          {/* =================================================
              ADD VIDEO CARD
          ================================================= */}

          <section className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

            {/* CARD HEADER */}

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 5V19M5 12H19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Add Learning Video
                  </h2>

                  <p className="text-xs text-slate-500">
                    Create new course content
                  </p>
                </div>

              </div>
            </div>

            <div className="p-6">

              {/* VIDEO TYPE */}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Video Type
                </label>

                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">

                  <button
                    type="button"
                    onClick={() => setType("daily")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                      type === "daily"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="17"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M16 2V6M8 2V6M3 10H21"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>

                    Daily
                  </button>

                  <button
                    type="button"
                    onClick={() => setType("oneShot")}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                      type === "oneShot"
                        ? "bg-white text-purple-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 3L14.8 8.7L21 9.6L16.5 14L17.6 20.2L12 17.3L6.4 20.2L7.5 14L3 9.6L9.2 8.7L12 3Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>

                    One-Shot
                  </button>

                </div>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >

                {/* DATE */}

                {type === "daily" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Lecture Date
                    </label>

                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        updateForm(
                          "date",
                          e.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                )}

                {/* SUBJECT */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Subject
                  </label>

                  <select
                    value={form.subject}
                    onChange={(e) =>
                      updateForm(
                        "subject",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >
                    {subjects.map((subject) => (
                      <option
                        key={subject}
                        value={subject}
                      >
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CHAPTER */}

                {type === "oneShot" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Chapter
                    </label>

                    <input
                      type="text"
                      value={form.chapter}
                      onChange={(e) =>
                        updateForm(
                          "chapter",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Motion"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                )}

                {/* TITLE */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Video Title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      updateForm(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder={
                      type === "daily"
                        ? "Motion - Introduction"
                        : "Motion - Complete One Shot"
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Description
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      updateForm(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Briefly describe what students will learn..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* DURATION */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Duration
                    <span className="ml-1 font-normal text-slate-400">
                      (minutes)
                    </span>
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={(e) =>
                      updateForm(
                        "duration",
                        e.target.value
                      )
                    }
                    placeholder="45"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* YOUTUBE */}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    YouTube Video ID / URL
                  </label>

                  <div className="relative">

                    <input
                      type="text"
                      value={form.youtubeVideoId}
                      onChange={(e) =>
                        updateForm(
                          "youtubeVideoId",
                          e.target.value
                        )
                      }
                      placeholder="L2NAh3CIdig"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                  </div>

                  <p className="mt-1.5 text-xs leading-5 text-slate-400">
                    Example: https://www.youtube.com/watch?v=
                    <span className="font-semibold text-slate-500">
                      L2NAh3CIdig
                    </span>
                  </p>
                </div>

                {/* PUBLISHED */}

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Publish immediately
                    </p>

                    <p className="text-xs text-slate-400">
                      Students can access this video
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) =>
                      updateForm(
                        "isPublished",
                        e.target.checked
                      )
                    }
                    className="h-5 w-5 accent-blue-600"
                  />

                </label>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={creating}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {creating ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          opacity=".25"
                        />
                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                      </svg>

                      Adding Video...
                    </>
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>

                      Add Video
                    </>
                  )}
                </button>

              </form>
            </div>
          </section>

          {/* =================================================
              VIDEO LIST
          ================================================= */}

          <section className="min-w-0">

            {/* LIST HEADER */}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  All Learning Videos
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your published and draft content
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
                  {videos.length}{" "}
                  {videos.length === 1
                    ? "Video"
                    : "Videos"}
                </span>
              </div>

            </div>

            {/* LOADING */}

            {loading && (
              <div className="space-y-3">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex gap-4">
                      <div className="h-16 w-24 rounded-xl bg-slate-100" />

                      <div className="flex-1">
                        <div className="h-4 w-24 rounded bg-slate-100" />
                        <div className="mt-3 h-5 w-3/4 rounded bg-slate-100" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}

            {/* EMPTY */}

            {!loading && videos.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M15 10L19.5 7.5V16.5L15 14M4 6.5H14C15.1 6.5 16 7.4 16 8.5V15.5C16 16.6 15.1 17.5 14 17.5H4C2.9 17.5 2 16.6 2 15.5V8.5C2 7.4 2.9 6.5 4 6.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </div>

                <h3 className="mt-5 font-bold text-slate-900">
                  No learning videos yet
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                  Add your first daily lecture or
                  chapter-wise one-shot using the form.
                </p>

              </div>
            )}

            {/* VIDEOS */}

            {!loading && videos.length > 0 && (
              <div className="space-y-3">

                {videos.map((video) => (

                  <div
                    key={video._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                      {/* VIDEO ICON */}

                      <div
                        className={`hidden h-[68px] w-[105px] shrink-0 items-center justify-center rounded-xl sm:flex ${
                          video.type === "daily"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-purple-50 text-purple-600"
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">

                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5.14V19.14C8 19.91 8.83 20.39 9.5 20L20.5 13C21.12 12.61 21.12 11.69 20.5 11.3L9.5 4.3C8.83 3.89 8 4.37 8 5.14Z" />
                          </svg>

                        </div>
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">

                        {/* BADGES */}

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                              video.type === "daily"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {video.type === "daily"
                              ? "DAILY LECTURE"
                              : "ONE-SHOT"}
                          </span>

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {video.subject}
                          </span>

                          {video.isPublished ? (
                            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              PUBLISHED
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              DRAFT
                            </span>
                          )}

                        </div>

                        {/* TITLE */}

                        <h3 className="mt-2 truncate text-base font-bold text-slate-900">
                          {video.title}
                        </h3>

                        {/* DESCRIPTION */}

                        {video.description && (
                          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                            {video.description}
                          </p>
                        )}

                        {/* META */}

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-400">

                          {video.type === "daily" &&
                            video.date && (
                              <span className="flex items-center gap-1.5">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <rect
                                    x="3"
                                    y="4"
                                    width="18"
                                    height="17"
                                    rx="2"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  />
                                  <path
                                    d="M16 2V6M8 2V6M3 10H21"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                  />
                                </svg>

                                {new Date(
                                  video.date
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            )}

                          {video.type === "oneShot" &&
                            video.chapter && (
                              <span className="flex items-center gap-1.5">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M4 5.5C4 4.67 4.67 4 5.5 4H20V18H5.5C4.67 18 4 18.67 4 19.5M4 5.5V19.5M4 5.5C4 6.33 4.67 7 5.5 7H20"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>

                                {video.chapter}
                              </span>
                            )}

                          {video.duration && (
                            <span className="flex items-center gap-1.5">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                />
                                <path
                                  d="M12 7V12L15 14"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>

                              {video.duration} min
                            </span>
                          )}

                        </div>

                      </div>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(video._id)
                        }
                        disabled={
                          deletingId === video._id
                        }
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {deletingId === video._id ? (
                          <>
                            <svg
                              className="h-4 w-4 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="3"
                                opacity=".25"
                              />
                              <path
                                d="M21 12a9 9 0 0 0-9-9"
                                stroke="currentColor"
                                strokeWidth="3"
                              />
                            </svg>

                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M4 7H20M10 11V17M14 11V17M6 7L7 20H17L18 7M9 7V4H15V7"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>

                            Delete
                          </>
                        )}

                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>
        </div>
      </div>
    </main>
  );
}