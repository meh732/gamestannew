import React, { useState, useEffect, useCallback, useId } from 'react';
import { GameMode, OthelloBoard } from '../../types';
import {
  createInitialOthelloBoard,
  getFlips,
  getValidMoves,
  countDiscs,
  getBestOthelloAIMove,
} from '../../utils/othelloEngine';
import { sounds } from '../../utils/audio';
import { GameModeBanner } from '../common/GameModeBanner';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy } from 'lucide-react';

interface OthelloGameProps {
  initialMode?: GameMode;
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

export const OthelloGame: React.FC<OthelloGameProps> = ({
  initialMode = 'ai',
  onBack,
  onWinReward,
}) => {
  const [board, setBoard] = useState<OthelloBoard>(() => createInitialOthelloBoard());
  const [currentTurn, setCurrentTurn] = useState<'black' | 'white'>('black');
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiThinking, setAiThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'black' | 'white' | 'draw' | null>(null);
  const [passAlert, setPassAlert] = useState<string | null>(null);

  const headingId = useId();

  const resetGame = useCallback(() => {
    setBoard(createInitialOthelloBoard());
    setCurrentTurn('black');
    setGameOver(false);
    setWinner(null);
    setPassAlert(null);
    setAiThinking(false);
    sounds.playMove();
  }, []);

  const scores = countDiscs(board);
  const validMoves = getValidMoves(board, currentTurn);

  // Execute Move
  const makeMove = useCallback(
    (r: number, c: number, color: 'black' | 'white') => {
      const flips = getFlips(board, r, c, color);
      if (flips.length === 0) return;

      const newBoard: OthelloBoard = board.map((row) => [...row]);
      newBoard[r][c] = color;
      flips.forEach((p) => {
        newBoard[p.r][p.c] = color;
      });

      setBoard(newBoard);
      sounds.playMove();

      const nextTurn = color === 'black' ? 'white' : 'black';
      const nextMoves = getValidMoves(newBoard, nextTurn);

      if (nextMoves.length > 0) {
        setCurrentTurn(nextTurn);
        setPassAlert(null);
      } else {
        // Next player has no moves! Check if current player can move
        const currentMovesAgain = getValidMoves(newBoard, color);
        if (currentMovesAgain.length > 0) {
          setPassAlert(`نوبت ${nextTurn === 'black' ? 'سیاه' : 'سفید'} به دلیل نداشتن حرکت رد شد!`);
          sounds.playError();
        } else {
          // Game Over
          setGameOver(true);
          const finalScores = countDiscs(newBoard);
          if (finalScores.black > finalScores.white) {
            setWinner('black');
            sounds.playWin();
            confetti({ particleCount: 90, spread: 70 });
            onWinReward?.(gameMode === 'league' ? 200 : 120);
          } else if (finalScores.white > finalScores.black) {
            setWinner('white');
            sounds.playWin();
          } else {
            setWinner('draw');
          }
        }
      }
    },
    [board, gameMode, onWinReward]
  );

  // AI Move Loop
  useEffect(() => {
    if ((gameMode === 'ai' || gameMode === 'league') && currentTurn === 'white' && !gameOver) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const best = getBestOthelloAIMove(board, 'white');
        if (best) {
          makeMove(best.r, best.c, 'white');
        }
        setAiThinking(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, gameOver, board, makeMove]);

  const handleCellClick = (r: number, c: number) => {
    if (gameOver) return;
    if ((gameMode === 'ai' || gameMode === 'league') && currentTurn === 'white') return;

    const isValid = validMoves.some((m) => m.r === r && m.c === c);
    if (isValid) {
      makeMove(r, c, currentTurn);
    } else {
      sounds.playError();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-5 flex flex-col gap-4 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-md shadow-cyan-500/20">
            🦅
          </div>
          <div>
            <h1 id={headingId} className="text-lg sm:text-xl font-bold text-cyan-300">
              اتللو و ریورسی سیمرغ البرز
            </h1>
            <p className="text-xs text-slate-400">بازی تاکتیکی واژگونی و محاصره مهره‌ها</p>
          </div>
        </div>

        {onBack && (
          <button
            id="othello-back-btn"
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
        turn={currentTurn === 'black' ? 'p1' : 'p2'}
        p1Name="زال زر (سیاه)"
        p2Name={gameMode === 'pvp' ? 'رستم دستان (سفید)' : 'سیمرغ دانا (سفید)'}
        leaguePrize={200}
      />

      {/* Score Board */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
            currentTurn === 'black'
              ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/80 border-slate-800 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-700 shadow-inner" />
            <div>
              <div className="text-xs font-bold text-slate-200">
                {gameMode === 'pvp' ? 'زال زر (سیاه)' : 'شما (سیاه)'}
              </div>
              <div className="text-[10px] text-slate-400">مهره‌های محاصره‌شده</div>
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono">{scores.black}</span>
        </div>

        <div
          className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
            currentTurn === 'white'
              ? 'bg-slate-800 border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900/80 border-slate-800 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 shadow-inner" />
            <div>
              <div className="text-xs font-bold text-slate-200">
                {gameMode === 'pvp' ? 'رستم دستان (سفید)' : 'سیمرغ هوشمند'}
              </div>
              <div className="text-[10px] text-slate-400">
                {aiThinking ? <span className="text-amber-400 animate-pulse">در حال تفکر...</span> : 'مهره‌ها'}
              </div>
            </div>
          </div>
          <span className="text-2xl font-black text-white font-mono">{scores.white}</span>
        </div>
      </div>

      {/* Pass Notification Alert */}
      {passAlert && (
        <div className="bg-amber-500/20 border border-amber-400/60 p-2.5 rounded-xl text-xs text-amber-300 text-center font-bold animate-pulse">
          {passAlert}
        </div>
      )}

      {/* 8x8 Board Stage */}
      <div className="relative aspect-square w-full max-w-[460px] mx-auto bg-slate-950 p-3 rounded-3xl border-2 border-cyan-500/40 shadow-2xl shadow-black/80">
        <div className="grid grid-cols-8 grid-rows-8 gap-1 w-full h-full bg-[#1b4332] p-2 rounded-2xl border border-emerald-800/80 shadow-inner">
          {board.map((row, r) =>
            row.map((disc, c) => {
              const isValid = validMoves.some((m) => m.r === r && m.c === c);
              return (
                <button
                  key={`${r}-${c}`}
                  id={`othello-cell-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className="relative flex items-center justify-center rounded-lg bg-[#2d6a4f]/70 hover:bg-[#2d6a4f] transition-all cursor-pointer select-none"
                >
                  {/* Disc */}
                  {disc && (
                    <div
                      className={`w-[82%] h-[82%] rounded-full shadow-lg transition-transform ${
                        disc === 'black'
                          ? 'bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700'
                          : 'bg-gradient-to-br from-slate-100 to-slate-300 border border-slate-400 shadow-slate-900/50'
                      }`}
                    />
                  )}

                  {/* Move Hint Dot */}
                  {!disc && isValid && (
                    <div className="w-3 h-3 rounded-full bg-cyan-400/60 ring-2 ring-cyan-300 animate-pulse pointer-events-none" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3 p-6 text-center z-20">
            <Trophy className="w-14 h-14 text-amber-400 animate-bounce" />
            <h2 className="text-2xl font-black text-cyan-300">
              {winner === 'black'
                ? 'پیروزی زال زر! 👑'
                : winner === 'white'
                ? 'پیروزی مهره سفید!'
                : 'بازی مساوی شد 🤝'}
            </h2>
            <p className="text-xs text-slate-300">
              امتیاز نهایی: سیاه {scores.black} - سفید {scores.white}
            </p>
            <button
              id="othello-play-again-btn"
              onClick={resetGame}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 transition-all text-xs"
            >
              نبرد مجدد 🦅
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          id="othello-reset-btn"
          onClick={resetGame}
          className="flex items-center gap-2 py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>شروع مجدد نبرد</span>
        </button>
      </div>
    </div>
  );
};
