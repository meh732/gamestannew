import React, { memo } from 'react';
import { GameId } from '../../types';

interface AntiqueRoomSceneProps {
  gameId: GameId;
  title: string;
}

export const AntiqueRoomScene: React.FC<AntiqueRoomSceneProps> = memo(({ gameId }) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a0604] pointer-events-none select-none">
      {/* 1. ROOM WALLS & LIGHTING AMBIENCE */}
      {gameId === 'othello' ? (
        /* OTHELLO: Emerald Victorian Damask Room */
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 30%, #0d2818 0%, #06190f 45%, #030d08 100%)',
          }}
        >
          {/* Subtle Emerald Wallpaper Damask Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#059669 1px, #06190f 1px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />
        </div>
      ) : gameId === 'sudoku' ? (
        /* SUDOKU: Warm Mahogany Library Study */
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 35%, #2a180b 0%, #170d06 50%, #0a0502 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 32px, rgba(0,0,0,0.6) 32px, rgba(0,0,0,0.6) 34px)',
            }}
          />
        </div>
      ) : (
        /* CHESS & OTHERS: Deep Mahogany & Dark Walnut Parlor (Exact from Reference Image) */
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 32%, #2d1b0e 0%, #1c0f07 48%, #0d0703 100%)',
          }}
        >
          {/* Vertical Wood Panel Slats */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, transparent, transparent 36px, rgba(0,0,0,0.8) 36px, rgba(0,0,0,0.8) 38px)',
            }}
          />
        </div>
      )}

      {/* Wainscoting Dado Rail Divider Line */}
      <div className="absolute top-[52%] inset-x-0 h-1.5 bg-[#4a2e16] border-t border-[#6d4420] border-b border-[#2b180a] shadow-md z-1" />

      {/* 2. LEFT: Arched Window with Moonlight and Full Moon (Exact from Reference Image) */}
      <div className="absolute top-12 left-3 sm:left-4 w-20 sm:w-22 h-44 rounded-t-full border-4 border-[#3d2410] bg-[#020617] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.9),0_0_15px_rgba(147,197,253,0.18)] z-2">
        {/* Night Sky with Dark Blue Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0b1329] to-[#1e293b]" />
        
        {/* Glowing Real Full Moon */}
        <div className="absolute top-4 left-3.5 w-9 h-9 rounded-full bg-[#f8fafc] shadow-[0_0_18px_#cbd5e1,0_0_35px_rgba(255,255,255,0.45)] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-[#f1f5f9] opacity-90 filter blur-[0.3px]" />
        </div>

        {/* Realistic Silhouetted Tree Branches */}
        <svg viewBox="0 0 100 120" className="absolute bottom-0 inset-x-0 w-full h-24 opacity-80 fill-[#030712]">
          <path d="M0,120 Q10,70 20,60 Q25,80 35,120 Z M30,120 Q45,45 60,40 Q65,70 80,120 Z M70,120 Q85,55 95,50 Q98,75 100,120 Z" />
          <path d="M15,65 Q10,50 5,45 Q8,55 12,65 Z M55,48 Q65,30 75,25 Q70,38 58,52 Z" />
        </svg>

        {/* Dark Wooden Window Frames */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[#3d2410]" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-[#3d2410]" />
        <div className="absolute top-0 inset-x-0 h-10 rounded-t-full border-b border-[#3d2410]" />
      </div>

      {/* 3. CENTER WALL: Antique Wooden Grandfather Pendulum Clock (Exact from Reference) */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 -ml-16 w-11 h-28 rounded-t-lg bg-[#2e1c0c] border-2 border-[#5c3a19] shadow-[0_6px_20px_rgba(0,0,0,0.95)] flex flex-col items-center pt-1 z-2">
        {/* Clock Face with Cream Dial and Hands */}
        <div className="w-8 h-8 rounded-full bg-[#fef3c7] border-2 border-[#8c5e28] flex items-center justify-center shadow-inner relative">
          <span className="text-[6px] font-serif font-black text-[#2e1c0c]">XII</span>
          {/* Hands */}
          <div className="absolute w-0.5 h-2.5 bg-[#170f08] -translate-y-1 rotate-45 origin-bottom" />
          <div className="absolute w-0.5 h-3 bg-[#170f08] -translate-y-1.5 -rotate-30 origin-bottom" />
          <div className="w-1 h-1 rounded-full bg-[#8c5e28] z-2" />
        </div>

        {/* Pendulum Chamber */}
        <div className="w-6 flex-1 bg-[#1a0f06] border-t border-[#5c3a19] flex justify-center items-center overflow-hidden relative">
          <div className="w-0.5 h-10 bg-[#c29b38]" />
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#f5d996] to-[#8c5e28] absolute bottom-1 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
        </div>
      </div>

      {/* 4. RIGHT: Antique Wooden Library Bookshelf (Exact from Reference) */}
      <div className="absolute top-12 right-3 sm:right-4 w-16 sm:w-20 h-48 bg-[#1a0f06] border-l-4 border-t-2 border-b-2 border-[#3d240e] shadow-[inset_0_0_20px_rgba(0,0,0,0.95)] flex flex-col justify-around px-1 py-1 z-2">
        {/* Shelf 1 */}
        <div className="w-full h-9 border-b-2 border-[#5c3a19] flex items-end gap-0.5">
          <div className="w-2.5 h-7.5 bg-[#7f1d1d] rounded-t-xs shadow-xs" />
          <div className="w-2 h-7 bg-[#14532d] rounded-t-xs" />
          <div className="w-3 h-8 bg-[#78350f] rounded-t-xs" />
          <div className="w-2 h-6.5 bg-[#1e1b4b] rounded-t-xs" />
          <div className="w-2.5 h-7.5 bg-[#713f12] rounded-t-xs" />
        </div>
        {/* Shelf 2 */}
        <div className="w-full h-9 border-b-2 border-[#5c3a19] flex items-end justify-around">
          <div className="w-4 h-5.5 bg-gradient-to-t from-[#8c5e28] to-[#f5d996] rounded-t-md shadow-sm" />
          <div className="w-2 h-7 bg-[#854d0e] rounded-t-xs rotate-6" />
          <div className="w-2.5 h-7 bg-[#831843] rounded-t-xs" />
        </div>
        {/* Shelf 3 */}
        <div className="w-full h-9 flex items-end gap-0.5">
          <div className="w-3 h-7.5 bg-[#365314] rounded-t-xs" />
          <div className="w-2 h-6.5 bg-[#4c1d95] rounded-t-xs" />
          <div className="w-2.5 h-8 bg-[#881337] rounded-t-xs" />
          <div className="w-3 h-7 bg-[#78350f] rounded-t-xs" />
        </div>
      </div>

      {/* 5. CEILING & HANGING BRASS PENDANT LAMP (Exact from Reference) */}
      <div className="absolute top-0 inset-x-0 flex flex-col items-center z-10">
        {/* Chain / Cord */}
        <div className="w-1 h-8 bg-gradient-to-b from-[#5c3a19] to-[#8c5e28]" />
        {/* Brass Cone Shade */}
        <div className="w-20 h-7 rounded-t-full bg-gradient-to-b from-[#3a2512] via-[#a37c2c] to-[#453112] border border-[#f59e0b] shadow-[0_4px_25px_rgba(245,158,11,0.7)] flex items-center justify-center relative">
          <div className="w-8 h-2.5 rounded-full bg-[#fef08a] shadow-[0_0_25px_#fbbf24]" />
        </div>
      </div>

      {/* Realistic Warm Light Cone radiating onto the table */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[90%] pointer-events-none z-2"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 18%, rgba(251, 191, 36, 0.42) 0%, rgba(217, 119, 6, 0.18) 48%, rgba(10, 6, 4, 0.95) 100%)',
        }}
      />

      {/* 6. REALISTIC CARVED WOODEN CHAIRS (Exact from Reference Image) */}
      {/* Left Spindle Wooden Chair */}
      <div className="absolute bottom-22 sm:bottom-24 left-3 sm:left-5 w-16 sm:w-19 h-38 sm:h-42 z-3 flex flex-col justify-end">
        {/* Chair Backrest */}
        <div className="w-13 sm:w-15 h-22 sm:h-24 bg-gradient-to-b from-[#4a2e16] to-[#241407] rounded-t-lg border-2 border-[#6d4420] p-1 flex justify-around shadow-xl">
          <div className="w-1 h-full bg-[#241407]" />
          <div className="w-1 h-full bg-[#241407]" />
          <div className="w-1 h-full bg-[#241407]" />
        </div>
        {/* Chair Seat */}
        <div className="w-15 sm:w-17 h-4.5 bg-gradient-to-r from-[#5c3a19] via-[#8c5e28] to-[#3a2512] rounded-md shadow-lg border-t border-[#f5d996]/50 -mt-1" />
        {/* Chair Legs */}
        <div className="w-15 sm:w-17 h-14 flex justify-between px-1">
          <div className="w-2.5 h-full bg-[#241407] rounded-b-xs shadow-md" />
          <div className="w-2.5 h-full bg-[#241407] rounded-b-xs shadow-md" />
        </div>
      </div>

      {/* Right Spindle Wooden Chair */}
      <div className="absolute bottom-22 sm:bottom-24 right-3 sm:right-5 w-16 sm:w-19 h-38 sm:h-42 z-3 flex flex-col justify-end items-end">
        {/* Chair Backrest */}
        <div className="w-13 sm:w-15 h-22 sm:h-24 bg-gradient-to-b from-[#4a2e16] to-[#241407] rounded-t-lg border-2 border-[#6d4420] p-1 flex justify-around shadow-xl">
          <div className="w-1 h-full bg-[#241407]" />
          <div className="w-1 h-full bg-[#241407]" />
          <div className="w-1 h-full bg-[#241407]" />
        </div>
        {/* Chair Seat */}
        <div className="w-15 sm:w-17 h-4.5 bg-gradient-to-r from-[#3a2512] via-[#8c5e28] to-[#5c3a19] rounded-md shadow-lg border-t border-[#f5d996]/50 -mt-1" />
        {/* Chair Legs */}
        <div className="w-15 sm:w-17 h-14 flex justify-between px-1">
          <div className="w-2.5 h-full bg-[#241407] rounded-b-xs shadow-md" />
          <div className="w-2.5 h-full bg-[#241407] rounded-b-xs shadow-md" />
        </div>
      </div>

      {/* 7. SOLID MAHOGANY GAMING TABLE WITH REAL 3D BOARD GAME (Exact from Reference Image) */}
      <div className="absolute bottom-16 sm:bottom-18 left-1/2 -translate-x-1/2 w-[225px] sm:w-[260px] z-4 flex flex-col items-center">
        {/* POLISHED TABLETOP IN 3D PERSPECTIVE */}
        <div
          className="w-full h-36 sm:h-40 rounded-xl bg-gradient-to-b from-[#422913] via-[#2a170a] to-[#170c04] border-3 border-[#8c5e28] shadow-[0_25px_50px_rgba(0,0,0,0.98),inset_0_2px_4px_rgba(255,235,165,0.45)] p-2 relative flex items-center justify-center overflow-hidden"
          style={{
            transform: 'perspective(320px) rotateX(22deg)',
          }}
        >
          {/* Realistic High-Detail Board Game Rendered on Table */}
          {gameId === 'chess' ? (
            /* EXACT CHESS ROOM: Inlaid Board with Carved Light & Dark Chess Pieces */
            <div className="w-40 h-30 bg-[#241407] border-2 border-[#d4af37] p-1 rounded-sm shadow-inner flex flex-col justify-between">
              <div className="w-full h-full grid grid-cols-8 grid-rows-8 border border-[#8c5e28] shadow-inner bg-[#3d240e]">
                {Array.from({ length: 64 }).map((_, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isLight = (row + col) % 2 === 0;
                  const hasWhitePiece = row === 0 || row === 1;
                  const hasBlackPiece = row === 6 || row === 7;

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-center relative ${
                        isLight ? 'bg-[#f5e6ca]' : 'bg-[#6b3e1b]'
                      }`}
                    >
                      {hasWhitePiece && (
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#fffdf5] via-[#fae8b2] to-[#b45309] shadow-md border border-[#78350f] transform -translate-y-0.5" />
                      )}
                      {hasBlackPiece && (
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#451a03] via-[#1c0a02] to-[#000000] shadow-md border border-[#271003] transform -translate-y-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : gameId === 'othello' ? (
            /* EXACT OTHELLO ROOM: Green Felt Board with Glossy Reversible Discs */
            <div className="w-40 h-30 bg-[#064e3b] border-2 border-[#8c5e28] p-1 rounded shadow-inner flex flex-col justify-between">
              <div className="w-full h-full grid grid-cols-8 grid-rows-8 border border-[#047857] bg-[#065f46]">
                {Array.from({ length: 64 }).map((_, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isCenterWhite = (row === 3 && col === 3) || (row === 4 && col === 4);
                  const isCenterBlack = (row === 3 && col === 4) || (row === 4 && col === 3);

                  return (
                    <div key={i} className="border-[0.5px] border-[#047857]/70 flex items-center justify-center">
                      {isCenterWhite && (
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#ffffff] to-[#cbd5e1] border border-stone-400 shadow-md transform -translate-y-0.5" />
                      )}
                      {isCenterBlack && (
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#334155] to-[#020617] border border-stone-900 shadow-md transform -translate-y-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : gameId === 'sudoku' ? (
            /* EXACT SUDOKU ROOM: Inlaid Wooden Sudoku Board with Numbered Tiles */
            <div className="w-38 h-30 bg-[#2e1c0c] border-2 border-[#d4af37] p-1 rounded shadow-inner">
              <div className="w-full h-full grid grid-cols-9 grid-rows-9 border border-[#8c5e28] bg-[#4a2e16]">
                {Array.from({ length: 81 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-[0.5px] border-[#8c5e28] flex items-center justify-center text-[6px] font-bold text-[#f5d996]"
                  >
                    {(i % 7) + 1}
                  </div>
                ))}
              </div>
            </div>
          ) : gameId === 'ludo' ? (
            /* LUDO ROOM: Inlaid Persian Khatam Board with Tokens */
            <div className="w-38 h-30 bg-[#fef3c7] border-2 border-[#b45309] p-1 rounded shadow-inner grid grid-cols-3 grid-rows-3 gap-0.5">
              <div className="bg-[#dc2626] rounded-xs flex items-center justify-center text-[8px] text-white">🔴</div>
              <div className="bg-[#f59e0b] rounded-xs" />
              <div className="bg-[#2563eb] rounded-xs flex items-center justify-center text-[8px] text-white">🔵</div>
              <div className="bg-[#ca8a04] rounded-xs" />
              <div className="bg-[#1e293b] rounded-xs flex items-center justify-center text-[9px] text-amber-300 font-bold">★</div>
              <div className="bg-[#ca8a04] rounded-xs" />
              <div className="bg-[#16a34a] rounded-xs flex items-center justify-center text-[8px] text-white">🟢</div>
              <div className="bg-[#f59e0b] rounded-xs" />
              <div className="bg-[#eab308] rounded-xs flex items-center justify-center text-[8px] text-white">🟡</div>
            </div>
          ) : gameId === 'dooz' ? (
            /* DOOZ ROOM: Rustic Wood & Brass Grid with Stones */
            <div className="w-36 h-28 bg-[#3a2412] border-2 border-[#d4af37] rounded p-1 flex items-center justify-center">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1 p-1 bg-[#24160a] border border-[#8c5e28]">
                <div className="border border-[#d4af37]/50 flex items-center justify-center text-xs text-amber-400 font-black">✕</div>
                <div className="border border-[#d4af37]/50" />
                <div className="border border-[#d4af37]/50 flex items-center justify-center text-xs text-emerald-400 font-black">◯</div>
                <div className="border border-[#d4af37]/50" />
                <div className="border border-[#d4af37]/50 flex items-center justify-center text-xs text-amber-400 font-black">✕</div>
                <div className="border border-[#d4af37]/50" />
                <div className="border border-[#d4af37]/50 flex items-center justify-center text-xs text-emerald-400 font-black">◯</div>
                <div className="border border-[#d4af37]/50" />
                <div className="border border-[#d4af37]/50 flex items-center justify-center text-xs text-amber-400 font-black">✕</div>
              </div>
            </div>
          ) : (
            /* ROYAL PARLOR BOARD */
            <div className="w-38 h-28 bg-[#2d1b0d] border-2 border-[#d4af37] rounded p-2 flex flex-col items-center justify-center shadow-inner">
              <div className="w-10 h-10 rounded-full bg-[#78350f] border border-[#f5d996] flex items-center justify-center text-xl shadow-md">
                🎲
              </div>
              <span className="text-[9px] font-black text-[#f5d996] mt-1">تالار اختصاصی</span>
            </div>
          )}
        </div>

        {/* CARVED SOLID WOOD TABLE PEDESTAL & LEGS */}
        <div className="w-11 h-14 bg-gradient-to-b from-[#3a2512] via-[#5c3a19] to-[#24160a] border-x-2 border-[#8c5e28] shadow-2xl flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-[#8c5e28] border border-[#d4af37] shadow-inner" />
        </div>
        <div className="w-30 sm:w-34 h-3.5 bg-gradient-to-r from-[#24160a] via-[#5c3a19] to-[#24160a] rounded-t-full border-t border-[#8c5e28] shadow-md" />
      </div>

      {/* 8. LUXURY BOTTOM VIGNETTE */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080503] via-transparent to-transparent pointer-events-none z-5" />
    </div>
  );
});
AntiqueRoomScene.displayName = 'AntiqueRoomScene';
