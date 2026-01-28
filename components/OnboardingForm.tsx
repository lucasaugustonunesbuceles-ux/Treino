
import React, { useState } from 'react';
import { UserData, Difficulty } from '../types';

interface Props {
  onSubmit: (data: Partial<UserData>) => void;
}

const OnboardingForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: 24,
    height: 175,
    weight: 75,
    gender: 'Masculino',
    dailyGoal: 'Ganho de Massa',
    difficulty: Difficulty.NORMAL
  });

  const [step, setStep] = useState(0);

  const steps = [
    { label: "Qual seu codinome de Caçador?", key: "name", type: "text", placeholder: "Sung Jin-Woo..." },
    { label: "Qual seu gênero?", key: "gender", type: "select", options: ["Masculino", "Feminino", "Outro"] },
    { label: "Qual sua idade?", key: "age", type: "number", placeholder: "Ex: 24" },
    { label: "Qual sua altura (cm)?", key: "height", type: "number", placeholder: "Ex: 180" },
    { label: "Qual seu peso (kg)?", key: "weight", type: "number", placeholder: "Ex: 75" },
    { label: "Qual sua meta diária?", key: "dailyGoal", type: "select", options: ["Perda de Peso", "Ganho de Massa", "Resistência", "Definição"] },
    { 
      label: "Selecione o Nível de Dificuldade", 
      key: "difficulty", 
      type: "difficulty", 
      options: [Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD, Difficulty.HELL] 
    }
  ];

  const validateCurrentStep = () => {
    const currentKey = steps[step].key;
    const value = (formData as any)[currentKey];
    if (typeof value === 'string' && value.trim() === '') return false;
    if (typeof value === 'number' && (isNaN(value) || value <= 0)) return false;
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step < steps.length - 1) {
        setStep(prev => prev + 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === steps.length - 1) {
      if (validateCurrentStep()) {
        onSubmit(formData);
      }
    } else {
      handleNext();
    }
  };

  const renderInput = () => {
    const current = steps[step];
    
    if (current.type === "select") {
      return (
        <div className="grid grid-cols-1 gap-2">
          {current.options?.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, [current.key]: opt }))}
              className={`p-4 font-system text-xs text-left border transition-all ${
                (formData as any)[current.key] === opt 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                : 'bg-slate-900 border-blue-900/50 text-slate-400 hover:border-blue-500'
              }`}
            >
              {opt.toUpperCase()}
            </button>
          ))}
        </div>
      );
    }

    if (current.type === "difficulty") {
      return (
        <div className="grid grid-cols-1 gap-3">
          {current.options?.map(opt => {
            let colorClass = "border-blue-900/50 text-slate-400";
            let activeClass = "bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]";
            let warning = "";

            if (opt === Difficulty.EASY) {
                activeClass = "bg-green-600 border-green-400 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]";
            } else if (opt === Difficulty.HARD) {
                activeClass = "bg-orange-600 border-orange-400 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]";
            } else if (opt === Difficulty.HELL) {
                activeClass = "bg-red-700 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse";
                warning = "ALTO RISCO DE PENALIDADE";
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, [current.key]: opt }))}
                className={`p-4 font-system text-left border transition-all relative overflow-hidden group ${
                  (formData as any)[current.key] === opt ? activeClass : colorClass + " hover:border-blue-500 bg-slate-900"
                }`}
              >
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold tracking-widest">{opt.toUpperCase()}</span>
                    {opt === Difficulty.HELL && <span className="text-[8px] text-red-200 font-black animate-pulse">{warning}</span>}
                </div>
                <div className="text-[9px] mt-1 opacity-60 font-mono">
                    {opt === Difficulty.EASY && "Recompensas reduzidas, foco em adaptação."}
                    {opt === Difficulty.NORMAL && "O caminho padrão para o crescimento."}
                    {opt === Difficulty.HARD && "Recompensas aumentadas. Exige disciplina."}
                    {opt === Difficulty.HELL && "XP MÁXIMO. Apenas para aqueles que não temem a morte."}
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <input 
        autoFocus
        type={current.type}
        className="w-full bg-slate-900 border border-blue-900/50 p-4 text-white font-system focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-700"
        placeholder={current.placeholder}
        value={(formData as any)[current.key]}
        onChange={(e) => {
          const val = current.type === 'number' ? parseFloat(e.target.value) : e.target.value;
          setFormData(prev => ({ ...prev, [current.key]: val }));
        }}
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleNext();
            }
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="system-bg system-border p-8 rounded-lg max-w-md w-full relative">
        <div className="absolute top-0 right-0 p-2 text-[10px] text-blue-500/50 font-system">SYST-AUTH-V3</div>
        
        <h2 className="text-xl font-system text-blue-400 mb-8 border-b border-blue-900/50 pb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 animate-pulse"></span>
            CONFIGURAÇÃO DO JOGADOR
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-slate-400 text-[10px] uppercase font-system tracking-widest block opacity-70">{steps[step].label}</label>
            {renderInput()}
          </div>

          <div className="flex justify-between items-center pt-4">
             <div className="flex gap-1">
                {steps.map((_, i) => (
                    <div key={i} className={`h-1 w-3 rounded-full transition-all duration-300 ${i <= step ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]' : 'bg-slate-800'}`}></div>
                ))}
             </div>
             
             {step < steps.length - 1 ? (
               <button 
                type="button"
                onClick={handleNext}
                disabled={!validateCurrentStep()}
                className={`px-6 py-2 font-system text-xs font-bold rounded-sm transition-all shadow-lg ${
                  validateCurrentStep() ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
               >
                 PRÓXIMO
               </button>
             ) : (
               <button 
                type="button"
                onClick={handleSubmit}
                disabled={!validateCurrentStep()}
                className={`px-6 py-2 font-system text-xs font-bold rounded-sm transition-all system-glow ${
                  validateCurrentStep() ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
               >
                 INICIAR DESPERTAR
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
