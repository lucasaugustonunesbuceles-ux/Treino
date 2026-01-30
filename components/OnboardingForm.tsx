
import React, { useState } from 'react';
import { UserData, Difficulty, MartialArt } from '../types';

interface Props {
  onSubmit: (data: Partial<UserData>) => void;
}

const OnboardingForm: React.FC<Props> = ({ onSubmit }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Masculino',
    age: 24,
    height: 175,
    weight: 75,
    dailyGoal: 'Ganho de Massa',
    difficulty: Difficulty.NORMAL,
    martialArt: MartialArt.NONE
  });

  const steps = [
    { label: "Nome do Caçador", key: "name", type: "text" },
    { label: "Idade", key: "age", type: "number" },
    { label: "Altura (cm)", key: "height", type: "number" },
    { label: "Peso (kg)", key: "weight", type: "number" },
    { label: "Meta Diária", key: "dailyGoal", type: "select", options: ["Emagrecer", "Ganho de Massa", "Resistência", "Saúde"] },
    { label: "Herança de Combate", key: "martialArt", type: "select", options: Object.values(MartialArt) },
    { label: "Dificuldade do Sistema", key: "difficulty", type: "difficulty" }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else onSubmit(formData);
  };

  const renderInput = () => {
    const s = steps[step];
    if (s.type === "select") {
      return (
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
          {s.options?.map(opt => (
            <button key={opt} onClick={() => setFormData({...formData, [s.key]: opt})} className={`p-3 border text-[10px] font-system uppercase transition-all ${formData[s.key as keyof typeof formData] === opt ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-blue-900/40 text-slate-400'}`}>{opt}</button>
          ))}
        </div>
      );
    }
    if (s.type === "difficulty") {
      return (
        <div className="space-y-2">
          {Object.values(Difficulty).map(d => (
            <button key={d} onClick={() => setFormData({...formData, difficulty: d})} className={`w-full p-4 border text-left font-system text-xs ${formData.difficulty === d ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-blue-900/40 text-slate-400'}`}>
                {d.toUpperCase()}
            </button>
          ))}
        </div>
      );
    }
    return (
      <input autoFocus type={s.type} className="w-full bg-slate-900 border border-blue-900/50 p-4 text-white font-system focus:border-blue-500 outline-none" value={(formData as any)[s.key]} onChange={e => setFormData({...formData, [s.key]: s.type === 'number' ? parseFloat(e.target.value) : e.target.value})} onKeyDown={e => e.key === 'Enter' && handleNext()} />
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="system-bg system-border p-8 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-system text-blue-400 mb-8 border-b border-blue-900/50 pb-2 uppercase tracking-widest">Sincronização de Hunter</h2>
        <div className="space-y-6">
          <div>
            <label className="text-slate-500 text-[10px] uppercase font-system tracking-widest block mb-4">{steps[step].label}</label>
            {renderInput()}
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-1">{steps.map((_, i) => <div key={i} className={`h-1 w-3 rounded-full ${i <= step ? 'bg-blue-500' : 'bg-slate-800'}`}></div>)}</div>
            <button onClick={handleNext} className="px-8 py-2 bg-blue-600 text-white font-system text-xs font-bold hover:bg-blue-500 transition-all uppercase tracking-widest">
              {step === steps.length - 1 ? "Despertar" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
