import { GoogleGenAI } from "@google/genai";
import { Issue } from "../types";

// Helper to safely get the API Key regardless of the environment (Vite vs Node vs Browser)
const getApiKey = () => {
  // Guidelines: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  // We use a safe access pattern via globalThis to avoid TypeScript errors if 'process' is not defined in the type definitions.
  try {
    const globalAny = globalThis as any;
    if (globalAny.process && globalAny.process.env && globalAny.process.env.API_KEY) {
      return globalAny.process.env.API_KEY;
    }
  } catch (e) {
    // Ignore reference errors
  }
  
  return undefined;
};

const apiKey = getApiKey();

// Helper to prevent crash if key is missing in this demo environment
const isKeyAvailable = !!apiKey;

export const generateMaintenanceReport = async (issues: Issue[]): Promise<string> => {
  if (!isKeyAvailable) {
    return "API Key not configured. Unable to generate AI insights.";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey! });

  // Prepare a text representation of the issues
  const issuesSummary = issues.map(i => 
    `- [${i.status}] ${i.category}: ${i.description} (Reported by ${i.residentName})`
  ).join('\n');

  const prompt = `
    You are a facility maintenance expert. Analyze the following maintenance requests and provide a brief executive summary.
    
    Data:
    ${issuesSummary}

    Please provide:
    1. A summary of the current workload.
    2. Identify any trends (e.g., recurring plumbing issues).
    3. Suggest 2 priority actions for the maintenance team.
    
    Keep it concise (max 150 words). Return plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insights due to an API error.";
  }
};