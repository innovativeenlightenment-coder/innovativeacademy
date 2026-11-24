"use client"
import { useState, useEffect } from 'react';
import { Menu, X, Check, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Play, Star } from 'lucide-react';

import "./new/global_landing.css"
import "./landing.css"
import TeamSliderSection from "./TeamSliderSection";
import UnderGuidance from "./UnderGuidance";
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/getCurrentUser';
import EnquiryModal from './components/EnquiryModal';
import ReviveSlider from "./ReviveSlider";
import AppShowcase from './AppShowcase';

const managementMembers: any[] = [
  {
    name: "Vikram Desai Sir",
    designation: "Administrator",
    qualification: "Daily Operations",
    image: "/images/team/vikram.png",
  },
  
  {
    name: "Abdulkareem Sir",
    designation: "Administrator",
    qualification: "Managing Director",
    image: "/images/team/adbulkareem.jpg",
  },
  //  {
  //   name: "Akhtar Sir",
  //   designation: "Administrator",
  //   qualification: "Parent and Student Relations",
  //   image: "/images/team/akhtar.jpg",
  // },
];

const facultyMembers: any[] = [
  {
    name: "Hafiza Mahabari Ma’am",
    designation: "Academic Head",
    qualification: "30+ years board exam experience",
    image: "/images/team/hafiza.jpg",
  },
  {
    name: "Shahista Ma’am",
    designation: "Mathematics Faculty",
    qualification: "M.Sc. Mathematics",
    image: "/images/team/shahista.jpg",
  },
  {
    name: "Arsheen Ma’am",
    designation: "Science Faculty",
    qualification: "M.Sc. Science",
    image: "/images/team/arsheen.jpg",
  },
  {
    name: "Rahul Jadhav Sir",
    designation: "Science Faculty",
    qualification: "M.Sc. Science",
    image: "/images/team/rahul.png",
  },
  {
    name: "Simmy Dileep Ma’am",
    designation: "English Faculty",
    qualification: "Experienced English Traner",
    image: "/images/team/simmy.jpg",
  },
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

const [isOpen, setIsOpen] = useState(false);



  const router = useRouter()
  const slides = [
    {
      headline: "Build Strong Concepts.",
      subline: "Become a Board Topper.",
      desc: "Foundation for Olympiads, Competitive Exams & Academic Excellence",
      img: "/slides/1.jpg"
    },
    {
      headline: "Master Every Subject.",
      subline: "Learn from Expert Teachers.",
      desc: "Each subject taught by specialized experts dedicated to your success",
      img: "/slides/2.webp"
    },
    {
      headline: "Prepare for Everything.",
      subline: "CBSE • State Board • Olympiad • Competitive Exams.",
      desc: "Comprehensive preparation covering all major exams in one platform",
      img: "/slides/3.jpg"
    },
    {
      headline: "Double Your Confidence.",
      subline: "Live Classes + Offline Sessions + App Learning.",
      desc: "Multi-format learning with personalized doubt resolution",
      img: "/slides/4.jpg"
    }
  ];

// =============================
// Revive Data
// =============================

const reviveReviews = [
  {
    image: "/images/students/student1.jpg",
    name: "Priya Sharma",
    class: "Class 10",
    review:
      "I was struggling with Mathematics and Science. The teachers completely changed the way I study. Instead of memorizing answers, I finally understood the concepts. Within a few months my confidence improved, my marks increased from 45%-92%.",
  },
  {
    image: "/images/students/student2.jpg",
    name: "Arjun Patel",
    class: "Olympiad Student",
    review:
      "The doubt solving sessions, regular tests and personalized guidance helped me prepare much better than I expected. The teachers always motivated me to think differently and never gave up on me.",
  },
  {
    image: "/images/students/student3.jpg",
    name: "Diya Verma",
    class: "Board Topper",
    review:
      "I improved from 58%-96% in only six months. Every chapter was taught with complete clarity and regular practice made all the difference. The academy not only improved my marks but also my confidence to face every examination.",
  },
  {
    image: "/images/students/student4.jpg",
    name: "Rahul Khan",
    class: "Class 9",
    review:
      "Before joining, I always feared exams. Today I solve questions confidently because I understand the concepts instead of memorizing them. The teachers encouraged me every day and helped me become more disciplined.",
  },
  {
    image: "/images/students/student5.jpg",
    name: "Ayesha Shaikh",
    class: "Class 8",
    review:
      "The learning environment is completely different from any coaching I have attended before. Interactive classes, practice tests and continuous guidance helped me improve both my grades and my confidence.",
  },
];


const mentors = [
  {
    image: "/images/team/mohammadali.jpg",

    name: "Prof. Mahamadali Mujawar",

    qualification: "M.Sc. Physics, B.Ed.",

    designation: "Ex-HOD, Department of Physics",

    organization: "Dr. Bapuji Salunkhe Jr. College, Miraj",

    experience: "30+ Years of Teaching Experience",

    story:
      "With more than 30 years of rich academic experience, Prof. Mahamadali Mujawar has made valuable contributions to the field of education. As the former Head of the Department of Physics at Dr. Bapuji Salunkhe Jr. College, Miraj, he played a key role in strengthening academic excellence. He also introduced and guided special CET coaching initiatives, helping countless students build a strong conceptual foundation in Physics and competitive examinations."
  },

  {
    image: "/images/team/maner.jpg",

    name: "Dr. Shahjahan Maner",

    qualification: "Academic Leader & Educationist",

    designation: "Ex-Principal",

    organization: "Shri Swami Vivekanand Shikshan Sanstha, Kolhapur",

    experience: "30+ Years of Academic Experience",

    story:
      "Dr. Shahjahan Maner has devoted more than three decades to academic leadership and quality education. As the former Principal of Shri Swami Vivekanand Shikshan Sanstha, Kolhapur, and a former faculty member at Dr. Bapuji Salunkhe Jr. College, Miraj, he has contributed significantly to student development, institutional growth, and academic excellence. His experience and guidance continue to inspire our vision of delivering meaningful education."
  },
];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };


  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getCurrentUser();

        if (data?.success) {
          const isPWA = window.matchMedia('(display-mode: standalone)').matches;
          // const token = localStorage.getItem("token");

          if (isPWA) {
            // if (token) {
            router.replace("/dashboard");
            // } else {
            //   router.replace("/login");
            // }
          }
        }
      } 
           catch (err) {
                    console.error(err);
                
                  } 
}
    fetchUser();
  }, []);

  return (
    <div className="bg-white text-slate-900 min-h-screen">
     {/* Fixed Marketing Video Box */}
{!showVideoModal && (
  <div className="fixed bottom-6 right-6 z-40 hidden lg:block">

    <button
      onClick={() => setShowVideoModal(true)}
      className="group relative w-60 aspect-video rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/40 transition-all hover:scale-105 border-2 border-white bg-black cursor-pointer"
    >
      <iframe
        className="w-full h-full pointer-events-none"
        src="https://www.youtube.com/embed/EBmr8j3915g?autoplay=1&mute=0&loop=1&playlist=EBmr8j3915g&controls=0&rel=0&modestbranding=1"
        title="Welcome to Innovative Academy"
        allow="autoplay; encrypted-media"
      />

      {/* <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <span className="text-purple-700 text-xl ml-1">▶</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg text-center">
          Welcome to Innovative Academy
        </div>
      </div> */}
    </button>

  </div>
)}

{/* Video Modal */}
{showVideoModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">

    <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">

      {/* Modal Header */}
      <div className="flex justify-between items-center p-5 border-b">
        <h3 className="text-xl md:text-2xl font-bold">
          Welcome to Innovative Academy
        </h3>

        <button
          onClick={() => setShowVideoModal(false)}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full p-2 transition-all"
          aria-label="Close video"
        >
          <X size={24} />
        </button>
      </div>

      {/* Large Video */}
      <div className="aspect-video bg-black">

        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/EBmr8j3915g?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1"
          title="Welcome to Innovative Academy"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />

      </div>

    </div>
  </div>
)}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* <div className="flex-shrink-0 font-bold text-xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Innovative Academy
            </div> */}
            <div className="">
 <a href="#home" >
              <img src="/images/logos/innovative-academy.png" className='w-50' /></a>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
                {/* <a href="#about" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                About
              </a> */}
             <a href="#app-download" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                Download App
              </a>
              <a href="#founder" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                Team
              </a>
              
               <a href="#why-choose-us" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                Why Us
              </a>
              
              {/* <a href="#revive" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                Revive
              </a> */}
              <a href="#pricing" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                Pricing
              </a>
              <a href="#contact" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                Contact
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => router.push("/login")} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors">
                Sign In
              </button>
              <button  onClick={() => setIsOpen(true)} className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                Send Enquire now
              </button>


            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-purple-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
             {/* <a href="#about" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                About
              </a> */}
             <a href="#app-download" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Download App
              </a>
              <a href="#founder" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Team
              </a>
              
               <a href="#why-choose-us" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Why Us
              </a>
              
              {/* <a href="#revive" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Revive
              </a> */}
              <a href="#pricing" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Pricing
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Contact
              </a>
              <div className="flex gap-2 pt-4">
                <button onClick={() => router.push("/login")} className="flex-1 px-4 py-2 text-sm font-semibold text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                  Sign In
                </button>
             
                 <button  onClick={() => setIsOpen(true)} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                Send Enquire now
              </button>

              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Slider */}
      <section  id="home"  className="relative overflow-hidden bg-[#faf8ff] py-10 lg:py-20">   
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">               <div className="inline-block mb-6">
                <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-5 py-2 text-sm font-semibold text-purple-700 shadow-sm">
                  ✨ Premium Learning Platform
                </span>
              </div>

              {/* Slider Content */}
              <div className="">
                <h1 className="min-h-[170px] text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl animate-slide-up">
                    {slides[currentSlide].headline}<br /> {slides[currentSlide].subline}
                </h1>

              <p className="mb-10 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                  {slides[currentSlide].desc}
                </p>
              </div>

              {/* <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-600/30 transform hover:scale-105">
                  Join Now
                </button>
                <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all border-2 border-purple-600 hover:shadow-lg">
                  Explore Program
                </button>
              </div> */}

              {/* Slider Controls */}
              <div className="flex justify-center md:justify-start gap-4">
                <button
                  onClick={prevSlide}
                  className="rounded-full border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:bg-purple-600 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2 items-center">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                     className={`h-2 rounded-full transition-all duration-300 ${
  index === currentSlide
    ? "w-8 bg-purple-600"
    : "w-2 bg-slate-300 hover:bg-purple-300"
}`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className="p-2 bg-gray-200 hover:bg-purple-600 text-slate-700 hover:text-white rounded-full transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-purple-100 rounded-3xl blur-2xl opacity-40 animate-float"></div>
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_20px_50px_rgba(15,23,42,.10)] transition-all duration-500 hover:-translate-y-1">
                 {/* <div className="aspect-square bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center  text-6xl animate-scale-in">
                    📚
                  </div> */}
                  <img src={slides[currentSlide].img} className="w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-[1.02]" />
                  {/* <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-purple-600" />
                      <span className="text-slate-700 font-semibold">Expert Teachers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-purple-600" />
                      <span className="text-slate-700 font-semibold">Live + Offline Classes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-purple-600" />
                      <span className="text-slate-700 font-semibold">Complete App Access</span>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

       <section  id="app-download"  className="bg-white py-6 lg:py-8">
<AppShowcase />
</section>
{/* About Us Section */}
{/* <section  id="about"  className="bg-white py-16 lg:py-20"
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">

    <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>

    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        About Us
    </h2>
</div>
       
    </div>
    <div className="grid items-center gap-16 lg:grid-cols-2">

      <div className="order-2 md:order-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-purple-200/40 to-pink-100/30 blur-3xl"></div>

          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,.10)]">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
              <img
                src="/images/logos/innovative-academy-dark.png"
                alt="Innovative Academy"
                className="w-64 object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="order-1 md:order-2">

       
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Innovative Academy was born from a simple observation:
          students struggle not because they lack intelligence,
          but because they lack clarity of concepts and proper guidance.
        </p>

        <p className="mt-5 text-lg leading-8 text-slate-600">
          Our founders, passionate educators with decades of combined
          experience, created this institute to bridge the gap between
          traditional education and modern learning needs. We believe in:
        </p>

        <div className="mt-8 space-y-5">

          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100">
              <Star size={18} className="text-purple-600" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Deep Learning
              </h4>

              <p className="mt-1 text-slate-600">
                Understanding concepts thoroughly instead of memorizing
                answers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100">
              <Star size={18} className="text-purple-600" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Curiosity First
              </h4>

              <p className="mt-1 text-slate-600">
                Encouraging questions, exploration and critical thinking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100">
              <Star size={18} className="text-purple-600" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900">
                Holistic Growth
              </h4>

              <p className="mt-1 text-slate-600">
                Developing confidence, competitive mindset and life skills
                alongside academics.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</section> */}
{/* Vision Section */}
<section className="bg-[#faf8ff] py-16 lg:py-20" id="vision">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    {/* Heading */}
    <div className="mb-16 text-center">

      <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Our Vision
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Building Board Toppers, Olympiad achievers, and Competitive Champions through deep conceptual clarity and curiosity-driven learning.
      </p>

    </div>

    {/* Cards */}
    <div className="grid gap-8 md:grid-cols-3">

      {/* Card 1 */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-3xl shadow-md transition-transform duration-300 group-hover:scale-105">
          🧠
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Concept Mastery
        </h3>

        <div className="mx-auto my-4 h-[2px] w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>

        <p className="leading-7 text-slate-600">
          Deep understanding of fundamentals, not rote learning. Why-based teaching that builds strong foundations.
        </p>

      </div>

      {/* Card 2 */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-3xl shadow-md transition-transform duration-300 group-hover:scale-105">
          💡
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Curiosity Mindset
        </h3>

        <div className="mx-auto my-4 h-[2px] w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>

        <p className="leading-7 text-slate-600">
          Curiosity-driven discussions and explorations. Encouraging questions and critical thinking at every step.
        </p>

      </div>

      {/* Card 3 */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-3xl shadow-md transition-transform duration-300 group-hover:scale-105">
          🏆
        </div>

        <h3 className="text-xl font-bold text-slate-900">
          Competitive Edge
        </h3>

        <div className="mx-auto my-4 h-[2px] w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>

        <p className="leading-7 text-slate-600">
          Exposure to competitive exam patterns and strategies. Mindset development for excellence in all areas.
        </p>

      </div>

    </div>
  </div>
</section>

      {/* CEO/Founder Section */}
     <section className="bg-[#faf8ff] py-16 lg:py-20" id="founder">
       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">

    <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>

    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Meet Our Visionary
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-slate-600 leading-7">
        The vision, experience and dedication behind Innovative Academy.
    </p>

</div>

          <div className="grid lg:grid-cols-5 gap-10 items-start gap-8 items-center max-w-full px-4 mx-auto">
            {/* CEO Image */}
            <div className="hidden lg:sticky lg:top-30 lg:col-span-2 md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-500 rounded-3xl blur-2xl opacity-10"></div>
                <div className="rounded-[32px]
border
border-slate-200
shadow-[0_20px_50px_rgba(15,23,42,.10)]
p-6">
                
               <img src="/images/abbu2.png" className="mx-auto h-60 w-60 rounded-full border-4 border-white ring-2 ring-purple-100 shadow-lg object-cover" />
                <div className="border-t border-gray-200 my-4"></div>
            <div className="mt-6 rounded-2xl bg-purple-50 p-5">

<p className="italic text-lg leading-8 text-slate-700">

                  {/* "My mission is to prove that with the right approach, every student can excel. It's not about how smart you are, it's about how you learn." */}
                  &#34;My mission is to help students improve, grow and excel not only in exams but also in their life!&rdquo;
                 

                </p>
                </div>
                </div>
              </div>
            </div>

            {/* CEO Info */}
            <div className="lg:col-span-3">
              <div className="rounded-[32px]
border
border-slate-200
bg-white
shadow-md
p-8">
                {/* <p className="text-purple-600 font-semibold text-2xl mb-2">Shoukatali Mujawar</p>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Founder & CEO</h3>
                <p className="text-sm text-slate-500 mb-4">Education | 20+ Years Experience | Professional Trainer | Service Provider to NAAC & many more colleges</p>

                <div className="border-t border-gray-200 my-4"></div> */}
                <div className="flex flex-wrap  gap-4">
                <div className="flex md:hidden text-center w-full justify-center">
                  <img src="/images/abbu2.png" className="text-center mx-auto h-28 w-28 rounded-full border-2 border-white ring-1 ring-purple-100 shadow-md object-cover" />
                </div>
                <div>
   <span className="inline-flex rounded-full bg-purple-100 px-4 py-1 text-xs font-semibold text-purple-700">
Founder & CEO
</span>

<h3 className="mt-4 text-3xl font-bold text-slate-900">
Shoukatali Mujawar
</h3>

<p className="mt-3 text-slate-500">
20+ Years in Academic & Technical Education
</p>
</div></div>
                <p className="mt-8 text-slate-600">Academic Education | Computer Professional Trainer | NAAC consultant to many more Colleges and Educational Institutions</p>

                  {/* <div className="aspect-square bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-9xl">
                    👨‍💼
                  </div> */}
                    <div className="border-t border-gray-200 my-4"></div>
                <p className="text-slate-700 text-sm mb-4 leading-8">
20+ Years Experience in Technical and Academic Education | Computer Professional Trainer | NAAC consultant to many more Colleges and Educational Institutions
Our founder has 20+ years of experience in the field of education and technology and providing software and hardware services to 25+ colleges, schools and hotels. He has also honour to conduct competitive exams like AMP Scholarship and many more. He has started Innovative Academy with the vision to build learning habits amongst students and to help students grow and achieve concept clarity, academic excellence and confidence to participate in competitive exam. Our teaching method is interesting and focuses on students growth. We also help students study easily by imparting various study methods. With all this, we also focus on life skills like communication, confidence, career guidance, and many more. Our Online App Platform helps students to practice, analyze, improve and achieve success in their academic development.

{/* 
                  With over 20 years of experience in education and teachnology, our founder has provided software and hardware services to 25+ colleges, school, and hotel. Also he has been working in education field from past 20 years and is honour to conduct competitive exams like AMP Scholarship, and many more. And with the vision to transform how students learn, and to help each student grow and achieve concept clarity, academic excellence, confidence to participate in competitive exam, he has started Innovative Academy. Here studdents get guidance, confidence, clarity. Our teaching method is interesting, and focus on each students growth, we also help students study easily by making different methods to study. With all this we aso focus on life skills like communication, confidence, career guidance, and many more. And our Online App Platform helps each student to practice, analyse, improve and achieve. */}
                </p>

                <div className="mt-8 grid gap-4">

<div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex">
                    <Check size={20} className="text-purple-600 flex-shrink-0" />
                    <div>
                      <p className=" ml-4">Worked with 5+ NAAC Colleges</p>
                     </div>

</div>

<div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex">
                    <Check size={20} className="text-purple-600 flex-shrink-0 " /> 
                    <div> 
                      <p className=" ml-4">20+ Years Computer Software & Hardware Services
                        </p>
                      </div>

</div>

<div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex">
                    <Check size={20} className="text-purple-600 flex-shrink-0 " /> 
                    <div> <p className=" ml-4">Mentored Students & Guided Careers </p></div>

</div>

</div>

               

                
              </div>
            </div>
          </div>
        </div>
      </section>



{/* Under Guidance */}
<UnderGuidance mentors={mentors} />


<section id="team" className="bg-white py-16 lg:py-20">
<div className="space-y-16 lg:space-y-20">

<TeamSliderSection
  title="Leadership & Management"
  subtitle="Experienced professionals ensuring smooth operations and student success."
  members={managementMembers}
  direction="left"
  speed={35}
/>

<TeamSliderSection
  title="Our Faculty"
  subtitle="Dedicated educators committed to concept clarity and student growth."
  members={facultyMembers}
  direction="right"
  speed={35}
/>
</div>
    </section>

 
 {/* =====================================================
    1. WHY CHOOSE US
===================================================== */}

<section id="why-choose-us" className="relative overflow-hidden bg-white py-20 lg:py-28">

  <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-purple-100/60 blur-3xl" />
  <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-pink-100/40 blur-3xl" />

  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    <div className="mx-auto mb-14 max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-4 py-2 text-xs font-bold tracking-wider text-purple-700">
        ✨ THE INNOVATIVE DIFFERENCE
      </span>

      <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        More Than Tuition.
        <br />
        <span className="text-purple-600">A Better Way to Learn.</span>
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
        Great education is not just about completing a syllabus.
        It is about developing the person behind the marks.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

      {[
        {
          icon: "🎓",
          number: "01",
          title: "Teachers Who Care",
          desc: "Experienced educators, personal attention and guidance that makes a difference.",
          tag: "Human Guidance",
          color: "bg-blue-50"
        },
        {
          icon: "🧠",
          number: "02",
          title: "Understanding First",
          desc: "Go beyond memorising. Understand concepts, ask questions and think independently.",
          tag: "Deep Learning",
          color: "bg-purple-50"
        },
        {
          icon: "🎯",
          number: "03",
          title: "Growth for Everyone",
          desc: "A learning journey that helps every student identify gaps and improve.",
          tag: "Personal Progress",
          color: "bg-emerald-50"
        },
        {
          icon: "🏆",
          number: "04",
          title: "Future-Ready Foundation",
          desc: "Build the reasoning and fundamentals needed for future challenges.",
          tag: "Strong Foundations",
          color: "bg-amber-50"
        },
        {
          icon: "💡",
          number: "05",
          title: "Learning by Doing",
          desc: "Explore experiments, projects, challenges and real-world applications.",
          tag: "Practical Thinking",
          color: "bg-orange-50"
        },
        {
          icon: "🚀",
          number: "06",
          title: "Beyond the Classroom",
          desc: "Develop communication, creativity, confidence and problem-solving skills.",
          tag: "Complete Growth",
          color: "bg-pink-50"
        }
      ].map((item, i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/60 sm:p-7"
        >
          <div className="flex items-start justify-between">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} text-3xl transition-transform duration-300 group-hover:scale-110`}>
              {item.icon}
            </div>

            <span className="text-xs font-bold tracking-widest text-slate-300">
              {item.number}
            </span>
          </div>

          <h3 className="mt-6 text-xl font-bold text-slate-900">
            {item.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            {item.desc}
          </p>

          <div className="mt-6 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
            <span className="text-xs font-bold text-purple-700">
              {item.tag}
            </span>
          </div>
        </div>
      ))}

    </div>

    <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
      <span className="text-xl">💜</span>
      <p className="text-sm font-semibold text-slate-700 sm:text-base">
        Every student has potential. Our job is to help them discover it.
      </p>
    </div>

  </div>
</section>


{/* =====================================================
    2. LEARNING ECOSYSTEM
===================================================== */}

<section id="ecosystem" className="relative overflow-hidden bg-[#F8F7FC] py-20 lg:py-28">

  <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-100/70 blur-3xl" />
  <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />

  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    <div className="mx-auto mb-14 max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white px-4 py-2 text-xs font-bold tracking-wider text-purple-700 shadow-sm">
        ✨ ONE CONNECTED LEARNING ECOSYSTEM
      </span>

      <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        Learn. Practise.
        <br />
        <span className="text-purple-600">Improve. Grow.</span>
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
        A connected journey where every lesson, activity and challenge
        moves students forward.
      </p>
    </div>

    {/* Learning Journey */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

      {[
        {
          step: "01",
          icon: "📖",
          title: "Learn",
          subtitle: "Understand concepts",
          color: "border-blue-200 bg-blue-50"
        },
        {
          step: "02",
          icon: "✍️",
          title: "Practice",
          subtitle: "Build your skills",
          color: "border-violet-200 bg-violet-50"
        },
        {
          step: "03",
          icon: "📈",
          title: "Improve",
          subtitle: "Learn from mistakes",
          color: "border-emerald-200 bg-emerald-50"
        },
        {
          step: "04",
          icon: "🏆",
          title: "Master",
          subtitle: "Strengthen knowledge",
          color: "border-amber-200 bg-amber-50"
        },
        {
          step: "05",
          icon: "🚀",
          title: "Grow",
          subtitle: "Develop beyond books",
          color: "border-pink-200 bg-pink-50"
        }
      ].map((item, i) => (
        <div
          key={i}
          className={`rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${item.color}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-slate-400">
              STEP {item.step}
            </span>
            <span className="text-3xl">{item.icon}</span>
          </div>

          <h3 className="mt-5 text-xl font-extrabold text-slate-900">
            {item.title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {item.subtitle}
          </p>
        </div>
      ))}

    </div>

    {/* Detailed Learning Experiences */}
    <div className="mt-10 grid gap-6 lg:grid-cols-2">

      {/* Left: Learning experience */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

        <div className="mb-7">
          <span className="text-xs font-bold tracking-widest text-purple-600">
            THE STUDENT EXPERIENCE
          </span>

          <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
            Everything has a purpose.
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Explore how students learn, practise and develop mastery.
          </p>
        </div>

        <div className="space-y-3">

          {[
            {
              icon: "📚",
              title: "Structured Learning",
              desc: "Chapter-wise lessons, micro-topics, notes, videos and teacher guidance."
            },
            {
              icon: "✍️",
              title: "Intelligent Practice",
              desc: "MCQs, numericals, explanations, stepwise problems and rapid-fire."
            },
            {
              icon: "🧠",
              title: "Memory Gym",
              desc: "Interactive recall of formulas, tables, squares, cubes and essential facts."
            },
            {
              icon: "📐",
              title: "Strong Fundamentals",
              desc: "Build essential mathematical, scientific and logical foundations."
            },
            {
              icon: "🔄",
              title: "Smart Revision",
              desc: "Revisit concepts, reinforce memory and practise difficult questions."
            },
            {
              icon: "📒",
              title: "Mistake Notebook",
              desc: "Understand errors, revisit weak areas and improve continuously."
            },
            {
              icon: "🎮",
              title: "Chapter Mastery",
              desc: "Progressive challenges, levels, Hill Climb competitions and leaderboards."
            },
            {
              icon: "🚀",
              title: "Beyond Academics",
              desc: "Weekly speeches, projects, experiments and creative activities."
            }
          ].map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-slate-100 bg-slate-50 transition-all open:border-purple-200 open:bg-purple-50/50"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                  {item.icon}
                </div>

                <span className="flex-1 text-sm font-bold text-slate-800 sm:text-base">
                  {item.title}
                </span>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-purple-600 transition-transform group-open:rotate-180">
                  <span className="text-lg">⌄</span>
                </span>
              </summary>

              <div className="px-4 pb-4 pl-[72px]">
                <p className="text-sm leading-6 text-slate-500">
                  {item.desc}
                </p>
              </div>
            </details>
          ))}

        </div>
      </div>

      {/* Right: Technology */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#5420B8] via-[#6D28D9] to-[#813CE5] p-6 text-white shadow-xl shadow-purple-200 sm:p-8">

        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

        <div className="relative">

          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-purple-100">
            POWERED BY TECHNOLOGY
          </span>

          <h3 className="mt-7 text-3xl font-extrabold">
            One Platform.
            <br />
            Three Connected Experiences.
          </h3>

          <p className="mt-4 text-sm leading-7 text-purple-100">
            Technology connects students, teachers and academy management
            into one organised learning system.
          </p>

          <div className="mt-8 space-y-4">

            {[
              {
                icon: "📱",
                title: "Student Dashboard",
                desc: "Daily tasks, progress, achievements and notifications."
              },
              {
                icon: "🤖",
                title: "AI Learning Guide",
                desc: "Interactive avatar, guided assistance and learning suggestions."
              },
              {
                icon: "🎙️",
                title: "Voice & Live Learning",
                desc: "Voice explanations, interactive classes and recorded lectures."
              },
              {
                icon: "📊",
                title: "Smart Analytics",
                desc: "Chapter mastery, strengths, weaknesses and learning history."
              },
              {
                icon: "👩‍🏫",
                title: "Teacher Workspace",
                desc: "Lesson planning, question creation, assignments and student monitoring."
              },
              {
                icon: "⚙️",
                title: "Academy Management",
                desc: "Teacher coordination, scheduling, activities and notifications."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/15"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                  {item.icon}
                </div>

                <div>
                  <h4 className="text-sm font-bold sm:text-base">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-purple-100 sm:text-sm">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>

          <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-xs font-bold tracking-widest text-purple-200">
              OUR MISSION
            </p>

            <p className="mt-3 text-lg font-bold leading-7">
              Not just better marks. Better thinkers.
            </p>

            <p className="mt-2 text-sm leading-6 text-purple-100">
              Stronger fundamentals, deeper understanding and the confidence
              to take on tomorrow.
            </p>
          </div>

        </div>
      </div>
    </div>

  </div>
</section>


{/* =====================================================
    3. PRICING
===================================================== */}

<section id="pricing" className="relative overflow-hidden bg-white py-20 lg:py-28">

  <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-purple-100/60 blur-3xl" />

  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    <div className="mx-auto mb-14 max-w-3xl text-center">

      <span className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-4 py-2 text-xs font-bold tracking-wider text-purple-700">
        ✨ SIMPLE & TRANSPARENT
      </span>

      <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
        Choose How You
        <br />
        <span className="text-purple-600">Want to Grow.</span>
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
        Start with digital learning or experience the complete
        teacher-led academy system.
      </p>

    </div>

    <div className="grid items-stretch gap-6 lg:grid-cols-3">

      {/* APP ONLY */}
      <div className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8">

        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-2xl">
            📱
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            DIGITAL
          </span>
        </div>

        <h3 className="mt-6 text-xl font-extrabold text-slate-900">
          App Only
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Independent digital learning.
        </p>

        <div className="mt-7">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">
              ₹499
            </span>
            <span className="text-sm text-slate-500">/ month</span>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2">
            <span className="text-sm font-bold text-purple-700">
              ₹4,999 / year
            </span>
            <span className="text-xs font-bold text-emerald-600">
              Save ₹989
            </span>
          </div>
        </div>

        <div className="my-7 h-px bg-slate-100" />

        <p className="mb-5 text-xs font-bold tracking-widest text-slate-400">
          WHAT'S INCLUDED
        </p>

        <div className="flex-1 space-y-3">

          {[
            "Complete digital learning platform",
            "Chapter-wise lessons and resources",
            "Live and recorded learning",
            "Structured question bank and practice",
            "Chapter mastery challenges"
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <Check size={17} className="mt-0.5 shrink-0 text-purple-600" />
              <p className="text-sm leading-5 text-slate-600">{feature}</p>
            </div>
          ))}

          <details className="group pt-1">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-purple-700">
              See all inclusions
              <span className="transition-transform group-open:rotate-180">⌄</span>
            </summary>

            <div className="mt-4 space-y-3 border-l-2 border-purple-100 pl-4">
              {[
                "Memory Gym and Fundamentals",
                "Smart revision and daily challenges",
                "Mistake Notebook",
                "Gamified learning and competitions",
                "AI learning guide",
                "Personal learning analytics"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-purple-600" />
                  <p className="text-sm text-slate-600">{feature}</p>
                </div>
              ))}
            </div>
          </details>

        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-700">IDEAL FOR</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Students who want structured learning and practice from anywhere.
          </p>
        </div>

      </div>


      {/* MONTHLY ACADEMY */}
      <div className="relative flex flex-col rounded-[28px] border-2 border-purple-200 bg-white p-6 shadow-lg shadow-purple-100 transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8">

        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
            👩‍🏫
          </div>

          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            CLASSROOM + APP
          </span>
        </div>

        <h3 className="mt-6 text-xl font-extrabold text-slate-900">
          Monthly Academy
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Teacher-led learning with digital support.
        </p>

        <div className="mt-7">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">
              ₹1,499
            </span>
            <span className="text-sm text-slate-500">/ month</span>
          </div>

          <p className="mt-3 text-sm font-semibold text-purple-700">
            Complete learning experience.
          </p>
        </div>

        <div className="my-7 h-px bg-slate-100" />

        <p className="mb-5 text-xs font-bold tracking-widest text-slate-400">
          EVERYTHING INCLUDED
        </p>

        <div className="flex-1 space-y-3">

          {[
            "Everything in the App Plan",
            "Regular offline classroom teaching",
            "Experienced subject teachers",
            "Personal academic guidance",
            "Teacher-led doubt resolution"
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <Check size={17} className="mt-0.5 shrink-0 text-purple-600" />
              <p className="text-sm leading-5 text-slate-600">{feature}</p>
            </div>
          ))}

          <details className="group pt-1">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-purple-700">
              See all inclusions
              <span className="transition-transform group-open:rotate-180">⌄</span>
            </summary>

            <div className="mt-4 space-y-3 border-l-2 border-purple-100 pl-4">
              {[
                "Classroom practice and discussions",
                "Homework and assignments",
                "Continuous progress monitoring",
                "Academic and competitive foundation",
                "Beyond-academics activities"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-purple-600" />
                  <p className="text-sm text-slate-600">{feature}</p>
                </div>
              ))}
            </div>
          </details>

        </div>

        <div className="mt-8 rounded-2xl bg-purple-50 p-4">
          <p className="text-xs font-bold text-purple-800">IDEAL FOR</p>
          <p className="mt-1 text-sm leading-6 text-purple-700">
            Students who want regular classroom teaching and personal guidance.
          </p>
        </div>

      </div>


      {/* YEARLY ACADEMY */}
      <div className="relative flex flex-col rounded-[28px] bg-gradient-to-br from-[#5420B8] via-[#6D28D9] to-[#813CE5] p-6 text-white shadow-xl shadow-purple-200 transition-all hover:-translate-y-1 hover:shadow-2xl sm:p-8">

        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="whitespace-nowrap rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-extrabold text-slate-900 shadow-lg">
            ⭐ BEST VALUE
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
            🏆
          </div>

          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-purple-100">
            FULL YEAR
          </span>
        </div>

        <h3 className="mt-6 text-xl font-extrabold">
          Yearly Academy
        </h3>

        <p className="mt-2 text-sm text-purple-100">
          A complete academic year of growth.
        </p>

        <div className="mt-7">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">
              ₹14,999
            </span>
            <span className="text-sm text-purple-200">/ year</span>
          </div>

          <p className="mt-2 text-sm text-purple-100">
            Approximately ₹1,250 per month
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2">
            ✓
            <span className="text-xs font-bold">
              Save ₹2,989
            </span>
          </div>
        </div>

        <div className="my-7 h-px bg-white/20" />

        <p className="mb-5 text-xs font-bold tracking-widest text-purple-200">
          EVERYTHING INCLUDED
        </p>

        <div className="flex-1 space-y-3">

          {[
            "Everything in the App Plan",
            "Regular offline classroom teaching",
            "Experienced subject teachers",
            "Personal academic guidance",
            "Teacher-led doubt resolution"
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Check size={13} />
              </div>
              <p className="text-sm leading-5 text-purple-50">{feature}</p>
            </div>
          ))}

          <details className="group pt-1">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-white">
              See all inclusions
              <span className="transition-transform group-open:rotate-180">⌄</span>
            </summary>

            <div className="mt-4 space-y-3 border-l-2 border-white/30 pl-4">
              {[
                "Classroom practice and discussions",
                "Homework and assignments",
                "Continuous progress monitoring",
                "Academic and competitive foundation",
                "Beyond-academics activities"
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-white" />
                  <p className="text-sm text-purple-100">{feature}</p>
                </div>
              ))}
            </div>
          </details>

        </div>

        <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4">
          <p className="text-xs font-bold text-white">IDEAL FOR</p>
          <p className="mt-1 text-sm leading-6 text-purple-100">
            Families choosing consistent learning throughout the academic year.
          </p>
        </div>

      </div>

    </div>


    {/* Pricing note */}
    <div className="mt-8 flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
        🛡️
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800">
          Clear pricing. Meaningful learning.
        </p>

        <p className="mt-1 text-xs leading-6 text-slate-500">
          Annual savings are calculated against 12 monthly payments.
          Subscription duration and applicable terms will be shared during enrolment.
        </p>
      </div>
    </div>


    {/* Schools */}
    <div className="mt-20 overflow-hidden rounded-[28px] border border-purple-100 bg-[#FAF8FF]">

      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">

        <div className="flex flex-col justify-center p-7 sm:p-10">

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700">
            🎓 FOR INSTITUTIONS
          </span>

          <h3 className="mt-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Bring Better Learning to Your School.
          </h3>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            Support teachers, engage students and bring structured
            digital learning into your institution.
          </p>

        </div>

        <div className="space-y-3 p-5 sm:p-8">

          <div className="rounded-2xl border border-purple-100 bg-white p-5">
            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-xl">
                📚
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  Digital Learning Platform
                </h4>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Learning resources, practice, revision and student progress tracking.
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-white p-5">
            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-xl">
                👩‍🏫
              </div>

              <div>
                <h4 className="font-bold text-slate-900">
                  Teaching + App Solution
                </h4>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Teaching support, digital learning, assessments and academic management.
                </p>
              </div>

            </div>
          </div>

          <a
            href="mailto:info@innovativeacademy.org.in"
            className="flex items-center justify-between rounded-xl bg-purple-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-purple-700"
          >
            Discuss a School Partnership
            <span>→</span>
          </a>

        </div>
      </div>
    </div>

    <p className="mt-10 text-center text-xs leading-6 text-slate-400">
      * Prices shown are proposed introductory prices. Confirm final subscription
      duration, inclusions and terms before enrolment.
    </p>

  </div>
</section>

{/* Contact Section */}
<section  id="contact"  className="bg-[#faf8ff] py-16 lg:py-20"
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    {/* Heading */}
    <div className="mb-16 text-center">

      <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Get in Touch
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Have questions? We’d love to hear from you!
      </p>

    </div>

    {/* Content */}
    <div className="space-y-12">

      {/* Map */}
      <div className="overflow-hidden rounded-[28px] border border-slate-200 shadow-md">
        <div className="h-[380px] w-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3819.088615626635!2d74.64146391008234!3d16.821959383905146!2m3!1f0!2f0!3f0!3d0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230773dff2e9%3A0xa71a5edeb52b2e4f!2sInnovative%20Computer!5e0!3m2!1sen!2sin!4v1774183063704!5m2!1sen!2sin"
            className="h-full w-full"
            loading="lazy"
            style={{ border: 0 }}
          />
        </div>
      </div>

      {/* Contact Cards */}
      <div className="grid gap-8 md:grid-cols-3">

        {/* Location */}
        <div className="group rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 transition-transform group-hover:scale-105">
            <MapPin size={30} className="text-purple-600" />
          </div>

          <p className="text-sm font-semibold leading-7 text-slate-700">
            2nd floor, Vedika Heights, Near HDFC Bank, Hira Hotel Choke, Shivaji Road, Miraj
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Visit us at our center
          </p>

        </div>

        {/* Email */}
        <div className="group rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 transition-transform group-hover:scale-105">
            <Mail size={30} className="text-purple-600" />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            shayanalimujawar13@gmail.com
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-700">
            support@innovativeacademy.org.in
          </p>

          <p className="mt-3 text-sm text-slate-500">
            We respond within 24 hours
          </p>

        </div>

        {/* Phone */}
        <div className="group rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 transition-transform group-hover:scale-105">
            <Phone size={30} className="text-purple-600" />
          </div>

          <p className="text-sm font-semibold text-slate-700">
            +91 94215 67466
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-700">
            +91 94038 55466
          </p>

          <p className="mt-3 text-sm text-slate-500">
            10 AM - 7 PM
          </p>

        </div>

      </div>

    </div>

  </div>
</section>
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Build a Competitive Mindset?</h2>
          <p className="text-lg mb-8 leading-relaxed text-purple-100">
            Join hundreds of students already excelling in board exams, Olympiads, and competitive exams with Innovative Academy.
          </p>
          <button className="px-10 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            Join Innovative Academy Today
          </button>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Column 1 - About */}
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">

                <img src="/images/logos/innovative-academy-dark.png" className='w-70' />
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Building Board Toppers, Olympiad achievers, and Competitive Champions through deep conceptual clarity and curiosity-driven learning.
              </p>
            </div>

            {/* Column 2 - Programs */}
            <div>
              <h3 className="text-lg font-bold mb-4">Programs</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">Class 8 Foundation</a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">Class 9 Foundation</a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">Class 10 Foundation</a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">School Plans</a>
                </li>
              </ul>
            </div>

            {/* Column 3 - Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <div className="space-y-3 text-gray-400 text-sm">
                <p>
                  <span className="font-semibold text-white">Email:</span><br />
                  innovative.enlightenment@gmail.com
                  <br />
                  shayanalimujawar13@gmail.com
                  <br />
                  support@innovativeacademy.org.in
                </p>
                <p>
                  <span className="font-semibold text-white">Phone:</span><br />
                  +91 94215 67466
                  <br />
                  +91 94038 55466
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
            <p className="text-center text-gray-500 text-sm">
              © 2026 Innovative Academy. All rights reserved. | Helping students for CBSE, State Board, Olympiad & Competitive Exams.
            </p>
          </div>
        </div>
      </footer>
         <EnquiryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
