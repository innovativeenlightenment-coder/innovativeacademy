"use client";

import { useState, useEffect } from "react";
import { Button } from "@mui/material"; // Updated import
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
type ExamType = "foundation"|"jee" | "neet" | "cet";

interface SlideContent {
  title: string;
  titleHighlight: string;
  description: string;
    // primaryButtonText: string;
    // primaryButtonColor: string;
    // secondaryButtonText: string;
    // secondaryButtonColor: string;
    // secondaryButtonBorder: string;
    // secondaryButtonHover: string;
  benefit: string[];
  imageUrl: string;
  imageAlt: string;
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const examTypes: ExamType[] = ["foundation","jee", "neet", "cet"];
const router = useRouter()
  const slideContent: Record<ExamType, SlideContent> = {
    foundation:{
      title: "Build a Strong Base, With Our ",
      titleHighlight: "Foundation TestPrep",
      description: "Success in competitive exams begins with the right foundation. Our Foundation Test Series is specially designed for students of Classes 8, 9, and 10 to strengthen concepts in Maths, Science, and Reasoning.",
      // primaryButtonText: "Start Foundation Prep",
      // primaryButtonColor: "bg-[#1976D2] hover:bg-blue-700",
      // secondaryButtonText: "Learn More",
      // secondaryButtonColor: "text-[#1976D2]",
      // secondaryButtonBorder: "border-[#1976D2]",
      // secondaryButtonHover: "hover:bg-blue-50",
      benefit: ["Strong conceptual understanding", "Build problem-solving skills", "Prepare for future competitive exams"],
      imageUrl: "./images/Slider/Foundation.jpg",
      imageAlt: "Students studying foundational concepts"
    },
    jee: {
      title: "Crack JEE, With Our ",
      titleHighlight: "JEE TestPrep",
      description: "Our JEE Test Series empowers aspirants with the right practice and strategies to score high. It is designed by experienced faculty, includes concept-based tests, full-length mocks and detailed analysis.",
      // primaryButtonText: "Start JEE Prep",
      // primaryButtonColor: "bg-primary hover:bg-blue-700",
      // secondaryButtonText: "Learn More",
      // secondaryButtonColor: "text-primary",
      // secondaryButtonBorder: "border-primary",
      // secondaryButtonHover: "hover:bg-blue-50",
      benefit: ["5000+ questions", "Extensive question banks", "Detailed performance analysis"],
      imageUrl: "./images/Slider/JEE.jpg",
      imageAlt: "Students preparing for JEE exam"
    },
    neet: {
      title: "Your Journey Becoming a Doctor Starts, With Our ",
      titleHighlight: "NEET TestPrep",
      description: "Your Journey Becoming a Doctor Starts Here! The NEET Test Series is crafted by subject experts to give you real exam experience. With chapter-wise tests, mock exams, and detailed solutions, we prepare you to handle every question with ease.",
      // primaryButtonText: "Start NEET Prep",
      // primaryButtonColor: "bg-[#2E7D32] hover:bg-green-800",
      // secondaryButtonText: "Learn More",
      // secondaryButtonColor: "text-[#2E7D32]",
      // secondaryButtonBorder: "border-[#2E7D32]",
      // secondaryButtonHover: "hover:bg-green-50",
      benefit: ["6000+ questions", "In-depth subject coverage", "Unlimited mock tests"],
      imageUrl: "./images/Slider/NEET.jpg",
      imageAlt: "Medical students preparing for NEET"
    },
    cet: {
      title: "Journey to Engineering & Medical Success, With Our ",
      titleHighlight: "CET TestPrep",
      description: "Prepare smarter with our CET TestPrep Series, crafted by subject experts to match the real exam pattern. With chapter-wise practice tests, full-length mock exams, and step-by-step solutions.",
      // primaryButtonText: "Start CET Prep",
      // primaryButtonColor: "bg-[#F50057] hover:bg-pink-700",
      // secondaryButtonText: "Learn More",
      // secondaryButtonColor: "text-[#F50057]",
      // secondaryButtonBorder: "border-[#F50057]",
      // secondaryButtonHover: "hover:bg-pink-50",
      benefit: ["Targeted practice tests", "Exam-specific strategies", "Comprehensive syllabus coverage"],
      imageUrl: "./images/Slider/CET.jpg",
      imageAlt: "Students studying for CET exam"
    }
  };

  const getCurrentExamType = (): ExamType => {
    return examTypes[currentSlide];
  };

  const getCurrentSlide = (): SlideContent => {
    return slideContent[getCurrentExamType()];
  };

  // Auto rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % examTypes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gray-100 py-8 md:py-12 px-2 lg:px-8" id="home">
      <div className=" mx-auto px-4">
        <div className="flex flex-col-reverse md:flex-row items-center">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 pt-10 md:pt-0 md:pr-8">
            <div className="relative overflow-hidden min-h-[200px] sm:min-h-[120px] md:min-h-[300px] ">
              <AnimatePresence mode="wait">
                <motion.div
                  key={getCurrentExamType()}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 1 }}
                  className="absolute w-full"
                >
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-[#212121] mb-3 font-roboto">
                    {getCurrentSlide().title}{" "}
                    <span className={`text-xl md:text-2xl lg:text-3xl  text-${getCurrentExamType() === "jee" ? "[#aa0606]" : getCurrentExamType() === "neet" ? "[#07b810]" : getCurrentExamType()==="foundation"?"[#ff5e00]": "[#0059d5]"}`}>
                      {getCurrentSlide().titleHighlight}
                    </span>{" "}
                    
                  </h1>
                  <p className="text-md text-gray-700 mb-4">
                    {getCurrentSlide().description}
                  </p>
                  {/* <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      className={`px-6 py-6 ${getCurrentSlide().primaryButtonColor} text-white rounded-lg`}
                    >
                      {getCurrentSlide().primaryButtonText}
                    </Button>
                    <Button
                      variant="outlined" // Added outlined variant for consistency
                      className={`px-6 py-6 border ${getCurrentSlide().secondaryButtonBorder} ${getCurrentSlide().secondaryButtonColor} rounded-lg ${getCurrentSlide().secondaryButtonHover}`}
                    >
                      {getCurrentSlide().secondaryButtonText}
                    </Button>
                  </div> */}
                 <div className="hidden md:block">
                  {
                    getCurrentSlide().benefit.map((benefit, index) => (
                       <div className="mt-2" key={index}>
                    <div className="flex items-center">
                      <div className={`${
                        getCurrentExamType() === "foundation" ? "bg-orange-100 text-[#ff5e00]" :
                         getCurrentExamType() === "jee" ? "bg-100 text-[#aa0606]" : 
                        getCurrentExamType() === "neet" ? "bg-green-100 text-[#07b810]" : 
                        "bg-blue-100 text-[#0059d5]"
                      } p-2 rounded-full`}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="ml-2 text-gray-700">{benefit}</span>
                    </div>
                  </div>
                    ))
                  }
                 </div>
                </motion.div>
              </AnimatePresence>
              
            </div>

            {/* Slider Navigation */}
            <div className="flex justify-center mt-6 space-x-2">
              {examTypes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full bg-gray-300 transition-all duration-300 ${
                    index === currentSlide ? "w-8 bg-primary" : "w-4"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
                
              ))}
              
            </div>
               {/* <Button 
                             variant="contained" 
                             color="success" 
                             sx={{ fontWeight: 600, color: 'green' }}
                             
                                    onClick={() => router.push("/signup")}
                             >
                                    Free Trial 
                                  </Button> */}
          </div>

          {/* Hero Image */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative h-60 md:h-80 w-full">
              <AnimatePresence>
                {examTypes.map((type, index) => (
                  currentSlide === index && (
                    <motion.img
                      key={type}
                      src={slideContent[type].imageUrl}
                      alt={slideContent[type].imageAlt}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-lg"
                      
                    />
                  )
                ))}
              </AnimatePresence>
           
            </div>
            
          </div>
          
        </div>
        
      </div>
    </section>
  );
}