export type Grade = '6eme' | '5eme' | '4eme';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type Operation = 
  | 'addition' 
  | 'subtraction' 
  | 'multiplication' 
  | 'division' 
  | 'decimals'
  | 'fractions'
  | 'relatives'
  | 'powers'
  | 'equations'
  | 'percentages'
  | 'proportionality'
  | 'mixed';

export interface GameStats {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  bestStreak: number;
}

export interface DailyQuest {
  id: string;
  label: string;
  target: number;
  current: number;
  completed: boolean;
  reward: number;
}

export interface WeakPoint {
  id: string;
  label: string;
  errors: number;
  lastAttempt: string;
}

export interface DictEntry {
  term: string;
  definition: string;
  example: string;
}

export interface Question {
  id: string;
  text: string;
  answer: string | number;
  options: (string | number)[];
}
