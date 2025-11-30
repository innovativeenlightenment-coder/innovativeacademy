"use client";
import Link from 'next/link'
import "@/app/globals.css";
import React from 'react'
import { useState } from "react";
// import { FaUserCircle } from "react-icons/fa";
import { FaUserCircle, FaMapMarkerAlt } from "react-icons/fa";
const HeaderPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">

        {/* Logo */}

        <div className="flex items-center space-x-2">
          <img
            src="/images/innovative.png"
            alt="TestSeries Logo"
            className="h-10 w-auto"
          />
          <span className="text-gray-700 font-semibold hidden sm:block">
            {/* TestSeries */}
          </span>
        </div>
        {/* <div className="bg-yellow-400 text-gray-900 font-semibold px-1 py-1 rounded-2xl shadow-md text-center w-[450px] mb-2 mt-2 hidden sm:block">
                        <h4 className="text-1xl font-bold text-gray-800 px-2">
                            🎉 Limited Time Offer!!  <span className="text-sm font-normal">
                                Get your 1st test absolutely FREE!
                            </span>
                        </h4>

                    </div> */}
        {/* <div className="flex items-center space-x-2">
          <div className="text-2xl font-extrabold tracking-wide">
            <span className="text-blue-600">F</span>
            <span className="text-green-600">J</span>
            <span className="text-orange-500">C</span>
            <span className="text-red-500">N</span>
          </div>
          <span className="text-gray-700 font-semibold hidden sm:block"> */}
        {/* TestSeries
          </span>
        </div> */}

        {/* Desktop Nav */}
        {/* <nav className="hidden md:flex space-x-8 font-medium text-gray-600">
          <a href="#" className="hover:text-blue-600">Courses</a>
          <a href="#" className="hover:text-green-600">Pricing</a>
          <a href="#" className="hover:text-orange-500">About</a>
          <a href="#" className="hover:text-red-500">Contact</a>
        </nav> */}

        {/* Right Side */}
        <div className="flex items-center space-x-4 ">

          {/* Login */}
          {/* <button className="text-white-600 bold flex items-center space-x-1 hover:text-green-600 transition bg-red-500 px-2 py-2">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M5.121 17.804A9 9 0 1118.364 4.561 9 9 0 015.121 17.804z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {/* <span className="hidden sm:block">Login</span> */}
          {/* </button> */}



          <div className="flex items-center gap-6">
            {/* Login with tooltip */}
            <div className="relative group cursor-pointer inline-block">
              <FaUserCircle className="text-3xl text-gray-400 hover:text-blue-600" />
              <span className="absolute left-1/2 -translate-x-1/2 top-10 px-2 py-1 text-xs font-medium text-white bg-black rounded opacity-0 group-hover:opacity-100 transition w-[80]">
                Login Here!
              </span>
              {/* <Link href="/dashboard">Dashboard</Link> */}
            </div>

            {/* Location with tooltip */}
            <div className="relative group cursor-pointer inline-block">
              <FaMapMarkerAlt className="text-3xl text-orange-400 hover:text-red-600" />
              <span className="absolute left-1/2 -translate-x-1/2 top-10 px-1 py-1 text-xs w-[55] text-white bg-black rounded opacity-0 group-hover:opacity-100 transition">
                Find Us!
              </span>
            </div>
          </div>


          {/* Location
          <button className="text-orange-600 bold flex items-center space-x-1 hover:text-blue-600 transition  px-2 py-2">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 22c4.418-5.418 6-8.418 6-11a6 6 0 10-12 0c0 2.582 1.582 5.582 6 11z" />
            </svg>
            {/* <span className="hidden sm:block">Location</span> */}
          {/* </button>  */}


          {/* Mobile Hamburger */}
          {/* <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button> */}
        </div>
      </div>

      {/* Mobile Dropdown
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-3 space-y-2">
          <a href="#" className="block text-gray-700 hover:text-blue-600">Courses</a>
          <a href="#" className="block text-gray-700 hover:text-green-600">Pricing</a>
          <a href="#" className="block text-gray-700 hover:text-orange-500">About</a>
          <a href="#" className="block text-gray-700 hover:text-red-500">Contact</a>
        </div>
      )} */}
    </header>
  )
}

export default HeaderPage