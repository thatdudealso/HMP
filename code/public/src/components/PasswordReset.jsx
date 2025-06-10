import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Footer from './Footer';

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://your-ec2-public-ip:5001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        setStep(2);
      }
    } catch (error) {
      setMessage("Error resetting password");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://your-ec2-public-ip:5001/api/auth/verify-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: resetCode, newPassword }),
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) {
        // Redirect to login after successful reset
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch (error) {
      setMessage("Error verifying reset code");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-400 to-indigo-500 text-gray-900 flex flex-col justify-center items-center">
      <nav className="fixed top-0 left-0 w-full bg-white bg-opacity-90 shadow-lg py-4 px-6 flex justify-between items-center z-50 rounded-b-lg">
        <div className="text-2xl font-extrabold text-indigo-600 cursor-pointer" onClick={() => navigate("/")}>HelpMyPet.ai</div>
        <div className="hidden md:flex space-x-6">
          <button onClick={() => navigate("/")} className="text-gray-700 hover:text-indigo-600 transition">Home</button>
          <button onClick={() => navigate("/about")} className="text-gray-700 hover:text-indigo-600 transition">About</button>
        </div>
        <div className="hidden md:flex">
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition">Login</button>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
      
      {isOpen && (
        <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-white bg-opacity-95 flex flex-col items-center justify-center space-y-6 text-xl z-40">
          <button onClick={() => { navigate("/"); setIsOpen(false); }} className="text-gray-800 hover:text-indigo-600">Home</button>
          <button onClick={() => { navigate("/about"); setIsOpen(false); }} className="text-gray-800 hover:text-indigo-600">About</button>
          <button onClick={() => { navigate("/login"); setIsOpen(false); }} className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition">Login</button>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center mb-6">Reset Password</h2>
        
        {step === 1 ? (
          <form onSubmit={handlePasswordReset}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 transition">
              Send Reset Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Reset Code</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">New Password</label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 transition">
              Reset Password
            </button>
          </form>
        )}
        
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </div>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default PasswordReset;