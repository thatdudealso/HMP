import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaStethoscope, FaPaw } from 'react-icons/fa';
import { Building2, BookOpen, Microscope } from 'lucide-react';
import Footer from './Footer';

const ServicesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* ✅ Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-slate-900/90 backdrop-blur-sm shadow-lg py-4 px-6 flex justify-between items-center z-50">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigation("/")}>
          <div className="flex items-center bg-blue-600/20 px-4 py-2 rounded-lg">
            <FaStethoscope className="text-2xl text-blue-400 mr-2" />
            <FaPaw className="text-xl text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              HelpMyPet.AI
            </span>
            <span className="text-xs text-gray-400">Veterinary Intelligence</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6">
            <button onClick={() => handleNavigation("/services")} className="text-gray-300 hover:text-blue-400 transition duration-300">
              Services
            </button>
            <button onClick={() => handleNavigation("/features")} className="text-gray-300 hover:text-blue-400 transition duration-300">
              Features
            </button>
            <button onClick={() => handleNavigation("/resources")} className="text-gray-300 hover:text-blue-400 transition duration-300">
              Resources
            </button>
            <button onClick={() => handleNavigation("/about")} className="text-gray-300 hover:text-blue-400 transition duration-300">
              About
            </button>
          </div>
          <button
            onClick={() => handleNavigation("/login")}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* ✅ Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-slate-900/98 backdrop-blur-sm flex flex-col items-center justify-center space-y-8 text-xl z-40">
          <button onClick={() => handleNavigation("/services")} className="text-white hover:text-blue-400 transition duration-300">
            Services
          </button>
          <button onClick={() => handleNavigation("/features")} className="text-white hover:text-blue-400 transition duration-300">
            Features
          </button>
          <button onClick={() => handleNavigation("/resources")} className="text-white hover:text-blue-400 transition duration-300">
            Resources
          </button>
          <button onClick={() => handleNavigation("/about")} className="text-white hover:text-blue-400 transition duration-300">
            About
          </button>
          <button onClick={() => handleNavigation("/login")} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg">
            Login
          </button>
        </div>
      )}

      {/* ✅ Main Content */}
      <main className="pt-20 flex-grow">
        {/* Hero Section */}
        <header className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Advanced Veterinary Intelligence Platform
            </h1>
            <p className="text-xl text-gray-50 mb-8">
              Revolutionizing veterinary care through AI-powered diagnostics, continuous learning, and comprehensive clinical support. Join thousands of veterinary professionals advancing their practice with cutting-edge technology.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold">
                Start Free Trial
              </button>
              <a
                href="https://youtu.be/2QBfOn1lb4E"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-blue-400 hover:bg-blue-800 px-8 py-3 rounded-lg font-semibold inline-block"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </header>

        {/* Services Grid */}
        <section className="container mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-12 text-center text-white">
            Comprehensive Solutions for Every Veterinary Need
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Professional Tools */}
            <div className="bg-slate-800 p-8 rounded-xl hover:bg-slate-800/90 transition-all duration-300">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Clinical AI Assistant</h3>
              <p className="text-white leading-relaxed">
                Experience the next generation of veterinary diagnostics with our AI-powered clinical assistant.
              </p>
            </div>

            {/* Student Section */}
            <div className="bg-slate-800 p-8 rounded-xl hover:bg-slate-800/90 transition-all duration-300">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">NAVLE Prep & Learning</h3>
              <p className="text-white leading-relaxed">
                Transform your study experience with our comprehensive NAVLE preparation system.
              </p>
            </div>

            {/* Lab Integration */}
            <div className="bg-slate-800 p-8 rounded-xl hover:bg-slate-800/90 transition-all duration-300">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Advanced Diagnostics</h3>
              <p className="text-white leading-relaxed">
                Leverage cutting-edge AI technology for precise lab result interpretation and imaging analysis.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default ServicesPage;