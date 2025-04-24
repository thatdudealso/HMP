import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { FaUserMd, FaGraduationCap, FaEye, FaEyeSlash } from "react-icons/fa";
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

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [practiceType, setPracticeType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experience, setExperience] = useState("");
  const [certificationID, setCertificationID] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [university, setUniversity] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [country, setCountry] = useState("");

  // Toggle password visibility in Step 1
  const [showPasswordStep1, setShowPasswordStep1] = useState(false);
  // Toggle password visibility in Step 3 (Review)
  const [showPasswordReview, setShowPasswordReview] = useState(false);

  const navigate = useNavigate();

  const validateStep1 = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !countryCode ||
      !country
    ) {
      alert("Please fill in all required fields");
      return false;
    }
    if (phoneNumber.length !== 10) {
      alert("Phone number must be 10 digits");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!role || !practiceType) {
      alert("Please select your role and practice type");
      return false;
    }
    if (role === "doctor" && (!licenseNumber || !experience)) {
      alert("Doctors must provide License Number and Years of Experience");
      return false;
    }
    if (role === "technician" && (!certificationID.trim() || !clinicName.trim())) {
      alert("Technicians must provide Certification ID and Clinic Name");
      return false;
    }
    if (role === "student" && (!university || !graduationYear)) {
      alert("Students must provide University and Graduation Year");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const userData = {
      firstName,
      lastName,
      email,
      countryCode,
      phoneNumber,
      country,
      password,
      role,
      practiceType,
      ...(role === "doctor" && { licenseNumber, experience }),
      ...(role === "technician" && { certificationID, clinicName }),
      ...(role === "student" && { university, graduationYear }),
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        alert("Account Created Successfully!");
        navigate("/login");
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error signing up");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      <Navbar />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute top-0 left-0 w-full h-full bg-opacity-20 backdrop-blur-lg"></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400 opacity-30 blur-3xl animate-pulse"></div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex-grow flex flex-col items-center justify-center pt-24">
        <div className="w-full max-w-2xl bg-white bg-opacity-10 backdrop-blur-xl p-8 rounded-3xl shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Create Your Account</h2>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => {
              let circleColor = "bg-white bg-opacity-30"; // default
              if (stepNumber < step) {
                circleColor = "bg-blue-500"; // completed steps
              } else if (stepNumber === step) {
                circleColor = "bg-green-500"; // current step
              }
              let lineColor = "bg-white bg-opacity-30";
              if (stepNumber < step) {
                lineColor = "bg-blue-500";
              }
              return (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${circleColor}`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-0.5 ${lineColor}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                  required
                />
              </div>
              {/* Password with eye toggle */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type={showPasswordStep1 ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordStep1(!showPasswordStep1)}
                  className="absolute right-3 bottom-2 text-gray-300 hover:text-white"
                >
                  {showPasswordStep1 ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setRole("doctor")}
                  className={`p-4 rounded-lg transition-all ${
                    role === "doctor"
                      ? "bg-blue-600 text-white"
                      : "bg-white bg-opacity-10 text-white"
                  } hover:bg-blue-700`}
                >
                  <FaUserMd className="text-3xl mb-2 mx-auto" />
                  <span>Doctor</span>
                </button>
                <button
                  onClick={() => setRole("technician")}
                  className={`p-4 rounded-lg transition-all ${
                    role === "technician"
                      ? "bg-indigo-600 text-white"
                      : "bg-white bg-opacity-10 text-white"
                  } hover:bg-indigo-700`}
                >
                  <GiSyringe className="text-3xl mb-2 mx-auto transform rotate-45" />
                  <span>Technician</span>
                </button>
                <button
                  onClick={() => setRole("student")}
                  className={`p-4 rounded-lg transition-all ${
                    role === "student"
                      ? "bg-purple-600 text-white"
                      : "bg-white bg-opacity-10 text-white"
                  } hover:bg-purple-700`}
                >
                  <FaGraduationCap className="text-3xl mb-2 mx-auto" />
                  <span>Student</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Practice Type
                </label>
                <select
                  value={practiceType}
                  onChange={(e) => setPracticeType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                  required
                >
                  <option value="">Select Practice Type</option>
                  <option value="small animal">Small Animal</option>
                  <option value="farm">Farm</option>
                  <option value="equine">Equine</option>
                  <option value="lab animal">Lab Animal</option>
                  <option value="industry">Industry</option>
                  <option value="aquatics">Aquatics</option>
                  <option value="exotics">Exotics</option>
                  <option value="zoo/wildlife">Zoo/Wildlife</option>
                </select>
              </div>

              {role === "doctor" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                      required
                    />
                  </div>
                </>
              )}

              {role === "technician" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Certification ID
                    </label>
                    <input
                      type="text"
                      value={certificationID}
                      onChange={(e) => setCertificationID(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Clinic Name
                    </label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                      required
                    />
                  </div>
                </>
              )}

              {role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      University
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3 - Review Layout (Two-column, as in wireframe) */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-semibold text-center">
                Review Your Information
              </h3>
              <p className="text-center mb-6">
                Please review your information before submitting
              </p>

              <div className="bg-white bg-opacity-20 p-4 rounded-lg flex flex-col md:flex-row">
                {/* Left Column: "Profile" summary */}
                <div className="w-full md:w-1/2 flex flex-col items-center p-4">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
                  {/* Name & Role */}
                  <div className="text-lg font-semibold">
                    {firstName} {lastName}
                  </div>
                  <div className="text-sm text-gray-300 capitalize mt-1">
                    {role || "No Role Selected"}
                  </div>
                </div>

                {/* Divider line (hidden on small screens) */}
                <div className="hidden md:block w-px bg-gray-300 mx-4" />

                {/* Right Column: Detailed info */}
                <div className="w-full md:w-1/2 mt-6 md:mt-0 p-4">
                  {/* Email */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400">Email:</div>
                    <div className="text-sm">{email}</div>
                  </div>
                  {/* Phone Number */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400">Phone:</div>
                    <div className="text-sm">{phoneNumber}</div>
                  </div>
                  {/* Country */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400">Country:</div>
                    <div className="text-sm">{country}</div>
                  </div>
                  {/* Country Code */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400">Country Code:</div>
                    <div className="text-sm">{countryCode}</div>
                  </div>
                  {/* Password w/ toggle */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400">Password:</div>
                    <div className="text-sm flex items-center">
                      {showPasswordReview ? password : "••••••••"}
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordReview(!showPasswordReview)
                        }
                        className="ml-2 text-gray-300 hover:text-white"
                      >
                        {showPasswordReview ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  {/* Practice Type */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400">Practice Type:</div>
                    <div className="text-sm">{practiceType}</div>
                  </div>
                  {/* Role-Specific Fields */}
                  {role === "doctor" && (
                    <>
                      <div className="mb-4">
                        <div className="text-xs text-gray-400">
                          License Number:
                        </div>
                        <div className="text-sm">{licenseNumber}</div>
                      </div>
                      <div className="mb-4">
                        <div className="text-xs text-gray-400">
                          Years of Experience:
                        </div>
                        <div className="text-sm">{experience}</div>
                      </div>
                    </>
                  )}
                  {role === "technician" && (
                    <>
                      <div className="mb-4">
                        <div className="text-xs text-gray-400">
                          Certification ID:
                        </div>
                        <div className="text-sm">{certificationID}</div>
                      </div>
                      <div className="mb-4">
                        <div className="text-xs text-gray-400">Clinic:</div>
                        <div className="text-sm">{clinicName}</div>
                      </div>
                    </>
                  )}
                  {role === "student" && (
                    <>
                      <div className="mb-4">
                        <div className="text-xs text-gray-400">University:</div>
                        <div className="text-sm">{university}</div>
                      </div>
                      <div className="mb-4">
                        <div className="text-xs text-gray-400">
                          Graduation Year:
                        </div>
                        <div className="text-sm">{graduationYear}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Buttons at bottom */}
          <div className="flex justify-between mt-6">
            {/* If on Step 3, wireframe says "Edit" instead of "Back" */}
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {step === 3 ? "Edit" : "Back"}
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
              >
                Next
              </button>
            ) : (
              // Wireframe says "Submit" instead of "Create Account"
              <button
                onClick={handleSignUp}
                className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors ml-auto"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;