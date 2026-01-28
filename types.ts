
export enum Rank {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S'
}

export enum Difficulty {
  EASY = 'Fácil',
  NORMAL = 'Normal',
  HARD = 'Difícil',
  HELL = 'Infernal'
}

export interface UserStats {
  str: number; // Força
  agi: number; // Agilidade
  vit: number; // Vitalidade
  int: number; // Inteligência (Consistência)
  sen: number; // Senso (Consciência corporal)
}

export interface UserData {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: string;
  dailyGoal: string;
  difficulty: Difficulty;
  level: number;
  xp: number;
  rank: Rank;
  stats: UserStats;
  isAwakened: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reps: string;
  sets: string;
  instructions: string; // Detalhes técnicos do exercício
  xpReward: number;
  completed: boolean;
  type: 'STR' | 'AGI' | 'VIT';
}

export interface DailyQuests {
  date: string;
  quests: Quest[];
}
