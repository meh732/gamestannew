import React, { memo } from 'react';
import { GameId, GameInfo, GameMode } from '../../types';
import { Bot, Users, Trophy, Star } from 'lucide-react';

interface GameCardProps {
  game: GameInfo;
  offset: number; // 0 for center, -1 for left (prev), 1 for right (next), others hidden
  onSelectCard: () => void;
  onSelectGame: (gameId: GameId, mode: GameMode) => void;
}

export const GameCard: React.FC<GameCardProps> = memo(({
  game,
  offset,
  onSelectCard,
  onSelectGame,
}) => {
  const isCenter = offset === 0;
  const isRight = offset === 1;
  const isLeft = offset === -1;
  const isVisible = Math.abs(offset) <= 1;

  if (!isVisible) {
    return null; // Do not render off-screen cards to save 100% GPU fillrate on budget phones!
  }

  // 60FPS Hardware-Accelerated 3D Transform
  let transformClass = '';
  let zIndex = 10;
  let opacityClass = 'opacity-100';

  if (isCenter) {
    transformClass = 'translate-x-0 scale-100 z-30 shadow-2xl ring-2 ring-amber-400/80';
    zIndex = 30;
    opacityClass = 'opacity-100';
  } else if (isRight) {
    // Right card in RTL
    transformClass = 'translate-x-[55%] scale-[0.84] z-10 opacity-60 hover:opacity-80 cursor-pointer';
    zIndex = 10;
    opacityClass = 'opacity-60';
  } else if (isLeft) {
    // Left card in RTL
    transformClass = '-translate-x-[55%] scale-[0.84] z-10 opacity-60 hover:opacity-80 cursor-pointer';
    zIndex = 10;
    opacityClass = 'opacity-60';
  }

  return (
    <div
      onClick={!isCenter ? onSelectCard : undefined}
      style={{
        zIndex,
        transition: 'transform 0.28s cubic-bezier(0.2, 0.9, 0.4, 1), opacity 0.25s ease',
        transform: isCenter
          ? 'translate3d(0, 0, 0) scale(1)'
          : isRight
          ? 'translate3d(55%, 0, -40px) scale(0.85)'
          : 'translate3d(-55%, 0, -40px) scale(0.85)',
      }}
      className={`absolute inset-0 w-full max-w-[340px] sm:max-w-[380px] h-[460px] sm:h-[490px] mx-auto rounded-3xl overflow-hidden select-none flex flex-col justify-between gpu-layer border-2 ${
        isCenter ? 'border-amber-400 bg-slate-950 shadow-2xl' : 'border-slate-800 bg-slate-900'
      } ${opacityClass}`}
    >
      {/* 3D HD Artwork Layer without Any Text Clutter */}
      <div className="absolute inset-0 bg-[#0a0705] overflow-hidden">
        {game.heroImage && (
          <img
            src={game.heroImage}
            alt={game.title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
        )}
        {/* Lightweight Solid Gradient Overlay (No heavy GPU blur filters) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/60 pointer-events-none" />
      </div>

      {/* Top Header: Lightweight Glass Badge & Rating */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl drop-shadow">
            {game.icon}
          </span>
          <span className="text-xs font-black text-amber-300 px-3 py-1 rounded-full bg-slate-950/90 border border-amber-500/40 shadow-sm">
            {game.badge}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 border border-amber-500/30 text-amber-300 font-bold text-xs shadow-sm">
          <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
          <span className="font-mono text-xs">{game.rating}</span>
        </div>
      </div>

      {/* Bottom Action Footer with Clean Opaque Surface (Fast 60fps on mobile) */}
      <div className="relative z-10 p-3 sm:p-4 bg-slate-950/95 border-t border-amber-500/30 flex flex-col gap-2.5 shadow-xl">
        
        {/* Game Title & Player Online Stat */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {game.title}
            </h3>
            <span className="text-[11px] font-medium text-amber-300/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{game.playersCount} آنلاین</span>
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
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
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl border border-slate-700 hover:border-amber-400 text-xs font-bold transition-transform active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span className="text-[11px]">نبرد با هوش</span>
            </button>

            {/* Play vs 2P / Online */}
            <button
              id={`play-2p-${game.id}`}
              onClick={() => onSelectGame(game.id, '2p')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xs transition-transform shadow-md shadow-amber-500/30 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span className="text-[11px]">دونفره / آنلاین</span>
            </button>

            {/* League Tournament */}
            <button
              id={`play-league-${game.id}`}
              onClick={() => onSelectGame(game.id, 'league')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-purple-950 hover:bg-purple-900 text-purple-200 rounded-2xl border border-purple-500/40 text-xs font-bold transition-transform active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-[11px]">لیگ جایزه‌دار</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onSelectCard}
            className="w-full py-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs rounded-xl text-center transition-colors cursor-pointer"
          >
            انتخاب این بازی
          </button>
        )}
      </div>
    </div>
  );
});
GameCard.displayName = 'GameCard';
