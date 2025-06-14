import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaPaw, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const decodedToken = JSON.parse(atob(storedToken.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp > currentTime) {
          setUserRole(parsedUser.role);
        } else {
          console.warn("🔴 Token expired! Logging out...");
          handleLogout();
        }
      } catch (error) {
        console.error("Error parsing user data or token:", error);
        handleLogout();
      }
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Close the mobile menu after clicking
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    setUserRole(null);
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full bg-slate-900/90 backdrop-blur-sm shadow-lg py-2 px-6 flex justify-between items-center z-50">
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
          {/* Authentication Button - Login or Logout */}
          {userRole ? (
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 shadow-lg"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => handleNavigation("/login")}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
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
          {/* Mobile Authentication Button */}
          {userRole ? (
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-300 shadow-lg"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => handleNavigation("/login")}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg"
            >
              Login
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;