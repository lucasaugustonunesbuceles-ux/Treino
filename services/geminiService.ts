
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyQuests = async (userData: UserData): Promise<Quest[]> => {
  const prompt = `
    Analise os dados deste usuário:
    Gênero: ${userData.gender}
    Meta: ${userData.dailyGoal}
    Dificuldade Selecionada: ${userData.difficulty}
    Idade: ${userData.age} anos
    Peso: ${userData.weight}kg
    Altura: ${userData.height}cm
    Level: ${userData.level}
    Rank: ${userData.rank}

    Como o "Sistema", crie uma lista de 4 quests (exercícios físicos) diárias.
    As quests devem ser personalizadas para o Gênero, Meta e Dificuldade.
    
    REGRAS DE DIFICULDADE:
    - Fácil: Exercícios leves, poucas repetições.
    - Normal: Intensidade moderada.
    - Difícil: Muitas repetições, tempos de descanso curtos.
    - Infernal: Volume extremo de treino, repetições altíssimas e exercícios complexos.

    REGRAS DE RECOMPENSA DE XP (BASEADAS NA DIFICULDADE):
    - Se Fácil: AGI: 35, VIT: 70, STR: 105 XP.
    - Se Normal: AGI: 50, VIT: 100, STR: 150 XP.
    - Se Difícil: AGI: 75, VIT: 150, STR: 225 XP.
    - Se Infernal: AGI: 125, VIT: 250, STR: 375 XP.
    
    Cada quest deve incluir:
    - title: Nome do exercício.
    - description: O que o exercício foca.
    - reps/sets: Repetições e séries (Ajuste de acordo com a dificuldade ${userData.difficulty}).
    - instructions: Um passo a passo detalhado e técnico.
    
    Distribua as 4 quests entre STR, AGI e VIT.
    O tom deve ser autoritário, solene e motivador.
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
            type: { type: Type.STRING, description: "Deve ser STR, AGI ou VIT" }
          },
          required: ["id", "title", "description", "reps", "sets", "instructions", "xpReward", "type"]
        }
      }
    }
  });

  try {
    const rawJson = response.text?.trim() ?? "[]";
    const quests = JSON.parse(rawJson);
    return quests.map((q: any) => ({ ...q, completed: false }));
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    return [];
  }
};

export const analyzeBodyComposition = async (userData: UserData): Promise<string> => {
    const prompt = `Você é o "Sistema". Analise o perfil: 
    Gênero: ${userData.gender}, Peso ${userData.weight}kg, Altura ${userData.height}cm, Meta: ${userData.dailyGoal}, Dificuldade: ${userData.difficulty}. 
    Dê um relatório impactante de "O Sistema" sobre o despertar dele. Mencione os riscos e benefícios da dificuldade ${userData.difficulty} escolhida.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    
    return response.text ?? "O Sistema está analisando sua constituição física...";
};
