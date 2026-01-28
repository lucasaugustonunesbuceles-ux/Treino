
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
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === '') {
    console.warn("API_KEY não configurada no ambiente. Usando missões padrão.");
    return FALLBACK_QUESTS;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Analise os dados corporais: Gênero ${userData.gender}, Idade ${userData.age}, Peso ${userData.weight}kg, Altura ${userData.height}cm.
      Meta: ${userData.dailyGoal}. Dificuldade: ${userData.difficulty}.
      
      Como o "Sistema" de Solo Leveling, gere 4 quests diárias personalizadas de exercícios físicos reais.
      
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
      O tom deve ser autoritário e solene.
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

    const text = response.text;
    if (!text) throw new Error("Sistema falhou ao retornar dados.");
    
    return JSON.parse(text).map((q: any) => ({ ...q, completed: false }));
  } catch (error) {
    console.error("Erro crítico do Sistema:", error);
    return FALLBACK_QUESTS;
  }
};

export const analyzeBodyComposition = async (userData: UserData): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "O Sistema iniciou em modo offline. O despertar foi concluído com sucesso.";

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Como o Sistema de Solo Leveling, faça uma análise curta (máximo 2 frases) e impactante do despertar deste caçador: ${userData.gender}, ${userData.weight}kg, ${userData.height}cm, meta ${userData.dailyGoal}.`;
      
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt 
      });
      return response.text ?? "Seu potencial é vasto. Comece o treinamento imediatamente.";
    } catch (e) {
      return "Sua jornada rumo ao topo começa agora. Não vacile diante das provações.";
    }
};
