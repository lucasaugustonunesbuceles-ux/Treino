
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, TrainingLocation, HealthTip, MartialDrill, MartialArt } from "../types";

const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env.API_KEY || '' : '';
  } catch (e) {
    return '';
  }
};

async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 3500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.status === 429 || 
                         error?.message?.includes('429') || 
                         error?.message?.includes('quota');

      if (isRateLimit) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const generateDailyQuests = async (userData: UserData, location: TrainingLocation): Promise<Quest[]> => {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const artLevel = userData.martialProgress[userData.martialArt]?.level || 1;

  return callGeminiWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Hunter: ${userData.name}. Objetivo: ${userData.dailyGoal}. Arte: ${userData.martialArt}. Dungeon: ${location}. Gere 4 quests físicas.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o Sistema. Gere quests de treino físico. Retorne APENAS um array JSON de objetos Quest.",
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
    return JSON.parse(response.text || "[]").map((q: any) => ({ ...q, location, completed: false }));
  }).catch(() => []);
};

export const generateSurvivalGuide = async (userData: UserData): Promise<HealthTip[]> => {
    const apiKey = getApiKey();
    if (!apiKey) return [];
    return callGeminiWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Dicas de saúde para ${userData.dailyGoal}.`,
            config: { 
                systemInstruction: "Retorne APENAS array JSON {category, content, importance}.",
                responseMimeType: "application/json" 
            }
        });
        return JSON.parse(response.text || "[]");
    }).catch(() => []);
};

export const generateMartialDrills = async (userData: UserData): Promise<MartialDrill[]> => {
    const apiKey = getApiKey();
    if (!apiKey || userData.martialArt === MartialArt.NONE) return [];
    const level = userData.martialProgress[userData.martialArt].level;
    return callGeminiWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Drills para ${userData.martialArt} nível ${level}.`,
            config: { 
                systemInstruction: "Retorne APENAS array JSON {title, description, reps, isPhysical}.",
                responseMimeType: "application/json" 
            }
        });
        return JSON.parse(response.text || "[]");
    }).catch(() => []);
};
