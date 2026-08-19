import React, { useState, useEffect, useCallback, useId } from 'react';
import { SudokuDifficulty, SudokuGrid } from '../../types';
import { generateSudoku, findConflicts, createEmptyGrid } from '../../utils/sudokuEngine';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { RotateCcw, Lightbulb, Pencil, Eraser, Trophy } from 'lucide-react';

interface SudokuGameProps {
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

export const SudokuGame: React.FC<SudokuGameProps> = ({ onBack, onWinReward }) => {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>(() => createEmptyGrid());
  const [currentGrid, setCurrentGrid] = useState<SudokuGrid>(() => createEmptyGrid());
  const [solutionGrid, setSolutionGrid] = useState<SudokuGrid>(() => createEmptyGrid());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [notes, setNotes] = useState<Set<number>[][]>(() =>
    Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>()))
  );
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);

  const headingId = useId();

  // Load new puzzle
  const startNewGame = useCallback((diff: SudokuDifficulty = difficulty) => {
    const { initial, solution } = generateSudoku(diff);
    setInitialGrid(initial);
    setCurrentGrid(initial.map((row) => [...row]));
    setSolutionGrid(solution);
    setSelectedCell(null);
    setNotes(Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set<number>())));
    setMistakes(0);
    setTimerSeconds(0);
    setIsPaused(false);
    setIsComplete(false);
    setHintsLeft(3);
    sounds.playMove();
  }, [difficulty]);

  useEffect(() => {
    startNewGame('easy');
  }, [startNewGame]);

  // Timer
  useEffect(() => {
    if (isPaused || isComplete) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isComplete]);

  // Check completion
  const checkWin = (grid: SudokuGrid) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0 || grid[r][c] !== solutionGrid[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  // Handle number input
  const handleNumberInput = (num: number) => {
    if (!selectedCell || isComplete || isPaused) return;
    const [r, c] = selectedCell;
    if (initialGrid[r][c] !== 0) return; // Cannot edit original clue

    if (isPencilMode) {
      setNotes((prevNotes) => {
        const newNotes = prevNotes.map((row) => row.map((set) => new Set(set)));
        if (newNotes[r][c].has(num)) {
          newNotes[r][c].delete(num);
        } else {
          newNotes[r][c].add(num);
        }
        sounds.playClick();
        return newNotes;
      });
    } else {
      const newGrid = currentGrid.map((row) => [...row]);
      newGrid[r][c] = num;
      setCurrentGrid(newGrid);

      // Check if mistake
      if (solutionGrid[r][c] !== 0 && solutionGrid[r][c] !== num) {
        setMistakes((m) => m + 1);
        sounds.playError();
      } else {
        sounds.playMove();
      }

      if (checkWin(newGrid)) {
        setIsComplete(true);
        sounds.playWin();
        confetti({ particleCount: 100, spread: 80 });
        onWinReward?.(100);
      }
    }
  };

  // Handle Erase
  const handleErase = () => {
    if (!selectedCell || isComplete || isPaused) return;
    const [r, c] = selectedCell;
    if (initialGrid[r][c] !== 0) return;

    const newGrid = currentGrid.map((row) => [...row]);
    newGrid[r][c] = 0;
    setCurrentGrid(newGrid);

    setNotes((prevNotes) => {
      const newNotes = prevNotes.map((row) => row.map((set) => new Set(set)));
      newNotes[r][c].clear();
      return newNotes;
    });
    sounds.playClick();
  };

  // Handle Hint
  const handleHint = () => {
    if (!selectedCell || hintsLeft <= 0 || isComplete || isPaused) return;
    const [r, c] = selectedCell;
    if (initialGrid[r][c] !== 0) return;

    const correctNum = solutionGrid[r][c];
    const newGrid = currentGrid.map((row) => [...row]);
    newGrid[r][c] = correctNum;
    setCurrentGrid(newGrid);
    setHintsLeft((h) => h - 1);
    sounds.playWin();

    if (checkWin(newGrid)) {
      setIsComplete(true);
      confetti({ particleCount: 80, spread: 70 });
      onWinReward?.(80);
    }
  };

  const conflicts = findConflicts(currentGrid);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-5 flex flex-col gap-4 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-sky-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-2xl shadow-md shadow-sky-500/20">
            🔢
          </div>
          <div>
            <h1 id={headingId} className="text-lg sm:text-xl font-bold text-sky-300">سودوکو حرفه‌ای گیمستان</h1>
            <p className="text-xs text-slate-400">تقویت حافظه و هوش منطقی</p>
          </div>
        </div>

        {onBack && (
          <button
            id="sudoku-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            بازگشت
          </button>
        )}
      </div>

      {/* Difficulty Tabs & Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 p-2.5 rounded-2xl border border-slate-800">
        {/* Difficulty Buttons */}
        <div className="flex items-center gap-1.5">
          {(['easy', 'medium', 'hard', 'expert'] as SudokuDifficulty[]).map((d) => (
            <button
              key={d}
              id={`sudoku-diff-${d}`}
              onClick={() => {
                setDifficulty(d);
                startNewGame(d);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                difficulty === d
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {d === 'easy' ? 'ساده' : d === 'medium' ? 'متوسط' : d === 'hard' ? 'سخت' : 'حرفه‌ای'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-red-400">خطاها: {mistakes}/3</div>
          <div className="px-2.5 py-1 rounded-lg bg-slate-800 font-mono text-sky-300">⏱ {formatTimer(timerSeconds)}</div>
        </div>
      </div>

      {/* 9x9 Grid with Persian Sapphire & Gold Border Theme */}
      <div className="relative aspect-square w-full max-w-[440px] mx-auto bg-gradient-to-b from-[#0e1d2c] via-[#09121d] to-[#04080e] p-3 sm:p-4 rounded-3xl border-4 border-sky-500/70 shadow-[0_25px_65px_rgba(0,0,0,0.95),0_0_35px_rgba(14,165,233,0.25)] ring-1 ring-sky-400/50">
        <div className="grid grid-cols-9 grid-rows-9 gap-0.5 w-full h-full bg-[#060c14] rounded-2xl overflow-hidden border-2 border-sky-600/70 shadow-inner">
          {currentGrid.map((row, r) =>
            row.map((val, c) => {
              const isInitial = initialGrid[r][c] !== 0;
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isConflict = conflicts.has(`${r},${c}`);
              const cellNotes = Array.from(notes[r][c]);

              // Border accents for 3x3 subgrids
              const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-sky-400/90' : '';
              const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-sky-400/90' : '';

              return (
                <button
                  key={`${r}-${c}`}
                  id={`sudoku-cell-${r}-${c}`}
                  onClick={() => {
                    setSelectedCell([r, c]);
                    sounds.playClick();
                  }}
                  className={`relative flex items-center justify-center font-bold text-lg sm:text-xl transition-all duration-150 cursor-pointer select-none ${
                    isInitial
                      ? 'bg-gradient-to-br from-[#132438] to-[#0d1a29] text-amber-300 font-black'
                      : 'bg-gradient-to-br from-[#0c1622] to-[#080d14] text-slate-100'
                  } ${isSelected ? 'bg-sky-600/80 ring-2 sm:ring-4 ring-sky-300 ring-inset z-10 brightness-125' : 'hover:brightness-125'} ${
                    isConflict ? 'text-rose-400 bg-rose-950/70' : ''
                  } ${borderRight} ${borderBottom}`}
                >
                  {val !== 0 ? (
                    <span className={isInitial ? 'drop-shadow-[0_1px_3px_rgba(245,158,11,0.5)]' : ''}>{val}</span>
                  ) : (
                    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 text-[8px] text-sky-400/70 font-mono pointer-events-none">
                      {cellNotes.map((n) => (
                        <span key={n} className="flex items-center justify-center">
                          {n}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Win Modal */}
        {isComplete && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
            <Trophy className="w-14 h-14 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-sky-300">سودوکو حل شد! 🎉</h2>
            <p className="text-xs text-slate-300">
              زمان ثبت شده: {formatTimer(timerSeconds)} | ۱۰۰ سکه طلا جایزه گرفتید!
            </p>
            <button
              id="sudoku-play-again-btn"
              onClick={() => startNewGame(difficulty)}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-slate-950 font-bold shadow-lg shadow-sky-500/30 transition-all"
            >
              بازی جدید 🔢
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons: Undo, Pencil, Erase, Hint */}
      <div className="flex items-center justify-between gap-2 max-w-[440px] mx-auto w-full">
        <button
          id="sudoku-pencil-btn"
          onClick={() => setIsPencilMode((p) => !p)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            isPencilMode
              ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Pencil className="w-4 h-4" />
          <span>مداد ({isPencilMode ? 'روشن' : 'خاموش'})</span>
        </button>

        <button
          id="sudoku-erase-btn"
          onClick={handleErase}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
        >
          <Eraser className="w-4 h-4" />
          <span>پاک‌کن</span>
        </button>

        <button
          id="sudoku-hint-btn"
          onClick={handleHint}
          disabled={hintsLeft <= 0}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-amber-400 transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          <span>راهنما ({hintsLeft})</span>
        </button>

        <button
          id="sudoku-reset-btn"
          onClick={() => startNewGame(difficulty)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-red-400 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ریست</span>
        </button>
      </div>

      {/* Number Keypad (1 - 9) */}
      <div className="grid grid-cols-9 gap-1.5 max-w-[440px] mx-auto w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            id={`sudoku-key-${num}`}
            onClick={() => handleNumberInput(num)}
            className="aspect-square flex items-center justify-center bg-slate-800 hover:bg-sky-500 hover:text-slate-950 rounded-xl text-lg font-black text-sky-300 border border-slate-700 shadow-md active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};
