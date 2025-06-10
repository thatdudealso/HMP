// Load environment variables first
require("dotenv").config();

// Toggle debugging logs
const debug = true;

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

const { Agent, Task } = require("praisonai");
const OpenAI = require("openai");
const { handleVetCase, generatePrompt, getAIResponse } = require("../config/agent2_0"); // Legacy imports

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ------------------------------------------------------
// Define Agents
// ------------------------------------------------------

// 1) Veterinary Professor Agent
const veterinaryProfessor = new Agent({
  name: "VeterinaryProfessor",
  role: "Expert Doctor in veterinary medicine",
  goal: "Provide detailed explanations of veterinary conditions and treatments",
  backstory:
    "You are a board-certified veterinary  with 30 years of teaching experience, specializing in various conditions.",
  instructions: `medical expert in veterinary medicine:
    1. Provide specific, medically accurate explanations about the condition.
    2. Structure your response by disease stages.
    3. For each stage, include clinical signs, diagnostic criteria, treatment options, and prognosis.
    4. Use precise medical terminology and do not ask the user for further clarification.
    5. Respond directly with all the necessary details.
  `,
  parameters: {
    expertise: ["veterinary teaching"],
    response_type: "medical explanation",
    detail_level: "comprehensive"
  }
});

// 2) Case Study Agent
const caseStudyAgent = new Agent({
  name: "CaseStudyAgent",
  role: "Generates detailed veterinary case studies for learning",
  goal: "Produce realistic, instructive case scenarios for students",
  backstory:
    "You specialize in creating clinical case studies that mimic real-world situations.",
  instructions: `
    You generate detailed, instructive veterinary case studies.
    - Clearly include patient history, clinical signs, exam findings, diagnostic steps, treatment plan, and outcome.
    - Use the species and condition specified in the prompt.
    - Ensure the case study is realistic and instructive.
  `
});

// 3) Emergency Agent
const emergencyAgent = new Agent({
  name: "EmergencyAgent",
  role: "Expert doctor in veterinary emergency medicine",
  goal: "Assist and guide the user with urgent or life-threatening veterinary situations",
  backstory:
    "You are professional vetrinary doctor who handles emergency cases where immediate interventions are crucial.",
  instructions: `
    You are an expert in emergency veterinary and emergency medicine and procedures.
    - Provide immediate, step-by-step emergency guidance.
    - Assume the animal is in acute crisis related to the specified condition.
    - For example, if the prompt mentions a cat with heart disease, assume the cat is in acute heart failure.
    - Do not ask for additional details; respond fully with detailed interventions, triage steps, and critical care protocols.
  `
});

// ------------------------------------------------------
// Helper Task Templates
// ------------------------------------------------------
const consultationTask = new Task({
  name: "Consultation Task",
  description: "Provide detailed veterinary explanations",
  expected_output: "A clear, detailed explanation of the veterinary topic",
  input: "",
  dependencies: []
});

const caseStudyTask = new Task({
  name: "Case Study Creation",
  description: "Generate a detailed case study for a veterinary condition or situation",
  expected_output: "A structured scenario focusing on a veterinary condition or situation",
  dependencies: []
});

const emergencyTask = new Task({
  name: "Emergency Scenario Handling",
  description: "Provide immediate emergency guidance for a veterinary condition or situation",
  expected_output: "Immediate steps, critical care methods, and cautionary advice",
  dependencies: []
});

// ------------------------------------------------------
// Helper Function: extractTopicFromPrompt
// ------------------------------------------------------
function extractTopicFromPrompt(input) {
  // Default values if nothing is found
  let species = "unknown species";
  let condition = "unknown condition";

  // Clean and normalize input
  const cleanInput = input.toLowerCase().trim();

  // Determine species from keywords
  if (/cat|feline|kitten/i.test(cleanInput)) {
    species = "cat";
  } else if (/dog|canine|puppy/i.test(cleanInput)) {
    species = "dog";
  } else if (/horse|equine|foal/i.test(cleanInput)) {
    species = "horse";
  } else if (/bird|avian|parrot|parakeet|chicken/i.test(cleanInput)) {
    species = "bird";
  } else if (/fish|aquatic|goldfish|tropical/i.test(cleanInput)) {
    species = "fish";
  } else if (/rabbit|bunny|hare/i.test(cleanInput)) {
    species = "rabbit";
  } else if (/pig|hog|swine|piglet/i.test(cleanInput)) {
    species = "pig";
  } else if (/sheep|goat|lamb|ewe/i.test(cleanInput)) {
    species = "sheep";
  } else if (/cow|beef|cattle|calf/i.test(cleanInput)) {
    species = "cow";
  } else if (/turkey|poultry|chick/i.test(cleanInput)) {
    species = "turkey";
  } else if (/lizard|reptile|gecko|iguana/i.test(cleanInput)) {
    species = "lizard";
  } else if (/snake|serpent|python|boa/i.test(cleanInput)) {
    species = "snake";
  } else if (/hamster|gerbil|mouse|rat/i.test(cleanInput)) {
    species = "small mammal";

    //add ferrets and guinea pigs as an option
  }

  // Comprehensive list of common veterinary conditions
  const conditionPatterns = {
    cardiac: /(heart disease|cardiac|cardiovascular|arrhythmia|murmur)/i,
    respiratory: /(respiratory|pneumonia|bronchitis|asthma|breathing difficulty)/i,
    digestive: /(gastritis|enteritis|colitis|diarrhea|vomiting|gastroenteritis)/i,
    orthopedic: /(hip dysplasia|arthritis|joint|fracture|lameness|limping)/i,
    neurological: /(seizure|epilepsy|paralysis|neurological|nerve)/i,
    endocrine: /(diabetes|thyroid|cushing|addison)/i,
    skin: /(dermatitis|allergy|skin|itching|rash)/i,
    cancer: /(cancer|tumor|mass|neoplasia|lymphoma)/i,
    urinary: /(kidney|bladder|urinary|uti|renal)/i,
    dental: /(dental|tooth|teeth|gingivitis|periodontal)/i,
    parasitic: /(worms|fleas|ticks|parasites|mites)/i,
    infectious: /(infection|virus|bacterial|fungal)/i,
    emergency: /(emergency|trauma|poisoning|bleeding|wound)/i,
    behavioral: /(anxiety|aggression|behavior|stress)/i,
    reproductive: /(pregnancy|breeding|fertility|reproduction)/i
    //add surgery as an option
  };

  // Try to match conditions
  for (const [category, pattern] of Object.entries(conditionPatterns)) {
    const match = cleanInput.match(pattern);
    if (match) {
      condition = match[0].toLowerCase();
      break;
    }
  }

  // If no specific condition is found, extract potential keywords
  if (condition === "unknown condition") {
    // Look for medical terms or descriptions
    const words = cleanInput.split(/\s+/);
    const medicalTerms = words.filter(word => 
      word.length > 3 && // Avoid short words
      !/^(what|how|why|when|where|is|are|the|and|for|with)$/i.test(word) // Exclude common non-medical words
    );
    
    if (medicalTerms.length > 0) {
      // Use the longest term as it's more likely to be the condition
      condition = medicalTerms.reduce((a, b) => a.length > b.length ? a : b);
    }
  }

  // Log the extracted information for debugging
  console.log("Extracted from prompt:", {
    originalInput: input,
    cleanedInput: cleanInput,
    detectedSpecies: species,
    detectedCondition: condition
  });

  return { species, condition };
}

// ------------------------------------------------------
// Simple prompt sanitization function
// ------------------------------------------------------
function sanitizePrompt(input) {
  // Replace common typos (e.g., "heaert" to "heart")
  return input.replace(/heaert/gi, "heart");
}

// ------------------------------------------------------
// Map agent type string to agent instance
// ------------------------------------------------------
const agentMap = {
  professor_ai: veterinaryProfessor,
  case_study_ai: caseStudyAgent,
  emergency_ai: emergencyAgent
};

// ------------------------------------------------------
// Exported Function: processPrompt
// ------------------------------------------------------
async function processPrompt(userInput, agentType) {
  if (!userInput || userInput.trim() === "") {
    throw new Error("Invalid prompt input.");
  }
  
  // Sanitize the prompt
  const sanitizedInput = sanitizePrompt(userInput);
  
  // Dynamically extract topic information from the prompt
  const { species, condition } = extractTopicFromPrompt(sanitizedInput);
  
  if (debug) {
    console.log(`Extracted Topic => Species: ${species}, Condition: ${condition}`);
  }
  
  const chosenAgent = agentMap[agentType];
  if (!chosenAgent) {
    throw new Error("Invalid agent type provided.");
  }

  let systemPrompt = "";
  let userPrompt = "";
  
  switch (agentType) {
    case "professor_ai":
      systemPrompt = `You are a veterinary professor with extensive experience in animal medicine. 
You are providing an educational response specifically about ${condition} in ${species}s.
You MUST focus ONLY on ${condition} and not discuss any other diseases or conditions.`;



//Need to change this as  the student can ask about any condition and we need to focus on the condition they ask about

      userPrompt = `I need a detailed explanation of ${condition} in ${species}s. Please include:
1. An introduction to ${condition} in ${species}s
2. The different stages of ${condition} in ${species}s
3. Key clinical signs and symptoms of ${condition} in ${species}s at each stage
4. Relevant diagnostic criteria and tests for ${condition} in ${species}s
5. Treatment options and prognosis for ${condition} in ${species}s

Original query: "${sanitizedInput}"

IMPORTANT: Your response MUST be specifically about ${condition} in ${species}s and should NOT include information about any other diseases or conditions.`;
      break;
    
    case "case_study_ai":
      systemPrompt = `You are a veterinary case study expert. You create realistic case studies for veterinary students.`;
      
      userPrompt = `Create a detailed case study for a ${species} with ${condition}. Include:
1. Patient history and signalment
2. Clinical examination findings
3. Diagnostic steps and results
4. Treatment plan and rationale
5. Follow-up and outcome

Original query: "${sanitizedInput}"`;
      break;
    
    case "emergency_ai":
      systemPrompt = `You are an emergency veterinary specialist. You provide immediate guidance for critical cases.`;
      
      userPrompt = `Provide emergency guidance for a ${species} with ${condition}. Include:
1. Immediate assessment steps
2. Critical interventions
3. Stabilization techniques
4. Monitoring parameters
5. Next steps after stabilization

Original query: "${sanitizedInput}"`;
      break;
    
    default:
      throw new Error("Unsupported agent type.");
  }

  if (debug) {
    console.log("Sending to OpenAI:", {
      agentType,
      species,
      condition,
      systemPrompt: systemPrompt.substring(0, 100) + "...",
      userPrompt: userPrompt.substring(0, 100) + "..."
    });
  }

  try {
    // Using OpenAI's API directly
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

module.exports = { processPrompt };