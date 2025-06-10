import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";

const TechnicianDashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [history, setHistory] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const API_URL = process.env.REACT_APP_LOCAL_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
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
      const response = await fetch(`${API_URL}/api/prompt/history/${user.id}`);
      const data = await response.json();
      if (response.ok) {
        const sortedHistory = data.history.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setHistory(sortedHistory);
        if (user && user.firstName) {
          setFirstName(user.firstName);
        }
      } else {
        console.error("Failed to fetch history:", data.error);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
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
          setPrompt((prevPrompt) => prevPrompt + " " + data.text);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requestBody = {
        prompt,
        userId: user.id,
        agentType: "senior_technician_ai",
        isEducational: true,
        format: "educational"
      };

      console.log('Submitting prompt:', requestBody);

      const response = await fetch(`${API_URL}/api/prompt/educational`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response from server:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const processedResponse = typeof data.response === 'string' 
        ? data.response 
        : data.response?.content || data.response || 'No response received';

      setResponse(processedResponse);
      await fetchHistory();
      setPrompt("");
    } catch (error) {
      console.error("Error submitting prompt:", error);
      setError(error.message || "Failed to submit prompt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-600 to-orange-500 text-white flex flex-col">
      <DashboardNavbar />
      <div className="flex flex-col items-center p-6 pt-20 w-full max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Technician Dashboard</h1>
        <h2 className="text-2xl font-semibold mb-4">Welcome, {firstName}!</h2>

        <form onSubmit={handleSubmit} className="mb-8 w-full">
          <textarea
            className="w-full bg-white border border-gray-300 p-4 rounded-lg text-gray-900 placeholder-gray-500 mb-4 shadow-md focus:ring-2 focus:ring-indigo-400"
            placeholder="Ask about veterinary technical procedures, patient care techniques, or best practices... (Press Enter to submit, Shift+Enter for new line)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows="4"
          />
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

        {isLoading && (
          <div className="text-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Processing...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 w-full">
            {error}
          </div>
        )}

        {response && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full text-gray-900">
            <h2 className="text-xl font-semibold mb-4">Response:</h2>
            <div className="whitespace-pre-wrap">
              {typeof response === 'string' 
                ? response 
                : JSON.stringify(response, null, 2)
              }
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-lg w-full text-gray-900">
          <h2 className="text-xl font-semibold mb-4">History</h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No history yet</p>
          ) : (
            history.map((item, index) => (
              <div key={index} className="mb-6 pb-6 border-b last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-medium">Prompt: {item.prompt}</p>
                    <div className="mt-2 text-gray-700">
                      <p>Response:</p>
                      <div className="whitespace-pre-wrap">
                        {typeof item.response === 'string' 
                          ? item.response 
                          : JSON.stringify(item.response, null, 2)
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
