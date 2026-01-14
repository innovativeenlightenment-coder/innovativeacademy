"use client";

import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export default function LocationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100">
      {/* Full Width Map */}
      <div className="w-full h-96">
        <iframe
          className="w-full h-full border-0"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3819.0885121450965!2d74.64146927419635!3d16.821964518849473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230773dff2e9%3A0xa71a5edeb52b2e4f!2sInnovative%20Computer!5e0!3m2!1sen!2sin!4v1758013763870!5m2!1sen!2sin">

        </iframe>
      </div>

      {/* Contact Info Section */}
      <div className="container mx-auto px-6 md:px-20 py-16 grid md:grid-cols-2 gap-12">
        {/* Left - Company Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-indigo-700 mb-6">
            Contact Innovative Academy
          </h2>
          <p className="text-gray-600 mb-6">
            We’re here to help with your queries about our Online Test Series
            for Foundation, JEE, NEET & CET. Reach out to us using the details
            below.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-red-500 text-xl" />
              <span className="text-gray-700">
                Innovative Academy HQ, Pune, Maharashtra, India
              </span>
            </div>
            <div className="flex items-center space-x-2 font-bold">
              <FaPhoneAlt className="text-green-500 text-xl" />
              <span className="text-gray-700">+91 9421567466</span>

              {/* <FaPhoneAlt className="text-green-500 text-xl" /> */}
              <span className="text-gray-700">+91 9881893510</span>
            </div>
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-blue-500 text-xl" />
              <span className="text-gray-700">
                innovativetestprep@hotmail.com
              </span>
            </div>
          </div>
        </div>

        {/* Right - Contact Form */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 rounded-lg text-gray-200"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 rounded-lg text-gray-200"
            />
            <textarea
              placeholder="Your Message"
              rows="4"
              className="w-full p-3 rounded-lg text-gray-200"
            ></textarea>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Employee Details Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6 md:px-20">
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10">
            Our Team
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Employee Card */}

            <div className="bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-red-800">
                Abdulkarim
              </h3>
              <p className="text-gray-600">Chairman and CEO</p>
              <p className="mt-2 text-sm text-gray-700">
                Manages admissions, attendance & technical operations.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-indigo-800">
                Shoukat Ali
              </h3>
              <p className="text-gray-600">General Manager</p>
              <p className="mt-2 text-sm text-gray-700">
                Visionary leader managing overall strategy and innovation.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-teal-200 rounded-2xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-green-800">
                Tasleem Raza
              </h3>
              <p className="text-gray-600">Marketing Head</p>
              <p className="mt-2 text-sm text-gray-700">
                Leads marketing, promotions & outreach for test series.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-orange-200 rounded-2xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-yellow-800">
                Masood Ahmed
              </h3>
              <p className="text-gray-600">Teacher Head</p>
              <p className="mt-2 text-sm text-gray-700">
                Guides subject experts & ensures quality test content.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-purple-800">
                Hafija Mahabari
              </h3>
              <p className="text-gray-600">Academic Head</p>
              <p className="mt-2 text-sm text-gray-700">
                Delivers lectures & contributes to question bank creation.
              </p>
            </div>



            <div className="bg-gradient-to-br from-pink-300 to-red-400 rounded-2xl shadow-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-teal-800">
                Gazala Ameen
              </h3>
              <p className="text-gray-600">Teacher Head</p>
              <p className="mt-2 text-sm text-gray-700">
                Supports subject delivery & test preparation guidance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
