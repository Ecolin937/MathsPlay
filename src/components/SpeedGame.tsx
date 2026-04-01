import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, Zap, Trophy, Check, X } from 'lucide-react';
import { Difficulty, Operation, Grade } from '../types';
import { generateQuestion } from '../utils';

interface SpeedGameProps {
  difficulty: Difficulty;
  grade: Grade;
  operation: Operation;
  onBack: () => void;
}

export const SpeedGame: React.FC<SpeedGameProps> = ({ difficulty, grade, operation, onBack }) => {
  const [currentTask, setCurrentTask] = useState<{ text: string, answer: string | number, displayValue: string | number, isCorrect: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const nextTask = () => {
    const q = generateQuestion(difficulty, operation, grade);
    const isCorrect = Math.random() > 0.5;
    let displayValue: string | number;
    
    if (isCorrect) {
      displayValue = q.answer;
    } else {
      if (typeof q.answer === 'number') {
        displayValue = q.answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      } else {
        const parts = q.answer.split('/');
        displayValue = `${parseInt(parts[0]) + 1}/${parts[1]}`;
      }
    }
    
    setCurrentTask({
      text: q.text,
      answer: q.answer,
      displayValue,
      isCorrect: displayValue === q.answer
    });
    setFeedback(null);
  };

  useEffect(() => {
    nextTask();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChoice = (choice: boolean) => {
    if (isGameOver || feedback || !currentTask) return;

    const correct = choice === currentTask.isCorrect;
    if (correct) {
      setScore(s => s + 10);
      setFeedback('correct');
      setTimeLeft(t => Math.min(t + 1, 45));
      setTimeout(nextTask, 200);
    } else {
      setFeedback('wrong');
      setTimeLeft(t => Math.max(0, t - 3));
      setTimeout(nextTask, 400);
    }
  };

  if (isGameOver) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] text-center p-4 md:p-6"
      >
        <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-primary/50">
          <Trophy className="w-8 h-8 md:w-12 md:h-12 text-primary" />
        </div>
        <h2 className="text-2xl md:text-4xl font-display mb-2 text-white">Vitesse Éclair !</h2>
        <p className="text-slate-400 mb-6 md:mb-8 text-base md:text-lg">Traitement des données terminé.</p>
        
        <div className="glass-card border-primary/20 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 mb-8 md:mb-12 w-full max-w-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
          <p className="text-[10px] md:text-xs text-primary uppercase font-bold tracking-[0.3em] mb-2 md:mb-4">Score Final</p>
          <p className="text-5xl md:text-7xl font-display text-white">{score}</p>
        </div>

        <button 
          onClick={onBack} 
          className="group relative px-8 md:px-12 py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          Retour au Menu
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full px-4 md:px-0">
      <div className="flex justify-between items-center mb-6 md:mb-12">
        <button onClick={onBack} className="p-2 md:p-3 hover:bg-white/10 rounded-xl md:rounded-2xl transition-colors text-slate-400">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="flex gap-2 md:gap-4">
          <div className="glass-card px-4 md:px-6 py-1.5 md:py-2 rounded-full border-white/5 flex items-center gap-2 md:gap-3">
            <Timer className={`w-4 h-4 md:w-5 md:h-5 ${timeLeft < 5 ? 'text-rose-500 animate-pulse' : 'text-primary'}`} />
            <span className="font-bold text-white text-base md:text-lg">{timeLeft}s</span>
          </div>
          <div className="glass-card px-4 md:px-6 py-1.5 md:py-2 rounded-full border-white/5 flex items-center gap-2 md:gap-3">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            <span className="font-bold text-white text-base md:text-lg">{score}</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 text-center mb-6 md:mb-12 min-h-[250px] md:min-h-[350px] flex flex-col justify-center relative overflow-hidden border-white/5">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTask?.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 block opacity-60">Vérification de donnée</span>
            <h3 className="text-4xl md:text-6xl font-display mb-4 md:mb-6 text-white">{currentTask?.text}</h3>
            <div className="text-5xl md:text-7xl font-display text-primary tracking-tighter">
              = {currentTask?.displayValue}
            </div>
          </motion.div>
        </AnimatePresence>

        {feedback && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1.5, opacity: 0.2 }} 
            className={`absolute inset-0 flex items-center justify-center pointer-events-none ${feedback === 'correct' ? 'text-accent' : 'text-rose-500'}`}
          >
            {feedback === 'correct' ? <Check size={100} className="md:w-[150px] md:h-[150px]" strokeWidth={3} /> : <X size={100} className="md:w-[150px] md:h-[150px]" strokeWidth={3} />}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8">
        <motion.button 
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleChoice(false)}
          className="bg-rose-500/10 text-rose-500 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)] transition-all flex flex-col items-center gap-2 md:gap-4 hover:bg-rose-500/20"
        >
          <X className="w-8 h-8 md:w-12 md:h-12" />
          <span className="font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-sm">Faux</span>
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleChoice(true)}
          className="bg-accent/10 text-accent p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-accent/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all flex flex-col items-center gap-2 md:gap-4 hover:bg-accent/20"
        >
          <Check className="w-8 h-8 md:w-12 md:h-12" />
          <span className="font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-sm">Vrai</span>
        </motion.button>
      </div>
    </div>
  );
};
