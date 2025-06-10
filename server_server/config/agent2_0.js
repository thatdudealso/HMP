const OpenAI = require("openai");
require("dotenv").config();

// Initialize OpenAI with the latest SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// First, let's define our state management
class VetState {
    constructor() {
        this.messages = [];
        this.current_input = "";
        this.medical_records = {};
        this.owner_history = {};
        this.diagnoses = {};
        this.lab_results = {};
        this.medications = {};
        this.treatment_history = {};
        this.results = {};
        this.metadata = {};
        this.security_flags = {};
        this.calculations = {};
        this.trends = {};
        this.owner_constraints = {};
        this.owner_preferences = {};
    }

    static createInitialState(input) {
        const state = new VetState();
        state.current_input = input;
        return state;
    }
}

// Define constants for our diagnosis and treatment types
const DiagnosisType = Object.freeze({
    DEFINITIVE: "definitive",
    DIFFERENTIAL: "differential",
    SYMPTOM_BASED: "symptom_based",
    LAB_ABNORMALITY: "lab_abnormality"
});

const TreatmentResponse = Object.freeze({
    IMPROVED: "improved",
    WORSENED: "worsened",
    NO_CHANGE: "no_change",
    SIDE_EFFECTS: "side_effects"
});

// Enhanced AGENTS object with workflow methods
const AGENTS = {
    professor_ai: {
        name: "Veterinary Professor AI",
        system_message: `You are a highly experienced veterinary professor...`,
        
        async provideEducationalGuidance(state) {
            try {
                const newState = { ...state };
                // Add professor-specific analysis and guidance
                newState.results.professor_guidance = {
                    educational_assessment: "Based on the case...",
                    learning_points: ["Point 1", "Point 2"],
                    recommended_study: ["Topic 1", "Topic 2"]
                };
                return newState;
            } catch (error) {
                return this.handleError(state, error);
            }
        }
    },

    senior_doctor_ai: {
        name: "Senior Veterinary Doctor AI",
        system_message: `You are an experienced senior veterinary doctor...`,
        
        async analyzeClinical(state) {
            try {
                const newState = { ...state };
                // Add clinical analysis
                newState.results.clinical_analysis = {
                    assessment: "Clinical findings show...",
                    recommendations: ["Rec 1", "Rec 2"]
                };
                return newState;
            } catch (error) {
                return this.handleError(state, error);
            }
        },

        async provideDiagnosis(state) {
            try {
                const newState = { ...state };
                // Add diagnosis
                newState.diagnoses.current = {
                    type: DiagnosisType.DEFINITIVE,
                    findings: "Based on the symptoms...",
                    recommendations: ["Treatment 1", "Treatment 2"]
                };
                return newState;
            } catch (error) {
                return this.handleError(state, error);
            }
        }
    },

    senior_technician_ai: {
        name: "Senior Veterinary Technician AI",
        system_message: `You are a senior veterinary technician...`,
        
        async processPatientCare(state) {
            try {
                const newState = { ...state };
                // Add technician-specific care instructions
                newState.results.patient_care = {
                    care_instructions: ["Instruction 1", "Instruction 2"],
                    monitoring_requirements: ["Monitor 1", "Monitor 2"]
                };
                return newState;
            } catch (error) {
                return this.handleError(state, error);
            }
        }
    },

    // Add workflow-specific agents
    data_processor: {
        name: "Data Processing Agent",
        system_message: `You are a veterinary data processing agent...`,
        
        async processData(state) {
            try {
                const newState = { ...state };
                // Process and structure the input data
                newState.results.DataProcessor = {
                    structured_data: {},
                    metadata: {
                        processing_timestamp: new Date().toISOString()
                    }
                };
                return newState;
            } catch (error) {
                return this.handleError(state, error);
            }
        }
    },

    history_analyzer: {
        name: "History Analysis Agent",
        system_message: `You are a veterinary history analysis agent...`,
        
        async analyzeHistory(state) {
            try {
                const newState = { ...state };
                // Analyze patient history
                newState.results.HistoryAnalyzer = {
                    historical_analysis: {},
                    trends: {},
                    recommendations: []
                };
                return newState;
            } catch (error) {
                return this.handleError(state, error);
            }
        }
    },

    web_researcher: {
        name: "Web Research Agent",
        system_message: `You are a veterinary web research agent specialized in finding and validating medical information...`,
        
        async searchWithBedrock(query) {
            try {
                const bedrockClient = new BedrockRuntimeClient({
                    region: process.env.AWS_REGION,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                    }
                });

                const prompt = {
                    prompt: `\n\nHuman: Please search the web for: ${query}. Provide accurate, up-to-date veterinary information from reliable sources.
                    \n\nAssistant: I'll search for reliable veterinary information about this topic.`,
                    max_tokens_to_sample: 2000,
                    temperature: 0.7,
                    top_k: 250,
                    top_p: 0.999,
                    stop_sequences: ["\n\nHuman:"]
                };

                const command = new InvokeModelCommand({
                    modelId: "anthropic.claude-v2", // or "anthropic.claude-3" for the latest version
                    contentType: "application/json",
                    accept: "application/json",
                    body: JSON.stringify(prompt)
                });

                const response = await bedrockClient.send(command);
                const responseBody = JSON.parse(new TextDecoder().decode(response.body));

                return {
                    content: responseBody.completion,
                    sources: responseBody.citations || []
                };
            } catch (error) {
                console.error('Bedrock search error:', error);
                return null;
            }
        },

        async researchTopic(state, query) {
            try {
                const newState = { ...state };
                
                // Search using AWS Bedrock
                const searchResult = await this.searchWithBedrock(query);
                
                if (searchResult) {
                    newState.results.web_research = {
                        query,
                        timestamp: new Date().toISOString(),
                        findings: searchResult.content,
                        sources: searchResult.sources,
                        metadata: {
                            source: 'AWS Bedrock Claude',
                            model: 'anthropic.claude-v2'
                        }
                    };
                }
                
                return newState;
            } catch (error) {
                return this.handleError(state, error);
            }
        }
    },

    // Shared error handling method
    handleError(state, error) {
        const newState = { ...state };
        if (!newState.results.errors) {
            newState.results.errors = [];
        }
        newState.results.errors.push({
            timestamp: new Date().toISOString(),
            message: error.message
        });
        return newState;
    }
};

// Workflow Manager to coordinate between agents
class WorkflowManager {
    constructor(agents) {
        this.agents = agents;
        this.workflow = new Map();
    }

    addStep(stepName, agentKey, methodName) {
        this.workflow.set(stepName, {
            agent: this.agents[agentKey],
            method: methodName
        });
    }

    async execute(input) {
        let state = VetState.createInitialState(input);
        
        for (const [stepName, { agent, method }] of this.workflow) {
            try {
                console.log(`Executing ${stepName} using ${agent.name}`);
                state = await agent[method](state);
            } catch (error) {
                console.error(`Error in ${stepName}:`, error);
                break;
            }
        }
        
        return state;
    }
}

// Create and configure workflow manager
const workflowManager = new WorkflowManager(AGENTS);

// Configure standard workflow steps
workflowManager.addStep('process_data', 'data_processor', 'processData');
workflowManager.addStep('analyze_history', 'history_analyzer', 'analyzeHistory');
workflowManager.addStep('analyze_clinical', 'senior_doctor_ai', 'analyzeClinical');
workflowManager.addStep('diagnose', 'senior_doctor_ai', 'provideDiagnosis');
workflowManager.addStep('patient_care', 'senior_technician_ai', 'processPatientCare');
workflowManager.addStep('educational_guidance', 'professor_ai', 'provideEducationalGuidance');
workflowManager.addStep('web_research', 'web_researcher', 'researchTopic');

// Example usage function
async function handleVetCase(patientData) {
    const result = await workflowManager.execute(patientData);
    return result;
}

const generatePrompt = (input) => {
  const {
    patientInfo,
    clinicalExamination,
    presentingComplaints,
    previousContext,
    requestedAnalysis
  } = input;

  return `You are an expert veterinary AI assistant. Please analyze the following case and provide a structured response.

PATIENT INFORMATION:
- Name: ${patientInfo.name}
- Species: ${patientInfo.species}
- Breed: ${patientInfo.breed || 'Not specified'}
- Age: ${patientInfo.age}
- Weight: ${patientInfo.weight || 'Not specified'}
- Sex: ${patientInfo.sex || 'Not specified'}
- Reproductive Status: ${patientInfo.reproductive_status || 'Not specified'}
- Temperature: ${patientInfo.temperature || 'Not recorded'}
- Heart Rate: ${patientInfo.heartRate || 'Not recorded'}
- Respiratory Rate: ${patientInfo.respiratoryRate || 'Not recorded'}

CLINICAL EXAMINATION:
- General Appearance: ${clinicalExamination.general_appearance || 'Not recorded'}
- Hydration Status: ${clinicalExamination.hydration_status || 'Not recorded'}
- Other Findings: ${clinicalExamination.other_findings || 'None recorded'}

PRESENTING COMPLAINTS:
- Main Complaint: ${presentingComplaints.mainComplaint}
- Duration: ${presentingComplaints.duration || 'Not specified'}
- Progression: ${presentingComplaints.progression || 'Not specified'}
- Previous Treatments: ${presentingComplaints.previousTreatments || 'None recorded'}
- Additional Notes: ${presentingComplaints.additionalNotes || 'None'}

${previousContext ? `PREVIOUS CONTEXT:\n${previousContext}\n` : ''}

Please provide a comprehensive analysis including:
1. Initial Assessment: Provide a concise summary of the case and key findings.
2. Differential Diagnoses: List possible diagnoses in order of likelihood, with reasoning.
3. Recommended Diagnostics: Suggest appropriate tests and their rationale.
4. Treatment Plan: Include both immediate actions and long-term management strategies.
5. Client Education: Provide instructions and warning signs for the owner.
6. Prognosis: Discuss expected outcomes and timeline.

Format your response as a JSON object with the following structure:
{
  "initialAssessment": "string",
  "differentialDiagnoses": [
    {
      "condition": "string",
      "reasoning": "string"
    }
  ],
  "recommendedDiagnostics": [
    {
      "test": "string",
      "rationale": "string"
    }
  ],
  "treatmentPlan": {
    "immediate": ["string"],
    "longTerm": ["string"]
  },
  "clientEducation": {
    "instructions": ["string"],
    "warningSignals": ["string"]
  },
  "prognosis": "string"
}`;
};

const webSearch = async (query) => {
    try {
        // Using SerpApi for Google Search
        const search = new GoogleSearch(process.env.SERPAPI_API_KEY);
        
        return new Promise((resolve, reject) => {
            search.json({
                q: query,
                num: 5  // Number of results
            }, (result) => {
                resolve(result.organic_results);
            });
        });
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
};

const getAIResponse = async (prompt, conversationHistory = []) => {
  try {
    // Add null check and default values
    const patientInfo = prompt?.patientInfo || {};
    const clinicalExamination = prompt?.clinicalExamination || {};
    const presentingComplaints = prompt?.presentingComplaints || {};

    // Keep existing system prompt setup
    let systemPrompt = `You are an expert veterinary AI assistant analyzing a case. 
    You have access to the following case history and should consider this context in your response.
    
    Please structure your response in the following format:
    {
      "assessment": "Comprehensive assessment of the patient's condition",
      "clinicalFindings": [
        {
          "system": "Body system name",
          "observation": "What was observed",
          "details": "Additional details"
        }
      ],
      "provisionalDiagnosis": [
        {
          "condition": "Name of condition",
          "likelihood": "Probability assessment",
          "reasoning": "Clinical reasoning"
        }
      ],
      "diagnosticTests": [
        {
          "name": "Test name",
          "rationale": "Why this test is needed",
          "priority": "Urgency level"
        }
      ],
      "treatmentPlan": {
        "medications": [
          {
            "name": "Medication name",
            "dosage": "Dosage information",
            "frequency": "How often to administer",
            "duration": "How long to continue"
          }
        ],
        "procedures": ["List of recommended procedures"],
        "nursing": ["Nursing care instructions"],
        "dietary": "Dietary recommendations"
      },
      "followUp": {
        "timing": "When to schedule next visit",
        "monitoring": ["Parameters to monitor"],
        "warningSignals": ["Signs that require immediate attention"]
      }
    }`;

    // Keep existing context handling
    if (patientInfo.name) {
      systemPrompt += `\n\nPATIENT PROFILE:
Name: ${patientInfo.name}
Species: ${patientInfo.species}
Age: ${patientInfo.age}
Current Condition: ${presentingComplaints?.mainComplaint || 'Not specified'}`;
    }

    // Keep conversation history handling
    if (conversationHistory && conversationHistory.length > 0) {
      systemPrompt += "\n\nPREVIOUS CONVERSATION HISTORY:";
      conversationHistory.forEach(entry => {
        systemPrompt += `\n\nQ: ${entry.question}\nA: ${entry.response}`;
      });
    }

    // Keep existing prompt formatting
    let userPrompt = '';
    if (presentingComplaints?.followUpQuestion) {
      userPrompt = `Based on the previous context and initial assessment, please address the following follow-up question:

${presentingComplaints.followUpQuestion}

Please maintain the same structured format in your response.`;
    } else {
      userPrompt = `Please provide a comprehensive veterinary assessment for the following case:
      
Main Complaint: ${presentingComplaints?.mainComplaint || 'Not specified'}
Duration: ${presentingComplaints?.duration || 'Not specified'}
Progression: ${presentingComplaints?.progression || 'Not specified'}
Previous Treatments: ${presentingComplaints?.previousTreatments || 'None'}
Clinical Examination: ${clinicalExamination?.general_appearance || 'Not specified'}
Additional Notes: ${presentingComplaints?.additionalNotes || 'None'}`;
    }

    // Add web research capability when needed
    if (prompt.requiresResearch) {
        const researchState = await AGENTS.web_researcher.researchTopic(
            new VetState(),
            prompt.researchQuery
        );
        
        // Add research findings to the system prompt
        if (researchState.results.web_research) {
            systemPrompt += "\n\nRELEVANT RESEARCH FINDINGS:";
            researchState.results.web_research.findings.forEach(finding => {
                systemPrompt += `\n\nSource: ${finding.title}\nURL: ${finding.url}\nKey Information: ${finding.snippet}`;
            });
        }
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    // Define the search function for GPT
    const functions = [
        {
            name: "search_web",
            description: "Search the web for current information",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query"
                    }
                },
                required: ["query"]
            }
        }
    ];

    // First, ask GPT if it needs to search
    const searchCheckResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        functions,
        function_call: "auto",
        temperature: 0.7
    });

    let finalResponse;
    const responseMessage = searchCheckResponse.choices[0].message;

    // If GPT wants to search the web
    if (responseMessage.function_call) {
        const functionArgs = JSON.parse(responseMessage.function_call.arguments);
        const searchResults = await webSearch(functionArgs.query);

        // Add search results to the conversation
        messages.push(responseMessage);
        messages.push({
            role: "function",
            name: "search_web",
            content: JSON.stringify(searchResults)
        });

        // Get final response with search results
        finalResponse = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000
        });
    } else {
        finalResponse = searchCheckResponse;
    }

    const aiResponse = finalResponse.choices[0].message.content;
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return parsedResponse;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // If parsing fails, structure the raw response in the new format
      return {
        assessment: aiResponse,
        clinicalFindings: [],
        provisionalDiagnosis: [],
        diagnosticTests: [],
        treatmentPlan: {
          medications: [],
          procedures: [],
          nursing: [],
          dietary: ""
        },
        followUp: {
          timing: "",
          monitoring: [],
          warningSignals: []
        }
      };
    }
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
};

module.exports = {
    AGENTS,
    WorkflowManager,
    VetState,
    handleVetCase,
    DiagnosisType,
    TreatmentResponse,
    generatePrompt,
    getAIResponse
};