const express = require("express");
const jwt = require("jsonwebtoken");
const OpenAI = require("openai");
const User = require("../models/User"); // Import User Model
const { handleVetCase, generatePrompt, getAIResponse } = require("../config/agent2_0"); // Legacy imports
const Session = require('../models/Session');
const AGENTS = require('../config/agents');
const EducationalHistory = require('../models/EducationalHistory');
const { processPrompt } = require("../config/prof_agent"); // Our updated agent file with dynamic extraction
const { Task } = require('praisonai');
require("dotenv").config();

const router = express.Router();

// Ensure OpenAI API key is loaded
if (!process.env.OPENAI_API_KEY) {
  console.error("🔴 OPENAI_API_KEY is missing in .env file!");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// **Middleware: Authenticate Users**
const authenticateUser = async (req, res, next) => {
  let token = req.header("Authorization");

  console.log("📢 Incoming Request:", req.method, req.originalUrl);
  console.log("📢 Authorization Header Received:", token);

  if (!token) {
    console.error("❌ No token provided in the request.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Ensure token follows 'Bearer <token>' format
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  } else {
    console.error("❌ Malformed token. Expected 'Bearer <token>'.");
    return res.status(400).json({ error: "Invalid token format." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token successfully verified:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(400).json({ error: "Invalid token." });
  }
};

// Apply authentication middleware to routes that require a valid token
router.use("/educational", authenticateUser);
router.use("/case-study", authenticateUser);
router.use("/emergency", authenticateUser);

// **POST: Submit AI Prompt** (Legacy clinical interactions route)
router.post("/submit", async (req, res) => {
  try {
    const { prompt, userId, sessionId, patientInfo, clinicalExamination, vitals, isFollowUp } = req.body;
    
    // Get AI response via legacy function
    const aiResponse = await getAIResponse(prompt);

    let session;
    if (isFollowUp && sessionId) {
      // Update existing session
      session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      session.interactions.push({
        question: prompt,
        response: aiResponse,
        type: 'followUp'
      });
      await session.save();
    } else {
      // Create new session
      session = new Session({
        userId,
        patientInfo,
        clinicalExamination,
        vitals,
        interactions: [{
          question: prompt,
          response: aiResponse,
          type: 'initial'
        }]
      });
      await session.save();
    }

    res.json({
      success: true,
      response: aiResponse,
      sessionId: session._id
    });

  } catch (error) {
    console.error('Error in prompt submission:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// **GET: Fetch AI Interaction History for User**
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch both clinical and educational history
    const clinicalHistory = await Session.find({ userId })
      .sort({ updatedAt: -1 })
      .populate('userId', 'firstName lastName');

    const educationalHistory = await EducationalHistory.find({ userId })
      .sort({ timestamp: -1 });

    // Combine and sort histories by timestamp
    const combinedHistory = [
      ...clinicalHistory.map(session => ({
        ...session.toObject(),
        type: 'clinical'
      })),
      ...educationalHistory.map(entry => ({
        ...entry.toObject(),
        type: entry.agentType  // Distinguish based on agentType
      }))
    ].sort((a, b) => {
      const dateA = a.timestamp || a.updatedAt;
      const dateB = b.timestamp || b.updatedAt;
      return new Date(dateB) - new Date(dateA);
    });

    res.json({ 
      success: true,
      history: combinedHistory
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch history' 
    });
  }
});

// Helper function to generate session IDs (preserved functionality)
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// **Helper Function: callAIService** (unchanged)
const callAIService = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert veterinary AI assistant. Provide detailed, structured responses following the specified JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    try {
      const parsedResponse = JSON.parse(response);
      return parsedResponse;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        initialAssessment: response,
        differentialDiagnoses: [],
        recommendedDiagnostics: [],
        treatmentPlan: {
          immediate: [],
          longTerm: []
        },
        clientEducation: {
          instructions: [],
          warningSignals: []
        },
        prognosis: ""
      };
    }
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert veterinary AI assistant. Provide detailed, structured responses following the specified JSON format. Your response must be valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      
      try {
        const parsedResponse = JSON.parse(response);
        return parsedResponse;
      } catch (error) {
        console.error('Error parsing fallback response:', error);
        return {
          initialAssessment: response,
          differentialDiagnoses: [],
          recommendedDiagnostics: [],
          treatmentPlan: {
            immediate: [],
            longTerm: []
          },
          clientEducation: {
            instructions: [],
            warningSignals: []
          },
          prognosis: ""
        };
      }
    } catch (secondError) {
      console.error('Fallback API call failed:', secondError);
      throw new Error('Failed to get AI response');
    }
  }
};

// **POST: Educational Route**
router.post("/educational", async (req, res) => {
  try {
    const { prompt, userId, agentType } = req.body;
    
    // Validate allowed agent types
    if (!["professor_ai", "case_study_ai", "emergency_ai"].includes(agentType)) {
      throw new Error('Invalid agent type. Allowed values: professor_ai, case_study_ai, emergency_ai.');
    }
    
    // Process the prompt using the updated agent function with dynamic topic extraction
    const aiResponse = await processPrompt(prompt, agentType);

    // Save the interaction in educational history
    const newHistory = new EducationalHistory({
      userId,
      prompt,
      response: aiResponse,
      agentType,
      timestamp: new Date(),
      type: agentType
    });

    await newHistory.save();

    res.json({
      success: true,
      response: aiResponse
    });

  } catch (error) {
    console.error('Error in educational route:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// **POST: Case Study Route**
router.post("/case-study", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    const aiResponse = await processPrompt(prompt, "case_study_ai");
    res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error("Error in case study submission:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// **POST: Emergency Route**
router.post("/emergency", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    const aiResponse = await processPrompt(prompt, "emergency_ai");
    res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error("Error in emergency submission:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;