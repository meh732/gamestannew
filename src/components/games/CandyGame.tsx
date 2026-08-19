import React, { useState, useEffect, useCallback, useId } from 'react';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Flame } from 'lucide-react';

interface CandyGameProps {
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

const CANDY_TYPES = ['🍬', '🍭', '🍫', '🍩', '🧁', '🍓'];
const GRID_SIZE = 7;

export const CandyGame: React.FC<CandyGameProps> = ({ onBack, onWinReward }) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(20);
  const [isGameOver, setIsGameOver] = useState(false);

  const headingId = useId();

  // Create random grid without initial matches
  const createGrid = useCallback((): string[][] => {
    const newGrid: string[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: string[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let candy = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
        while (
          (r >= 2 && newGrid[r - 1][c] === candy && newGrid[r - 2][c] === candy) ||
          (c >= 2 && row[c - 1] === candy && row[c - 2] === candy)
        ) {
          candy = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
        }
        row.push(candy);
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  const resetGame = useCallback(() => {
    setGrid(createGrid());
    setSelectedCell(null);
    setScore(0);
    setMovesLeft(20);
    setIsGameOver(false);
    sounds.playMove();
  }, [createGrid]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Find all matches on board
  const checkMatches = (g: string[][]): { r: number; c: number }[] => {
    const matches = new Set<string>();

    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const candy = g[r][c];
        if (candy && candy === g[r][c + 1] && candy === g[r][c + 2]) {
          matches.add(`${r},${c}`);
          matches.add(`${r},${c + 1}`);
          matches.add(`${r},${c + 2}`);
        }
      }
    }

    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const candy = g[r][c];
        if (candy && candy === g[r + 1][c] && candy === g[r + 2][c]) {
          matches.add(`${r},${c}`);
          matches.add(`${r + 1},${c}`);
          matches.add(`${r + 2},${c}`);
        }
      }
    }

    return Array.from(matches).map((key) => {
      const [r, c] = key.split(',').map(Number);
      return { r, c };
    });
  };

  // Eliminate matches and refill board
  const processCascades = useCallback((currentGrid: string[][]) => {
    let g = currentGrid.map((row) => [...row]);
    let hasMatches = true;
    let cascadeScore = 0;

    while (hasMatches) {
      const matched = checkMatches(g);
      if (matched.length === 0) {
        hasMatches = false;
        break;
      }

      cascadeScore += matched.length * 30;
      matched.forEach(({ r, c }) => {
        g[r][c] = '';
      });

      // Drop down
      for (let c = 0; c < GRID_SIZE; c++) {
        let emptySpot = GRID_SIZE - 1;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (g[r][c] !== '') {
            g[emptySpot][c] = g[r][c];
            if (emptySpot !== r) {
              g[r][c] = '';
            }
            emptySpot--;
          }
        }
        // Fill top empty spots with new candies
        for (let r = emptySpot; r >= 0; r--) {
          g[r][c] = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
        }
      }
    }

    if (cascadeScore > 0) {
      setScore((s) => s + cascadeScore);
      sounds.playMatch();
    }
    setGrid(g);
  }, []);

  // Handle Candy Click and Swap
  const handleCellClick = (r: number, c: number) => {
    if (isGameOver) return;

    if (!selectedCell) {
      setSelectedCell([r, c]);
      sounds.playClick();
    } else {
      const [sr, sc] = selectedCell;
      const isAdjacent = Math.abs(sr - r) + Math.abs(sc - c) === 1;

      if (isAdjacent) {
        const simGrid = grid.map((row) => [...row]);
        [simGrid[sr][sc], simGrid[r][c]] = [simGrid[r][c], simGrid[sr][sc]];

        const matches = checkMatches(simGrid);
        if (matches.length > 0) {
          processCascades(simGrid);
          const nextMoves = movesLeft - 1;
          setMovesLeft(nextMoves);

          if (nextMoves <= 0) {
            setIsGameOver(true);
            sounds.playWin();
            confetti({ particleCount: 90, spread: 70 });
            onWinReward?.(score > 1000 ? 120 : 60);
          }
        } else {
          sounds.playError();
        }
      }

      setSelectedCell(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 flex flex-col gap-4 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-pink-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl shadow-md shadow-pink-500/20">
            🍬
          </div>
          <div>
            <h1 id={headingId} className="text-lg sm:text-xl font-bold text-pink-300">جورچین آبنبات گیمستان</h1>
            <p className="text-xs text-slate-400">تطبیق ۳تایی آبنبات‌های رنگارنگ</p>
          </div>
        </div>

        {onBack && (
          <button
            id="candy-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            بازگشت
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs font-bold">
        <div className="flex items-center gap-1.5 text-pink-300">
          <Flame className="w-4 h-4" />
          <span>امتیاز: {score}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300">
          <span>حرکات باقیمانده: {movesLeft}</span>
        </div>
      </div>

      {/* 7x7 Grid */}
      <div className="relative aspect-square w-full max-w-[420px] mx-auto bg-slate-950 p-3 rounded-2xl border-2 border-pink-500/40 shadow-2xl shadow-black/80">
        <div className="grid grid-cols-7 grid-rows-7 gap-1.5 w-full h-full bg-slate-900/90 p-2 rounded-xl border border-slate-800">
          {grid.map((row, r) =>
            row.map((candy, c) => {
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              return (
                <button
                  key={`${r}-${c}`}
                  id={`candy-cell-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`flex items-center justify-center rounded-xl text-2xl sm:text-3xl transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-pink-500/40 ring-2 ring-pink-400 scale-105'
                      : 'bg-slate-800/80 hover:bg-slate-700/80'
                  }`}
                >
                  {candy}
                </button>
              );
            })
          )}
        </div>

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
            <Trophy className="w-14 h-14 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-pink-300">پایان حرکات!</h2>
            <p className="text-sm font-bold text-slate-300">امتیاز کسب شده: {score} امتیاز</p>
            <button
              id="candy-play-again-btn"
              onClick={resetGame}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-slate-950 font-bold shadow-lg shadow-pink-500/30 transition-all text-xs"
            >
              بازی دوباره 🍬
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          id="candy-reset-btn"
          onClick={resetGame}
          className="flex items-center gap-2 py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-pink-400" />
          <span>شروع نو</span>
        </button>
      </div>
    </div>
  );
};
