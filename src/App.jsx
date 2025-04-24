import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ServicesPage from './components/ServicesPage';
import FeaturesPage from './components/FeaturesPage';
import ResourcesPage from './components/ResourcesPage';
import AboutPage from './components/AboutPage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import PasswordReset from './components/PasswordReset';
import DoctorLoginPage from './components/DoctorLoginPage';
import TechnicianLoginPage from './components/TechnicianLoginPage';
import StudentLoginPage from './components/StudentLoginPage';
import DoctorDashboard from './components/DoctorDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import StudentDashboard from './components/StudentDashboard';
import Footer from './components/Footer';

function App() {
  console.log('App rendering with routes');
  
  return (
    <Router basename="/">
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/reset-password" element={<PasswordReset />} />
            <Route path="/doctor-login" element={<DoctorLoginPage />} />
            <Route path="/technician-login" element={<TechnicianLoginPage />} />
            <Route path="/student-login" element={<StudentLoginPage />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="*" element={
              <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <h1 className="text-2xl">404 - Page Not Found</h1>
              </div>
            } />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 