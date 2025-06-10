import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Navbar remains untouched
import { FaUserMd, FaTools, FaGraduationCap } from "react-icons/fa";
import { GiSyringe } from "react-icons/gi";

const getApiUrl = () => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const localUrl = process.env.REACT_APP_LOCAL_API_URL;
  const ec2Url = process.env.REACT_APP_EC2_API_URL;

  if (isLocalhost) return localUrl || "http://localhost:5000";
  return ec2Url || localUrl || "http://localhost:5000";
};

const API_URL = getApiUrl();

const LoginPage = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState("checking");

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    try {
      const response = await fetch(`${API_URL}/test`);
      if (response.ok) setServerStatus("connected");
      else throw new Error("Server unreachable");
    } catch (error) {
      setServerStatus("disconnected");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) return alert("Please select a role first!");

    const loginData = { email, password, role }; // Add role to the login data

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate(`/${data.user.role}-dashboard`);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      alert("Connection error. Check your internet or server.");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white">
      {/* ✅ Navbar remains unchanged */}
      <Navbar />

      {/* 🌊 Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-opacity-20 backdrop-blur-lg"></div>
      </div>

      {/* 🔄 Login Form */}
      <div className="relative z-10 w-full max-w-lg bg-white bg-opacity-10 backdrop-blur-xl p-8 rounded-3xl shadow-lg text-center">
        <h2 className="text-3xl font-semibold text-white mb-6">
          Login or Sign Up
        </h2>

        {/* 📌 Role Selection (Now Buttons but Uses Original Dropdown Logic) */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setRole("doctor")}
            className={`p-4 rounded-lg transition-all ${
              role === "doctor" ? "bg-blue-600 text-white" : "bg-white text-blue-600"
            } hover:bg-blue-700`}
          >
            <FaUserMd className="text-3xl mb-1" />
            Doctor
          </button>
          <button
            onClick={() => setRole("technician")}
            className={`p-4 rounded-lg transition-all ${
              role === "technician" ? "bg-indigo-600 text-white" : "bg-white text-indigo-600"
            } hover:bg-indigo-700`}
          >
            <GiSyringe className="text-3xl mb-1 transform scale-x-100 rotate-45" />
            Technician
          </button>
          <button
            onClick={() => setRole("student")}
            className={`p-4 rounded-lg transition-all ${
              role === "student" ? "bg-purple-600 text-white" : "bg-white text-purple-600"
            } hover:bg-purple-700`}
          >
            <FaGraduationCap className="text-3xl mb-1" />
            Student
          </button>
        </div>

        {/* 📌 Role Dropdown (Hidden but Used for API Consistency) */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="hidden"
        >
          <option value="">Select your role</option>
          <option value="doctor">Doctor</option>
          <option value="technician">Technician</option>
          <option value="student">Student</option>
        </select>

        {/* Email & Password Fields */}
        {role && role !== "signup" && (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-200 text-left">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-200 text-left">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition mt-4"
            >
              {role === "signup" ? "Continue to Sign Up" : "Login"}
            </button>
          </form>
        )}

        {/* Forgot Password + Sign Up Link */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/reset-password")}
            className="text-indigo-300 hover:underline"
          >
            Forgot Password?
          </button>
          {/* ➡️ New Sign Up button */}
          <button
            onClick={() => navigate("/signup")}
            className="text-indigo-300 hover:underline ml-4"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </div>

      {/* 🔴 Server Connection Warning */}
      {serverStatus === "disconnected" && (
        <div className="fixed top-0 w-full bg-red-500 text-white p-2 text-center">
          ⚠️ Cannot connect to server. Please check if the backend is running.
        </div>
      )}

      {/* 🔻 Animated Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400 opacity-30 blur-3xl animate-pulse"></div>
    </div>
  );
};

export default LoginPage;