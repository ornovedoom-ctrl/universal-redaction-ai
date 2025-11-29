import { GoogleGenAI, Type } from "@google/genai";
import { EntityType, DetectedEntity } from "../types";

// Initialize Gemini Client
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: VITE_GEMINI_API_KEY is not set in .env.local');
}
const ai = new GoogleGenAI({ apiKey });

export const detectEntities = async (text: string): Promise<DetectedEntity[]> => {
  if (!text.trim()) return [];

  const systemInstruction = `
    You are a specialized Cybersecurity Data Leakage Prevention (DLP) engine.
    Your task is to identify specific sensitive entities in the provided text.
    
    Target Entities:
    1. PERSON (Names of people)
    2. LOCATION (Cities, Countries, Addresses)
    3. EMAIL_ADDRESS
    4. IP_ADDRESS (IPv4, IPv6)
    5. PHONE_NUMBER
    6. CREDIT_CARD (Card numbers)
    7. DATE_TIME (Specific dates, times)
    8. URL (Websites, links)

    STRICT EXCLUSION RULES:
    - Do NOT include prepositions (e.g., "at", "in", "to", "from", "on", "by") that appear before the entity.
    - Do NOT include punctuation marks (periods, commas) that trail the entity.
    - Extract ONLY the entity value itself.
    
    Examples:
    - Text: "Meeting at 5:00 PM" -> Extract: "5:00 PM" (NOT "at 5:00 PM")
    - Text: "Lives in New York" -> Extract: "New York" (NOT "in New York")
    - Text: "Sent by john@example.com" -> Extract: "john@example.com" (NOT "by john@example.com")

    Return a JSON array of objects. Each object must contain:
    - "text": The exact substring found in the original text (excluding the forbidden context).
    - "type": The entity type from the list above.
    
    Maintain the order of appearance.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              type: { 
                type: Type.STRING, 
                enum: Object.values(EntityType) 
              },
            },
            required: ["text", "type"],
          },
        },
      },
    });

    const resultText = response.text;
    if (!resultText) return [];

    const entities: DetectedEntity[] = JSON.parse(resultText);
    return entities;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process text with Gemini.");
  }
};