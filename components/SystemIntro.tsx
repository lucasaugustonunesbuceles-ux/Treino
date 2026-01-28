
import React, { useState, useEffect } from 'react';

interface Props {
  onStart: () => void;
}

const SystemIntro: React.FC<Props> = ({ onStart }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = [
    "[AVISO]: VOCÊ FOI SELECIONADO COMO UM JOGADOR.",
    "BEM-VINDO AO SISTEMA DE TREINAMENTO.",
    "DADOS CORPORAIS SERÃO ANALISADOS.",
    "O NÃO CUMPRIMENTO DAS DIRETRIZES PODE RESULTAR EM PENALIDADES.",
    "VOCÊ DESEJA DESPERTAR?"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines(prev => (prev < lines.length ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 z-50">
      <div className="scanline"></div>
      <div className="max-w-xl w-full space-y-8 relative">
        <div className="flex justify-center mb-8">
            <div className="w-24 h-24 border-4 border-blue-500 rounded-full animate-ping opacity-25 absolute"></div>
            <div className="w-24 h-24 border-2 border-blue-500 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-blue-500 font-system text-3xl font-black">!</span>
                </div>
            </div>
        </div>

        <div className="space-y-4 font-system">
          {lines.map((line, idx) => (
            <p 
              key={idx} 
              className={`text-center transition-all duration-1000 transform ${idx < visibleLines ? 'opacity-100 translate-y-0 text-blue-300' : 'opacity-0 translate-y-4 text-transparent'}`}
              style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
            >
              {line}
            </p>
          ))}
        </div>

        {visibleLines >= lines.length && (
          <div className="flex justify-center mt-12 animate-pulse">
            <button 
              onClick={onStart}
              className="px-12 py-4 border-2 border-blue-500 text-blue-500 font-system font-bold tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all duration-300 rounded-sm uppercase"
            >
              SIM, EU DESEJO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemIntro;
