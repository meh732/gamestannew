import React from 'react';
import { GameMode } from '../../types';
import { Bot, Users, Trophy, Flame, Coins, ShieldCheck, Shuffle } from 'lucide-react';

interface GameModeBannerProps {
  mode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
  onChangeDifficulty?: (diff: 'easy' | 'medium' | 'hard') => void;
  turn?: 'p1' | 'p2';
  p1Name?: string;
  p2Name?: string;
  leaguePrize?: number;
}

export const GameModeBanner: React.FC<GameModeBannerProps> = ({
  mode,
  onChangeMode,
  difficulty = 'medium',
  onChangeDifficulty,
  turn = 'p1',
  p1Name = 'رستم (شما)',
  p2Name = 'سهراب (حریف)',
  leaguePrize = 250,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-amber-500/30 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md font-['Vazirmatn'] text-xs">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-between">
        <button
          onClick={() => onChangeMode('ai')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
            mode === 'ai'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>هوش مصنوعی</span>
        </button>

        <button
          onClick={() => onChangeMode('pvp')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
            mode === 'pvp'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>دو نفره آنلاین</span>
        </button>

        <button
          onClick={() => onChangeMode('league')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
            mode === 'league'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>لیگ شاهنامه</span>
        </button>
      </div>

      {/* Mode-specific context info */}
      <div className="flex items-center gap-3">
        {mode === 'ai' && (
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px]">
            <span className="text-slate-400">سطح ربات:</span>
            {(['easy', 'medium', 'hard'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onChangeDifficulty?.(lvl)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  difficulty === lvl
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl === 'easy' ? 'آسان' : lvl === 'medium' ? 'متوسط' : 'استاد'}
              </button>
            ))}
          </div>
        )}

        {mode === 'pvp' && (
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <span className={turn === 'p1' ? 'text-amber-400 animate-pulse' : 'text-slate-400'}>
              {turn === 'p1' ? `🔹 نوبت ${p1Name}` : p1Name}
            </span>
            <span className="text-slate-600">vs</span>
            <span className={turn === 'p2' ? 'text-rose-400 animate-pulse' : 'text-slate-400'}>
              {turn === 'p2' ? `🔸 نوبت ${p2Name}` : p2Name}
            </span>
          </div>
        )}

        {mode === 'league' && (
          <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30 text-amber-300 font-bold text-[11px]">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>جایزه برد: {leaguePrize} سکه طلا + ۳۵ ELO</span>
          </div>
        )}
      </div>
    </div>
  );
};
