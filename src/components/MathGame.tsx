import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowLeft, CheckCircle2, XCircle, Timer, Zap, Loader2, BrainCircuit } from 'lucide-react';
import { Difficulty, Operation, Question, GameStats, Grade } from '../types';
import { generateQuestion } from '../utils';

interface GameProps {
  difficulty: Difficulty;
  grade: Grade;
  operation: Operation;
  onBack: () => void;
}

export const MathGame: React.FC<GameProps> = ({ difficulty, grade, operation, onBack }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    bestStreak: 0,
  });
  const [streak, setStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const TOTAL_QUESTIONS = 20;

  useEffect(() => {
    nextQuestion();
  }, []);

  const nextQuestion = () => {
    if (stats.totalQuestions >= TOTAL_QUESTIONS) {
      setIsGameOver(true);
      return;
    }
    setQuestion(generateQuestion(difficulty, operation, grade));
    setFeedback(null);
  };

  const handleAnswer = async (selected: string | number) => {
    if (isGameOver || feedback) return;

    const isCorrect = selected === question?.answer;
    const newTotal = stats.totalQuestions + 1;
    
    setStats((prev) => ({
      ...prev,
      totalQuestions: newTotal,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      score: isCorrect ? prev.score + (10 * (streak + 1)) : prev.score,
      bestStreak: Math.max(prev.bestStreak, isCorrect ? streak + 1 : streak),
    }));

    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setFeedback('correct');
      setTimeout(nextQuestion, 600);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(nextQuestion, 2000);
    }
  };

  if (isGameOver) {
    const finalGrade = Math.round((stats.correctAnswers / TOTAL_QUESTIONS) * 20);
    let message = "Continue tes efforts !";
    if (finalGrade >= 18) message = "Excellent ! Tu es un génie !";
    else if (finalGrade >= 14) message = "Très bien ! Beau travail !";
    else if (finalGrade >= 10) message = "Pas mal ! Tu as la moyenne.";

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"
      >
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-primary/50">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl md:text-4xl font-display mb-2 text-white px-4">Session terminée !</h2>
        <p className="text-slate-400 mb-8 text-sm md:text-lg px-6">{message}</p>
        
        <div className="glass-card border-primary/20 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 mb-8 w-[80%] max-w-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
          <p className="text-[10px] text-primary uppercase font-bold tracking-[0.3em] mb-4">Note Finale</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl md:text-8xl font-display text-white">{finalGrade}</span>
            <span className="text-lg md:text-2xl font-display text-slate-500">/ 20</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 w-full max-w-md mb-8 md:mb-12 px-4">
          <div className="glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl border-white/5">
            <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Précision</p>
            <p className="text-2xl md:text-3xl font-display text-accent">
              {Math.round((stats.correctAnswers / TOTAL_QUESTIONS) * 100)}%
            </p>
          </div>
          <div className="glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl border-white/5">
            <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Meilleure Série</p>
            <p className="text-2xl md:text-3xl font-display text-secondary">{stats.bestStreak}</p>
          </div>
        </div>

        <button 
          onClick={onBack}
          className="group relative px-12 py-4 bg-primary text-white rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          Menu Principal
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <button onClick={onBack} className="p-2 md:p-3 hover:bg-white/10 rounded-xl md:rounded-2xl transition-colors text-slate-400">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <div className="flex items-center gap-2 md:gap-6">
          <div className="text-right">
            <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Question</p>
            <p className="text-lg md:text-2xl font-display text-white">{stats.totalQuestions + 1} <span className="text-slate-600 text-[10px] md:text-sm">/ {TOTAL_QUESTIONS}</span></p>
          </div>
          <div className="w-px h-4 md:h-8 bg-white/10" />
          <div className="text-left">
            <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Score</p>
            <p className="text-lg md:text-2xl font-display text-primary">{stats.score}</p>
          </div>
        </div>
      </div>

      <div className="relative mb-16">
        <AnimatePresence mode="wait">
          {streak >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] z-30"
            >
              SÉRIE x{streak} ! 🔥
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-card rounded-2xl md:rounded-[3.5rem] p-6 md:p-16 text-center relative overflow-hidden border-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />
          <AnimatePresence mode="wait">
            <motion.div
              key={question?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10"
            >
              <span className="text-[8px] md:text-xs font-bold text-primary uppercase tracking-[0.4em] mb-2 md:mb-6 block opacity-60">Calcul en cours</span>
              <h3 className="text-4xl md:text-9xl font-display tracking-tighter text-white">
                {question?.text}
              </h3>
            </motion.div>
          </AnimatePresence>
          
          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                {feedback === 'correct' ? (
                  <div className="w-40 h-40 bg-accent/10 rounded-full flex items-center justify-center border border-accent/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-20 h-20 text-accent" />
                  </div>
                ) : (
                  <div className="w-40 h-40 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
                    <XCircle className="w-20 h-20 text-rose-500" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {question?.options.map((option, idx) => (
          <motion.button
            key={`${question.id}-${idx}`}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(option)}
            disabled={!!feedback}
            className={`
              p-4 md:p-8 rounded-xl md:rounded-[2rem] text-xl md:text-4xl font-display transition-all border
              ${feedback === 'correct' && option === question.answer ? 'bg-accent/20 text-accent border-accent shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
                feedback === 'wrong' && option === question.answer ? 'bg-accent/20 text-accent border-accent' :
                feedback === 'wrong' && option === (question.options.find(o => o === option)) ? 'bg-rose-500/20 text-rose-500 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]' :
                'glass-card border-white/5 text-white hover:border-primary/50 hover:bg-white/5'}
            `}
          >
            {option}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
};
