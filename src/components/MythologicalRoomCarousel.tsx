import React, { useState, useRef, useCallback } from 'react';
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
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const activeGame = GAMES_LIST[currentIndex];

  const handleNextRoom = useCallback(() => {
    sounds.playMove();
    setCurrentIndex((prev) => (prev + 1) % GAMES_LIST.length);
  }, []);

  const handlePrevRoom = useCallback(() => {
    sounds.playMove();
    setCurrentIndex((prev) => (prev - 1 + GAMES_LIST.length) % GAMES_LIST.length);
  }, []);

  // Zero-Lag Touch Gesture Handling (No React re-renders during drag)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Only trigger if horizontal swipe is dominant (not vertical page scroll)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
      if (diffX > 0) {
        // Swiped right (in RTL: Next Game)
        handleNextRoom();
      } else {
        // Swiped left (in RTL: Previous Game)
        handlePrevRoom();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <div
      className="relative w-full flex flex-col items-center justify-between select-none font-['Vazirmatn'] text-slate-100 overflow-hidden py-1 gpu-layer"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Room Title & Hero Banner */}
      <div className="relative z-20 flex flex-col items-center gap-1 mb-1 text-center px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{activeGame.roomTitle}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          {activeGame.title}
        </h2>
      </div>

      {/* High Performance Card Stage */}
      <div className="relative w-full h-[480px] sm:h-[510px] flex items-center justify-center overflow-x-hidden my-1 z-20">
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

          if (Math.abs(offset) > 1) return null; // Save memory & GPU composition on low-end devices!

          return (
            <GameCard
              key={game.id}
              game={game}
              offset={offset}
              onSelectCard={() => {
                sounds.playMove();
                setCurrentIndex(idx);
              }}
              onSelectGame={onStartGame}
            />
          );
        })}
      </div>

      {/* Navigation Controls & Dot Indicators */}
      <div className="flex items-center justify-center gap-3 py-1 relative z-30">
        <button
          onClick={handlePrevRoom}
          aria-label="تالار قبلی"
          className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-amber-300 transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="text-[11px] hidden sm:inline">قبلی</span>
        </button>

        {/* Paging Dots Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 shadow-md">
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
                  ? 'w-6 bg-amber-400 shadow-sm'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNextRoom}
          aria-label="تالار بعدی"
          className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-amber-300 transition-all active:scale-95 shadow-md flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <span className="text-[11px] hidden sm:inline">بعدی</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
