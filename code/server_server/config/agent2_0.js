const OpenAI = require("openai");
require("dotenv").config();

// LLM Interface
class LLMInterface {
    constructor(config) {
        this.config = config;
    }

    async generateResponse(messages, options = {}) {
        throw new Error('Method not implemented');
    }

    async generateFunctionResponse(messages, functions, options = {}) {
        throw new Error('Method not implemented');
    }
}

// OpenAI Implementation
class OpenAIInterface extends LLMInterface {
    constructor(config) {
        super(config);
        this.client = new OpenAI({
            apiKey: config.apiKey
        });
    }

    async generateResponse(messages, options = {}) {
        const response = await this.client.chat.completions.create({
            model: options.model || "gpt-4-mini",
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 2000
        });
        return response.choices[0].message;
    }

    async generateFunctionResponse(messages, functions, options = {}) {
        const response = await this.client.chat.completions.create({
            model: options.model || "gpt-4-mini",
            messages,
            functions,
            function_call: options.function_call || "auto",
            temperature: options.temperature || 0.7
        });
        return response.choices[0].message;
    }
}

// Bedrock Implementation
class BedrockInterface extends LLMInterface {
    constructor(config) {
        super(config);
        this.client = new BedrockRuntimeClient({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey
            }
        });
    }

    async generateResponse(messages, options = {}) {
        const prompt = this._formatMessagesToPrompt(messages);
        const command = new InvokeModelCommand({
            modelId: options.model || "anthropic.claude-v2",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                prompt,
                max_tokens_to_sample: options.max_tokens || 2000,
                temperature: options.temperature || 0.7,
                top_k: options.top_k || 250,
                top_p: options.top_p || 0.999,
                stop_sequences: options.stop_sequences || ["\n\nHuman:"]
            })
        });

        const response = await this.client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        return {
            content: responseBody.completion,
            role: "assistant"
        };
    }

    _formatMessagesToPrompt(messages) {
        return messages.map(msg => {
            if (msg.role === "system") {
                return `\n\nHuman: ${msg.content}\n\nAssistant: I understand.`;
            }
            return `\n\nHuman: ${msg.content}\n\nAssistant:`;
        }).join("");
    }
}

// LLM Factory
class LLMFactory {
    static createLLM(type, config) {
        switch (type.toLowerCase()) {
            case 'openai':
                return new OpenAIInterface(config);
            case 'bedrock':
                return new BedrockInterface(config);
            default:
                throw new Error(`Unsupported LLM type: ${type}`);
        }
    }
}

// Initialize default LLM
const defaultLLM = LLMFactory.createLLM('openai', {
    apiKey: process.env.OPENAI_API_KEY
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

const getAIResponse = async (input, conversationHistory = [], llm = defaultLLM) => {
  try {
    const {
      patientInfo,
      clinicalExamination,
      presentingProblems,
      vitals
    } = input;

    let systemPrompt = `You are an expert veterinary AI assistant analyzing a case. 
Please provide a comprehensive assessment based on the following information:

PATIENT INFORMATION:
- Name: ${patientInfo.name}
- Species: ${patientInfo.species}
- Breed: ${patientInfo.breed || 'Not specified'}
- Age: ${patientInfo.age}
- Weight: ${patientInfo.weight || 'Not specified'}
- Sex: ${patientInfo.sex || 'Not specified'}
- Reproductive Status: ${patientInfo.reproductive_status || 'Not specified'}

VITAL SIGNS:
- Temperature: ${vitals.temperature || 'Not recorded'}
- Heart Rate: ${vitals.heartRate || 'Not recorded'}
- Respiratory Rate: ${vitals.respiratoryRate || 'Not recorded'}

CLINICAL EXAMINATION:
- General Appearance: ${clinicalExamination.general_appearance || 'Not recorded'}
- Hydration Status: ${clinicalExamination.hydration_status || 'Not recorded'}
- Other Findings: ${clinicalExamination.other_findings || 'None recorded'}

PRESENTING PROBLEMS:
- Main Complaint: ${presentingProblems.main_complaint}
- Duration: ${presentingProblems.duration || 'Not specified'}
- Progression: ${presentingProblems.progression || 'Not specified'}
- Previous Treatments: ${presentingProblems.previous_treatments || 'None recorded'}
- Diet Changes: ${presentingProblems.diet_changes || 'None recorded'}
- Environment Changes: ${presentingProblems.environment_changes || 'None recorded'}

Please provide a structured response including:
1. Assessment
2. Clinical Findings
3. Provisional Diagnosis
4. Further Diagnostic Tests
5. Treatment Plan
6. Follow-up Recommendations`;

    // Keep conversation history handling
    if (conversationHistory && conversationHistory.length > 0) {
      systemPrompt += "\n\nPREVIOUS CONVERSATION HISTORY:";
      conversationHistory.forEach(entry => {
        systemPrompt += `\n\nQ: ${entry.question}\nA: ${entry.response}`;
      });
    }

    const completion = await llm.generateResponse(
      [
        {
          role: "system",
          content: systemPrompt
        }
      ],
      {
        model: "gpt-4",
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }
    );

    return completion.content || completion.message?.content;
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    throw error;
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
    getAIResponse,
    LLMFactory,
    LLMInterface
};