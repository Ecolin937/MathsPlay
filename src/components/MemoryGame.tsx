import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Brain, Trophy, RefreshCw } from 'lucide-react';
import { Difficulty, Operation, Grade } from '../types';
import { generateQuestion } from '../utils';

interface MemoryGameProps {
  difficulty: Difficulty;
  grade: Grade;
  operation: Operation;
  onBack: () => void;
}

interface Card {
  id: number;
  content: string | number;
  matchId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ difficulty, grade, operation, onBack }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [difficulty, grade, operation]);

  const initializeGame = () => {
    const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
    const newCards: Card[] = [];
    
    for (let i = 0; i < pairCount; i++) {
      const q = generateQuestion(operation, difficulty, grade);
      // Pair: Question and Answer
      newCards.push({
        id: i * 2,
        content: q.text,
        matchId: i,
        isFlipped: false,
        isMatched: false
      });
      newCards.push({
        id: i * 2 + 1,
        content: q.answer,
        matchId: i,
        isFlipped: false,
        isMatched: false
      });
    }

    setCards(newCards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards.find(c => c.id === id)?.isFlipped || cards.find(c => c.id === id)?.isMatched) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard?.matchId === secondCard?.matchId) {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          ));
          setMatches(m => {
            const newMatches = m + 1;
            if (newMatches === pairCount) setIsWon(true);
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;

  return (
    <div className="min-h-screen p-2 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 md:mb-8 px-2">
        <button onClick={onBack} className="p-2 md:p-3 glass rounded-xl md:rounded-2xl hover:bg-white/10 transition-all text-white">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="flex gap-1.5 md:gap-4">
          <div className="glass px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-white font-bold text-[10px] md:text-base">
            Coups: {moves}
          </div>
          <div className="glass px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-white font-bold text-[10px] md:text-base">
            Paires: {matches}/{pairCount}
          </div>
        </div>
        <button onClick={initializeGame} className="p-2 md:p-3 glass rounded-xl md:rounded-2xl hover:bg-white/10 transition-all text-white">
          <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <div className={`grid gap-2 md:gap-4 w-full max-w-4xl px-2 ${
        difficulty === 'easy' ? 'grid-cols-2 sm:grid-cols-4' : 
        difficulty === 'medium' ? 'grid-cols-3 sm:grid-cols-4' : 
        'grid-cols-3 sm:grid-cols-4'
      }`}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            className="aspect-square cursor-pointer perspective-1000"
          >
            <div className={`relative w-full h-full transition-all duration-500 preserve-3d ${
              card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
            }`}>
              {/* Front */}
              <div className="absolute inset-0 glass rounded-xl md:rounded-3xl flex items-center justify-center backface-hidden border-2 border-white/10">
                <Brain className="w-6 h-6 md:w-12 md:h-12 text-primary/30" />
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-xl rounded-xl md:rounded-3xl flex items-center justify-center rotate-y-180 backface-hidden border-2 border-primary/50 p-1 md:p-4 text-center">
                <span className="text-white font-bold text-[10px] md:text-xl break-words leading-tight">{card.content}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
          >
            <div className="glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] text-center max-w-md w-full">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display text-white mb-2 md:mb-4">Bravo !</h2>
              <p className="text-slate-400 mb-6 md:mb-8 text-sm md:text-base">Tu as trouvé toutes les paires en {moves} coups.</p>
              <button
                onClick={initializeGame}
                className="w-full py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-bold hover:scale-105 transition-all text-sm md:text-base"
              >
                Rejouer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
