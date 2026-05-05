import React from 'react';
import { motion } from 'motion/react';
import { Target, CheckCircle2, TrendingDown, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { DailyQuest, WeakPoint } from '../types';

interface QuestsAndWeaknessProps {
  quests: DailyQuest[];
  weakPoints: WeakPoint[];
  onBack: () => void;
}

export const QuestsAndProgress: React.FC<QuestsAndWeaknessProps> = ({ quests, weakPoints, onBack }) => {
  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 glass rounded-2xl hover:bg-white/10 transition-all text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-display text-white">Tableau de Bord</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Daily Quests */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 text-primary">
            <Target className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Quêtes Quotidiennes</h3>
          </div>
          <div className="space-y-4">
            {quests.map((quest) => (
              <div key={quest.id} className="glass-card p-6 rounded-[2rem] border-white/5 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-bold">{quest.label}</span>
                  {quest.completed && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </div>
                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(quest.current / quest.target) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
                  <span>{quest.current} / {quest.target}</span>
                  <span className="text-accent">+{quest.reward} pts</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weak Points */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 text-rose-500">
            <TrendingDown className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Points Faibles</h3>
          </div>
          <div className="space-y-4">
            {weakPoints.length === 0 ? (
              <div className="glass-card p-8 rounded-[2rem] border-white/5 text-center text-slate-500 italic">
                Aucun point faible détecté. Continue comme ça ! 🚀
              </div>
            ) : (
              weakPoints.map((wp) => (
                <div key={wp.id} className="glass-card p-6 rounded-[2rem] border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-rose-500/20 p-3 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{wp.label}</h4>
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Dernier échec : {wp.lastAttempt}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-rose-500">
                    <span className="text-2xl font-bold">{wp.errors}</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Erreurs</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
