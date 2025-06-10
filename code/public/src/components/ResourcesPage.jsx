import React from 'react';
import { FaBookOpen, FaBrain, FaRobot, FaFileMedical, FaUserMd, FaHospital } from 'react-icons/fa';
import Navbar from './Navbar'; // Import Navbar
import Footer from './Footer';

const ResourcesPage = () => {
  const resources = [
    {
      title: "AI-Powered Knowledge Base",
      description: "Gain instant, accurate answers to veterinary queries using AI-driven research. Our extensive database includes clinical cases, medical literature, and expert-reviewed guidelines. This tool helps veterinarians, students, and technicians enhance their decision-making process with reliable, up-to-date information.",
      icon: <FaBrain className="text-blue-400 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
    {
      title: "Interactive Case Studies",
      description: "Engage in real-world veterinary cases designed to simulate real clinical experiences. Our interactive modules encourage problem-solving, diagnostic reasoning, and treatment planning. Improve your skills through practical applications and expert-reviewed scenarios.",
      icon: <FaBookOpen className="text-cyan-300 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
    {
      title: "AI Veterinary Chat",
      description: "Utilize our AI-powered assistant, designed specifically for veterinary medicine. This intelligent chat system provides real-time insights on differential diagnoses, drug interactions, and treatment strategies. Get the information you need instantly, tailored to your patient's unique needs.",
      icon: <FaRobot className="text-blue-400 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
    {
      title: "Diagnostic Guide",
      description: "Explore a structured guide to symptoms, potential diagnoses, and recommended treatments. This resource ensures veterinarians have quick and accurate access to diagnostic tools, imaging resources, and pathology insights, all optimized for the best patient outcomes.",
      icon: <FaFileMedical className="text-cyan-300 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
    {
      title: "Professional Development",
      description: "Advance your career with our curated collection of webinars, expert discussions, and research articles. Stay informed about the latest veterinary trends, innovative treatment techniques, and career growth opportunities in the field of veterinary medicine.",
      icon: <FaUserMd className="text-blue-400 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
    {
      title: "Integration with Practice",
      description: "Discover AI-driven tools that optimize veterinary practice management. Enhance patient record-keeping, automate diagnostic workflows, and implement efficient clinic operations to improve patient care and business efficiency in your practice.",
      icon: <FaHospital className="text-cyan-300 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="flex-grow pt-24 px-6">
        <div className="max-w-7xl mx-auto py-16">
          <h1 className="text-5xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-wide leading-snug">
            Resources
          </h1>
          <p className="text-lg text-center text-gray-200 mb-16 max-w-3xl mx-auto">
            Explore our AI-Powered Veterinary Knowledge Hub, offering cutting-edge insights and interactive tools tailored for veterinary professionals, students, and technicians.
          </p>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {resources.map((resource, index) => (
              <div key={index} className="p-8 bg-slate-800/60 rounded-2xl hover:bg-slate-800/80 transition duration-300 text-center shadow-xl">
                <div className="flex justify-center">{resource.icon}</div>
                <h3 className="text-2xl font-semibold my-4 text-blue-400">{resource.title}</h3>
                <p className="text-gray-200 text-lg leading-relaxed">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default ResourcesPage;