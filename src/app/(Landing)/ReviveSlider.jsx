import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const ReviveSlider = ({ reviews }) => {
 return (
  <section
    id="revive"
   className="bg-gradient-to-br from-[#312E81] via-[#4338CA] to-[#6D28D9] py-16 lg:py-24"
  >
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* Heading */}
      <div className="mb-10 text-center">
      

<div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-300"></div>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Student Revive Stories
        </h2>

        <p className="mx-auto mt-4 max-w-2xl leading-7 text-purple-100">
          Real students. Real improvements. Discover how concept clarity,
          guidance and consistent practice transformed their academic journey.
        </p>
      </div>

      {/* Slider */}
      <div className="pt-3">

      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        spaceBetween={20}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        loop
        className="pb-2"
      >
        {reviews.map((student, index) => (
            
          <SwiperSlide key={index}>
            <div className="flex h-full">

             
<div className="flex  sm:min-h-[280px] md:min-h-[310px] lg:min-h-[340px] w-full flex-col rounded-[28px] border border-purple-200/80 bg-gradient-to-br from-white via-slate-50 to-blue-50 px-6 py-5 shadow-lg shadow-purple-900/10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20">
                {/* Top */}
               <div className="flex min-h-[72px] items-center gap-4">

  <img
    src={student.image}
    alt={student.name}
    className="h-16 w-16 @min-xs:h-28 @min-xs:w-28 sm:h-18 sm:w-18 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white object-cover shadow-lg ring-2 ring-blue-300"
  />

  <div className="flex-1 min-w-0">

    <h3 className="truncate text-lg lg:text-xl font-bold text-slate-900">
      {student.name}
    </h3>

    <p className="mt-1 text-sm lg:text-md font-medium text-blue-700">
      {student.class}
    </p>

  </div>

</div>

                {/* Full Divider */}
             
<hr className="my-5 w-full border-0 h-px bg-gradient-to-r from-indigo-600 via-blue-500 to-violet-500" />

                {/* Review */}
                <div className="mt-auto flex flex-1 items-start gap-3">
                {/* <div className="flex flex-1 items-start gap-3"> */}

              


     <p className="flex-1 text-[15px] lg:text-[18px] leading-7 text-slate-600 italic">{student.review}
</p>


                {/* </div> */}
                </div>

              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
</div>
      {/* Bottom CTA */}
     <div className="mt-10 rounded-[28px] border border-white/20 bg-white/15 px-8 py-7 text-center backdrop-blur-md shadow-xl">

        <h3 className="text-2xl font-bold tracking-tight text-white">
          Every Great Result Starts With One Decision
        </h3>

        <p className="mx-auto mt-3 max-w-2xl leading-7 text-blue-100">
          Join Innovative Academy and become the next student to improve
          your confidence, strengthen your concepts and achieve academic excellence.
        </p>

      </div>

    </div>
  </section>
);
};

export default ReviveSlider;