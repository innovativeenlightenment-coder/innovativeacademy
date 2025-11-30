// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
// import { FaGraduationCap, FaBookOpen, FaLaptopCode } from "react-icons/fa";

// export default function Footer() {
//   return (
//     <footer className="text-gray-700">
//       {/* Top Info Section */}
//       <div className="bg-blue-500 text-white py-8">
//         <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 text-center md:text-left px-6 md:px-20">
//           <div className="flex flex-col items-center md:items-start">
//             <FaGraduationCap className="text-yellow-300 text-3xl mb-2" />
//             <p className="font-medium">Free Mock Tests & Practice</p>
//             <p className="text-sm font-normal">Attempt unlimited mock tests anytime</p>
//           </div>
//           <div className="flex flex-col items-center md:items-start">
//             <FaBookOpen className="text-pink-300 text-3xl mb-2" />
//             <p className="font-medium">Expert Designed Question Bank</p>
//             <p className="text-sm font-normal">Prepared by experienced faculty</p>
//           </div>
//           <div className="flex flex-col items-center md:items-start">
//             <FaLaptopCode className="text-green-300 text-3xl mb-2" />
//             <p className="font-medium">Instant Results & Analysis</p>
//             <p className="text-sm font-normal">Check your performance instantly</p>
//           </div>
//           <div className="flex flex-col items-center md:items-start">
//             <Image
//               src="/neet-logo.png"
//               alt="NEET JEE CET"
//               width={40}
//               height={40}
//               className="mb-2"
//             />
//             <p className="font-medium">India’s Trusted Test Prep App</p>
//             <p className="text-sm font-normal">Trusted by 10k+ students</p>
//           </div>
//         </div>
//       </div>



// {/* Middle Section */}
// <div className="bg-gradient-to-r from-green-400 via-green-200 to-green-300 py-10">
//   <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-8 px-6 md:px-20">
//     {/* Contact Info */}
//     <div>
//       <h4 className="text-green-800 font-semibold mb-4">Contact Info</h4>
//       <p className="font-normal text-sm text-gray-800">support@testseriesapp.com</p>
//       <p className="font-normal text-sm text-gray-800">+91 9876543210</p>
//       <p className="font-normal text-sm text-gray-800">www.testseriesapp.com</p>
//     </div>

//     {/* Recent Updates */}
//     <div>
//       <h4 className="text-green-800 font-semibold mb-4">Recent Updates</h4>
//       <ul className="space-y-3 text-sm font-normal">
//         <li>
//           <Link href="#">
//             <p className="hover:text-green-700">New Mock Test for NEET 2025</p>
//             <span className="text-xs text-gray-600">Sept 5, 2025</span>
//           </Link>
//         </li>
//         <li>
//           <Link href="#">
//             <p className="hover:text-green-700">JEE Advanced Practice Series</p>
//             <span className="text-xs text-gray-600">Sept 2, 2025</span>
//           </Link>
//         </li>
//       </ul>
//     </div>

//     {/* Quick Links */}
//     <div>
//       <h4 className="text-green-800 font-semibold mb-4">Quick Links</h4>
//       <ul className="space-y-2 text-sm font-normal">
//         <li><Link href="#">About Us</Link></li>
//         <li><Link href="#">Contact Us</Link></li>
//         <li><Link href="#">Terms & Conditions</Link></li>
//         <li><Link href="#">FAQ</Link></li>
//       </ul>
//     </div>

//     {/* Test Categories */}
//     <div>
//       <h4 className="text-green-800 font-semibold mb-4">Test Categories</h4>
//       <ul className="space-y-2 text-sm font-normal">
//         <li><Link href="#">Foundation (8th–10th)</Link></li>
//         <li><Link href="#">NEET</Link></li>
//         <li><Link href="#">JEE</Link></li>
//         <li><Link href="#">CET</Link></li>
//       </ul>
//     </div>

//     {/* Subjects */}
//     <div>
//       <h4 className="text-green-900 font-semibold mb-4">Subjects</h4>
//       <div className="flex flex-wrap gap-2 text-sm font-normal">
//         <span className="bg-blue-600 text-blue-800 px-3 py-1 rounded">Physics</span>
//         <span className="bg-orange-600 text-orange-800 px-3 py-1 rounded">Chemistry</span>
//         <span className="bg-green-600 text-green-800 px-3 py-1 rounded">Biology</span>
//         <span className="bg-purple-600 text-purple-800 px-3 py-1 rounded">Maths</span>

//       </div>
//     </div>
//   </div>
// </div>




//       {/* Middle Section
//       <div className="bg-gray-100 py-10">
//         <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-8 px-6 md:px-20">
//           {/* Contact Info */}
//         {/* //   <div>
//         //     <h4 className="text-indigo-700 font-semibold mb-4">Contact Info</h4>
//         //     <p className="font-normal text-sm">support@testseriesapp.com</p>
//         //     <p className="font-normal text-sm">+91 9876543210</p>
//         //     <p className="font-normal text-sm">www.testseriesapp.com</p>
//         //   </div> */}

//           {/* Recent Updates */}
//           {/* <div>
//             <h4 className="text-indigo-700 font-semibold mb-4">Recent Updates</h4>
//             <ul className="space-y-3 text-sm font-normal">
//               <li>
//                 <Link href="#">
//                   <p className="hover:text-indigo-600">New Mock Test for NEET 2025</p>
//                   <span className="text-xs text-gray-500">Sept 5, 2025</span>
//                 </Link>
//               </li>
//               <li>
//                 <Link href="#">
//                   <p className="hover:text-indigo-600">JEE Advanced Practice Series</p>
//                   <span className="text-xs text-gray-500">Sept 2, 2025</span>
//                 </Link>
//               </li>
//             </ul>
//           </div> */}

//           {/* Quick Links */}
//           {/* <div>
//             <h4 className="text-indigo-700 font-semibold mb-4">Quick Links</h4>
//             <ul className="space-y-2 text-sm font-normal">
//               <li><Link href="#">About Us</Link></li>
//               <li><Link href="#">Contact Us</Link></li>
//               <li><Link href="#">Terms & Conditions</Link></li>
//               <li><Link href="#">FAQ</Link></li>
//             </ul>
//           </div> */}

//           {/* Test Categories */}
//           {/* <div>
//             <h4 className="text-indigo-700 font-semibold mb-4">Test Categories</h4>
//             <ul className="space-y-2 text-sm font-normal">
//               <li><Link href="#">Foundation (8th–10th)</Link></li>
//               <li><Link href="#">NEET</Link></li>
//               <li><Link href="#">JEE</Link></li>
//               <li><Link href="#">CET</Link></li>
//             </ul>
//           </div> */}

//           {/* Subjects */}
//           {/* <div>
//             <h4 className="text-indigo-700 font-semibold mb-4">Subjects</h4>
//             <div className="flex flex-wrap gap-2 text-sm font-normal">
//               <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded">Physics</span>
//               <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded">Chemistry</span>
//               <span className="bg-green-200 text-green-800 px-3 py-1 rounded">Biology</span>
//               <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded">Maths</span>
//               <span className="bg-red-200 text-red-800 px-3 py-1 rounded">English</span>
//             </div>
//           </div>
//         </div>
//       </div> */} 

//       {/* Bottom Section */}
//       <div className="bg-gray-900 text-gray-400 py-6 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between">
//         <p className="text-sm font-normal">© 2025 Innovative Education, Miraj Test Series App. All Rights Reserved.</p>
//         <div className="flex space-x-4 mt-3 md:mt-0 text-lg">
//           <FaFacebook className="cursor-pointer hover:text-blue-500" />
//           <FaInstagram className="cursor-pointer hover:text-pink-500" />
//           <FaLinkedin className="cursor-pointer hover:text-blue-400" />
//           <FaYoutube className="cursor-pointer hover:text-red-500" />
//         </div>
//       </div>
//     </footer>
//   );
// }


// Footer with sticky contact info on right

// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
// import { FaGraduationCap, FaBookOpen, FaLaptopCode } from "react-icons/fa";

// export default function Footer() {
//   return (
//     <footer className="text-gray-700 relative">
//       {/* Top Info Section */}
//       <div className="bg-blue-500 text-white py-8">
//         <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 text-center md:text-left px-6 md:px-20">
//           <div className="flex flex-col items-center md:items-start">
//             <FaGraduationCap className="text-yellow-300 text-3xl mb-2" />
//             <p className="font-medium">Free Mock Tests & Practice</p>
//             <p className="text-sm font-normal">Attempt unlimited mock tests anytime</p>
//           </div>
//           <div className="flex flex-col items-center md:items-start">
//             <FaBookOpen className="text-pink-300 text-3xl mb-2" />
//             <p className="font-medium">Expert Designed Question Bank</p>
//             <p className="text-sm font-normal">Prepared by experienced faculty</p>
//           </div>
//           <div className="flex flex-col items-center md:items-start">
//             <FaLaptopCode className="text-green-300 text-3xl mb-2" />
//             <p className="font-medium">Instant Results & Analysis</p>
//             <p className="text-sm font-normal">Check your performance instantly</p>
//           </div>
//           <div className="flex flex-col items-center md:items-start">
//             <Image
//               src="/neet-logo.png"
//               alt="NEET JEE CET"
//               width={40}
//               height={40}
//               className="mb-2"
//             />
//             <p className="font-medium">India’s Trusted Test Prep App</p>
//             <p className="text-sm font-normal">Trusted by 10k+ students</p>
//           </div>
//         </div>
//       </div>

//       {/* Middle Section */}
//       <div className="bg-gradient-to-r from-green-400 via-green-200 to-green-300 py-10">
//         <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-8 px-6 md:px-20">
//           {/* Contact Info */}
//           <div>
//             <h4 className="text-green-800 font-semibold mb-4">Contact Info</h4>
//             <p className="font-normal text-sm text-gray-800">support@testseriesapp.com</p>
//             <p className="font-normal text-sm text-gray-800">+91 9876543210</p>
//             <p className="font-normal text-sm text-gray-800">www.testseriesapp.com</p>
//           </div>

//           {/* Recent Updates */}
//           <div>
//             <h4 className="text-green-800 font-semibold mb-4">Recent Updates</h4>
//             <ul className="space-y-3 text-sm font-normal">
//               <li>
//                 <Link href="#">
//                   <p className="hover:text-green-700">New Mock Test for NEET 2025</p>
//                   <span className="text-xs text-gray-600">Sept 5, 2025</span>
//                 </Link>
//               </li>
//               <li>
//                 <Link href="#">
//                   <p className="hover:text-green-700">JEE Advanced Practice Series</p>
//                   <span className="text-xs text-gray-600">Sept 2, 2025</span>
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h4 className="text-green-800 font-semibold mb-4">Quick Links</h4>
//             <ul className="space-y-2 text-sm font-normal">
//               <li><Link href="#">About Us</Link></li>
//               <li><Link href="#">Contact Us</Link></li>
//               <li><Link href="#">Terms & Conditions</Link></li>
//               <li><Link href="#">FAQ</Link></li>
//             </ul>
//           </div>

//           {/* Test Categories */}
//           <div>
//             <h4 className="text-green-800 font-semibold mb-4">Test Categories</h4>
//             <ul className="space-y-2 text-sm font-normal">
//               <li><Link href="#">Foundation (8th–10th)</Link></li>
//               <li><Link href="#">NEET</Link></li>
//               <li><Link href="#">JEE</Link></li>
//               <li><Link href="#">CET</Link></li>
//             </ul>
//           </div>

//           {/* Subjects */}
//           <div>
//             <h4 className="text-green-900 font-semibold mb-4">Subjects</h4>
//             <div className="flex flex-wrap gap-2 text-sm font-normal">
//               <span className="bg-blue-600 text-white px-3 py-1 rounded">Physics</span>
//               <span className="bg-orange-600 text-white px-3 py-1 rounded">Chemistry</span>
//               <span className="bg-green-600 text-white px-3 py-1 rounded">Biology</span>
//               <span className="bg-purple-600 text-white px-3 py-1 rounded">Maths</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Sticky Contact Box */}
//       <div className="fixed bottom-24 right-6 w-[400px] h-[200px] bg-white border border-gray-300 shadow-xl rounded-lg p-5 flex flex-col justify-between z-50">
//         <h3 className="text-lg font-semibold text-blue-700 mb-2">📞 Contact Us</h3>
//         <div className="flex items-center gap-2 text-gray-700">
//           <FaPhoneAlt className="text-green-600" />
//           <p className="text-sm">+91 9876543210</p>
//         </div>
//         <div className="flex items-center gap-2 text-gray-700">
//           <FaEnvelope className="text-blue-600" />
//           <p className="text-sm">support@testseriesapp.com</p>
//         </div>
//         <a
//           href="/contact"
//           className="mt-3 inline-block bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition"
//         >
//           Send Message
//         </a>
//       </div>

//       {/* Bottom Section */}
//       <div className="bg-gray-900 text-gray-400 py-6 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between">
//         <p className="text-sm font-normal">
//           © 2025 Innovative Education, Miraj Test Series App. All Rights Reserved.
//         </p>
//         <div className="flex space-x-4 mt-3 md:mt-0 text-lg">
//           <FaFacebook className="cursor-pointer hover:text-blue-500" />
//           <FaInstagram className="cursor-pointer hover:text-pink-500" />
//           <FaLinkedin className="cursor-pointer hover:text-blue-400" />
//           <FaYoutube className="cursor-pointer hover:text-red-500" />
//         </div>
//       </div>
//     </footer>
//   );
// }

// Footer with sticky contact info on left

"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { FaGraduationCap, FaBookOpen, FaLaptopCode } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="text-gray-700 relative">
      {/* Top Info Section */}
      <div className="bg-blue-500 text-white py-8">
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 text-center md:text-left px-6 md:px-20">
          <div className="flex flex-col items-center md:items-start">
            <FaGraduationCap className="text-yellow-300 text-3xl mb-2" />
            <p className="font-medium">Free Mock Tests & Practice</p>
            <p className="text-sm font-normal">Attempt unlimited mock tests anytime</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <FaBookOpen className="text-pink-300 text-3xl mb-2" />
            <p className="font-medium">Expert Designed Question Bank</p>
            <p className="text-sm font-normal">Prepared by experienced faculty</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <FaLaptopCode className="text-green-300 text-3xl mb-2" />
            <p className="font-medium">Instant Results & Analysis</p>
            <p className="text-sm font-normal">Check your performance instantly</p>
          </div>
          <div className="flex flex-col items-center md:items-start bg-white px-2 border-4 border-solid rounded-lg p-4">
            <Image
              src="/images/innovative.png"
              alt="NEET JEE CET"
              width={240}
              height={140}
              className="mb-2"
            />
            <p className="font-medium text-teal-950">India’s Trusted Test Prep App</p>
            <p className="text-sm font-normal text-teal-950">Trusted by 10k+ students</p>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="bg-gradient-to-r from-green-600 via-green-300 to-green-500 py-10">
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 px-3 md:px-20">
          {/* Contact Info */}
          <div>
            <h4 className="text-green-800 font-semibold mb-4">Contact Info</h4>
            <p className="font-normal text-sm text-gray-800">innovativetestprep@hotmail.com</p>
            <p className="font-normal text-sm text-gray-800">+91 9335092385</p>
            <p className="font-normal text-sm text-gray-800">www.innovativetestprep.vercel.app</p>
          </div>

          {/* Recent Updates */}
          <div>
            <h4 className="text-green-800 font-semibold mb-4">Recent Updates</h4>
            <ul className="space-y-3 text-sm font-normal">
              <li>
                <Link href="#">
                  <p className="hover:text-green-700">New Mock Test for NEET 2025</p>
                  <span className="text-xs text-gray-600">Sept 5, 2025</span>
                </Link>
              </li>
              <li>
                <Link href="#">
                  <p className="hover:text-green-700">JEE Advanced Practice Series</p>
                  <span className="text-xs text-gray-600">Sept 2, 2025</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links
          <div>
            <h4 className="text-green-800 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm font-normal">
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Contact Us</Link></li>
              <li><Link href="#">Terms & Conditions</Link></li>
              <li><Link href="#">FAQ</Link></li>
            </ul>
          </div> */}

          {/* Test Categories */}
          <div>
            <h4 className="text-green-800 font-semibold mb-4">Test Categories</h4>
            <ul className="space-y-2 text-sm font-normal">
              <li><Link href="#">Foundation (8th–10th)</Link></li>
              <li><Link href="#">NEET</Link></li>
              <li><Link href="#">JEE</Link></li>
              <li><Link href="#">CET</Link></li>
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h4 className="text-green-900 font-semibold mb-4">Subjects</h4>
            <div className="flex flex-wrap gap-2 text-sm font-normal">
              <span className="bg-blue-600 text-white px-3 py-1 rounded">Physics</span>
              <span className="bg-orange-600 text-white px-3 py-1 rounded">Chemistry</span>
              <span className="bg-green-600 text-white px-3 py-1 rounded">Biology</span>
              <span className="bg-purple-600 text-white px-3 py-1 rounded">Maths</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Contact Box (Left Side) */}
      <div className="fixed bottom-1 left-6 w-[165px] h-[120px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-3xl rounded-xl p-2 flex flex-col justify-between z-50 border border-blue-300">
        <h3 className="text-xm font-bold mb-1 text-gray-300"> Speak to us</h3>
        <div className="flex items-center gap-1">
          <FaPhoneAlt className="text-yellow-300 text-xm" />
          <h4 className="text-xm font-bold  border-4-white-400">+91 9335092385</h4>
        </div>
        {/* <div className="flex items-center gap-3">
          {/* <FaEnvelope className="text-green-300 text-lg" /> */}
        {/* <p className="text-lg">support@testseriesapp.com</p> */}
        {/* </div>  */}
        <a
          href=""
          className="mt-3 inline-block bg-yellow-400 text-blue-900 font-bold text-center py-2 px-4 rounded-md hover:bg-yellow-300 hover:scale-105 transition-transform"
        >
          Join Us! Today
        </a>
      </div>

      {/* Bottom Section */}
      <div className="bg-gray-900 text-gray-400 py-6 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm w-full text-center font-normal">
          © 2025 Innovative Education, Miraj Test Series App. All Rights Reserved.
        </p>
        {/* <div className="flex space-x-4 mt-3 md:mt-0 text-lg">
          <FaFacebook className="cursor-pointer hover:text-blue-500" />
          <FaInstagram className="cursor-pointer hover:text-pink-500" />
          <FaLinkedin className="cursor-pointer hover:text-blue-400" />
          <FaYoutube className="cursor-pointer hover:text-red-500" />
        </div> */}
      </div>
    </footer>
  );
}
