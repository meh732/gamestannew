import React, { useState, useEffect, useRef } from 'react';
import { GameMode } from '../../types';
import { sounds } from '../../utils/audio';
import { GameModeBanner } from '../common/GameModeBanner';
import { ThreeDice3D } from '../../engine/ThreeDice3D';
import { gfx } from '../../engine/GraphicsEngine';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Trophy,
  Crown,
  Sparkles,
  Swords,
  Shield,
  Bot,
  Users,
} from 'lucide-react';

interface LudoGameProps {
  initialMode?: GameMode;
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

interface Piece {
  id: number;
  color: PlayerColor;
  state: 'base' | 'track' | 'home';
  step: number; // 0 to 39 on main track (relative to player start), 0 to 3 in home stretch, or finished (4)
}

// 40 Perimeter Track Coordinates on a 15x15 Grid for Classic Mench Board
// Grid: 0-14 x, 0-14 y (0,0 is top-left)
const TRACK_COORDS: { x: number; y: number }[] = [
  // 0-3: Red Top Path Going Down
  { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 },
  // 5-9: Going Left
  { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 },
  // 10-10: Green Corner
  { x: 0, y: 6 }, { x: 0, y: 7 }, { x: 0, y: 8 },
  // 13-17: Green Going Right
  { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 },
  // 18-22: Green Going Down
  { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 },
  // 23-25: Yellow Bottom Corner
  { x: 6, y: 14 }, { x: 7, y: 14 }, { x: 8, y: 14 },
  // 26-30: Yellow Going Up
  { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 },
  // 31-35: Yellow Going Right
  { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 },
  // 36-38: Blue Right Corner
  { x: 14, y: 8 }, { x: 14, y: 7 }, { x: 14, y: 6 },
  // 39-43: Blue Going Left
  { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 },
  // 44-48: Blue Going Up
  { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 8, y: 1 },
  // 49-51: Red Top Corner
  { x: 8, y: 0 }, { x: 7, y: 0 }, { x: 6, y: 0 },
];

const TOTAL_TRACK_STEPS = 40;

// Standard Start Index for each Color on the 40-step track
const PLAYER_START_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 10,
  yellow: 20,
  blue: 30,
};

// 4 Inward Home Columns (4 steps to reach center goal)
const HOME_COORDS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }],
  green: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }],
  yellow: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }],
  blue: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }],
};

const PLAYER_NAMES: Record<PlayerColor, { name: string; hero: string; colorClass: string; bgClass: string; borderClass: string }> = {
  red: { name: 'سهراب یل (سرخ)', hero: 'سهراب دلاور', colorClass: 'text-rose-400', bgClass: 'bg-rose-600', borderClass: 'border-rose-400' },
  blue: { name: 'سیمرغ دانا (آبی)', hero: 'سیمرغ قاف', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-600', borderClass: 'border-cyan-400' },
  yellow: { name: 'زال زر (زرین)', hero: 'زال جهان‌پهلوان', colorClass: 'text-amber-400', bgClass: 'bg-amber-500', borderClass: 'border-amber-300' },
  green: { name: 'کاوه آهنگر (سبز)', hero: 'کاوه دادخواه', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-400' },
};

const PIECES_PER_PLAYER = 4;

export const LudoGame: React.FC<LudoGameProps> = ({
  initialMode = 'ai',
  onBack,
  onWinReward,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [playerCount, setPlayerCount] = useState<2 | 4>(2); // 2 or 4 players
  const [activeTurn, setActiveTurn] = useState<PlayerColor>('red');
  const [diceVal, setDiceVal] = useState<number>(6);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [logMessage, setLogMessage] = useState('تاس را پرتاب کنید تا بازی آغاز شود.');

  // Initialize Pieces for 4 Players
  const [pieces, setPieces] = useState<Piece[]>(() => {
    const initial: Piece[] = [];
    const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];
    colors.forEach((color) => {
      for (let i = 0; i < PIECES_PER_PLAYER; i++) {
        initial.push({ id: i, color, state: 'base', step: 0 });
      }
    });
    return initial;
  });

  const activeColors: PlayerColor[] = playerCount === 2 ? ['red', 'blue'] : ['red', 'green', 'yellow', 'blue'];

  const resetGame = () => {
    setPieces((prev) =>
      prev.map((p) => ({ ...p, state: 'base', step: 0 }))
    );
    setActiveTurn('red');
    setDiceVal(6);
    setHasRolled(false);
    setIsRolling(false);
    setWinner(null);
    setLogMessage('بازی نو آغاز شد. سهراب یل، تاس را پرتاب کن!');
  };

  const nextTurn = () => {
    setHasRolled(false);
    const currIdx = activeColors.indexOf(activeTurn);
    const nextColor = activeColors[(currIdx + 1) % activeColors.length];
    setActiveTurn(nextColor);
    setLogMessage(`نوبت ${PLAYER_NAMES[nextColor].name} است. تاس بریزید!`);
  };

  // Roll 3D Dice Handler
  const rollDice = () => {
    if (isRolling || hasRolled || !!winner) return;

    sounds.playDice();
    setIsRolling(true);

    const rollDuration = 650;
    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceVal(rolled);
      setIsRolling(false);
      setHasRolled(true);

      const moveable = getMoveablePieces(activeTurn, rolled);

      if (moveable.length === 0) {
        setLogMessage(`${PLAYER_NAMES[activeTurn].name} عدد ${rolled} آورد؛ حرکتی ممکن نیست.`);
        setTimeout(() => {
          nextTurn();
        }, 1100);
      } else if (moveable.length === 1) {
        setLogMessage(`${PLAYER_NAMES[activeTurn].name} عدد ${rolled} آورد. در حال حرکت مهره...`);
        setTimeout(() => {
          movePiece(moveable[0], rolled);
        }, 400);
      } else {
        setLogMessage(`${PLAYER_NAMES[activeTurn].name} عدد ${rolled} آورد. یکی از مهره‌های چشمک‌زن را انتخاب کنید!`);
      }
    }, rollDuration);
  };

  // Check which pieces can move with the rolled dice value
  const getMoveablePieces = (color: PlayerColor, rolled: number): Piece[] => {
    const playerPieces = pieces.filter((p) => p.color === color);
    return playerPieces.filter((p) => {
      if (p.state === 'base') {
        return rolled === 6; // Need a 6 to leave the castle base
      }
      if (p.state === 'track') {
        const remainingOnTrack = TOTAL_TRACK_STEPS - p.step;
        if (rolled <= remainingOnTrack) return true;
        const overshootIntoHome = rolled - remainingOnTrack;
        return overshootIntoHome <= 4;
      }
      if (p.state === 'home') {
        return p.step + rolled <= 4;
      }
      return false;
    });
  };

  // Move a selected piece
  const movePiece = (piece: Piece, rolled: number) => {
    if (!hasRolled || piece.color !== activeTurn) return;

    sounds.playMove();

    let newPiece: Piece = { ...piece };
    let capturedOpponent = false;

    if (piece.state === 'base') {
      if (rolled === 6) {
        newPiece = { ...piece, state: 'track', step: 0 };
        sounds.playClick();
        gfx.spawnSparks(window.innerWidth / 2, window.innerHeight / 2, 20, '#fbbf24');
      }
    } else if (piece.state === 'track') {
      const nextStep = piece.step + rolled;
      if (nextStep < TOTAL_TRACK_STEPS) {
        newPiece = { ...piece, step: nextStep };

        // Check for capture on target track cell
        const targetGlobalIdx = (PLAYER_START_INDICES[piece.color] + nextStep) % TOTAL_TRACK_STEPS;
        const opponentOnTile = pieces.find((p) => {
          if (p.color === piece.color || p.state !== 'track') return false;
          const oppGlobalIdx = (PLAYER_START_INDICES[p.color] + p.step) % TOTAL_TRACK_STEPS;
          return oppGlobalIdx === targetGlobalIdx;
        });

        if (opponentOnTile) {
          // Capture opponent back to base!
          capturedOpponent = true;
          sounds.playCapture();
          gfx.spawnSparks(window.innerWidth / 2, window.innerHeight / 2, 35, '#f43f5e');
          setPieces((prev) =>
            prev.map((p) => (p.color === opponentOnTile.color && p.id === opponentOnTile.id ? { ...p, state: 'base', step: 0 } : p))
          );
          setLogMessage(`⚔️ ${PLAYER_NAMES[piece.color].name} مهره ${PLAYER_NAMES[opponentOnTile.color].name} را زد و به قلعه برگرداند!`);
        }
      } else {
        // Entering Home Stretch
        const homeStep = nextStep - TOTAL_TRACK_STEPS;
        if (homeStep <= 4) {
          newPiece = { ...piece, state: 'home', step: homeStep };
        }
      }
    } else if (piece.state === 'home') {
      if (piece.step + rolled <= 4) {
        newPiece = { ...piece, step: piece.step + rolled };
      }
    }

    setPieces((prev) =>
      prev.map((p) => (p.color === piece.color && p.id === piece.id ? newPiece : p))
    );

    setTimeout(() => {
      const updatedPlayerPieces = pieces.map((p) =>
        p.color === piece.color && p.id === piece.id ? newPiece : p
      ).filter((p) => p.color === piece.color);

      const finishedCount = updatedPlayerPieces.filter((p) => p.state === 'home' && p.step === 4).length;

      if (finishedCount >= PIECES_PER_PLAYER) {
        setWinner(piece.color);
        sounds.playWin();
        confetti({ particleCount: 150, spread: 90 });
        gfx.spawnCoinShower(50);
        if (piece.color === 'red') {
          onWinReward?.(gameMode === 'league' ? 400 : 200);
        }
        setLogMessage(`🎉 ${PLAYER_NAMES[piece.color].name} تمام مهره‌ها را وارد کاخ کرد و پیروز میدان شد!`);
        return;
      }

      // If rolled 6 or captured piece: Bonus Roll!
      if (rolled === 6 || capturedOpponent) {
        setHasRolled(false);
        gfx.spawnSparks(window.innerWidth / 2, window.innerHeight / 2, 35, '#f59e0b');
        setLogMessage(`جایزه پرتاب مجدد برای ${PLAYER_NAMES[piece.color].name}! 🎲`);
        if (gameMode === 'ai' && piece.color !== 'red') {
          setTimeout(() => rollDice(), 800);
        }
      } else {
        nextTurn();
      }
    }, 200);
  };

  // AI Auto-Roll trigger when turn shifts to AI
  useEffect(() => {
    if (gameMode === 'ai' && activeTurn !== 'red' && !hasRolled && !isRolling && !winner) {
      const timer = setTimeout(() => {
        rollDice();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [activeTurn, hasRolled, isRolling, gameMode, winner]);

  const moveablePieces = hasRolled ? getMoveablePieces(activeTurn, diceVal) : [];
  const isHumanTurn = activeTurn === 'red' || gameMode !== 'ai';

  return (
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-start p-1 sm:p-3 relative overflow-x-hidden z-10">
      
      {/* 🏰 FULL-SCREEN LUXURY CASTLE BACKGROUND */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none select-none bg-[#0a0705]">
        <img 
          src="/castle-ludo.jpg?v=2" 
          alt="Castle Background" 
          className="w-full h-full object-cover opacity-80 filter brightness-[0.55] contrast-[1.18] saturate-[0.9]"
          referrerPolicy="no-referrer"
        />
        {/* Dynamic Hearth Glow */}
        <div className="absolute inset-0 transition-opacity duration-1000 mix-blend-color-dodge animate-pulse"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(244, 63, 94, 0.15) 0%, rgba(0,0,0,0.95) 88%)`,
            animationDuration: '5s'
          }}
        />
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-2 text-slate-100 font-['Vazirmatn'] select-none relative">
      {/* Top Banner */}
      <GameModeBanner
        gameId="ludo"
        gameMode={gameMode}
        onModeChange={(mode) => {
          setGameMode(mode);
          resetGame();
        }}
        onBack={onBack}
      />

      {/* Sleek Ergonomic Turn & 3D Dice HUD Bar (All in 1 viewport on mobile!) */}
      <div className="w-full max-w-[440px] sm:max-w-[480px] bg-[#0c101a] border-2 border-amber-500/40 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between shadow-xl gap-2">
        {/* Left: Active Player Turn */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${PLAYER_NAMES[activeTurn].bgClass} flex items-center justify-center text-sm shadow-md ring-1 ring-white/40`}>
            👑
          </div>
          <div>
            <span className="text-[9px] text-slate-400">نوبت حرکت:</span>
            <div className={`text-xs font-black leading-none ${PLAYER_NAMES[activeTurn].colorClass}`}>
              {PLAYER_NAMES[activeTurn].name}
            </div>
          </div>
        </div>

        {/* Center: 3D WebGL Dice with Click Action */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-inner">
          <ThreeDice3D
            size={48}
            value={diceVal}
            isRolling={isRolling}
            onClick={() => {
              if (isHumanTurn && !hasRolled && !isRolling && !winner) {
                rollDice();
              }
            }}
            className="hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          />

          <button
            id="roll-ludo-dice-btn"
            onClick={rollDice}
            disabled={isRolling || hasRolled || !!winner || (!isHumanTurn)}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-1 cursor-pointer ${
              !hasRolled && !isRolling && !winner && isHumanTurn
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 animate-pulse active:scale-90'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>
              {isRolling
                ? 'چرخش...'
                : hasRolled
                ? `عدد ${diceVal}`
                : !isHumanTurn
                ? 'حریف...'
                : 'پرتاب تاس 🎲'}
            </span>
          </button>
        </div>

        {/* Right: Reset & Player Count */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPlayerCount((p) => (p === 2 ? 4 : 2))}
            title="تعداد بازیکنان"
            className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-400 text-[10px] font-bold text-slate-200 cursor-pointer"
          >
            {playerCount === 2 ? '۲ نفره' : '۴ نفره'}
          </button>
          <button
            onClick={resetGame}
            title="شروع مجدد"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 15x15 Mench Board (Responsive, zero scrolling needed!) */}
      <div className="relative w-[min(92vw,420px)] h-[min(92vw,420px)] sm:w-[460px] sm:h-[460px] bg-gradient-to-b from-[#241a12] via-[#150f0a] to-[#0d0906] border-4 border-amber-500/80 rounded-3xl shadow-2xl p-2 sm:p-2.5 relative overflow-hidden ring-1 ring-amber-400/60 gpu-layer">
        
        {/* Inner Board 15x15 Matrix */}
        <div className="w-full h-full relative grid grid-cols-15 grid-rows-15 gap-0.5 rounded-2xl bg-[#090705] p-1 border-2 border-amber-900/60 shadow-inner">
          
          {/* 4 Bases in Corners with Refined & Compact Luxury Pieces */}
          
          {/* 1. Red Base (Top Left) */}
          <div className="absolute top-1.5 left-1.5 w-[38%] h-[38%] rounded-2xl bg-gradient-to-br from-rose-950 via-rose-900/80 to-slate-950 border-2 border-rose-500/80 p-1.5 flex flex-col justify-between shadow-[inset_0_2px_8px_rgba(244,63,94,0.3)]">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-black text-rose-200 px-1">
              <span className="truncate">⚔️ قلعه سهراب</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)] shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 place-items-center">
              {pieces.filter((p) => p.color === 'red' && p.state === 'base').map((p) => {
                const canMove = moveablePieces.some((m) => m.color === 'red' && m.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => canMove && activeTurn === 'red' && movePiece(p, diceVal)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-400 via-rose-600 to-rose-900 border-2 border-rose-200 shadow-[0_3px_6px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,255,255,0.6)] flex items-center justify-center text-xs font-black text-white transition-all cursor-pointer ${
                      canMove && activeTurn === 'red' ? 'ring-4 ring-yellow-400 scale-110 animate-bounce' : 'hover:scale-105'
                    }`}
                  >
                    ♟
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Blue Base (Top Right) */}
          <div className="absolute top-1.5 right-1.5 w-[38%] h-[38%] rounded-2xl bg-gradient-to-bl from-cyan-950 via-cyan-900/80 to-slate-950 border-2 border-cyan-500/80 p-1.5 flex flex-col justify-between shadow-[inset_0_2px_8px_rgba(6,182,212,0.3)]">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-black text-cyan-200 px-1">
              <span className="truncate">🦅 قلعه سیمرغ</span>
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.9)] shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 place-items-center">
              {pieces.filter((p) => p.color === 'blue' && p.state === 'base').map((p) => {
                const canMove = moveablePieces.some((m) => m.color === 'blue' && m.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => canMove && activeTurn === 'blue' && movePiece(p, diceVal)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-300 via-cyan-500 to-cyan-900 border-2 border-cyan-100 shadow-[0_3px_6px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,255,255,0.6)] flex items-center justify-center text-xs font-black text-white transition-all cursor-pointer ${
                      canMove && activeTurn === 'blue' ? 'ring-4 ring-yellow-400 scale-110 animate-bounce' : 'hover:scale-105'
                    }`}
                  >
                    ♟
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Green Base (Bottom Left) */}
          <div className="absolute bottom-1.5 left-1.5 w-[38%] h-[38%] rounded-2xl bg-gradient-to-tr from-emerald-950 via-emerald-900/80 to-slate-950 border-2 border-emerald-500/80 p-1.5 flex flex-col justify-between shadow-[inset_0_2px_8px_rgba(16,185,129,0.3)]">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-black text-emerald-200 px-1">
              <span className="truncate">⚒️ قلعه کاوه</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 place-items-center">
              {pieces.filter((p) => p.color === 'green' && p.state === 'base').map((p) => {
                const canMove = moveablePieces.some((m) => m.color === 'green' && m.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => canMove && activeTurn === 'green' && movePiece(p, diceVal)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-900 border-2 border-emerald-200 shadow-[0_3px_6px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,255,255,0.6)] flex items-center justify-center text-xs font-black text-white transition-all cursor-pointer ${
                      canMove && activeTurn === 'green' ? 'ring-4 ring-yellow-400 scale-110 animate-bounce' : 'hover:scale-105'
                    }`}
                  >
                    ♟
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Yellow Base (Bottom Right) */}
          <div className="absolute bottom-1.5 right-1.5 w-[38%] h-[38%] rounded-2xl bg-gradient-to-tl from-amber-950 via-amber-900/80 to-slate-950 border-2 border-amber-500/80 p-1.5 flex flex-col justify-between shadow-[inset_0_2px_8px_rgba(245,158,11,0.3)]">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-black text-amber-200 px-1">
              <span className="truncate">👑 قلعه زال</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)] shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 place-items-center">
              {pieces.filter((p) => p.color === 'yellow' && p.state === 'base').map((p) => {
                const canMove = moveablePieces.some((m) => m.color === 'yellow' && m.id === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => canMove && activeTurn === 'yellow' && movePiece(p, diceVal)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-800 border-2 border-amber-100 shadow-[0_3px_6px_rgba(0,0,0,0.8),inset_0_1px_3px_rgba(255,255,255,0.6)] flex items-center justify-center text-xs font-black text-slate-950 transition-all cursor-pointer ${
                      canMove && activeTurn === 'yellow' ? 'ring-4 ring-yellow-400 scale-110 animate-bounce' : 'hover:scale-105'
                    }`}
                  >
                    ♟
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Palace / Goal Area Strictly Bounded to 20% x 20% (Does NOT overlap any track tiles!) */}
          <div
            style={{
              top: `${(6 / 15) * 100}%`,
              left: `${(6 / 15) * 100}%`,
              width: `${(3 / 15) * 100}%`,
              height: `${(3 / 15) * 100}%`,
            }}
            onClick={() => {
              if (isHumanTurn && !hasRolled && !isRolling && !winner) {
                rollDice();
              }
            }}
            className={`absolute rounded-xl border-2 flex flex-col items-center justify-center text-center p-1 z-10 transition-all select-none cursor-pointer ${
              !hasRolled && !isRolling && !winner && isHumanTurn
                ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.8)] ring-2 ring-yellow-300 scale-95'
                : 'bg-gradient-to-br from-slate-900 via-amber-950/80 to-slate-950 border-amber-500/50 shadow-md'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300 filter drop-shadow" />
            <span className="text-[8px] font-black text-amber-200 mt-0.5">کاخ پیروزی</span>
          </div>

          {/* Render 40 Track Tiles with Glowing Finish */}
          {TRACK_COORDS.map((coord, idx) => {
            const piecesOnTile = pieces.filter((p) => {
              if (p.state !== 'track') return false;
              const globalIndex = (PLAYER_START_INDICES[p.color] + p.step) % TOTAL_TRACK_STEPS;
              return globalIndex === idx;
            });

            const isRedStart = idx === 0;
            const isGreenStart = idx === 10;
            const isYellowStart = idx === 20;
            const isBlueStart = idx === 30;

            return (
              <div
                key={`track-${idx}`}
                style={{
                  left: `${(coord.x / 15) * 100}%`,
                  top: `${(coord.y / 15) * 100}%`,
                  width: `${(1 / 15) * 100}%`,
                  height: `${(1 / 15) * 100}%`,
                }}
                className={`absolute rounded-md border flex items-center justify-center transition-all ${
                  isRedStart
                    ? 'bg-rose-500/50 border-rose-400 font-black text-rose-300 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                    : isGreenStart
                    ? 'bg-emerald-500/50 border-emerald-400 font-black text-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                    : isYellowStart
                    ? 'bg-amber-500/50 border-amber-400 font-black text-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                    : isBlueStart
                    ? 'bg-cyan-500/50 border-cyan-400 font-black text-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                    : 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-900/40 hover:border-amber-400/60 shadow-inner'
                }`}
              >
                {piecesOnTile.map((p) => {
                  const canMove = moveablePieces.some((m) => m.color === p.color && m.id === p.id);
                  return (
                    <button
                      key={`${p.color}-${p.id}`}
                      onClick={() => canMove && activeTurn === p.color && movePiece(p, diceVal)}
                      className={`w-[85%] h-[85%] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center text-[9px] font-black border transition-all cursor-pointer ${
                        PLAYER_NAMES[p.color].bgClass
                      } ${PLAYER_NAMES[p.color].borderClass} ${
                        canMove && activeTurn === p.color ? 'ring-2 ring-yellow-300 scale-125 animate-pulse z-20 shadow-[0_0_10px_rgba(245,158,11,0.9)]' : 'text-white'
                      }`}
                    >
                      ♟
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Render 4 Colored Home Columns */}
          {activeColors.map((color) =>
            HOME_COORDS[color].map((coord, stepIdx) => {
              const piecesInHomeTile = pieces.filter(
                (p) => p.color === color && p.state === 'home' && p.step === stepIdx
              );
              return (
                <div
                  key={`home-${color}-${stepIdx}`}
                  style={{
                    left: `${(coord.x / 15) * 100}%`,
                    top: `${(coord.y / 15) * 100}%`,
                    width: `${(1 / 15) * 100}%`,
                    height: `${(1 / 15) * 100}%`,
                  }}
                  className={`absolute rounded-md border flex items-center justify-center ${
                    color === 'red'
                      ? 'bg-rose-600/30 border-rose-500'
                      : color === 'blue'
                      ? 'bg-cyan-600/30 border-cyan-500'
                      : color === 'yellow'
                      ? 'bg-amber-500/30 border-amber-400'
                      : 'bg-emerald-600/30 border-emerald-500'
                  }`}
                >
                  {piecesInHomeTile.map((p) => {
                    const canMove = moveablePieces.some((m) => m.color === p.color && m.id === p.id);
                    return (
                      <button
                        key={`${p.color}-${p.id}`}
                        onClick={() => canMove && activeTurn === p.color && movePiece(p, diceVal)}
                        className={`w-[85%] h-[85%] rounded-full shadow-md flex items-center justify-center text-[9px] font-black text-white ${
                          PLAYER_NAMES[p.color].bgClass
                        } ${canMove && activeTurn === p.color ? 'ring-2 ring-yellow-300 scale-125 animate-pulse' : ''}`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}

        </div>
      </div>

      {/* Live Game Commentary & Scores in a Single Compact Bar */}
      <div className="w-full max-w-[440px] sm:max-w-[480px] flex items-center justify-between bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 shadow-md">
        <div className="flex items-center gap-1.5 truncate">
          <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{logMessage}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeColors.map((color) => {
            const inHome = pieces.filter((p) => p.color === color && p.state === 'home' && p.step === 4).length;
            return (
              <span key={color} className={`font-bold font-mono text-[10px] ${PLAYER_NAMES[color].colorClass}`}>
                {inHome}/۴
              </span>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
};
