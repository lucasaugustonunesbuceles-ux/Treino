
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, Difficulty } from "../types";

// Removed global initialization to ensure the latest API key is used for each request.

export const generateDailyQuests = async (userData: UserData): Promise<Quest[]> => {
  // Fix: Move GoogleGenAI initialization inside the function to use the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analise os dados corporais: Gênero ${userData.gender}, Idade ${userData.age}, Peso ${userData.weight}kg, Altura ${userData.height}cm.
    Meta: ${userData.dailyGoal}. Dificuldade: ${userData.difficulty}.
    
    Como o "Sistema", gere 4 quests diárias personalizadas.
    
    REGRAS DE XP BASE (MODO NORMAL):
    - AGI: 50 XP
    - VIT: 100 XP
    - STR: 150 XP

    ESCALONAMENTO POR DIFICULDADE:
    - Fácil: 0.7x XP e repetições reduzidas.
    - Normal: 1.0x XP e repetições padrão.
    - Difícil: 1.5x XP e repetições elevadas.
    - Infernal: 2.5x XP e repetições extremas.

    Cada quest deve ter 'instructions' detalhando tecnicamente como fazer o exercício.
    O tom deve ser autoritário e solene como em Solo Leveling.
  `;

  // Fix: Use 'gemini-3-pro-preview' for complex reasoning tasks like fitness planning and XP scaling.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            reps: { type: Type.STRING },
            sets: { type: Type.STRING },
            instructions: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            type: { type: Type.STRING }
          },
          required: ["id", "title", "description", "reps", "sets", "instructions", "xpReward", "type"]
        }
      }
    }
  });

  try {
    // Fix: Access response.text as a property (not a method).
    const rawJson = response.text?.trim() ?? "[]";
    return JSON.parse(rawJson).map((q: any) => ({ ...q, completed: false }));
  } catch (error) {
    console.error("Gemini Parse Error", error);
    return [];
  }
};

export const analyzeBodyComposition = async (userData: UserData): Promise<string> => {
    // Fix: Move GoogleGenAI initialization inside the function to use the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Como o Sistema, analise o despertar de um caçador ${userData.gender}, ${userData.weight}kg, ${userData.height}cm, meta ${userData.dailyGoal} e dificuldade ${userData.difficulty}. Seja impactante.`;
    
    // Fix: Use 'gemini-3-pro-preview' for impactful and personalized content generation.
    const response = await ai.models.generateContent({ 
      model: 'gemini-3-pro-preview', 
      contents: prompt 
    });
    
    // Fix: Access response.text as a property.
    return response.text ?? "O Sistema está processando...";
};
