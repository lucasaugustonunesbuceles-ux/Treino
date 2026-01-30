
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, TrainingLocation, HealthTip, MartialDrill, MartialArt } from "../types";

export const generateDailyQuests = async (userData: UserData, location: TrainingLocation): Promise<Quest[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  const artLevel = userData.martialProgress[userData.martialArt]?.level || 1;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Hunter: ${userData.name}. Objetivo: ${userData.dailyGoal}. 
      Arte Marcial: ${userData.martialArt} (Nível Técnico: ${artLevel}).
      Dungeon: ${location}.
      
      Gere 4 quests diárias. 
      REGRAS:
      - Se o Hunter pratica ${userData.martialArt}, inclua 2 exercícios de condicionamento físico que melhorem a performance técnica para o NÍVEL ${artLevel}.
      - Se Capoeira Nível ${artLevel}: Gere treinos de fluidez e força explosiva adaptados para o local ${location}.
      - Retorne JSON array de Quest.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    return JSON.parse(response.text).map((q: any) => ({ ...q, location, completed: false }));
  } catch (error) {
    return [];
  }
};

export const generateSurvivalGuide = async (userData: UserData): Promise<HealthTip[]> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return [];
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Gere 4 dicas de saúde para um Hunter focado em ${userData.dailyGoal}. Use tom de Solo Leveling. JSON array {category, content, importance}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
    } catch { return []; }
};

export const generateMartialDrills = async (userData: UserData): Promise<MartialDrill[]> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || userData.martialArt === MartialArt.NONE) return [];
    
    const currentArtProgress = userData.martialProgress[userData.martialArt];
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Gere 3 drills técnicos e 2 de condicionamento para ${userData.martialArt} NÍVEL ${currentArtProgress.level}. 
        Como o Hunter é nível ${currentArtProgress.level}, as técnicas devem ser condizentes com sua maestria. 
        No caso de Capoeira: use nomes tradicionais (Ginga, Meia-lua, Coca-pula, etc) conforme o nível. 
        JSON array {title, description, reps, isPhysical}.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text);
    } catch { return []; }
};
