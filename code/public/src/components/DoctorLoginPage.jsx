import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons for mobile menu

const getApiUrl = async () => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const localUrl = process.env.REACT_APP_LOCAL_API_URL;
  const ec2Url = process.env.REACT_APP_EC2_API_URL;

  if (!isLocalhost) return ec2Url || localUrl || "http://localhost:3001";

  // Try different ports in sequence
  const ports = [3001, 3002, 3003, 3004, 5000, 5001];
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/test`);
      if (response.ok) {
        return `http://localhost:${port}`;
      }
    } catch (error) {
      // Continue to next port
      continue;
    }
  }
  
  // If no port works, return the default
  return localUrl || "http://localhost:3001";
};

const DoctorLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const [apiUrl, setApiUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const initializeApiUrl = async () => {
      const url = await getApiUrl();
      setApiUrl(url);
    };
    initializeApiUrl();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "doctor" }), // Add the role
      });

      const data = await response.json();
      if (response.ok) {
        // Store token & user role
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role); // 🔹 Store user role for future use

        // Redirect doctor to dashboard
        navigate("/doctor-dashboard");
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-500 to-blue-600 text-white flex flex-col">

      {/* 🔹 Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-80 shadow-lg py-4 px-6 flex justify-between items-center z-50">
        
        {/* Logo */}
        <div 
          className="text-2xl font-extrabold text-cyan-300 cursor-pointer tracking-wide"
          onClick={() => navigate("/")}
        >
          HelpMyPet.ai
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-8">
          <button onClick={() => navigate("/")} className="text-gray-300 hover:text-cyan-300 transition duration-300">
            Home
          </button>
          <button onClick={() => navigate("/about")} className="text-gray-300 hover:text-cyan-300 transition duration-300">
            About
          </button>
        </div>

        {/* Desktop Login Button */}
        <div className="hidden md:flex">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* 🔹 Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center space-y-8 text-xl z-40 transition-all">
          <button onClick={() => { navigate("/"); setIsOpen(false); }} className="text-white hover:text-cyan-300 transition duration-300">
            Home
          </button>
          <button onClick={() => { navigate("/about"); setIsOpen(false); }} className="text-white hover:text-cyan-300 transition duration-300">
            About
          </button>
          <button onClick={() => { navigate("/login"); setIsOpen(false); }} className="px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md">
            Login
          </button>
        </div>
      )}

      {/* 🔹 Main Login Form */}
      <div className="relative z-10 flex flex-col justify-center items-center flex-grow px-6">
        <h2 className="text-4xl font-bold mb-6">Doctor Login</h2>
        <form 
          className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-gray-900"
          onSubmit={handleLogin}
        >
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="bg-blue-600 text-white py-2 px-4 rounded-lg w-full font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );  
};

export default DoctorLoginPage;