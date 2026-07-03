import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Clock, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { getHistory, HistoryEntry, clearHistory } from '../history';

interface HistoryModalProps {
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    setShowConfirmClear(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card max-w-2xl w-full p-6 md:p-8 rounded-3xl border-emerald-500/30 relative my-auto max-h-[90vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-display text-white">Historique</h2>
          
          {history.length > 0 && (
            <div className="ml-auto relative">
              {!showConfirmClear ? (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 rounded-lg text-sm transition-colors border border-rose-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Effacer</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-slate-900 border border-rose-500/50 p-2 rounded-xl shadow-xl">
                  <span className="text-xs text-rose-400 font-bold px-2">Sûr ?</span>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-xs font-bold transition-colors"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-bold transition-colors"
                  >
                    Non
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucun historique disponible.</p>
              <p className="text-sm">Jouez à des jeux pour voir vos calculs ici !</p>
            </div>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {entry.gameMode || 'Jeu'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(entry.date).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="text-lg md:text-xl font-mono text-white flex flex-wrap items-center gap-2">
                    <span>{entry.question}</span>
                    <span className="text-slate-500">=</span>
                    <span className={entry.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                      {entry.userAnswer !== undefined && entry.userAnswer !== '' ? entry.userAnswer : '?'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  {!entry.isCorrect && (
                    <div className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/30">
                      Rép: {entry.correctAnswer}
                    </div>
                  )}
                  <div className={`p-2 rounded-lg ${entry.isCorrect ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                    {entry.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
