import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowLeft, CheckCircle2, XCircle, Volume2, HelpCircle, Delete } from 'lucide-react';
import { Difficulty, Operation, Question, GameStats, Grade } from '../types';
import { generateQuestion } from '../utils';
import { speak } from '../services/ttsService';

interface GameProps {
  difficulty: Difficulty;
  grade: Grade;
  operation: Operation;
  onBack: () => void;
}

export const KeyboardGame: React.FC<GameProps> = ({ difficulty, grade, operation, onBack }) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [userInput, setUserInput] = useState('');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    bestStreak: 0,
  });
  const [streak, setStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string | number>('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const TOTAL_QUESTIONS = 20;

  useEffect(() => {
    nextQuestion();
  }, []);

  // Maintain focus on standard input so typing feels incredibly fluid
  useEffect(() => {
    if (inputRef.current && !isGameOver && !feedback) {
      inputRef.current.focus();
    }
  }, [question, feedback, isGameOver]);

  const nextQuestion = () => {
    if (stats.totalQuestions >= TOTAL_QUESTIONS) {
      setIsGameOver(true);
      return;
    }
    const newQuestion = generateQuestion(difficulty, operation, grade);
    setQuestion(newQuestion);
    setUserInput('');
    setFeedback(null);
    if (ttsEnabled && newQuestion) {
      speak(newQuestion.text.toString());
    }
  };

  const checkAnswer = (): boolean => {
    if (!question) return false;
    
    const user = userInput.trim().replace(/\s+/g, '').replace(',', '.');
    const answerStr = String(question.answer).trim().replace(/\s+/g, '').replace(',', '.');

    if (user === answerStr) return true;

    // Smart parsing for fractions/decimals matching (e.g. accept '0.5' for '1/2' and vice versa)
    try {
      if (answerStr.includes('/')) {
        const parts = answerStr.split('/');
        const expectedVal = parseFloat(parts[0]) / parseFloat(parts[1]);
        if (user.includes('/')) {
          const uParts = user.split('/');
          const userVal = parseFloat(uParts[0]) / parseFloat(uParts[1]);
          if (Math.abs(expectedVal - userVal) < 1e-4) return true;
        } else {
          const userVal = parseFloat(user);
          if (Math.abs(expectedVal - userVal) < 1e-4) return true;
        }
      } else {
        const userVal = parseFloat(user);
        const expectedVal = parseFloat(answerStr);
        if (!isNaN(userVal) && !isNaN(expectedVal) && Math.abs(expectedVal - userVal) < 1e-4) {
          return true;
        }
      }
    } catch {
      // Fallback to strict string compare
      return false;
    }

    return false;
  };

  const handleKeyPress = (char: string) => {
    if (feedback || isGameOver) return;
    setUserInput(prev => prev + char);
  };

  const handleBackspace = () => {
    if (feedback || isGameOver) return;
    setUserInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (feedback || isGameOver) return;
    setUserInput('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGameOver || feedback || !userInput.trim() || !question) return;

    const isCorrect = checkAnswer();
    const newTotal = stats.totalQuestions + 1;
    setLastCorrectAnswer(question.answer);
    
    setStats((prev) => ({
      ...prev,
      totalQuestions: newTotal,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      score: isCorrect ? prev.score + (15 * (streak + 1)) : prev.score, // Keying entries is slightly more difficult, so reward +15 pts base!
      bestStreak: Math.max(prev.bestStreak, isCorrect ? streak + 1 : streak),
    }));

    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setFeedback('correct');
      setTimeout(nextQuestion, 700);
    } else {
      setStreak(0);
      setFeedback('wrong');
      setTimeout(nextQuestion, 2500); // Give them time to read the correct math answer
    }
  };

  if (isGameOver) {
    const finalGrade = Math.round((stats.correctAnswers / TOTAL_QUESTIONS) * 20);
    let message = "Continue tes efforts ! En saisie clavier, c'est encore plus formateur.";
    if (finalGrade >= 18) message = "Exceptionnel ! Tu es un véritable champion du calcul !";
    else if (finalGrade >= 14) message = "Félicitations ! Excellente maîtrise du calcul mental !";
    else if (finalGrade >= 10) message = "Très honorable ! Tu as franchi la moyenne haut la main.";

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"
      >
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-accent/50">
          <Trophy className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-2xl md:text-4xl font-display mb-2 text-white px-4 uppercase tracking-tighter">Session Clavier Terminée !</h2>
        <p className="text-slate-400 mb-8 text-sm md:text-lg px-6 max-w-xl">{message}</p>
        
        <div className="glass-card border-accent/30 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 mb-8 w-full max-w-[280px] md:max-w-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-primary" />
          <p className="text-[10px] text-accent uppercase font-bold tracking-[0.3em] mb-4">Note de Précision</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl md:text-8xl font-display text-white">{finalGrade}</span>
            <span className="text-xl md:text-2xl font-display text-slate-500">/ 20</span>
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
            <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Série Maximale</p>
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
      <div className="flex items-center justify-between mb-6 md:mb-10 pt-14 md:pt-0">
        <button onClick={onBack} className="p-2 md:p-3 hover:bg-white/10 rounded-xl md:rounded-2xl transition-colors text-slate-400">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${ttsEnabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-500'}`}
          >
            <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="text-right">
            <p className="text-[7px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Question</p>
            <p className="text-base md:text-2xl font-display text-white">{stats.totalQuestions + 1} <span className="text-slate-600 text-[8px] md:text-sm">/ {TOTAL_QUESTIONS}</span></p>
          </div>
          <div className="w-px h-4 md:h-8 bg-white/10" />
          <div className="text-left">
            <p className="text-[7px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Score</p>
            <p className="text-base md:text-2xl font-display text-accent">{stats.score}</p>
          </div>
        </div>
      </div>

      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          {streak >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] z-30 animate-pulse"
            >
              SÉRIE x{streak} ! 🔥
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-card rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-12 text-center relative overflow-hidden border-white/5 min-h-[140px] md:min-h-0 flex flex-col items-center justify-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-secondary opacity-65" />
          <AnimatePresence mode="wait">
            <motion.div
              key={question?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10 w-full"
            >
              <span className="text-[8px] md:text-xs font-bold text-accent uppercase tracking-[0.4em] mb-1 md:mb-4 block opacity-70">
                Mode Saisie Clavier ({operation === 'mixed' ? 'Mélange' : operation})
              </span>
              <h3 className={`font-display tracking-tighter text-white select-none ${
                question?.text && question.text.length > 20 
                  ? 'text-lg sm:text-2xl md:text-5xl' 
                  : 'text-2xl sm:text-4xl md:text-8xl'
              }`}>
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
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md z-20"
              >
                {feedback === 'correct' ? (
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 font-bold text-xl uppercase tracking-wider">Correct !</p>
                  </div>
                ) : (
                  <div className="text-center space-y-4 px-6">
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/30 mx-auto shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                      <XCircle className="w-8 h-8 text-rose-400" />
                    </div>
                    <div>
                      <p className="text-rose-400 font-bold text-lg uppercase tracking-wider mb-1">Désolé !</p>
                      <p className="text-slate-400 text-sm">La bonne réponse était :</p>
                      <p className="text-white text-3xl font-display font-black tracking-widest mt-1">
                        {lastCorrectAnswer}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input section & Keypad */}
      <div className="glass-card rounded-[2rem] border-white/5 p-4 md:p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-sm">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={!!feedback}
              placeholder="Écris ta réponse ici..."
              className="w-full bg-slate-900/60 border border-white/10 focus:border-accent/50 outline-none text-center text-3xl md:text-4xl font-display p-4 rounded-2xl text-white placeholder:text-slate-600 transition-all font-bold group"
              placeholder-shown="opacity-40"
              autoFocus
            />
          </div>

          <p className="text-slate-500 text-[10px] md:text-xs flex items-center gap-1.5 opacity-80 select-none">
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            <span>Valide avec la touche <strong>Entrée ⌨️</strong> de ton clavier ou l'écran</span>
          </p>
          
          {/* Custom interactive mobile mini numpad */}
          <div className="w-full max-w-sm grid grid-cols-4 gap-2 mt-2">
            {['7', '8', '9', 'AC'].map((char) => (
              <button
                type="button"
                key={char}
                onClick={() => char === 'AC' ? handleClear() : handleKeyPress(char)}
                disabled={!!feedback}
                className={`py-3 rounded-xl font-bold font-display text-lg cursor-pointer transition-all active:scale-95 ${
                  char === 'AC' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {char}
              </button>
            ))}

            {['4', '5', '6', '/'].map((char) => (
              <button
                type="button"
                key={char}
                onClick={() => handleKeyPress(char)}
                disabled={!!feedback}
                className={`py-3 rounded-xl font-bold font-display text-lg cursor-pointer transition-all active:scale-95 ${
                  char === '/' 
                    ? 'bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20' 
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
                title={char === '/' ? 'Symbole fraction' : undefined}
              >
                {char}
              </button>
            ))}

            {['1', '2', '3', '-'].map((char) => (
              <button
                type="button"
                key={char}
                onClick={() => handleKeyPress(char)}
                disabled={!!feedback}
                className={`py-3 rounded-xl font-bold font-display text-lg cursor-pointer transition-all active:scale-95 ${
                  char === '-' 
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20' 
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
                title={char === '-' ? 'Signe négatif' : undefined}
              >
                {char}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleKeyPress(',')}
              disabled={!!feedback}
              className="py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-bold font-display text-lg cursor-pointer active:scale-95"
            >
              ,
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              disabled={!!feedback}
              className="py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl font-bold font-display text-lg cursor-pointer active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              disabled={!!feedback}
              className="py-3 bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 rounded-xl font-bold flex items-center justify-center cursor-pointer active:scale-95"
              title="Effacer"
            >
              <Delete className="w-5 h-5 text-slate-400" />
            </button>
            
            <button
              type="submit"
              disabled={!!feedback || !userInput.trim()}
              className="py-3 bg-accent border border-accent text-white font-bold rounded-xl font-display text-xs uppercase tracking-wider cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              Valider
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
