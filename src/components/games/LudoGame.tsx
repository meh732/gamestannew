import React, { useState, useEffect, useRef } from 'react';
import { GameMode } from '../../types';
import { sounds } from '../../utils/audio';
import { GameModeBanner } from '../common/GameModeBanner';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Trophy,
  Crown,
  Sparkles,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
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
  // Red start is at (6, 1) -> index 0 relative to Red
  // Top Arm (Left side going down to center)
  { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 },
  // Left Arm (going left)
  { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, { x: 0, y: 6 },
  { x: 0, y: 7 }, // Middle left
  { x: 0, y: 8 }, { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 },
  // Bottom Arm (going down)
  { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, { x: 6, y: 14 },
  { x: 7, y: 14 }, // Middle bottom
  { x: 8, y: 14 }, { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 },
  // Right Arm (going right)
  { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 },
  { x: 14, y: 7 }, // Middle right
  { x: 14, y: 6 }, { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 },
  // Top Arm (going up)
  { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 8, y: 1 }, { x: 8, y: 0 },
  { x: 7, y: 0 }, // Middle top
];

// Start tile indices on 40-step perimeter track for each player
const PLAYER_START_INDICES: Record<PlayerColor, number> = {
  red: 0,     // Top left start (6, 1)
  green: 10,  // Bottom left start (1, 8)
  yellow: 20, // Bottom right start (8, 13)
  blue: 30,   // Top right start (13, 6)
};

// Home columns (4 tiles into center for each player)
const HOME_COORDS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }],
  green: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }],
  yellow: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }],
  blue: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }],
};

// Base piece spawn coordinates (4 slots in each base)
const BASE_SLOTS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [{ x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 }, { x: 1.5, y: 3.5 }, { x: 3.5, y: 3.5 }],
  blue: [{ x: 10.5, y: 1.5 }, { x: 12.5, y: 1.5 }, { x: 10.5, y: 3.5 }, { x: 12.5, y: 3.5 }],
  yellow: [{ x: 10.5, y: 10.5 }, { x: 12.5, y: 10.5 }, { x: 10.5, y: 12.5 }, { x: 12.5, y: 12.5 }],
  green: [{ x: 1.5, y: 10.5 }, { x: 3.5, y: 10.5 }, { x: 1.5, y: 12.5 }, { x: 3.5, y: 12.5 }],
};

const PLAYER_NAMES: Record<PlayerColor, { name: string; hero: string; colorClass: string; bgClass: string; borderClass: string }> = {
  red: { name: 'سهراب یل', hero: 'پهلوان توران', colorClass: 'text-rose-400', bgClass: 'bg-rose-600', borderClass: 'border-rose-400' },
  blue: { name: 'سیمرغ دانا', hero: 'دانای قاف', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-600', borderClass: 'border-cyan-400' },
  yellow: { name: 'زال زر', hero: 'پهلوان زرین', colorClass: 'text-amber-400', bgClass: 'bg-amber-500', borderClass: 'border-amber-400' },
  green: { name: 'کاوه آهنگر', hero: 'پرچمدار داد', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-400' },
};

const PIECES_PER_PLAYER = 4;
const TOTAL_TRACK_STEPS = 40;

export const LudoGame: React.FC<LudoGameProps> = ({
  initialMode = 'ai',
  onBack,
  onWinReward,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [playerCount, setPlayerCount] = useState<2 | 4>(2);
  const [activeTurn, setActiveTurn] = useState<PlayerColor>('red');
  const [diceVal, setDiceVal] = useState<number>(6);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [logMessage, setLogMessage] = useState<string>('بازی منچ اصیل آغاز شد. برای شروع تاس بریزید!');

  // 4 pieces for each active player
  const [pieces, setPieces] = useState<Piece[]>(() => {
    const init: Piece[] = [];
    const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];
    colors.forEach((color) => {
      for (let i = 0; i < PIECES_PER_PLAYER; i++) {
        init.push({ id: i, color, state: 'base', step: 0 });
      }
    });
    return init;
  });

  const activeColors: PlayerColor[] = playerCount === 2 ? ['red', 'blue'] : ['red', 'green', 'yellow', 'blue'];

  const resetGame = () => {
    const init: Piece[] = [];
    const colors: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];
    colors.forEach((color) => {
      for (let i = 0; i < PIECES_PER_PLAYER; i++) {
        init.push({ id: i, color, state: 'base', step: 0 });
      }
    });
    setPieces(init);
    setActiveTurn('red');
    setDiceVal(6);
    setHasRolled(false);
    setIsRolling(false);
    setWinner(null);
    setLogMessage('بازی منچ جدید آغاز شد. نوبت سهراب یل (قرمز) است.');
    sounds.playMove();
  };

  // Switch Turn to Next Player
  const nextTurn = () => {
    setHasRolled(false);
    const currentIndex = activeColors.indexOf(activeTurn);
    const nextIndex = (currentIndex + 1) % activeColors.length;
    const nextColor = activeColors[nextIndex];
    setActiveTurn(nextColor);
    setLogMessage(`نوبت ${PLAYER_NAMES[nextColor].name} (${nextColor === 'red' ? 'قرمز' : nextColor === 'blue' ? 'آبی' : nextColor === 'yellow' ? 'زرد' : 'سبز'}) است.`);
  };

  // Roll Dice Action
  const rollDice = () => {
    if (isRolling || hasRolled || winner) return;
    setIsRolling(true);
    sounds.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setDiceVal(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 7) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDiceVal(finalVal);
        setIsRolling(false);
        setHasRolled(true);

        // Check if player has any valid moves
        handleAfterRoll(finalVal, activeTurn);
      }
    }, 60);
  };

  // Calculate moveable pieces for active player
  const getMoveablePieces = (color: PlayerColor, rolled: number) => {
    const playerPieces = pieces.filter((p) => p.color === color);
    return playerPieces.filter((p) => {
      if (p.state === 'base') {
        return rolled === 6;
      }
      if (p.state === 'track') {
        return p.step + rolled <= TOTAL_TRACK_STEPS + 4;
      }
      if (p.state === 'home') {
        return p.step + rolled <= 4;
      }
      return false;
    });
  };

  const handleAfterRoll = (rolled: number, color: PlayerColor) => {
    const validMoves = getMoveablePieces(color, rolled);

    if (validMoves.length === 0) {
      setLogMessage(`تاس ${rolled} آمد اما مهره‌ای برای حرکت وجود ندارد!`);
      setTimeout(() => {
        nextTurn();
      }, 1200);
      return;
    }

    setLogMessage(`تاس ${rolled} آمد. ${validMoves.length} مهره امکان حرکت دارند. مهره خود را انتخاب کنید.`);

    // If AI Turn: Automatically choose the best move
    if (gameMode === 'ai' && color !== 'red') {
      setTimeout(() => {
        handleAIMove(validMoves, rolled, color);
      }, 700);
    }
  };

  // AI Strategic Move Selection
  const handleAIMove = (validMoves: Piece[], rolled: number, color: PlayerColor) => {
    // 1. Prefer bringing piece out of base on 6
    const basePiece = validMoves.find((p) => p.state === 'base');
    // 2. Prefer capturing opponent
    const capturePiece = validMoves.find((p) => {
      if (p.state !== 'track') return false;
      const targetStep = p.step + rolled;
      if (targetStep >= TOTAL_TRACK_STEPS) return false;
      const targetGlobalIndex = (PLAYER_START_INDICES[color] + targetStep) % TOTAL_TRACK_STEPS;
      return pieces.some(
        (other) =>
          other.color !== color &&
          other.state === 'track' &&
          (PLAYER_START_INDICES[other.color] + other.step) % TOTAL_TRACK_STEPS === targetGlobalIndex
      );
    });

    const chosenPiece = capturePiece || (rolled === 6 && basePiece ? basePiece : validMoves[0]);
    movePiece(chosenPiece, rolled);
  };

  // Move Selected Piece
  const movePiece = (piece: Piece, rolled: number) => {
    if (winner) return;

    let newPiece = { ...piece };
    let capturedOpponent = false;

    if (piece.state === 'base') {
      if (rolled !== 6) return;
      newPiece.state = 'track';
      newPiece.step = 0;
      sounds.playMove();
      setLogMessage(`مهره وارد زمین بازی شد! با تاس ۶، یک پرتاب جایزه دارید 🎲`);
    } else if (piece.state === 'track') {
      const newStep = piece.step + rolled;
      if (newStep >= TOTAL_TRACK_STEPS) {
        // Entering home stretch
        const homeStep = newStep - TOTAL_TRACK_STEPS;
        if (homeStep >= 4) {
          newPiece.state = 'home';
          newPiece.step = 4; // Completed
          sounds.playWin();
          setLogMessage('مهره با موفقیت به کاخ نهایی رسید! 🏆');
        } else {
          newPiece.state = 'home';
          newPiece.step = homeStep;
          sounds.playMove();
          setLogMessage(`مهره وارد ستون خانه امن شد (پله ${homeStep + 1}).`);
        }
      } else {
        newPiece.step = newStep;
        sounds.playMove();

        // Check for opponent capture on main track
        const globalIndex = (PLAYER_START_INDICES[piece.color] + newStep) % TOTAL_TRACK_STEPS;
        const targetOpponent = pieces.find(
          (other) =>
            other.color !== piece.color &&
            other.state === 'track' &&
            (PLAYER_START_INDICES[other.color] + other.step) % TOTAL_TRACK_STEPS === globalIndex
        );

        if (targetOpponent) {
          capturedOpponent = true;
          sounds.playCapture();
          setLogMessage(`⚔️ مهره ${PLAYER_NAMES[targetOpponent.color].name} زده شد و به پایگاه بازگشت!`);
        }
      }
    } else if (piece.state === 'home') {
      const newHomeStep = piece.step + rolled;
      if (newHomeStep <= 4) {
        newPiece.step = newHomeStep;
        if (newHomeStep === 4) {
          sounds.playWin();
          setLogMessage('مهره به خط پایان رسید! 👑');
        } else {
          sounds.playMove();
        }
      } else {
        return; // Exact roll needed
      }
    }

    // Update pieces state
    setPieces((prev) =>
      prev.map((p) => {
        if (p.color === piece.color && p.id === piece.id) {
          return newPiece;
        }
        // If captured opponent, send back to base
        if (
          capturedOpponent &&
          p.color !== piece.color &&
          p.state === 'track' &&
          (PLAYER_START_INDICES[p.color] + p.step) % TOTAL_TRACK_STEPS ===
            (PLAYER_START_INDICES[piece.color] + (newPiece.step || 0)) % TOTAL_TRACK_STEPS
        ) {
          return { ...p, state: 'base', step: 0 };
        }
        return p;
      })
    );

    // Check Win Condition: All 4 pieces in home (step === 4)
    setTimeout(() => {
      const updatedPlayerPieces = pieces.map((p) =>
        p.color === piece.color && p.id === piece.id ? newPiece : p
      ).filter((p) => p.color === piece.color);

      const finishedCount = updatedPlayerPieces.filter((p) => p.state === 'home' && p.step === 4).length;

      if (finishedCount >= PIECES_PER_PLAYER) {
        setWinner(piece.color);
        sounds.playWin();
        confetti({ particleCount: 150, spread: 90 });
        if (piece.color === 'red') {
          onWinReward?.(gameMode === 'league' ? 400 : 200);
        }
        setLogMessage(`🎉 ${PLAYER_NAMES[piece.color].name} تمام مهره‌ها را وارد کاخ کرد و پیروز میدان شد!`);
        return;
      }

      // If rolled 6 or captured piece: Bonus Roll!
      if (rolled === 6 || capturedOpponent) {
        setHasRolled(false);
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

  // Render SVG Dice Icon
  const renderDiceIcon = (val: number) => {
    switch (val) {
      case 1: return <Dice1 className="w-10 h-10 text-amber-400" />;
      case 2: return <Dice2 className="w-10 h-10 text-amber-400" />;
      case 3: return <Dice3 className="w-10 h-10 text-amber-400" />;
      case 4: return <Dice4 className="w-10 h-10 text-amber-400" />;
      case 5: return <Dice5 className="w-10 h-10 text-amber-400" />;
      default: return <Dice6 className="w-10 h-10 text-amber-400" />;
    }
  };

  const moveablePieces = hasRolled ? getMoveablePieces(activeTurn, diceVal) : [];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 text-slate-100 font-['Vazirmatn'] select-none p-2 sm:p-4">
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

      {/* Main Board & Sidebar Grid */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-6">
        
        {/* The Authentic 15x15 Classic Cross Mench Board */}
        <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[500px] md:h-[500px] bg-[#120e09] border-4 border-amber-500/60 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.2)] p-2 relative overflow-hidden">
          
          {/* Inner Board 15x15 Matrix */}
          <div className="w-full h-full relative grid grid-cols-15 grid-rows-15 gap-0.5 rounded-2xl bg-slate-950 p-1">
            
            {/* 4 Bases in Corners */}
            {/* 1. Red Base (Top Left) */}
            <div className="absolute top-2 left-2 w-[38%] h-[38%] rounded-2xl bg-gradient-to-br from-rose-950/80 to-rose-900/60 border-2 border-rose-500/60 p-2 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-black text-rose-300">
                <span>🏰 قلعه سهراب (قرمز)</span>
                <span className="text-xs">🔴</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1">
                {pieces.filter((p) => p.color === 'red' && p.state === 'base').map((p) => {
                  const canMove = moveablePieces.some((m) => m.color === 'red' && m.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => canMove && activeTurn === 'red' && movePiece(p, diceVal)}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-rose-600 border-2 border-rose-300 shadow-md flex items-center justify-center text-xs font-black text-white transition-all cursor-pointer ${
                        canMove && activeTurn === 'red' ? 'ring-4 ring-yellow-400 scale-110 animate-bounce' : 'opacity-90'
                      }`}
                    >
                      ♟️
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Blue Base (Top Right) */}
            <div className="absolute top-2 right-2 w-[38%] h-[38%] rounded-2xl bg-gradient-to-bl from-cyan-950/80 to-cyan-900/60 border-2 border-cyan-500/60 p-2 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-black text-cyan-300">
                <span>🏰 قلعه سیمرغ (آبی)</span>
                <span className="text-xs">🔵</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1">
                {pieces.filter((p) => p.color === 'blue' && p.state === 'base').map((p) => {
                  const canMove = moveablePieces.some((m) => m.color === 'blue' && m.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => canMove && activeTurn === 'blue' && movePiece(p, diceVal)}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-cyan-600 border-2 border-cyan-300 shadow-md flex items-center justify-center text-xs font-black text-white transition-all cursor-pointer ${
                        canMove && activeTurn === 'blue' ? 'ring-4 ring-yellow-400 scale-110 animate-bounce' : 'opacity-90'
                      }`}
                    >
                      ♟️
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Green Base (Bottom Left) */}
            <div className="absolute bottom-2 left-2 w-[38%] h-[38%] rounded-2xl bg-gradient-to-tr from-emerald-950/80 to-emerald-900/60 border-2 border-emerald-500/60 p-2 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-black text-emerald-300">
                <span>🏰 قلعه کاوه (سبز)</span>
                <span className="text-xs">🟢</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1">
                {pieces.filter((p) => p.color === 'green' && p.state === 'base').map((p) => {
                  const canMove = moveablePieces.some((m) => m.color === 'green' && m.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => canMove && activeTurn === 'green' && movePiece(p, diceVal)}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-600 border-2 border-emerald-300 shadow-md flex items-center justify-center text-xs font-black text-white transition-all cursor-pointer ${
                        canMove && activeTurn === 'green' ? 'ring-4 ring-yellow-400 scale-110 animate-bounce' : 'opacity-90'
                      }`}
                    >
                      ♟️
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Yellow Base (Bottom Right) */}
            <div className="absolute bottom-2 right-2 w-[38%] h-[38%] rounded-2xl bg-gradient-to-tl from-amber-950/80 to-amber-900/60 border-2 border-amber-500/60 p-2 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-black text-amber-300">
                <span>🏰 قلعه زال (زرد)</span>
                <span className="text-xs">🟡</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1">
                {pieces.filter((p) => p.color === 'yellow' && p.state === 'base').map((p) => {
                  const canMove = moveablePieces.some((m) => m.color === 'yellow' && m.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => canMove && activeTurn === 'yellow' && movePiece(p, diceVal)}
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-500 border-2 border-amber-200 shadow-md flex items-center justify-center text-xs font-black text-slate-950 transition-all cursor-pointer ${
                        canMove && activeTurn === 'yellow' ? 'ring-4 ring-yellow-400 scale-110 animate-bounce' : 'opacity-90'
                      }`}
                    >
                      ♟️
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Palace / Goal Area */}
            <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 border-2 border-amber-300 shadow-2xl flex flex-col items-center justify-center text-center p-1 z-10">
              <Crown className="w-5 h-5 text-slate-950 animate-bounce" />
              <span className="text-[10px] font-black text-slate-950 leading-tight">کاخ پیروزی</span>
            </div>

            {/* Render 40 Track Tiles */}
            {TRACK_COORDS.map((coord, idx) => {
              // Find pieces on this global track tile
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
                  className={`absolute rounded-md border flex items-center justify-center transition-colors ${
                    isRedStart
                      ? 'bg-rose-500/40 border-rose-400 font-bold text-rose-300'
                      : isGreenStart
                      ? 'bg-emerald-500/40 border-emerald-400 font-bold text-emerald-300'
                      : isYellowStart
                      ? 'bg-amber-500/40 border-amber-400 font-bold text-amber-300'
                      : isBlueStart
                      ? 'bg-cyan-500/40 border-cyan-400 font-bold text-cyan-300'
                      : 'bg-slate-900/90 border-slate-700/80 hover:border-amber-400/40'
                  }`}
                >
                  {piecesOnTile.map((p) => {
                    const canMove = moveablePieces.some((m) => m.color === p.color && m.id === p.id);
                    return (
                      <button
                        key={`${p.color}-${p.id}`}
                        onClick={() => canMove && activeTurn === p.color && movePiece(p, diceVal)}
                        className={`w-[85%] h-[85%] rounded-full shadow-lg flex items-center justify-center text-[10px] font-black border transition-all cursor-pointer ${
                          PLAYER_NAMES[p.color].bgClass
                        } ${PLAYER_NAMES[p.color].borderClass} ${
                          canMove && activeTurn === p.color ? 'ring-2 ring-yellow-300 scale-125 animate-pulse z-20' : 'text-white'
                        }`}
                      >
                        ♟
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Render 4 Colored Home Columns (4 tiles each into center) */}
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
                          className={`w-[85%] h-[85%] rounded-full shadow-md flex items-center justify-center text-[10px] font-black text-white ${
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

        {/* Action & Status Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-3.5">
          
          {/* Active Turn Header */}
          <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl ${PLAYER_NAMES[activeTurn].bgClass} flex items-center justify-center text-xl shadow-md`}>
                👑
              </div>
              <div>
                <span className="text-[10px] text-slate-400">نوبت پرتاب تاس:</span>
                <h3 className={`text-sm font-black ${PLAYER_NAMES[activeTurn].colorClass}`}>
                  {PLAYER_NAMES[activeTurn].name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPlayerCount((p) => (p === 2 ? 4 : 2))}
                className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-400 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              >
                {playerCount === 2 ? '۲ نفره' : '۴ نفره'}
              </button>
              <button
                onClick={resetGame}
                title="شروع مجدد بازی"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3D Dice Action Pod */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 p-5 rounded-3xl flex flex-col items-center gap-4 shadow-xl text-center">
            <div className="text-xs text-slate-400 font-bold">تاس شانس اساطیری</div>

            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-2xl shadow-amber-500/20 transition-transform ${
              isRolling ? 'rotate-180 scale-110 animate-spin' : 'scale-100'
            }`}>
              {renderDiceIcon(diceVal)}
            </div>

            <div className="text-sm font-black text-amber-300">
              عدد تاس: <span className="font-mono text-xl">{diceVal}</span>
            </div>

            {/* Roll Dice Button */}
            <button
              id="roll-ludo-dice-btn"
              onClick={rollDice}
              disabled={isRolling || hasRolled || !!winner || (gameMode === 'ai' && activeTurn !== 'red')}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                !hasRolled && !isRolling && !winner && !(gameMode === 'ai' && activeTurn !== 'red')
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 active:scale-95 animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>
                {isRolling
                  ? 'در حال چرخش تاس...'
                  : hasRolled
                  ? 'مهره خود را حرکت دهید'
                  : gameMode === 'ai' && activeTurn !== 'red'
                  ? 'نوبت حریف رایانه‌ای...'
                  : 'پرتاب تاس منچ 🎲'}
              </span>
            </button>
          </div>

          {/* Live Game Commentary Log */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-2 text-xs text-slate-300 leading-relaxed shadow-md">
            <Swords className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{logMessage}</p>
          </div>

          {/* Player Piece Progress Cards */}
          <div className="grid grid-cols-2 gap-2">
            {activeColors.map((color) => {
              const inHome = pieces.filter((p) => p.color === color && p.state === 'home' && p.step === 4).length;
              return (
                <div
                  key={color}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    activeTurn === color ? 'bg-slate-900 border-amber-400' : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <span className={`font-bold ${PLAYER_NAMES[color].colorClass}`}>
                    {PLAYER_NAMES[color].name}
                  </span>
                  <span className="font-mono text-amber-300 font-bold">{inHome} / ۴ کاخ</span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
