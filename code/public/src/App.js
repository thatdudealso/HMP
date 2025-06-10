
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import DoctorLoginPage from './components/DoctorLoginPage';
import StudentLoginPage from './components/StudentLoginPage';
import TechnicianLoginPage from './components/TechnicianLoginPage';
import DoctorDashboard from './components/DoctorDashboard';
import StudentDashboard from './components/StudentDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import AboutPage from './components/AboutPage';
import FeaturesPage from './components/FeaturesPage';
import ResourcesPage from './components/ResourcesPage';
import ServicesPage from './components/ServicesPage';
import PasswordReset from './components/PasswordReset';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/doctor-login" element={<DoctorLoginPage />} />
          <Route path="/student-login" element={<StudentLoginPage />} />
          <Route path="/technician-login" element={<TechnicianLoginPage />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/reset-password" element={<PasswordReset />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 