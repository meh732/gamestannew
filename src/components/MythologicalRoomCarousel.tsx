import React, { useState, useRef } from 'react';
import { GameId, GameMode } from '../types';
import { GAMES_LIST } from '../data/gamesList';
import { GameCard } from './common/GameCard';
import { sounds } from '../utils/audio';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MythologicalRoomCarouselProps {
  onStartGame: (gameId: GameId, mode: GameMode) => void;
}

export const MythologicalRoomCarousel: React.FC<MythologicalRoomCarouselProps> = ({
  onStartGame,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const startXRef = useRef<number | null>(null);

  const activeGame = GAMES_LIST[currentIndex];

  const handleNextRoom = () => {
    sounds.playMove();
    setCurrentIndex((prev) => (prev + 1) % GAMES_LIST.length);
  };

  const handlePrevRoom = () => {
    sounds.playMove();
    setCurrentIndex((prev) => (prev - 1 + GAMES_LIST.length) % GAMES_LIST.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const diffX = startXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped right (in RTL: Next)
        handleNextRoom();
      } else {
        // Swiped left (in RTL: Prev)
        handlePrevRoom();
      }
    }
    startXRef.current = null;
  };

  return (
    <div
      className="relative w-full flex flex-col items-center justify-between select-none font-['Vazirmatn'] text-slate-100 overflow-hidden py-2"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Lightweight Ambient Backdrop Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/70 to-[#070a12]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0,transparent_70%)]" />
      </div>

      {/* Room Title Header */}
      <div className="relative z-20 flex flex-col items-center gap-1 mb-1 text-center">
        <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-0.5 rounded-full shadow-md">
          {activeGame.roomTitle}
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-amber-200 drop-shadow-md">
          {activeGame.title}
        </h2>
      </div>

      {/* CoverFlow Stage Container */}
      <div className="relative w-full h-[520px] sm:h-[570px] flex items-center justify-center overflow-x-hidden my-1 z-20">
        {GAMES_LIST.map((game, idx) => {
          let position: 'center' | 'left' | 'right' | 'hidden' = 'hidden';

          if (idx === currentIndex) {
            position = 'center';
          } else if (idx === (currentIndex - 1 + GAMES_LIST.length) % GAMES_LIST.length) {
            // Previous card (Right side in RTL)
            position = 'right';
          } else if (idx === (currentIndex + 1) % GAMES_LIST.length) {
            // Next card (Left side in RTL)
            position = 'left';
          }

          return (
            <GameCard
              key={game.id}
              game={game}
              currentIndex={idx}
              totalGames={GAMES_LIST.length}
              position={position}
              onSelectCard={() => {
                sounds.playMove();
                setCurrentIndex(idx);
              }}
              onSelectGame={onStartGame}
              onNext={handleNextRoom}
              onPrev={handlePrevRoom}
            />
          );
        })}
      </div>

      {/* Navigation Controls & Dot Indicators */}
      <div className="flex items-center justify-center gap-4 py-2 relative z-30">
        <button
          onClick={handlePrevRoom}
          aria-label="اتاق قبلی"
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-amber-300 transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="hidden sm:inline">قبلی</span>
        </button>

        {/* Paging Dots Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-full border border-amber-500/30 shadow-lg">
          {GAMES_LIST.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                sounds.playMove();
                setCurrentIndex(idx);
              }}
              aria-label={`رفتن به بازی ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-gradient-to-r from-amber-400 to-yellow-500 shadow-md shadow-amber-500/50'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNextRoom}
          aria-label="اتاق بعدی"
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-amber-300 transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <span className="hidden sm:inline">بعدی</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
