
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, TrainingLocation, HealthTip, MartialDrill, MartialArt } from "../types";

/**
 * Utility to call Gemini with exponential backoff retry for rate limits.
 */
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 3500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Check if it's a rate limit error (429) or quota exceeded
      const isRateLimit = error?.status === 429 || 
                         error?.message?.includes('429') || 
                         error?.message?.includes('quota') || 
                         error?.message?.includes('exhausted');

      if (isRateLimit) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`[SISTEMA]: Limite de cota atingido. Sincronizando em ${delay}ms... (Tentativa ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const generateDailyQuests = async (userData: UserData, location: TrainingLocation): Promise<Quest[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const artLevel = userData.martialProgress[userData.martialArt]?.level || 1;

  return callGeminiWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Hunter: ${userData.name}. Objetivo: ${userData.dailyGoal}. 
      Arte Marcial: ${userData.martialArt} (Nível Técnico: ${artLevel}).
      Dungeon: ${location}.
      
      Gere 4 quests diárias de treinamento físico desafiadoras. 
      Se o Hunter pratica ${userData.martialArt}, inclua exercícios específicos para o NÍVEL ${artLevel}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o Sistema de Solo Leveling. Gere quests de treinamento. Retorne APENAS um array JSON de objetos Quest seguindo o schema. Use tom autoritário.",
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
              type: { type: Type.STRING, description: "STR, AGI ou VIT" }
            },
            required: ["id", "title", "description", "reps", "sets", "instructions", "xpReward", "type"]
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text).map((q: any) => ({ ...q, location, completed: false }));
  }).catch(() => []);
};

export const generateSurvivalGuide = async (userData: UserData): Promise<HealthTip[]> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return [];

    return callGeminiWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Gere 4 dicas de saúde para um Hunter focado em ${userData.dailyGoal}. Use tom de Solo Leveling.`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                systemInstruction: "Você é o Sistema. Forneça conselhos de vitalidade. Retorne APENAS um array JSON {category, content, importance}.",
                responseMimeType: "application/json" 
            }
        });
        const text = response.text || "[]";
        return JSON.parse(text);
    }).catch(() => []);
};

export const generateMartialDrills = async (userData: UserData): Promise<MartialDrill[]> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || userData.martialArt === MartialArt.NONE) return [];
    
    const currentArtProgress = userData.martialProgress[userData.martialArt];
    
    return callGeminiWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Gere 3 drills técnicos e 2 de condicionamento para ${userData.martialArt} NÍVEL ${currentArtProgress.level}.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { 
                systemInstruction: "Você é o Instrutor do Shadow Dojo. Gere drills técnicos. Retorne APENAS um array JSON {title, description, reps, isPhysical}.",
                responseMimeType: "application/json" 
            }
        });
        const text = response.text || "[]";
        return JSON.parse(text);
    }).catch(() => []);
};
