
import React, { useState, useEffect } from 'react';
import { UserData, Rank, Quest, UserStats, Difficulty, TrainingLocation, HealthTip, MartialDrill, MartialArt, MartialProgress } from './types';
import { generateDailyQuests, generateSurvivalGuide, generateMartialDrills } from './services/geminiService';
import SystemIntro from './components/SystemIntro';
import OnboardingForm from './components/OnboardingForm';
import StatusWindow from './components/StatusWindow';
import DailyQuests from './components/DailyQuests';
import LevelUpModal from './components/LevelUpModal';

type ContentTab = 'QUESTS' | 'SURVIVAL';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('solo_leveling_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<ContentTab>('QUESTS');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [drills, setDrills] = useState<MartialDrill[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<TrainingLocation | null>(null);
  const [isAwakening, setIsAwakening] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastLevelUpType, setLastLevelUpType] = useState<'HUNTER' | 'MARTIAL'>('HUNTER');

  useEffect(() => {
    if (userData && currentLocation) {
      loadMainContent();
    }
  }, [currentLocation, activeTab]);

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
        setQuests(q);
      } else {
        const tips = await generateSurvivalGuide(userData);
        setHealthTips(tips);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDojoContent = async () => {
    if (!userData) return;
    const d = await generateMartialDrills(userData);
    setDrills(d);
  };

  const handleAwaken = (data: Partial<UserData>) => {
    const initialMartialProgress: Record<MartialArt, MartialProgress> = {} as any;
    Object.values(MartialArt).forEach(art => {
      initialMartialProgress[art] = { level: 1, xp: 0 };
    });

    const newUser = {
      ...data,
      level: 1, xp: 0, rank: Rank.E,
      stats: { str: 10, agi: 10, vit: 10, int: 10, sen: 10 },
      isAwakened: true,
      preferredLocation: TrainingLocation.HOME,
      martialProgress: initialMartialProgress
    } as UserData;
    
    setUserData(newUser);
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
      
      // 1. Atualizar XP Global de Hunter
      updatedUser.xp += amount;
      const xpToNextLevel = updatedUser.level * 100;
      if (updatedUser.xp >= xpToNextLevel) {
        updatedUser.xp -= xpToNextLevel;
        updatedUser.level += 1;
        setLastLevelUpType('HUNTER');
        setShowLevelUp(true);
      }

      // 2. Atualizar XP da Arte Marcial Ativa
      if (updatedUser.martialArt !== MartialArt.NONE) {
        const currentArt = updatedUser.martialArt;
        const progress = { ...updatedUser.martialProgress[currentArt] };
        
        progress.xp += amount; // Ganha a mesma quantidade de XP na arte
        const artXpToNext = progress.level * 80; // Nível de arte sobe um pouco mais rápido
        
        if (progress.xp >= artXpToNext) {
          progress.xp -= artXpToNext;
          progress.level += 1;
          setLastLevelUpType('MARTIAL');
          setShowLevelUp(true);
        }
        
        updatedUser.martialProgress = {
          ...updatedUser.martialProgress,
          [currentArt]: progress
        };
      }

      // 3. Atualizar Stats
      const statGain = 0.5;
      if (statType === 'STR') updatedUser.stats.str += statGain;
      if (statType === 'AGI') updatedUser.stats.agi += statGain;
      if (statType === 'VIT') updatedUser.stats.vit += statGain;

      localStorage.setItem('solo_leveling_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const updateMartialArt = (art: MartialArt) => {
    if (!userData) return;
    const updated = { ...userData, martialArt: art };
    setUserData(updated);
    localStorage.setItem('solo_leveling_user', JSON.stringify(updated));
    setQuests([]); 
  };

  if (!userData) {
    return !isAwakening ? <SystemIntro onStart={() => setIsAwakening(true)} /> : <OnboardingForm onSubmit={handleAwaken} />;
  }

  if (!currentLocation) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-[400]">
        <div className="system-bg system-border p-8 rounded-lg max-w-lg w-full text-center space-y-10">
          <h2 className="text-2xl font-system text-blue-400 uppercase tracking-widest system-glow">ONDE VOCÊ IRÁ TREINAR?</h2>
          <div className="grid grid-cols-1 gap-4">
            {Object.values(TrainingLocation).map(loc => (
              <button key={loc} onClick={() => setCurrentLocation(loc)} className="p-4 border border-blue-900/40 hover:border-blue-500 rounded bg-slate-900/50 text-white font-system uppercase text-xs">
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentArtProgress = userData.martialProgress[userData.martialArt] || { level: 1, xp: 0 };
  const artXpPercent = (currentArtProgress.xp / (currentArtProgress.level * 80)) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR ESQUERDA: SHADOW DOJO */}
      <aside className="w-full md:w-80 bg-slate-900/80 border-r border-blue-900/30 p-6 space-y-8 overflow-y-auto">
        <div className="border-b border-blue-900/50 pb-4">
            <h2 className="text-blue-400 font-system text-lg font-bold tracking-widest system-glow">SHADOW DOJO</h2>
            <p className="text-slate-500 text-[10px] uppercase font-mono tracking-tighter">Maestria em Artes Marciais</p>
        </div>

        <div className="space-y-4">
            <label className="text-slate-400 text-[10px] uppercase font-system block">Estilo Atual</label>
            <select 
                value={userData.martialArt}
                onChange={(e) => updateMartialArt(e.target.value as MartialArt)}
                className="w-full bg-slate-950 border border-blue-900/50 p-3 text-white font-system text-[10px] uppercase outline-none focus:border-blue-500"
            >
                {Object.values(MartialArt).map(art => <option key={art} value={art}>{art}</option>)}
            </select>
        </div>

        {userData.martialArt !== MartialArt.NONE && (
            <div className="space-y-6">
                <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded relative overflow-hidden">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-system text-blue-400 uppercase">Proficiência Técnica</span>
                        <span className="text-xl font-system text-white font-bold">NV. {currentArtProgress.level}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${artXpPercent}%` }}></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-white font-system text-xs uppercase border-l-2 border-blue-500 pl-2">Ensino do Sistema</h3>
                    <div className="space-y-3">
                        {drills.length === 0 ? (
                            <div className="p-4 text-center text-[10px] text-slate-500 font-mono animate-pulse">SOLICITANDO DRILS...</div>
                        ) : drills.map((drill, i) => (
                            <div key={i} className={`p-3 rounded border ${drill.isPhysical ? 'border-orange-900/30 bg-orange-900/5' : 'border-blue-900/30 bg-blue-900/5'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-white font-system text-[9px] uppercase tracking-wide">{drill.title}</span>
                                    <span className={`text-[7px] px-1 rounded ${drill.isPhysical ? 'bg-orange-900/40 text-orange-400' : 'bg-blue-900/40 text-blue-400'}`}>{drill.isPhysical ? 'CORPO' : 'TÉCNICA'}</span>
                                </div>
                                <p className="text-slate-400 text-[10px] leading-tight mb-2">{drill.description}</p>
                                <span className="text-blue-400 font-mono text-[9px]">{drill.reps}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto pb-32">
        <header className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-4xl font-system font-black text-blue-500 tracking-[0.2em] system-glow">O SISTEMA</h1>
            <div className="flex gap-4 mt-2">
                <span className="text-slate-400 text-[10px] uppercase font-system tracking-widest">HUNTER NÍVEL {userData.level}</span>
                <span className="text-blue-500 text-[10px] uppercase font-system tracking-widest">{currentLocation}</span>
            </div>
          </div>
          
          <nav className="flex gap-4 bg-slate-900 p-1 rounded border border-blue-900/30">
            <button onClick={() => setActiveTab('QUESTS')} className={`px-6 py-2 font-system text-[10px] uppercase transition-all ${activeTab === 'QUESTS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}>Treinamento</button>
            <button onClick={() => setActiveTab('SURVIVAL')} className={`px-6 py-2 font-system text-[10px] uppercase transition-all ${activeTab === 'SURVIVAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}>Saúde</button>
            <button onClick={() => setCurrentLocation(null)} className="px-6 py-2 font-system text-[10px] uppercase text-red-500 hover:bg-red-950/30">Mudar Dungeon</button>
          </nav>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
                <StatusWindow userData={userData} />
            </div>

            <div className="xl:col-span-2 space-y-6">
                {loading ? (
                    <div className="p-20 text-center font-system text-blue-400 animate-pulse">[SISTEMA]: SINCRONIZANDO DADOS DA DUNGEON...</div>
                ) : activeTab === 'QUESTS' ? (
                    <DailyQuests 
                        quests={quests} 
                        onComplete={handleCompleteQuest} 
                        onRefresh={() => loadMainContent()} 
                        isLoading={false} 
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="border-b border-blue-900/30 pb-2">
                            <h2 className="text-xl font-system text-white uppercase tracking-widest">Guia de Vitalidade</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {healthTips.map((tip, i) => (
                                <div key={i} className="p-5 system-bg border border-blue-900/30 rounded-lg group hover:border-blue-500 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[9px] font-system text-blue-400 uppercase tracking-widest">{tip.category}</span>
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded ${tip.importance === 'CRÍTICA' ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'}`}>{tip.importance}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 italic leading-relaxed">"{tip.content}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>

      {showLevelUp && (
        <LevelUpModal 
            level={lastLevelUpType === 'HUNTER' ? userData.level : userData.martialProgress[userData.martialArt].level} 
            onClose={() => setShowLevelUp(false)} 
        />
      )}
    </div>
  );
};

export default App;
