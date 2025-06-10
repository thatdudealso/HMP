import React from "react";
import { FaUserShield, FaRobot, FaBrain, FaCheckCircle } from "react-icons/fa";
import Navbar from "./Navbar"; // Import Navbar
import Footer from './Footer';

const FeaturesPage = () => {
  const features = [
    {
      title: "Role-Based Sign-On & Responses",
      description:
        "Our system ensures secure access through role-based authentication. Users receive responses tailored to their specific roles, whether they are veterinarians, students, or technicians, ensuring relevance and accuracy.",
      icon: <FaUserShield className="text-blue-400 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
    {
      title: "Dynamic Prompt Inputs",
      description:
        "Interact effortlessly with an intuitive AI-driven prompt input system. Tailored for veterinary professionals, it allows precise queries to generate accurate, context-aware responses.",
      icon: <FaRobot className="text-cyan-300 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
    {
      title: "RAG-Based Continuous Learning",
      description:
        "Our Retrieval-Augmented Generation (RAG) system continuously learns from new veterinary research, user interactions, and clinical cases, improving its accuracy and relevance over time.",
      icon: <FaBrain className="text-blue-400 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
    },
    {
      title: "Free & Easy to Use",
      description:
        "HelpMyPet.AI is designed to be accessible to everyone. It's completely free to use and features a user-friendly interface, making veterinary AI assistance available at your fingertips.",
      icon: <FaCheckCircle className="text-cyan-300 text-5xl mb-4 hover:scale-110 transition-transform duration-300" />,
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
            Features
          </h1>
          <p className="text-lg text-center text-gray-200 mb-16 max-w-3xl mx-auto">
            Discover the powerful capabilities of HelpMyPet.AI, designed to provide seamless, AI-driven veterinary assistance with cutting-edge technology and an intuitive user experience.
          </p>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="p-8 bg-slate-800/60 rounded-2xl hover:bg-slate-800/80 transition duration-300 text-center shadow-xl">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-2xl font-semibold my-4 text-blue-400">{feature.title}</h3>
                <p className="text-gray-200 text-lg leading-relaxed">{feature.description}</p>
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

export default FeaturesPage;