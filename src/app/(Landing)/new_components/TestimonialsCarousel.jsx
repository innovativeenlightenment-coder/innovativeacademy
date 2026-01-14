// import React from 'react'

// const TestimonialsCarousel = () => {
//   return (
//     <div>TestimonialsCarousel</div>
//   )
// }

// export default TestimonialsCarousel

"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Star } from "lucide-react";

import "swiper/css";

const testimonials = [
  {
    id: 1,
    name: "Shayanali Mujawar",
    role: "8th, Alphonsa School, Miraj",
    img: "/images/shayan.jpg",
    review:
      "I had a wonderful learning experience with Innovative Academy! The question bank provided is high quality, and the online platform is user-friendly. ",
  },
  {
    id: 2,
    name: "Shayanali Mujawar",
    role: "8th, Alphonsa School, Miraj",
    img: "/images/shayan.jpg",
    review:
      "I had a wonderful learning experience with Innovative Academy! The question bank provided is high quality, and the online platform is user-friendly. ",
  },
  {
    id: 3,
    nname: "Shayanali Mujawar",
    role: "8th, Alphonsa School, Miraj",
    img: "/images/shayan.jpg",
    review:
      "I had a wonderful learning experience with Innovative Academy! The question bank provided is high quality, and the online platform is user-friendly. ",
  },
];

export default function TestimonialSlider() {
  return (
    <div className="w-[full] py-8 bg-gray-50">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 ">
        What Our Students Say
      </h2>
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        slidesPerView="auto"
        spaceBetween={5}
        className="px-6"
      >
        {testimonials.map((t) => (
          <SwiperSlide key={t.id} className="w-[300px] h-[030]">
            <div className="relative bg-white shadow-lg rounded-lg overflow-hidden  py-0 h-[215px] flex flex-col justify-center items-center text-center ">
              
              {/* Wave Top */}
              <div className="absolute top-0 left-0 w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="10 0 1440 280"
                  className="w-full h-10 text-blue-500"
                  preserveAspectRatio="none"
                >
                  <path
                    fill="currentColor"
                    d="M0,64L48,90.7C96,117,192,171,288,181.3C384,192,480,160,576,170.7C672,181,768,235,864,224C960,213,1056,139,1152,133.3C1248,128,1344,192,1392,224L1440,256V0H0Z"
                  ></path>
                </svg>
              </div>

              {/* Content */}
              <img
                src={t.img}
                alt={t.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md mt-10"
              />
              <h3 className="mt-2 text-lg font-bold text-blue-600">{t.name}</h3>
              <p className="text-gray-500 text-xs">{t.role}</p>

              {/* Stars */}
              <div className="flex justify-center text-yellow-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

              {/* Review */}
              <p className="text-gray-700 w-[600] h-[500] text-sm px-3 mt-1 line-clamp-1">
                {t.review}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
