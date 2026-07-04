import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, X, Divide, Brain, Sparkles, Star, Gamepad2, Calculator, Zap, Grid3X3, Loader2, Hash, Percent, Binary, Sigma, GraduationCap, ArrowRight, Play, BookOpen, Trophy as TrophyIcon, BrainCircuit, Shield, Layout, Timer, CheckCircle2, Bell, BellOff, Smartphone, Monitor, AlertCircle, Download, Keyboard, Backpack, Crosshair, ClipboardList, ShoppingCart, Droplet, Castle, Calendar, Menu, Dumbbell, Wrench, Settings, ArrowUp, Clock, LogOut } from 'lucide-react';
import { HistoryModal } from './components/HistoryModal';
import { MathGame } from './components/MathGame';
import { SpeedGame } from './components/SpeedGame';
import { GridGame } from './components/GridGame';
import { MemoryGame } from './components/MemoryGame';
import { PatternGame } from './components/PatternGame';
import { InverseMathGame } from './components/InverseMathGame';
import { KeyboardGame } from './components/KeyboardGame';
import { SpecializedGames } from './components/SpecializedGames';
import { MathDictionary } from './components/MathDictionary';
import { MathChecker } from './components/MathChecker';
import { QuestsAndProgress } from './components/QuestsAndProgress';
import { AdminPanel } from './components/AdminPanel';
import { Difficulty, Operation, Grade, DailyQuest, WeakPoint } from './types';
import { requestNotificationPermission, scheduleDailyNotification } from './services/notificationService';

type GameMode = 'classic' | 'speed' | 'grid' | 'memory' | 'pattern' | 'inverse' | 'duration' | 'conversion' | 'dictionary' | 'checker' | 'quests' | 'keyboard';

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
    <div className="relative">
      <div className="bg-primary p-2 md:p-3 rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)] rotate-3 group-hover:rotate-6 transition-transform">
        <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-white" />
      </div>
      <div className="absolute -top-1 -right-1 bg-secondary w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-background animate-pulse" />
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-xl md:text-3xl font-display text-white tracking-tighter">MATHS</span>
      <span className="text-sm md:text-lg font-display text-primary italic tracking-widest uppercase">PLAY</span>
    </div>
  </div>
);

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
    className={`absolute ${color} ${size} rounded-full blur-[40px] md:blur-[80px] opacity-20 md:opacity-30 -z-10`}
    style={{ top, left }}
  />
);

const BOTTOM_BAR_ITEMS = [
  { id: 'entrainements', icon: Dumbbell, label: 'Entraînements', badge: 0, color: 'text-indigo-400', bg: 'bg-indigo-400', action: 'entrainements' },
  { id: 'admin', icon: Shield, label: 'Admin', badge: 0, color: 'text-red-500', bg: 'bg-red-500', action: 'admin' },
  { id: 'outils', icon: Wrench, label: 'Outils', badge: 0, color: 'text-amber-500', bg: 'bg-amber-500', action: 'outils' },
  { id: 'historique', icon: Clock, label: 'Historique', badge: 0, color: 'text-emerald-400', bg: 'bg-emerald-400', action: 'historique' },
  { id: 'parametres', icon: Settings, label: 'Paramètres', badge: 0, color: 'text-slate-400', bg: 'bg-slate-400', action: 'parametres' },
  { id: 'quitter', icon: LogOut, label: 'Quitter', badge: 0, color: 'text-rose-500', bg: 'bg-rose-500', action: 'quitter' },
];

export default function App() {
  const [gameState, setGameState] = useState<'home' | 'playing'>('home');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grade, setGrade] = useState<Grade>('6eme');
  const [operation, setOperation] = useState<Operation>('addition');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [mathTip, setMathTip] = useState<string>('Les maths sont partout, même dans la musique ! 🎵');

  const [quests, setQuests] = useState<DailyQuest[]>([
    { id: '1', label: 'Score Total > 500', target: 500, current: 150, completed: false, reward: 50 },
    { id: '2', label: '3 Parties Classiques', target: 3, current: 1, completed: false, reward: 30 },
    { id: '3', label: 'Série de 10 Corrects', target: 10, current: 4, completed: false, reward: 40 },
  ]);

  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([
    { id: '1', label: 'Division par 7', errors: 12, lastAttempt: 'Hier' },
    { id: '2', label: 'Puissances de 2', errors: 8, lastAttempt: 'Ce matin' },
  ]);

  useEffect(() => {
    requestNotificationPermission().then(granted => {
      if (granted) scheduleDailyNotification();
    });
  }, []);

  const [hasNotifyPermission, setHasNotifyPermission] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setHasNotifyPermission(Notification.permission === 'granted');
    }
  }, []);

  const handleNotifyRequest = async () => {
    const granted = await requestNotificationPermission();
    setHasNotifyPermission(granted);
    if (granted) scheduleDailyNotification();
  };

  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [authMessage, setAuthMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showWelcomeNotif, setShowWelcomeNotif] = useState(false);
  const [showPoweredBy, setShowPoweredBy] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTime, setShowTime] = useState(() => localStorage.getItem('showTime') !== 'false');
  const [showDate, setShowDate] = useState(() => localStorage.getItem('showDate') !== 'false');
  const [showInstallBtn, setShowInstallBtn] = useState(() => localStorage.getItem('showInstallBtn') !== 'false');
  const [showUpdateBtn, setShowUpdateBtn] = useState(() => localStorage.getItem('showUpdateBtn') !== 'false');
  const [widgetPosition, setWidgetPosition] = useState(() => localStorage.getItem('widgetPosition') || 'top-right');
  const [showSplash, setShowSplash] = useState(true);
  const [splashPhase, setSplashPhase] = useState<'studio' | 'impact'>('studio');
  const [showExitSplash, setShowExitSplash] = useState(false);
  const [exitSplashPhase, setExitSplashPhase] = useState<'studio' | 'impact'>('studio');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('theme') || 'theme-cyber');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    document.documentElement.className = currentTheme;
    localStorage.setItem('theme', currentTheme);
    localStorage.setItem('showTime', showTime.toString());
    localStorage.setItem('showDate', showDate.toString());
    localStorage.setItem('showInstallBtn', showInstallBtn.toString());
    localStorage.setItem('showUpdateBtn', showUpdateBtn.toString());
    localStorage.setItem('widgetPosition', widgetPosition);
  }, [currentTheme, showTime, showDate, showInstallBtn, showUpdateBtn, widgetPosition]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBottomAction = (action: string) => {
    setIsMobileMenuOpen(false);
    if (action === 'entrainements') {
      setShowTrainingModal(true);
      document.getElementById('protocoles')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'admin') {
      setShowAdminAuth(true);
    } else if (action === 'outils') {
      document.getElementById('outils-progression')?.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'historique') {
      setShowHistoryModal(true);
    } else if (action === 'parametres') {
      setShowSettingsModal(true);
    } else if (action === 'quitter') {
      setShowExitSplash(true);
      setExitSplashPhase('studio');
      setTimeout(() => {
        setExitSplashPhase('impact');
      }, 5000);
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 8000);
    }
  };

  useEffect(() => {
    const phaseTimer = setTimeout(() => {
      setSplashPhase('impact');
    }, 5000);

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 8000);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(splashTimer);
    };
  }, []);

  const [installStep, setInstallStep] = useState<'none' | 'device' | 'os' | 'loading' | 'redirection' | 'error'>('none');
  const [installErrorMsg, setInstallErrorMsg] = useState('');
  const [installProgress, setInstallProgress] = useState(0);

  useEffect(() => {
    if (installStep === 'loading') {
      const startTime = Date.now();
      const duration = 6000;
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          setInstallProgress(100);
          clearInterval(interval);
          setInstallStep('redirection');
        } else {
          setInstallProgress(Math.floor((elapsed / duration) * 100));
        }
      }, 50);
      
      return () => clearInterval(interval);
    } else if (installStep === 'redirection') {
      const timer = setTimeout(() => {
        window.location.href = "https://sites.google.com/view/mathsplay-install-app/accueil";
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [installStep]);

  const handleInstallClick = () => {
    setInstallStep('device');
  };

  const handleDeviceSelect = (device: 'pc' | 'mobile') => {
    if (device === 'pc') {
      setInstallErrorMsg("MathsPlay n'est pas encore disponible sur pc");
      setInstallStep('error');
    } else {
      setInstallStep('os');
    }
  };

  const handleOSSelect = (os: 'android' | 'ios') => {
    if (os === 'ios') {
      setInstallErrorMsg("MathsPlay n'est pas encore disponible sur ios");
      setInstallStep('error');
    } else {
      setInstallStep('loading');
      setInstallProgress(0);
    }
  };

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

  const triggerGameStart = () => {
    setSplashPhase('studio');
    setShowSplash(true);
    setTimeout(() => setSplashPhase('impact'), 5000);
    setTimeout(() => {
      setShowSplash(false);
      setGameState('playing');
    }, 8000);
  };

  const startGame = (op: Operation) => {
    setOperation(op);
    triggerGameStart();
  };

  const handleExternalRedirect = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href = "https://www.tablesdemultiplication.fr/canard-de-multiplication.html";
    }, 5000);
  };

  // Background components optimized for mobile
  const AnimatedBackground = () => (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-[#020617]">
      {/* Essential glows only */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full" />
      
      {/* Desktop only floating shapes */}
      <div className="hidden lg:block">
        <FloatingShape delay={0} color="bg-primary" size="w-[500px] h-[500px]" top="-10%" left="-10%" />
        <FloatingShape delay={2} color="bg-secondary" size="w-[400px] h-[400px]" top="60%" left="70%" />
        <FloatingShape delay={4} color="bg-accent" size="w-[300px] h-[300px]" top="20%" left="80%" />
      </div>
    </div>
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcomeNotif(true), 3000);
    const hideTimer = setTimeout(() => setShowWelcomeNotif(false), 7000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
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
          triggerGameStart();
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
    { id: 'inverse', name: 'Inversé', icon: <Binary className="w-6 h-6" />, desc: 'Trouve l\'opérande' },
    { id: 'duration', name: 'Durées', icon: <Timer className="w-6 h-6" />, desc: 'Calcul de temps' },
    { id: 'conversion', name: 'Conversions', icon: <Hash className="w-6 h-6" />, desc: 'Unités de mesure' },
    { id: 'keyboard', name: 'Clavier', icon: <Keyboard className="w-6 h-6" />, desc: 'Écris la réponse' },
  ];

  const tools = [
    { id: 'dictionary', name: 'Dico', icon: <BookOpen className="w-6 h-6" />, desc: 'Termes maths' },
    { id: 'checker', name: 'Vérif', icon: <CheckCircle2 className="w-6 h-6" />, desc: 'Testeur d\'égalité' },
    { id: 'quests', name: 'Défis', icon: <TrophyIcon className="w-6 h-6" />, desc: 'Tes quêtes' },
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

  // Generate deterministic particles to avoid any SSR/hydration mismatches while keeping it beautiful
  const splashParticles = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16;
    const rad = (angle * Math.PI) / 180;
    const distance = 140 + (i % 3) * 35; // Deterministic distance
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance;
    const size = 3 + (i % 2) * 3; // Deterministic size
    return { tx, ty, size };
  });

  return (
    <div className="min-h-screen-dynamic bg-background overflow-x-hidden selection:bg-primary/30 relative">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none"
          >
            <AnimatePresence mode="wait">
              {splashPhase === 'studio' ? (
                <motion.div
                  key="phase1"
                  id="phase1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative flex flex-col items-center justify-center h-full w-full bg-black overflow-hidden"
                >
                  <div 
                    className="relative flex items-center justify-center gap-1 md:gap-4 h-full w-full bg-[#0a0c10]"
                    style={{ perspective: '1200px' }}
                  >
                    {/* Modern gradient background glow behind the letters */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: [0, 0, 0.95, 0.8, 0],
                        scale: [0.5, 0.5, 1.5, 1.8, 2.2]
                      }}
                      transition={{
                        duration: 5.0,
                        times: [0, 0.1, 0.5, 0.9, 1.0],
                        ease: "easeOut"
                      }}
                      className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#6366f1]/40 via-[#a855f7]/30 to-[#ec4899]/40 rounded-full blur-[120px] pointer-events-none mix-blend-screen m-auto z-0"
                    />

                    <motion.div
                      initial={{ x: -280, opacity: 0, rotateY: -75, scale: 0.7 }}
                      animate={{
                        x: [-280, 0, 0, -120],
                        rotateY: [-75, 0, 0, -90],
                        scale: [0.7, 1, 1, 0.3],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 5.0,
                        times: [0, 0.1, 0.9, 1.0],
                        ease: "easeInOut"
                      }}
                      className="relative text-8xl md:text-[12rem] font-black italic tracking-tighter select-none font-sans z-10 flex items-center justify-center"
                    >
                      {/* Background (dark letter) */}
                      <span 
                        className="text-[#151722]"
                        style={{
                          textShadow: "0 1px 0 #111, 0 2px 0 #111, 0 3px 0 #111, 0 4px 0 #0c0c0c"
                        }}
                      >
                        M
                      </span>
                      {/* Foreground (filled with white from bottom to top) */}
                      <motion.span
                        className="absolute inset-0 text-white flex items-center justify-center"
                        animate={{
                          clipPath: [
                            "inset(100% -20% -20% -20%)",
                            "inset(100% -20% -20% -20%)",
                            "inset(35% -20% -20% -20%)",
                            "inset(35% -20% -20% -20%)",
                            "inset(-20% -20% -20% -20%)",
                            "inset(-20% -20% -20% -20%)"
                          ]
                        }}
                        transition={{
                          duration: 5.0,
                          times: [0, 0.1, 0.5, 0.7, 0.9, 1.0],
                          ease: "easeInOut"
                        }}
                        style={{
                          textShadow: "0 1px 0 #fff, 0 2px 0 #eaeaea, 0 3px 0 #d5d5d5, 0 4px 0 #c0c0c0, 0 0 40px rgba(255,255,255,0.8)"
                        }}
                      >
                        M
                      </motion.span>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: 280, opacity: 0, rotateY: 75, scale: 0.7 }}
                      animate={{
                        x: [280, 0, 0, 120],
                        rotateY: [75, 0, 0, 90],
                        scale: [0.7, 1, 1, 0.3],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 5.0,
                        times: [0, 0.1, 0.9, 1.0],
                        ease: "easeInOut"
                      }}
                      className="relative text-8xl md:text-[12rem] font-black italic tracking-tighter select-none font-sans z-10 flex items-center justify-center"
                    >
                      {/* Background (dark letter) */}
                      <span 
                        className="text-[#151722]"
                        style={{
                          textShadow: "0 1px 0 #111, 0 2px 0 #111, 0 3px 0 #111, 0 4px 0 #0c0c0c"
                        }}
                      >
                        P
                      </span>
                      {/* Foreground (filled with white from bottom to top) */}
                      <motion.span
                        className="absolute inset-0 text-white flex items-center justify-center"
                        animate={{
                          clipPath: [
                            "inset(100% -20% -20% -20%)",
                            "inset(100% -20% -20% -20%)",
                            "inset(35% -20% -20% -20%)",
                            "inset(35% -20% -20% -20%)",
                            "inset(-20% -20% -20% -20%)",
                            "inset(-20% -20% -20% -20%)"
                          ]
                        }}
                        transition={{
                          duration: 5.0,
                          times: [0, 0.1, 0.5, 0.7, 0.9, 1.0],
                          ease: "easeInOut"
                        }}
                        style={{
                          textShadow: "0 1px 0 #fff, 0 2px 0 #eaeaea, 0 3px 0 #d5d5d5, 0 4px 0 #c0c0c0, 0 0 40px rgba(255,255,255,0.8)"
                        }}
                      >
                        P
                      </motion.span>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="phase2"
                  id="phase2"
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  {/* Dynamic Moving Background Smoke / Fog */}
                  <motion.div
                    animate={{
                      x: [-30, 30, -30],
                      y: [-25, 25, -25],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -top-10 -left-10 w-[60%] h-[60%] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none mix-blend-screen"
                  />
                  <motion.div
                    animate={{
                      x: [30, -30, 30],
                      y: [25, -25, 25],
                    }}
                    transition={{
                      duration: 14,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -bottom-10 -right-10 w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none mix-blend-screen"
                  />
                  <motion.div
                    animate={{
                      x: [-20, 20, -20],
                      y: [20, -20, 20],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-1/4 left-1/3 w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[110px] pointer-events-none mix-blend-screen"
                  />
                  
                  {/* Subtle techno digital grid overlay */}
                  <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat" 
                    style={{
                      backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                      backgroundSize: '24px 24px'
                    }}
                  />

                  {/* Screen Shake Wrapper on slam impact */}
                  <motion.div
                    animate={{ 
                      x: [0, 0, -15, 15, -12, 12, -8, 8, -4, 4, 0],
                      y: [0, 0, 10, -10, 8, -8, 5, -5, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 0.5, 
                      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                      ease: "easeInOut" 
                    }}
                    className="relative flex flex-col items-center justify-center"
                  >
                    {/* Radial shockwave flash on slam impact */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 2.6, 1], 
                        opacity: [0, 1, 0.15] 
                      }}
                      transition={{ 
                        duration: 0.6, 
                        ease: "easeOut" 
                      }}
                      className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-rose-500/30 to-blue-500/30 blur-2xl pointer-events-none"
                    />

                    {/* Spark particles bursting out on impact */}
                    {splashParticles.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                        animate={{ 
                          x: p.tx, 
                          y: p.ty, 
                          scale: [0, 1.8, 0], 
                          opacity: [0, 1, 0.8, 0] 
                        }}
                        transition={{ 
                          duration: 0.9, 
                          ease: [0.1, 0.8, 0.2, 1] 
                        }}
                        className={`absolute rounded-full pointer-events-none ${
                          i % 3 === 0 
                            ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' 
                            : i % 3 === 1 
                              ? 'bg-blue-500 shadow-[0_0_12px_#3b82f6]' 
                              : 'bg-white shadow-[0_0_12px_#ffffff]'
                        }`}
                        style={{
                          width: `${p.size}px`,
                          height: `${p.size}px`,
                        }}
                      />
                    ))}

                    {/* Logo text container with high impact scale entry */}
                    <motion.div
                      initial={{ scale: 0.2, y: -150, rotateX: 30, opacity: 0, filter: "blur(10px)" }}
                      animate={{ 
                        scale: [0.2, 1.15, 0.95, 1], 
                        y: [-150, 15, -5, 0],
                        rotateX: [30, -10, 5, 0],
                        opacity: 1, 
                        filter: "blur(0px)" 
                      }}
                      transition={{ 
                        duration: 0.8, 
                        times: [0, 0.6, 0.8, 1],
                        ease: "easeOut" 
                      }}
                      className="relative overflow-hidden px-10 py-4 flex items-center justify-center"
                    >
                      {/* Title */}
                      <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase select-none flex">
                        <span className="bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                          Maths
                        </span>
                        <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.4)]">
                          Play
                        </span>
                      </h1>

                      {/* Sutil destello de luz que cruza de izquierda a derecha */}
                      <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: "200%", opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 1.3, delay: 0.3, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none"
                      />
                    </motion.div>

                    {/* Decorative sleek horizontal line below title */}
                    <motion.div 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "260px", opacity: 0.6 }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                      className="h-[2px] bg-gradient-to-r from-transparent via-white to-transparent relative mt-2 overflow-hidden"
                    >
                      {/* Glint sliding across the subline */}
                      <motion.div
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                        className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent"
                      />
                    </motion.div>

                    {/* Cinematic competitive subtitle with neon flicker */}
                    <motion.p
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ 
                        opacity: [0, 0.3, 0.1, 0.9, 0.4, 1],
                        y: 0,
                        letterSpacing: ["0.1em", "0.4em"]
                      }}
                      transition={{ 
                        duration: 0.9, 
                        delay: 0.4, 
                        ease: "easeOut" 
                      }}
                      className="text-xs md:text-sm font-black text-slate-300 uppercase mt-4 text-center tracking-[0.4em] font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
                    >
                      L'Arène du Calcul Mental
                    </motion.p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {showExitSplash && (
          <motion.div
            key="exitSplash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none"
          >
            <AnimatePresence mode="wait">
              {exitSplashPhase === 'studio' ? (
                <motion.div
                  key="phase1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative flex flex-col items-center justify-center h-full w-full bg-black overflow-hidden"
                >
                  <div 
                    className="relative flex items-center justify-center gap-1 md:gap-4 h-full w-full bg-[#0a0c10]"
                    style={{ perspective: '1200px' }}
                  >
                    {/* Modern gradient background glow behind the letters */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ 
                        opacity: [0, 0, 0.95, 0.8, 0],
                        scale: [0.5, 0.5, 1.5, 1.8, 2.2]
                      }}
                      transition={{
                        duration: 5.0,
                        times: [0, 0.1, 0.5, 0.9, 1.0],
                        ease: "easeOut"
                      }}
                      className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-[#6366f1]/40 via-[#a855f7]/30 to-[#ec4899]/40 rounded-full blur-[120px] pointer-events-none mix-blend-screen m-auto z-0"
                    />

                    <motion.div
                      initial={{ x: -280, opacity: 0, rotateY: -75, scale: 0.7 }}
                      animate={{
                        x: [-280, 0, 0, -120],
                        rotateY: [-75, 0, 0, -90],
                        scale: [0.7, 1, 1, 0.3],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 5.0,
                        times: [0, 0.1, 0.9, 1.0],
                        ease: "easeInOut"
                      }}
                      className="relative text-8xl md:text-[12rem] font-black italic tracking-tighter select-none font-sans z-10 flex items-center justify-center"
                    >
                      {/* Background (dark letter) */}
                      <span 
                        className="text-[#151722]"
                        style={{
                          textShadow: "0 1px 0 #111, 0 2px 0 #111, 0 3px 0 #111, 0 4px 0 #0c0c0c"
                        }}
                      >
                        M
                      </span>
                      {/* Foreground (empties white from top to bottom) */}
                      <motion.span
                        className="absolute inset-0 text-white flex items-center justify-center"
                        animate={{
                          clipPath: [
                            "inset(-20% -20% -20% -20%)",
                            "inset(-20% -20% -20% -20%)",
                            "inset(35% -20% -20% -20%)",
                            "inset(35% -20% -20% -20%)",
                            "inset(120% -20% -20% -20%)",
                            "inset(120% -20% -20% -20%)"
                          ]
                        }}
                        transition={{
                          duration: 5.0,
                          times: [0, 0.1, 0.5, 0.7, 0.9, 1.0],
                          ease: "easeInOut"
                        }}
                        style={{
                          textShadow: "0 1px 0 #fff, 0 2px 0 #eaeaea, 0 3px 0 #d5d5d5, 0 4px 0 #c0c0c0, 0 0 40px rgba(255,255,255,0.8)"
                        }}
                      >
                        M
                      </motion.span>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: 280, opacity: 0, rotateY: 75, scale: 0.7 }}
                      animate={{
                        x: [280, 0, 0, 120],
                        rotateY: [75, 0, 0, 90],
                        scale: [0.7, 1, 1, 0.3],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 5.0,
                        times: [0, 0.1, 0.9, 1.0],
                        ease: "easeInOut"
                      }}
                      className="relative text-8xl md:text-[12rem] font-black italic tracking-tighter select-none font-sans z-10 flex items-center justify-center"
                    >
                      {/* Background (dark letter) */}
                      <span 
                        className="text-[#151722]"
                        style={{
                          textShadow: "0 1px 0 #111, 0 2px 0 #111, 0 3px 0 #111, 0 4px 0 #0c0c0c"
                        }}
                      >
                        P
                      </span>
                      {/* Foreground (empties white from top to bottom) */}
                      <motion.span
                        className="absolute inset-0 text-white flex items-center justify-center"
                        animate={{
                          clipPath: [
                            "inset(-20% -20% -20% -20%)",
                            "inset(-20% -20% -20% -20%)",
                            "inset(35% -20% -20% -20%)",
                            "inset(35% -20% -20% -20%)",
                            "inset(120% -20% -20% -20%)",
                            "inset(120% -20% -20% -20%)"
                          ]
                        }}
                        transition={{
                          duration: 5.0,
                          times: [0, 0.1, 0.5, 0.7, 0.9, 1.0],
                          ease: "easeInOut"
                        }}
                        style={{
                          textShadow: "0 1px 0 #fff, 0 2px 0 #eaeaea, 0 3px 0 #d5d5d5, 0 4px 0 #c0c0c0, 0 0 40px rgba(255,255,255,0.8)"
                        }}
                      >
                        P
                      </motion.span>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="phase2"
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  {/* Smoke / Fog */}
                  <motion.div
                    animate={{ x: [-30, 30, -30], y: [-25, 25, -25] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -left-10 w-[60%] h-[60%] rounded-full bg-rose-600/10 blur-[120px] pointer-events-none mix-blend-screen"
                  />
                  <motion.div
                    animate={{ x: [30, -30, 30], y: [25, -25, 25] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-10 -right-10 w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none mix-blend-screen"
                  />
                  <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat" 
                    style={{ backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
                  />

                  <motion.div
                    animate={{ 
                      x: [0, 0, -15, 15, -12, 12, -8, 8, -4, 4, 0],
                      y: [0, 0, 10, -10, 8, -8, 5, -5, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 0.8,
                      ease: "easeOut",
                      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
                    }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    {/* Burst particles */}
                    {splashParticles.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                        animate={{ x: p.tx, y: p.ty, scale: [0, 1.8, 0], opacity: [0, 1, 0.8, 0] }}
                        transition={{ duration: 0.9, ease: [0.1, 0.8, 0.2, 1] }}
                        className={`absolute rounded-full pointer-events-none ${
                          i % 3 === 0 ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : i % 3 === 1 ? 'bg-blue-500 shadow-[0_0_12px_#3b82f6]' : 'bg-white shadow-[0_0_12px_#ffffff]'
                        }`}
                        style={{ width: `${p.size}px`, height: `${p.size}px` }}
                      />
                    ))}

                    <motion.div
                      initial={{ scale: 0.2, opacity: 0, filter: "blur(20px)" }}
                      animate={{ scale: [0.2, 1.12, 1], opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.4, times: [0, 0.7, 1], ease: "easeOut" }}
                      className="relative overflow-hidden px-10 py-4 flex flex-col items-center justify-center"
                    >
                      <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase select-none flex">
                        <span className="bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                          À 
                        </span>
                        <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.4)] ml-4">
                          Bientôt
                        </span>
                      </h1>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-xs md:text-sm font-black text-slate-300 uppercase mt-4 text-center tracking-[0.4em] font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
                      >
                        Reviens vite t'entraîner !
                      </motion.p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedBackground />

      {/* Clock and Date Display */}
      {gameState !== 'playing' && !showSettingsModal && (
      <div className={`fixed z-[50] flex flex-col gap-2 pointer-events-none sm:pointer-events-auto ${
        (showAdminAuth || showAdmin) ? 'bottom-8 right-4 md:bottom-8 md:right-8 items-end' :
        widgetPosition === 'top-right' ? 'top-4 right-4 md:top-8 md:right-8 items-end' :
        widgetPosition === 'top-left' ? 'top-4 left-4 md:top-8 md:left-8 items-start' :
        widgetPosition === 'bottom-right' ? 'bottom-24 right-4 md:bottom-28 md:right-8 items-end' :
        'bottom-24 left-4 md:bottom-28 md:left-8 items-start'
      }`}>
        <div className={`flex items-center gap-2 ${(!(showAdminAuth || showAdmin) && widgetPosition.includes('left')) ? 'flex-row-reverse' : ''}`}>
          {showUpdateBtn && !(showAdminAuth || showAdmin) && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpdateModal(true)}
              className={`glass px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-primary/30 text-primary bg-primary/10 transition-all pointer-events-auto flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-90 md:scale-100 ${(!(showAdminAuth || showAdmin) && widgetPosition.includes('left')) ? 'origin-left' : 'origin-right'}`}
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-tighter hidden sm:inline">Update</span>
            </motion.button>
          )}

          {showInstallBtn && !(showAdminAuth || showAdmin) && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: [0, -4, 0]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              onClick={handleInstallClick}
              className={`glass px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-accent/30 text-accent bg-accent/10 transition-all pointer-events-auto flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-90 md:scale-100 ${(!(showAdminAuth || showAdmin) && widgetPosition.includes('left')) ? 'origin-left' : 'origin-right'}`}
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-tighter hidden sm:inline">Installer l'app</span>
            </motion.button>
          )}

          {showTime && (
            <div className={`glass px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border-white/10 flex items-center gap-2 md:gap-3 shadow-lg scale-90 md:scale-100 ${(!(showAdminAuth || showAdmin) && widgetPosition.includes('left')) ? 'origin-left' : 'origin-right'}`}>
              <Timer className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-white font-mono font-bold text-sm md:text-lg">
                {currentTime.toLocaleTimeString('fr-FR')}
              </span>
            </div>
          )}
        </div>
        {showDate && (
          <div className={`glass px-3 py-1 rounded-xl border-white/5 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap`}>
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>
      )}

      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >


            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] max-w-lg w-full relative border-primary/30 shadow-[0_0_50px_rgba(99,102,241,0.2)]"
            >
              <div className="absolute -top-6 -right-6 bg-primary p-4 rounded-3xl shadow-xl rotate-12">
                <Sparkles className="text-white w-8 h-8" />
              </div>

              <h2 className="text-4xl md:text-5xl font-display text-white mb-2 tracking-tighter leading-none">
                UPDATE <span className="text-primary italic">12</span>
              </h2>
              <p className="text-primary font-bold uppercase tracking-widest text-xs mb-8">Nouveautés majeures :</p>
              
              <div className="space-y-6 mb-10 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                <div className="bg-primary/10 p-5 rounded-[2rem] border border-primary/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent animate-pulse" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-primary p-3 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                      <Layout className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl uppercase tracking-tighter">Nouvelle Barre de Navigation</h3>
                      <motion.p 
                        animate={{ 
                          color: ['#ffffff', '#ef4444', '#ffffff'],
                          textShadow: ['0 0 0px transparent', '0 0 10px rgba(239, 68, 68, 0.5)', '0 0 0px transparent']
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-sm font-black"
                      >
                        Une nouvelle barre super stylée est maintenant dispo en bas !
                      </motion.p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-2 rounded-xl mt-1">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Historique Amélioré</h3>
                    <p className="text-slate-400 text-sm">Ajout de l'historique de jeu avec la possibilité de tout effacer.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 p-2 rounded-xl mt-1">
                    <Settings className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Nouveaux Paramètres</h3>
                    <p className="text-slate-400 text-sm">Contrôlez l'affichage de l'heure, de la date et des boutons depuis la nouvelle page de paramètres.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 p-2 rounded-xl mt-1">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Animations fluides</h3>
                    <p className="text-slate-400 text-sm">L'animation d'introduction a été corrigée et optimisée.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 border-b border-white/5 pb-4">
                  <div className="bg-accent/20 p-2 rounded-xl mt-1">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Interface Intelligente</h3>
                    <p className="text-slate-400 text-sm">L'affichage s'adapte parfaitement lors de l'accès à l'admin ou aux paramètres pour une expérience claire.</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 italic text-slate-400 text-xs flex items-center gap-3">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  Mettez à jour vos paramètres pour en profiter pleinement !
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
        {showTermsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card max-w-lg w-full p-8 md:p-12 rounded-[2.5rem] border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowTermsModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-rose-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-rose-500" />
              </div>

              <h2 className="text-2xl font-display text-white mb-6 uppercase tracking-tighter">Conditions d'utilisation</h2>
              
              <div className="space-y-4 text-slate-400 text-sm leading-relaxed overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                <p>
                  je vous rappelle que ce site est 100% gratuit et ne garanti pas une fiabilité élevé même si il y a des mises à jour toutes les semaines, ceux site n'est pas protégé par les virus, mais on est quand même certifié par Google pour une sécurité minimale!
                </p>
              </div>

              <button 
                onClick={() => setShowTermsModal(false)}
                className="mt-8 w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all"
              >
                J'ai compris
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {installStep !== 'none' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card max-w-md w-full p-8 md:p-10 rounded-[2.5rem] border-primary/30 shadow-2xl relative"
            >
              <button 
                onClick={() => setInstallStep('none')}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>

              {installStep === 'device' && (
                <div className="text-center">
                  <h2 className="text-2xl font-display text-white mb-8 uppercase tracking-tighter">Où voulez-vous installer MathsPlay ?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleDeviceSelect('pc')}
                      className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105"
                    >
                      <Monitor className="w-10 h-10 text-primary" />
                      <span className="text-white font-bold">Ordinateur</span>
                    </button>
                    <button 
                      onClick={() => handleDeviceSelect('mobile')}
                      className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105"
                    >
                      <Smartphone className="w-10 h-10 text-accent" />
                      <span className="text-white font-bold">Smartphone / Tablette</span>
                    </button>
                  </div>
                </div>
              )}

              {installStep === 'os' && (
                <div className="text-center">
                  <h2 className="text-2xl font-display text-white mb-8 uppercase tracking-tighter">Choisissez votre système</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleOSSelect('android')}
                      className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 group"
                    >
                      <Smartphone className="w-10 h-10 text-emerald-500 group-hover:text-emerald-400" />
                      <span className="text-white font-bold">Android</span>
                    </button>
                    <button 
                      onClick={() => handleOSSelect('ios')}
                      className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex flex-col items-center gap-4 transition-all hover:scale-105 group"
                    >
                      <Smartphone className="w-10 h-10 text-slate-300 group-hover:text-white" />
                      <span className="text-white font-bold">iOS</span>
                    </button>
                  </div>
                </div>
              )}

              {installStep === 'loading' && (
                <div className="text-center pt-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
                  <h2 className="text-xl font-display text-white mb-4 uppercase tracking-tighter">Veuillez patienter...</h2>
                  <p className="text-slate-400 text-sm mb-6">Installation en cours ({installProgress}%)</p>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${installProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {installStep === 'redirection' && (
                <div className="text-center pt-4">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-accent" />
                  </div>
                  <h2 className="text-xl font-display text-white mb-4 uppercase tracking-tighter">Installation prête</h2>
                  <p className="text-slate-400 text-sm animate-pulse">Redirection...</p>
                </div>
              )}

              {installStep === 'error' && (
                <div className="text-center pt-4">
                  <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                  </div>
                  <h2 className="text-xl font-display text-rose-500 mb-4 uppercase tracking-tighter">Indisponible</h2>
                  <p className="text-slate-300 text-sm mb-8">{installErrorMsg}</p>
                  <button 
                    onClick={() => setInstallStep('none')}
                    className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10"
                  >
                    Retour
                  </button>
                </div>
              )}

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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 flex flex-col relative z-10 w-full min-h-screen-dynamic">
        {/* Navigation / Header Logo */}
        {gameState !== 'playing' && (
        <div className="fixed top-4 left-4 md:top-8 md:left-8 z-[50]">
          <Logo />
        </div>
        )}

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
                    <span className="neon-text italic">Play</span>
                  </h1>
                  <p className="text-slate-400 text-base md:text-xl max-w-xl mb-8 md:mb-10 leading-relaxed mx-auto lg:mx-0">
                    Maîtrise les concepts complexes avec des défis personnalisés.
                  </p>
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
                </motion.div>
              </section>


              {/* Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                {/* 1. Style Selection */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-12 glass-card p-5 md:p-10 rounded-2xl md:rounded-[3.5rem]"
                >
                  <h3 className="text-lg md:text-2xl font-display mb-6 md:mb-10 flex items-center gap-3 md:gap-4 text-white">
                    <div className="bg-primary/20 p-2 md:p-3 rounded-xl md:rounded-2xl"><Layout className="w-5 h-5 md:w-7 md:h-7 text-primary animate-pulse" /></div>
                    Interface de Simulation
                  </h3>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {gameStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setGameMode(style.id as GameMode);
                          if (style.id === 'duration' || style.id === 'conversion') {
                            triggerGameStart();
                          }
                        }}
                        className={`
                          min-h-[100px] md:min-h-[160px] p-3 md:p-6 rounded-2xl md:rounded-[2.5rem] border transition-all flex flex-col items-center justify-center gap-2 md:gap-5 text-center group relative overflow-hidden active:scale-95
                          ${gameMode === style.id 
                            ? 'border-primary bg-primary/10 text-primary shadow-[0_0_30px_rgba(99,102,241,0.2)]' 
                            : 'border-white/5 hover:border-white/20 text-slate-500'}
                        `}
                      >
                        <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${gameMode === style.id ? 'bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`}>
                          {React.cloneElement(style.icon as React.ReactElement, { className: "w-5 h-5 md:w-8 md:h-8" })}
                        </div>
                        <div>
                          <p className="font-bold text-[10px] md:text-sm tracking-tight">{style.name}</p>
                          <p className="text-[7px] md:text-[10px] opacity-40 mt-0.5 md:mt-1 uppercase tracking-widest hidden sm:block">{style.desc}</p>
                        </div>
                        {gameMode === style.id && (
                          <motion.div layoutId="active-glow" className="absolute inset-0 bg-primary/5 -z-10" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>



                {/* 1.5. Outils & Progression */}
                <motion.div 
                  id="outils-progression"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-12 glass-card p-5 md:p-10 rounded-2xl md:rounded-[3.5rem]"
                >
                  <h3 className="text-lg md:text-2xl font-display mb-6 md:mb-10 flex items-center gap-3 md:gap-4 text-white">
                    <div className="bg-accent/20 p-2 md:p-3 rounded-xl md:rounded-2xl"><Sparkles className="w-5 h-5 md:w-7 md:h-7 text-accent animate-pulse" /></div>
                    Outils & Progression
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => {
                          setGameMode(tool.id as GameMode);
                          triggerGameStart();
                        }}
                        className="p-6 glass rounded-3xl border border-white/5 hover:border-accent/50 transition-all flex items-center gap-6 group text-left"
                      >
                        <div className="bg-accent/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                          {React.cloneElement(tool.icon as React.ReactElement, { className: "w-8 h-8 text-accent" })}
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{tool.name}</p>
                          <p className="text-slate-500 text-xs uppercase tracking-widest">{tool.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

              </div>

              {/* Operations Grid */}
              <section id="protocoles">
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

              {/* Math Insight Card */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="mx-auto mt-12 md:mt-24 max-w-md glass-card p-6 rounded-3xl z-20 shadow-[0_0_40px_rgba(99,102,241,0.15)] relative"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="bg-primary/20 p-2 rounded-xl"><Layout className="text-primary w-5 h-5 animate-pulse" /></div>
                  <p className="text-xs text-primary font-bold uppercase tracking-widest">Aperçu du Programme</p>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="text-sm md:text-base text-slate-300 italic leading-relaxed text-center font-medium"
                >
                  "{mathTip}"
                </motion.p>
              </motion.div>

              <footer className="mt-20 md:mt-32 text-center border-t border-white/5 pt-12 md:pt-16 pb-12 md:pb-16 text-white font-display">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-8">
                  <Logo className="scale-75 md:scale-90" />
                </div>
                <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-[0.4em] mb-8">© 2026 Neural Learning Systems</p>
                
                <button 
                  onClick={() => setShowAdminAuth(true)}
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-all hover:scale-110 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] group"
                >
                  <Shield className="w-3 h-3 group-hover:rotate-12 transition-transform" /> Accès Administrateur
                </button>

                <div className="mt-4">
                  <a 
                    href="mailto:mathsplay@pronton.me?subject=Signalement de problème - Maths Play"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-rose-500 transition-all text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] cursor-pointer"
                  >
                    <AlertCircle className="w-3 h-3 text-rose-500/80 group-hover:animate-bounce" /> Signaler un problème
                  </a>
                </div>

                <div className="mt-4">
                  <button 
                    onClick={() => setShowTermsModal(true)}
                    className="text-slate-600 hover:text-primary transition-all text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] cursor-pointer"
                  >
                    Conditions d'utilisation
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-slate-500 text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-bold">
                    Créé par Diego Hamon Bayard
                  </p>
                </div>

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
              {gameMode === 'keyboard' && (
                <KeyboardGame difficulty={difficulty} grade={grade} operation={operation} onBack={() => setGameState('home')} />
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
              {gameMode === 'inverse' && (
                <InverseMathGame difficulty={difficulty} grade={grade} operation={operation} onBack={() => setGameState('home')} />
              )}
              {(gameMode === 'duration' || gameMode === 'conversion') && (
                <SpecializedGames type={gameMode} difficulty={difficulty} onBack={() => setGameState('home')} />
              )}
              {gameMode === 'dictionary' && (
                <MathDictionary onBack={() => setGameState('home')} />
              )}
              {gameMode === 'checker' && (
                <MathChecker onBack={() => setGameState('home')} />
              )}
              {gameMode === 'quests' && (
                <QuestsAndProgress quests={quests} weakPoints={weakPoints} onBack={() => setGameState('home')} />
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
          {!showSplash && gameState === 'home' && !showAdminAuth && (
            <motion.div
              initial={{ y: 150, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 150, opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none"
            >
              <div className="relative pointer-events-auto pb-4 sm:pb-6 pt-10">
                {/* Background Bar */}
                <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 h-14 sm:h-16 bg-[#1a1c23]/95 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/5" />
                
                {/* Items */}
                <div className="relative flex items-end gap-1 sm:gap-2 md:gap-4 px-3 sm:px-6">
                  {BOTTOM_BAR_ITEMS.map((item) => (
                    <div key={item.id} onClick={() => handleBottomAction(item.action)} className="relative flex flex-col items-center group cursor-pointer w-[4rem] sm:w-[5rem] md:w-20">
                      {/* Icon Circle Container */}
                      <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-b from-slate-500 to-slate-800 flex items-center justify-center mb-1 group-hover:-translate-y-2 group-active:scale-95 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
                        <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-[#2a2d35] to-[#15171e] flex items-center justify-center">
                           {/* Glow effect based on icon color */}
                          <div className={`absolute inset-0 opacity-20 ${item.bg} blur-md rounded-full`} />
                          <item.icon className={`relative z-10 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${item.color} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`} />
                        </div>
                      </div>
                      
                      {/* Badge */}
                      {item.badge > 0 && (
                        <div className="absolute top-0 right-1 sm:right-2 z-20 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full border-2 border-[#1a1c23] flex items-center justify-center text-[10px] sm:text-[11px] font-black text-white shadow-lg">
                          {item.badge}
                        </div>
                      )}
                      
                      {/* Label */}
                      <span className="text-[10px] sm:text-[11px] md:text-sm font-black text-white tracking-wide drop-shadow-md pb-1.5 z-10">
                        {item.label}
                      </span>
                    </div>
                  ))}
                  <AnimatePresence>
                    {showScrollTop && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, width: 0 }}
                        animate={{ opacity: 1, scale: 1, width: 'auto' }}
                        exit={{ opacity: 0, scale: 0.5, width: 0 }}
                        className="relative flex flex-col items-center group cursor-pointer w-[4rem] sm:w-[5rem] md:w-20 ml-2"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      >
                        <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-b from-slate-500 to-slate-800 flex items-center justify-center mb-1 group-hover:-translate-y-2 group-active:scale-95 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
                          <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-[#2a2d35] to-[#15171e] flex items-center justify-center">
                            <div className="absolute inset-0 opacity-20 bg-primary blur-md rounded-full" />
                            <ArrowUp className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                          </div>
                        </div>
                        <span className="text-[10px] sm:text-[11px] md:text-sm font-black text-white tracking-wide drop-shadow-md pb-1.5 z-10 whitespace-nowrap">
                          Haut
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTrainingModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card max-w-lg w-full p-6 md:p-8 rounded-3xl border-indigo-500/30 relative my-auto"
              >
                <button
                  onClick={() => setShowTrainingModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Dumbbell className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-display text-white mb-6 text-center">Entraînements</h2>
                
                <div className="space-y-6 md:space-y-8 mb-8">
                  <div>
                    <h3 className="text-sm md:text-base font-display mb-3 md:mb-4 flex items-center gap-2 text-white">
                      <div className="bg-secondary/20 p-1.5 md:p-2 rounded-lg"><GraduationCap className="w-4 h-4 text-secondary" /></div>
                      Sélection du Niveau
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                      {gradesList.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setGrade(g.id as Grade)}
                          className={`
                            py-2.5 md:py-3 rounded-xl border transition-all text-xs md:text-sm font-bold active:scale-95
                            ${grade === g.id 
                              ? 'border-secondary bg-secondary/20 text-secondary shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                              : 'border-white/5 hover:border-white/20 text-slate-500'}
                          `}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm md:text-base font-display mb-3 md:mb-4 flex items-center gap-2 text-white">
                      <div className="bg-accent/20 p-1.5 md:p-2 rounded-lg"><Zap className="w-4 h-4 text-accent" /></div>
                      Intensité du Calcul
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={`
                            flex-1 min-w-[70px] py-2.5 md:py-3 rounded-xl border transition-all text-xs md:text-sm font-bold active:scale-95
                            ${difficulty === d 
                              ? 'border-accent bg-accent/20 text-accent shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                              : 'border-white/5 hover:border-white/20 text-slate-500'}
                          `}
                        >
                          {d === 'easy' ? 'Bas' : d === 'medium' ? 'Moyen' : 'Max'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowTrainingModal(false);
                    setTimeout(() => {
                      document.getElementById('protocoles')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
                >
                  Aller aux protocoles
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
        <AnimatePresence>
          {showHistoryModal && <HistoryModal onClose={() => setShowHistoryModal(false)} />}
        </AnimatePresence>

          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card max-w-3xl w-full p-8 rounded-3xl border-white/10 relative my-auto max-h-[90vh] flex flex-col"
              >
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-3 shrink-0">
                  <Settings className="w-6 h-6 text-slate-400" /> Paramètres
                </h2>
                
                <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2 flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-primary" /> Affichage & Interface</h3>
                    <div className="space-y-3 bg-white/5 rounded-2xl p-4 border border-white/10">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Afficher l'heure</span>
                        <input type="checkbox" className="w-5 h-5 accent-primary bg-slate-800 border-white/20 rounded cursor-pointer" checked={showTime} onChange={(e) => setShowTime(e.target.checked)} />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Afficher la date</span>
                        <input type="checkbox" className="w-5 h-5 accent-primary bg-slate-800 border-white/20 rounded cursor-pointer" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Bouton de mise à jour</span>
                        <input type="checkbox" className="w-5 h-5 accent-primary bg-slate-800 border-white/20 rounded cursor-pointer" checked={showUpdateBtn} onChange={(e) => setShowUpdateBtn(e.target.checked)} />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Bouton Installer l'app</span>
                        <input type="checkbox" className="w-5 h-5 accent-primary bg-slate-800 border-white/20 rounded cursor-pointer" checked={showInstallBtn} onChange={(e) => setShowInstallBtn(e.target.checked)} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Skins / Thèmes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Theme Cyber */}
                      <button
                        onClick={() => setCurrentTheme('theme-cyber')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${currentTheme === 'theme-cyber' ? 'border-[#06b6d4] bg-[#09090b]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-[#8b5cf6]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#06b6d4]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#f472b6]"></div>
                        </div>
                        <span className="text-xs font-bold text-white text-center">Cyber Néon</span>
                      </button>
                      
                      {/* Theme Fire */}
                      <button
                        onClick={() => setCurrentTheme('theme-fire')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${currentTheme === 'theme-fire' ? 'border-[#f97316] bg-[#1a0505]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#f97316]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#fcd34d]"></div>
                        </div>
                        <span className="text-xs font-bold text-white text-center">Arène de Feu</span>
                      </button>
                      
                      {/* Theme Glacier */}
                      <button
                        onClick={() => setCurrentTheme('theme-glacier')}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${currentTheme === 'theme-glacier' ? 'border-[#38bdf8] bg-[#020617]' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded-full bg-[#38bdf8]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#818cf8]"></div>
                          <div className="w-4 h-4 rounded-full bg-[#e0f2fe]"></div>
                        </div>
                        <span className="text-xs font-bold text-white text-center">Glacier Impérial</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Top Menu */}
        {!showSplash && gameState === 'home' && !showAdminAuth && (
          <div className="fixed top-4 left-4 z-[60] md:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="glass p-2.5 rounded-xl border border-white/10 text-white bg-[#1a1c23]/90 shadow-lg pointer-events-auto flex items-center justify-center"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {isMobileMenuOpen && !showSplash && gameState === 'home' && !showAdminAuth && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 left-4 right-4 z-[55] md:hidden"
            >
              <div className="glass p-3 rounded-2xl border border-white/10 bg-[#1a1c23]/95 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5 pointer-events-auto">
                {BOTTOM_BAR_ITEMS.map((item) => (
                  <button key={item.id} onClick={() => handleBottomAction(item.action)} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors group">
                    <div className={`p-2 rounded-lg ${item.bg} bg-opacity-20 flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide flex-1 text-left">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-red-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Mobile Floating Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="md:hidden fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-primary/20 backdrop-blur-md border border-primary text-white flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

