
import React, { useState, useEffect, useCallback } from 'react';
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
      if (!parsed || !parsed.name) return null;
      return parsed as UserData;
    } catch (e) { return null; }
  });

  const [activeTab, setActiveTab] = useState<ContentTab>('QUESTS');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [healthTips, setHealthTips] = useState<HealthTip[]>([]);
  const [drills, setDrills] = useState<MartialDrill[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAwakening, setIsAwakening] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState({ level: 1, type: 'HUNTER' as 'HUNTER' | 'MARTIAL', name: '' });

  // Função de Cache para evitar lentidão
  const getCachedData = (key: string) => {
    const cached = localStorage.getItem(`cache_${key}`);
    if (cached) return JSON.parse(cached);
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    localStorage.setItem(`cache_${key}`, JSON.stringify(data));
  };

  const loadMainContent = useCallback(async (forceRefresh = false) => {
    if (!userData || !userData.preferredLocation) return;
    
    const cacheKey = `${activeTab}_${userData.preferredLocation}_${userData.difficulty}`;
    const cached = getCachedData(cacheKey);

    if (cached && !forceRefresh) {
      if (activeTab === 'QUESTS') setQuests(cached);
      else setHealthTips(cached);
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'QUESTS') {
        const q = await generateDailyQuests(userData, userData.preferredLocation);
        setQuests(q || []);
        setCachedData(cacheKey, q);
      } else {
        const tips = await generateSurvivalGuide(userData);
        setHealthTips(tips || []);
        setCachedData(cacheKey, tips);
      }
    } catch (err) {
      console.error("[SISTEMA]: Erro de rede.");
    } finally {
      setLoading(false);
    }
  }, [userData?.preferredLocation, userData?.difficulty, activeTab]);

  const loadDojoContent = useCallback(async (forceRefresh = false) => {
    if (!userData || userData.martialArt === MartialArt.NONE) return;
    
    const cacheKey = `drills_${userData.martialArt}`;
    const cached = getCachedData(cacheKey);

    if (cached && !forceRefresh) {
      setDrills(cached);
      return;
    }

    try {
      const d = await generateMartialDrills(userData);
      setDrills(d || []);
      setCachedData(cacheKey, d);
    } catch (err) {
      console.error("[SISTEMA]: Erro no Dojo.");
    }
  }, [userData?.martialArt]);

  useEffect(() => { loadMainContent(); }, [loadMainContent]);
  useEffect(() => { loadDojoContent(); }, [loadDojoContent]);

  const handleUpdateLocation = (loc: TrainingLocation) => {
    setUserData(prev => {
      if (!prev) return null;
      const updated = { ...prev, preferredLocation: loc };
      localStorage.setItem('solo_leveling_user', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateDifficulty = (diff: Difficulty) => {
    setUserData(prev => {
      if (!prev) return null;
      const updated = { ...prev, difficulty: diff };
      localStorage.setItem('solo_leveling_user', JSON.stringify(updated));
      return updated;
    });
    setShowDifficultyModal(false);
  };

  const handleUpdateMartialArt = (art: MartialArt) => {
    setUserData(prev => {
      if (!prev) return null;
      const updated = { ...prev, martialArt: art };
      localStorage.setItem('solo_leveling_user', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAwaken = (data: Partial<UserData>) => {
    const initialMartialProgress: any = {};
    Object.values(MartialArt).forEach(art => { initialMartialProgress[art] = { level: 1, xp: 0 }; });

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
      martialArt: (data.martialArt as MartialArt) || MartialArt.NONE,
      martialProgress: initialMartialProgress
    };
    
    setUserData(newUser);
    localStorage.setItem('solo_leveling_user', JSON.stringify(newUser));
    setIsAwakening(false);
  };

  const handleCompleteQuest = (questId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && !q.completed) {
        handleGainXp(q.xpReward, q.type);
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  const handleGainXp = (amount: number, statType: string) => {
    setUserData(prev => {
      if (!prev) return null;
      let updatedUser = { ...prev };
      
      updatedUser.xp += amount;
      const xpReq = updatedUser.level * 100;
      if (updatedUser.xp >= xpReq) {
        updatedUser.xp -= xpReq;
        updatedUser.level += 1;
        setLevelUpData({ level: updatedUser.level, type: 'HUNTER', name: '' });
        setShowLevelUp(true);
        // Atualiza Rank baseado no nível
        if (updatedUser.level >= 10) updatedUser.rank = Rank.D;
        if (updatedUser.level >= 30) updatedUser.rank = Rank.C;
        if (updatedUser.level >= 50) updatedUser.rank = Rank.B;
        if (updatedUser.level >= 80) updatedUser.rank = Rank.A;
        if (updatedUser.level >= 100) updatedUser.rank = Rank.S;
      }

      if (updatedUser.martialArt !== MartialArt.NONE) {
        const art = updatedUser.martialArt;
        const prog = { ...(updatedUser.martialProgress[art] || { level: 1, xp: 0 }) };
        prog.xp += amount;
        const artXpReq = prog.level * 80;
        if (prog.xp >= artXpReq) {
          prog.xp -= artXpReq;
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

  const artProg = userData.martialProgress?.[userData.martialArt] || { level: 1, xp: 0 };
  const artXpPct = (artProg.xp / (artProg.level * 80)) * 100;

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans relative z-10">
      <aside className="w-full md:w-80 bg-slate-900/80 backdrop-blur-xl border-r border-blue-900/30 p-6 space-y-8 overflow-y-auto">
        <div className="border-b border-blue-900/50 pb-4">
            <h2 className="text-blue-400 font-system text-lg font-bold tracking-widest system-glow">SHADOW DOJO</h2>
        </div>

        {userData.martialArt === MartialArt.NONE ? (
          <div className="p-4 bg-slate-950 border border-dashed border-blue-900/50 rounded text-center space-y-4">
            <p className="text-[10px] font-system text-slate-500 uppercase">Estilo de Combate não despertado.</p>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(MartialArt).filter(a => a !== MartialArt.NONE).map(art => (
                <button key={art} onClick={() => handleUpdateMartialArt(art)} className="py-2 px-3 border border-blue-900/30 hover:border-blue-500 text-[9px] font-system text-blue-400 uppercase transition-all hover:bg-blue-500/10">
                  Despertar {art}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
              <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded relative overflow-hidden group">
                  <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-[9px] font-system text-blue-500/60 uppercase block">ESTILO ATIVO</span>
                        <span className="text-xs font-system text-blue-400 uppercase font-bold">{userData.martialArt}</span>
                      </div>
                      <span className="text-xl font-system text-white font-bold">NV. {artProg.level}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${artXpPct}%` }}></div>
                  </div>
                  <button onClick={() => handleUpdateMartialArt(MartialArt.NONE)} className="mt-4 w-full text-[8px] font-system text-slate-600 hover:text-red-400 uppercase transition-colors">Abandonar Estilo</button>
              </div>
              <div className="space-y-3">
                  <h3 className="text-[10px] font-system text-blue-500 font-bold uppercase tracking-widest border-l-2 border-blue-500 pl-2">Treinos Técnicos</h3>
                  {drills.map((drill, i) => (
                      <div key={i} className="p-3 rounded border border-blue-900/30 bg-blue-900/5 hover:border-blue-500/50 transition-colors">
                          <h4 className="text-white font-system text-[9px] uppercase tracking-wider">{drill.title}</h4>
                          <p className="text-slate-400 text-[10px] leading-tight mt-1">{drill.description}</p>
                      </div>
                  ))}
                  {drills.length === 0 && <p className="text-slate-600 text-[10px] uppercase font-system italic animate-pulse text-center py-4">Sincronizando com as sombras...</p>}
              </div>
          </div>
        )}
      </aside>

      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto pb-32">
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-system font-black text-blue-500 tracking-[0.2em] system-glow">O SISTEMA</h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-slate-400 text-[10px] uppercase font-system tracking-widest">HUNTER {userData.rank}-CLASS | NV. {userData.level}</p>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-blue-500/60 text-[10px] font-system uppercase">{userData.difficulty}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className="text-[9px] font-system text-blue-500/60 uppercase tracking-widest">ALTERAR DUNGEON</span>
              <div className="flex gap-2 bg-slate-900 p-1 rounded border border-blue-900/30">
                {Object.values(TrainingLocation).map(loc => (
                  <button 
                    key={loc} 
                    onClick={() => handleUpdateLocation(loc)}
                    className={`px-4 py-2 text-[9px] font-system uppercase transition-all rounded-sm ${userData.preferredLocation === loc ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <nav className="flex gap-4 border-b border-blue-900/30 pb-4">
            <button onClick={() => setActiveTab('QUESTS')} className={`pb-2 px-4 font-system text-[10px] uppercase transition-all border-b-2 ${activeTab === 'QUESTS' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500'}`}>Treinamento</button>
            <button onClick={() => setActiveTab('SURVIVAL')} className={`pb-2 px-4 font-system text-[10px] uppercase transition-all border-b-2 ${activeTab === 'SURVIVAL' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500'}`}>Guia de Saúde</button>
          </nav>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
                <StatusWindow userData={userData} onEditDifficulty={() => setShowDifficultyModal(true)} />
            </div>
            <div className="xl:col-span-2 space-y-6">
                {loading ? (
                    <div className="p-24 text-center bg-slate-900/40 rounded-lg border border-blue-900/20 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-system text-blue-400 text-[10px] animate-pulse">[ SINCRONIZANDO DADOS DO SISTEMA... ]</span>
                    </div>
                ) : activeTab === 'QUESTS' ? (
                    <DailyQuests quests={quests} onComplete={handleCompleteQuest} onRefresh={() => loadMainContent(true)} isLoading={false} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {healthTips.map((tip, i) => (
                            <div key={i} className="p-5 bg-slate-900/60 backdrop-blur border border-blue-900/30 rounded-lg hover:border-blue-500/50 transition-all group">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-[9px] font-system text-blue-400 uppercase tracking-widest">{tip.category}</span>
                                  <div className={`w-2 h-2 rounded-full ${tip.importance === 'CRÍTICA' ? 'bg-red-500 animate-ping' : tip.importance === 'ALTA' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                </div>
                                <p className="text-sm text-slate-300 italic leading-relaxed">"{tip.content}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </main>

      {showDifficultyModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="system-bg system-border p-8 rounded-lg max-w-sm w-full space-y-6">
            <h3 className="text-xl font-system text-blue-400 uppercase tracking-widest text-center">Alterar Dificuldade</h3>
            <p className="text-[10px] text-slate-500 font-system text-center uppercase">A dificuldade afeta a intensidade das missões geradas pelo sistema.</p>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(Difficulty).map(diff => (
                <button 
                  key={diff} 
                  onClick={() => handleUpdateDifficulty(diff)}
                  className={`p-4 border font-system text-xs uppercase transition-all ${userData.difficulty === diff ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-blue-900/40 text-slate-400 hover:border-blue-500'}`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <button onClick={() => setShowDifficultyModal(false)} className="w-full py-2 text-slate-600 font-system text-[10px] uppercase hover:text-white transition-colors">Cancelar</button>
          </div>
        </div>
      )}

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
