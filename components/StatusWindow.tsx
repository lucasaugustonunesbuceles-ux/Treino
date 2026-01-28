
import React from 'react';
import { UserData, Difficulty } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface Props {
  userData: UserData;
}

const StatusWindow: React.FC<Props> = ({ userData }) => {
  const chartData = [
    { subject: 'FOR', A: userData.stats.str, fullMark: 150 },
    { subject: 'AGI', A: userData.stats.agi, fullMark: 150 },
    { subject: 'VIT', A: userData.stats.vit, fullMark: 150 },
    { subject: 'INT', A: userData.stats.int, fullMark: 150 },
    { subject: 'SEN', A: userData.stats.sen, fullMark: 150 },
  ];

  const xpPercentage = (userData.xp / (userData.level * 100)) * 100;

  return (
    <div className="system-bg system-border rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-4 border-b border-blue-900/50 pb-4">
        <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden bg-slate-800 p-1">
           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="Avatar" className="w-full h-full object-cover rounded-full grayscale" />
        </div>
        <div>
          <h3 className="font-system text-xl text-white uppercase tracking-wider font-bold">{userData.name}</h3>
          <p className="text-blue-500 text-xs font-mono font-light uppercase tracking-tighter">Hunter ID: #{Math.floor(Math.random() * 900000) + 100000}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-system text-slate-400 font-semibold tracking-wider">
           <span>EXPERIÊNCIA</span>
           <span>{userData.xp.toFixed(0)} / {userData.level * 100} XP</span>
        </div>
        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-blue-900/30">
          <div 
            className="h-full bg-blue-500 transition-all duration-700" 
            style={{ width: `${xpPercentage}%`, boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)' }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/40 p-3 border border-blue-900/20 rounded-sm">
            <span className="text-slate-500 text-[10px] font-system uppercase block mb-1 tracking-tight">Dificuldade</span>
            <span className={`text-lg font-system font-bold ${
                userData.difficulty === Difficulty.HELL ? 'text-red-500 animate-pulse' : 
                userData.difficulty === Difficulty.HARD ? 'text-orange-500' :
                'text-white'
            }`}>{userData.difficulty.toUpperCase()}</span>
        </div>
        <div className="bg-slate-900/40 p-3 border border-blue-900/20 rounded-sm">
            <span className="text-slate-500 text-[10px] font-system uppercase block mb-1 tracking-tight">Títulos</span>
            <span className="text-lg font-system text-blue-400 font-medium">CALOURO</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#60a5fa', fontSize: 10, fontFamily: 'Orbitron', fontWeight: 600 }} />
            <Radar
              name="Stats"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 pt-4 border-t border-blue-900/50">
         <h4 className="text-blue-500 font-system text-[10px] font-bold uppercase tracking-widest">Habilidades Ativas</h4>
         <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-900/20 text-blue-400 text-[10px] font-system font-bold rounded border border-blue-800/50">RESILIÊNCIA Lvl {userData.level}</span>
            <span className="px-2 py-1 bg-slate-800/50 text-slate-500 text-[10px] font-system rounded border border-slate-700 opacity-40">BLOQUEADO</span>
         </div>
      </div>
    </div>
  );
};

export default StatusWindow;
