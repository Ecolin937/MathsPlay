import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, Trophy, HelpCircle } from 'lucide-react';
import { Difficulty, Grade } from '../types';

interface PatternGameProps {
  difficulty: Difficulty;
  grade: Grade;
  onBack: () => void;
}

export const PatternGame: React.FC<PatternGameProps> = ({ difficulty, grade, onBack }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [answer, setAnswer] = useState<number>(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    generatePattern();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generatePattern = () => {
    const length = 4;
    let start = Math.floor(Math.random() * 20);
    let step = Math.floor(Math.random() * 10) + 1;
    const type = Math.random() > 0.5 ? 'add' : 'mul';

    if (difficulty === 'hard') step = Math.floor(Math.random() * 15) + 5;
    if (type === 'mul' && difficulty === 'easy') step = 2;

    const newSeq: number[] = [];
    let current = start;
    for (let i = 0; i < length; i++) {
      newSeq.push(current);
      current = type === 'add' ? current + step : current * step;
    }

    const nextValue = current;
    setSequence(newSeq);
    setAnswer(nextValue);

    const newOptions = [nextValue];
    while (newOptions.length < 4) {
      const offset = (Math.floor(Math.random() * 10) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const opt = nextValue + offset;
      if (opt > 0 && !newOptions.includes(opt)) newOptions.push(opt);
    }
    setOptions(newOptions.sort(() => Math.random() - 0.5));
  };

  const handleAnswer = (selected: number) => {
    if (selected === answer) {
      setScore(s => s + 10);
      generatePattern();
    } else {
      setTimeLeft(t => Math.max(0, t - 5));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 md:mb-12 pt-16 md:pt-0">
        <button onClick={onBack} className="p-2 md:p-3 glass rounded-xl md:rounded-2xl hover:bg-white/10 transition-all text-white">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="flex gap-2 md:gap-4">
          <div className="glass px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-white font-bold flex items-center gap-2 text-sm md:text-base">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" /> {score}
          </div>
          <div className={`glass px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="glass-card p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] w-full max-w-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
        <h2 className="text-base md:text-2xl font-display text-slate-400 mb-4 md:mb-8 uppercase tracking-widest">Complète la suite</h2>
        
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-12">
          {sequence.map((num, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-12 h-12 sm:w-16 md:w-20 glass rounded-lg md:rounded-2xl flex items-center justify-center text-sm sm:text-xl md:text-3xl font-bold text-white border-white/10"
            >
              {num}
            </motion.div>
          ))}
          <div className="w-12 h-12 sm:w-16 md:w-20 bg-primary/20 border-2 border-dashed border-primary/50 rounded-lg md:rounded-2xl flex items-center justify-center">
            <HelpCircle className="w-5 h-5 md:w-8 md:h-8 text-primary animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {options.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(opt)}
              className="py-3 md:py-6 glass rounded-xl md:rounded-2xl text-base md:text-xl font-bold text-white hover:bg-white/5 transition-all border-white/5"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl"
          >
            <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-center max-w-md w-full">
              <Trophy className="w-16 h-16 md:w-20 md:h-20 text-accent mx-auto mb-4 md:mb-6" />
              <h2 className="text-3xl md:text-4xl font-display text-white mb-2 md:mb-4">Temps écoulé !</h2>
              <p className="text-slate-400 mb-6 md:mb-8 text-base md:text-lg">Ton score neural : <span className="text-primary font-bold">{score}</span></p>
              <button
                onClick={() => {
                  setScore(0);
                  setTimeLeft(30);
                  setIsGameOver(false);
                  generatePattern();
                }}
                className="w-full py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-bold hover:scale-105 transition-all text-sm md:text-base"
              >
                Recommencer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
