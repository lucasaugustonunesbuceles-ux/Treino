
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, Difficulty } from "../types";

const FALLBACK_QUESTS: Quest[] = [
  {
    id: "fb-1",
    title: "Flexões de Braço",
    description: "Fortalecimento peitoral básico.",
    reps: "20",
    sets: "4",
    instructions: "Mantenha o corpo reto e desça até quase tocar o chão. Expire ao subir.",
    xpReward: 100,
    type: 'STR',
    completed: false
  },
  {
    id: "fb-2",
    title: "Agachamentos",
    description: "Fortalecimento de membros inferiores.",
    reps: "30",
    sets: "3",
    instructions: "Pés na largura dos ombros, desça como se fosse sentar em uma cadeira.",
    xpReward: 80,
    type: 'VIT',
    completed: false
  },
  {
    id: "fb-3",
    title: "Abdominais",
    description: "Fortalecimento do core.",
    reps: "25",
    sets: "4",
    instructions: "Deitado, suba o tronco contraindo o abdômen. Não puxe o pescoço.",
    xpReward: 90,
    type: 'VIT',
    completed: false
  }
];

export const generateDailyQuests = async (userData: UserData): Promise<Quest[]> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY não encontrada. Usando missões de contingência.");
    return FALLBACK_QUESTS;
  }

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

    Retorne APENAS um JSON array de objetos seguindo o schema.
    O tom deve ser autoritário e solene como em Solo Leveling.
  `;

  try {
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

    const rawJson = response.text?.trim();
    if (!rawJson) throw new Error("Resposta vazia da IA");
    
    return JSON.parse(rawJson).map((q: any) => ({ ...q, completed: false }));
  } catch (error) {
    console.error("Erro ao gerar missões via Gemini:", error);
    return FALLBACK_QUESTS;
  }
};

export const analyzeBodyComposition = async (userData: UserData): Promise<string> => {
    if (!process.env.API_KEY) return "O Sistema iniciou em modo offline. O mundo ainda aguarda seu despertar.";

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Como o Sistema de Solo Leveling, faça uma análise curta e impactante do despertar deste caçador: ${userData.gender}, ${userData.weight}kg, ${userData.height}cm, dificuldade ${userData.difficulty}.`;
    
    try {
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: prompt 
      });
      return response.text ?? "O Sistema está processando seu potencial...";
    } catch (e) {
      return "Sua jornada rumo ao topo começa agora. Não vacile diante das provações.";
    }
};
