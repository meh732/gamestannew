import React, { useState, useEffect, useCallback, useId } from 'react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Shuffle } from 'lucide-react';

interface PuzzleGameProps {
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ onBack, onWinReward }) => {
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const headingId = useId();

  // Create solvable scrambled board
  const shuffleBoard = useCallback(() => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    let emptyIdx = 15;

    // Simulate 100 random valid moves
    for (let i = 0; i < 120; i++) {
      const neighbors: number[] = [];
      const r = Math.floor(emptyIdx / 4);
      const c = emptyIdx % 4;

      if (r > 0) neighbors.push(emptyIdx - 4);
      if (r < 3) neighbors.push(emptyIdx + 4);
      if (c > 0) neighbors.push(emptyIdx - 1);
      if (c < 3) neighbors.push(emptyIdx + 1);

      const targetIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
      [arr[emptyIdx], arr[targetIdx]] = [arr[targetIdx], arr[emptyIdx]];
      emptyIdx = targetIdx;
    }

    setBoard(arr);
    setMoves(0);
    setTimerSeconds(0);
    setIsWon(false);
    sounds.playMove();
  }, []);

  useEffect(() => {
    shuffleBoard();
  }, [shuffleBoard]);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  // Check Win Condition
  const checkWin = (b: number[]): boolean => {
    for (let i = 0; i < 15; i++) {
      if (b[i] !== i + 1) return false;
    }
    return b[15] === 0;
  };

  // Move Tile
  const handleTileClick = (idx: number) => {
    if (isWon || board[idx] === 0) return;

    const emptyIdx = board.indexOf(0);
    const r1 = Math.floor(idx / 4);
    const c1 = idx % 4;
    const r2 = Math.floor(emptyIdx / 4);
    const c2 = emptyIdx % 4;

    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (isAdjacent) {
      const newBoard = [...board];
      [newBoard[idx], newBoard[emptyIdx]] = [newBoard[emptyIdx], newBoard[idx]];
      setBoard(newBoard);
      setMoves((m) => m + 1);
      sounds.playMove();

      if (checkWin(newBoard)) {
        setIsWon(true);
        sounds.playWin();
        confetti({ particleCount: 90, spread: 70 });
        onWinReward?.(90);
      }
    } else {
      sounds.playError();
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-3 sm:p-5 flex flex-col gap-4 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-fuchsia-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-2xl shadow-md shadow-fuchsia-500/20">
            🧩
          </div>
          <div>
            <h1 id={headingId} className="text-lg sm:text-xl font-bold text-fuchsia-300">پازل کشویی ۱۵</h1>
            <p className="text-xs text-slate-400">مرتب‌سازی اعداد ۱ تا ۱۵</p>
          </div>
        </div>

        {onBack && (
          <button
            id="puzzle-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            بازگشت
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs font-bold">
        <span className="text-slate-300">حرکات: <strong className="text-fuchsia-400 text-sm">{moves}</strong></span>
        <span className="text-slate-300">زمان: <strong className="text-amber-400 font-mono text-sm">{formatTimer(timerSeconds)}</strong></span>
      </div>

      {/* 4x4 Sliding Grid */}
      <div className="relative aspect-square w-full bg-slate-950 p-3 rounded-2xl border-2 border-fuchsia-500/40 shadow-2xl shadow-black/80">
        <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
          {board.map((tile, idx) => {
            if (tile === 0) {
              return <div key={idx} className="rounded-xl bg-slate-950/60 border border-dashed border-slate-800" />;
            }
            return (
              <button
                key={idx}
                id={`puzzle-tile-${idx}`}
                onClick={() => handleTileClick(idx)}
                className="flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-700 to-indigo-900 hover:from-purple-600 hover:to-indigo-800 text-slate-100 font-black text-2xl shadow-lg border border-purple-500/40 active:scale-95 transition-all cursor-pointer select-none"
              >
                {tile}
              </button>
            );
          })}
        </div>

        {/* Win Modal */}
        {isWon && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
            <Trophy className="w-14 h-14 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-fuchsia-300">پازل حل شد! 🎉</h2>
            <p className="text-xs text-slate-300">
              در {moves} حرکت و زمان {formatTimer(timerSeconds)}
            </p>
            <button
              id="puzzle-play-again-btn"
              onClick={shuffleBoard}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-slate-950 font-bold shadow-lg shadow-fuchsia-500/30 transition-all"
            >
              بازی مجدد 🧩
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-2">
        <button
          id="puzzle-shuffle-btn"
          onClick={shuffleBoard}
          className="flex items-center gap-2 py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <Shuffle className="w-4 h-4 text-fuchsia-400" />
          <span>بهم ریختن دوباره</span>
        </button>
      </div>
    </div>
  );
};
