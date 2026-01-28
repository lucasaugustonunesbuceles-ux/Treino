
import React, { useEffect, useState } from 'react';

interface Props {
  level: number;
  onClose: () => void;
}

const LevelUpModal: React.FC<Props> = ({ level, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
    audio.play().catch(() => {}); // Silence errors if browser blocks autoplay
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="system-bg system-border p-12 rounded-lg text-center max-w-sm w-full relative overflow-hidden transform transition-transform duration-500 scale-100">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
        </div>
        
        <h2 className="text-5xl font-system font-black text-blue-500 system-glow mb-4 animate-bounce">LEVEL UP!</h2>
        <div className="w-px h-12 bg-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400 font-system text-xs uppercase mb-1">Nível Atualizado</p>
        <p className="text-6xl font-system font-bold text-white mb-8">{level}</p>
        
        <p className="text-blue-200 font-system text-sm mb-12 leading-relaxed">
            Seus limites foram superados. O Sistema reconhece seu crescimento.
        </p>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-system font-bold rounded tracking-[0.2em] transition-all system-glow"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
