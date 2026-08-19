import React from 'react';
import { GameId, GameInfo, GameMode } from '../../types';
import { Bot, Users, Trophy, Star, Sparkles } from 'lucide-react';

interface GameCardProps {
  game: GameInfo;
  offset: number; // 0 for center, -1 for left (prev), 1 for right (next), others for hidden
  dragOffset?: number;
  isDragging?: boolean;
  onSelectCard: () => void;
  onSelectGame: (gameId: GameId, mode: GameMode) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  offset,
  dragOffset = 0,
  isDragging = false,
  onSelectCard,
  onSelectGame,
}) => {
  const isCenter = offset === 0;
  const isRight = offset === 1;
  const isLeft = offset === -1;
  const isVisible = Math.abs(offset) <= 1;

  // Pure GPU-Accelerated 3D Cylinder / Cover Flow Transforms
  let transform3D = '';
  let zIndex = 10;
  let opacityClass = 'opacity-100';

  if (isCenter) {
    // Center Card: Raised in 3D Z-plane with real-time drag tilt
    const dynamicRotateY = dragOffset * -0.06;
    transform3D = `perspective(1200px) translate3d(${dragOffset}px, 0, 60px) rotateY(${dynamicRotateY}deg) scale(1)`;
    zIndex = 40;
    opacityClass = 'opacity-100';
  } else if (isRight) {
    // Next Card (Right in Persian RTL): Rotated inward in 3D
    transform3D = `perspective(1200px) translate3d(56%, 0, -80px) rotateY(-26deg) scale(0.84)`;
    zIndex = 20;
    opacityClass = 'opacity-55 hover:opacity-85 cursor-pointer';
  } else if (isLeft) {
    // Previous Card (Left in Persian RTL): Rotated inward in 3D
    transform3D = `perspective(1200px) translate3d(-56%, 0, -80px) rotateY(26deg) scale(0.84)`;
    zIndex = 20;
    opacityClass = 'opacity-55 hover:opacity-85 cursor-pointer';
  } else {
    // Hidden beyond visible radius
    transform3D = `perspective(1200px) translate3d(${offset > 0 ? '120%' : '-120%'}, 0, -200px) scale(0.5)`;
    zIndex = 0;
    opacityClass = 'opacity-0 pointer-events-none';
  }

  return (
    <div
      onClick={!isCenter ? onSelectCard : undefined}
      style={{
        transform: transform3D,
        zIndex,
        transition: isDragging && isCenter ? 'none' : 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
      className={`absolute inset-0 w-full max-w-[360px] sm:max-w-[400px] h-[480px] sm:h-[510px] mx-auto rounded-[32px] overflow-hidden select-none flex flex-col justify-between will-change-transform ${
        isCenter
          ? 'border-2 border-amber-400/90 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.3)] ring-1 ring-amber-300/60'
          : 'border border-amber-500/30 shadow-xl'
      } ${opacityClass}`}
    >
      {/* 3D HD Artwork Layer without Any Text Clutter */}
      <div className="absolute inset-0 bg-[#0c0a09] overflow-hidden">
        {game.heroImage && (
          <img
            src={game.heroImage}
            alt={game.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.1] transition-transform duration-500 hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}
        {/* Dynamic 3D Specular Light Sheen & Shadow Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-white/10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Top Header: Clean 3D Glass Badge & Rating */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl filter drop-shadow-md">
            {game.icon}
          </span>
          <span className="text-xs font-black text-white px-3 py-1 rounded-full bg-black/60 border border-amber-500/40 backdrop-blur-md shadow-md">
            {game.badge}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-amber-500/30 backdrop-blur-md text-amber-300 font-bold text-xs shadow-md">
          <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
          <span className="font-mono text-xs">{game.rating}</span>
        </div>
      </div>

      {/* Bottom Action Footer with Clean 3D Glass Surface */}
      <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/80 border-t border-amber-500/30 backdrop-blur-xl flex flex-col gap-2.5 shadow-2xl">
        
        {/* Game Title & Player Online Stat */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white drop-shadow-md">
              {game.title}
            </h3>
            <span className="text-[11px] font-medium text-amber-300/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{game.playersCount} آنلاین</span>
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700">
            ورودی: {game.minCoins} سکه
          </span>
        </div>

        {/* Action Buttons for Center Card */}
        {isCenter ? (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Play vs AI */}
            <button
              id={`play-ai-${game.id}`}
              onClick={() => onSelectGame(game.id, 'ai')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl border border-slate-700 hover:border-amber-400 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span className="text-[11px]">نبرد با هوش</span>
            </button>

            {/* Play vs 2P / Online */}
            <button
              id={`play-2p-${game.id}`}
              onClick={() => onSelectGame(game.id, '2p')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-gradient-to-b from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-2xl font-black text-xs transition-all shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span className="text-[11px]">دونفره / آنلاین</span>
            </button>

            {/* League Tournament */}
            <button
              id={`play-league-${game.id}`}
              onClick={() => onSelectGame(game.id, 'league')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-gradient-to-b from-purple-900/80 to-slate-900 hover:from-purple-800 hover:to-slate-800 text-purple-200 rounded-2xl border border-purple-500/40 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-[11px]">لیگ جایزه‌دار</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onSelectCard}
            className="w-full py-2 bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl text-center transition-colors cursor-pointer"
          >
            انتخاب این بازی
          </button>
        )}
      </div>
    </div>
  );
};
