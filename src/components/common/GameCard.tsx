import React from 'react';
import { GameId, GameInfo, GameMode } from '../../types';
import { Bot, Users, Trophy, Star, ChevronLeft, ChevronRight, Swords } from 'lucide-react';

interface GameCardProps {
  game: GameInfo;
  currentIndex: number;
  totalGames: number;
  position: 'center' | 'left' | 'right' | 'hidden';
  onSelectCard: () => void;
  onSelectGame: (gameId: GameId, mode: GameMode) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  currentIndex,
  totalGames,
  position,
  onSelectCard,
  onSelectGame,
  onNext,
  onPrev,
}) => {
  const isCenter = position === 'center';
  const isLeft = position === 'left';
  const isRight = position === 'right';

  // 3D dynamic styling based on position in the CoverFlow carousel
  let transformClass = '';
  let zIndex = 10;
  let opacityClass = 'opacity-100';

  if (isCenter) {
    transformClass = 'translate-x-0 translate-z-0 scale-100 rotate-y-0 shadow-[0_30px_70px_rgba(0,0,0,0.95)]';
    zIndex = 30;
    opacityClass = 'opacity-100';
  } else if (isRight) {
    // In RTL: Right is Next or Previous
    transformClass = 'translate-x-[42%] sm:translate-x-[55%] -translate-z-40 scale-[0.84] -rotate-y-[28deg] shadow-[0_15px_40px_rgba(0,0,0,0.7)]';
    zIndex = 20;
    opacityClass = 'opacity-40 hover:opacity-75 cursor-pointer';
  } else if (isLeft) {
    transformClass = '-translate-x-[42%] sm:-translate-x-[55%] -translate-z-40 scale-[0.84] rotate-y-[28deg] shadow-[0_15px_40px_rgba(0,0,0,0.7)]';
    zIndex = 20;
    opacityClass = 'opacity-40 hover:opacity-75 cursor-pointer';
  } else {
    transformClass = 'scale-50 opacity-0 pointer-events-none';
    zIndex = 0;
    opacityClass = 'opacity-0 pointer-events-none';
  }

  return (
    <div
      onClick={!isCenter ? onSelectCard : undefined}
      className={`absolute inset-0 w-full max-w-[420px] mx-auto rounded-3xl overflow-hidden border-2 transition-all duration-500 ease-out select-none preserve-3d flex flex-col justify-between ${
        isCenter ? 'border-amber-400/80 ring-2 ring-amber-500/30' : 'border-amber-500/20'
      } ${transformClass} ${opacityClass}`}
      style={{ zIndex }}
    >
      {/* Photorealistic Cinematic Game Cover Image Background */}
      <div className="absolute inset-0 bg-slate-950 overflow-hidden">
        {game.heroImage && (
          <img
            src={game.heroImage}
            alt={game.title}
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.8] contrast-[1.1] transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        )}
        {/* Soft Vignette and Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Top Header: Palace Badge & Hero Meta */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between border-b border-amber-500/20 bg-slate-950/75 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/40">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
              {game.heroAvatar}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">{game.heroRole}</div>
            <h3 className="text-sm sm:text-base font-black text-white">{game.heroName}</h3>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-sans shadow-md">
            {game.badge}
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
            <Star className="w-3 h-3 fill-current text-amber-400" />
            <span>{game.rating}</span>
          </div>
        </div>
      </div>

      {/* Middle Center: Clear and unobstructed view of the artwork */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between p-4">
        {/* Navigation Arrows for fast flip on center card */}
        {isCenter && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="اتاق قبلی"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-amber-300 flex items-center justify-center transition-all active:scale-90 z-20 shadow-xl cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="اتاق بعدی"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-amber-300 flex items-center justify-center transition-all active:scale-90 z-20 shadow-xl cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="w-full" />

        {/* Clean, Sleek Title Tag (No long poems or heavy text blocking the art) */}
        <div className="px-4 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-center shadow-xl">
          <h2 className="text-base sm:text-lg font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {game.title}
          </h2>
          <span className="text-[11px] font-bold text-slate-300">{game.category}</span>
        </div>
      </div>

      {/* Bottom Action Footer: 3 Battle Modes */}
      <div className="relative z-10 p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md border-t border-amber-500/20 flex flex-col gap-2">
        <div className="text-[10px] font-bold text-slate-300 flex items-center justify-between">
          <span>انتخاب حالت بازی:</span>
          <span className="text-amber-400 font-mono">
            {currentIndex + 1} از {totalGames}
          </span>
        </div>

        {/* 3 Modes Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            id={`gamecard-btn-ai-${game.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectGame(game.id, 'ai');
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900/90 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 active:scale-95 transition-all text-center cursor-pointer shadow-md group"
          >
            <div className="w-5 h-5 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-1 group-hover:scale-110 transition-transform">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-cyan-300">هوش مصنوعی</span>
            <span className="text-[8px] text-slate-400">تک‌نفره</span>
          </button>

          <button
            id={`gamecard-btn-pvp-${game.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectGame(game.id, 'pvp');
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-900/90 hover:bg-emerald-500/20 border border-emerald-500/40 hover:border-emerald-400 active:scale-95 transition-all text-center cursor-pointer shadow-md group"
          >
            <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 mb-1 group-hover:scale-110 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-emerald-300">دو نفره آنلاین</span>
            <span className="text-[8px] text-slate-400">پهلوانان</span>
          </button>

          <button
            id={`gamecard-btn-league-${game.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelectGame(game.id, 'league');
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-600/30 hover:from-amber-500/40 hover:to-yellow-500/40 border border-amber-400 active:scale-95 transition-all text-center cursor-pointer shadow-md ring-1 ring-amber-400/50 group"
          >
            <div className="w-5 h-5 rounded-lg bg-amber-500/30 flex items-center justify-center text-amber-300 mb-1 group-hover:scale-110 transition-transform">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-amber-300">لیگ قهرمانان</span>
            <span className="text-[8px] text-amber-400/90">{game.leaguePrize} 🪙 جایزه</span>
          </button>
        </div>
      </div>
    </div>
  );
};
