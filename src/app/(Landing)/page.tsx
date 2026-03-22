// "use client"
// import { useState, useEffect } from 'react';
// import { Menu, X, Check, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Play, Star } from 'lucide-react';

// import "./new/global_landing.css"
// import { useRouter } from 'next/navigation';


// export default function Index() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [showVideoModal, setShowVideoModal] = useState(false);


//   const router=useRouter()
//   const slides = [
//     {
//       headline: "Build Strong Concepts.",
//       subline: "Become a Board Topper.",
//       desc: "Foundation for Olympiads, Competitive Exams & Academic Excellence",
//       img:"/slides/1.jpg"
//     },
//     {
//       headline: "Master Every Subject.",
//       subline: "Learn from Expert Teachers.",
//       desc: "Each subject taught by specialized experts dedicated to your success",
//       img:"/slides/2.webp"
//     },
//     {
//       headline: "Prepare for Everything.",
//       subline: "CBSE • State Board • Olympiad • Competitive Exams.",
//       desc: "Comprehensive preparation covering all major exams in one platform",
//       img:"/slides/3.jpg"
//     },
//     {
//       headline: "Double Your Confidence.",
//       subline: "Live Classes + Offline Sessions + App Learning.",
//       desc: "Multi-format learning with personalized doubt resolution",
//       img:"/slides/4.jpg"
//     }
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//     }, 5000);
//     return () => clearInterval(timer);
//   }, []);

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % slides.length);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
//   };

//   return (
//     <div className="bg-white text-slate-900 min-h-screen">
//       {/* Fixed Marketing Video Box */}
//       <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
//         <button
//           onClick={() => setShowVideoModal(true)}
//           className="group relative w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-2xl hover:shadow-purple-500/40 transition-all hover:scale-110 flex items-center justify-center border-4 border-white"
//         >
//           <Play size={32} className="text-white group-hover:scale-110 transition-transform" />
//           <span className="absolute inset-0 rounded-full bg-purple-600/20 group-hover:bg-purple-600/40 transition-colors"></span>
//         </button>
//       </div>

//       {/* Video Modal */}
//       {showVideoModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-2xl font-bold">Welcome to Innovative Academy</h3>
//               <button onClick={() => setShowVideoModal(false)} className="text-gray-500 hover:text-gray-700">
//                 <X size={24} />
//               </button>
//             </div>
//             <div className="aspect-video bg-black flex items-center justify-center">
//               <div className="text-center">
//                 <div className="text-6xl mb-4">🎬</div>
//                 <p className="text-white text-lg">Add your YouTube video embed here</p>
//                 <p className="text-gray-400 text-sm mt-2">Embed code: &lt;iframe src={"https://www.youtube.com/..."}&gt;</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Navbar */}
//       <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-18">
//             {/* <div className="flex-shrink-0 font-bold text-xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
//               Innovative Academy
//             </div> */}
//             <div className="">

//   <img src="/images/logos/logo.png" className='w-70'/>
//             </div>
//             {/* Desktop Menu */}
//             <div className="hidden md:flex items-center gap-8">
//               <a href="#home" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
//                 Home
//               </a>
//               <a href="#about" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
//                 About
//               </a>
//               <a href="#programs" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
//                 Programs
//               </a>
//               <a href="#app" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
//                 App
//               </a>
//               {/* <a href="#revive" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
//                 Revive
//               </a> */}
//               <a href="#pricing" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
//                 Pricing
//               </a>
//               <a href="#contact" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
//                 Contact
//               </a>
//             </div>

//             <div className="hidden md:flex items-center gap-4">
//               <button onClick={()=>router.push("/login")} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors">
//                 Sign In
//               </button>
//               <button onClick={()=>router.push("/signup")} className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
//                 Sign Up
//               </button>
//             </div>

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="md:hidden p-2 text-slate-700 hover:text-purple-600"
//             >
//               {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           </div>

//           {/* Mobile Menu */}
//           {mobileMenuOpen && (
//             <div className="md:hidden pb-4 space-y-2">
//               <a href="#home" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
//                 Home
//               </a>
//               <a href="#about" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
//                 About
//               </a>
//               <a href="#programs" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
//                 Programs
//               </a>
//               <a href="#app" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
//                 App
//               </a>
//               <a href="#revive" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
//                 Revive
//               </a>
//               <a href="#pricing" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
//                 Pricing
//               </a>
//               <a href="#contact" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
//                 Contact
//               </a>
//               <div className="flex gap-2 pt-4">
//                 <button className="flex-1 px-4 py-2 text-sm font-semibold text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
//                   Sign In
//                 </button>
//                 <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
//                   Sign Up
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </nav>

//       {/* Hero Section with Slider */}
//       <section id="home" className="relative py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
//         <div className="max-w-6xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-12 items-center">
//             {/* Left Content */}
//             <div className="text-center md:text-left">
//               <div className="inline-block mb-6">
//                 <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200">
//                   ✨ Premium Learning Platform
//                 </span>
//               </div>

//               {/* Slider Content */}
//               <div className="">
//                 <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight text-slate-900 animate-slide-up min-h-40">
//                   {slides[currentSlide].headline}<br /> {slides[currentSlide].subline}
//                 </h1>

//                 <p className="text-sm sm:text-lg text-slate-600 mb-8 leading-relaxed animate-slide-up">
//                   {slides[currentSlide].desc}
//                 </p>
//               </div>

//               {/* <div className="flex flex-col sm:flex-row gap-4 mb-8">
//                 <button className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-600/30 transform hover:scale-105">
//                   Join Now
//                 </button>
//                 <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-all border-2 border-purple-600 hover:shadow-lg">
//                   Explore Program
//                 </button>
//               </div> */}

//               {/* Slider Controls */}
//               <div className="flex justify-center md:justify-start gap-4">
//                 <button
//                   onClick={prevSlide}
//                   className="p-2 bg-gray-200 hover:bg-purple-600 text-slate-700 hover:text-white rounded-full transition-all"
//                 >
//                   <ChevronLeft size={20} />
//                 </button>
//                 <div className="flex gap-2 items-center">
//                   {slides.map((_, index) => (
//                     <button
//                       key={index}
//                       onClick={() => setCurrentSlide(index)}
//                       className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-purple-600 w-6' : 'bg-gray-300'
//                         }`}
//                     />
//                   ))}
//                 </div>
//                 <button
//                   onClick={nextSlide}
//                   className="p-2 bg-gray-200 hover:bg-purple-600 text-slate-700 hover:text-white rounded-full transition-all"
//                 >
//                   <ChevronRight size={20} />
//                 </button>
//               </div>
//             </div>

//             {/* Right Visual */}
//             <div className="hidden md:block">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-purple-100 rounded-3xl blur-2xl opacity-40 animate-float"></div>
//                 <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-3xl overflow-hidden  border border-purple-200  shadow-2xl">
//                   {/* <div className="aspect-square bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center  text-6xl animate-scale-in">
//                     📚
//                   </div> */}
//                   <img src={slides[currentSlide].img} className="rounded-3xl flex items-center justify-center  animate-scale-in p-2 w-280" />
//                   {/* <div className="mt-6 space-y-3">
//                     <div className="flex items-center gap-3">
//                       <Check size={20} className="text-purple-600" />
//                       <span className="text-slate-700 font-semibold">Expert Teachers</span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Check size={20} className="text-purple-600" />
//                       <span className="text-slate-700 font-semibold">Live + Offline Classes</span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <Check size={20} className="text-purple-600" />
//                       <span className="text-slate-700 font-semibold">Complete App Access</span>
//                     </div>
//                   </div> */}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* About Us Section */}
//       <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//         <div className="max-w-6xl mx-auto">
//           <div className="grid md:grid-cols-2 gap-8 items-center">
//             {/* Left Visual */}
//             <div className="order-2 md:order-1 md:max-w-md max-w-full">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl blur-2xl opacity-50"></div>
//                 <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-purple-200 p-2 shadow-2xl overflow-hidden">
//                   {/* <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-full -mr-20 -mt-20 opacity-50"></div> */}
//                   <div className="aspect-square flex items-center justify-center rounded-2xl relative bg-black ">
//                     {/* <div className="aspect-square bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-8xl">
//                       💡
//                     </div> */}
//                     <img src="/images/logos/logo-innovative-dark.png" className=" text-8xl " />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Content */}
//             <div className="order-1 md:order-2">
//               <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900">About Us</h2>
//               <p className="text-lg text-slate-600 mb-4 leading-relaxed">
//                 Innovative Academy was born from a simple observation: students struggle not because they lack intelligence, but because they lack clarity of concepts and proper guidance.
//               </p>
//               <p className="text-lg text-slate-600 mb-4 leading-relaxed">
//                 Our founders, passionate educators with decades of combined experience, created this institute to bridge the gap between traditional education and modern learning needs. We believe in:
//               </p>
//               <ul className="space-y-3 mb-6">
//                 <li className="flex items-start gap-3">
//                   <Star size={20} className="text-purple-600 flex-shrink-0 mt-1" />
//                   <span className="text-slate-700"><strong>Deep Learning:</strong> Understanding concepts thoroughly, not just memorizing</span>
//                 </li>
//                 <li className="flex items-start gap-3">
//                   <Star size={20} className="text-purple-600 flex-shrink-0 mt-1" />
//                   <span className="text-slate-700"><strong>Curiosity First:</strong> Encouraging questions and critical thinking</span>
//                 </li>
//                 <li className="flex items-start gap-3">
//                   <Star size={20} className="text-purple-600 flex-shrink-0 mt-1" />
//                   <span className="text-slate-700"><strong>Holistic Growth:</strong> Building competitive mindset and life skills</span>
//                 </li>
//               </ul>
//               {/* <p className="text-lg text-slate-600 leading-relaxed">
//                 Today, we're helping hundreds of students excel in board exams, Olympiads, and competitive exams with our multi-format learning approach.
//               </p> */}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CEO/Founder Section */}
//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center text-slate-900">Meet Our Visionary</h2>

//           <div className="md:flex gap-8 items-center max-w-full px-4 mx-auto">
//             {/* CEO Image */}
//             <div className="hidden md:block md:max-w-2/5">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl blur-2xl opacity-60"></div>
//                 <div className="relative bg-white rounded-3xl border-2 border-purple-200 p-6 shadow-2xl">
                
//                   <p className="text-slate-900 text-xl bold italic mb-8">
//                   {/* "My mission is to prove that with the right approach, every student can excel. It's not about how smart you are, it's about how you learn." */}
//                   &#34;My mission is to help each students imporve, grow, and excel not only in exams but in life...&rdquo;
//                 </p>
//                 <div className="border-t border-gray-200 my-4"></div>
//                   <p className="text-purple-600 font-semibold text-3xl mb-2">Shaokatali Mujawar</p>
//                 <h3 className="text-xl font-bold text-slate-900 mb-3">Founder & CEO</h3>
//                 <p className="text-md text-slate-500 mb-4">Education | 20+ Years Experience | Professional Trainer | Service Provider to NAAC & many more colleges</p>

//                   {/* <div className="aspect-square bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-9xl">
//                     👨‍💼
//                   </div> */}
//                 </div>
//               </div>
//             </div>

//             {/* CEO Info */}
//             <div className="md:max-w-3/5">
//               <div className="bg-white border-2 border-purple-200 rounded-2xl p-6">
//                 {/* <p className="text-purple-600 font-semibold text-2xl mb-2">Shaokatali Mujawar</p>
//                 <h3 className="text-lg font-bold text-slate-900 mb-3">Founder & CEO</h3>
//                 <p className="text-sm text-slate-500 mb-4">Education | 20+ Years Experience | Professional Trainer | Service Provider to NAAC & many more colleges</p>

//                 <div className="border-t border-gray-200 my-4"></div> */}

//                 <p className="text-slate-700 text-sm mb-4 leading-relaxed">
//                   With over 20 years of experience in education and teachnology, our founder has provided software and hardware services to 25+ colleges, school, and hotel. Also he has been working in education field from past 20 years and is honour to conduct competitive exams like AMP Scholarship, and many more. And with the vision to transform how students learn, and to help each student grow and achieve concept clarity, academic excellence, confidence to participate in competitive exam, he has started Innovative Academy. Here studdents get guidance, confidence, clarity. Our teaching method is interesting, and focus on each students growth, we also help students study easily by making different methods to study. With all this we aso focus on life skills like communication, confidence, career guidance, and many more. And our Online App Platform helps each student to practice, analyse, improve and achieve.
//                 </p>

//                 <div className="space-y-3 mb-4">
//                    <div className="flex items-start gap-3">
//                     <Check size={20} className="text-purple-600 flex-shrink-0 mt-1" />
//                     <div>
//                       <p className="font-semibold text-slate-900">Worked with 5+ NAAC of Colleges and Peer Team</p>
//                       {/* <p className="text-sm text-slate-600">Prepared national-level achievers</p> */}
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <Check size={20} className="text-purple-600 flex-shrink-0 mt-1" />
//                     <div>
//                       <p className="font-semibold text-slate-900">Software and hardware services from past 20+ years</p>
//                       {/* <p className="text-sm text-slate-600">Mentored many students in thier career</p>
//                       <p className="text-sm text-slate-600">Conducted many competitive exams</p> */}
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <Check size={20} className="text-purple-600 flex-shrink-0 mt-1" />
//                     <div>
//                       <p className="font-semibold text-slate-900">Mentored many students in thier career</p>
//                       {/* <p className="text-sm text-slate-600">Prepared national-level achievers</p> */}
//                     </div>
//                   </div>

// {/* 
//                   <div className="flex items-start gap-3">
//                     <Check size={20} className="text-purple-600 flex-shrink-0 mt-1" />
//                     <div>
//                       <p className="font-semibold text-slate-900">Innovation in Education</p>
//                       <p className="text-sm text-slate-600">Creator of modern learning methods</p> 
//                     </div>
//                   </div> */}
//                 </div>

                
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Vision Section */}
//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Our Vision</h2>
//             <p className="text-slate-600 max-w-2xl mx-auto text-lg">
//               Building Board Toppers, Olympiad achievers, and Competitive Champions through deep conceptual clarity and curiosity-driven learning.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {/* Card 1 */}
//             <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg text-center justify-center">
//               <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center mb-4 text-3xl mx-auto">
//                 🧠
//               </div>
//               <h3 className="text-xl font-bold mb-3 text-slate-900">Concept Mastery</h3>
//               <p className="text-slate-600 leading-relaxed">
//                 Deep understanding of fundamentals, not rote learning. Why-based teaching that builds strong foundations.
//               </p>
//             </div>

//             {/* Card 2 */}
//             <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg  text-center justify-center">
//               <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center mb-4 text-3xl mx-auto">
//                 💡
//               </div>
//               <h3 className="text-xl font-bold mb-3 text-slate-900">Curiosity Mindset</h3>
//               <p className="text-slate-600 leading-relaxed">
//                 Curiosity-driven discussions and explorations. Encouraging questions and critical thinking at every step.
//               </p>
//             </div>

//             {/* Card 3 */}
//             <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg  text-center justify-center">
//               <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center mb-4 text-3xl mx-auto">
//                 🏆
//               </div>
//               <h3 className="text-xl font-bold mb-3 text-slate-900">Competitive Edge</h3>
//               <p className="text-slate-600 leading-relaxed">
//                 Exposure to competitive exam patterns and strategies. Mindset development for excellence in all areas.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Why Choose Us Section */}
//       <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center text-slate-900">Why Choose Innovative Academy?</h2>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {/* Feature 1 */}
//             <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
//                   📚
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-2 text-slate-900">Offline Classes</h3>
//                   <p className="text-slate-600 text-sm">Our main focus is offline learning with dedicated in-person sessions.</p>
//                 </div>
//               </div>
//             </div>

//             {/* Feature 2 */}
//             <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
//                   🎓
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-2 text-slate-900">Expert Teachers</h3>
//                   <p className="text-slate-600 text-sm">Each subject has specialized expert teachers passionate about students.</p>
//                 </div>
//               </div>
//             </div>

//             {/* Feature 3 */}
//             <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
//                   💬
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-2 text-slate-900">Doubt Resolution</h3>
//                   <p className="text-slate-600 text-sm">Direct interaction with subject experts for personalized doubt solving.</p>
//                 </div>
//               </div>
//             </div>

//             {/* Feature 4 */}
//             <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
//                   🎯
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-2 text-slate-900">All Exam Coverage</h3>
//                   <p className="text-slate-600 text-sm">CBSE, State Board, Olympiad & Competitive exams in one place.</p>
//                 </div>
//               </div>
//             </div>

//             {/* Feature 5 */}
//             <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
//                   👥
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-2 text-slate-900">Limited Batch Size</h3>
//                   <p className="text-slate-600 text-sm">Small batches for personalized attention and better outcomes.</p>
//                 </div>
//               </div>
//             </div>

//             {/* Feature 6 */}
//             <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
//                   💰
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold mb-2 text-slate-900">Affordable Premium</h3>
//                   <p className="text-slate-600 text-sm">Premium quality education at affordable prices for all.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Learning Ecosystem Section */}
//       <section id="app" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center text-slate-900">Our Learning Ecosystem</h2>

//           <div className="grid md:grid-cols-2 gap-12 items-center">
//             {/* Left Side - Features */}
//             <div className="space-y-4">
//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
//                   <Check size={16} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg mb-1 text-slate-900">5000–10000+ Question Bank</h3>
//                   <p className="text-slate-600">Comprehensive coverage of all topics with varying difficulty levels.</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
//                   <Check size={16} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg mb-1 text-slate-900">Live Classes + Offline Sessions</h3>
//                   <p className="text-slate-600">Flexible learning with both live online and in-person classes.</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
//                   <Check size={16} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg mb-1 text-slate-900">Weekly, Monthly & Quarterly Exams</h3>
//                   <p className="text-slate-600">Regular assessment to track progress and identify learning gaps.</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
//                   <Check size={16} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg mb-1 text-slate-900">Mastery Level System</h3>
//                   <p className="text-slate-600">Chapter-wise mastery tracking with clear progress indicators.</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
//                   <Check size={16} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg mb-1 text-slate-900">Points & Level Up System</h3>
//                   <p className="text-slate-600">Gamified learning to keep students motivated and engaged.</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-4">
//                 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
//                   <Check size={16} className="text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-lg mb-1 text-slate-900">Teacher Doubt Resolution</h3>
//                   <p className="text-slate-600">Direct interaction with subject experts for personalized help.</p>
//                 </div>
//               </div>
//             </div>

//             {/* Right Side - Highlight Card */}
//             <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden">
//               <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
//               <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -ml-30 -mb-30"></div>

//               <div className="relative">
//                 <div className="mb-8">
//                   <h3 className="text-3xl font-bold mb-4">Complete Learning Platform</h3>
//                   <p className="text-purple-100 leading-relaxed mb-8">
//                     Our integrated ecosystem combines interactive lessons, comprehensive question banks, and advanced analytics for 360-degree learning with full app access.
//                   </p>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
//                     <div className="font-semibold mb-1">📊 Performance Dashboard</div>
//                     <p className="text-sm text-purple-100">Real-time insights into progress and learning patterns.</p>
//                   </div>

//                   <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
//                     <div className="font-semibold mb-1">📝 Short Notes & Mind Maps</div>
//                     <p className="text-sm text-purple-100">Quick reference materials for effective revision.</p>
//                   </div>

//                   <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
//                     <div className="font-semibold mb-1">🎯 Expert Analysis</div>
//                     <p className="text-sm text-purple-100">Detailed performance analysis with personalized recommendations.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Revive - Success Stories Section */}
//       {/* <section id="revive" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-slate-900">Student Revive Stories</h2>
//           <p className="text-slate-600 text-center mb-16 text-lg">See how our students transformed their academic journey</p>

//           <div className="grid md:grid-cols-3 gap-8">
            
//             <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 hover:shadow-lg transition-all">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
//                   🌟
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-slate-900">Priya Sharma</h3>
//                   <p className="text-sm text-purple-600 font-semibold">Class 10</p>
//                 </div>
//               </div>
//               <p className="text-slate-700 mb-4 leading-relaxed">
//                 "Started with 45% in pre-board, now scoring 92% consistently. The concept-based approach really made a difference!"
//               </p>
//               <div className="flex gap-1">
//                 {[...Array(5)].map((_, i) => (
//                   <span key={i} className="text-yellow-400">⭐</span>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 hover:shadow-lg transition-all">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
//                   🚀
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-slate-900">Arjun Patel</h3>
//                   <p className="text-sm text-purple-600 font-semibold">Olympiad Achiever</p>
//                 </div>
//               </div>
//               <p className="text-slate-700 mb-4 leading-relaxed">
//                 "Qualified for national Olympiad! The doubt solving sessions and extra material helped me excel. Highly recommended!"
//               </p>
//               <div className="flex gap-1">
//                 {[...Array(5)].map((_, i) => (
//                   <span key={i} className="text-yellow-400">⭐</span>
//                 ))}
//               </div>
//             </div>

           
//             <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 hover:shadow-lg transition-all">
//               <div className="flex items-center gap-4 mb-4">
//                 <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
//                   🎯
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-slate-900">Diya Verma</h3>
//                   <p className="text-sm text-purple-600 font-semibold">Board Topper</p>
//                 </div>
//               </div>
//               <p className="text-slate-700 mb-4 leading-relaxed">
//                 "Improved from 58% to 96% in just 6 months! The personalized attention and structured approach made all the difference."
//               </p>
//               <div className="flex gap-1">
//                 {[...Array(5)].map((_, i) => (
//                   <span key={i} className="text-yellow-400">⭐</span>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="mt-12 bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-300 rounded-2xl p-8 text-center">
//             <p className="text-slate-700 text-lg font-semibold mb-4">
//               "Revive Your Grades, Rebuild Your Confidence" - Join 500+ successful students already transforming their academic journey
//             </p>
//             <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all">
//               Start Your Revive Journey
//             </button>
//           </div>
//         </div>
//       </section> */}

//       {/* Pricing Section */}
//       <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-slate-900">Simple, Transparent Pricing</h2>
//           <p className="text-slate-600 text-center mb-16 text-lg">Choose what works best for you</p>

            

//               {/* Welcome Kit
//               <div className="border-t-2 border-gray-200 pt-6">
//                 <p className="text-sm font-semibold text-purple-600 mb-3">🎁 Welcome Kit Included:</p>
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">✏️</span>
//                     <span className="text-sm text-slate-700">Quality Pens Set (5 pcs)</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">📓</span>
//                     <span className="text-sm text-slate-700">Premium Writing Pad</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">👕</span>
//                     <span className="text-sm text-slate-700">Academy T-Shirt</span>
//                   </div>
//                 </div>
//               </div> */}
            
//           <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8 mb-12 ">
//           {/* App Only Plan */}
//             <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-400 transition-all hover:shadow-lg mb-6">
//               <div className="mb-6">
//                 <h3 className="text-2xl font-bold mb-2 text-slate-900">App Only Plan</h3>
//                 <p className="text-slate-600 text-sm">Full App Access + Doubt Help</p>
//               </div>

//               <div className="mb-8">
//                 <span className="text-5xl font-bold text-slate-900">₹1499<sup>*</sup></span>
//                 <span className="text-slate-600 ml-2">per year</span>
//                 <div className="text-sm text-purple-600 font-semibold mt-2">Only ₹125/month</div>
//               </div>

//               {/* <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all hover:shadow-lg mb-8">
//                 Explore App
//               </button> */}

//               <div className="space-y-4 mb-6">
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Complete app access</span>
//                 </div>
                
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">10000+ question bank</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Multiple Practice tests</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Online Teacher doubt help</span>
//                 </div>
               
//                   <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Smart Dashboard + Analysis</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Study Material</span>
//                 </div>
//               </div>
//               </div>
//             {/* Monthly Plan */}
//             <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-400 transition-all hover:shadow-lg mb-6">
//               <div className="mb-6">
//                 <h3 className="text-2xl font-bold mb-2 text-slate-900">Monthly Plan</h3>
//                 <p className="text-slate-600 text-sm">Classes + App Access</p>
//               </div>

//               <div className="mb-8">
//                 <span className="text-5xl font-bold text-slate-900">₹1299<sup>*</sup></span>
//                 <span className="text-slate-600 ml-2">per month</span>
//               </div>

//               {/* <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all hover:shadow-lg mb-8">
//                 Get Started
//               </button> */}

//               <div className="space-y-4 mb-6">
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Daily classes</span>
//                 </div>
//                                <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Online + Offline</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">1 on 1 Mentorship And Teaching</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Full app access</span>
//                 </div>
//                   <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">Study Material</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">10000+ question bank</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="text-purple-600 flex-shrink-0" />
//                   <span className="text-slate-700">All exams covered</span>
//                 </div>
               
//               </div>

//               {/* Welcome Kit
//               <div className="border-t-2 border-gray-200 pt-6">
//                 <p className="text-sm font-semibold text-purple-600 mb-3">🎁 Welcome Kit Included:</p>
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">📓</span>
//                     <span className="text-sm text-slate-700">Premium Writing Pad</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">✏️</span>
//                     <span className="text-sm text-slate-700">Quality Pens Set (5 pcs)</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">👕</span>
//                     <span className="text-sm text-slate-700">Academy T-Shirt</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">📚</span>
//                     <span className="text-sm text-slate-700">Study Guide & Tips Sheet</span>
//                   </div>
//                 </div>
//               </div> */}
          
//             </div>


//             {/* Yearly Plan - Highlighted */}
//             <div className="bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400 rounded-2xl p-8 transform md:scale-105 relative text-white shadow-xl mb-6">
//               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//                 <span className="bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
//                   Best Offer
//                 </span>
//               </div>

//               <div className="mb-6">
//                 <h3 className="text-2xl font-bold mb-2">Yearly Plan</h3>
//                 <p className="text-purple-100 text-sm">Classes + App (Save ₹2598)</p>
//               </div>

//               <div className="mb-8">
//                 <span className="text-5xl font-bold">12999<sup>*</sup></span>
//                 <span className="text-purple-100 ml-2">per year</span>
//                 <div className="text-sm text-purple-200 mt-2">Only ₹1083/month</div>
//               </div>
// {/* 
//               <button className="w-full px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all mb-8 font-bold">
//                 Start Your Journey
//               </button> */}

//               <div className="space-y-4 mb-6">
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="flex-shrink-0" />
//                   <span>Daily classes</span>
//                 </div>
                 
          
//                <div className="flex items-center gap-3">
//                   <Check size={20} className="flex-shrink-0" />
//                   <span className="">1 on 1 Mentorship And Teaching</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="flex-shrink-0" />
//                   <span>Full app access</span>
//                 </div>
//                      <div className="flex items-center gap-3">
//                   <Check size={20} className="flex-shrink-0" />
//                   <span>Study Material</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="flex-shrink-0" />
//                   <span>10000+ question bank</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Check size={20} className="flex-shrink-0" />
//                   <span>All exams covered</span>
//                 </div>
            
//               </div>

//               {/* Welcome Kit
//               <div className="border-t-2 border-purple-400 pt-6">
//                 <p className="text-sm font-semibold text-purple-200 mb-3">🎁 Premium Welcome Kit Included:</p>
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">📓</span>
//                     <span className="text-sm">Premium Writing Pad (Set of 2)</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">✏️</span>
//                     <span className="text-sm">Quality Pens Set (10 pcs)</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">👕</span>
//                     <span className="text-sm">Academy T-Shirt (Premium Quality)</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">📚</span>
//                     <span className="text-sm">Complete Study Guide & Tips</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg">🎒</span>
//                     <span className="text-sm">Branded Academy Bag</span>
//                   </div>
//                 </div>
//               </div>*/}
//             </div> 
//           </div>

//           {/* School Plans */}
//           <div className="bg-white border-2 border-purple-200 rounded-2xl p-8">
//             <h3 className="text-2xl font-bold mb-4 text-slate-900">For Schools & Institutions</h3>
//             <p className="text-slate-600 mb-6">We offer specialized plans for educational institutions.</p>

//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 transition-all">
//                 <h4 className="text-xl font-semibold mb-3 text-slate-900">Full App Usage Plan</h4>
//                 <p className="text-slate-600 mb-4">Provide complete app access to your students for self-learning and practice.</p>
//                 <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
//                   Contact for Details
//                 </button>
//               </div>

//               <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 transition-all">
//                 <h4 className="text-xl font-semibold mb-3 text-slate-900">Teaching + App Plan</h4>
//                 <p className="text-slate-600 mb-4">Complete solution with our expert teachers and comprehensive app platform.</p>
//                 <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
//                   Contact for Details
//                 </button>
//               </div>
//             </div>
//           </div>

//           <p className="text-center text-slate-600 mt-12 text-sm">
//             All student plans include offline sessions access. Cancel anytime. School plans include customization options.
//           </p>
//         </div>
//       </section>


//       {/* Contact Section */}
//       <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-slate-900">Get in Touch</h2>
//           <p className="text-slate-600 text-center mb-16 text-lg">Have questions? We&rsquo;d love to hear from you!</p>

// <div className="space-y-10 mb-12">

//   {/* Google Map */}
//   <div className="w-full h-[380px] rounded-2xl overflow-hidden border-2 border-purple-200 shadow-sm">
//     <iframe
//       src="https://www.google.com/maps?q=Vedika%20Heights%20Miraj%20Shivaji%20Road%20Near%20HDFC%20Bank&output=embed"
//       width="100%"
//       height="100%"
//       style={{ border: 0 }}
//       loading="lazy"
//       className="w-full h-full"
//     />
//   </div>

//   {/* Contact Cards */}
//   <div className="grid md:grid-cols-3 gap-8">

//     {/* Location */}
//     <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
//       <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//         <MapPin size={32} className="text-purple-600" />
//       </div>

//       {/* <h3 className="text-xl font-bold mb-2 text-slate-900">Location</h3> */}

//       <p className="text-slate-700 font-semibold">
//         2nd floor, Vedika Heights, Near HDFC Bank, Hira Hotel Choke, Shivaji Road, Miraj
//       </p>

//       <p className="text-slate-600 text-sm mt-2">
//         Visit us at our center
//       </p>
//     </div>

//     {/* Email */}
//     <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
//       <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//         <Mail size={32} className="text-purple-600" />
//       </div>

//       {/* <h3 className="text-xl font-bold mb-2 text-slate-900">Email</h3> */}

//       {/* <p className="text-slate-700 break-all font-semibold">
//         innovative.enlightenment@gmail.com
//       </p> */}

//       <p className="text-slate-700 break-all font-semibold">
//         team@innovativeacademy.org.in
//       </p>

//       <p className="text-slate-700 break-all font-semibold">
//         support@innovativeacademy.org.in
//       </p>

//       <p className="text-slate-600 text-sm mt-2">
//         We respond within 24 hours
//       </p>
//     </div>

//     {/* Phone */}
//     <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
//       <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//         <Phone size={32} className="text-purple-600" />
//       </div>

//       {/* <h3 className="text-xl font-bold mb-2 text-slate-900">Phone</h3> */}

//       <p className="text-slate-700 font-semibold">
//         +91-(94215-67466)
//       </p>

//       <p className="text-slate-700 font-semibold">
//         +91-(93350-92358)
//       </p>

//       <p className="text-slate-600 text-sm mt-2">
//         10 AM - 7 PM
//       </p>
//     </div>

//   </div>

// </div>
//           {/* <div className="grid md:grid-cols-3 gap-8 mb-12">
          
           
//             <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
//               <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Mail size={32} className="text-purple-600" />
//               </div>
//               <h3 className="text-xl font-bold mb-2 text-slate-900">Email</h3>
//               <p className="text-slate-700 break-all font-semibold">innovative.enlightenment@gmail.com</p>
//                <p className="text-slate-700 break-all font-semibold"> team@innovativeacademy.org.in</p>
                 
//                 <p className="text-slate-700 break-all font-semibold">support@innovativeacademy.org.in</p>
                  
//               <p className="text-slate-600 text-sm mt-2">We respond within 24 hours</p>
//             </div>

           
//             <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
//               <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Phone size={32} className="text-purple-600" />
//               </div>
//               <h3 className="text-xl font-bold mb-2 text-slate-900">Phone</h3>
//               <p className="text-slate-700 font-semibold">+91-(94215-67466)</p>
//                <p className="text-slate-700 font-semibold">+91-(93350-92358)</p>
//               <p className="text-slate-600 text-sm mt-2">9 AM - 9 PM</p>
//             </div>

            
//             <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
//               <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <MapPin size={32} className="text-purple-600" />
//               </div>
//               <h3 className="text-xl font-bold mb-2 text-slate-900">Location</h3>
//               <p className="text-slate-700 font-semibold">2nd floor, Vedika Heights, Near HDFC Bank, Hira Hotel Choke, Shivaji Road, Miraj</p>
//               <p className="text-slate-600 text-sm mt-2">Visit us at our center</p>
//             </div>
//           </div> */}

//           {/* Contact Form
//           <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8">
//             <h3 className="text-2xl font-bold mb-6 text-slate-900">Send us a Message</h3>
//             <form className="space-y-4">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <input
//                   type="text"
//                   placeholder="Your Name"
//                   className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
//                 />
//                 <input
//                   type="email"
//                   placeholder="Your Email"
//                   className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
//                 />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Subject"
//                 className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
//               />
//               <textarea
//                 placeholder="Your Message"
//                 rows={5}
//                 className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
//               />
//               <button
//                 type="submit"
//                 className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all hover:shadow-lg"
//               >
//                 Send Message
//               </button>
//             </form>
//           </div> */}
//         </div>
//       </section>

//       {/* CTA Section
//       <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800">
//         <div className="max-w-3xl mx-auto text-center text-white">
//           <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Build a Competitive Mindset?</h2>
//           <p className="text-lg mb-8 leading-relaxed text-purple-100">
//             Join hundreds of students already excelling in board exams, Olympiads, and competitive exams with Innovative Academy.
//           </p>
//           <button className="px-10 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
//             Join Innovative Academy Today
//           </button>
//         </div>
//       </section> */}

//       {/* Footer */}
//       <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-6xl mx-auto">
//           <div className="grid md:grid-cols-3 gap-12 mb-12">
//             {/* Column 1 - About */}
//             <div>
//               <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                
//   <img src="/images/logos/logo-innovative-dark.png" className='w-70'/>
//               </h3>
//               <p className="text-gray-400 text-sm leading-relaxed">
//                 Building Board Toppers, Olympiad achievers, and Competitive Champions through deep conceptual clarity and curiosity-driven learning.
//               </p>
//             </div>

//             {/* Column 2 - Programs */}
//             <div>
//               <h3 className="text-lg font-bold mb-4">Programs</h3>
//               <ul className="space-y-2 text-gray-400 text-sm">
//                 <li>
//                   <a href="#" className="hover:text-purple-400 transition-colors">Class 8 Foundation</a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-purple-400 transition-colors">Class 9 Foundation</a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-purple-400 transition-colors">Class 10 Foundation</a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-purple-400 transition-colors">School Plans</a>
//                 </li>
//               </ul>
//             </div>

//             {/* Column 3 - Contact */}
//             <div>
//               <h3 className="text-lg font-bold mb-4">Contact</h3>
//               <div className="space-y-3 text-gray-400 text-sm">
//                 <p>
//                   <span className="font-semibold text-white">Email:</span><br />
//                   innovative.enlightenment@gmail.com
//                   <br />
//                   team@innovativeacademy.org.in
//                    <br />
//                   support@innovativeacademy.org.in
//                 </p>
//                 <p>
//                   <span className="font-semibold text-white">Phone:</span><br />
//                   +91 (94215-67466)
//                   <br />
//                   +91-(93350-92358)
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="border-t border-slate-700 pt-8">
//             <p className="text-center text-gray-500 text-sm">
//               © 2026 Innovative Academy. All rights reserved. | Helping students for CBSE, State Board, Olympiad & Competitive Exams.
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// // 'use client'

// // // import { useUser } from "@clerk/nextjs";
// // import { Suspense, useEffect, useState } from "react";
// // import ContactSection from "./components/ContactSection";
// // import ExamsSection from "./components/ExamsSection";
// // import FeaturesSection from "./components/FeaturesSection";
// // import Footer from "./components/Footer";
// // import HeroSection from "./components/HeroSection";
// // import Navbar from "./components/Navbar";
// // import PricingSection from "./components/PricingSection";
// // import TestimonialsSection from "./components/TestimonialsSection";
// // import { Box } from "@mui/material";
// // import Loading from "../loading";
// // import { redirect, useRouter } from "next/navigation";
// // // import "./landing.css";
// // import SubscriptionPage from "./components/SubscriptionPage"
// // import WhyUs from "./components/WhyUs"
// // import { VolumeX, Volume2 } from "lucide-react";
// // import axios from "axios";

// // // Simple skeleton loader for video
// // function VideoSkeleton() {
// //   return (
// //     <div className="w-full h-full flex items-center justify-center bg-gray-200 animate-pulse">
// //       <span className="text-gray-500">Loading video...</span>
// //     </div>
// //   );
// // }

// // export default function Home() {
// //   const router = useRouter()
// //   // const [isLoading, setIsLoading] = useState(true)
// // // const [user,setUser]=useState({username:"",_id:""})


// // //   useEffect(() => {
// // //     async function fetchUser() {
// // //       try {
// // //         const res = await fetch("/api/auth/Get-Current-User", { method: "GET" });
// // //         const data = await res.json();

// // //         if (data?.success && data.user) {

// // //           setUser(data.user);
// // //         } else {
// // //           router.push("/login");
// // //         }
// // //       } catch (err) {
// // //         console.error("Auth check failed:", err);
// // //         router.push("/login");
// // //       } finally {
// // //         setIsLoading(false);
// // //       }
// // //     }

// // //     fetchUser();
// // //   }, [router]);

// //   // useEffect(() => {
// //   //   if (!isLoaded) return; // Wait until Clerk has finished loading

// //   //   setIsLoading(false);

// //   //   if (isSignedIn) {
// //   //     fetch("/api/Save-User/", { method: "POST" });
// //   //     // router.push("/dashboard")

// //   //   }
// //   // }, [isSignedIn, isLoaded]);

// // //   useEffect(() => {

// // //   setIsLoading(false);

// // //   if (user?.username) {
// // //     fetch("/api/Save-User/", { method: "POST",body:JSON.stringify({ userId: user?._id }), });

// // //   }
// // // }, [user]);
// // // useEffect(()=>{
// // //   if (user?.username) {
// // //   console.log(user?.username)
// // //   }
// // //    async function fetchData() {
// // //         const res = await fetch(`/api/Fetch-Users`);
// // //       const data=await res.json()
// // //         console.log(data)
// // //       }
// // //       setTimeout(()=>{

// // //         fetchData()
// // //       },2000)
// // // },[])
// //   // if (isLoading) {
// //   //   return <Loading />
// //   // }

// //   return (
// //     <Box
// //       sx={{
// //         minHeight: '100vh',
// //         bgcolor: 'background.default',
// //         color: 'text.primary'
// //       }}
// //     >
// //       <Box
// //         className={`hidden sm:block w-full text-center p-1 font-medium transition-colors duration-500 ${"bg-slate-900 text-yellow-800 tracking-wide"
// //           }`}
// //       >
// //         <div className="  text-center w-full justify-center gap-4 items-center hidden sm:flex">
// //           <h1 className="bg-slate-900 p-2 pl-1 font-bold text-xl text-yellow-500 text-shadow-pink-50 tracking-wider ">🎉 Special Offer </h1>  <h2 className=" p-1 font-bold text-sn text-amber-100">Practice with Purpose. Perform with Confidence — Enroll Today!</h2> <h2 className="border-3 border-amber-50 bg-green-600 p-2 font-bold rounded-2xl text-white"> 20% off </h2><h1 className="ml-28 text-xl text-white font-bold"> | Speak to us | 9335092385</h1>

// //         </div>

// //       </Box>
// // {/* <Box className="w-full bg-slate-900 p-2 sticky top-0 z-50">
// //   <div className="flex justify-center items-center gap-6 text-sm font-medium">

// //     <h1 className="text-yellow-500 font-bold text-lg">
// //       🎉 Start Learning Smarter
// //     </h1>

// //     <span className="text-amber-100">
// //       Practice • Test • Improve
// //     </span>

// //     <a
// //       href="/signup"
// //       className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-full font-bold transition-all duration-300"
// //     >
// //       Start Free Trial →
// //     </a>

// //     <span className="text-white font-semibold ml-6">
// //       📞 Contact: <span className="text-amber-300">9421567466</span>
// //     </span>

// //   </div>
// // </Box> */}


// //       <Navbar />
// //       <Box component="main">

// //         <HeroSection />
// //         <WhyUs />
// //         <FeaturesSection />
// //         {/* <ExamsSection /> */}
// //         <SubscriptionPage />
// //         {/* <PricingSection /> */}
// //         <TestimonialsSection />
// //         <ContactSection />
// //         <div

// //           className=" rounded-lg fixed shadow-lg hidden sm:block overflow-hidden left-5 bottom-4"
// //           style={{ width: "230px", height: "130px" }}
// //         >
// //           <Suspense fallback={<VideoSkeleton />}>
// // <iframe
// //   src="https://www.youtube.com/embed/s97oMJe5pYY?autoplay=1&mute=1&loop=1&playlist=s97oMJe5pYY"
// //   title="Shayan Ali’s Impressive Science Exhibition Project | Class 7 Student Presentation"
// //   frameBorder="0"
// //   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
// //   referrerPolicy="strict-origin-when-cross-origin"
// //   allowFullScreen
// //   className="w-full h-full"
// // />


// //             {/* allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"  */}
// //             {/* <iframe width="640" height="360" src="https://www.youtube.com/embed/s97oMJe5pYY" title="&quot;Shayan Ali’s Impressive Science Exhibition Project | Class 7 Student Presentation&quot;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}
// //             {/* <track
// //         src="/path/to/captions.vtt"
// //         kind="subtitles"
// //         srcLang="en"
// //         label="English"
// //       /> */}
// //             {/* Your browser does not support the video tag.
// //     </video> */}
// //           </Suspense>
// //         </div>
// //       </Box>
// //       <Footer />
// //     </Box>
// //   );
// // }



// export default function Home() {
//   return (
//     <main className="font-sans text-gray-900">

//       {/* ================= HERO SECTION ================= */}
//       <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-24 px-6 md:px-20 text-center">
//         <h1 className="text-4xl md:text-6xl font-bold leading-tight">
//           Build Strong Foundation.<br />
//           Become a Board Topper.
//         </h1>

//         <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto">
//           Concept Clarity • Competitive Mindset • Curiosity Learning  
//           For Class 8, 9 & 10 Students
//         </p>

//         <div className="mt-10 flex flex-col md:flex-row justify-center gap-6">
//           <button className="bg-white text-blue-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100">
//             Join Now
//           </button>
//           <button className="border border-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800">
//             Learn More
//           </button>
//         </div>
//       </section>


//       {/* ================= VISION ================= */}
//       <section className="py-20 bg-gray-50 px-6 md:px-20 text-center">
//         <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
//         <p className="max-w-4xl mx-auto text-lg text-gray-700">
//           Innovative Academy focuses on creating Board Toppers, Olympiad Achievers,
//           and Competitive Champions by building strong conceptual foundation and
//           curiosity-driven thinking.
//         </p>
//       </section>


//       {/* ================= WHY US ================= */}
//       <section className="py-20 px-6 md:px-20 bg-white">
//         <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

//           <div className="p-6 rounded-2xl shadow">
//             <h3 className="text-xl font-semibold mb-3">Concept Mastery</h3>
//             <p className="text-gray-600">
//               Deep understanding of every topic for Boards, Olympiads & Competitive Exams.
//             </p>
//           </div>

//           <div className="p-6 rounded-2xl shadow">
//             <h3 className="text-xl font-semibold mb-3">Limited Batch Size</h3>
//             <p className="text-gray-600">
//               Special attention with small batches and personal guidance.
//             </p>
//           </div>

//           <div className="p-6 rounded-2xl shadow">
//             <h3 className="text-xl font-semibold mb-3">Online + Offline + App</h3>
//             <p className="text-gray-600">
//               Daily live classes, smart board classrooms & gamified learning app.
//             </p>
//           </div>

//         </div>
//       </section>


//       {/* ================= LEARNING SYSTEM ================= */}
//       <section className="py-20 bg-gray-50 px-6 md:px-20">
//         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

//           <div>
//             <h2 className="text-4xl font-bold mb-6">
//               Complete Learning Ecosystem
//             </h2>

//             <ul className="space-y-4 text-gray-700 text-lg">
//               <li>✔ 5000 – 10000+ Question Bank</li>
//               <li>✔ Weekly / Monthly / Quarterly Exams</li>
//               <li>✔ Mastery Level System (Chapter & Question Level)</li>
//               <li>✔ Points & Level Up Gamification</li>
//               <li>✔ Short Notes, Mind Maps & Formula Sheets</li>
//               <li>✔ Time Management & Exam Tips</li>
//               <li>✔ Competitive & Curiosity Mindset Training</li>
//             </ul>
//           </div>

//           <div className="bg-blue-600 text-white p-10 rounded-2xl shadow-lg">
//             <h3 className="text-2xl font-bold mb-4">What Makes Us Different?</h3>
//             <p>
//               We don't just teach syllabus.  
//               We build thinking ability, confidence, exam strategy,
//               and life improvement skills.
//             </p>
//           </div>

//         </div>
//       </section>


//       {/* ================= PRICING ================= */}
//       <section className="py-20 bg-white px-6 md:px-20 text-center">
//         <h2 className="text-4xl font-bold mb-4">Foundation Program Pricing</h2>
//         <p className="text-gray-600 mb-16">
//           Affordable Premium Education for Class 8, 9 & 10
//         </p>

//         <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

//           {/* Monthly */}
//           <div className="border rounded-2xl p-10 shadow hover:shadow-xl transition">
//             <h3 className="text-2xl font-bold mb-4">Monthly Plan</h3>
//             <p className="text-5xl font-bold mb-6">
//               ₹800<span className="text-lg">/month</span>
//             </p>

//             <ul className="text-left space-y-3 text-gray-700 mb-8">
//               <li>✔ Daily Classes</li>
//               <li>✔ App Access</li>
//               <li>✔ Exams & Analysis</li>
//               <li>✔ Study Materials</li>
//               <li>✔ Limited Batch Attention</li>
//             </ul>

//             <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
//               Enroll Now
//             </button>
//           </div>


//           {/* Yearly */}
//           <div className="border-2 border-blue-600 rounded-2xl p-10 shadow-lg relative">
//             <span className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm rounded-bl-xl">
//               Best Value
//             </span>

//             <h3 className="text-2xl font-bold mb-4">Yearly Plan</h3>
//             <p className="text-5xl font-bold mb-6">
//               ₹9000<span className="text-lg">/year</span>
//             </p>

//             <ul className="text-left space-y-3 text-gray-700 mb-8">
//               <li>✔ Full Year Structured Program</li>
//               <li>✔ Special Performance Tracking</li>
//               <li>✔ Competitive Training</li>
//               <li>✔ Seminars & Events</li>
//               <li>✔ Smart Board Classroom</li>
//             </ul>

//             <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
//               Get Full Access
//             </button>
//           </div>

//         </div>
//       </section>


//       {/* ================= CTA ================= */}
//       <section className="py-20 bg-blue-600 text-white text-center px-6">
//         <h2 className="text-4xl md:text-5xl font-bold mb-6">
//           Ready to Build a Competitive Mindset?
//         </h2>

//         <p className="text-lg md:text-xl mb-10">
//           Join Innovative Academy and start your journey toward excellence.
//         </p>

//         <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100">
//           Join Now
//         </button>
//       </section>


//       {/* ================= FOOTER ================= */}
//       <footer className="bg-gray-900 text-gray-300 py-12 px-6 md:px-20">
//         <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

//           <div>
//             <h3 className="text-2xl font-bold text-white mb-4">
//               Innovative Academy
//             </h3>
//             <p className="text-sm">
//               Building Board Toppers & Competitive Champions through
//               Concept Clarity and Curiosity Mindset.
//             </p>
//           </div>

//           <div>
//             <h4 className="text-white font-semibold mb-4">Programs</h4>
//             <ul className="space-y-2 text-sm">
//               <li>Class 8 Foundation</li>
//               <li>Class 9 Foundation</li>
//               <li>Class 10 Foundation</li>
//             </ul>
//           </div>

//           <div>
//             <h4 className="text-white font-semibold mb-4">Contact</h4>
//             <p className="text-sm">Offline + Online Live Classes</p>
//             <p className="text-sm">Limited Batch Size</p>
//             <p className="text-sm mt-4">
//               © {new Date().getFullYear()} Innovative Academy
//             </p>
//           </div>

//         </div>
//       </footer>

//     </main>
//   );
// }


"use client"
import { useState, useEffect } from 'react';
import { Menu, X, Check, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Play, Star } from 'lucide-react';

import "./new/global_landing.css"
import { useRouter } from 'next/navigation';


export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);


  const router=useRouter()
  const slides = [
    {
      headline: "Build Strong Concepts.",
      subline: "Become a Board Topper.",
      desc: "Foundation for Olympiads, Competitive Exams & Academic Excellence",
      img:"/slides/1.jpg"
    },
    {
      headline: "Master Every Subject.",
      subline: "Learn from Expert Teachers.",
      desc: "Each subject taught by specialized experts dedicated to your success",
      img:"/slides/2.webp"
    },
    {
      headline: "Prepare for Everything.",
      subline: "CBSE • State Board • Olympiad • Competitive Exams.",
      desc: "Comprehensive preparation covering all major exams in one platform",
      img:"/slides/3.jpg"
    },
    {
      headline: "Double Your Confidence.",
      subline: "Live Classes + Offline Sessions + App Learning.",
      desc: "Multi-format learning with personalized doubt resolution",
      img:"/slides/4.jpg"
    }
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

  <img src="/images/logos/logo.png" className='w-70'/>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                Home
              </a>
              <a href="#about" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                About
              </a>
              <a href="#programs" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                Programs
              </a>
              <a href="#app" className="text-slate-700 hover:text-purple-600 transition-colors text-sm font-medium">
                App
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
              <button onClick={()=>router.push("/login")} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors">
                Sign In
              </button>
              <button onClick={()=>router.push("/signup")} className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                Sign Up
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
              <a href="#home" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Home
              </a>
              <a href="#about" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                About
              </a>
              <a href="#programs" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Programs
              </a>
              <a href="#app" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                App
              </a>
              <a href="#revive" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Revive
              </a>
              <a href="#pricing" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Pricing
              </a>
              <a href="#contact" className="block px-4 py-2 text-slate-700 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors">
                Contact
              </a>
              <div className="flex gap-2 pt-4">
                <button onClick={()=>router.push("/login")} className="flex-1 px-4 py-2 text-sm font-semibold text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                  Sign In
                </button>
                <button onClick={()=>router.push("/signup")} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Slider */}
      <section id="home" className="relative py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold border border-purple-200">
                  ✨ Premium Learning Platform
                </span>
              </div>

              {/* Slider Content */}
              <div className="">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 leading-tight text-slate-900 animate-slide-up min-h-40">
                  {slides[currentSlide].headline}<br /> {slides[currentSlide].subline}
                </h1>

                <p className="text-sm sm:text-lg text-slate-600 mb-8 leading-relaxed animate-slide-up">
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
                  className="p-2 bg-gray-200 hover:bg-purple-600 text-slate-700 hover:text-white rounded-full transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2 items-center">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-purple-600 w-6' : 'bg-gray-300'
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
                <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-3xl overflow-hidden  border border-purple-200  shadow-2xl">
                  {/* <div className="aspect-square bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center  text-6xl animate-scale-in">
                    📚
                  </div> */}
                  <img src={slides[currentSlide].img} className="rounded-3xl flex items-center justify-center  animate-scale-in p-2 w-280" />
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
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Visual */}
            <div className="order-2 md:order-1 md:max-w-md max-w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-purple-200 p-2 shadow-2xl overflow-hidden">
                  {/* <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 rounded-full -mr-20 -mt-20 opacity-50"></div> */}
                  <div className="aspect-square flex items-center justify-center rounded-2xl relative bg-black ">
                    {/* <div className="aspect-square bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-8xl">
                      💡
                    </div> */}
                    <img src="/images/logos/logo-innovative-dark.png" className=" text-8xl " />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="order-1 md:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-900">About Us</h2>
              <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                Innovative Academy was born from a simple observation: students struggle not because they lack intelligence, but because they lack clarity of concepts and proper guidance.
              </p>
              <p className="text-lg text-slate-600 mb-4 leading-relaxed">
                Our founders, passionate educators with decades of combined experience, created this institute to bridge the gap between traditional education and modern learning needs. We believe in:
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Star size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-slate-700"><strong>Deep Learning:</strong> Understanding concepts thoroughly, not just memorizing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-slate-700"><strong>Curiosity First:</strong> Encouraging questions and critical thinking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-slate-700"><strong>Holistic Growth:</strong> Building competitive mindset and life skills</span>
                </li>
              </ul>
              {/* <p className="text-lg text-slate-600 leading-relaxed">
                Today, we're helping hundreds of students excel in board exams, Olympiads, and competitive exams with our multi-format learning approach.
              </p> */}
            </div>
          </div>
        </div>
      </section>

      {/* CEO/Founder Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center text-slate-900">Meet Our Visionary</h2>

             <div className="md:flex gap-8 items-center max-w-full px-4 mx-auto">
            {/* CEO Image */}
            <div className="hidden md:block md:max-w-2/5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl blur-2xl opacity-60"></div>
                <div className="relative bg-white rounded-3xl border-2 border-purple-200 p-6 shadow-2xl">
                
                <img src="/images/abbu2.png" className='m-auto border-4 rounded-full max-w-60 max-h-60' />
                <div className="border-t border-gray-200 my-4"></div>
                  <p className="text-slate-900 text-xl bold italic mb-8">
                  {/* "My mission is to prove that with the right approach, every student can excel. It's not about how smart you are, it's about how you learn." */}
                  &#34;My mission is to help each students imporve, grow, and excel not only in exams but in life...&rdquo;
                </p>
                </div>
              </div>
            </div>

            {/* CEO Info */}
            <div className="md:max-w-3/5">
              <div className="bg-white border-2 border-purple-200 rounded-2xl p-6">
                {/* <p className="text-purple-600 font-semibold text-2xl mb-2">Shokatali Mujawar</p>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Founder & CEO</h3>
                <p className="text-sm text-slate-500 mb-4">Education | 20+ Years Experience | Professional Trainer | Service Provider to NAAC & many more colleges</p>

                <div className="border-t border-gray-200 my-4"></div> */}
  <p className="text-purple-600 font-semibold text-2xl mb-2">Shokatali Mujawar</p>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Founder & CEO</h3>
                 <p className="text-md text-slate-500 mb-4">Education | 20+ Years Experience | Professional Trainer | Service Provider to NAAC & many more colleges</p>

                  {/* <div className="aspect-square bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-9xl">
                    👨‍💼
                  </div> */}
                    <div className="border-t border-gray-200 my-4"></div>
                <p className="text-slate-700 text-sm mb-4 leading-relaxed">
                  With over 20 years of experience in education and teachnology, our founder has provided software and hardware services to 25+ colleges, school, and hotel. Also he has been working in education field from past 20 years and is honour to conduct competitive exams like AMP Scholarship, and many more. And with the vision to transform how students learn, and to help each student grow and achieve concept clarity, academic excellence, confidence to participate in competitive exam, he has started Innovative Academy. Here studdents get guidance, confidence, clarity. Our teaching method is interesting, and focus on each students growth, we also help students study easily by making different methods to study. With all this we aso focus on life skills like communication, confidence, career guidance, and many more. And our Online App Platform helps each student to practice, analyse, improve and achieve.
                </p>

                <div className="space-y-3 mb-4">
                   <div className="flex items-start gap-3">
                    <Check size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Worked with 5+ NAAC of Colleges and Peer Team</p>
                      {/* <p className="text-sm text-slate-600">Prepared national-level achievers</p> */}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Software and hardware services from past 20+ years</p>
                      {/* <p className="text-sm text-slate-600">Mentored many students in thier career</p>
                      <p className="text-sm text-slate-600">Conducted many competitive exams</p> */}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Mentored many students in thier career</p>
                      {/* <p className="text-sm text-slate-600">Prepared national-level achievers</p> */}
                    </div>
                  </div>

{/* 
                  <div className="flex items-start gap-3">
                    <Check size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">Innovation in Education</p>
                      <p className="text-sm text-slate-600">Creator of modern learning methods</p> 
                    </div>
                  </div> */}
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Our Vision</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Building Board Toppers, Olympiad achievers, and Competitive Champions through deep conceptual clarity and curiosity-driven learning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg text-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center mb-4 text-3xl mx-auto">
                🧠
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Concept Mastery</h3>
              <p className="text-slate-600 leading-relaxed">
                Deep understanding of fundamentals, not rote learning. Why-based teaching that builds strong foundations.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg  text-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center mb-4 text-3xl mx-auto">
                💡
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Curiosity Mindset</h3>
              <p className="text-slate-600 leading-relaxed">
                Curiosity-driven discussions and explorations. Encouraging questions and critical thinking at every step.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg  text-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center mb-4 text-3xl mx-auto">
                🏆
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Competitive Edge</h3>
              <p className="text-slate-600 leading-relaxed">
                Exposure to competitive exam patterns and strategies. Mindset development for excellence in all areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center text-slate-900">Why Choose Innovative Academy?</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                  📚
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">Offline Classes</h3>
                  <p className="text-slate-600 text-sm">Our main focus is offline learning with dedicated in-person sessions.</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                  🎓
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">Expert Teachers</h3>
                  <p className="text-slate-600 text-sm">Each subject has specialized expert teachers passionate about students.</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                  💬
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">Doubt Resolution</h3>
                  <p className="text-slate-600 text-sm">Direct interaction with subject experts for personalized doubt solving.</p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                  🎯
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">All Exam Coverage</h3>
                  <p className="text-slate-600 text-sm">CBSE, State Board, Olympiad & Competitive exams in one place.</p>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                  👥
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">Limited Batch Size</h3>
                  <p className="text-slate-600 text-sm">Small batches for personalized attention and better outcomes.</p>
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                  💰
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900">Affordable Premium</h3>
                  <p className="text-slate-600 text-sm">Premium quality education at affordable prices for all.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Ecosystem Section */}
      <section id="app" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center text-slate-900">Our Learning Ecosystem</h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">5000–10000+ Question Bank</h3>
                  <p className="text-slate-600">Comprehensive coverage of all topics with varying difficulty levels.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Live Classes + Offline Sessions</h3>
                  <p className="text-slate-600">Flexible learning with both live online and in-person classes.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Weekly, Monthly & Quarterly Exams</h3>
                  <p className="text-slate-600">Regular assessment to track progress and identify learning gaps.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Mastery Level System</h3>
                  <p className="text-slate-600">Chapter-wise mastery tracking with clear progress indicators.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Points & Level Up System</h3>
                  <p className="text-slate-600">Gamified learning to keep students motivated and engaged.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center mt-1">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-900">Teacher Doubt Resolution</h3>
                  <p className="text-slate-600">Direct interaction with subject experts for personalized help.</p>
                </div>
              </div>
            </div>

            {/* Right Side - Highlight Card */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-10 rounded-3xl shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -ml-30 -mb-30"></div>

              <div className="relative">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold mb-4">Complete Learning Platform</h3>
                  <p className="text-purple-100 leading-relaxed mb-8">
                    Our integrated ecosystem combines interactive lessons, comprehensive question banks, and advanced analytics for 360-degree learning with full app access.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="font-semibold mb-1">📊 Performance Dashboard</div>
                    <p className="text-sm text-purple-100">Real-time insights into progress and learning patterns.</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="font-semibold mb-1">📝 Short Notes & Mind Maps</div>
                    <p className="text-sm text-purple-100">Quick reference materials for effective revision.</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="font-semibold mb-1">🎯 Expert Analysis</div>
                    <p className="text-sm text-purple-100">Detailed performance analysis with personalized recommendations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revive - Success Stories Section */}
      {/* <section id="revive" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-slate-900">Student Revive Stories</h2>
          <p className="text-slate-600 text-center mb-16 text-lg">See how our students transformed their academic journey</p>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                  🌟
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Priya Sharma</h3>
                  <p className="text-sm text-purple-600 font-semibold">Class 10</p>
                </div>
              </div>
              <p className="text-slate-700 mb-4 leading-relaxed">
                "Started with 45% in pre-board, now scoring 92% consistently. The concept-based approach really made a difference!"
              </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                  🚀
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Arjun Patel</h3>
                  <p className="text-sm text-purple-600 font-semibold">Olympiad Achiever</p>
                </div>
              </div>
              <p className="text-slate-700 mb-4 leading-relaxed">
                "Qualified for national Olympiad! The doubt solving sessions and extra material helped me excel. Highly recommended!"
              </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>

           
            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Diya Verma</h3>
                  <p className="text-sm text-purple-600 font-semibold">Board Topper</p>
                </div>
              </div>
              <p className="text-slate-700 mb-4 leading-relaxed">
                "Improved from 58% to 96% in just 6 months! The personalized attention and structured approach made all the difference."
              </p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">⭐</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-purple-100 to-purple-50 border-2 border-purple-300 rounded-2xl p-8 text-center">
            <p className="text-slate-700 text-lg font-semibold mb-4">
              "Revive Your Grades, Rebuild Your Confidence" - Join 500+ successful students already transforming their academic journey
            </p>
            <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all">
              Start Your Revive Journey
            </button>
          </div>
        </div>
      </section> */}

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-slate-900">Simple, Transparent Pricing</h2>
          <p className="text-slate-600 text-center mb-16 text-lg">Choose what works best for you</p>

            

              {/* Welcome Kit
              <div className="border-t-2 border-gray-200 pt-6">
                <p className="text-sm font-semibold text-purple-600 mb-3">🎁 Welcome Kit Included:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✏️</span>
                    <span className="text-sm text-slate-700">Quality Pens Set (5 pcs)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📓</span>
                    <span className="text-sm text-slate-700">Premium Writing Pad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👕</span>
                    <span className="text-sm text-slate-700">Academy T-Shirt</span>
                  </div>
                </div>
              </div> */}
            
          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8 mb-12 ">
          {/* App Only Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-400 transition-all hover:shadow-lg mb-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">App Only Plan</h3>
                <p className="text-slate-600 text-sm">Full App Access + Doubt Help</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold text-slate-900">₹1499<sup>*</sup></span>
                <span className="text-slate-600 ml-2">per year</span>
                <div className="text-sm text-purple-600 font-semibold mt-2">Only ₹125/month</div>
              </div>

              {/* <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all hover:shadow-lg mb-8">
                Explore App
              </button> */}

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Complete app access</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">10000+ question bank</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Multiple Practice tests</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Online Teacher doubt help</span>
                </div>
               
                  <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Smart Dashboard + Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Study Material</span>
                </div>
              </div>
              </div>
            {/* Monthly Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-400 transition-all hover:shadow-lg mb-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-slate-900">Monthly Plan</h3>
                <p className="text-slate-600 text-sm">Classes + App Access</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold text-slate-900">₹1299<sup>*</sup></span>
                <span className="text-slate-600 ml-2">per month</span>
              </div>

              {/* <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all hover:shadow-lg mb-8">
                Get Started
              </button> */}

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Daily classes</span>
                </div>
                               <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Online + Offline</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">1 on 1 Mentorship And Teaching</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Full app access</span>
                </div>
                  <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">Study Material</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">10000+ question bank</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-purple-600 flex-shrink-0" />
                  <span className="text-slate-700">All exams covered</span>
                </div>
               
              </div>

              {/* Welcome Kit
              <div className="border-t-2 border-gray-200 pt-6">
                <p className="text-sm font-semibold text-purple-600 mb-3">🎁 Welcome Kit Included:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📓</span>
                    <span className="text-sm text-slate-700">Premium Writing Pad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✏️</span>
                    <span className="text-sm text-slate-700">Quality Pens Set (5 pcs)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👕</span>
                    <span className="text-sm text-slate-700">Academy T-Shirt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span className="text-sm text-slate-700">Study Guide & Tips Sheet</span>
                  </div>
                </div>
              </div> */}
          
            </div>


            {/* Yearly Plan - Highlighted */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400 rounded-2xl p-8 transform md:scale-105 relative text-white shadow-xl mb-6">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-yellow-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                  Best Offer
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Yearly Plan</h3>
                <p className="text-purple-100 text-sm">Classes + App (Save ₹2598)</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold">12999<sup>*</sup></span>
                <span className="text-purple-100 ml-2">per year</span>
                <div className="text-sm text-purple-200 mt-2">Only ₹1083/month</div>
              </div>
{/* 
              <button className="w-full px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all mb-8 font-bold">
                Start Your Journey
              </button> */}

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Check size={20} className="flex-shrink-0" />
                  <span>Daily classes</span>
                </div>
                 
          
               <div className="flex items-center gap-3">
                  <Check size={20} className="flex-shrink-0" />
                  <span className="">1 on 1 Mentorship And Teaching</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="flex-shrink-0" />
                  <span>Full app access</span>
                </div>
                     <div className="flex items-center gap-3">
                  <Check size={20} className="flex-shrink-0" />
                  <span>Study Material</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="flex-shrink-0" />
                  <span>10000+ question bank</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="flex-shrink-0" />
                  <span>All exams covered</span>
                </div>
            
              </div>

              {/* Welcome Kit
              <div className="border-t-2 border-purple-400 pt-6">
                <p className="text-sm font-semibold text-purple-200 mb-3">🎁 Premium Welcome Kit Included:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📓</span>
                    <span className="text-sm">Premium Writing Pad (Set of 2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✏️</span>
                    <span className="text-sm">Quality Pens Set (10 pcs)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👕</span>
                    <span className="text-sm">Academy T-Shirt (Premium Quality)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span className="text-sm">Complete Study Guide & Tips</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎒</span>
                    <span className="text-sm">Branded Academy Bag</span>
                  </div>
                </div>
              </div>*/}
            </div> 
          </div>

          {/* School Plans */}
          <div className="bg-white border-2 border-purple-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-slate-900">For Schools & Institutions</h3>
            <p className="text-slate-600 mb-6">We offer specialized plans for educational institutions.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 transition-all">
                <h4 className="text-xl font-semibold mb-3 text-slate-900">Full App Usage Plan</h4>
                <p className="text-slate-600 mb-4">Provide complete app access to your students for self-learning and practice.</p>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                  Contact for Details
                </button>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-400 transition-all">
                <h4 className="text-xl font-semibold mb-3 text-slate-900">Teaching + App Plan</h4>
                <p className="text-slate-600 mb-4">Complete solution with our expert teachers and comprehensive app platform.</p>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm">
                  Contact for Details
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-600 mt-12 text-sm">
            All student plans include offline sessions access. Cancel anytime. School plans include customization options.
          </p>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-slate-900">Get in Touch</h2>
          <p className="text-slate-600 text-center mb-16 text-lg">Have questions? We&rsquo;d love to hear from you!</p>

<div className="space-y-10 mb-12">

  {/* Google Map */}
  <div className="w-full h-[380px] rounded-2xl overflow-hidden border-2 border-purple-200 shadow-sm">
    <iframe
     src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3819.088615626635!2d74.64146391008234!3d16.821959383905146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230773dff2e9%3A0xa71a5edeb52b2e4f!2sInnovative%20Computer!5e0!3m2!1sen!2sin!4v1774183063704!5m2!1sen!2sin" 
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      className="w-full h-full"
    />
  </div>

  {/* Contact Cards */}
  <div className="grid md:grid-cols-3 gap-8">

    {/* Location */}
    <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin size={32} className="text-purple-600" />
      </div>

      {/* <h3 className="text-xl font-bold mb-2 text-slate-900">Location</h3> */}

      <p className="text-slate-700 font-semibold">
        2nd floor, Vedika Heights, Near HDFC Bank, Hira Hotel Choke, Shivaji Road, Miraj
      </p>

      <p className="text-slate-600 text-sm mt-2">
        Visit us at our center
      </p>
    </div>

    {/* Email */}
    <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail size={32} className="text-purple-600" />
      </div>

      {/* <h3 className="text-xl font-bold mb-2 text-slate-900">Email</h3> */}

      {/* <p className="text-slate-700 break-all font-semibold">
        innovative.enlightenment@gmail.com
      </p> */}

      <p className="text-slate-700 break-all font-semibold">
        team@innovativeacademy.org.in
      </p>

      <p className="text-slate-700 break-all font-semibold">
        support@innovativeacademy.org.in
      </p>

      <p className="text-slate-600 text-sm mt-2">
        We respond within 24 hours
      </p>
    </div>

    {/* Phone */}
    <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Phone size={32} className="text-purple-600" />
      </div>

      {/* <h3 className="text-xl font-bold mb-2 text-slate-900">Phone</h3> */}

      <p className="text-slate-700 font-semibold">
        +91-(94215-67466)
      </p>

      <p className="text-slate-700 font-semibold">
        +91-(93350-92358)
      </p>

      <p className="text-slate-600 text-sm mt-2">
        10 AM - 7 PM
      </p>
    </div>

  </div>

</div>
          {/* <div className="grid md:grid-cols-3 gap-8 mb-12">
          
           
            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Email</h3>
              <p className="text-slate-700 break-all font-semibold">innovative.enlightenment@gmail.com</p>
               <p className="text-slate-700 break-all font-semibold"> team@innovativeacademy.org.in</p>
                 
                <p className="text-slate-700 break-all font-semibold">support@innovativeacademy.org.in</p>
                  
              <p className="text-slate-600 text-sm mt-2">We respond within 24 hours</p>
            </div>

           
            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Phone</h3>
              <p className="text-slate-700 font-semibold">+91-(94215-67466)</p>
               <p className="text-slate-700 font-semibold">+91-(93350-92358)</p>
              <p className="text-slate-600 text-sm mt-2">9 AM - 9 PM</p>
            </div>

            
            <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Location</h3>
              <p className="text-slate-700 font-semibold">2nd floor, Vedika Heights, Near HDFC Bank, Hira Hotel Choke, Shivaji Road, Miraj</p>
              <p className="text-slate-600 text-sm mt-2">Visit us at our center</p>
            </div>
          </div> */}

          {/* Contact Form
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-900">Send us a Message</h3>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <textarea
                placeholder="Your Message"
                rows={5}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all hover:shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div> */}
        </div>
      </section>

      {/* CTA Section
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
      </section> */}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Column 1 - About */}
            <div>
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                
  <img src="/images/logos/logo-innovative-dark.png" className='w-70'/>
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
    </div>
  );
}
