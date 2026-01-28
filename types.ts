
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
  str: number;
  agi: number;
  vit: number;
  int: number;
  sen: number;
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
  instructions: string;
  xpReward: number;
  completed: boolean;
  type: 'STR' | 'AGI' | 'VIT';
}
