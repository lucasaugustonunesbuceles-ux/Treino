
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, Quest, Difficulty } from "../types";

// Banco de dados expandido para quando a API falhar ou não houver chave
const FALLBACK_QUESTS: Quest[] = [
  {
    id: "fb-1",
    title: "Flexões de Braço",
    description: "Treinamento básico de força superior.",
    reps: "20",
    sets: "4",
    instructions: "Mantenha o core rígido e os cotovelos a 45 graus do corpo. Desça lentamente e exploda na subida.",
    xpReward: 150,
    type: 'STR',
    completed: false
  },
  {
    id: "fb-2",
    title: "Agachamentos (Squats)",
    description: "Fortalecimento de base e explosão.",
    reps: "30",
    sets: "3",
    instructions: "Mantenha as costas retas e o peso nos calcanhares. Imagine sentar em um trono invisível.",
    xpReward: 100,
    type: 'VIT',
    completed: false
  },
  {
    id: "fb-3",
    title: "Abdominais Infra",
    description: "Estabilidade de core nível E.",
    reps: "25",
    sets: "4",
    instructions: "Deitado, levante as pernas esticadas até 90 graus e desça sem tocar o chão.",
    xpReward: 120,
    type: 'VIT',
    completed: false
  },
  {
    id: "fb-4",
    title: "Burpees de Combate",
    description: "Treinamento de agilidade e cardio intenso.",
    reps: "12",
    sets: "3",
    instructions: "De pé, pule para posição de prancha, faça uma flexão, volte e pule batendo as mãos acima da cabeça.",
    xpReward: 200,
    type: 'AGI',
    completed: false
  },
  {
    id: "fb-5",
    title: "Prancha Isométrica",
    description: "Resistência de Hunter.",
    reps: "60 segundos",
    sets: "3",
    instructions: "Apoie-se nos antebraços e pontas dos pés. Mantenha o corpo como uma linha reta absoluta.",
    xpReward: 150,
    type: 'VIT',
    completed: false
  },
  {
    id: "fb-6",
    title: "Polichinelos",
    description: "Aquecimento de Agilidade.",
    reps: "50",
    sets: "3",
    instructions: "Mantenha um ritmo constante e respiração controlada. Coordene braços e pernas.",
    xpReward: 80,
    type: 'AGI',
    completed: false
  }
];

export const generateDailyQuests = async (userData: UserData): Promise<Quest[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === '' || apiKey === 'undefined') {
    console.warn("[SISTEMA]: API_KEY ausente. Ativando Protocolo de Contingência.");
    return FALLBACK_QUESTS.slice(0, 4); // Retorna 4 aleatórias do fallback
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Analise: Gênero ${userData.gender}, Idade ${userData.age}, Peso ${userData.weight}kg, Altura ${userData.height}cm.
      Dificuldade: ${userData.difficulty}.
      Como o "Sistema" de Solo Leveling, gere exatamente 4 quests diárias.
      REGRAS:
      - Tonelada de autoridade.
      - Exercícios reais.
      - Retorne JSON puro.
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
    if (!text) throw new Error("Vazio");
    
    const parsed = JSON.parse(text);
    return parsed.map((q: any) => ({ ...q, completed: false }));
  } catch (error) {
    console.error("[ERRO SISTEMA]: Revertendo para missões de emergência.", error);
    return FALLBACK_QUESTS.sort(() => 0.5 - Math.random()).slice(0, 4);
  }
};

export const analyzeBodyComposition = async (userData: UserData): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === 'undefined') return "O Sistema reconhece seu despertar. O treinamento começa agora.";

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Como o Sistema, analise o despertar: ${userData.weight}kg, ${userData.height}cm. Seja breve e impactante.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      return response.text ?? "Seu potencial foi registrado.";
    } catch (e) {
      return "Sua jornada rumo ao topo começa agora. Não vacile.";
    }
};
