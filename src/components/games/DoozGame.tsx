import React, { useState, useEffect, useCallback, useId } from 'react';
import { GameMode } from '../../types';
import { sounds } from '../../utils/audio';
import { GameModeBanner } from '../common/GameModeBanner';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy } from 'lucide-react';

interface DoozGameProps {
  initialMode?: GameMode;
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

type BoardCell = 'X' | 'O' | null;

export const DoozGame: React.FC<DoozGameProps> = ({
  initialMode = 'ai',
  onBack,
  onWinReward,
}) => {
  const [gridSize, setGridSize] = useState<3 | 5>(3);
  const [board, setBoard] = useState<BoardCell[]>(() => Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X');
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const headingId = useId();

  const resetGame = useCallback(
    (size: 3 | 5 = gridSize) => {
      setGridSize(size);
      setBoard(Array(size * size).fill(null));
      setCurrentTurn('X');
      setWinner(null);
      setWinningLine(null);
      sounds.playMove();
    },
    [gridSize]
  );

  // Check 3x3 Win
  const checkWin3x3 = (b: BoardCell[]): { winner: 'X' | 'O' | 'draw' | null; line: number[] | null } => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6],             // diagonals
    ];

    for (const [a, bIdx, c] of lines) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return { winner: b[a], line: [a, bIdx, c] };
      }
    }

    if (b.every((cell) => cell !== null)) {
      return { winner: 'draw', line: null };
    }

    return { winner: null, line: null };
  };

  // Check 5x5 Win (4 in a row)
  const checkWin5x5 = (b: BoardCell[]): { winner: 'X' | 'O' | 'draw' | null; line: number[] | null } => {
    const size = 5;
    const targetLength = 4;
    const inBounds = (r: number, c: number) => r >= 0 && r < size && c >= 0 && c < size;
    const getIdx = (r: number, c: number) => r * size + c;

    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal \
      [1, -1], // Diagonal /
    ];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const startIdx = getIdx(r, c);
        const player = b[startIdx];
        if (!player) continue;

        for (const [dr, dc] of directions) {
          const line: number[] = [startIdx];
          let matched = true;

          for (let step = 1; step < targetLength; step++) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (!inBounds(nr, nc) || b[getIdx(nr, nc)] !== player) {
              matched = false;
              break;
            }
            line.push(getIdx(nr, nc));
          }

          if (matched) {
            return { winner: player, line };
          }
        }
      }
    }

    if (b.every((cell) => cell !== null)) {
      return { winner: 'draw', line: null };
    }

    return { winner: null, line: null };
  };

  const checkWinner = useCallback(
    (b: BoardCell[]) => {
      return gridSize === 3 ? checkWin3x3(b) : checkWin5x5(b);
    },
    [gridSize]
  );

  // Minimax AI for 3x3
  const minimax = (
    newBoard: BoardCell[],
    depth: number,
    isMaximizing: boolean
  ): { score: number; index?: number } => {
    const res = checkWin3x3(newBoard);
    if (res.winner === 'O') return { score: 10 - depth };
    if (res.winner === 'X') return { score: depth - 10 };
    if (res.winner === 'draw') return { score: 0 };

    const avail = newBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);

    if (isMaximizing) {
      let maxScore = -Infinity;
      let bestMove: number | undefined;
      for (const idx of avail) {
        newBoard[idx] = 'O';
        const sim = minimax(newBoard, depth + 1, false);
        newBoard[idx] = null;
        if (sim.score > maxScore) {
          maxScore = sim.score;
          bestMove = idx;
        }
      }
      return { score: maxScore, index: bestMove };
    } else {
      let minScore = Infinity;
      let bestMove: number | undefined;
      for (const idx of avail) {
        newBoard[idx] = 'X';
        const sim = minimax(newBoard, depth + 1, true);
        newBoard[idx] = null;
        if (sim.score < minScore) {
          minScore = sim.score;
          bestMove = idx;
        }
      }
      return { score: minScore, index: bestMove };
    }
  };

  // AI Move Execution
  useEffect(() => {
    if ((gameMode === 'ai' || gameMode === 'league') && currentTurn === 'O' && !winner) {
      const timer = setTimeout(() => {
        const avail = board
          .map((v, i) => (v === null ? i : null))
          .filter((v): v is number => v !== null);

        if (avail.length === 0) return;

        let chosenIdx: number;

        if (gridSize === 3 && difficulty === 'hard') {
          const res = minimax([...board], 0, true);
          chosenIdx = res.index !== undefined ? res.index : avail[0];
        } else {
          // Check if AI can win in next step or block player
          chosenIdx = avail[Math.floor(Math.random() * avail.length)];
          for (const idx of avail) {
            const testBoard = [...board];
            testBoard[idx] = 'O';
            if (checkWinner(testBoard).winner === 'O') {
              chosenIdx = idx;
              break;
            }
          }
        }

        const newBoard = [...board];
        newBoard[chosenIdx] = 'O';
        setBoard(newBoard);
        sounds.playMove();

        const result = checkWinner(newBoard);
        if (result.winner) {
          setWinner(result.winner);
          setWinningLine(result.line);
          if (result.winner === 'X') {
            sounds.playWin();
            confetti({ particleCount: 80, spread: 70 });
            onWinReward?.(gameMode === 'league' ? 120 : 60);
          } else {
            sounds.playError();
          }
        } else {
          setCurrentTurn('X');
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, winner, board, gridSize, difficulty, checkWinner, onWinReward]);

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner) return;
    if ((gameMode === 'ai' || gameMode === 'league') && currentTurn === 'O') return;

    const newBoard = [...board];
    newBoard[idx] = currentTurn;
    setBoard(newBoard);
    sounds.playMove();

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      if (result.winner === 'X') {
        sounds.playWin();
        confetti({ particleCount: 90, spread: 70 });
        onWinReward?.(gameMode === 'league' ? 120 : 60);
      } else if (result.winner === 'O' && gameMode === 'pvp') {
        sounds.playWin();
      }
    } else {
      setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-3 sm:p-5 flex flex-col gap-4 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl shadow-md shadow-amber-500/20">
            ⚒️
          </div>
          <div>
            <h1 id={headingId} className="text-lg sm:text-xl font-bold text-amber-300">
              دوز و گوموکو کاوه آهنگر
            </h1>
            <p className="text-xs text-slate-400">دوز کلاسیک ۳×۳ و گوموکو ۵×۵ با هوش مصنوعی شکست‌ناپذیر</p>
          </div>
        </div>

        {onBack && (
          <button
            id="dooz-back-btn"
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md"
          >
            بازگشت به کاخ
          </button>
        )}
      </div>

      {/* Mode Switcher Banner */}
      <GameModeBanner
        mode={gameMode}
        onChangeMode={(m) => {
          setGameMode(m);
          resetGame();
        }}
        difficulty={difficulty}
        onChangeDifficulty={setDifficulty}
        turn={currentTurn === 'X' ? 'p1' : 'p2'}
        p1Name="کاوه آهنگر (X)"
        p2Name={gameMode === 'pvp' ? 'فریدون شاه (O)' : 'سیمرغ هوشمند (O)'}
        leaguePrize={120}
      />

      {/* Grid Size Switcher */}
      <div className="flex justify-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          id="dooz-size-3"
          onClick={() => resetGame(3)}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            gridSize === 3 ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          دوز کلاسیک (۳ در ۳)
        </button>
        <button
          id="dooz-size-5"
          onClick={() => resetGame(5)}
          className={`flex-1 py-1.5 rounded-xl transition-all ${
            gridSize === 5 ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          گوموکو اساطیری (۵ در ۵)
        </button>
      </div>

      {/* Board Stage with Ancient Mythical Obsidian & Molten Gold Theme */}
      <div className="relative aspect-square w-full max-w-[380px] mx-auto bg-gradient-to-b from-[#221810] via-[#120d09] to-[#080503] p-3.5 sm:p-4 rounded-3xl border-4 border-amber-500/70 shadow-2xl ring-1 ring-amber-400/50 gpu-layer">
        <div
          className={`grid gap-2 w-full h-full bg-[#0a0705] p-2.5 rounded-2xl border-2 border-amber-900/60 shadow-inner ${
            gridSize === 3 ? 'grid-cols-3 grid-rows-3' : 'grid-cols-5 grid-rows-5 gap-1.5'
          }`}
        >
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                id={`dooz-cell-${idx}`}
                onClick={() => handleCellClick(idx)}
                className={`flex items-center justify-center rounded-2xl font-black transition-all duration-200 cursor-pointer select-none ${
                  gridSize === 3 ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'
                } ${
                  isWinningCell
                    ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 text-slate-950 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.9)] z-10 border-2 border-yellow-200 ring-2 ring-amber-400'
                    : 'bg-gradient-to-br from-[#241a12] via-[#18110b] to-[#0f0a06] hover:brightness-125 border border-amber-900/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_4px_8px_rgba(0,0,0,0.6)]'
                }`}
              >
                {cell === 'X' && (
                  <span className={`transition-transform transform hover:scale-110 filter ${isWinningCell ? 'drop-shadow' : 'drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]'}`}>
                    ⚔️
                  </span>
                )}
                {cell === 'O' && (
                  <span className={`transition-transform transform hover:scale-110 filter ${isWinningCell ? 'drop-shadow' : 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`}>
                    🛡️
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Win Modal */}
        {winner && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
            <Trophy className="w-14 h-14 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-amber-300">
              {winner === 'draw'
                ? 'بازی مساوی شد 🤝'
                : `پیروزی بازیکن ${winner === 'X' ? 'کاوه آهنگر ⚔️' : 'حریف 🛡️'}!`}
            </h2>
            <button
              id="dooz-play-again-btn"
              onClick={() => resetGame()}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 transition-all text-xs"
            >
              نبرد مجدد ⚒️
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          id="dooz-reset-btn"
          onClick={() => resetGame()}
          className="flex items-center gap-2 py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>شروع نو</span>
        </button>
      </div>
    </div>
  );
};
