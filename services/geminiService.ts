
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, TrainingLocation, HealthTip, MartialDrill, MartialArt } from "../types";

const getApiKey = () => {
  try {
    // Tenta pegar de várias fontes para garantir funcionamento no Render/AI Studio
    return (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
      ? process.env.API_KEY 
      : (window as any).process?.env?.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const EMERGENCY_QUESTS: Quest[] = [
  { id: 'e1', title: 'Flexões de Braço', description: 'Treino básico de força.', reps: '10', sets: '3', instructions: 'Mantenha o corpo reto.', xpReward: 50, type: 'STR', location: TrainingLocation.HOME, completed: false },
  { id: 'e2', title: 'Abdominais', description: 'Fortalecimento de core.', reps: '20', sets: '3', instructions: 'Suba até sentir o abdômen contrair.', xpReward: 40, type: 'VIT', location: TrainingLocation.HOME, completed: false },
  { id: 'e3', title: 'Agachamentos', description: 'Treino de pernas.', reps: '15', sets: '3', instructions: 'Pés na largura dos ombros.', xpReward: 45, type: 'STR', location: TrainingLocation.HOME, completed: false },
  { id: 'e4', title: 'Corrida Estática', description: 'Cardio rápido.', reps: '30s', sets: '4', instructions: 'Mova os braços e pernas rápido.', xpReward: 60, type: 'AGI', location: TrainingLocation.HOME, completed: false }
];

async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.warn(`[SISTEMA]: Tentativa ${i+1} falhou. Re-sincronizando...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw lastError;
}

export const generateDailyQuests = async (userData: UserData, location: TrainingLocation): Promise<Quest[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.info("[SISTEMA]: Chave API ausente. Ativando Quests de Emergência.");
    return EMERGENCY_QUESTS.map(q => ({ ...q, location }));
  }

  try {
    return await callGeminiWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Hunter: ${userData.name}. Objetivo: ${userData.dailyGoal}. Dungeon: ${location}. Gere 4 quests de treino físico.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é o Sistema. Retorne APENAS um array JSON de objetos Quest.",
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
      const data = JSON.parse(response.text || "[]");
      return data.length > 0 ? data.map((q: any) => ({ ...q, location, completed: false })) : EMERGENCY_QUESTS;
    });
  } catch (err) {
    return EMERGENCY_QUESTS.map(q => ({ ...q, location }));
  }
};

export const generateSurvivalGuide = async (userData: UserData): Promise<HealthTip[]> => {
    const apiKey = getApiKey();
    if (!apiKey) return [{ category: 'Aviso', content: 'Mantenha-se hidratado e respeite seus limites.', importance: 'NORMAL' }];
    
    try {
        return await callGeminiWithRetry(async () => {
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
        });
    } catch {
        return [];
    }
};

export const generateMartialDrills = async (userData: UserData): Promise<MartialDrill[]> => {
    const apiKey = getApiKey();
    if (!apiKey || userData.martialArt === MartialArt.NONE) return [];
    
    try {
        return await callGeminiWithRetry(async () => {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Drills para ${userData.martialArt}.`,
                config: { 
                    systemInstruction: "Retorne APENAS array JSON {title, description, reps, isPhysical}.",
                    responseMimeType: "application/json" 
                }
            });
            return JSON.parse(response.text || "[]");
        });
    } catch {
        return [];
    }
};
