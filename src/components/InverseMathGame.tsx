import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, Trophy, Zap, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { Difficulty, Operation, Grade } from '../types';
import { speak } from '../services/ttsService';

interface InverseMathGameProps {
  difficulty: Difficulty;
  grade: Grade;
  operation: Operation;
  onBack: () => void;
}

export const InverseMathGame: React.FC<InverseMathGameProps> = ({ difficulty, grade, operation, onBack }) => {
  const [question, setQuestion] = useState<{ text: string, display: string, answer: number }>({ text: '', display: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateQuestion = () => {
    let num1, num2, ans, op;
    const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100;
    
    // Default to addition if operation is mixed or something else
    op = operation === 'mixed' ? ['addition', 'subtraction', 'multiplication'][Math.floor(Math.random() * 3)] : operation;

    switch(op) {
      case 'subtraction':
        num2 = Math.floor(Math.random() * (range / 2)) + 1;
        ans = Math.floor(Math.random() * (range / 2)) + 1;
        num1 = num2 + ans;
        break;
      case 'multiplication':
        if (difficulty === 'easy') {
          num1 = Math.floor(Math.random() * 7) + 3; // de 3 à 9
          num2 = Math.floor(Math.random() * 7) + 3; // de 3 à 9
        } else if (difficulty === 'medium') {
          num1 = Math.floor(Math.random() * 10) + 3; // de 3 à 12
          num2 = Math.floor(Math.random() * 10) + 3; // de 3 à 12
        } else {
          num1 = Math.floor(Math.random() * 13) + 3; // de 3 à 15
          num2 = Math.floor(Math.random() * 13) + 3; // de 3 à 15
        }
        ans = num1 * num2;
        break;
      default: // addition
        num1 = Math.floor(Math.random() * (range / 2)) + 1;
        num2 = Math.floor(Math.random() * (range / 2)) + 1;
        ans = num1 + num2;
        break;
    }

    // Inversé: hide num1, num2 or the operator. 
    // Let's keep it simple: hide num2.
    // Display: "5 + ? = 12"
    const opSymbol = op === 'addition' ? '+' : op === 'subtraction' ? '-' : '×';
    const textForTTS = `${num1} ${op === 'addition' ? 'plus' : op === 'subtraction' ? 'moins' : 'fois'} combien égale ${ans}`;
    const display = `${num1} ${opSymbol} ? = ${ans}`;
    
    setQuestion({ text: textForTTS, display, answer: num2 });
    if (ttsEnabled) speak(textForTTS);
  };

  useEffect(() => {
    generateQuestion();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(userAnswer);
    if (val === question.answer) {
      setScore(score + 10);
      setFeedback('correct');
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        generateQuestion();
      }, 500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 500);
    }
  };

  if (isGameOver) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto glass-card p-12 rounded-[3rem] text-center"
      >
        <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
        <h2 className="text-4xl font-display text-white mb-4">Temps Épuisé !</h2>
        <p className="text-slate-400 text-xl mb-8">Score Final : <span className="text-primary font-bold">{score}</span></p>
        <button onClick={onBack} className="bg-primary text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all">
          Retour au Menu
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full pt-16 md:pt-0">
      <div className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-slate-400">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-3 rounded-2xl transition-all ${ttsEnabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-500'}`}
          >
            <Volume2 className="w-6 h-6" />
          </button>
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

      <div className="glass-card rounded-[3rem] p-12 text-center border-white/5 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.display}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="space-y-12"
          >
            <div className="text-6xl md:text-8xl font-display text-white tracking-tighter">
              {question.display}
            </div>

            <form onSubmit={handleSubmit} className="relative max-w-sm mx-auto">
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                autoFocus
                className={`w-full bg-slate-900/40 border-2 rounded-2xl md:rounded-[3rem] p-6 md:p-10 text-center text-5xl md:text-7xl text-white outline-none transition-all placeholder:opacity-20 ${
                  feedback === 'correct' ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' :
                  feedback === 'wrong' ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]' :
                  'border-white/10 focus:border-primary/50'
                }`}
                placeholder="?"
              />
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -right-16 top-1/2 -translate-y-1/2"
                  >
                    {feedback === 'correct' ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    ) : (
                      <XCircle className="w-12 h-12 text-rose-500" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
