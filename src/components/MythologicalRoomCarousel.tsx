import React, { useState, useRef, useCallback } from 'react';
import { GameId, GameMode } from '../types';
import { GAMES_LIST } from '../data/gamesList';
import { GameCard } from './common/GameCard';
import { sounds } from '../utils/audio';

interface MythologicalRoomCarouselProps {
  onStartGame: (gameId: GameId, mode: GameMode) => void;
}

export const MythologicalRoomCarousel: React.FC<MythologicalRoomCarouselProps> = ({
  onStartGame,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

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
      className="relative w-full flex flex-col items-center justify-between select-none font-['Vazirmatn'] text-slate-100 overflow-hidden pt-2 pb-1 gpu-layer"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* High Performance 3D Card Stage with True Perspective */}
      <div
        style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
        className="relative w-full h-[480px] sm:h-[510px] flex items-center justify-center overflow-x-hidden my-1 z-20"
      >
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

      {/* Golden Subtle Dot Indicators */}
      <div className="flex items-center justify-center gap-1.5 py-1.5 relative z-30">
        {GAMES_LIST.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              sounds.playMove();
              setCurrentIndex(idx);
            }}
            aria-label={`رفتن به بازی ${idx + 1}`}
            className={`rounded-full transition-all cursor-pointer ${
              idx === currentIndex
                ? 'w-3.5 h-1.5 bg-[#f5d996] shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                : 'w-1.5 h-1.5 bg-[#5c401f] hover:bg-[#a37c2c]'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
