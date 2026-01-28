
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
    <div className="space-y-6">
      <div className="flex flex-col border-b border-blue-900/30 pb-4">
        <h2 className="text-2xl font-system text-white uppercase tracking-widest">Missões Diárias</h2>
        <p className="text-slate-500 text-[11px] mt-1 italic">Dica: Clique em "VER INSTRUÇÕES" para entender a execução perfeita.</p>
      </div>

      {isLoading ? (
        <div className="p-20 text-center font-system text-blue-400 animate-pulse border border-blue-900/20 rounded-lg">
          [SISTEMA]: ANALISANDO DADOS CORPORAIS...
        </div>
      ) : quests.length === 0 ? (
        <div className="p-10 text-center font-system text-red-400 border border-red-900/20 rounded-lg bg-red-900/5">
          [ERRO]: FALHA NA COMUNICAÇÃO COM O SISTEMA.
          <button onClick={onRefresh} className="block mx-auto mt-4 text-[10px] underline hover:text-white">RECONECTAR</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quests.map(q => (
            <div key={q.id} className={`p-5 border rounded-lg transition-all ${q.completed ? 'opacity-50 border-blue-900/20 bg-blue-900/5' : 'bg-slate-900/50 border-blue-900/40 hover:border-blue-500/50'}`}>
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${q.type === 'STR' ? 'bg-red-900/30 text-red-500' : q.type === 'AGI' ? 'bg-green-900/30 text-green-500' : 'bg-blue-900/30 text-blue-500'}`}>{q.type}</span>
                    <h4 className="font-system text-sm text-white uppercase">{q.title}</h4>
                  </div>
                  <p className="text-slate-500 text-xs">{q.sets} séries x {q.reps} reps</p>
                  <button onClick={() => setSelectedQuest(q)} className="text-[10px] text-blue-400 hover:text-white underline mt-2 uppercase font-bold tracking-tighter transition-colors">Ver Instruções Detalhadas</button>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-blue-400 font-system text-xs font-bold">+{q.xpReward} XP</div>
                  <button disabled={q.completed} onClick={() => onComplete(q.id)} className={`mt-2 px-6 py-2 rounded-sm text-[10px] font-black font-system ${q.completed ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/10'}`}>
                    {q.completed ? 'FEITO' : 'CONCLUIR'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedQuest && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
          <div className="system-bg system-border p-8 rounded-lg max-w-lg w-full space-y-6">
            <h3 className="text-xl font-system font-bold text-blue-400 uppercase">{selectedQuest.title} - Guia</h3>
            <div className="p-4 bg-slate-900/80 border border-blue-900/30 rounded font-mono text-xs leading-relaxed text-blue-100">
                <p className="text-blue-500 font-bold mb-2 uppercase">[RELATÓRIO TÉCNICO]</p>
                {selectedQuest.instructions}
            </div>
            <button onClick={() => setSelectedQuest(null)} className="w-full py-4 bg-blue-600 text-white font-system font-bold text-xs uppercase hover:bg-blue-500 shadow-lg shadow-blue-500/20">Entendido</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyQuests;
