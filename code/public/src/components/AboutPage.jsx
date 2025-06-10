import React from 'react';
import { Clock, Users, BookOpen, Heart, Shield } from 'lucide-react';
import Navbar from './Navbar'; // ✅ Import Navbar Component
import Footer from './Footer'; // Import Footer Component

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* ✅ Navbar Component */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-cyan-300 mb-6">Empowering Veterinary Care</h1>
          <p className="text-xl text-gray-300">
          Welcome to HelpMyPet.ai, where AI meets compassion, precision, and the future of veterinary care.
          </p>
        </div>
      </div>

      {/* Mission & Impact - Variation 1: Modern Card with Two Icons */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gray-800 bg-opacity-50 p-8 md:p-12 rounded-xl shadow-lg">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Heart className="text-cyan-300" size={32} />
            <h2 className="text-3xl font-bold text-cyan-300">Our Mission and Impact</h2>
            <Shield className="text-cyan-300" size={32} />
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-300 leading-relaxed text-center mb-6">
              At HelpMyPet.ai, we're revolutionizing veterinary care by providing AI-powered tools that enhance 
              diagnostic accuracy, streamline workflows, and improve patient outcomes. We believe 
              every animal deserves access to the highest quality of care, supported by 
              cutting-edge technology.
            </p>
            <p className="text-gray-300 leading-relaxed text-center">
              Our platform helps veterinary professionals make more informed decisions, reduce diagnostic time, 
              and improve treatment success rates. The HelpMyPet.ai assistant is continuously learning and 
              adapting to new challenges, serving the evolving needs of veterinary practices worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-cyan-300 mb-12">How We Help</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-800 bg-opacity-50 rounded-xl">
            <Clock className="text-cyan-300 mb-4" size={32} />
            <h3 className="text-xl font-bold text-cyan-300 mb-3">24/7 AI Support</h3>
            <p className="text-gray-300">
              Access instant diagnostic assistance and treatment recommendations any time, 
              anywhere. Our AI never sleeps, ensuring you always have support when you need it.
            </p>
          </div>

          <div className="p-6 bg-gray-800 bg-opacity-50 rounded-xl">
            <Users className="text-cyan-300 mb-4" size={32} />
            <h3 className="text-xl font-bold text-cyan-300 mb-3">Collaborative Platform</h3>
            <p className="text-gray-300">
              Connect with colleagues, share cases, and learn from a growing community of 
              veterinary professionals. Knowledge sharing has never been easier.
            </p>
          </div>

          <div className="p-6 bg-gray-800 bg-opacity-50 rounded-xl">
            <BookOpen className="text-cyan-300 mb-4" size={32} />
            <h3 className="text-xl font-bold text-cyan-300 mb-3">Learning Resources</h3>
            <p className="text-gray-300">
              Access a comprehensive library of case studies, research papers, and educational 
              materials to stay current with the latest in veterinary medicine.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 bg-opacity-50 py-16 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-cyan-300 mb-6">Join the Future of Veterinary Care</h2>
          <p className="text-xl text-gray-300 mb-8">
            Experience how AI can transform your practice and improve patient outcomes.
          </p>
          <button className="px-8 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition duration-300">
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default AboutPage;