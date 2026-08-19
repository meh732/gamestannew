import React, { memo } from 'react';
import { GameId, GameInfo, GameMode } from '../../types';
import { Bot, Users, Crown } from 'lucide-react';
import { AntiqueRoomScene } from './AntiqueRoomScene';

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
    return null; // Save 100% GPU memory on mobile
  }

  const zIndex = isCenter ? 30 : 10;
  const opacityClass = isCenter ? 'opacity-100' : 'opacity-65 hover:opacity-85 cursor-pointer';

  return (
    <div
      onClick={!isCenter ? onSelectCard : undefined}
      style={{
        zIndex,
        width: '303px',
        height: '478px',
        backgroundColor: '#111010',
        borderRadius: '15px',
        borderWidth: '0px',
        fontSize: '4px',
        transition: 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease, box-shadow 0.35s ease',
        transform: isCenter
          ? 'translate3d(0, 0, 30px) rotateY(0deg) scale(1)'
          : isRight
          ? 'translate3d(60%, 0, -70px) rotateY(-20deg) scale(0.82)'
          : 'translate3d(-60%, 0, -70px) rotateY(20deg) scale(0.82)',
        boxShadow: isCenter
          ? '0 25px 60px -15px rgba(0,0,0,0.95), 0 0 35px rgba(245,158,11,0.3), inset 0 0 20px rgba(0,0,0,0.8)'
          : '0 15px 35px -10px rgba(0,0,0,0.85)',
      }}
      className={`absolute inset-0 mx-auto overflow-hidden select-none flex flex-col justify-between gpu-layer ${opacityClass}`}
    >
      {/* 1. EXACT REALISTIC ANTIQUE ROOM SCENE (Mahogany, Moonlit Window, Clock, Bookshelf, Table & Chairs, Board Game) */}
      <AntiqueRoomScene gameId={game.id} title={game.title} />

      {/* 2. Top Antique Carved Wooden Room Plaque (e.g. اتاق شطرنج, اتاق اتللو, اتاق سودوکو) */}
      <div className="relative z-20 pt-6 px-4 flex flex-col items-center">
        <div className="relative px-6 py-1.5 rounded-2xl bg-gradient-to-b from-[#3a2815] via-[#241709] to-[#170e05] border-2 border-[#c29b38] shadow-[0_6px_20px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,235,165,0.4)] flex items-center justify-center gap-2">
          {/* Left Decorative Scroll Wing */}
          <span className="text-[#d4af37] text-xs opacity-70">❧</span>
          
          <h2 className="text-base sm:text-lg font-black text-[#f7e2a9] tracking-wide filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {game.roomTitle || game.title}
          </h2>

          {/* Right Decorative Scroll Wing */}
          <span className="text-[#d4af37] text-xs opacity-70">☙</span>
        </div>
      </div>

      {/* Central area is completely clear and visible */}
      <div className="flex-1" />

      {/* 3. Bottom 3 Luxury Action Buttons (Exact Replica of Reference Image) */}
      <div className="relative z-20 p-3.5 bg-gradient-to-t from-[#0a0704] via-[#120d08]/95 to-transparent flex flex-col gap-2">
        {isCenter ? (
          <div className="grid grid-cols-3 gap-2">
            {/* Button 1: بازی با ربات */}
            <button
              id={`play-ai-${game.id}`}
              onClick={() => onSelectGame(game.id, 'ai')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-2xl bg-gradient-to-b from-[#2e261a] to-[#17120a] border border-[#a37c2c]/80 hover:border-[#f59e0b] text-[#f7e2a9] transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.7)] cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#1c160e] border border-[#a37c2c] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                <Bot className="w-4 h-4 text-[#eab308]" />
              </div>
              <span className="text-[11px] font-bold text-[#e5d0a1] leading-none">
                بازی با ربات
              </span>
            </button>

            {/* Button 2: دونفره آنلاین */}
            <button
              id={`play-2p-${game.id}`}
              onClick={() => onSelectGame(game.id, '2p')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-2xl bg-gradient-to-b from-[#1b3322] to-[#0c1f13] border-2 border-[#4ade80]/60 hover:border-[#4ade80] text-emerald-100 transition-all active:scale-95 shadow-[0_4px_15px_rgba(22,101,52,0.4)] cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#0a170e] border border-[#4ade80]/70 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                <Users className="w-4 h-4 text-[#4ade80]" />
              </div>
              <span className="text-[11px] font-black text-emerald-200 leading-none">
                دونفره آنلاین
              </span>
            </button>

            {/* Button 3: دونفره پلاس / لیگ */}
            <button
              id={`play-league-${game.id}`}
              onClick={() => onSelectGame(game.id, 'league')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-2xl bg-gradient-to-b from-[#3d2211] to-[#1f1107] border border-[#f59e0b]/80 hover:border-[#fbbf24] text-amber-100 transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.7)] cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#1c0f05] border border-[#f59e0b] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                <Crown className="w-4 h-4 text-[#fbbf24]" />
              </div>
              <span className="text-[11px] font-black text-[#fbbf24] leading-none">
                دونفره پلاس
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={onSelectCard}
            className="w-full py-2.5 bg-[#2a1d0d]/90 hover:bg-[#3d2a13] border border-[#c29b38] text-[#f5d996] font-black text-xs rounded-2xl text-center shadow-lg transition-colors cursor-pointer"
          >
            ورود به {game.roomTitle || game.title} ➔
          </button>
        )}
      </div>
    </div>
  );
});
GameCard.displayName = 'GameCard';
