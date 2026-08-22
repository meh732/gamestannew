import React, { memo } from 'react';
import { GameId } from '../../types';

interface AntiqueRoomSceneProps {
  gameId: GameId;
  title: string;
}

export const AntiqueRoomScene: React.FC<AntiqueRoomSceneProps> = memo(({ gameId }) => {
  // Ultra-realistic atmospheric photographs of physical board games on rustic tables inside historic castle interiors
  const getRoomBackgroundAndOverlay = () => {
    switch (gameId) {
      case 'chess':
        return {
          // Breathtaking real photograph of a wooden chess board sitting on a rustic table inside a grand stone castle room with a fireplace, candle light, and ancient windows (Exact Match for user image)
          photoUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=95',
          glowColor: 'rgba(251, 191, 36, 0.22)', // Hearth/candlelight glow
          plaqueText: 'تالار شطرنج باستان',
        };
      case 'othello':
        return {
          // Breathtaking real photo of a castle stone hall with heavy tables, fireplace, and historic columns, but styling Othello on the table
          photoUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=1200&q=95',
          glowColor: 'rgba(16, 185, 129, 0.2)', // Emerald moonlit glow on stone walls
          plaqueText: 'تالار اتللو باستان',
        };
      case 'sudoku':
        return {
          // Ancient stone study library with candles and historical castle desks
          photoUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=95',
          glowColor: 'rgba(14, 165, 233, 0.18)', // Study light glow
          plaqueText: 'مکتب سودوکو باستان',
        };
      case 'ludo':
        return {
          // Gorgeous castle interior with stone arches and medieval furniture
          photoUrl: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=95',
          glowColor: 'rgba(239, 68, 68, 0.18)', // Ruby imperial firelight glow
          plaqueText: 'تالار منچ باستان',
        };
      default:
        return {
          photoUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1200&q=95',
          glowColor: 'rgba(245, 158, 11, 0.15)',
          plaqueText: 'تالار اساطیر',
        };
    }
  };

  const room = getRoomBackgroundAndOverlay();

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a0705] pointer-events-none select-none">
      {/* 1. AUTHENTIC HIGH-QUALITY PHOTOGRAPH (Castle Room Interiors) */}
      <img
        src={room.photoUrl}
        alt={room.plaqueText}
        className="absolute inset-0 w-full h-full object-cover opacity-95 filter brightness-[0.52] contrast-[1.18] saturate-[0.9] scale-102 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />

      {/* 2. REALISTIC DYNAMIC TORCH/FIREPLACE GLOW OVERLAY */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 mix-blend-color-dodge animate-pulse"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${room.glowColor} 0%, rgba(0,0,0,0.96) 88%)`,
          animationDuration: '4s'
        }}
      />

      {/* 4. LUXURY ANCIENT CARVED FRAME OVERLAY */}
      <div className="absolute inset-0 border-[10px] border-[#0c0805]/95 pointer-events-none z-10">
        <div className="w-full h-full border border-[#a37c2c]/45 rounded-xs" />
      </div>

      {/* 5. DUSTY CHAMBER VIGNETTE */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/65 pointer-events-none z-10" />
    </div>
  );
});
AntiqueRoomScene.displayName = 'AntiqueRoomScene';
