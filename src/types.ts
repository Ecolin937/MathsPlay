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

export interface Question {
  id: string;
  text: string;
  answer: string | number;
  options: (string | number)[];
}
