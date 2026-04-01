import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Shield, Timer, FileText, Table, Palette, 
  Save, Trash2, Plus, Play, BrainCircuit, Download,
  FileCode, FileEdit, Layout, GraduationCap, Calculator, ArrowRight, BookOpen, Star, Binary, Sparkles, Percent, Sigma, Zap, Trophy as TrophyIcon, Loader2
} from 'lucide-react';
import { Grade } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminTool = 'dashboard' | 'explorer' | 'timer' | 'word' | 'excel' | 'paint' | 'tools';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTool, setActiveTool] = useState<AdminTool>('dashboard');
  const [selectedProfTool, setSelectedProfTool] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  const showStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };
  
  // Timer State
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        if (timerMode === 'countdown') {
          setTimerSeconds(s => {
            if (s === 0) {
              if (timerMinutes === 0) {
                setIsTimerRunning(false);
                return 0;
              }
              setTimerMinutes(m => m - 1);
              return 59;
            }
            return s - 1;
          });
        } else {
          setTimerSeconds(s => {
            if (s === 59) {
              setTimerMinutes(m => m + 1);
              return 0;
            }
            return s + 1;
          });
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timerMinutes, timerMode]);

  // Office State
  const [files, setFiles] = useState<{ id: string, name: string, type: string, content: any }[]>(() => {
    const saved = localStorage.getItem('admin_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentFile, setCurrentFile] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('admin_files', JSON.stringify(files));
  }, [files]);

  const saveFile = (type: string, content: any, customName?: string) => {
    const name = customName || prompt("Nom du fichier ?") || "Sans titre";
    const newFile = { id: Date.now().toString(), name, type, content };
    setFiles(prev => [...prev, newFile]);
    return newFile;
  };

  const openFile = (file: any) => {
    setCurrentFile(file);
    setActiveTool(file.type as AdminTool);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-0 md:p-8"
    >
      <div className="w-full h-full max-w-7xl glass-card rounded-none md:rounded-[3rem] overflow-hidden flex flex-col border-white/10">
        {/* Header */}
        <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-2xl">
              <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-display text-white">Panneau Administratif</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Système de Gestion Pédagogique</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Global Loading Overlay */}
          <AnimatePresence>
          </AnimatePresence>

          {/* Sidebar */}
          <div className="w-64 bg-white/5 border-r border-white/5 p-6 space-y-2 hidden md:block overflow-y-auto">
            <SidebarBtn active={activeTool === 'dashboard'} icon={<Layout />} label="Tableau de bord" onClick={() => { setActiveTool('dashboard'); setCurrentFile(null); }} />
            <SidebarBtn active={activeTool === 'explorer'} icon={<Download />} label="Archives" onClick={() => { setActiveTool('explorer'); setCurrentFile(null); }} />
            <SidebarBtn active={activeTool === 'timer'} icon={<Timer />} label="Chronomètre" onClick={() => { setActiveTool('timer'); setCurrentFile(null); }} />
            <SidebarBtn active={activeTool === 'tools'} icon={<Plus />} label="Outils Prof" onClick={() => { setActiveTool('tools'); setCurrentFile(null); }} />
            <div className="pt-6 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Office</div>
            <SidebarBtn active={activeTool === 'word'} icon={<FileText />} label="Word" onClick={() => { setActiveTool('word'); setCurrentFile(null); }} />
            <SidebarBtn active={activeTool === 'excel'} icon={<Table />} label="Excel" onClick={() => { setActiveTool('excel'); setCurrentFile(null); }} />
            <SidebarBtn active={activeTool === 'paint'} icon={<Palette />} label="Paint" onClick={() => { setActiveTool('paint'); setCurrentFile(null); }} />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            {activeTool === 'dashboard' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-display text-white">Bienvenue dans le Panneau Admin</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Fichiers stockés" value={files.length} icon={<Save className="text-primary" />} />
                  <StatCard label="Temps restant" value={`${timerMinutes}:${timerSeconds.toString().padStart(2, '0')}`} icon={<Timer className="text-secondary" />} />
                  <StatCard label="Modules actifs" value="8" icon={<BrainCircuit className="text-accent" />} />
                </div>
                <div className="glass-card p-6 rounded-3xl">
                  <h4 className="text-lg font-bold mb-4 text-white">Archives Récentes</h4>
                  <div className="space-y-2">
                    {files.map(f => (
                      <div key={f.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
                        <button 
                          onClick={() => openFile(f)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          {f.type === 'word' ? <FileText className="text-blue-400" /> : f.type === 'excel' ? <Table className="text-green-400" /> : <Palette className="text-purple-400" />}
                          <span className="text-white font-medium group-hover:text-primary transition-colors">{f.name}</span>
                        </button>
                        <button onClick={() => setFiles(files.filter(x => x.id !== f.id))} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTool === 'explorer' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-display text-white">Explorateur de Données</h3>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{files.length} fichiers archivés</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {files.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 italic">Aucun fichier enregistré pour le moment.</div>
                  ) : (
                    files.map(f => (
                      <div key={f.id} className="glass-card p-6 rounded-[2.5rem] border-white/5 hover:border-primary/30 transition-all group flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <div className={`p-3 rounded-2xl ${f.type === 'word' ? 'bg-blue-500/20 text-blue-400' : f.type === 'excel' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {f.type === 'word' ? <FileText /> : f.type === 'excel' ? <Table /> : <Palette />}
                          </div>
                          <button onClick={() => setFiles(files.filter(x => x.id !== f.id))} className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-white font-bold mb-2 truncate">{f.name}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">{f.type === 'word' ? 'Document Texte' : f.type === 'excel' ? 'Tableur' : 'Dessin'}</p>
                        <button 
                          onClick={() => openFile(f)}
                          className="w-full py-3 bg-white/5 hover:bg-primary hover:text-white rounded-xl text-slate-400 text-sm font-bold transition-all"
                        >
                          Ouvrir le fichier
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTool === 'timer' && (
              <div className="max-w-md mx-auto text-center space-y-8">
                <h3 className="text-3xl font-display text-white">Chronomètre</h3>
                
                <div className="flex justify-center gap-4 mb-8">
                  <button 
                    onClick={() => { setTimerMode('countdown'); setIsTimerRunning(false); setTimerMinutes(60); setTimerSeconds(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${timerMode === 'countdown' ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}
                  >
                    Minuteur
                  </button>
                  <button 
                    onClick={() => { setTimerMode('stopwatch'); setIsTimerRunning(false); setTimerMinutes(0); setTimerSeconds(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${timerMode === 'stopwatch' ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}
                  >
                    Chronomètre
                  </button>
                </div>

                <div className="text-8xl font-mono text-primary font-bold tracking-tighter drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                  {timerMinutes}:{timerSeconds.toString().padStart(2, '0')}
                </div>
                
                <div className="flex gap-4">
                  {timerMode === 'countdown' && (
                    <input 
                      type="number" 
                      value={timerMinutes} 
                      onChange={e => setTimerMinutes(parseInt(e.target.value) || 0)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-center text-2xl"
                    />
                  )}
                  <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`flex-1 rounded-2xl font-bold text-white transition-all py-4 ${isTimerRunning ? 'bg-rose-500' : 'bg-primary'}`}
                  >
                    {isTimerRunning ? 'Stop' : 'Démarrer'}
                  </button>
                  <button 
                    onClick={() => { setIsTimerRunning(false); setTimerMinutes(timerMode === 'countdown' ? 60 : 0); setTimerSeconds(0); }}
                    className="bg-white/5 text-white px-6 rounded-2xl font-bold hover:bg-white/10 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {activeTool === 'tools' && (
              <ProfToolContent 
                selectedProfTool={selectedProfTool} 
                setSelectedProfTool={setSelectedProfTool} 
                onSave={(content, name) => {
                  saveFile('word', content, name);
                  showStatus("Contenu enregistré dans vos fichiers !");
                }}
              />
            )}

            {activeTool === 'word' && (
              <MiniWord 
                initialContent={currentFile?.type === 'word' ? currentFile.content : ''} 
                onSave={content => { saveFile('word', content); showStatus("Document Word enregistré !"); }} 
              />
            )}
            {activeTool === 'excel' && (
              <MiniExcel 
                initialContent={currentFile?.type === 'excel' ? currentFile.content : null}
                onSave={content => { saveFile('excel', content); showStatus("Tableur Excel enregistré !"); }} 
              />
            )}
            {activeTool === 'paint' && (
              <MiniPaint 
                initialContent={currentFile?.type === 'paint' ? currentFile.content : null}
                onSave={content => { saveFile('paint', content); showStatus("Dessin Paint enregistré !"); }} 
              />
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex justify-around p-2 z-[210]">
          <MobileNavBtn active={activeTool === 'dashboard'} icon={<Layout />} onClick={() => { setActiveTool('dashboard'); setCurrentFile(null); }} />
          <MobileNavBtn active={activeTool === 'explorer'} icon={<Download />} onClick={() => { setActiveTool('explorer'); setCurrentFile(null); }} />
          <MobileNavBtn active={activeTool === 'timer'} icon={<Timer />} onClick={() => { setActiveTool('timer'); setCurrentFile(null); }} />
          <MobileNavBtn active={activeTool === 'tools'} icon={<Plus />} onClick={() => { setActiveTool('tools'); setCurrentFile(null); }} />
          <MobileNavBtn active={activeTool === 'word'} icon={<FileText />} onClick={() => { setActiveTool('word'); setCurrentFile(null); }} />
        </div>

        {/* Save Notification */}
        <AnimatePresence>
          {saveStatus && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl z-[300] flex items-center gap-3"
            >
              <Save className="w-5 h-5" /> {saveStatus}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SidebarBtn = ({ active, icon, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5'
    }`}
  >
    {React.cloneElement(icon, { className: "w-5 h-5" })}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const MobileNavBtn = ({ active, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl transition-all ${
      active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400'
    }`}
  >
    {React.cloneElement(icon, { className: "w-6 h-6" })}
  </button>
);

const StatCard = ({ label, value, icon }: any) => (
  <div className="glass-card p-4 md:p-6 rounded-2xl md:rounded-3xl border-white/5">
    <div className="flex items-center justify-between mb-1 md:mb-2">
      <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      {icon}
    </div>
    <div className="text-2xl md:text-3xl font-display text-white">{value}</div>
  </div>
);

// --- PROF TOOLS CONTENT ---

const ProfToolContent = ({ selectedProfTool, setSelectedProfTool, onSave }: any) => {
  const [content, setContent] = useState('');
  const [input, setInput] = useState('');

  const toolTemplates: Record<string, string> = {
    "Générateur de Devoirs": "DEVOIR MAISON : [Sujet]\n\nExercice 1 : Calculs de base\n...\nExercice 2 : Problème de géométrie\n...\nExercice 3 : Raisonnement logique\n...",
    "Banque d'Exercices": "SÉRIE D'EXERCICES : [Sujet]\n\nNiveau Facile :\n1. ...\n2. ...\n\nNiveau Moyen :\n1. ...\n2. ...\n\nNiveau Difficile :\n1. ...",
    "Planificateur de Cours": "SÉQUENCE PÉDAGOGIQUE : [Sujet]\n\nObjectifs :\n- ...\n- ...\n\nDéroulement :\n1. Introduction (10 min)\n2. Activité de découverte (20 min)\n3. Institutionnalisation (15 min)\n4. Exercices d'application (10 min)",
    "Générateur de QCM": "QCM : [Sujet]\n\nQuestion 1 : ...\nA) ... B) ... C) ...\n\nQuestion 2 : ...\nA) ... B) ... C) ...",
  };

  const handleAction = () => {
    const template = toolTemplates[selectedProfTool] || "Modèle de document pour : " + selectedProfTool + "\n\n[Contenu à personnaliser ici]";
    setContent(template.replace("[Sujet]", input || "Sujet non défini"));
  };

  const renderTool = () => {
    if (selectedProfTool === "Tirage au Sort Élèves") return <StudentRandomizer />;
    if (selectedProfTool === "Calculatrice") return <QuantumCalculator />;
    if (selectedProfTool === "Convertisseur") return <UnitConverter />;
    if (selectedProfTool === "Gestion des Notes") return <GradeManager />;
    if (selectedProfTool === "Gestion des Groupes") return <GroupGenerator />;
    if (selectedProfTool === "Bibliothèque de Formules") return <FormulaLibrary />;
    if (selectedProfTool === "Calcul Mental Flash") return <MentalMathFlash />;
    if (selectedProfTool === "Statistiques de Classe") return <ClassStats />;
    if (selectedProfTool === "Roue de la Fortune") return <WheelOfFortune />;

    return (
      <div className="space-y-6">
        <div className="glass-card p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border-white/5">
          <p className="text-slate-400 mb-4 md:mb-6 text-sm md:text-base">Utilisez cet outil pour générer du contenu pédagogique personnalisé.</p>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input 
              type="text" 
              placeholder="Détails (ex: Chapitre, Difficulté, Thème...)"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 text-white focus:border-primary/50 outline-none text-sm md:text-base"
            />
            <button 
              onClick={handleAction}
              className="bg-primary text-white px-6 md:px-8 py-3 md:py-0 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm md:text-base"
            >
              <Play className="w-4 h-4" /> Générer
            </button>
          </div>
        </div>

        {content && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  const name = prompt("Nom du fichier ?") || selectedProfTool;
                  onSave(content, name);
                }}
                className="w-full md:w-auto bg-emerald-600 text-white px-6 py-3 md:py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all text-sm"
              >
                <Save className="w-4 h-4" /> Enregistrer le résultat
              </button>
            </div>
            <div className="glass-card p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-slate-900/50 whitespace-pre-wrap text-slate-300 leading-relaxed border-white/5 text-sm md:text-base">
              {content}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-3xl font-display text-white">
          {selectedProfTool ? (
            <button onClick={() => setSelectedProfTool(null)} className="flex items-center gap-2 hover:text-primary transition-colors">
              <ArrowRight className="w-6 h-6 rotate-180" /> {selectedProfTool}
            </button>
          ) : "Outils Pédagogiques"}
        </h3>
        {selectedProfTool && (
          <button onClick={() => setSelectedProfTool(null)} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            Retour à la liste
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {!selectedProfTool ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
            {[
              { name: "Générateur de Devoirs", icon: <FileEdit /> },
              { name: "Calculatrice", icon: <Calculator /> },
              { name: "Convertisseur", icon: <ArrowRight /> },
              { name: "Chronomètre", icon: <Timer /> },
              { name: "Gestion des Notes", icon: <Star /> },
              { name: "Formulaire", icon: <FileText /> },
              { name: "Tirage au Sort", icon: <Sparkles /> },
              { name: "Générateur de QCM", icon: <Plus /> },
              { name: "Aide à la Correction", icon: <Shield /> },
              { name: "Statistiques", icon: <Percent /> },
              { name: "Bibliothèque", icon: <Sigma /> },
              { name: "Outil de Géométrie", icon: <Palette /> },
              { name: "Calcul Mental", icon: <Zap /> },
              { name: "Gestion des Groupes", icon: <Layout /> },
              { name: "Roue de la Fortune", icon: <Sparkles /> },
              { name: "Rapports", icon: <TrophyIcon /> }
            ].map((tool, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedProfTool(tool.name)}
                className="glass-card p-6 rounded-3xl border-white/5 hover:border-primary/30 transition-all text-left group"
              >
                <div className="bg-white/5 p-3 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  {React.cloneElement(tool.icon as any, { className: "w-5 h-5 text-slate-400 group-hover:text-primary" })}
                </div>
                <span className="text-white font-medium text-sm">{tool.name}</span>
              </button>
            ))}
          </div>
        ) : renderTool()}
      </div>
    </div>
  );
};

const StudentRandomizer = () => {
  const [students, setStudents] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState('');
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const addStudent = () => {
    if (newStudent.trim()) {
      setStudents([...students, newStudent.trim()]);
      setNewStudent('');
    }
  };

  const pickWinner = () => {
    if (students.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    setTimeout(() => {
      const random = students[Math.floor(Math.random() * students.length)];
      setWinner(random);
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      <div className="glass-card p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-white/5">
        <h4 className="text-lg md:text-xl font-display text-white mb-4 md:mb-6">Base de Données Élèves</h4>
        <div className="flex gap-2 mb-4 md:mb-6">
          <input 
            type="text" 
            value={newStudent}
            onChange={e => setNewStudent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStudent()}
            placeholder="Nom de l'élève..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none text-sm"
          />
          <button onClick={addStudent} className="bg-primary p-3 rounded-xl text-white"><Plus className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {students.map((s, i) => (
            <div key={i} className="bg-white/5 px-3 py-1.5 rounded-full text-xs text-slate-300 flex items-center gap-2">
              {s} <button onClick={() => setStudents(students.filter((_, idx) => idx !== i))} className="text-rose-500">×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center text-center">
        <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center mb-6 md:mb-8 ${isSpinning ? 'animate-spin' : ''}`}>
          <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary" />
        </div>
        <AnimatePresence mode="wait">
          {winner ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 md:mb-8">
              <p className="text-slate-500 uppercase tracking-widest text-[10px] mb-1">Élève sélectionné :</p>
              <h5 className="text-3xl md:text-4xl font-display text-primary">{winner}</h5>
            </motion.div>
          ) : (
            <p className="text-slate-400 mb-6 md:mb-8 text-sm">Prêt pour le tirage au sort</p>
          )}
        </AnimatePresence>
        <button 
          onClick={pickWinner}
          disabled={students.length === 0 || isSpinning}
          className="w-full py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-bold hover:scale-105 transition-all disabled:opacity-50 text-sm md:text-base"
        >
          Lancer le tirage
        </button>
      </div>
    </div>
  );
};

const QuantumCalculator = () => {
  const [display, setDisplay] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const buttons = [
    '7', '8', '9', '/', 'sin',
    '4', '5', '6', '*', 'cos',
    '1', '2', '3', '-', 'tan',
    '0', '.', '=', '+', 'sqrt',
    'C', '(', ')', '^', 'log'
  ];

  const handleBtn = (btn: string) => {
    if (btn === '=') {
      setIsCalculating(true);
      setTimeout(() => {
        try {
          // Simple eval replacement for basic math
          const res = eval(display.replace('sqrt', 'Math.sqrt').replace('sin', 'Math.sin').replace('cos', 'Math.cos').replace('tan', 'Math.tan').replace('log', 'Math.log10').replace('^', '**'));
          setDisplay(res.toString());
        } catch (e) {
          setDisplay('Erreur');
        } finally {
          setIsCalculating(false);
        }
      }, 600);
    } else if (btn === 'C') {
      setDisplay('');
    } else {
      setDisplay(display + btn);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-4 md:p-8 rounded-3xl md:rounded-[3rem] border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary animate-pulse" />
      <div className="bg-slate-900 p-3 md:p-6 rounded-2xl mb-4 md:mb-6 text-right text-xl md:text-3xl font-mono text-primary overflow-hidden h-14 md:h-20 flex items-center justify-end relative">
        {isCalculating && (
          <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-primary" />
          </div>
        )}
        {display || '0'}
      </div>
      <div className="grid grid-cols-5 gap-1 md:gap-2">
        {buttons.map(btn => (
          <button 
            key={btn} 
            onClick={() => handleBtn(btn)}
            className={`p-2 md:p-4 rounded-lg md:rounded-xl font-bold transition-all text-[10px] sm:text-xs md:text-base ${
              btn === '=' ? 'bg-primary text-white col-span-1 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 
              btn === 'C' ? 'bg-rose-500 text-white' : 
              'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
      <p className="text-[8px] text-slate-600 uppercase tracking-widest text-center mt-4 md:mt-6 font-bold">Calculatrice Scientifique • Précision</p>
    </div>
  );
};

const UnitConverter = () => {
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('cm');
  const [result, setResult] = useState<number | null>(null);

  const units: Record<string, number> = {
    'mm': 0.001, 'cm': 0.01, 'dm': 0.1, 'm': 1, 'dam': 10, 'hm': 100, 'km': 1000
  };

  const convert = () => {
    const val = parseFloat(value);
    if (isNaN(val)) return;
    const res = (val * units[fromUnit]) / units[toUnit];
    setResult(res);
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-white/5 space-y-6 md:space-y-8">
      <h4 className="text-xl md:text-2xl font-display text-white text-center">Convertisseur de Longueurs</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-end">
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Valeur</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm" />
        </div>
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">De</label>
          <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white text-sm">
            {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Vers</label>
          <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white text-sm">
            {Object.keys(units).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <button onClick={convert} className="w-full py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-bold hover:scale-105 transition-all text-sm md:text-base">Convertir</button>
      {result !== null && (
        <div className="p-4 md:p-6 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/30 text-center">
          <p className="text-slate-400 text-xs md:text-sm mb-1">Résultat :</p>
          <p className="text-2xl md:text-3xl font-display text-white">{result} {toUnit}</p>
        </div>
      )}
    </div>
  );
};

const GradeManager = () => {
  const [grades, setGrades] = useState<number[]>([]);
  const [newGrade, setNewGrade] = useState('');

  const addGrade = () => {
    const val = parseFloat(newGrade);
    if (!isNaN(val) && val >= 0 && val <= 20) {
      setGrades([...grades, val]);
      setNewGrade('');
    }
  };

  const average = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
        <h4 className="text-xl font-display text-white mb-6">Saisie des Notes (/20)</h4>
        <div className="flex gap-2 mb-6">
          <input type="number" value={newGrade} onChange={e => setNewGrade(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGrade()} placeholder="Note..." className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
          <button onClick={addGrade} className="bg-primary p-3 rounded-xl text-white"><Plus /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {grades.map((g, i) => (
            <div key={i} className="bg-white/5 px-4 py-2 rounded-full text-sm text-slate-300 flex items-center gap-2">
              {g} <button onClick={() => setGrades(grades.filter((_, idx) => idx !== i))} className="text-rose-500">×</button>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center text-center">
        <div className="text-4xl md:text-6xl font-display text-primary mb-2">{average}</div>
        <p className="text-slate-500 uppercase tracking-widest text-[8px] md:text-xs">Moyenne de la Classe</p>
        <div className="mt-6 md:mt-8 w-full grid grid-cols-2 gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl">
            <div className="text-[8px] md:text-xs text-slate-500 mb-1">Max</div>
            <div className="text-lg md:text-xl text-white font-bold">{grades.length > 0 ? Math.max(...grades) : '-'}</div>
          </div>
          <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl">
            <div className="text-[8px] md:text-xs text-slate-500 mb-1">Min</div>
            <div className="text-lg md:text-xl text-white font-bold">{grades.length > 0 ? Math.min(...grades) : '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupGenerator = () => {
  const [students, setStudents] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState('');
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<string[][]>([]);

  const addStudent = () => {
    if (newStudent.trim()) {
      setStudents([...students, newStudent.trim()]);
      setNewStudent('');
    }
  };

  const generateGroups = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const newGroups = [];
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push(shuffled.slice(i, i + groupSize));
    }
    setGroups(newGroups);
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-display text-white mb-6">Matrice des Élèves</h4>
            <div className="flex gap-2 mb-6">
              <input type="text" value={newStudent} onChange={e => setNewStudent(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStudent()} placeholder="Nom..." className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
              <button onClick={addStudent} className="bg-primary p-3 rounded-xl text-white"><Plus /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {students.map((s, i) => <div key={i} className="bg-white/5 px-3 py-1 rounded-full text-xs text-slate-300">{s}</div>)}
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-xl font-display text-white">Paramètres</h4>
            <div className="space-y-2">
              <label className="text-xs text-slate-500">Taille des groupes : {groupSize}</label>
              <input type="range" min="2" max="10" value={groupSize} onChange={e => setGroupSize(parseInt(e.target.value))} className="w-full accent-primary" />
            </div>
            <button onClick={generateGroups} disabled={students.length < 2} className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all disabled:opacity-50">Générer les Groupes</button>
          </div>
        </div>
      </div>
      {groups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((group, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl border-white/5">
              <h5 className="text-primary font-bold mb-4">Groupe {i + 1}</h5>
              <ul className="space-y-2">
                {group.map((s, j) => <li key={j} className="text-slate-300 text-sm">{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FormulaLibrary = () => {
  const formulas = [
    { name: "Pythagore", formula: "a² + b² = c²", desc: "Dans un triangle rectangle." },
    { name: "Aire du Cercle", formula: "π × r²", desc: "Rayon r." },
    { name: "Périmètre Cercle", formula: "2 × π × r", desc: "Rayon r." },
    { name: "Volume Sphère", formula: "(4/3) × π × r³", desc: "Rayon r." },
    { name: "Identité Remarquable 1", formula: "(a+b)² = a² + 2ab + b²", desc: "Carré d'une somme." },
    { name: "Identité Remarquable 2", formula: "(a-b)² = a² - 2ab + b²", desc: "Carré d'une différence." },
    { name: "Identité Remarquable 3", formula: "(a+b)(a-b) = a² - b²", desc: "Différence de carrés." },
    { name: "Thalès", formula: "AM/AB = AN/AC = MN/BC", desc: "Droites parallèles." }
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {formulas.map((f, i) => (
        <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-primary/30 transition-all">
          <h4 className="text-primary font-bold mb-2">{f.name}</h4>
          <div className="bg-slate-900 p-4 rounded-xl font-mono text-white mb-4 text-center">{f.formula}</div>
          <p className="text-xs text-slate-500">{f.desc}</p>
        </div>
      ))}
    </div>
  );
};

const MentalMathFlash = () => {
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+' });
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const generate = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    setQuestion({ a, b, op });
    setAnswer('');
    setFeedback(null);
  };

  useEffect(() => { generate(); }, []);

  const check = () => {
    let correct = 0;
    if (question.op === '+') correct = question.a + question.b;
    if (question.op === '-') correct = question.a - question.b;
    if (question.op === '*') correct = question.a * question.b;

    if (parseInt(answer) === correct) {
      setScore(score + 1);
      setFeedback('Correct !');
      setTimeout(generate, 1000);
    } else {
      setFeedback('Faux, réessaie !');
    }
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 md:p-10 rounded-3xl md:rounded-[3rem] border-white/5 text-center space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Calcul Mental</span>
        <span className="bg-primary/20 text-primary px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-bold">Score: {score}</span>
      </div>
      <div className="text-4xl md:text-6xl font-display text-white py-6 md:py-10">
        {question.a} {question.op === '*' ? '×' : question.op} {question.b}
      </div>
      <input 
        type="number" 
        value={answer} 
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && check()}
        autoFocus
        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 text-center text-2xl md:text-4xl text-white outline-none focus:border-primary/50"
      />
      {feedback && <p className={`font-bold text-sm md:text-base ${feedback === 'Correct !' ? 'text-emerald-500' : 'text-rose-500'}`}>{feedback}</p>}
    </div>
  );
};

const ClassStats = () => {
  const [data, setData] = useState<number[]>([]);
  const [input, setInput] = useState('');

  const addData = () => {
    const val = parseFloat(input);
    if (!isNaN(val)) {
      setData([...data, val]);
      setInput('');
    }
  };

  const sorted = [...data].sort((a, b) => a - b);
  const median = sorted.length === 0 ? 0 : sorted.length % 2 === 0 ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2 : sorted[Math.floor(sorted.length/2)];
  const range = data.length > 0 ? Math.max(...data) - Math.min(...data) : 0;

  return (
    <div className="space-y-8">
      <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
        <h4 className="text-xl font-display text-white mb-6">Saisie des Données Statistiques</h4>
        <div className="flex gap-2 mb-6">
          <input type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addData()} placeholder="Valeur..." className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
          <button onClick={addData} className="bg-primary p-3 rounded-xl text-white"><Plus /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.map((v, i) => <div key={i} className="bg-white/5 px-3 py-1 rounded-full text-xs text-slate-300">{v}</div>)}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Médiane" value={median} />
        <StatItem label="Étendue" value={range} />
        <StatItem label="Effectif" value={data.length} />
        <StatItem label="Moyenne" value={data.length > 0 ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2) : 0} />
      </div>
    </div>
  );
};

const StatItem = ({ label, value }: any) => (
  <div className="glass-card p-6 rounded-3xl border-white/5 text-center">
    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">{label}</div>
    <div className="text-2xl font-display text-white">{value}</div>
  </div>
);

const WheelOfFortune = () => {
  const [items, setItems] = useState<string[]>(['Option 1', 'Option 2', 'Option 3', 'Option 4']);
  const [newItem, setNewItem] = useState('');
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const spin = () => {
    if (items.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
    
    const extraSpins = 5 + Math.random() * 5;
    const newRotation = rotation + extraSpins * 360 + Math.random() * 360;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualRotation = newRotation % 360;
      const segmentAngle = 360 / items.length;
      // Pointer is at the top (270deg)
      const index = Math.floor(((270 - actualRotation % 360 + 360) % 360) / segmentAngle);
      setWinner(items[index]);
    }, 4000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-8 rounded-[2.5rem] border-white/5">
        <h4 className="text-xl font-display text-white mb-6">Options de la roue</h4>
        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Ajouter une option..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none"
          />
          <button onClick={addItem} className="bg-primary p-3 rounded-xl text-white"><Plus /></button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item, i) => (
            <div key={i} className="bg-white/5 px-4 py-2 rounded-full text-sm text-slate-300 flex items-center gap-2">
              {item} <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} className="text-rose-500">×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-primary drop-shadow-lg" />
          </div>
          
          <motion.div 
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.2, 0, 0.1, 1] }}
            className="w-full h-full rounded-full border-8 border-white/10 relative overflow-hidden shadow-2xl"
            style={{ background: 'conic-gradient(from 0deg, #6366f1 0%, #a855f7 25%, #ec4899 50%, #f43f5e 75%, #6366f1 100%)' }}
          >
            {items.map((item, i) => {
              const angle = 360 / items.length;
              const rotate = angle * i;
              return (
                <div 
                  key={i}
                  className="absolute top-0 left-1/2 h-1/2 origin-bottom -translate-x-1/2 flex items-start pt-4"
                  style={{ transform: `translateX(-50%) rotate(${rotate + angle/2}deg)` }}
                >
                  <span className="text-white font-bold text-[10px] md:text-xs whitespace-nowrap drop-shadow-md" style={{ writingMode: 'vertical-rl' }}>
                    {item}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {winner ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-6">
              <p className="text-slate-500 uppercase tracking-widest text-xs mb-2">Résultat :</p>
              <h5 className="text-4xl font-display text-primary">{winner}</h5>
            </motion.div>
          ) : (
            <p className="text-slate-400 mb-6 h-14 flex items-center">Cliquez pour lancer la roue</p>
          )}
        </AnimatePresence>

        <button 
          onClick={spin}
          disabled={items.length < 2 || isSpinning}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {isSpinning ? 'Rotation...' : 'Lancer la roue'}
        </button>
      </div>
    </div>
  );
};

// --- MINI OFFICE COMPONENTS ---

const MiniWord = ({ initialContent, onSave }: any) => {
  const [text, setText] = useState(initialContent || '');

  useEffect(() => {
    setText(initialContent || '');
  }, [initialContent]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl md:text-2xl font-display text-white">Mini Word</h3>
        <button onClick={() => onSave(text)} className="bg-primary text-white px-4 md:px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm md:text-base">
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </div>
      <textarea 
        value={text}
        onChange={e => setText(e.target.value)}
        className="flex-1 bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl text-slate-900 font-serif text-base md:text-lg focus:outline-none shadow-inner min-h-[200px]"
        placeholder="Commencez à écrire..."
      />
    </div>
  );
};

const MiniExcel = ({ initialContent, onSave }: any) => {
  const [grid, setGrid] = useState(initialContent || Array(10).fill(0).map(() => Array(5).fill('')));

  useEffect(() => {
    setGrid(initialContent || Array(10).fill(0).map(() => Array(5).fill('')));
  }, [initialContent]);

  const updateCell = (r: number, c: number, val: string) => {
    const newGrid = [...grid];
    newGrid[r][c] = val;
    setGrid(newGrid);
  };
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl md:text-2xl font-display text-white">Mini Excel</h3>
        <button onClick={() => onSave(grid)} className="bg-green-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm md:text-base">
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-white rounded-2xl md:rounded-3xl p-2 md:p-4">
        <table className="w-full border-collapse min-w-[400px]">
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-slate-200 p-0">
                    <input 
                      value={cell}
                      onChange={e => updateCell(r, c, e.target.value)}
                      className="w-full p-2 text-xs md:text-sm text-slate-900 focus:bg-blue-50 focus:outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MiniPaint = ({ initialContent, onSave }: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');

  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (container && canvas) {
        const { width, height } = container.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        
        // Redraw content if any
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          if (initialContent) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, width, height);
            img.src = initialContent;
          }
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [initialContent]);

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <h3 className="text-xl md:text-2xl font-display text-white">Mini Paint</h3>
        <div className="flex gap-4 w-full md:w-auto justify-between md:justify-end">
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer" />
          <button onClick={() => onSave(canvasRef.current?.toDataURL())} className="bg-purple-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm md:text-base">
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 bg-white rounded-2xl md:rounded-3xl shadow-lg relative min-h-[300px]">
        <canvas 
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 cursor-crosshair w-full h-full rounded-2xl md:rounded-3xl"
        />
      </div>
    </div>
  );
};
