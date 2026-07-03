export interface HistoryEntry {
  id: string;
  date: string;
  question: string;
  userAnswer: string | number;
  correctAnswer: string | number;
  isCorrect: boolean;
  gameMode?: string;
}

export const getHistory = (): HistoryEntry[] => {
  try {
    const data = localStorage.getItem('mathsplay_history');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addHistoryEntry = (entry: Omit<HistoryEntry, 'id' | 'date'>) => {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
  };
  const newHistory = [newEntry, ...history].slice(0, 500); // Keep last 500 entries
  localStorage.setItem('mathsplay_history', JSON.stringify(newHistory));
};

export const clearHistory = () => {
  localStorage.removeItem('mathsplay_history');
};
