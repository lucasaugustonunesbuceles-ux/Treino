
import React, { useState, useEffect } from 'react';
import { UserData, Rank, Quest, UserStats, Difficulty } from './types';
import { generateDailyQuests, analyzeBodyComposition } from './services/geminiService';
import SystemIntro from './components/SystemIntro';
import OnboardingForm from './components/OnboardingForm';
import StatusWindow from './components/StatusWindow';
import DailyQuests from './components/DailyQuests';
import LevelUpModal from './components/LevelUpModal';

const INITIAL_STATS: UserStats = {
  str: 10,
  agi: 10,
  vit: 10,
  int: 10,
  sen: 10
};

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('solo_leveling_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('solo_leveling_quests');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      if (parsed.date === today) return parsed.quests;
    }
    return [];
  });

  const [isAwakening, setIsAwakening] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>("");
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  useEffect(() => {
    if (userData) {
      localStorage.setItem('solo_leveling_user', JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    if (quests.length > 0) {
      const today = new Date().toDateString();
      localStorage.setItem('solo_leveling_quests', JSON.stringify({ date: today, quests }));
    }
  }, [quests]);

  const handleAwaken = async (data: Partial<UserData>) => {
    setLoadingQuests(true);
    const newUser: UserData = {
      name: data.name || 'Hunter',
      age: Number(data.age) || 20,
      height: Number(data.height) || 170,
      weight: Number(data.weight) || 70,
      gender: data.gender || 'Masculino',
      dailyGoal: data.dailyGoal || 'Geral',
      difficulty: data.difficulty || Difficulty.NORMAL,
      level: 1,
      xp: 0,
      rank: Rank.E,
      stats: { ...INITIAL_STATS },
      isAwakened: true
    };
    
    try {
      const analysis = await analyzeBodyComposition(newUser);
      setSystemMessage(analysis);
      setUserData(newUser);
      
      const daily = await generateDailyQuests(newUser);
      setQuests(daily);
    } catch (error) {
      console.error("Error during awakening:", error);
      setUserData(newUser); 
    } finally {
      setLoadingQuests(false);
      setIsAwakening(false);
    }
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

  const handleGainXp = (amount: number, type: string) => {
    setUserData(prev => {
      if (!prev) return null;
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newStats = { ...prev.stats };

      const statGain = amount / 200; 
      if (type === 'STR') newStats.str += statGain;
      if (type === 'AGI') newStats.agi += statGain;
      if (type === 'VIT') newStats.vit += statGain;
      newStats.int += 0.1;
      newStats.sen += 0.1;

      const xpToNext = prev.level * 100;
      if (newXp >= xpToNext) {
        newXp -= xpToNext;
        newLevel += 1;
        setShowLevelUp(true);
      }

      let newRank = prev.rank;
      const combatPower = (newStats.str + newStats.agi + newStats.vit + newStats.int + newStats.sen) + (newLevel * 5);
      if (combatPower > 500) newRank = Rank.S;
      else if (combatPower > 300) newRank = Rank.A;
      else if (combatPower > 200) newRank = Rank.B;
      else if (combatPower > 150) newRank = Rank.C;
      else if (combatPower > 100) newRank = Rank.D;

      return { ...prev, xp: newXp, level: newLevel, stats: newStats, rank: newRank };
    });
  };

  const handleResetQuests = async (user = userData) => {
    if (!user) return;
    setLoadingQuests(true);
    try {
      const daily = await generateDailyQuests(user);
      setQuests(daily);
    } finally {
      setLoadingQuests(false);
    }
  };

  const handleChangeDifficulty = async (newDifficulty: Difficulty) => {
    if (!userData) return;
    const updatedUser = { ...userData, difficulty: newDifficulty };
    setUserData(updatedUser);
    setShowDifficultyModal(false);
    setSystemMessage(`Dificuldade alterada para ${newDifficulty.toUpperCase()}. Novas missões serão geradas.`);
    await handleResetQuests(updatedUser);
  };

  if (!userData) {
    if (!isAwakening) {
      return <SystemIntro onStart={() => setIsAwakening(true)} />;
    }
    return <OnboardingForm onSubmit={handleAwaken} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pb-24 overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-blue-900/50 pb-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-system font-bold text-blue-400 tracking-[0.2em] system-glow">
                O SISTEMA
              </h1>
              <button 
                onClick={() => setShowDifficultyModal(true)}
                className={`px-2 py-0.5 text-[9px] font-system font-black border rounded uppercase transition-all hover:scale-105 active:scale-95 ${
                userData.difficulty === Difficulty.HELL ? 'border-red-500 text-red-500 shadow-[0_0_5px_red]' : 
                userData.difficulty === Difficulty.HARD ? 'border-orange-500 text-orange-500' :
                'border-blue-500 text-blue-500'
              }`}>
                MODO: {userData.difficulty} ⚙️
              </button>
            </div>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-medium">Hunter Rank: Ativo</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
                <span className="text-slate-500 text-[10px] block uppercase tracking-tighter">Nível</span>
                <span className="text-3xl font-system text-blue-300 font-bold">{userData.level}</span>
             </div>
             <div className="w-px h-10 bg-blue-900/50"></div>
             <div className="text-right">
                <span className="text-slate-500 text-[10px] block uppercase tracking-tighter">Classe</span>
                <span className="text-3xl font-system text-white font-bold">{userData.rank}-Rank</span>
             </div>
          </div>
        </header>

        {systemMessage && (
            <div className="system-bg system-border p-4 rounded-lg animate-pulse border-l-4 border-l-blue-500">
                <p className="text-blue-200 text-sm font-medium">
                    <span className="font-bold text-blue-400 mr-2 font-system">[SISTEMA]:</span>
                    {systemMessage}
                </p>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <StatusWindow userData={userData} onEditDifficulty={() => setShowDifficultyModal(true)} />
          </div>

          <div className="lg:col-span-2">
            <DailyQuests 
              quests={quests} 
              onComplete={handleCompleteQuest} 
              onRefresh={() => handleResetQuests()}
              isLoading={loadingQuests}
            />
          </div>
        </div>
      </div>

      {showLevelUp && <LevelUpModal level={userData.level} onClose={() => setShowLevelUp(false)} />}
      
      {showDifficultyModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="system-bg system-border p-8 rounded-lg max-w-sm w-full space-y-6">
            <h3 className="text-xl font-system font-bold text-blue-400 uppercase tracking-widest text-center">Alterar Dificuldade</h3>
            <p className="text-slate-400 text-xs text-center font-mono">O Sistema recalibrará suas missões diárias com base na nova escolha.</p>
            <div className="space-y-3">
              {Object.values(Difficulty).map(d => (
                <button 
                  key={d} 
                  onClick={() => handleChangeDifficulty(d)} 
                  className={`w-full p-4 border text-left font-system text-xs transition-all hover:bg-blue-600/20 ${userData.difficulty === d ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 border-blue-900/40 text-slate-400'}`}
                >
                    {d.toUpperCase()} {d === Difficulty.HELL && " [AVISO: PENALIDADES SEVERAS]"}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowDifficultyModal(false)}
              className="w-full py-3 text-slate-500 font-system text-[10px] uppercase hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-950/80 backdrop-blur-md border-t border-blue-900/50 md:hidden flex justify-around items-center z-50">
        <button className="text-blue-400 font-system text-[10px] uppercase hover:text-white transition-colors">Perfil</button>
        <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center -mt-8 bg-slate-900 shadow-lg shadow-blue-500/20">
           <span className="text-white font-system font-bold">{userData.level}</span>
        </div>
        <button className="text-blue-400 font-system text-[10px] uppercase hover:text-white transition-colors">Quests</button>
      </div>
    </div>
  );
};

export default App;
