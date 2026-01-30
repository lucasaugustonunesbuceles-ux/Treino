
import React, { useState, useEffect } from 'react';
import { UserData, Rank, Quest, Difficulty, TrainingLocation, HealthTip, MartialDrill, MartialArt, MartialProgress } from './types';
import { generateDailyQuests, generateSurvivalGuide, generateMartialDrills } from './services/geminiService';
import SystemIntro from './components/SystemIntro';
import OnboardingForm from './components/OnboardingForm';
import StatusWindow from './components/StatusWindow';
import DailyQuests from './components/DailyQuests';
import LevelUpModal from './components/LevelUpModal';

type ContentTab = 'QUESTS' | 'SURVIVAL';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(() => {
    try {
      const saved = localStorage.getItem('solo_leveling_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Validar estrutura básica para não quebrar após atualizações
      return (parsed && parsed.name && parsed.stats) ? parsed : null;
    } catch (e) {
      console.warn("[SISTEMA]: Falha ao ler dados de salvamento.", e);
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<ContentTab>('QUESTS');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [drills, setDrills] = useState<MartialDrill[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<TrainingLocation | null>(null);
  const [isAwakening, setIsAwakening] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, type: 'HUNTER' as 'HUNTER' | 'MARTIAL', name: '' });

  useEffect(() => {
    if (userData && currentLocation) {
      loadMainContent();
    }
  }, [currentLocation, activeTab, userData?.level]);

  useEffect(() => {
    if (userData && userData.martialArt !== MartialArt.NONE) {
      loadDojoContent();
    }
  }, [userData?.martialArt, userData?.martialProgress[userData?.martialArt || MartialArt.NONE]?.level]);

  const loadMainContent = async () => {
    if (!userData || !currentLocation) return;
    setLoading(true);
    try {
      if (activeTab === 'QUESTS') {
        const q = await generateDailyQuests(userData, currentLocation);
        setQuests(q || []);
      } else {
        const tips = await generateSurvivalGuide(userData);
        setHealthTips(tips || []);
      }
    } catch (err) {
      console.error("[SISTEMA]: Erro ao gerar conteúdo.", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDojoContent = async () => {
    if (!userData) return;
    try {
      const d = await generateMartialDrills(userData);
      setDrills(d || []);
    } catch (err) {
      console.error("[SISTEMA]: Falha na conexão com o Dojo.", err);
    }
  };

  const handleAwaken = (data: Partial<UserData>) => {
    const initialMartialProgress: Record<MartialArt, MartialProgress> = {} as any;
    Object.values(MartialArt).forEach(art => {
      initialMartialProgress[art] = { level: 1, xp: 0 };
    });

    const newUser: UserData = {
      name: data.name || 'Hunter',
      age: data.age || 24,
      height: data.height || 175,
      weight: data.weight || 75,
      gender: data.gender || 'Masculino',
      dailyGoal: data.dailyGoal || 'Saúde',
      difficulty: data.difficulty || Difficulty.NORMAL,
      level: 1,
      xp: 0,
      rank: Rank.E,
      stats: { str: 10, agi: 10, vit: 10, int: 10, sen: 10 },
      isAwakened: true,
      preferredLocation: TrainingLocation.HOME,
      martialArt: data.martialArt || MartialArt.NONE,
      martialProgress: initialMartialProgress
    };
    
    setUserData(newUser);
    localStorage.setItem('solo_leveling_user', JSON.stringify(newUser));
    setIsAwakening(false);
    setCurrentLocation(newUser.preferredLocation!);
  };

  const handleCompleteQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q));
    handleGainXp(quest.xpReward, quest.type);
  };

  const handleGainXp = (amount: number, statType: string) => {
    setUserData(prev => {
      if (!prev) return null;
      let updatedUser = { ...prev };
      
      updatedUser.xp += amount;
      const xpToNextLevel = updatedUser.level * 100;
      if (updatedUser.xp >= xpToNextLevel) {
        updatedUser.xp -= xpToNextLevel;
        updatedUser.level += 1;
        setLevelUpData({ level: updatedUser.level, type: 'HUNTER', name: '' });
        setShowLevelUp(true);
      }

      if (updatedUser.martialArt !== MartialArt.NONE) {
        const art = updatedUser.martialArt;
        const prog = { ...updatedUser.martialProgress[art] };
        prog.xp += amount;
        const artXpNext = prog.level * 80;
        if (prog.xp >= artXpNext) {
          prog.xp -= artXpNext;
          prog.level += 1;
          setLevelUpData({ level: prog.level, type: 'MARTIAL', name: art });
          setShowLevelUp(true);
        }
        updatedUser.martialProgress = { ...updatedUser.martialProgress, [art]: prog };
      }

      const statGain = 0.5;
      if (statType === 'STR') updatedUser.stats.str += statGain;
      if (statType === 'AGI') updatedUser.stats.agi += statGain;
      if (statType === 'VIT') updatedUser.stats.vit += statGain;

      localStorage.setItem('solo_leveling_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  if (!userData) {
    return !isAwakening ? <SystemIntro onStart={() => setIsAwakening(true)} /> : <OnboardingForm onSubmit={handleAwaken} />;
  }

  if (!currentLocation) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-[400]">
        <div className="bg-slate-900 border border-blue-900/40 p-8 rounded-lg max-w-lg w-full text-center space-y-10 shadow-2xl">
          <h2 className="text-2xl font-system text-blue-400 uppercase tracking-widest system-glow">O SISTEMA EXIGE UM LOCAL</h2>
          <div className="grid grid-cols-1 gap-4">
            {Object.values(TrainingLocation).map(loc => (
              <button key={loc} onClick={() => setCurrentLocation(loc)} className="p-4 border border-blue-900/40 hover:border-blue-500 rounded bg-slate-800 text-white font-system uppercase text-xs transition-all hover:scale-105 active:scale-95">
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const artProg = userData.martialProgress[userData.martialArt] || { level: 1, xp: 0 };
  const artXpPct = (artProg.xp / (artProg.level * 80)) * 100;

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans relative z-10">
      <aside className="w-full md:w-80 bg-slate-900/60 backdrop-blur-xl border-r border-blue-900/30 p-6 space-y-8 overflow-y-auto">
        <div className="border-b border-blue-900/50 pb-4">
            <h2 className="text-blue-400 font-system text-lg font-bold tracking-widest system-glow">SHADOW DOJO</h2>
        </div>

        {userData.martialArt !== MartialArt.NONE && (
            <div className="space-y-6">
                <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded relative overflow-hidden group">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-system text-blue-400 uppercase">{userData.martialArt}</span>
                        <span className="text-xl font-system text-white font-bold">NV. {artProg.level}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${artXpPct}%` }}></div>
                    </div>
                </div>
                <div className="space-y-3">
                    {drills.map((drill, i) => (
                        <div key={i} className="p-3 rounded border border-blue-900/30 bg-blue-900/5 hover:border-blue-500/50 transition-colors">
                            <h4 className="text-white font-system text-[9px] uppercase tracking-wider">{drill.title}</h4>
                            <p className="text-slate-400 text-[10px] leading-tight mt-1">{drill.description}</p>
                        </div>
                    ))}
                    {drills.length === 0 && <p className="text-slate-600 text-[10px] uppercase font-system italic">Carregando treinos marciais...</p>}
                </div>
            </div>
        )}
      </aside>

      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto pb-32">
        <header className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl font-system font-black text-blue-500 tracking-[0.2em] system-glow">O SISTEMA</h1>
            <p className="text-slate-400 text-[10px] uppercase font-system mt-2 tracking-widest">HUNTER {userData.rank}-CLASS | NV. {userData.level}</p>
          </div>
          <nav className="flex gap-4 bg-slate-900 p-1 rounded border border-blue-900/30 shadow-2xl">
            <button onClick={() => setActiveTab('QUESTS')} className={`px-6 py-2 font-system text-[10px] uppercase transition-all ${activeTab === 'QUESTS' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}>Treinamento</button>
            <button onClick={() => setActiveTab('SURVIVAL')} className={`px-6 py-2 font-system text-[10px] uppercase transition-all ${activeTab === 'SURVIVAL' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}>Saúde</button>
          </nav>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
                <StatusWindow userData={userData} />
            </div>
            <div className="xl:col-span-2 space-y-6">
                {loading ? (
                    <div className="p-20 text-center font-system text-blue-400 animate-pulse bg-slate-900/40 rounded-lg border border-blue-900/20 shadow-inner">
                      [ SINCRONIZANDO COM O SISTEMA... ]
                    </div>
                ) : activeTab === 'QUESTS' ? (
                    <DailyQuests quests={quests} onComplete={handleCompleteQuest} onRefresh={() => loadMainContent()} isLoading={false} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {healthTips.map((tip, i) => (
                            <div key={i} className="p-5 bg-slate-900/60 backdrop-blur border border-blue-900/30 rounded-lg hover:border-blue-500/50 transition-all">
                                <span className="text-[9px] font-system text-blue-400 uppercase tracking-widest">{tip.category}</span>
                                <p className="text-sm text-slate-300 italic mt-2 leading-relaxed">"{tip.content}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </main>

      {showLevelUp && (
        <LevelUpModal 
            level={levelUpData.level} 
            type={levelUpData.type}
            name={levelUpData.name}
            onClose={() => setShowLevelUp(false)} 
        />
      )}
    </div>
  );
};

export default App;
