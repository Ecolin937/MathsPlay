import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Book, HelpCircle, ArrowLeft } from 'lucide-react';
import { DictEntry } from '../types';

const entries: DictEntry[] = [
  { term: "Triangle Équilatéral", definition: "Un triangle dont les trois côtés ont la même longueur et les trois angles mesurent 60°.", example: "Un triangle de côtés 5cm, 5cm et 5cm." },
  { term: "Nombre Premier", definition: "Un nombre naturel supérieur à 1 qui n'a que deux diviseurs : 1 et lui-même.", example: "2, 3, 5, 7, 11 sont des nombres premiers." },
  { term: "Hypoténuse", definition: "Le côté le plus long d'un triangle rectangle, opposé à l'angle droit.", example: "Dans un triangle rectangle ABC en A, [BC] est l'hypoténuse." },
  { term: "Bissectrice", definition: "Une demi-droite qui partage un angle en deux angles adjacents de même mesure.", example: "La bissectrice d'un angle de 80° crée deux angles de 40°." },
  { term: "Médiatrice", definition: "La droite qui passe par le milieu d'un segment et qui lui est perpendiculaire.", example: "La médiatrice d'un segment [AB] est l'ensemble des points à égale distance de A et B." }
];

export const MathDictionary: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [search, setSearch] = useState('');
  
  const filtered = entries.filter(e => 
    e.term.toLowerCase().includes(search.toLowerCase()) || 
    e.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 glass rounded-2xl hover:bg-white/10 transition-all text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl md:text-5xl font-display text-white tracking-tighter">Dictionnaire Mathématique</h2>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un terme (ex: Triangle)..."
          className="w-full bg-slate-900/40 border border-white/10 rounded-[2rem] p-6 pl-16 text-xl text-white outline-none focus:border-primary/50 transition-all"
        />
      </div>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((entry, idx) => (
            <motion.div 
              key={entry.term}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 md:p-8 rounded-[2rem] border-white/5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-primary/20 p-3 rounded-xl">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white">{entry.term}</h3>
              </div>
              <p className="text-slate-300 text-lg mb-4 leading-relaxed">{entry.definition}</p>
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <p className="text-slate-400 italic text-sm">Exemple : {entry.example}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
