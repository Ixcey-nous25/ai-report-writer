import { GoogleGenerativeAI } from "@google/generative-ai"; // Library name check karein
import { ProductInput } from "../types";

// Vite mein environment variables aise access hote hain
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const generateProductDescription = async (input: ProductInput): Promise<string> => {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Generate a high-converting, SEO-optimized product description for the following product:
    Product Name: ${input.name}
    Key Features: ${input.features}
    Target Audience: ${input.targetAudience}
    Tone of Voice: ${input.tone}
    Return the result in clean Markdown format.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with AI Engine.");
  }
};