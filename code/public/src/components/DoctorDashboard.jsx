import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "./DashboardNavbar";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const DoctorDashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    sex: "",
    reproductive_status: "",
    vaccination_status: "",
    previous_conditions: "",
    current_medications: ""
  });
  const [vitals, setVitals] = useState({
    temperature: "",
    heartRate: "",
    respiratoryRate: ""
  });
  const [isNewChat, setIsNewChat] = useState(true);
  const [clinicalExam, setClinicalExam] = useState({
    general_appearance: "",
    hydration_status: "",
    mucous_membrane: "",
    lymph_nodes: "",
    auscultation: "",
    abdominal_palpation: "",
    pain_score: "",
    other_findings: ""
  });
  const [presentingProblems, setPresentingProblems] = useState({
    main_complaint: "",
    duration: "",
    progression: "",
    previous_treatments: "",
    diet_changes: "",
    environment_changes: ""
  });
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  console.log("User data from localStorage:", user);

  const API_URL = process.env.REACT_APP_LOCAL_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    console.log('User data:', user);
    if (user && user.name) {
      const nameParts = user.name.split(' ');
      const capitalizedLastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
      setLastName(capitalizedLastName);
    }
    fetchHistory();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prevPrompt) => prevPrompt + " " + transcript);
      };
      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/prompt/history/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      if (data.success) {
        setSessions(data.history || []);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching history:', error);
      setError("Failed to fetch history");
      return null;
    }
  };

  const handleVoiceCommand = () => {
    if (recognition) {
      if (!isListening) {
        recognition.start();
        setIsListening(true);
      } else {
        recognition.stop();
        setIsListening(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        if (response.ok) {
          // Update the prompt with the extracted text
          setPrompt((prevPrompt) => prevPrompt + " " + data.text);
          
          // If there's clinical examination data in the analysis, update the form
          if (data.analysis.clinical_analysis) {
            setClinicalExam(prevExam => ({
              ...prevExam,
              general_appearance: data.analysis.clinical_analysis.assessment || prevExam.general_appearance,
              other_findings: data.analysis.clinical_analysis.recommendations?.join('\n') || prevExam.other_findings
            }));
          }
          
          // If there's patient information in the structured data, update the form
          if (data.analysis.structured_data.patient_info) {
            setPatientInfo(prevInfo => ({
              ...prevInfo,
              ...data.analysis.structured_data.patient_info
            }));
          }
          
          // If there are presenting problems identified, update the form
          if (data.analysis.structured_data.presenting_problems) {
            setPresentingProblems(prevProblems => ({
              ...prevProblems,
              ...data.analysis.structured_data.presenting_problems
            }));
          }
        } else {
          setError("Failed to process file");
        }
      } catch (error) {
        console.error("File upload error:", error);
        setError("Failed to upload file");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewChat = () => {
    setIsNewChat(true);
    setCurrentSession(null);
    setPrompt("");
    setResponse("");
    setPatientInfo({
      name: "",
      species: "",
      breed: "",
      age: "",
      weight: "",
      sex: "",
      reproductive_status: "",
      vaccination_status: "",
      previous_conditions: "",
      current_medications: ""
    });
    setVitals({
      temperature: "",
      heartRate: "",
      respiratoryRate: ""
    });
    setClinicalExam({
      general_appearance: "",
      hydration_status: "",
      mucous_membrane: "",
      lymph_nodes: "",
      auscultation: "",
      abdominal_palpation: "",
      pain_score: "",
      other_findings: ""
    });
    setPresentingProblems({
      main_complaint: "",
      duration: "",
      progression: "",
      previous_treatments: "",
      diet_changes: "",
      environment_changes: ""
    });
  };

  const fahrenheitToCelsius = (fahrenheit) => {
    return ((fahrenheit - 32) * 5 / 9).toFixed(1);
  };

  const celsiusToFahrenheit = (celsius) => {
    return (celsius * 9/5 + 32).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate minimum required fields
    if (isNewChat && !patientInfo.name) {
      setError("Patient name is required");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        prompt,
        userId: user.id,
        sessionId: currentSession?._id,
        patientInfo: isNewChat ? patientInfo : currentSession?.patientInfo,
        clinicalExamination: isNewChat ? clinicalExam : currentSession?.clinicalExamination,
        vitals: isNewChat ? vitals : currentSession?.vitals,
        presentingProblems: isNewChat ? presentingProblems : currentSession?.presentingProblems,
        isFollowUp: !isNewChat
      };

      const response = await fetch(`${API_URL}/api/prompt/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server responded with ${response.status}`);
      }
      
      setResponse(formatResponse(data.response));
      setPrompt("");
      
      // Update history safely
      const updatedHistory = Array.isArray(history) ? [...history] : [];
      updatedHistory.push({
        role: 'user',
        content: payload.prompt
      });
      setHistory(updatedHistory);

      // Only try to update session if we got a valid response
      if (data.sessionId) {
        if (isNewChat) {
          await fetchHistory();
          const sessions = await fetchHistory();
          if (sessions?.history) {
            const newSession = sessions.history.find(s => s._id === data.sessionId);
            if (newSession) {
              setCurrentSession(newSession);
              setIsNewChat(false);
            }
          }
        } else {
          await fetchHistory();
        }
      }

    } catch (error) {
      console.error("Error submitting prompt:", error);
      setError(error.message || "Failed to submit prompt. Please try again.");
      // Still show the response if we have one, even if there was an error updating history
      if (error.response?.data?.response) {
        setResponse(formatResponse(error.response.data.response));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (response) => {
    if (!response) {
      return "No response available";
    }

    try {
      const parsedResponse = typeof response === 'string' ? 
        JSON.parse(response) : response;

      let formatted = "";
      
      // Assessment
      if (parsedResponse?.assessment) {
        formatted += "ASSESSMENT\n";
        formatted += "-----------\n";
        formatted += `${parsedResponse.assessment}\n\n`;
      }

      // Clinical Findings
      if (parsedResponse?.clinicalFindings?.length) {
        formatted += "CLINICAL FINDINGS\n";
        formatted += "-----------------\n";
        parsedResponse.clinicalFindings.forEach((finding, index) => {
          formatted += `${index + 1}. ${finding.system}: ${finding.observation}\n`;
          if (finding.details) formatted += `   Details: ${finding.details}\n`;
          formatted += "\n";
        });
      }

      // Provisional Diagnosis
      if (parsedResponse?.provisionalDiagnosis?.length) {
        formatted += "PROVISIONAL DIAGNOSIS\n";
        formatted += "--------------------\n";
        parsedResponse.provisionalDiagnosis.forEach((diagnosis, index) => {
          formatted += `${index + 1}. ${diagnosis.condition}\n`;
          if (diagnosis.likelihood) formatted += `   Likelihood: ${diagnosis.likelihood}\n`;
          if (diagnosis.reasoning) formatted += `   Reasoning: ${diagnosis.reasoning}\n`;
          formatted += "\n";
        });
      }

      // Further Diagnostic Tests
      if (parsedResponse?.diagnosticTests?.length) {
        formatted += "FURTHER DIAGNOSTIC TESTS\n";
        formatted += "-----------------------\n";
        parsedResponse.diagnosticTests.forEach((test, index) => {
          formatted += `${index + 1}. ${test.name}\n`;
          if (test.rationale) formatted += `   Rationale: ${test.rationale}\n`;
          if (test.priority) formatted += `   Priority: ${test.priority}\n`;
          formatted += "\n";
        });
      }

      // Treatment Plan
      if (parsedResponse?.treatmentPlan) {
        formatted += "TREATMENT PLAN\n";
        formatted += "--------------\n";
        if (parsedResponse.treatmentPlan.medications) {
          formatted += "Medications:\n";
          parsedResponse.treatmentPlan.medications.forEach(med => {
            formatted += `- ${med.name}: ${med.dosage}\n`;
            if (med.frequency) formatted += `  Frequency: ${med.frequency}\n`;
            if (med.duration) formatted += `  Duration: ${med.duration}\n`;
          });
          formatted += "\n";
        }
        if (parsedResponse.treatmentPlan.procedures) {
          formatted += "Procedures:\n";
          parsedResponse.treatmentPlan.procedures.forEach(proc => {
            formatted += `- ${proc}\n`;
          });
          formatted += "\n";
        }
        if (parsedResponse.treatmentPlan.nursing) {
          formatted += "Nursing Care:\n";
          parsedResponse.treatmentPlan.nursing.forEach(care => {
            formatted += `- ${care}\n`;
          });
          formatted += "\n";
        }
        if (parsedResponse.treatmentPlan.dietary) {
          formatted += "Dietary Recommendations:\n";
          formatted += `${parsedResponse.treatmentPlan.dietary}\n\n`;
        }
      }

      // Follow-Up
      if (parsedResponse?.followUp) {
        formatted += "FOLLOW-UP\n";
        formatted += "---------\n";
        if (parsedResponse.followUp.timing) {
          formatted += `Next Visit: ${parsedResponse.followUp.timing}\n`;
        }
        if (parsedResponse.followUp.monitoring) {
          formatted += "Monitoring Parameters:\n";
          parsedResponse.followUp.monitoring.forEach(param => {
            formatted += `- ${param}\n`;
          });
        }
        if (parsedResponse.followUp.warningSignals) {
          formatted += "\nWarning Signs to Watch For:\n";
          parsedResponse.followUp.warningSignals.forEach(warning => {
            formatted += `- ${warning}\n`;
          });
        }
        formatted += "\n";
      }

      return formatted || "No structured response available.";
    } catch (error) {
      console.error('Error formatting response:', error);
      return typeof response === 'string' ? 
        response : 
        JSON.stringify(response || {}, null, 2);
    }
  };

  const formatInteraction = (interaction) => {
    try {
      const response = typeof interaction.response === 'string' 
        ? JSON.parse(interaction.response) 
        : interaction.response;

      return {
        question: interaction.question,
        timestamp: interaction.timestamp,
        type: interaction.type,
        formattedResponse: formatResponse(response)
      };
    } catch (error) {
      console.error('Error formatting interaction:', error);
      return {
        question: interaction.question,
        timestamp: interaction.timestamp,
        type: interaction.type,
        formattedResponse: 'Error formatting response'
      };
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sessions.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col">
      <DashboardNavbar />
      <div className="flex flex-col items-center p-6 pt-14 w-full max-w-6xl mx-auto">
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Doctor Dashboard</h1>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg shadow-md transition"
          >
            New Chat
          </button>
        </div>

        <div className="w-full flex gap-6">
          {/* Main Chat Area */}
          <div className="flex-grow">
            <div className="text-2xl font-semibold mb-6 text-white">
              Welcome Dr. {lastName}
            </div>

            {isNewChat && (
              <>
                {/* Basic Patient Information */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Patient Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Patient Name *"
                      value={patientInfo.name}
                      onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Species *"
                      value={patientInfo.species}
                      onChange={(e) => setPatientInfo({...patientInfo, species: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Breed"
                      value={patientInfo.breed}
                      onChange={(e) => setPatientInfo({...patientInfo, breed: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Age *"
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Weight (kg)"
                      value={patientInfo.weight}
                      onChange={(e) => setPatientInfo({...patientInfo, weight: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    />
                    <select
                      value={patientInfo.sex}
                      onChange={(e) => setPatientInfo({...patientInfo, sex: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    >
                      <option value="">Select Sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <select
                      value={patientInfo.reproductive_status}
                      onChange={(e) => setPatientInfo({...patientInfo, reproductive_status: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    >
                      <option value="">Reproductive Status</option>
                      <option value="intact">Intact</option>
                      <option value="neutered">Neutered</option>
                      <option value="spayed">Spayed</option>
                    </select>
                  </div>
                </div>

                {/* Vitals */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Vital Signs (Optional)</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Temperature (°F) - Optional"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Heart Rate (bpm) - Optional"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    />
                    <input
                      type="text"
                      placeholder="Respiratory Rate (bpm) - Optional"
                      value={vitals.respiratoryRate}
                      onChange={(e) => setVitals({...vitals, respiratoryRate: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    />
                  </div>
                </div>

                {/* Clinical Examination */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Clinical Examination</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <textarea
                      placeholder="General Appearance"
                      value={clinicalExam.general_appearance}
                      onChange={(e) => setClinicalExam({...clinicalExam, general_appearance: e.target.value})}
                      className="p-2 rounded text-gray-900"
                      rows="2"
                    />
                    <select
                      value={clinicalExam.hydration_status}
                      onChange={(e) => setClinicalExam({...clinicalExam, hydration_status: e.target.value})}
                      className="p-2 rounded text-gray-900"
                    >
                      <option value="">Hydration Status</option>
                      <option value="normal">Normal</option>
                      <option value="mild">Mild Dehydration</option>
                      <option value="moderate">Moderate Dehydration</option>
                      <option value="severe">Severe Dehydration</option>
                    </select>
                    <textarea
                      placeholder="Other Clinical Findings"
                      value={clinicalExam.other_findings}
                      onChange={(e) => setClinicalExam({...clinicalExam, other_findings: e.target.value})}
                      className="p-2 rounded text-gray-900"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Presenting Problems */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Presenting Problems</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <textarea
                      placeholder="Main Complaint *"
                      value={presentingProblems.main_complaint}
                      onChange={(e) => setPresentingProblems({...presentingProblems, main_complaint: e.target.value})}
                      className="p-2 rounded text-gray-900"
                      rows="3"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Duration of Problem"
                        value={presentingProblems.duration}
                        onChange={(e) => setPresentingProblems({...presentingProblems, duration: e.target.value})}
                        className="p-2 rounded text-gray-900"
                      />
                      <select
                        value={presentingProblems.progression}
                        onChange={(e) => setPresentingProblems({...presentingProblems, progression: e.target.value})}
                        className="p-2 rounded text-gray-900"
                      >
                        <option value="">Problem Progression</option>
                        <option value="improving">Improving</option>
                        <option value="stable">Stable</option>
                        <option value="worsening">Worsening</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Previous Treatments (if any)"
                      value={presentingProblems.previous_treatments}
                      onChange={(e) => setPresentingProblems({...presentingProblems, previous_treatments: e.target.value})}
                      className="p-2 rounded text-gray-900"
                      rows="2"
                    />
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="mb-8 w-full">
              <div className="mb-4">
                <h4 className="text-white mb-2">
                  {isNewChat ? "Enter Presenting Complaints" : "Enter Follow-up Questions"}
                </h4>
                <textarea
                  className="w-full bg-white border border-gray-300 p-4 rounded-lg text-gray-900 placeholder-gray-500 mb-4 shadow-md focus:ring-2 focus:ring-indigo-400"
                  placeholder={
                    isNewChat 
                      ? "Enter presenting complaints..." 
                      : "Ask follow-up questions about diagnosis, treatment, or any specific concerns..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows="4"
                />
              </div>
              
              <div className="flex space-x-4 justify-center w-full mb-4">
                <button
                  type="button"
                  onClick={handleVoiceCommand}
                  className={`p-3 rounded-full transition shadow-md ${
                    isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>

                <label className="cursor-pointer bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg shadow-md transition">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.pdf,.doc,.docx"
                  />
                  Upload File
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg transition shadow-md ${
                    loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Processing..." : "Submit"}
                </button>
              </div>
            </form>

            {/* Response Section */}
            {(loading || response) && (
              <div className="mb-8 w-full">
                {loading ? (
                  <div className="bg-white p-6 rounded-lg shadow-lg text-gray-900">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                      <span className="ml-2">Processing...</span>
                    </div>
                  </div>
                ) : response ? (
                  <div className="bg-white p-6 rounded-lg shadow-lg text-gray-900">
                    <h2 className="text-xl font-semibold mb-4">Response:</h2>
                    <div className="whitespace-pre-wrap">{response}</div>
                  </div>
                ) : null}
              </div>
            )}

            {error && (
              <div className="mb-8 w-full">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Patient Info Sidebar - Show only after first prompt */}
          {!isNewChat && currentSession && (
            <div className="w-80 bg-white rounded-lg shadow-lg p-6 h-fit text-gray-900">
              <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Name:</p>
                  <p>{currentSession.patientInfo.name}</p>
                </div>
                <div>
                  <p className="font-medium">Species:</p>
                  <p>{currentSession.patientInfo.species}</p>
                </div>
                <div>
                  <p className="font-medium">Breed:</p>
                  <p>{currentSession.patientInfo.breed}</p>
                </div>
                <div>
                  <p className="font-medium">Age:</p>
                  <p>{currentSession.patientInfo.age}</p>
                </div>
                <div>
                  <p className="font-medium">Weight:</p>
                  <p>{currentSession.patientInfo.weight} kg</p>
                </div>

                <div className="border-t pt-3 mt-4">
                  <h4 className="font-semibold mb-2">Vitals</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">Temperature:</p>
                      <p>{vitals.temperature}°F ({fahrenheitToCelsius(vitals.temperature)}°C)</p>
                    </div>
                    <div>
                      <p className="font-medium">Heart Rate:</p>
                      <p>{vitals.heartRate} bpm</p>
                    </div>
                    <div>
                      <p className="font-medium">Respiratory Rate:</p>
                      <p>{vitals.respiratoryRate} bpm</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg w-full text-gray-900">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Case History</h2>
            {sessions.length > 0 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  Previous Case
                </button>
                <span className="text-sm">
                  Case {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  Next Case
                </button>
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <p className="text-gray-500">No case history yet</p>
          ) : (
            <>
              {currentItems.map((session) => (
                <div key={session._id} className="mb-8 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Case Header */}
                  <div className="bg-indigo-50 p-4 rounded-t-lg border-b border-indigo-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-indigo-800">
                          {(session.patientInfo?.name || session.prompt?.patientInfo?.name || 'Unknown Patient')}
                        </h3>
                        <p className="text-sm text-indigo-600">
                          Case Started: {new Date(session.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-sm text-indigo-700">
                        <p>
                          {(session.patientInfo?.species || session.prompt?.patientInfo?.species)} • 
                          {(session.patientInfo?.breed || session.prompt?.patientInfo?.breed)}
                        </p>
                        <p>
                          {(session.patientInfo?.age || session.prompt?.patientInfo?.age)} • 
                          {(session.patientInfo?.weight || session.prompt?.patientInfo?.weight)} kg
                        </p>
                        <p>
                          {(session.vitals?.temperature || session.prompt?.patientInfo?.temperature)} • 
                          {(session.vitals?.heartRate || session.prompt?.patientInfo?.heartRate)} bpm
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Case Content */}
                  <div className="p-4">
                    {/* Initial Consultation */}
                    <div className="mb-6">
                      <h4 className="font-medium text-indigo-600 mb-3">Initial Consultation</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Patient Info & Clinical Exam */}
                        <div className="space-y-4">
                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium text-gray-700 mb-2">Clinical Examination</h5>
                            {(session.clinicalExamination || session.prompt?.clinicalExamination) && (
                              <div className="space-y-2">
                                {(session.clinicalExamination?.general_appearance || session.prompt?.clinicalExamination?.general_appearance) && (
                                  <p>
                                    <span className="font-medium">General Appearance:</span> 
                                    {session.clinicalExamination?.general_appearance || session.prompt?.clinicalExamination?.general_appearance}
                                  </p>
                                )}
                                {(session.clinicalExamination?.hydration_status || session.prompt?.clinicalExamination?.hydration_status) && (
                                  <p>
                                    <span className="font-medium">Hydration:</span> 
                                    {session.clinicalExamination?.hydration_status || session.prompt?.clinicalExamination?.hydration_status}
                                  </p>
                                )}
                                {(session.clinicalExamination?.other_findings || session.prompt?.clinicalExamination?.other_findings) && (
                                  <p>
                                    <span className="font-medium">Other Findings:</span> 
                                    {session.clinicalExamination?.other_findings || session.prompt?.clinicalExamination?.other_findings}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="bg-white p-3 rounded border">
                            <h5 className="font-medium text-gray-700 mb-2">Vital Signs</h5>
                            {(session.vitals || session.prompt?.patientInfo) && (
                              <div className="space-y-2">
                                {(session.vitals?.temperature || session.prompt?.patientInfo?.temperature) && (
                                  <p>
                                    <span className="font-medium">Temperature:</span> 
                                    {session.vitals?.temperature || session.prompt?.patientInfo?.temperature}
                                  </p>
                                )}
                                {(session.vitals?.heartRate || session.prompt?.patientInfo?.heartRate) && (
                                  <p>
                                    <span className="font-medium">Heart Rate:</span> 
                                    {session.vitals?.heartRate || session.prompt?.patientInfo?.heartRate}
                                  </p>
                                )}
                                {(session.vitals?.respiratoryRate || session.prompt?.patientInfo?.respiratoryRate) && (
                                  <p>
                                    <span className="font-medium">Respiratory Rate:</span> 
                                    {session.vitals?.respiratoryRate || session.prompt?.patientInfo?.respiratoryRate}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Initial AI Assessment */}
                        <div className="bg-white p-3 rounded border">
                          <h5 className="font-medium text-gray-700 mb-2">Initial Assessment</h5>
                          {(session.interactions?.[0] || session.response) && (
                            <div className="whitespace-pre-wrap text-sm">
                              {formatInteraction(session.interactions?.[0] || {
                                question: session.prompt?.presentingComplaints?.mainComplaint || '',
                                response: session.response,
                                timestamp: session.createdAt,
                                type: 'initial'
                              }).formattedResponse}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Interactions */}
                    {((session.interactions?.length > 1) || (session.prompt?.presentingComplaints?.followUpQuestion)) && (
                      <div className="mt-4">
                        <h4 className="font-medium text-indigo-600 mb-3">Follow-up Interactions</h4>
                        <div className="space-y-4">
                          {(session.interactions?.slice(1) || []).map((interaction, i) => {
                            const formatted = formatInteraction(interaction);
                            return (
                              <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <p className="font-medium text-gray-700">Follow-up Question:</p>
                                  <span className="text-sm text-gray-500">
                                    {new Date(formatted.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="mb-2 text-indigo-600">{formatted.question}</p>
                                <div className="pl-4 border-l-2 border-indigo-200">
                                  <div className="whitespace-pre-wrap text-gray-700">
                                    {formatted.formattedResponse}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          
                          {session.prompt?.presentingComplaints?.followUpQuestion && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-700">Follow-up Question:</p>
                                <span className="text-sm text-gray-500">
                                  {new Date(session.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="mb-2 text-indigo-600">
                                {session.prompt.presentingComplaints.followUpQuestion}
                              </p>
                              <div className="pl-4 border-l-2 border-indigo-200">
                                <div className="whitespace-pre-wrap text-gray-700">
                                  {formatResponse(session.response)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
