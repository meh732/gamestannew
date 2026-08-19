import React, { useState, useRef } from 'react';
import { GameId, GameMode } from '../types';
import { GAMES_LIST } from '../data/gamesList';
import { GameCard } from './common/GameCard';
import { sounds } from '../utils/audio';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface MythologicalRoomCarouselProps {
  onStartGame: (gameId: GameId, mode: GameMode) => void;
}

export const MythologicalRoomCarousel: React.FC<MythologicalRoomCarouselProps> = ({
  onStartGame,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
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

  // Real-time touch drag for buttery smooth finger tracking
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    // Dampen drag distance for natural spring tension
    setDragOffset(diff * 0.7);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const diffX = startXRef.current - e.changedTouches[0].clientX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        // Swiped right (in RTL: Next Game)
        handleNextRoom();
      } else {
        // Swiped left (in RTL: Previous Game)
        handlePrevRoom();
      }
    }

    startXRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <div
      className="relative w-full flex flex-col items-center justify-between select-none font-['Vazirmatn'] text-slate-100 overflow-hidden py-2"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Room Title & Hero Banner */}
      <div className="relative z-20 flex flex-col items-center gap-1 mb-1 text-center px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[11px] font-black shadow-md">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{activeGame.roomTitle}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)]">
          {activeGame.title}
        </h2>
      </div>

      {/* 3D Cylinder / Cover Flow Stage */}
      <div className="relative w-full h-[500px] sm:h-[530px] flex items-center justify-center overflow-x-hidden my-1 z-20">
        {GAMES_LIST.map((game, idx) => {
          let offset = 99;

          if (idx === currentIndex) {
            offset = 0;
          } else if (idx === (currentIndex + 1) % GAMES_LIST.length) {
            // Next card (Left in Persian RTL)
            offset = 1;
          } else if (idx === (currentIndex - 1 + GAMES_LIST.length) % GAMES_LIST.length) {
            // Previous card (Right in Persian RTL)
            offset = -1;
          }

          return (
            <GameCard
              key={game.id}
              game={game}
              offset={offset}
              dragOffset={idx === currentIndex ? dragOffset : 0}
              isDragging={isDragging}
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
      <div className="flex items-center justify-center gap-3 py-2 relative z-30">
        <button
          onClick={handlePrevRoom}
          aria-label="تالار قبلی"
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-amber-300 transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="text-[11px] hidden sm:inline">قبلی</span>
        </button>

        {/* Paging Dots Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 px-3 py-1.5 rounded-full border border-amber-500/30 shadow-lg">
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
          aria-label="تالار بعدی"
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 text-amber-300 transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <span className="text-[11px] hidden sm:inline">بعدی</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
