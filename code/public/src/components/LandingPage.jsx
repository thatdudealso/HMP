import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar'; // ✅ Import Navbar Component

// Create a carousel component for rotating between SVG files
const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    "student-dashboard-wireframe-dark.svg",
    "doctor-dashboard-wireframe.svg"
  ];

  useEffect(() => {
    // Auto-rotate images every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle manual navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Add keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-3xl opacity-20"></div>
      
      <div className="relative overflow-hidden rounded-3xl shadow-2xl h-full">
        <div 
          className="flex transition-transform duration-1000 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt=""
              className="w-full h-full object-contain flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button 
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/70 text-white p-2 rounded-full hover:bg-slate-700/90 transition"
        aria-label="Previous image"
      >
        ❮
      </button>
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/70 text-white p-2 rounded-full hover:bg-slate-700/90 transition"
        aria-label="Next image"
      >
        ❯
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-blue-400' : 'bg-slate-400'
            } transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide name indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/70 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex === 0 ? "Student Dashboard" : 
         currentIndex === 1 ? "Doctor Dashboard" : ""}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const navigate = useNavigate();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSubscribeStatus('Successfully subscribed!');
        setEmail('');
      } else {
        setSubscribeStatus(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setSubscribeStatus('Error subscribing. Please try again.');
    }
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* ✅ Navbar Component */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="block mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400">
                    AI-Powered
                  </span>
                </span>
                <span className="block mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400">
                    Veterinary
                  </span>
                </span>
                <span className="block mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400">
                    Intelligence
                  </span>
                </span>
                <span className="block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400">
                    at your
                  </span>
                  {' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-400">
                    Fingertips
                  </span>
                </span>
              </h1>
              <p className="text-xl text-gray-300">
                Empowering veterinary professionals with cutting-edge AI diagnostics, real-time analysis, and clinical decision support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/about"
                  className="px-8 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow-lg flex items-center justify-center"
                >
                  Learn More
                </Link>
                <button className="px-8 py-4 bg-slate-800 rounded-lg font-semibold hover:bg-slate-700 transition duration-300 shadow-lg flex items-center justify-center">
                  ▶ Watch Demo
                </button>
              </div>
            </div>
            <div className="relative hidden md:block h-[500px]">
              <ImageCarousel />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Comprehensive <span className="text-blue-400">Features</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "AI Diagnostic Assistant", description: "Real-time analysis of symptoms with customizable diagnosis workflows and seamless system integration.", icon: "🔍" },
              { title: "Medical Imaging Analysis", description: "Instant X-ray and MRI analysis with advanced anomaly detection and comparative database analysis.", icon: "📷" },
              { title: "Clinical Decision Support", description: "Evidence-based treatment recommendations and comprehensive drug interaction checks.", icon: "💡" },
              { title: "Student Learning Tools", description: "Interactive case studies and exam preparation modules with detailed performance tracking.", icon: "📚" },
              { title: "Laboratory Integration", description: "Automated test interpretation with trend analysis and abnormality detection capabilities.", icon: "🔬" },
              { title: "Practice Management", description: "Comprehensive patient history analytics with treatment success tracking and health insights.", icon: "📊" }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-slate-800/50 rounded-xl hover:bg-slate-800/70 transition duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-blue-400">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Section */}
      <div className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-blue-400">HelpMyPet.AI</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Advanced Technology", description: "Built on latest AI models" },
              { title: "Comprehensive Support", description: "24/7 expert assistance" },
              { title: "Continuous Learning", description: "Weekly database updates" },
              { title: "Educational Focus", description: "Supporting vet community" }
            ].map((reason, index) => (
              <div key={index} className="p-6 bg-slate-800/50 rounded-xl text-center">
                <h3 className="text-xl font-semibold mb-2 text-blue-400">{reason.title}</h3>
                <p className="text-gray-300">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Resources</h4>
            <ul className="space-y-2 text-gray-300">
              <li><button className="hover:text-blue-400">Blog</button></li>
              <li><button className="hover:text-blue-400">Case Studies</button></li>
              <li><button className="hover:text-blue-400">Research Papers</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><button className="hover:text-blue-400">Documentation</button></li>
              <li><button className="hover:text-blue-400">Training</button></li>
              <li><button className="hover:text-blue-400">FAQs</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li><button className="hover:text-blue-400">About</button></li>
              <li><button className="hover:text-blue-400">Careers</button></li>
              <li><button className="hover:text-blue-400">Press</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Newsletter</h4>
            <p className="text-gray-300">Stay updated with latest veterinary AI developments</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white flex-grow"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Subscribe
                </button>
              </div>
              {subscribeStatus && (
                <p className={`text-sm ${subscribeStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {subscribeStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;