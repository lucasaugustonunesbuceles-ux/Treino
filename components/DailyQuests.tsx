
import React, { useState } from 'react';
import { Quest } from '../types';

interface Props {
  quests: Quest[];
  onComplete: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const DailyQuests: React.FC<Props> = ({ quests, onComplete, onRefresh, isLoading }) => {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col border-b border-blue-900/20 pb-2">
        <h2 className="text-xl font-system text-white uppercase tracking-widest">Missões do Dia</h2>
      </div>

      {isLoading ? (
        <div className="p-16 text-center font-system text-blue-400 animate-pulse border border-blue-900/20 rounded-lg">
          [SISTEMA]: SINCRONIZANDO COM A DUNGEON...
        </div>
      ) : quests.length === 0 ? (
        <div className="p-10 text-center font-system text-red-400 border border-red-900/20 rounded-lg bg-red-900/5">
          [ERRO]: NENHUMA MISSÃO ENCONTRADA.
          <button onClick={onRefresh} className="block mx-auto mt-4 text-[10px] underline hover:text-white uppercase font-bold">Gerar Novas Quests</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quests.map(q => (
            <div key={q.id} className={`p-4 border rounded-lg transition-all ${q.completed ? 'opacity-40 border-blue-900/10' : 'bg-slate-900/40 border-blue-900/30 hover:border-blue-400/40'}`}>
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${q.type === 'STR' ? 'bg-red-900/20 text-red-500' : 'bg-blue-900/20 text-blue-400'}`}>{q.type}</span>
                    <h4 className="font-system text-sm text-white uppercase tracking-tight">{q.title}</h4>
                  </div>
                  <p className="text-slate-500 text-xs font-mono">{q.sets} SÉRIES X {q.reps} REPETIÇÕES</p>
                  <button onClick={() => setSelectedQuest(q)} className="text-[9px] text-blue-400 hover:text-white underline mt-2 uppercase font-bold">Ver Técnica</button>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-blue-500 font-system text-[10px] font-bold">+{q.xpReward} XP</div>
                  <button disabled={q.completed} onClick={() => onComplete(q.id)} className={`mt-2 px-5 py-2 rounded-sm text-[9px] font-black font-system ${q.completed ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                    {q.completed ? 'CONCLUÍDO' : 'CONCLUIR'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedQuest && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md">
          <div className="system-bg system-border p-8 rounded-lg max-w-lg w-full space-y-6">
            <h3 className="text-xl font-system font-bold text-blue-400 uppercase tracking-widest">{selectedQuest.title}</h3>
            <div className="p-4 bg-slate-900/80 border border-blue-900/30 rounded font-mono text-xs leading-relaxed text-blue-100 italic">
                {selectedQuest.instructions}
            </div>
            <button onClick={() => setSelectedQuest(null)} className="w-full py-4 bg-blue-600 text-white font-system font-bold text-xs uppercase hover:bg-blue-500">Fechar Janela</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyQuests;
