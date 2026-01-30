
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, TrainingLocation, HealthTip, MartialDrill, MartialArt } from "../types.ts";

// Helper para obter API KEY de forma segura
const getApiKey = () => {
  try {
    // Tenta pegar de process.env, mas se falhar (ex: navegador puro) retorna string vazia
    return (typeof process !== 'undefined' && process.env) ? process.env.API_KEY || '' : '';
  } catch (e) {
    return '';
  }
};

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
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("[ERRO]: Chave de API não configurada.");
    return [];
  }

  const artLevel = userData.martialProgress[userData.martialArt]?.level || 1;

  return callGeminiWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Hunter: ${userData.name}. Objetivo: ${userData.dailyGoal}. 
      Arte Marcial: ${userData.martialArt} (Nível Técnico: ${artLevel}).
      Dungeon: ${location}.
      Gere 4 quests diárias de treinamento físico desafiadoras. Use tom do anime Solo Leveling.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é o Sistema de Solo Leveling. Gere quests. Retorne APENAS um array JSON de objetos Quest.",
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
              type: { type: Type.STRING, description: "Deve ser STR, AGI ou VIT" }
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
    const apiKey = getApiKey();
    if (!apiKey) return [];

    return callGeminiWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Gere 4 dicas de saúde para um Hunter com o objetivo de ${userData.dailyGoal}.`,
            config: { 
                systemInstruction: "Você é o Sistema. Forneça dicas de sobrevivência. Retorne APENAS array JSON {category, content, importance}.",
                responseMimeType: "application/json" 
            }
        });
        return JSON.parse(response.text || "[]");
    }).catch(() => []);
};

export const generateMartialDrills = async (userData: UserData): Promise<MartialDrill[]> => {
    const apiKey = getApiKey();
    if (!apiKey || userData.martialArt === MartialArt.NONE) return [];
    
    const martialProg = userData.martialProgress[userData.martialArt];
    const level = martialProg ? martialProg.level : 1;
    
    return callGeminiWithRetry(async () => {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Gere 5 drills específicos de ${userData.martialArt} para o NÍVEL TÉCNICO ${level}.`,
            config: { 
                systemInstruction: "Você é o Instrutor do Shadow Dojo. Gere treinos marciais técnicos. Retorne APENAS array JSON {title, description, reps, isPhysical}.",
                responseMimeType: "application/json" 
            }
        });
        return JSON.parse(response.text || "[]");
    }).catch(() => []);
};
