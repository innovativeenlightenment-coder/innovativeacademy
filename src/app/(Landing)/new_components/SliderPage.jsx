// // "use client";

// // import React from "react";
// // import { useKeenSlider } from "keen-slider/react";
// // import "keen-slider/keen-slider.min.css"; // important

// // const slides = [
// //   {
// //     id: 1,
// //     title: "Foundation Courses",
// //     desc: "Build strong fundamentals with expert teachers.",
// //     btn: "Start Free Foundation Test",
// //     btnColor: "bg-blue-600 hover:bg-blue-700",
// //     img: "/images/foundation.jpg", // replace with your own image
// //   },
// //   {
// //     id: 2,
// //     title: "JEE Test Series",
// //     desc: "Crack JEE with India’s best mock tests & analysis.",
// //     btn: "Start Free JEE Test",
// //     btnColor: "bg-green-600 hover:bg-green-700",
// //     img: "/images/jee.jpg",
// //   },
// //   {
// //     id: 3,
// //     title: "NEET Test Series",
// //     desc: "Prepare with expert-designed NEET practice papers.",
// //     btn: "Start Free NEET Test",
// //     btnColor: "bg-red-600 hover:bg-red-700",
// //     img: "/images/neet.jpg",
// //   },
// //   {
// //     id: 4,
// //     title: "CET Test Series",
// //     desc: "Boost your CET preparation with real exam patterns.",
// //     btn: "Start Free CET Test",
// //     btnColor: "bg-yellow-500 hover:bg-yellow-600",
// //     img: "/images/cet.jpg",
// //   },
// // ];

// // const Slider = () => {
// //   const [sliderRef] = useKeenSlider({
// //     loop: true,
// //     slides: { perView: 1 },
// //     duration: 1000,
// //     drag: true,
// //     created: (s) => {
// //       setInterval(() => s.next(), 5000); // autoplay every 5s
// //     },
// //   });

// //   return (
// //     <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-gray-100">
// //       {/* === Social Media Videos on Right (hidden on mobile) === */}
// //       <div className="hidden md:flex flex-col gap-4 absolute right-4 top-1/2 -translate-y-1/2 z-20">
// //         {/* YouTube */}
// //         <div className="w-[450px] h-[300px] shadow-lg rounded-xl overflow-hidden">
// //           <iframe
// //             width="100%"
// //             height="100%"
// //             src="https://www.youtube.com/embed/dQw4w9WgXcQ"
// //             title="YouTube video"
// //             frameBorder="0"
// //             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
// //             allowFullScreen
// //           ></iframe>
// //         </div>
// //         {/* Instagram */}
// //         <div className="w-[450px] h-[300px] shadow-lg rounded-xl overflow-hidden">
// //           <iframe
// //             width="100%"
// //             height="100%"
// //             src="https://www.instagram.com/p/C7QXyZGrC6T/embed"
// //             title="Instagram video"
// //             frameBorder="0"
// //             allow="autoplay; encrypted-media"
// //             allowFullScreen
// //           ></iframe>
// //         </div>
// //       </div>

// //       {/* === Slider Content === */}
// //       <div ref={sliderRef} className="keen-slider w-full md:pr-[480px] h-full">
// //         {slides.map((s) => (
// //           <div
// //             key={s.id}
// //             className="keen-slider__slide relative flex items-center justify-center"
// //           >
// //             {/* Background Image */}
// //             <img
// //               src={s.img}
// //               alt={s.title}
// //               className="absolute inset-0 w-full h-full object-cover"
// //             />
// //             {/* Overlay */}
// //             <div className="absolute inset-0 bg-black/40"></div>
// //             {/* Text Content */}
// //             <div className="relative z-10 text-center text-white px-6">
// //               <h1 className="text-3xl md:text-5xl font-bold">{s.title}</h1>
// //               <p className="mt-4 text-lg">{s.desc}</p>
// //               <button
// //                 className={`mt-6 px-6 py-3 rounded-xl shadow-lg transition ${s.btnColor} text-white`}
// //               >
// //                 {s.btn}
// //               </button>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Slider;


// // code 2nd design// important

// // "use client";

// // import React, { useEffect, useRef, useState } from "react";
// // import { useKeenSlider } from "keen-slider/react";
// // import "keen-slider/keen-slider.min.css";

// // // Load YouTube API
// // const loadYouTubeAPI = () => {
// //   return new Promise((resolve) => {
// //     if (window.YT && window.YT.Player) {
// //       resolve(window.YT);
// //     } else {
// //       const tag = document.createElement("script");
// //       tag.src = "https://www.youtube.com/iframe_api";
// //       const firstScriptTag = document.getElementsByTagName("script")[0];
// //       firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
// //       window.onYouTubeIframeAPIReady = () => {
// //         resolve(window.YT);
// //       };
// //     }
// //   });
// // };

// // const slides = [
// //   {
// //     id: 1,
// //     title: "Foundation Courses",
// //     desc: "Build strong fundamentals with expert teachers.",
// //     btn: "Start Free Foundation Test",
// //     btnColor: "bg-blue-600 hover:bg-blue-700",
// //     img: "/images/foundation.jpg",
// //   },
// //   {
// //     id: 2,
// //     title: "JEE Test Series",
// //     desc: "Crack JEE with India’s best mock tests & analysis.",
// //     btn: "Start Free JEE Test",
// //     btnColor: "bg-green-600 hover:bg-green-700",
// //     img: "/images/jee.jpg",
// //   },
// //   {
// //     id: 3,
// //     title: "NEET Test Series",
// //     desc: "Prepare with expert-designed NEET practice papers.",
// //     btn: "Start Free NEET Test",
// //     btnColor: "bg-red-600 hover:bg-red-700",
// //     img: "/images/neet.jpg",
// //   },
// //   {
// //     id: 4,
// //     title: "CET Test Series",
// //     desc: "Boost your CET preparation with real exam patterns.",
// //     btn: "Start Free CET Test",
// //     btnColor: "bg-yellow-500 hover:bg-yellow-600",
// //     img: "/images/cet.jpg",
// //   },
// // ];

// // const Slider = () => {
// //   const sliderContainerRef = useRef(null);
// //   const youtubeRef = useRef(null);

// //   const [isMuted, setIsMuted] = useState(true);
// //   const [ytPlayer, setYtPlayer] = useState(null);

// //   // Keen slider setup
// //   const [sliderRef, slider] = useKeenSlider({
// //     loop: true,
// //     slides: { perView: 1 },
// //     duration: 1000,
// //     drag: true,
// //   });

// //   // Autoplay logic for Keen Slider
// //   useEffect(() => {
// //     if (!slider) return;

// //     let interval = setInterval(() => {
// //       slider.next();
// //     }, 5000);

// //     const container = sliderContainerRef.current;
// //     const pause = () => clearInterval(interval);
// //     const resume = () => {
// //       interval = setInterval(() => slider.next(), 5000);
// //     };

// //     container?.addEventListener("mouseenter", pause);
// //     container?.addEventListener("mouseleave", resume);

// //     return () => {
// //       clearInterval(interval);
// //       container?.removeEventListener("mouseenter", pause);
// //       container?.removeEventListener("mouseleave", resume);
// //     };
// //   }, [slider]);

// //   // YouTube embed with mute/unmute
// //   useEffect(() => {
// //     let player;

// //     loadYouTubeAPI().then((YT) => {
// //       player = new YT.Player(youtubeRef.current, {
// //         videoId: "dQw4w9WgXcQ", // Replace with your own video ID
// //         playerVars: {
// //           autoplay: 1,
// //           controls: 0,
// //           mute: 1,
// //           loop: 1,
// //           playlist: "dQw4w9WgXcQ", // required for loop
// //           modestbranding: 1,
// //           rel: 0,
// //           showinfo: 0,
// //         },
// //         events: {
// //           onReady: (event) => {
// //             event.target.playVideo();
// //             setYtPlayer(event.target);
// //           },
// //         },
// //       });
// //     });

// //     return () => {
// //       if (player && player.destroy) {
// //         player.destroy();
// //       }
// //     };
// //   }, []);

// //   const toggleMute = () => {
// //     if (!ytPlayer) return;
// //     if (isMuted) {
// //       ytPlayer.unMute();
// //     } else {
// //       ytPlayer.mute();
// //     }
// //     setIsMuted(!isMuted);
// //   };

// //   return (
// //     <div
// //       ref={sliderContainerRef}
// //       className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-gray-100"
// //     >
// //       {/* === Social Media Videos (hidden on mobile) === */}
// //       <div className="hidden md:flex flex-col gap-4 absolute right-4 top-1/2 -translate-y-1/2 z-20">
// //         {/* YouTube Embed */}
// //         <div className="relative w-[450px] h-[300px] shadow-lg rounded-xl overflow-hidden">
// //           <div ref={youtubeRef} className="w-full h-full" />
// //           <button
// //             onClick={toggleMute}
// //             className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded hover:bg-black"
// //           >
// //             {isMuted ? "Unmute" : "Mute"}
// //           </button>
// //         </div>

// //         {/* Instagram Embed (no autoplay/sound control) */}
// //         <div className="w-[450px] h-[300px] shadow-lg rounded-xl overflow-hidden">
// //           <iframe
// //             width="100%"
// //             height="100%"
// //             src="https://www.instagram.com/p/C7QXyZGrC6T/embed"
// //             title="Instagram video"
// //             frameBorder="0"
// //             allow="autoplay; encrypted-media"
// //             allowFullScreen
// //           ></iframe>
// //         </div>
// //       </div>

// //       {/* === Keen Slider === */}
// //       <div ref={sliderRef} className="keen-slider w-full md:pr-[480px] h-full">
// //         {slides.map((s) => (
// //           <div
// //             key={s.id}
// //             className="keen-slider__slide relative flex items-center justify-center"
// //           >
// //             <img
// //               src={s.img}
// //               alt={s.title}
// //               className="absolute inset-0 w-full h-full object-cover"
// //             />
// //             <div className="absolute inset-0 bg-black/40" />
// //             <div className="relative z-10 text-center text-white px-6">
// //               <h1 className="text-3xl md:text-5xl font-bold">{s.title}</h1>
// //               <p className="mt-4 text-lg">{s.desc}</p>
// //               <button
// //                 className={`mt-6 px-6 py-3 rounded-xl shadow-lg transition ${s.btnColor} text-white`}
// //               >
// //                 {s.btn}
// //               </button>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Slider;

// // code 3rd design 

// // "use client";

// // import React, { useEffect, useRef, useState } from "react";
// // import { useKeenSlider } from "keen-slider/react";
// // import "keen-slider/keen-slider.min.css";

// // // Dynamically load YouTube API
// // const loadYouTubeAPI = () =>
// //   new Promise((resolve) => {
// //     if (window.YT?.Player) return resolve(window.YT);
// //     const tag = document.createElement("script");
// //     tag.src = "https://www.youtube.com/iframe_api";
// //     document.body.appendChild(tag);
// //     window.onYouTubeIframeAPIReady = () => resolve(window.YT);
// //   });

// // const slides = [
// //   {
// //     id: 1,
// //     title: "Foundation Courses",
// //     desc: "Build strong fundamentals with expert teachers.",
// //     btn: "Start Free Foundation Test",
// //     btnColor: "bg-blue-600 hover:bg-blue-700",
// //     img: "/images/Slider/Fondation.jpg",
// //   },
// //   {
// //     id: 2,
// //     title: "JEE Test Series",
// //     desc: "Crack JEE with India’s best mock tests & analysis.",
// //     btn: "Start Free JEE Test",
// //     btnColor: "bg-green-600 hover:bg-green-700",
// //     img: "/images/Slider/jee.jpg",
// //   },
// //   {
// //     id: 3,
// //     title: "NEET Test Series",
// //     desc: "Prepare with expert-designed NEET practice papers.",
// //     btn: "Start Free NEET Test",
// //     btnColor: "bg-red-600 hover:bg-red-700",
// //     img: "/images/Slider/neet.jpg",
// //   },
// //   {
// //     id: 4,
// //     title: "CET Test Series",
// //     desc: "Boost your CET preparation with real exam patterns.",
// //     btn: "Start Free CET Test",
// //     btnColor: "bg-yellow-500 hover:bg-yellow-600",
// //     img: "/images/Slider/cet.jpg",
// //   },
// // ];

// // const Slider = () => {
// //   const youtubeRef = useRef(null);
// //   const [isMuted, setMuted] = useState(true);
// //   const [ytPlayer, setYtPlayer] = useState(null);
// //   const intervalRef = useRef(null);
// //   const [isClient, setIsClient] = useState(false);

// //   // Mount check (for Next.js SSR)
// //   useEffect(() => {
// //     setIsClient(true);
// //   }, []);

// //   // Keen Slider setup
// //   const [sliderRef, slider] = useKeenSlider({
// //     loop: true,
// //     slides: { perView: 1 },
// //     duration: 1000,
// //     drag: true,
// //   });

// //   // Autoplay after slider is ready
// //   useEffect(() => {
// //     if (!slider) return;

// //     intervalRef.current = setInterval(() => {
// //       slider.next();
// //     }, 5000);

// //     return () => clearInterval(intervalRef.current);
// //   }, [slider]);

// //   // YouTube API setup
// //   useEffect(() => {
// //     let player;
// //     loadYouTubeAPI().then((YT) => {
// //       player = new YT.Player(youtubeRef.current, {
// //         videoId: "dQw4w9WgXcQ",
// //         playerVars: {
// //           autoplay: 1,
// //           controls: 0,
// //           mute: 1,
// //           loop: 1,
// //           playlist: "dQw4w9WgXcQ",
// //           modestbranding: 1,
// //           rel: 0,
// //         },
// //         events: {
// //           onReady: (e) => {
// //             setYtPlayer(e.target);
// //             e.target.playVideo();
// //           },
// //         },
// //       });
// //     });

// //     return () => {
// //       if (player?.destroy) player.destroy();
// //     };
// //   }, []);

// //   const toggleMute = () => {
// //     if (!ytPlayer) return;
// //     isMuted ? ytPlayer.unMute() : ytPlayer.mute();
// //     setMuted(!isMuted);
// //   };

// //   return (
// //     <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-gray-100">
// //       {/* === Social Media Videos (Right side on desktop) === */}
// //       <div className="hidden md:flex flex-col gap-4 absolute right-4 top-1/2 -translate-y-1/2 z-20">
// //         {/* YouTube Video */}
// //         <div className="relative w-[300px] h-[150px] shadow-lg rounded-xl overflow-hidden">
// //           <div ref={youtubeRef} className="w-full h-full" />
// //           <button
// //             onClick={toggleMute}
// //             className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black"
// //           >
// //             {isMuted ? "Unmute" : "Mute"}
// //           </button>
// //         </div>

// //         {/* Instagram Video */}
// //         <div className="w-[300px] h-[150px] shadow-lg rounded-xl overflow-hidden">
// //           <iframe
// //             width="100%"
// //             height="100%"
// //             src="https://www.instagram.com/p/C7QXyZGrC6T/embed"
// //             title="Instagram video"
// //             frameBorder="0"
// //             allow="autoplay; encrypted-media"
// //             allowFullScreen
// //           ></iframe>
// //         </div>
// //       </div>

// //       {/* === Slider === */}
// //       {isClient && (
// //         <div ref={sliderRef} className="keen-slider w-full md:pr-[320px] h-full">
// //           {slides.map((s) => (
// //             <div
// //               key={s.id}
// //               className="keen-slider__slide relative flex items-center justify-center"
// //             >
// //               <img
// //                 src={s.img}
// //                 alt={s.title}
// //                 className="absolute inset-0 w-full h-full object-cover"
// //               />
// //               <div className="absolute inset-0 bg-black/40" />
// //               <div className="relative z-10 text-center text-white px-6">
// //                 <h1 className="text-3xl md:text-5xl font-bold">{s.title}</h1>
// //                 <p className="mt-4 text-lg">{s.desc}</p>
// //                 <button
// //                   className={`mt-6 px-6 py-3 rounded-xl shadow-lg transition ${s.btnColor} text-white`}
// //                 >
// //                   {s.btn}
// //                 </button>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default Slider;


// // "use client";

// // import React, { useEffect, useRef, useState } from "react";
// // import { Swiper, SwiperSlide } from "swiper/react";
// // import "swiper/css";

// // const slides = [
// //   {
// //     id: 1,
// //     title: "Foundation Courses",
// //     desc: "Build strong fundamentals with expert teachers.",
// //     btn: "Start Free Foundation Test",
// //     btnColor: "bg-blue-600 hover:bg-blue-700",
// //     img: "/images/Slider/Fondation.jpg",
// //   },
// //   {
// //     id: 2,
// //     title: "JEE Test Series",
// //     desc: "Crack JEE with India’s best mock tests & analysis.",
// //     btn: "Start Free JEE Test",
// //     btnColor: "bg-green-600 hover:bg-green-700",
// //     img: "/images/Slider/jee.jpg",
// //   },
// //   {
// //     id: 3,
// //     title: "NEET Test Series",
// //     desc: "Prepare with expert-designed NEET practice papers.",
// //     btn: "Start Free NEET Test",
// //     btnColor: "bg-red-600 hover:bg-red-700",
// //     img: "/images/Slider/neet.jpg",
// //   },
// //   {
// //     id: 4,
// //     title: "CET Test Series",
// //     desc: "Boost your CET preparation with real exam patterns.",
// //     btn: "Start Free CET Test",
// //     btnColor: "bg-yellow-500 hover:bg-yellow-600",
// //     img: "/images/Slider/cet.jpg",
// //   },
// // ];

// // const Slider = () => {
// //   const swiperRef = useRef(null);
// //   const [currentIndex, setCurrentIndex] = useState(0);

// //   // Manual autoplay effect every 5s
// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       if (swiperRef.current && swiperRef.current.swiper) {
// //         const swiper = swiperRef.current.swiper;
// //         const nextIndex = (swiper.realIndex + 1) % slides.length;
// //         swiper.slideTo(nextIndex);
// //         setCurrentIndex(nextIndex);
// //       }
// //     }, 5000);

// //     return () => clearInterval(interval);
// //   }, []);

// //   return (
// //     <div className="relative w-full bg-gray-100">
// //       <div className="h-[500px] relative overflow-hidden">
// //         <Swiper
// //           ref={swiperRef}
// //           slidesPerView={1}
// //           loop={true}
// //           onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
// //           className="absolute inset-0 z-10"
// //         >
// //           {slides.map((s) => (
// //             <SwiperSlide key={s.id}>
// //               <div className="relative w-full h-full">
// //                 <img
// //                   src={s.img}
// //                   alt={s.title}
// //                   className="absolute inset-0 w-full h-full object-cover"
// //                 />
// //                 <div className="absolute inset-0 bg-black/40" />
// //                 <div className="relative z-10 text-center text-white px-6 flex flex-col items-center justify-center h-full">
// //                   <h1 className="text-3xl md:text-5xl font-bold">{s.title}</h1>
// //                   <p className="mt-4 text-lg">{s.desc}</p>
// //                   <button
// //                     className={`mt-6 px-6 py-3 rounded-xl shadow-lg transition ${s.btnColor} text-white`}
// //                   >
// //                     {s.btn}
// //                   </button>
// //                 </div>
// //               </div>
// //             </SwiperSlide>
// //           ))}
// //         </Swiper>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Slider;

// // "use client";
// // import "swiper/css";
// // import "swiper/css/navigation";
// // import "swiper/css/pagination";
// // import React, { useEffect, useRef, useState } from "react";
// // import { Swiper, SwiperSlide } from "swiper/react";
// // import "swiper/css";

// // const slides = [
// //   {
// //     id: 1,
// //     title: "Foundation Courses",
// //     desc: "Build strong fundamentals with expert teachers.",
// //     btn: "Start Free Foundation Test",
// //     btnColor: "bg-blue-600 hover:bg-blue-700",
// //     img: "/images/Slider/Fondation.jpg",
// //   },
// //   {
// //     id: 2,
// //     title: "JEE Test Series",
// //     desc: "Crack JEE with India’s best mock tests & analysis.",
// //     btn: "Start Free JEE Test",
// //     btnColor: "bg-green-600 hover:bg-green-700",
// //     img: "/images/Slider/jee.jpg",
// //   },
// //   {
// //     id: 3,
// //     title: "NEET Test Series",
// //     desc: "Prepare with expert-designed NEET practice papers.",
// //     btn: "Start Free NEET Test",
// //     btnColor: "bg-red-600 hover:bg-red-700",
// //     img: "/images/Slider/neet.jpg",
// //   },
// //   {
// //     id: 4,
// //     title: "CET Test Series",
// //     desc: "Boost your CET preparation with real exam patterns.",
// //     btn: "Start Free CET Test",
// //     btnColor: "bg-yellow-500 hover:bg-yellow-600",
// //     img: "/images/Slider/cet.jpg",
// //   },
// // ];

// // const Slider = () => {
// //   const swiperRef = useRef(null);
// //   const [loadedImages, setLoadedImages] = useState(0);
// //   const [sliderReady, setSliderReady] = useState(false);

// //   // Wait until all images are loaded
// //   const handleImageLoad = () => {
// //     setLoadedImages((prev) => {
// //       const total = prev + 1;
// //       if (total === slides.length) setSliderReady(true);
// //       return total;
// //     });
// //   };

// //   // Autoplay logic
// //   useEffect(() => {
// //     if (!swiperRef.current || !sliderReady) return;

// //     const interval = setInterval(() => {
// //       const swiper = swiperRef.current.swiper;
// //       swiper.slideNext();
// //     }, 5000);

// //     return () => clearInterval(interval);
// //   }, [sliderReady]);

// //   return (
// //     <div className="relative flex w-full min-h-[500px] bg-gray-100 overflow-hidden">
// //       {/* === Main Slider === */}
// //       <div className="flex-1 h-[500px] md:pr-[320px]">
// //         {sliderReady ? (
// //           <Swiper
// //             ref={swiperRef}
// //             slidesPerView={1}
// //             loop={true}
// //             className="h-full"
// //           >
// //             {slides.map((s) => (
// //               <SwiperSlide key={s.id}>
// //                 <div className="relative w-full h-full">
// //                   <img
// //                     src={s.img}
// //                     alt={s.title}
// //                     onLoad={handleImageLoad}
// //                     onError={(e) =>
// //                       (e.currentTarget.src = "/images/Slider/Fondation.jpg")
// //                     }
// //                     className="absolute inset-0 w-full h-full object-cover"
// //                   />
// //                   <div className="absolute inset-0 bg-black/40" />
// //                   <div className="relative z-10 text-center text-white px-6 flex flex-col items-center justify-center h-full">
// //                     <h1 className="text-3xl md:text-5xl font-bold">
// //                       {s.title}
// //                     </h1>
// //                     <p className="mt-4 text-lg max-w-xl">{s.desc}</p>
// //                     <button
// //                       className={`mt-6 px-6 py-3 rounded-xl shadow-lg transition ${s.btnColor} text-white`}
// //                     >
// //                       {s.btn}
// //                     </button>
// //                   </div>
// //                 </div>
// //               </SwiperSlide>
// //             ))}
// //           </Swiper>
// //         ) : (
// //           // Spinner while loading
// //           <div className="flex items-center justify-center h-full w-full">
// //             <svg
// //               className="animate-spin h-12 w-12 text-blue-600"
// //               xmlns="http://www.w3.org/2000/svg"
// //               fill="none"
// //               viewBox="0 0 24 24"
// //             >
// //               <circle
// //                 className="opacity-25"
// //                 cx="12"
// //                 cy="12"
// //                 r="10"
// //                 stroke="currentColor"
// //                 strokeWidth="4"
// //               />
// //               <path
// //                 className="opacity-75"
// //                 fill="currentColor"
// //                 d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
// //               />
// //             </svg>
// //           </div>
// //         )}
// //       </div>

// //       {/* === Sticky Social Media Videos === */}
// //       <div className="hidden md:flex flex-col gap-4 w-[320px] h-[500px] sticky top-20 right-0 z-30 pr-4">
// //         {/* YouTube Video */}
// //         <div className="w-[300px] h-[150px] rounded-xl overflow-hidden shadow-lg">
// //           <iframe
// //             src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0&modestbranding=1"
// //             title="YouTube video"
// //             frameBorder="0"
// //             allow="autoplay; encrypted-media"
// //             allowFullScreen
// //             className="w-full h-full border-none"
// //           />
// //         </div>

// //         {/* Instagram Embed */}
// //         <div className="w-[300px] h-[150px] rounded-xl overflow-hidden shadow-lg">
// //           <iframe
// //             src="https://www.instagram.com/p/C7QXyZGrC6T/embed"
// //             title="Instagram video"
// //             frameBorder="0"
// //             allow="autoplay; encrypted-media"
// //             allowFullScreen
// //             className="w-full h-full border-none"
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Slider;

// // simple sider code
// // "use client";

// // import React, { useRef, useEffect } from "react";
// // import { Swiper, SwiperSlide } from "swiper/react";
// // import "swiper/css";

// // const SliderPage = () => {
// //   const swiperRef = useRef();

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       if (swiperRef.current?.swiper) {
// //         swiperRef.current.swiper.slideNext();
// //       }
// //     }, 3000);
// //     return () => clearInterval(interval);
// //   }, []);

// //   return (
// //     <div className="w-full h-64 bg-gray-200">
// //      <SwiperSlide>
// //   <div className="relative w-full h-full">
// //     <img
// //       src="/images/Slider/Fondation.jpg"
// //       alt="Foundation"
// //       className="absolute inset-0 w-full h-full object-cover"
// //     />
// //     <div className="absolute inset-0 bg-black/40" />
// //     <div className="relative z-10 text-center text-white px-6 flex flex-col items-center justify-center h-full">
// //       <h1 className="text-3xl md:text-5xl font-bold">Foundation Courses</h1>
// //       <p className="mt-4 text-lg">Build strong fundamentals with expert teachers.</p>
// //       <button className="mt-6 px-6 py-3 rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white">
// //         Start Free Foundation Test
// //       </button>
// //     </div>
// //   </div>
// // </SwiperSlide>


// // <SwiperSlide>
// //   <div className="relative w-full h-full">
// //     <img
// //       src="/images/Slider/CET.jpg"
// //       alt="Foundation"
// //       className="absolute inset-0 w-full h-full object-cover"
// //     />
// //     <div className="absolute inset-0 bg-black/40" />
// //     <div className="relative z-10 text-center text-white px-6 flex flex-col items-center justify-center h-full">
// //       <h1 className="text-3xl md:text-5xl font-bold">Foundation Courses</h1>
// //       <p className="mt-4 text-lg">Build strong fundamentals with expert teachers.</p>
// //       <button className="mt-6 px-6 py-3 rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white">
// //         Start Free Foundation Test
// //       </button>
// //     </div>
// //   </div>
// // </SwiperSlide>

// //     </div>
// //   );
// // };

// // export default SliderPage;

// // working simple slider
// // "use client";

// // import React from "react";
// // import { Swiper, SwiperSlide } from "swiper/react";
// // import { Autoplay, Pagination, Navigation } from "swiper/modules";

// // import "swiper/css";
// // import "swiper/css/pagination";
// // import "swiper/css/navigation";

// // const slides = [
// //   {
// //     id: 1,
// //     title: "Explore the Mountains",
// //     desc: "Adventure awaits in every corner of the world.",
// //     btnText: "Learn More",
// //     btnLink: "/mountains",
// //     img: "/images/mountains.jpg",
// //   },
// //   {
// //     id: 2,
// //     title: "Relax at the Beach",
// //     desc: "Feel the sun and sand at the most beautiful beaches.",
// //     btnText: "Book Now",
// //     btnLink: "/beach",
// //     img: "/images/beach.jpg",
// //   },
// //   {
// //     id: 3,
// //     title: "City Lights",
// //     desc: "Discover vibrant city life and culture.",
// //     btnText: "Explore Cities",
// //     btnLink: "/cities",
// //     img: "/images/city.jpg",
// //   },
// // ];

// // export default function SliderPage() {
// //   return (
// //    <div className="w-full py-10">
// //   <Swiper
// //     modules={[Autoplay, Pagination, Navigation]}
// //     autoplay={{ delay: 4000, disableOnInteraction: false }}
// //     pagination={{ clickable: true }}
// //     navigation={true}
// //     loop={true}
// //     className="rounded-none overflow-hidden shadow-lg"
// //   >
// //     {slides.map(({ id, title, desc, btnText, btnLink, img }) => (
// //       <SwiperSlide key={id}>
// //         <div className="relative w-full h-[400px] md:h-[500px]">
// //           <img
// //             src={img}
// //             alt={title}
// //             className="w-full h-full object-cover"
// //             draggable={false}
// //           />
// //           <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6">
// //             <h2 className="text-white text-3xl md:text-5xl font-bold mb-4">
// //               {title}
// //             </h2>
// //             <p className="text-white max-w-xl mb-6">{desc}</p>
// //             <a
// //               href={btnLink}
// //               className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
// //             >
// //               {btnText}
// //             </a>
// //           </div>
// //         </div>
// //       </SwiperSlide>
// //     ))}
// //   </Swiper>
// // </div>
// //   );
// // }



// "use client";

// import React from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Pagination, Navigation } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/navigation";

// const slides = [
//   {
//     id: 1,
//     title: "Crack JEE with Confidence!",
//     desc: <span>Our JEE Test Series empowers aspirants with the right practice and strategies to score high.It is designed by IITians and experienced faculty, includes concept-based tests, full-length mocks and time-management training. Every test helps you adapt JEE’s pattern ensuring you’re exam-ready and reduce your get rid of pressure.</span>
//     ,
//     btnText: "Enroll in our JEE Test Series today and unlock your path to IITs and NITs! and More",
//     // btnLink: "/mountains",
//     img: "/images/slider/JEE.jpg",
//   },
//   {
//     id: 2,
//     title: "Score High in CET with Expert Guidance!",
//     desc: <span>Success in competitive exams begins with the right foundation. Our Foundation Test Series is specially designed for students of Classes 8, 9, and 10 to strengthen concepts in Maths, Science, and Reasoning. With regular practice tests, detailed analysis, and expert guidance, we ensure that every student gains confidence and clarity.</span>
//     ,
//     btnText: "Join our CET Test Series and secure your seat in top colleges!",
//     // btnLink: "/beach",
//     img: "/images/slider/CET.jpg",
//   },
//   {
//     id: 3,
//     title: "Build a Strong Base, Secure Your Future!",
//     desc: <span>Success in competitive exams begins with the right foundation. Our Foundation Test Series is specially designed for students of Classes 8, 9, and 10 to strengthen concepts in Maths, Science, and Reasoning. With regular practice tests, detailed analysis, and expert guidance, we ensure that every student gains confidence and clarity.</span>
//     ,
//     btnText: "Join our Foundation Test Series today for a brighter tomorrow!",
//     btnLink: "/cities",
//     img: "/images/slider/Fondation.jpg",
//   },
//   {
//     id: 4,
//     title: "Your Journey Becoming a Doctor Starts Here!",
//     desc: <span>Your Journey Becoming a Doctor Starts Here!
// The NEET Test Series is crafted by subject experts to give you real exam experience. With chapter-wise tests, mock exams, and detailed solutions, we prepare you to handle every question with ease. Our analysis reports help identify strengths and weaknesses, ensuring continuous improvement.</span>
//     ,
//     btnText: "Join our NEET Test Series and take your first step towards your dream medical career!",
//     btnLink: "/cities",
//     img: "/images/slider/NEET.jpg",
//   },
// ];

// export default function SliderPage() {


//   return (
//     <div className="w-full py-0 relative ">
//       {/* Swiper Slider */}
//       <Swiper
//         modules={[Autoplay, Pagination, Navigation]}
//         autoplay={{ delay: 4000, disableOnInteraction: false }}
//         pagination={{ clickable: true }}
//         navigation={true}
//         loop={true}
//         className="overflow-hidden"
//       >
//         {slides.map(({ id, title, desc, btnText, btnLink, img }) => (
//           <SwiperSlide key={id}>
//             <div className="relative w-[full] h-[300px] md:h-[500px] opacity-85">
//               <img
//                 src={img}
//                 alt={title}
//                 className="w-full h-full object-cover"
//                 draggable={false}
//               />
//               <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6">
//                 <h2 className="text-white opacity-80 text-2xl md:text-4xl font-bold mb-4">
//                   {title}
//                 </h2>
//                 <p className="text-white opacity-70 max-w-xl mb-6">{desc}</p>
//                 <a
//                   href={btnLink}
//                   className="inline-block outline-white-100 opacity-90 bg-gray-500 hover:bg-blue-700 hover:opacity-100 text-white font-semibold px-6 py-3 rounded-lg transition"
//                 >
//                   {btnText}
//                 </a>
//               </div>
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>

//       {/* Sticky YouTube Video */}
//       <div className="fixed right-1 top-1/2 -translate-y-1/2 z-50">
//         <iframe
//           width="175"
//           height="100"
//           src="https://www.youtube.com/embed/dQw4w9WgXcQ"
//           title="YouTube video"
//           frameBorder="0"
//           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//           allowFullScreen
//           className="rounded-lg shadow-lg"
//         ></iframe>
//       </div>
//        <div className="fixed right-1 top-3/9 -translate-y-1/2 z-50 gap-1.5">
//         <iframe
//           width="175"
//           height="100"
//           src="https://www.youtube.com/embed/dQw4w9WgXcQ"
//           title="YouTube video"
//           frameBorder="0"
//           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//           allowFullScreen
//           className="rounded-lg shadow-lg"
//         ></iframe>
//       </div>
//     </div>
//   );
// }




"use client";

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Volume2, VolumeX } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    title: "Crack JEE with Confidence!",
    desc: <span>Our JEE Test Series empowers aspirants with the right practice and strategies to score high.It is designed by IITians and experienced faculty, includes concept-based tests, full-length mocks and time-management training.</span>// Every test helps you adapt JEE’s pattern ensuring you’re exam-ready and reduce your get rid of pressure.</span>
    ,
    btnText: "Enroll in our JEE Test Series today and unlock your path to IITs and NITs! and More",
    // btnLink: "/mountains",
    img: "/images/Slider/JEE.jpg",
  },
  {
    id: 2,
    title: "Score High in CET with Expert Guidance!",
    desc: <span>Success in competitive exams begins with the right foundation. Our Foundation Test Series is specially designed for students of Classes 8, 9, and 10 to strengthen concepts in Maths, Science, and Reasoning.</span>// With regular practice tests, detailed analysis, and expert guidance, we ensure that every student gains confidence and clarity.</span>
    ,
    btnText: "Join our CET Test Series and secure your seat in top colleges!",
    // btnLink: "/beach",
    img: "/images/Slider/CET.jpg",
  },
  {
    id: 3,
    title: "Build a Strong Base, Secure Your Future!",
    desc: <span>Success in competitive exams begins with the right foundation. Our Foundation Test Series is specially designed for students of Classes 8, 9, and 10 to strengthen concepts in Maths, Science, and Reasoning.</span> //With regular practice tests, detailed analysis, and expert guidance, we ensure that every student gains confidence and clarity.</span>
    ,
    btnText: "Join our Foundation Test Series today for a brighter tomorrow!",
    btnLink: "/cities",
    img: "/images/Slider/Foundation.jpeg",
  },
  {
    id: 4,
    title: "Your Journey Becoming a Doctor Starts Here!",
    desc: <span>Your Journey Becoming a Doctor Starts Here!
      The NEET Test Series is crafted by subject experts to give you real exam experience. With chapter-wise tests, mock exams, and detailed solutions, we prepare you to handle every question with ease.</span>// Our analysis reports help identify strengths and weaknesses, ensuring continuous improvement.</span>
    ,
    btnText: "Join our NEET Test Series and take your first step towards your dream medical career!",
    btnLink: "/cities",
    img: "/images/Slider/NEET.jpg",
  },
];

export default function SliderPage() {
  // const videoIds = ["s97oMJe5pYY"];
  const videoIds = ["s97oMJe5pYY", "8mxDiefPrcc"];
  const playerRefs = useRef({});
  const [isMuted, setIsMuted] = useState({});

  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    } else {
      initPlayers();
    }
    window.onYouTubeIframeAPIReady = initPlayers;
  }, []);

  const initPlayers = () => {
    videoIds.forEach((videoId) => {
      if (playerRefs.current[videoId]) return;

      playerRefs.current[videoId] = new window.YT.Player(`yt-${videoId}`, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          loop: 1,
          playlist: videoId,
          mute: 1,
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
            setIsMuted((prev) => ({ ...prev, [videoId]: true }));
          },
        },
      });
    });
  };

  const toggleMute = (videoId) => {
    const player = playerRefs.current[videoId];
    if (!player) return;

    if (isMuted[videoId]) {
      player.unMute();
    } else {
      player.mute();
    }
    setIsMuted((prev) => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  return (
    <div className="w-full relative">
      {/* Swiper Slider */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        loop
        speed={1200}         // smooth transition
        effect="fade"        // ✅ super smooth crossfade
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}    // one slide at a time
        spaceBetween={0}     // no gap between slides
        className="overflow-hidden"
      >
        {slides.map(({ id, title, desc, btnText, btnLink, img }) => (
          <SwiperSlide key={id}>
            <div className="relative w-full h-[300px] md:h-[500px]">
              <img
                src={img}
                alt={title}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-6 ">
                <h2 className="text-white opacity-80 text-2xl md:text-4xl font-bold mb-4 sm:text-sm mt-12">
                  {title}
                </h2>
                <p className="text-white max-w-xl mb-6">{desc}</p>
                <a
                  href={btnLink || "#"}
                  className="inline-block bg-gray-400 opacity-80 text-blue-900 hover:bg-blue-300 text-blue-200 font-semibold px-6 py-2 rounded-lg transition"
                >
                  {btnText}
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Sticky YouTube Videos */}
      <div className="fixed right-2 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
        {videoIds.map((videoId) => (
          <div
            key={videoId}
            className="relative rounded-lg shadow-lg overflow-hidden"
            style={{ width: "170px", height: "100px" }}
          >
            <div id={`yt-${videoId}`} className="w-full h-full" />
            <button
              onClick={() => toggleMute(videoId)}
              className="absolute top-1 right-1 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition"
              aria-label="Toggle sound"
            >
              {isMuted[videoId] ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
