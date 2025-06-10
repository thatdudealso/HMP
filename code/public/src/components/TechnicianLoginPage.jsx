import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

const TechnicianLoginPage = () => {
  const [email, setEmail] = useState(""); // 🔹 Changed 'username' to 'email'
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ email, password, role: "technician" }), // Add the role
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role); // 🔹 Store role in local storage

        if (data.user.role === "technician") {
          navigate("/technician-dashboard"); // 🔹 Redirect to Technician Dashboard
        } else {
          alert("You are not a technician.");
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-500 to-yellow-600 text-white">
      
      <nav className="w-full bg-gray-900 bg-opacity-80 shadow-lg py-4 px-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-cyan-300 cursor-pointer" onClick={() => navigate("/")}>
          HelpMyPet.ai
        </div>
        <div className="flex space-x-6">
          <button onClick={() => navigate("/")} className="text-white hover:text-cyan-300 transition duration-300">
            Home
          </button>
          <button onClick={() => navigate("/about")} className="text-white hover:text-cyan-300 transition duration-300">
            About
          </button>
        </div>
        <div>
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md"
          >
            Login
          </button>
        </div>
      </nav>

      <div className="flex flex-col justify-center items-center flex-grow">
        <h2 className="text-4xl font-bold mb-6">Technician Login</h2>
        <form className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-gray-900" onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Email</label> 
            <input
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border px-3 py-2 rounded-lg" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-orange-600 text-white py-2 px-4 rounded-lg w-full font-semibold hover:bg-orange-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default TechnicianLoginPage;