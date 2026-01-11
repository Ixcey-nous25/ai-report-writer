
import { GoogleGenAI } from "@google/genai";
import { ProductInput } from "../types";

// Using the provided API key directly as requested from environment variable
const API_KEY = process.env.API_KEY || '';

export const generateProductDescription = async (input: ProductInput): Promise<string> => {
  // Always use a named parameter for apiKey
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `
    Generate a high-converting, SEO-optimized product description for the following product:
    
    Product Name: ${input.name}
    Key Features: ${input.features}
    Target Audience: ${input.targetAudience}
    Tone of Voice: ${input.tone}
    
    The description should include:
    1. A compelling headline.
    2. An engaging introduction focusing on benefits.
    3. A bulleted list of key features/benefits.
    4. A strong Call to Action (CTA).
    
    Return the result in clean Markdown format.
  `;

  try {
    // Correct usage of generateContent with model name and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    // Access the .text property directly
    return response.text || "Failed to generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with AI Engine.");
  }
};
