import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle, Calculator, Info } from 'lucide-react';

export const MathChecker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<{ isCorrect: boolean, message: string } | null>(null);

  const check = () => {
    if (!expression.includes('=')) {
      setResult({ isCorrect: false, message: "L'expression doit contenir un '=' (ex: 2 + 2 = 4)" });
      return;
    }

    try {
      const [left, right] = expression.split('=').map(part => part.trim());
      // basic sanitization
      const cleanLeft = left.replace(/[^-()\d/*+.]/g, '');
      const cleanRight = right.replace(/[^-()\d/*+.]/g, '');
      
      // eslint-disable-next-line no-eval
      const leftVal = eval(cleanLeft);
      // eslint-disable-next-line no-eval
      const rightVal = eval(cleanRight);

      if (Math.abs(leftVal - rightVal) < 0.000001) {
        setResult({ isCorrect: true, message: "Correct ! L'égalité est vérifiée." });
        import('../history').then(m => m.addHistoryEntry({ question: left, userAnswer: right, correctAnswer: leftVal, isCorrect: true, gameMode: 'Vérificateur' }));
      } else {
        setResult({ isCorrect: false, message: `Incorrect. ${leftVal} n'est pas égal à ${rightVal}.` });
        import('../history').then(m => m.addHistoryEntry({ question: left, userAnswer: right, correctAnswer: leftVal, isCorrect: false, gameMode: 'Vérificateur' }));
      }
    } catch (e) {
      setResult({ isCorrect: false, message: "Expression invalide. Vérifiez les nombres et les signes." });
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 glass rounded-2xl hover:bg-white/10 transition-all text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-display text-white">Vérificateur</h2>
      </div>

      <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-8">
        <div className="flex items-center gap-4 text-primary">
          <Calculator className="w-8 h-8" />
          <h3 className="text-xl font-bold">Vérifiez vos calculs</h3>
        </div>

        <div className="space-y-4">
          <label className="text-slate-400 text-sm font-medium">Entrez votre égalité :</label>
          <input 
            type="text" 
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="Ex: (12 + 5) * 2 = 34"
            className="w-full bg-slate-900/40 border border-white/10 rounded-2xl p-6 text-2xl text-white outline-none focus:border-primary/50 transition-all"
          />
        </div>

        <button 
          onClick={check}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Vérifier
        </button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-6 rounded-2xl flex items-start gap-4 ${result.isCorrect ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}
            >
              {result.isCorrect ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" /> : <XCircle className="w-6 h-6 flex-shrink-0" />}
              <p className="font-medium">{result.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/5 p-4 rounded-xl flex items-start gap-3 border border-white/5">
          <Info className="w-5 h-5 text-slate-500 mt-0.5" />
          <p className="text-slate-500 text-xs italic">
            Utilisez les symboles standards : + (plus), - (moins), * (fois), / (divisé). Les parenthèses sont supportées.
          </p>
        </div>
      </div>
    </div>
  );
};
