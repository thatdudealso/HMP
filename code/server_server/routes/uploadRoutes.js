const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const pdfParse = require('pdf-parse');
const { WorkflowManager, AGENTS, VetState } = require('../config/agent2_0');

const router = express.Router();

// Initialize workflow manager
const workflowManager = new WorkflowManager(AGENTS);

// Multer Storage configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Extract text based on file type
async function extractText(file) {
  const ext = path.extname(file.filename).toLowerCase();
  
  try {
    if (ext === '.txt') {
      const text = await fs.readFile(file.path, 'utf-8');
      return text;
    } 
    else if (ext === '.pdf') {
      const pdfData = await pdfParse(file.buffer);
      return pdfData.text;
    }
    // Add support for other file types as needed
    
    return ''; // Return empty string if file type not supported
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

// Process the extracted text through the AI workflow
async function processExtractedText(text) {
  // Create initial state with the extracted text
  const initialState = new VetState();
  initialState.current_input = text;

  // Configure workflow steps for document processing
  workflowManager.workflow.clear(); // Clear existing workflow
  workflowManager.addStep('process_data', 'data_processor', 'processData');
  workflowManager.addStep('analyze_history', 'history_analyzer', 'analyzeHistory');
  
  // If the text mentions clinical findings, add clinical analysis
  if (text.toLowerCase().includes('clinical') || text.toLowerCase().includes('examination')) {
    workflowManager.addStep('analyze_clinical', 'senior_doctor_ai', 'analyzeClinical');
  }
  
  // If the text includes symptoms or conditions, add diagnosis
  if (text.toLowerCase().includes('symptom') || text.toLowerCase().includes('condition')) {
    workflowManager.addStep('diagnose', 'senior_doctor_ai', 'provideDiagnosis');
  }
  
  // Add research step for additional context
  workflowManager.addStep('web_research', 'web_researcher', 'researchTopic');

  // Execute the workflow
  const result = await workflowManager.execute(initialState);
  
  // Format the results for the frontend
  return {
    structured_data: result.results.DataProcessor?.structured_data || {},
    clinical_analysis: result.results.clinical_analysis || {},
    diagnosis: result.diagnoses.current || {},
    research_findings: result.results.web_research || {},
    historical_analysis: result.results.HistoryAnalyzer?.historical_analysis || {},
    raw_text: text
  };
}

// Handle POST request to /api/upload
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Extract text from the uploaded file
    const extractedText = await extractText(req.file);
    
    // Process the extracted text through the AI workflow
    const processedResults = await processExtractedText(extractedText);
    
    // Return both the raw text and processed results
    res.json({ 
      message: "File processed successfully", 
      filename: req.file.filename,
      text: extractedText,
      analysis: processedResults
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ 
      error: "Failed to process file",
      details: error.message 
    });
  } finally {
    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (error) {
      console.error('Error deleting uploaded file:', error);
    }
  }
});

// Helper functions for text analysis
function extractAssessment(text) {
  // Basic implementation - you can enhance this based on your needs
  const assessmentMatch = text.match(/Assessment:?(.*?)(?=\n|$)/i);
  return assessmentMatch ? assessmentMatch[1].trim() : '';
}

function extractRecommendations(text) {
  // Basic implementation - you can enhance this based on your needs
  const recommendations = [];
  const recMatch = text.match(/Recommendations?:?(.*?)(?=\n|$)/i);
  if (recMatch) {
    recommendations.push(recMatch[1].trim());
  }
  return recommendations;
}

function extractPatientInfo(text) {
  // Basic implementation - you can enhance this based on your needs
  return {
    name: extractValue(text, /Patient Name:?(.*?)(?=\n|$)/i),
    species: extractValue(text, /Species:?(.*?)(?=\n|$)/i),
    breed: extractValue(text, /Breed:?(.*?)(?=\n|$)/i),
    age: extractValue(text, /Age:?(.*?)(?=\n|$)/i),
    weight: extractValue(text, /Weight:?(.*?)(?=\n|$)/i)
  };
}

function extractPresentingProblems(text) {
  // Basic implementation - you can enhance this based on your needs
  return {
    main_complaint: extractValue(text, /Main Complaint:?(.*?)(?=\n|$)/i),
    duration: extractValue(text, /Duration:?(.*?)(?=\n|$)/i),
    progression: extractValue(text, /Progression:?(.*?)(?=\n|$)/i)
  };
}

function extractValue(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

module.exports = router;