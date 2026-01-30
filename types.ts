
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

export enum TrainingLocation {
  HOME = 'Em Casa',
  CALISTHENICS = 'Calistenia',
  GYM = 'Academia'
}

export enum MartialArt {
  NONE = 'Nenhuma',
  BOXING = 'Boxe',
  MUAY_THAI = 'Muay Thai',
  JIU_JITSU = 'Jiu-Jitsu',
  KARATE = 'Karatê',
  MMA = 'MMA',
  CAPOEIRA = 'Capoeira'
}

export interface MartialProgress {
  level: number;
  xp: number;
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
  preferredLocation?: TrainingLocation;
  martialArt: MartialArt;
  martialProgress: Record<MartialArt, MartialProgress>;
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
  location: TrainingLocation;
}

export interface HealthTip {
  category: string;
  content: string;
  importance: 'ALTA' | 'CRÍTICA' | 'NORMAL';
}

export interface MartialDrill {
  title: string;
  description: string;
  reps: string;
  isPhysical: boolean; 
}
