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
    transformClass = 'translate-x-0 scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.9)]';
    zIndex = 30;
    opacityClass = 'opacity-100';
  } else if (isRight) {
    transformClass = 'translate-x-[45%] sm:translate-x-[55%] scale-[0.85] shadow-lg';
    zIndex = 20;
    opacityClass = 'opacity-40 hover:opacity-75 cursor-pointer';
  } else if (isLeft) {
    transformClass = '-translate-x-[45%] sm:-translate-x-[55%] scale-[0.85] shadow-lg';
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
      className={`absolute inset-0 w-full max-w-[420px] mx-auto rounded-3xl overflow-hidden border-2 transition-all duration-300 ease-out select-none flex flex-col justify-between will-change-transform ${
        isCenter ? 'border-amber-400/80 ring-2 ring-amber-500/30' : 'border-amber-500/20'
      } ${transformClass} ${opacityClass}`}
      style={{ zIndex }}
    >
      {/* Self-Contained Gradient Background with Mythological Motif */}
      <div className={`absolute inset-0 bg-gradient-to-br ${game.bgGradient || 'from-slate-900 via-amber-950/40 to-slate-950'} overflow-hidden`}>
        {game.heroImage && (
          <img
            src={game.heroImage}
            alt={game.title}
            onError={(e) => {
              // Graceful fallback to rich local CSS gradients if external image fails
              e.currentTarget.style.display = 'none';
            }}
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.75] contrast-[1.1] transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}
        {/* Soft Vignette and Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Top Header: Palace Badge & Hero Meta */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md">
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

      {/* Center: Mythological Quote & Lore */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-2.5">
        <div className="bg-slate-950/85 border border-amber-500/30 rounded-2xl p-3 shadow-inner">
          <p className="text-xs sm:text-sm text-amber-200/95 italic font-serif leading-relaxed text-center">
            «{game.heroQuote}»
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 px-1 font-sans">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{game.playersCount} آنلاین</span>
          </span>
          <span className="text-amber-400 font-bold">حداقل ورودی: {game.minCoins} سکه</span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 p-3 sm:p-4 bg-slate-950/90 border-t border-amber-500/20 backdrop-blur-md flex flex-col gap-2">
        {isCenter ? (
          <div className="grid grid-cols-3 gap-2">
            {/* Play vs AI */}
            <button
              id={`play-ai-${game.id}`}
              onClick={() => onSelectGame(game.id, 'ai')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl border border-slate-700 hover:border-amber-400 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span>نبرد با هوش</span>
            </button>

            {/* Play vs 2P / Online */}
            <button
              id={`play-2p-${game.id}`}
              onClick={() => onSelectGame(game.id, '2p')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-gradient-to-b from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-2xl font-black text-xs transition-all shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span>دونفره / آنلاین</span>
            </button>

            {/* League Tournament */}
            <button
              id={`play-league-${game.id}`}
              onClick={() => onSelectGame(game.id, 'league')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-gradient-to-b from-purple-900/80 to-slate-900 hover:from-purple-800 hover:to-slate-800 text-purple-200 rounded-2xl border border-purple-500/40 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>لیگ جایزه‌دار</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onSelectCard}
            className="w-full py-2.5 bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-2xl text-center transition-colors cursor-pointer"
          >
            ورود به تالار {game.title}
          </button>
        )}
      </div>
    </div>
  );
};
