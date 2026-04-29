import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, X, Divide, Brain, Sparkles, Star, Gamepad2, Calculator, Zap, Grid3X3, Loader2, Hash, Percent, Binary, Sigma, GraduationCap, ArrowRight, Play, BookOpen, Trophy as TrophyIcon, BrainCircuit, Shield, Layout, Timer } from 'lucide-react';
import { MathGame } from './components/MathGame';
import { SpeedGame } from './components/SpeedGame';
import { GridGame } from './components/GridGame';
import { MemoryGame } from './components/MemoryGame';
import { PatternGame } from './components/PatternGame';
import { AdminPanel } from './components/AdminPanel';
import { Difficulty, Operation, Grade } from './types';

type GameMode = 'classic' | 'speed' | 'grid' | 'memory' | 'pattern';

const FloatingShape = ({ delay, color, size, top, left }: { delay: number, color: string, size: string, top: string, left: string }) => (
  <motion.div
    animate={{
      y: [0, -40, 0],
      x: [0, 20, 0],
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 10 + Math.random() * 10,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
    className={`absolute ${color} ${size} rounded-full blur-[80px] opacity-30 -z-10`}
    style={{ top, left }}
  />
);

export default function App() {
  const [gameState, setGameState] = useState<'home' | 'playing'>('home');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grade, setGrade] = useState<Grade>('6eme');
  const [operation, setOperation] = useState<Operation>('addition');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [mathTip, setMathTip] = useState<string>('Les maths sont partout, même dans la musique ! 🎵');

  useEffect(() => {
    const tips = [
      "Le chiffre 0 n'existait pas dans l'Antiquité romaine.",
      "Un cercle a une infinité d'axes de symétrie.",
      "Le mot 'Algèbre' vient de l'arabe 'al-jabr'.",
      "La somme des angles d'un triangle est toujours 180°.",
      "Le nombre Pi est infini et ne se répète jamais."
    ];
    setMathTip(tips[Math.floor(Math.random() * tips.length)]);
  }, [gameState, grade]);

  const startGame = (op: Operation) => {
    setOperation(op);
    setGameState('playing');
  };

  const handleExternalRedirect = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href = "https://www.tablesdemultiplication.fr/canard-de-multiplication.html";
    }, 5000);
  };

  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [authMessage, setAuthMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showWelcomeNotif, setShowWelcomeNotif] = useState(false);
  const [showCreatorBanner, setShowCreatorBanner] = useState(false);
  const [showPoweredBy, setShowPoweredBy] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUpdateModal, setShowUpdateModal] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcomeNotif(true), 3000);
    const hideTimer = setTimeout(() => setShowWelcomeNotif(false), 7000);
    const bannerTimer = setTimeout(() => setShowCreatorBanner(true), 9000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
      clearTimeout(bannerTimer);
    };
  }, []);

  const handleAdminAuth = () => {
    setIsAuthenticating(true);
    
    setTimeout(() => {
      setIsAuthenticating(false);
      if (adminCode === 'CIES-BROCARD') {
        setAuthMessage({ text: 'Mot de passe correct', type: 'success' });
        setTimeout(() => {
          setShowAdminAuth(false);
          setShowAdmin(true);
          setAdminCode('');
          setAuthMessage(null);
        }, 1000);
      } else {
        setAuthMessage({ text: 'Mot de passe incorrect', type: 'error' });
        setTimeout(() => setAuthMessage(null), 3000);
      }
    }, 1000);
  };

  const allModes = [
    { id: 'addition', name: 'Addition', icon: Plus, color: 'bg-blue-500', shadow: 'shadow-blue-500/50', grades: ['6eme', '5eme', '4eme'] },
    { id: 'subtraction', name: 'Soustraction', icon: Minus, color: 'bg-rose-500', shadow: 'shadow-rose-500/50', grades: ['6eme', '5eme', '4eme'] },
    { id: 'multiplication', name: 'Multiplication', icon: X, color: 'bg-amber-500', shadow: 'shadow-amber-500/50', grades: ['6eme', '5eme', '4eme'] },
    { id: 'division', name: 'Division', icon: Divide, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50', grades: ['6eme', '5eme', '4eme'] },
    { id: 'decimals', name: 'Décimaux', icon: Hash, color: 'bg-cyan-500', shadow: 'shadow-cyan-500/50', grades: ['6eme', '5eme', '4eme'] },
    { id: 'fractions', name: 'Fractions', icon: Binary, color: 'bg-orange-500', shadow: 'shadow-orange-500/50', grades: ['6eme', '5eme', '4eme'] },
    { id: 'relatives', name: 'Relatifs', icon: Sigma, color: 'bg-purple-500', shadow: 'shadow-purple-500/50', grades: ['5eme', '4eme'] },
    { id: 'powers', name: 'Puissances', icon: Zap, color: 'bg-yellow-600', shadow: 'shadow-yellow-500/50', grades: ['4eme'] },
    { id: 'equations', name: 'Équations', icon: Calculator, color: 'bg-slate-700', shadow: 'shadow-slate-500/50', grades: ['4eme'] },
    { id: 'percentages', name: 'Pourcentages', icon: Percent, color: 'bg-pink-500', shadow: 'shadow-pink-500/50', grades: ['6eme', '5eme', '4eme'] },
    { id: 'proportionality', name: 'Proportionnalité', icon: Grid3X3, color: 'bg-lime-500', shadow: 'shadow-lime-500/50', grades: ['6eme', '5eme', '4eme'] },
    { id: 'mixed', name: 'Mélange', icon: Brain, color: 'bg-indigo-500', shadow: 'shadow-indigo-500/50', grades: ['6eme', '5eme', '4eme'] },
  ];

  const modes = allModes.filter(m => m.grades.includes(grade));

  const gameStyles = [
    { id: 'classic', name: 'Classique', icon: <Calculator className="w-6 h-6" />, desc: 'Quiz traditionnel' },
    { id: 'speed', name: 'Vitesse', icon: <Zap className="w-6 h-6" />, desc: 'Vrai ou Faux rapide' },
    { id: 'grid', name: 'Grille', icon: <Grid3X3 className="w-6 h-6" />, desc: 'Tableau de résultats' },
    { id: 'memory', name: 'Mémoire', icon: <Brain className="w-6 h-6" />, desc: 'Calcul mental' },
    { id: 'pattern', name: 'Suites', icon: <Sigma className="w-6 h-6" />, desc: 'Séquences logiques' },
  ];

  const gradesList = [
    { id: '6eme', name: '6ème', desc: 'Bases, Décimaux, Fractions' },
    { id: '5eme', name: '5ème', desc: 'Relatifs, Priorités, Fractions' },
    { id: '4eme', name: '4ème', desc: 'Puissances, Équations, Relatifs' },
  ];

  const programDetails = {
    '6eme': [
      "Nombres entiers et décimaux : lecture, écriture, comparaison.",
      "Opérations de base : addition, soustraction, multiplication.",
      "Fractions : partage, égalité de fractions simples.",
      "Proportionnalité et pourcentages simples.",
      "Géométrie de base : droites, cercles, angles."
    ],
    '5eme': [
      "Nombres relatifs : addition et soustraction.",
      "Calcul littéral : initiation aux expressions.",
      "Priorités opératoires et distributivité.",
      "Fractions : addition et soustraction (même dénominateur).",
      "Statistiques et probabilités simples."
    ],
    '4eme': [
      "Puissances de 10 et notation scientifique.",
      "Nombres relatifs : multiplication et division.",
      "Équations du premier degré : résolution simple.",
      "Théorème de Pythagore et trigonométrie.",
      "Fractions : multiplication et division."
    ]
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/30">
      {/* Background Elements */}
      <FloatingShape delay={0} color="bg-primary" size="w-[500px] h-[500px]" top="-10%" left="-10%" />
      <FloatingShape delay={2} color="bg-secondary" size="w-[400px] h-[400px]" top="60%" left="70%" />
      <FloatingShape delay={4} color="bg-accent" size="w-[300px] h-[300px]" top="20%" left="80%" />
      <FloatingShape delay={6} color="bg-indigo-500" size="w-[400px] h-[400px]" top="80%" left="10%" />
      <FloatingShape delay={1} color="bg-purple-500" size="w-[200px] h-[200px]" top="40%" left="30%" />
      <FloatingShape delay={3} color="bg-emerald-500" size="w-[250px] h-[250px]" top="10%" left="50%" />

      {/* Neural Network Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-secondary/10 blur-[120px] rounded-full" 
        />
      </div>

      {/* Clock and Date Display */}
      <div className="fixed top-4 right-4 md:top-8 md:right-8 z-[50] flex flex-col items-end gap-1 pointer-events-none sm:pointer-events-auto">
        <div className="glass px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border-white/10 flex items-center gap-2 md:gap-3 shadow-lg scale-90 md:scale-100 origin-right">
          <Timer className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-white font-mono font-bold text-sm md:text-lg">
            {currentTime.toLocaleTimeString('fr-FR')}
          </span>
        </div>
        <div className="glass px-3 py-1 rounded-xl border-white/5 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
          {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Visual Arrows pointing to top-right */}
            <div className="fixed top-20 right-4 md:top-32 md:right-32 z-[1001] pointer-events-none flex flex-col items-end gap-6 md:gap-16">
              <motion.div 
                animate={{ 
                  x: [0, 6, -3, 0],
                  y: [0, -6, 3, 0],
                  opacity: [0.6, 1, 0.8, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <span className="text-primary font-bold uppercase tracking-widest text-[8px] md:text-xs">L'heure ici</span>
                <ArrowRight className="w-8 h-8 md:w-16 md:h-16 text-primary -rotate-[45deg]" />
              </motion.div>
              
              <motion.div 
                animate={{ 
                  x: [0, 6, -3, 0],
                  y: [0, -6, 3, 0],
                  opacity: [0.5, 0.9, 0.7, 0.9]
                }}
                transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
                className="flex items-center gap-2"
              >
                <span className="text-secondary font-bold uppercase tracking-widest text-[8px] md:text-xs">La date ici</span>
                <ArrowRight className="w-8 h-8 md:w-16 md:h-16 text-secondary -rotate-[45deg]" />
              </motion.div>
            </div>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] max-w-lg w-full relative border-primary/30 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
            >
              <div className="absolute -top-6 -right-6 bg-primary p-4 rounded-3xl shadow-xl rotate-12">
                <Sparkles className="text-white w-8 h-8" />
              </div>

              <h2 className="text-4xl md:text-5xl font-display text-white mb-2 tracking-tighter leading-none">
                UPDATE <span className="text-primary italic">9</span>
              </h2>
              <p className="text-primary font-bold uppercase tracking-widest text-xs mb-8">Changements :</p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-2 rounded-xl mt-1">
                    <Timer className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Heure en direct</h3>
                    <p className="text-slate-400 text-sm">Vous pouvez voir quelle heure il est en haut à droite.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 p-2 rounded-xl mt-1">
                    <BookOpen className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Date du jour</h3>
                    <p className="text-slate-400 text-sm">Vous pouvez voir la date du jour juste en dessous.</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 italic text-slate-400 text-xs flex items-center gap-3">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  Regardez les flèches animées pour localiser ces nouveaux modules !
                </div>
              </div>

              <button
                onClick={() => setShowUpdateModal(false)}
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 group"
              >
                Fermer l'Annonce <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWelcomeNotif && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[500] pointer-events-none"
          >
            <div className="glass px-6 md:px-8 py-3 md:py-4 rounded-full border-primary/30 flex items-center gap-3 md:gap-4 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <div className="bg-primary/20 p-1.5 md:p-2 rounded-full">
                <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
              </div>
              <span className="text-lg md:text-xl font-display text-white tracking-widest uppercase">Bienvenue</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-display mb-2 text-white/80 tracking-widest uppercase">Chargement</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.5em] animate-pulse">Initialisation</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-3 md:px-8 py-4 md:py-8 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {gameState === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 md:space-y-16 flex-1"
            >
              {/* Hero Section */}
              <section className="relative pt-4 md:pt-12 pb-8 md:pb-20 text-center lg:text-left grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full mb-6 md:mb-8 border-primary/30"
                  >
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary animate-pulse" />
                    <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">Système d'Apprentissage</span>
                  </motion.div>
                  <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-display mb-6 md:mb-8 tracking-tighter leading-[0.9] md:leading-[0.85] text-white">
                    Maths <br />
                    <span className="neon-text italic">Interactives</span>
                  </h1>
                  <p className="text-slate-400 text-base md:text-xl max-w-xl mb-8 md:mb-10 leading-relaxed mx-auto lg:mx-0">
                    Maîtrise les concepts complexes avec des défis personnalisés.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button 
                      onClick={() => startGame('mixed')}
                      className="bg-primary text-white px-6 md:px-10 py-3.5 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3 group"
                    >
                      <Zap className="w-5 h-5 fill-current group-hover:animate-pulse" /> Lancer l'Analyse
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, type: "spring" }}
                  className="relative hidden lg:block"
                >
                  <div className="relative z-10 glass p-4 rounded-[4rem] animate-scan">
                    <div className="bg-slate-900/80 rounded-[3.5rem] p-12 aspect-square flex items-center justify-center overflow-hidden border border-white/5">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0],
                          filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"]
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="text-[14rem] drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]"
                      >
                        🧠
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Math Insight Card */}
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -bottom-10 -right-10 glass-card p-6 rounded-3xl max-w-xs z-20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary/20 p-2 rounded-xl"><Layout className="text-primary w-5 h-5 animate-pulse" /></div>
                      <p className="text-xs text-primary font-bold uppercase tracking-widest">Aperçu du Programme</p>
                    </div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="text-sm text-slate-300 italic leading-relaxed"
                    >
                      "{mathTip}"
                    </motion.p>
                  </motion.div>
                </motion.div>
              </section>


              {/* Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                {/* 1. Style Selection */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-7 glass-card p-5 md:p-10 rounded-2xl md:rounded-[3.5rem]"
                >
                  <h3 className="text-lg md:text-2xl font-display mb-6 md:mb-10 flex items-center gap-3 md:gap-4 text-white">
                    <div className="bg-primary/20 p-2 md:p-3 rounded-xl md:rounded-2xl"><Layout className="w-5 h-5 md:w-7 md:h-7 text-primary animate-pulse" /></div>
                    Interface de Simulation
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
                    {gameStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setGameMode(style.id as GameMode)}
                        className={`
                          p-2.5 md:p-6 rounded-xl md:rounded-[2.5rem] border transition-all flex flex-col items-center gap-2 md:gap-5 text-center group relative overflow-hidden
                          ${gameMode === style.id 
                            ? 'border-primary bg-primary/10 text-primary shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                            : 'border-white/5 hover:border-white/20 text-slate-500'}
                        `}
                      >
                        <div className={`w-8 h-8 md:w-16 md:h-16 rounded-lg md:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${gameMode === style.id ? 'bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}>
                          {React.cloneElement(style.icon as React.ReactElement, { className: "w-4 h-4 md:w-8 md:h-8" })}
                        </div>
                        <div>
                          <p className="font-bold text-[9px] md:text-sm tracking-tight">{style.name}</p>
                          <p className="text-[6px] md:text-[10px] opacity-40 mt-0.5 md:mt-1 uppercase tracking-widest hidden sm:block">{style.desc}</p>
                        </div>
                        {gameMode === style.id && (
                          <motion.div layoutId="active-glow" className="absolute inset-0 bg-primary/5 -z-10" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* 2. Grade & Difficulty */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-5 glass-card p-5 md:p-10 rounded-2xl md:rounded-[3.5rem] space-y-6 md:space-y-10"
                >
                  <div>
                    <h3 className="text-base md:text-xl font-display mb-4 md:mb-8 flex items-center gap-3 md:gap-4 text-white">
                      <div className="bg-secondary/20 p-2 md:p-3 rounded-xl md:rounded-2xl"><GraduationCap className="w-4 h-4 md:w-6 md:h-6 text-secondary animate-pulse" /></div>
                      Sélection du Niveau
                    </h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      {gradesList.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setGrade(g.id as Grade)}
                          className={`
                            py-2.5 md:py-4 rounded-xl md:rounded-2xl border transition-all text-[10px] md:text-sm font-bold
                            ${grade === g.id 
                              ? 'border-secondary bg-secondary/20 text-secondary shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                              : 'border-white/5 hover:border-white/20 text-slate-500'}
                          `}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base md:text-xl font-display mb-4 md:mb-8 flex items-center gap-3 md:gap-4 text-white">
                      <div className="bg-accent/20 p-2 md:p-3 rounded-xl md:rounded-2xl"><Zap className="w-4 h-4 md:w-6 md:h-6 text-accent animate-bounce" /></div>
                      Intensité du Calcul
                    </h3>
                    <div className="flex gap-2 md:gap-4">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`
                            flex-1 py-2.5 md:py-4 rounded-xl md:rounded-2xl border transition-all text-[10px] md:text-sm font-bold
                            ${difficulty === d 
                              ? 'border-accent bg-accent/20 text-accent shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                              : 'border-white/5 hover:border-white/20 text-slate-500'}
                          `}
                        >
                          {d === 'easy' ? 'Bas' : d === 'medium' ? 'Moyen' : 'Max'}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Operations Grid */}
              <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-12 px-2 md:px-6 gap-2 md:gap-4">
                  <h3 className="text-xl md:text-3xl font-display flex items-center gap-3 md:gap-4 text-white">
                    <div className="bg-primary/20 p-2 md:p-3 rounded-xl md:rounded-2xl"><TrophyIcon className="w-5 h-5 md:w-7 md:h-7 text-primary animate-pulse" /></div>
                    Protocoles d'Entraînement
                  </h3>
                  <div className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Sélectionne un module</div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                  {/* External Game Button */}
                  <motion.button
                    whileHover={{ y: -10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExternalRedirect}
                    className="group relative bg-indigo-600 p-4 md:p-10 rounded-2xl md:rounded-[3.5rem] shadow-2xl shadow-indigo-500/20 border-none text-left overflow-hidden text-white col-span-2 sm:col-span-1"
                  >
                    <div className="w-10 h-10 md:w-20 md:h-20 bg-white/10 rounded-xl md:rounded-3xl flex items-center justify-center mb-3 md:mb-8 backdrop-blur-md group-hover:scale-110 transition-transform border border-white/20">
                      <span className="text-xl md:text-4xl">🦆</span>
                    </div>
                    <h3 className="text-base md:text-2xl font-display mb-1 md:mb-3">Duck Protocol</h3>
                    <p className="text-indigo-100/60 text-[9px] md:text-sm mb-3 md:mb-8 leading-relaxed">
                      Entraînement intensif aux tables de multiplication.
                    </p>
                    <div className="flex items-center gap-2 md:gap-3 font-bold text-[8px] md:text-xs uppercase tracking-widest">
                      Lancer <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                      <BrainCircuit className="w-24 h-24 md:w-40 md:h-40" />
                    </div>
                  </motion.button>

                  {modes.map((mode, i) => (
                    <motion.button
                      key={mode.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startGame(mode.id as Operation)}
                      className="group relative glass-card p-4 md:p-10 rounded-2xl md:rounded-[3.5rem] text-left overflow-hidden"
                    >
                      <div className={`w-8 h-8 md:w-16 md:h-16 ${mode.color} rounded-lg md:rounded-2xl flex items-center justify-center mb-3 md:mb-8 shadow-lg ${mode.shadow} group-hover:scale-110 transition-transform`}>
                        <mode.icon className="w-4 h-4 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="text-sm md:text-2xl font-display mb-1 md:mb-3 text-white flex items-center gap-2">
                        {mode.name}
                      </h3>
                      <p className="text-slate-500 text-[8px] md:text-xs leading-relaxed uppercase tracking-wider">
                        {mode.id === 'mixed' ? 'Analyse globale.' : `Optimisation.`}
                      </p>
                      <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-white">
                        <mode.icon className="w-16 h-16 md:w-32 md:h-32" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>

              <footer className="mt-20 md:mt-32 text-center border-t border-white/5 pt-12 md:pt-16 pb-12 md:pb-16">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg"><BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-primary" /></div>
                    <span className="font-display text-xl md:text-2xl text-white tracking-tight">Math<span className="text-primary">OS</span></span>
                  </div>
                  <div className="h-px w-12 bg-white/10 hidden md:block" />
                  <p className="text-slate-500 text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-bold">Droits d'auteurs : Diego HAMON BAYARD</p>
                </div>
                <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.4em] mb-8">© 2026 Neural Learning Systems</p>
                
                <button 
                  onClick={() => setShowAdminAuth(true)}
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-all hover:scale-110 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] group"
                >
                  <Shield className="w-3 h-3 group-hover:rotate-12 transition-transform" /> Accès Administrateur
                </button>

                <button 
                  onClick={() => setShowPoweredBy(!showPoweredBy)}
                  className="mt-12 flex items-center justify-center gap-2 mx-auto text-[10px] md:text-xs text-white/40 hover:text-primary transition-all uppercase tracking-[0.3em] font-bold group bg-white/5 px-4 py-2 rounded-full border border-white/5"
                >
                  <Sparkles className="w-3 h-3 group-hover:text-primary animate-pulse" />
                  {showPoweredBy ? "WEB APP" : "•"}
                </button>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {gameMode === 'classic' && (
                <MathGame difficulty={difficulty} grade={grade} operation={operation} onBack={() => setGameState('home')} />
              )}
              {gameMode === 'speed' && (
                <SpeedGame difficulty={difficulty} grade={grade} operation={operation} onBack={() => setGameState('home')} />
              )}
              {gameMode === 'grid' && (
                <GridGame difficulty={difficulty} grade={grade} operation={operation} onBack={() => setGameState('home')} />
              )}
              {gameMode === 'memory' && (
                <MemoryGame difficulty={difficulty} grade={grade} operation={operation} onBack={() => setGameState('home')} />
              )}
              {gameMode === 'pattern' && (
                <PatternGame difficulty={difficulty} grade={grade} onBack={() => setGameState('home')} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {showAdminAuth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 md:p-10 rounded-2xl md:rounded-[3rem] max-w-md w-full text-center"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {isAuthenticating ? (
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-primary animate-spin" />
                  ) : (
                    <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-display text-white mb-2">
                  {isAuthenticating ? 'Veuillez patienter' : 'Accès Restreint'}
                </h3>
                <p className="text-slate-400 text-[10px] md:text-sm mb-6 md:mb-8 uppercase tracking-widest">
                  {isAuthenticating ? 'Vérification des accès neuronaux...' : "Entrez le code d'autorisation"}
                </p>
                
                {!isAuthenticating && (
                  <input 
                    type="password"
                    value={adminCode}
                    onChange={e => setAdminCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdminAuth()}
                    autoFocus
                    className={`w-full bg-white/5 border rounded-xl md:rounded-2xl p-3 md:p-4 text-white text-center text-lg md:text-xl mb-4 focus:border-primary/50 outline-none transition-all ${
                      authMessage?.type === 'error' ? 'border-rose-500/50' : 
                      authMessage?.type === 'success' ? 'border-emerald-500/50' : 'border-white/10'
                    }`}
                    placeholder="••••••••"
                  />
                )}

                <AnimatePresence>
                  {authMessage && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-xs md:text-sm font-bold mb-6 ${
                        authMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {authMessage.text}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 md:gap-4">
                  <button 
                    onClick={() => setShowAdminAuth(false)}
                    disabled={isAuthenticating}
                    className="flex-1 py-3 md:py-4 glass rounded-xl md:rounded-2xl text-white font-bold hover:bg-white/5 transition-all text-sm md:text-base disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAdminAuth}
                    disabled={isAuthenticating || !adminCode}
                    className="flex-1 py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 text-sm md:text-base disabled:opacity-50"
                  >
                    {isAuthenticating ? 'Vérification...' : 'Valider'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCreatorBanner && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[400] w-full max-w-md px-4"
            >
              <div className="glass-card p-4 md:p-6 rounded-xl md:rounded-[2rem] border-primary/30 flex items-center justify-between shadow-2xl shadow-primary/20">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-primary/20 p-2 md:p-3 rounded-lg md:rounded-xl">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <p className="text-white text-xs md:text-base font-medium">Site créé par <span className="text-primary font-bold">Diego HAMON BAYARD</span></p>
                </div>
                <button 
                  onClick={() => setShowCreatorBanner(false)}
                  className="p-2 hover:bg-white/10 rounded-lg md:rounded-xl transition-colors text-slate-400"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

