import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">
        
        {/* Logo */}
        <div className="text-2xl font-extrabold text-cyan-300 cursor-pointer tracking-wide" onClick={() => navigate("/")}>
          HelpMyPet.ai
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center md:justify-start space-x-6 mt-4 md:mt-0">
          <button onClick={() => navigate("/")} className="hover:text-cyan-300 transition">Home</button>
          <button onClick={() => navigate("/about")} className="hover:text-cyan-300 transition">About</button>
          <button onClick={() => navigate("/login")} className="hover:text-cyan-300 transition">Login</button>
          <button onClick={() => navigate("/signup")} className="hover:text-cyan-300 transition">Sign Up</button>
        </div>

        {/* Contact Us */}
        <div className="flex flex-col items-center mt-4 md:mt-0">
          <button 
            onClick={() => window.location.href = "mailto:contact@helpmypet.ai"} 
            className="mt-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white rounded-lg hover:from-cyan-500 hover:to-cyan-700 transition transform hover:scale-105"
          >
            Email Us
          </button>
        </div>

        {/* Copyright & Socials */}
        <div className="text-sm mt-4 md:mt-0">
          <p className="text-white">© {new Date().getFullYear()} HelpMyPet.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;