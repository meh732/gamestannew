import React, { useState, useEffect, useCallback, useId } from 'react';
import { ChessBoard, ChessColor, ChessMoveRecord, ChessPiece, GameMode } from '../../types';
import {
  INITIAL_CHESS_BOARD,
  PIECE_SYMBOLS,
  cloneBoard,
  getLegalMoves,
  isKingInCheck,
  getAllLegalMoves,
  getAlgebraicNotation,
  getBestAIMove,
} from '../../utils/chessEngine';
import { sounds } from '../../utils/audio';
import { GameModeBanner } from '../common/GameModeBanner';
import confetti from 'canvas-confetti';
import { RotateCcw, Undo2, ArrowLeftRight, Trophy } from 'lucide-react';

interface ChessGameProps {
  initialMode?: GameMode;
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

export const ChessGame: React.FC<ChessGameProps> = ({
  initialMode = 'ai',
  onBack,
  onWinReward,
}) => {
  const [board, setBoard] = useState<ChessBoard>(() => cloneBoard(INITIAL_CHESS_BOARD));
  const [turn, setTurn] = useState<ChessColor>('w');
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [moveHistory, setMoveHistory] = useState<ChessMoveRecord[]>([]);
  const [boardHistory, setBoardHistory] = useState<ChessBoard[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<ChessPiece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<ChessPiece[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiThinking, setAiThinking] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'checkmate' | 'stalemate' | 'resigned'>('playing');
  const [winner, setWinner] = useState<ChessColor | null>(null);
  const [whiteTime, setWhiteTime] = useState(300); // 5 minutes
  const [blackTime, setBlackTime] = useState(300);

  const headingId = useId();

  // Reset Game
  const resetGame = useCallback(() => {
    setBoard(cloneBoard(INITIAL_CHESS_BOARD));
    setTurn('w');
    setSelectedCell(null);
    setValidMoves([]);
    setMoveHistory([]);
    setBoardHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameStatus('playing');
    setWinner(null);
    setWhiteTime(300);
    setBlackTime(300);
    setAiThinking(false);
    sounds.playMove();
  }, []);

  // Timer tick
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const interval = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((t) => {
          if (t <= 1) {
            setGameStatus('checkmate');
            setWinner('b');
            sounds.playWin();
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            setGameStatus('checkmate');
            setWinner('w');
            sounds.playWin();
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [turn, gameStatus]);

  // Check Game State (checkmate / stalemate)
  const checkGameOver = useCallback((currentBoard: ChessBoard, nextTurn: ChessColor): boolean => {
    const legalMoves = getAllLegalMoves(currentBoard, nextTurn);
    const inCheck = isKingInCheck(currentBoard, nextTurn);

    if (legalMoves.length === 0) {
      if (inCheck) {
        setGameStatus('checkmate');
        const winColor = nextTurn === 'w' ? 'b' : 'w';
        setWinner(winColor);
        sounds.playWin();
        if (winColor === 'w') {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          const reward = gameMode === 'league' ? 250 : 150;
          onWinReward?.(reward);
        }
      } else {
        setGameStatus('stalemate');
        sounds.playMove();
      }
      return true;
    }
    return false;
  }, [gameMode, onWinReward]);

  // Execute Move
  const executeMove = useCallback((from: [number, number], to: [number, number]) => {
    setBoard((prevBoard) => {
      const newBoard = cloneBoard(prevBoard);
      const piece = newBoard[from[0]][from[1]]!;
      const captured = newBoard[to[0]][to[1]];

      // Save state history for undo
      setBoardHistory((bh) => [...bh, cloneBoard(prevBoard)]);

      // Track captured pieces
      if (captured) {
        if (captured.color === 'w') {
          setCapturedWhite((cw) => [...cw, captured]);
        } else {
          setCapturedBlack((cb) => [...cb, captured]);
        }
        sounds.playCapture();
      } else {
        sounds.playMove();
      }

      // Move piece
      newBoard[to[0]][to[1]] = piece;
      newBoard[from[0]][from[1]] = null;

      // Pawn promotion to Queen
      if (piece.type === 'p' && (to[0] === 0 || to[0] === 7)) {
        newBoard[to[0]][to[1]] = { type: 'q', color: piece.color };
      }

      const nextTurn: ChessColor = piece.color === 'w' ? 'b' : 'w';
      const inCheck = isKingInCheck(newBoard, nextTurn);
      const allMovesNext = getAllLegalMoves(newBoard, nextTurn);
      const isMate = inCheck && allMovesNext.length === 0;

      const notation = getAlgebraicNotation(from, to, piece, captured, inCheck, isMate);

      setMoveHistory((mh) => [
        ...mh,
        {
          from,
          to,
          piece,
          captured,
          notation,
          time: new Date().toLocaleTimeString('fa-IR', { minute: '2-digit', second: '2-digit' }),
        },
      ]);

      setTurn(nextTurn);
      setSelectedCell(null);
      setValidMoves([]);

      checkGameOver(newBoard, nextTurn);

      return newBoard;
    });
  }, [checkGameOver]);

  // AI Move triggering
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'b' && gameStatus === 'playing' && !aiThinking) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getBestAIMove(board, 'b');
        if (aiMove) {
          executeMove(aiMove.from, aiMove.to);
        }
        setAiThinking(false);
      }, aiDifficulty === 'hard' ? 900 : 500);

      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, gameStatus, board, aiDifficulty, aiThinking, executeMove]);

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    if (gameStatus !== 'playing') return;
    if (gameMode === 'ai' && turn === 'b') return; // AI is thinking

    const clickedPiece = board[r][c];

    // If cell already selected and target is a valid move
    if (selectedCell) {
      const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
      if (isValid) {
        executeMove(selectedCell, [r, c]);
        return;
      }
    }

    // Select own piece
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedCell([r, c]);
      const moves = getLegalMoves(board, r, c);
      setValidMoves(moves);
      sounds.playMove();
    } else {
      setSelectedCell(null);
      setValidMoves([]);
    }
  };

  // Undo move
  const handleUndo = () => {
    if (boardHistory.length === 0 || gameStatus !== 'playing') return;
    if (gameMode === 'ai' && boardHistory.length >= 2) {
      // Revert both AI and human moves
      const prevBoard = boardHistory[boardHistory.length - 2];
      setBoard(prevBoard);
      setBoardHistory((bh) => bh.slice(0, -2));
      setMoveHistory((mh) => mh.slice(0, -2));
      setTurn('w');
    } else {
      const prevBoard = boardHistory[boardHistory.length - 1];
      setBoard(prevBoard);
      setBoardHistory((bh) => bh.slice(0, -1));
      setMoveHistory((mh) => mh.slice(0, -1));
      setTurn((t) => (t === 'w' ? 'b' : 'w'));
    }
    setSelectedCell(null);
    setValidMoves([]);
    sounds.playMove();
  };

  const isWhiteInCheck = isKingInCheck(board, 'w');
  const isBlackInCheck = isKingInCheck(board, 'b');

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 font-['Vazirmatn'] text-slate-100 overflow-x-hidden p-1 sm:p-3">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between bg-slate-950/80 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl border border-amber-500/30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-lg text-slate-950 shadow-md shadow-amber-500/30">
            ♟️
          </div>
          <div>
            <h1 id={headingId} className="text-sm sm:text-base font-black text-amber-300">
              شطرنج اساطیری رستم
            </h1>
            <p className="text-[10px] text-slate-400">قوانین رسمی بین‌المللی شطرنج</p>
          </div>
        </div>

        {onBack && (
          <button
            id="chess-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md active:scale-95"
          >
            بازگشت به کاخ
          </button>
        )}
      </div>

      {/* Mode Switcher Banner (AI / 2P / League) */}
      <GameModeBanner
        mode={gameMode}
        onChangeMode={(m) => {
          setGameMode(m);
          resetGame();
        }}
        difficulty={aiDifficulty}
        onChangeDifficulty={setAiDifficulty}
        turn={turn === 'w' ? 'p1' : 'p2'}
        p1Name="رستم (سفید)"
        p2Name={gameMode === 'pvp' ? 'سهراب (سیاه)' : 'سیمرغ هوشمند'}
        leaguePrize={250}
      />

      {/* Main Game Layout */}
      <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-3 items-start overflow-x-hidden">
        {/* Left Side: Clocks, Captures, Board */}
        <div className="w-full lg:col-span-8 flex flex-col gap-2">
          {/* Black Player Banner */}
          <div
            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
              turn === 'b'
                ? 'bg-slate-800/90 border-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-sm">
                ♚
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{gameMode === 'pvp' ? 'سهراب یل (سیاه)' : 'سیمرغ هوشمند (سیاه)'}</span>
                  {aiThinking && <span className="text-[10px] text-amber-400 animate-pulse">در حال تفکر...</span>}
                  {isBlackInCheck && (
                    <span className="text-[10px] bg-red-600/80 text-white px-1.5 py-0.5 rounded-full font-bold">
                      کیش!
                    </span>
                  )}
                </div>
                {/* Captured White Pieces */}
                <div className="flex gap-1 text-xs text-slate-300 min-h-[16px]">
                  {capturedWhite.map((p, idx) => (
                    <span key={idx}>{PIECE_SYMBOLS[`w-${p.type}`]}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="font-mono text-xs sm:text-sm font-extrabold px-2.5 py-1 bg-black/50 border border-slate-700 rounded-lg text-amber-300">
              {formatTime(blackTime)}
            </div>
          </div>

          {/* 8x8 Chessboard Container */}
          <div className="relative aspect-square w-full max-w-[340px] sm:max-w-[440px] mx-auto bg-slate-950 p-1.5 sm:p-2.5 rounded-2xl border-2 border-amber-500/40 shadow-2xl shadow-black/80 select-none overflow-hidden">
            {/* Grid */}
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-xl overflow-hidden border border-slate-800">
              {Array.from({ length: 8 }).map((_, rowIdx) => {
                const r = isFlipped ? 7 - rowIdx : rowIdx;
                return Array.from({ length: 8 }).map((_, colIdx) => {
                  const c = isFlipped ? 7 - colIdx : colIdx;
                  const isLight = (r + c) % 2 === 0;
                  const piece = board[r][c];
                  const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
                  const isValidTarget = validMoves.some(([vr, vc]) => vr === r && vc === c);
                  const isKingCheckSquare =
                    piece?.type === 'k' &&
                    ((piece.color === 'w' && isWhiteInCheck) || (piece.color === 'b' && isBlackInCheck));

                  return (
                    <button
                      key={`${r}-${c}`}
                      id={`chess-cell-${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`relative flex items-center justify-center text-2xl sm:text-3xl md:text-4xl transition-all cursor-pointer ${
                        isLight ? 'bg-[#c7b99c]' : 'bg-[#6b4c35]'
                      } ${isSelected ? 'ring-2 sm:ring-4 ring-amber-400 ring-inset z-10' : ''} ${
                        isKingCheckSquare ? 'bg-red-700/80 animate-pulse' : ''
                      }`}
                    >
                      {/* Piece Icon */}
                      {piece && (
                        <span
                          className={`drop-shadow-md select-none transition-transform active:scale-95 ${
                            piece.color === 'w'
                              ? 'text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                              : 'text-slate-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
                          }`}
                        >
                          {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
                        </span>
                      )}

                      {/* Valid Move Indicator */}
                      {isValidTarget && (
                        <div
                          className={`absolute rounded-full pointer-events-none ${
                            piece
                              ? 'w-full h-full border-2 sm:border-4 border-amber-400/80 bg-amber-400/20'
                              : 'w-2.5 sm:w-4 h-2.5 sm:h-4 bg-amber-400/80 shadow-md shadow-amber-500'
                          }`}
                        />
                      )}
                    </button>
                  );
                });
              })}
            </div>

            {/* Game Over Overlay */}
            {gameStatus !== 'playing' && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2 p-4 text-center z-20">
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
                <h2 className="text-lg sm:text-xl font-black text-amber-300">
                  {gameStatus === 'checkmate'
                    ? `کیش و مات! پیروزی ${winner === 'w' ? 'رستم دستان 👑' : 'حریف 👑'}`
                    : 'پات! بازی مساوی شد 🤝'}
                </h2>
                <p className="text-[11px] text-slate-300">
                  {winner === 'w'
                    ? `تبریک! جایزه ${gameMode === 'league' ? '۲۵۰' : '۱۵۰'} سکه طلا به کیف پول شما اضافه شد.`
                    : 'تلاش شجاعانه‌ای بود! دوباره تلاش کنید.'}
                </p>
                <button
                  id="chess-play-again-btn"
                  onClick={resetGame}
                  className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30 transition-all text-xs"
                >
                  نبرد مجدد ♟️
                </button>
              </div>
            )}
          </div>

          {/* White Player Banner */}
          <div
            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
              turn === 'w'
                ? 'bg-slate-800/90 border-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-400 flex items-center justify-center text-slate-900 text-sm font-bold">
                ♔
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <span>رستم دستان (سفید)</span>
                  {isWhiteInCheck && (
                    <span className="text-[10px] bg-red-600/80 text-white px-1.5 py-0.5 rounded-full font-bold">
                      کیش!
                    </span>
                  )}
                </div>
                {/* Captured Black Pieces */}
                <div className="flex gap-1 text-xs text-slate-300 min-h-[16px]">
                  {capturedBlack.map((p, idx) => (
                    <span key={idx}>{PIECE_SYMBOLS[`b-${p.type}`]}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="font-mono text-xs sm:text-sm font-extrabold px-2.5 py-1 bg-black/50 border border-slate-700 rounded-lg text-amber-300">
              {formatTime(whiteTime)}
            </div>
          </div>
        </div>

        {/* Right Side: Move History & Controls */}
        <div className="w-full lg:col-span-4 flex flex-col gap-2">
          {/* Controls Bar */}
          <div className="bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-2xl flex items-center justify-between gap-1.5 shadow-md">
            <button
              id="chess-undo-btn"
              onClick={handleUndo}
              disabled={boardHistory.length === 0 || gameStatus !== 'playing'}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-[11px] font-bold text-slate-200 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5 text-amber-400" />
              <span>بازگشت</span>
            </button>

            <button
              id="chess-flip-btn"
              onClick={() => setIsFlipped((f) => !f)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-slate-200 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              <span>چرخش</span>
            </button>

            <button
              id="chess-reset-btn"
              onClick={resetGame}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-red-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>شروع نو</span>
            </button>
          </div>

          {/* Move History Table */}
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex flex-col gap-1.5 shadow-md max-h-[160px] sm:max-h-[240px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[11px] font-bold text-amber-400">📜 تاریخچه حرکات</span>
              <span className="text-[10px] text-slate-400">{moveHistory.length} حرکت</span>
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col gap-1 pr-1">
              {moveHistory.length === 0 ? (
                <div className="text-center text-[10px] text-slate-500 py-3">
                  سفید نبرد را آغاز می‌کند.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {moveHistory.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2 py-1 rounded-lg border text-[10px] ${
                        idx % 2 === 0
                          ? 'bg-slate-800/60 border-slate-700 text-slate-200'
                          : 'bg-slate-950/60 border-slate-800 text-amber-300'
                      }`}
                    >
                      <span className="font-mono text-slate-400">#{idx + 1}</span>
                      <span className="font-bold font-mono">{m.notation}</span>
                      <span className="text-slate-500">{m.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
