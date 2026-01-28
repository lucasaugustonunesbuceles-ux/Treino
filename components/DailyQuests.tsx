
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
  const completedCount = quests.filter(q => q.completed).length;
  const progress = quests.length > 0 ? (completedCount / quests.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-system text-white uppercase tracking-widest">Missão Diária</h2>
          <div className="flex flex-col mt-1">
            <p className="text-blue-400 text-[10px] font-system uppercase tracking-wider">Informação do Sistema:</p>
            <p className="text-slate-500 text-[11px] max-w-md leading-tight">
              Clique em <span className="text-blue-300 font-bold">"COMO EXECUTAR?"</span> para ver o guia técnico de cada movimento. Complete todas para evitar penalidades.
            </p>
          </div>
        </div>
        <div className="text-right w-full md:w-auto">
            <div className="flex justify-between md:justify-end gap-4 mb-1">
                <span className="text-slate-500 text-[10px] font-system uppercase">Progresso da Quest</span>
                <span className="text-blue-400 font-system text-sm font-bold">{completedCount}/{quests.length}</span>
            </div>
            <div className="w-full md:w-48 h-1 bg-slate-900 rounded-full overflow-hidden border border-blue-900/20">
                <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      </div>

      {isLoading ? (
        <div className="system-bg system-border p-12 rounded-lg flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="font-system text-blue-300 animate-pulse uppercase text-sm">Sincronizando com a Vontade do Sistema...</p>
        </div>
      ) : quests.length === 0 ? (
        <div className="system-bg system-border p-8 rounded-lg text-center">
            <p className="text-slate-400 font-system mb-4">Nenhuma quest ativa no momento.</p>
            <button 
                onClick={onRefresh}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-system text-xs font-bold rounded shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
            >
                REQUISITAR MISSÕES
            </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {quests.map((quest) => (
            <div 
              key={quest.id}
              className={`group transition-all duration-300 rounded-lg p-5 border ${quest.completed ? 'bg-blue-900/5 border-blue-500/20 opacity-70' : 'bg-slate-900/50 border-blue-900/30 hover:border-blue-500/50 shadow-sm'}`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-start w-full">
                  <div className={`mt-1 w-12 h-12 shrink-0 rounded flex items-center justify-center font-system font-bold text-xs ${
                      quest.type === 'STR' ? 'bg-red-900/20 text-red-500 border border-red-900/30' :
                      quest.type === 'AGI' ? 'bg-green-900/20 text-green-500 border border-green-900/30' :
                      'bg-blue-900/20 text-blue-500 border border-blue-900/30'
                  }`}>
                      {quest.type}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-system text-sm font-bold tracking-wide uppercase ${quest.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {quest.title}
                    </h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-md">{quest.description}</p>
                    <div className="flex flex-wrap gap-3 mt-3 items-center">
                      <span className="text-[10px] font-mono text-blue-400/80 bg-blue-900/10 px-2 py-0.5 border border-blue-900/30 rounded-sm uppercase tracking-tighter">{quest.sets} SÉRIES</span>
                      <span className="text-[10px] font-mono text-blue-400/80 bg-blue-900/10 px-2 py-0.5 border border-blue-900/30 rounded-sm uppercase tracking-tighter">{quest.reps} REPS</span>
                      <button 
                        onClick={() => setSelectedQuest(quest)}
                        className="text-[10px] font-system font-bold text-blue-300 hover:text-white underline decoration-blue-500/50 underline-offset-4 flex items-center gap-1 transition-colors"
                      >
                        <span className="text-[8px]">●</span> COMO EXECUTAR?
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 border-blue-900/10 pt-4 md:pt-0">
                  <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-system block uppercase tracking-tighter">Reward</span>
                      <span className="text-blue-400 font-system text-xs font-bold">+{quest.xpReward} XP</span>
                  </div>
                  <button
                    disabled={quest.completed}
                    onClick={() => onComplete(quest.id)}
                    className={`px-6 py-2 rounded-sm font-system text-[10px] font-black transition-all ${
                      quest.completed 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40 shadow-blue-500/20 shadow-md active:scale-95'
                    }`}
                  >
                    {quest.completed ? 'COMPLETA' : 'CONCLUIR'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-4">
             <button 
                onClick={onRefresh}
                className="text-slate-600 hover:text-blue-400 text-[10px] font-system uppercase tracking-[0.2em] transition-colors"
             >
                Resetar Missões Diárias
             </button>
          </div>
        </div>
      )}

      {/* Quest Details Modal */}
      {selectedQuest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
          <div className="system-bg system-border p-8 rounded-lg max-w-lg w-full space-y-6 relative overflow-hidden border-2">
            <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none rotate-12">
                <span className="text-9xl font-system font-black text-blue-500">{selectedQuest.type}</span>
            </div>
            
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <span className="text-blue-500 font-system text-[10px] font-bold tracking-widest uppercase block mb-1">Diretriz Técnica</span>
                    <h3 className="text-2xl font-system font-bold text-white uppercase tracking-widest">{selectedQuest.title}</h3>
                </div>
                <button 
                    onClick={() => setSelectedQuest(null)} 
                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-all text-2xl"
                >
                    ×
                </button>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="p-5 bg-slate-950/80 border border-blue-900/40 rounded shadow-inner font-mono text-xs leading-relaxed text-blue-100/90 max-h-[40vh] overflow-y-auto custom-scrollbar">
                    <p className="mb-3 text-blue-400 font-system font-bold uppercase text-[10px] tracking-widest border-b border-blue-900/30 pb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        Relatório de Execução
                    </p>
                    <div className="whitespace-pre-wrap">
                        {selectedQuest.instructions || "O Sistema recomenda foco total na execução. Mantenha a postura rígida e a respiração controlada durante toda a amplitude do movimento."}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded text-center">
                        <span className="block text-[10px] text-slate-500 font-system uppercase tracking-tighter mb-1">Sets Sugeridos</span>
                        <span className="text-xl font-system text-white font-black">{selectedQuest.sets}</span>
                    </div>
                    <div className="p-4 bg-blue-950/20 border border-blue-900/30 rounded text-center">
                        <span className="block text-[10px] text-slate-500 font-system uppercase tracking-tighter mb-1">Volume de Reps</span>
                        <span className="text-xl font-system text-white font-black">{selectedQuest.reps}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setSelectedQuest(null)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-system font-bold text-xs uppercase transition-all tracking-[0.3em] shadow-lg shadow-blue-500/20 active:scale-95"
            >
                FECHAR DIRETRIZ
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8 bg-red-950/30 border border-red-900/40 p-4 rounded text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-red-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
        <p className="text-red-500 font-system text-[10px] uppercase tracking-[0.2em] font-black animate-pulse flex items-center justify-center gap-2">
            <span className="text-lg">⚠</span> [ALERTA DO SISTEMA]: A PROGRESSÃO É LENTA. A PERSISTÊNCIA É SUA ÚNICA ARMA. <span className="text-lg">⚠</span>
        </p>
      </div>
    </div>
  );
};

export default DailyQuests;
