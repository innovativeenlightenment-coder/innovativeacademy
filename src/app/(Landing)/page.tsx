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
      <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
        <button
          onClick={() => setShowVideoModal(true)}
          className="group relative w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-2xl hover:shadow-purple-500/40 transition-all hover:scale-110 flex items-center justify-center border-4 border-white"
        >
          <Play size={32} className="text-white group-hover:scale-110 transition-transform" />
          <span className="absolute inset-0 rounded-full bg-purple-600/20 group-hover:bg-purple-600/40 transition-colors"></span>
        </button>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold">Welcome to Innovative Academy</h3>
              <button onClick={() => setShowVideoModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-white text-lg">Add your YouTube video embed here</p>
                <p className="text-gray-400 text-sm mt-2">Embed code: &lt;iframe src={"https://www.youtube.com/..."}&gt;</p>
              </div>
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
{/* About Us Section */}
{/* <section  id="about"  className="bg-white py-20 lg:py-24"
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
<section className="bg-[#faf8ff] py-20 lg:py-24" id="vision">
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
     <section className="bg-[#faf8ff] py-20 lg:py-24" id="founder">
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


<section id="team" className="bg-white py-20 lg:py-24">
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

   
{/* Why Choose Us Section */}
<section  id="why-choose-us"   className="bg-white py-20 lg:py-24"
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    {/* Heading */}
    <div className="mb-16 text-center">

      <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Why Choose Innovative Academy?
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        A learning ecosystem designed to help students understand deeply,
        practice consistently, and achieve confidently.
      </p>

    </div>

    {/* Features */}
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

      {/* Feature */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="flex items-start gap-5">

          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-2xl shadow-md transition-transform duration-300 group-hover:scale-105">
            📚
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Offline Classes
            </h3>

            <p className="mt-2 leading-7 text-slate-600">
              Our main focus is offline learning with dedicated in-person sessions.
            </p>
          </div>

        </div>
      </div>

      {/* Feature */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="flex items-start gap-5">

          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-2xl shadow-md transition-transform duration-300 group-hover:scale-105">
            🎓
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Expert Teachers
            </h3>

            <p className="mt-2 leading-7 text-slate-600">
              Each subject has specialized teachers passionate about helping every student grow.
            </p>
          </div>

        </div>
      </div>

      {/* Feature */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="flex items-start gap-5">

          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-2xl shadow-md transition-transform duration-300 group-hover:scale-105">
            💬
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Doubt Resolution
            </h3>

            <p className="mt-2 leading-7 text-slate-600">
              Direct interaction with subject experts for personalized doubt solving.
            </p>
          </div>

        </div>
      </div>

      {/* Feature */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="flex items-start gap-5">

          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-2xl shadow-md transition-transform duration-300 group-hover:scale-105">
            🎯
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              All Exam Coverage
            </h3>

            <p className="mt-2 leading-7 text-slate-600">
              CBSE, State Board, Olympiad and Competitive exam preparation under one roof.
            </p>
          </div>

        </div>
      </div>

      {/* Feature */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="flex items-start gap-5">

          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-2xl shadow-md transition-transform duration-300 group-hover:scale-105">
            👥
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Limited Batch Size
            </h3>

            <p className="mt-2 leading-7 text-slate-600">
              Small batches ensure personalized attention and better learning outcomes.
            </p>
          </div>

        </div>
      </div>

      {/* Feature */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="flex items-start gap-5">

          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-2xl shadow-md transition-transform duration-300 group-hover:scale-105">
            💰
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Affordable Premium
            </h3>

            <p className="mt-2 leading-7 text-slate-600">
              Premium-quality education at an affordable fee for every learner.
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>
     
{/* Learning Ecosystem Section */}
<section id="ecosystem" className="bg-[#faf8ff] py-12 sm:py-16 lg:py-20">
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

    {/* Heading */}
    <div className="mb-10 text-center">
      <div className="mx-auto mb-3 h-1 w-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
        Our Learning Ecosystem
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-slate-600 leading-6 sm:leading-7">
        A complete system for learning, practice, testing and performance tracking.
      </p>
    </div>

    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">

      {/* LEFT SIDE */}
      <div className="space-y-3 sm:space-y-4">

        {[
          {
            title: "5000–10000+ Question Bank",
            desc: "Chapter-wise structured practice with different difficulty levels."
          },
          {
            title: "Live + Offline Classes",
            desc: "Balanced classroom teaching with digital learning support."
          },
          {
            title: "Regular Exams System",
            desc: "Weekly, monthly and quarterly tests for continuous evaluation."
          },
          {
            title: "Mastery Tracking",
            desc: "Clear chapter-wise progress tracking system."
          },
          {
            title: "Gamified Learning",
            desc: "Points, levels and rewards to increase motivation."
          },
          {
            title: "Doubt Support",
            desc: "Quick and personalized teacher guidance system."
          }
        ].map((item, i) => (
          <div
            key={i}
            className="flex gap-3 sm:gap-4 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="mt-0.5 flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-700">
              <Check size={16} className="text-white" />
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 mt-0.5 sm:mt-1">
                {item.desc}
              </p>
            </div>
          </div>
        ))}

      </div>

      {/* RIGHT SIDE */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-6 sm:p-7 lg:p-8 text-white shadow-lg">

        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/5"></div>

        <div className="relative">

          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            Complete Platform
          </span>

          <h3 className="mt-4 text-xl sm:text-2xl font-bold leading-snug">
            Learn. Practice. Improve.
          </h3>

          <p className="mt-3 text-sm sm:text-base text-purple-100 leading-6 sm:leading-7">
            Unified system combining teaching, practice, analytics and revision tools for better results.
          </p>

          <div className="mt-6 space-y-3">

            {[
              {
                title: "📱 Student App",
                desc: "All learning tools in one place anytime."
              },
              {
                title: "📊 Analytics",
                desc: "Track strengths, weaknesses and progress."
              },
              {
                title: "🎯 Revision Tools",
                desc: "MCQs, notes and previous papers."
              },
              {
                title: "🧠 AI Support",
                desc: "Smart suggestions and guided learning."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/20 bg-white/10 p-3 sm:p-4 backdrop-blur"
              >
                <div className="text-sm sm:text-base font-semibold">
                  {item.title}
                </div>

                <p className="text-xs sm:text-sm text-purple-100 mt-1 leading-5 sm:leading-6">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>

        </div>
      </div>

    </div>
  </div>
</section>

     
       {/* Revive - Student Success Stories Section */}
     
{/* <section
  id="revive"
>
  <ReviveSlider reviews={reviveReviews} />  
</section> */}


{/* Pricing Section */}
<section id="pricing"  className="bg-white py-20 lg:py-24"
>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

    {/* Heading */}
    <div className="mb-16 text-center">

      <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Simple, Transparent Pricing
      </h2>

      <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Choose what works best for you
      </p>

    </div>

    {/* Pricing Cards */}
    <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">

      {/* App Only Plan */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

        <h3 className="text-xl font-bold text-slate-900">
          App Only Plan
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          Full App Access + Doubt Help
        </p>

        {/* Price */}
        <div className="mt-6">
          <div className="text-5xl font-bold text-slate-900">
            ₹2999<sup className="text-lg">*</sup>
          </div>
          <p className="mt-1 text-sm text-slate-600">per year</p>
          <p className="mt-2 text-sm font-semibold text-purple-600">
            Only ₹250/month
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-4">
          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Complete app access</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">10000+ question bank</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Multiple practice tests</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Online teacher doubt help</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Smart dashboard + analysis</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Study material</p>
          </div>
        </div>

      </div>

      {/* Monthly Plan */}
      <div className="group rounded-[28px] border border-slate-200 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

        <h3 className="text-xl font-bold text-slate-900">
          Monthly Plan
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          Classes + App Access
        </p>

        {/* Price */}
        <div className="mt-6">
          <div className="text-5xl font-bold text-slate-900">
            ₹1299<sup className="text-lg">*</sup>
          </div>
          <p className="mt-1 text-sm text-slate-600">per month</p>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-4">

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Daily classes</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Online + Offline</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">1 on 1 mentorship and teaching</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Full app access</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">Study material</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">10000+ question bank</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-purple-600 mt-0.5" />
            <p className="text-sm text-slate-700">All exams covered</p>
          </div>

        </div>

      </div>

      {/* Yearly Plan (Featured) */}
      <div className="relative group rounded-[28px] bg-gradient-to-br from-purple-600 to-purple-800 p-8 text-white shadow-xl transition-all duration-300 hover:-translate-y-2">

        {/* Badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-yellow-400 px-4 py-1 text-xs font-bold text-slate-900">
            Best Offer
          </span>
        </div>

        <h3 className="text-xl font-bold">
          Yearly Plan
        </h3>

        <p className="mt-2 text-sm text-purple-100">
          Classes + App (Save ₹2598)
        </p>

        {/* Price */}
        <div className="mt-6">
          <div className="text-5xl font-bold">
            ₹12999<sup className="text-lg">*</sup>
          </div>
          <p className="mt-1 text-sm text-purple-100">per year</p>
          <p className="mt-2 text-sm text-purple-200">
            Only ₹1083/month
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-4">

          <div className="flex items-start gap-3">
            <Check size={18} className="text-white mt-0.5" />
            <p className="text-sm text-white/90">Daily classes</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-white mt-0.5" />
            <p className="text-sm text-white/90">1 on 1 mentorship and teaching</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-white mt-0.5" />
            <p className="text-sm text-white/90">Full app access</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-white mt-0.5" />
            <p className="text-sm text-white/90">Study material</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-white mt-0.5" />
            <p className="text-sm text-white/90">10000+ question bank</p>
          </div>

          <div className="flex items-start gap-3">
            <Check size={18} className="text-white mt-0.5" />
            <p className="text-sm text-white/90">All exams covered</p>
          </div>

        </div>

      </div>

    </div>

    {/* School Plans */}
    <div className="mt-16 bg-white border border-purple-200 rounded-[28px] p-8">

      <h3 className="text-2xl font-bold text-slate-900">
        For Schools & Institutions
      </h3>

      <p className="mt-3 text-slate-600 mb-8">
        We offer specialized plans for educational institutions.
      </p>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="rounded-2xl border border-slate-200 p-6 hover:border-purple-400 transition">
          <h4 className="text-lg font-semibold text-slate-900">
            Full App Usage Plan
          </h4>
          <p className="mt-2 text-sm text-slate-600">
            Provide complete app access to students for self-learning and practice.
          </p>
          <button className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
            Contact for Details
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6 hover:border-purple-400 transition">
          <h4 className="text-lg font-semibold text-slate-900">
            Teaching + App Plan
          </h4>
          <p className="mt-2 text-sm text-slate-600">
            Complete solution with expert teachers and full platform support.
          </p>
          <button className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
            Contact for Details
          </button>
        </div>

      </div>

    </div>

    {/* Footer */}
    <p className="mt-12 text-center text-sm text-slate-600">
      All student plans include offline access. Cancel anytime. School plans include customization options.
    </p>

  </div>
</section>
{/* Contact Section */}
<section  id="contact"  className="bg-[#faf8ff] py-20 lg:py-24"
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
            team@innovativeacademy.org.in
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
            +91 93350 92358
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
                  team@innovativeacademy.org.in
                  <br />
                  support@innovativeacademy.org.in
                </p>
                <p>
                  <span className="font-semibold text-white">Phone:</span><br />
                  +91 (94215-67466)
                  <br />
                  +91-(93350-92358)
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
