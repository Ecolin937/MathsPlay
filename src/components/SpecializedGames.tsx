import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, Trophy, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { Difficulty } from '../types';

interface SpecializedGameProps {
  type: 'duration' | 'conversion';
  difficulty: Difficulty;
  onBack: () => void;
}

export const SpecializedGames: React.FC<SpecializedGameProps> = ({ type, difficulty, onBack }) => {
  const [question, setQuestion] = useState<{ q: string, a: string | number, options: (string | number)[] } | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateQuestion = () => {
    if (type === 'duration') {
      const h1 = Math.floor(Math.random() * 12);
      const m1 = Math.floor(Math.random() * 60);
      const diffH = difficulty === 'hard' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 3) + 1;
      const diffM = Math.floor(Math.random() * 60);
      
      const totalM1 = h1 * 60 + m1;
      const totalM2 = totalM1 + diffH * 60 + diffM;
      const h2 = Math.floor(totalM2 / 60) % 24;
      const m2 = totalM2 % 60;

      const q = `Durée entre ${h1.toString().padStart(2, '0')}:${m1.toString().padStart(2, '0')} et ${h2.toString().padStart(2, '0')}:${m2.toString().padStart(2, '0')} ?`;
      const a = `${diffH}h ${diffM}min`;
      
      const options = [a];
      while(options.length < 4) {
        const falseH = Math.max(0, diffH + Math.floor(Math.random() * 3) - 1);
        const falseM = Math.floor(Math.random() * 60);
        const falseA = `${falseH}h ${falseM}min`;
        if(!options.includes(falseA)) options.push(falseA);
      }
      setQuestion({ q, a, options: options.sort(() => Math.random() - 0.5) });
    } else {
      // Conversions
      const units = ['m', 'cm', 'mm', 'km'];
      const from = units[Math.floor(Math.random() * units.length)];
      let to = units[Math.floor(Math.random() * units.length)];
      while(to === from) to = units[Math.floor(Math.random() * units.length)];
      
      const val = Math.floor(Math.random() * 100) + 1;
      const factors: Record<string, number> = { 'mm': 1, 'cm': 10, 'm': 1000, 'km': 1000000 };
      const result = (val * factors[from]) / factors[to];
      
      const q = `Convertir ${val}${from} en ${to}`;
      const a = result.toString();
      
      const options = [a];
      while(options.length < 4) {
        const falseA = (result * (Math.random() > 0.5 ? 10 : 0.1)).toString();
        if(!options.includes(falseA)) options.push(falseA);
      }
      setQuestion({ q, a, options: options.sort(() => Math.random() - 0.5) });
    }
  };

  useEffect(() => {
    generateQuestion();
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if(t <= 1) { clearInterval(timer); setIsGameOver(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (ans: string | number) => {
    if(ans === question?.a) {
      setScore(s => s + 20);
      setFeedback('correct');
      setTimeout(() => {
        setFeedback(null);
        generateQuestion();
      }, 600);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  if (isGameOver) {
    return (
      <div className="max-w-2xl mx-auto glass-card p-12 rounded-[3rem] text-center">
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-4xl font-display text-white mb-4">Bravo !</h2>
        <p className="text-slate-400 text-xl mb-8">Score Final : <span className="text-primary font-bold">{score}</span></p>
        <button onClick={onBack} className="bg-primary text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all">
          Retour au Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full pt-16 md:pt-0">
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-slate-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-4">
          <div className="glass-card px-6 py-2 rounded-full border-white/5 flex items-center gap-3">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-bold text-white text-lg">{timeLeft}s</span>
          </div>
          <div className="glass-card px-6 py-2 rounded-full border-white/5 flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-white text-lg">{score}</span>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[3rem] p-12 text-center border-white/5 relative overflow-hidden mb-8">
        <h3 className="text-primary uppercase tracking-widest text-sm font-bold mb-4">
          {type === 'duration' ? 'Calcul de Durée' : 'Conversions'}
        </h3>
        <div className="text-4xl md:text-6xl font-display text-white tracking-tighter mb-12">
          {question?.q}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {question?.options.map((opt, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(opt)}
              className={`p-6 rounded-2xl border text-xl font-bold transition-all ${
                feedback === 'correct' && opt === question.a ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' :
                feedback === 'wrong' && opt !== question.a ? 'border-white/5 bg-white/5 text-slate-400' :
                'border-white/10 bg-white/5 text-white hover:border-primary'
              }`}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
      
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex justify-center mt-4"
          >
            {feedback === 'correct' ? <CheckCircle2 className="w-16 h-16 text-emerald-500" /> : <XCircle className="w-16 h-16 text-rose-500" />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
