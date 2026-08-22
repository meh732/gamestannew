import React, { useState, useEffect, useCallback, useId, useRef } from 'react';
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
import { RotateCcw, Undo2, ArrowLeftRight, Trophy, Users, ShieldAlert, Sparkles, X } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface ChessGameProps {
  initialMode?: GameMode;
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

const BOT_NAMES = [
  'شاهین سرافراز',
  'تهمینه بانو',
  'سیاوش پاک‌زاد',
  'میترا کیانی',
  'بهداد راد',
  'آبتین البرز',
  'بانو گشسب',
];

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

  // Real Multiplayer Socket & Matchmaking State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [matchmaking, setMatchmaking] = useState<'idle' | 'searching' | 'matched'>('idle');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [myColor, setMyColor] = useState<ChessColor>('w');
  const [opponentName, setOpponentName] = useState('سیمرغ هوشمند');
  const [searchTimer, setSearchTimer] = useState(0);

  const headingId = useId();
  const matchmakingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Socket.io connection when 2-Player mode is chosen
  useEffect(() => {
    if (gameMode === '2p') {
      const socketUrl = window.location.origin;
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('[Socket] Connected to server');
        newSocket.emit('join_lobby', { username: 'کاربر مهمان' });
      });

      newSocket.on('waiting_match', () => {
        setMatchmaking('searching');
      });

      newSocket.on('match_found', (data: { roomCode: string; player1: string; player2: string; firstTurn: string }) => {
        const isPlayer1 = data.firstTurn === newSocket.id;
        setMyColor(isPlayer1 ? 'w' : 'b');
        setOpponentName(isPlayer1 ? data.player2 : data.player1);
        setRoomCode(data.roomCode);
        setMatchmaking('matched');
        setIsFlipped(!isPlayer1); // Flip board for Black player
        resetGame();
      });

      newSocket.on('opponent_move', (moveData: { from: [number, number]; to: [number, number] }) => {
        sounds.playMove();
        executeMove(moveData.from, moveData.to, true);
      });

      // Cleanup
      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setMatchmaking('idle');
      setRoomCode(null);
    }
  }, [gameMode]);

  // Handle Search Counter & Simulation Fallback (Always match a real user profile instantly if queue is empty!)
  useEffect(() => {
    if (matchmaking === 'searching') {
      setSearchTimer(0);
      matchmakingTimerRef.current = setInterval(() => {
        setSearchTimer((prev) => {
          if (prev >= 6) {
            // Trigger realistic simulated match using authentic Iranian account profile!
            if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current);
            const randomOpponent = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
            setOpponentName(randomOpponent);
            setMyColor(Math.random() > 0.5 ? 'w' : 'b');
            setMatchmaking('matched');
            setRoomCode(`sim_room_${Math.random().toString(36).substring(2, 8)}`);
            resetGame();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (matchmakingTimerRef.current) {
        clearInterval(matchmakingTimerRef.current);
      }
    }
    return () => {
      if (matchmakingTimerRef.current) clearInterval(matchmakingTimerRef.current);
    };
  }, [matchmaking]);

  // Start Search / Matchmaking
  const startMatchmaking = () => {
    if (socket) {
      socket.emit('find_match', { gameId: 'chess', username: 'کاربر مهمان' });
    } else {
      setMatchmaking('searching');
    }
  };

  const cancelMatchmaking = () => {
    if (socket) {
      socket.emit('cancel_matchmaking');
    }
    setMatchmaking('idle');
  };

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
  const executeMove = useCallback((from: [number, number], to: [number, number], receivedFromSocket = false) => {
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

      // Sync move over WebSocket for real online multiplayer!
      if (socket && !receivedFromSocket && roomCode) {
        socket.emit('make_move', { roomCode, moveData: { from, to } });
      }

      return newBoard;
    });
  }, [checkGameOver, socket, roomCode]);

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
    
    // In Online Multiplayer mode: Only allow moving own pieces on own turn
    if (gameMode === '2p') {
      if (turn !== myColor) return;
    } else {
      if (gameMode === 'ai' && turn === 'b') return; // AI is thinking
    }

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
    if (gameMode === '2p') return; // No undo in online PVP!
    if (boardHistory.length === 0 || gameStatus !== 'playing') return;
    if (gameMode === 'ai' && boardHistory.length >= 2) {
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
    <div className="w-full h-full min-h-screen flex flex-col items-center justify-start p-1 sm:p-3 relative overflow-x-hidden z-10">
      
      {/* 🏰 FULL-SCREEN LUXURY CASTLE BACKGROUND */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none select-none bg-[#0a0705]">
        <img 
          src="/castle-chess.jpg?v=2" 
          alt="Castle Background" 
          className="w-full h-full object-cover opacity-80 filter brightness-[0.55] contrast-[1.18] saturate-[0.9]"
          referrerPolicy="no-referrer"
        />
        {/* Dynamic Hearth Glow */}
        <div className="absolute inset-0 transition-opacity duration-1000 mix-blend-color-dodge animate-pulse"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(251, 191, 36, 0.22) 0%, rgba(0,0,0,0.92) 88%)`,
            animationDuration: '4s'
          }}
        />
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 font-['Vazirmatn'] text-slate-100 relative">

      
      {/* 🚀 REAL-TIME ONLINE MATCHMAKING OVERLAY */}
      {gameMode === '2p' && matchmaking !== 'matched' && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center z-50">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mb-4 animate-pulse">
            <Users className="w-10 h-10 text-amber-400" />
          </div>
          
          <h2 className="text-xl font-black text-amber-300 mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <span>جستجوی حریف آنلاین واقعی</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
            سیستم هوشمند مچ‌میکینگ گیمستان در حال بررسی و جفت‌وجور کردن حساب کاربری شما با فعال‌ترین بازیکنان هم‌رده است...
          </p>

          <div className="flex flex-col items-center gap-1.5 mb-8">
            <div className="text-sm font-black text-white">زمان سپری شده: {searchTimer} ثانیه</div>
            <div className="text-[10px] text-slate-500">پینگ سرور: ۲۴ میلی‌ثانیه</div>
          </div>

          <div className="flex gap-3">
            {matchmaking === 'idle' ? (
              <button
                onClick={startMatchmaking}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs"
              >
                شروع جستجو 🔍
              </button>
            ) : (
              <button
                onClick={cancelMatchmaking}
                className="px-6 py-2.5 rounded-xl bg-red-600/20 border border-red-500/50 text-red-300 font-bold hover:bg-red-600/30 active:scale-95 transition-all text-xs flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>لغو جستجو</span>
              </button>
            )}
          </div>
        </div>
      )}

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
        p2Name={gameMode === '2p' ? `${opponentName} (سیاه)` : 'سیمرغ هوشمند'}
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
                  <span>{gameMode === '2p' ? `${opponentName} (سیاه)` : 'سیمرغ هوشمند (سیاه)'}</span>
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

          {/* 8x8 Chessboard Container with Luxury Persian Walnut & Gold Border */}
          <div className="relative aspect-square w-full max-w-[350px] sm:max-w-[460px] mx-auto bg-gradient-to-b from-[#241a14] via-[#140e0a] to-[#0a0705] p-2.5 sm:p-3.5 rounded-3xl border-4 border-amber-500/70 shadow-2xl select-none overflow-hidden ring-1 ring-amber-400/50 gpu-layer">
            {/* Grid */}
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-2xl overflow-hidden border-2 border-amber-900/60 shadow-inner">
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
                      className={`relative flex items-center justify-center text-2xl sm:text-3xl md:text-4xl transition-all duration-150 cursor-pointer ${
                        isLight
                          ? 'bg-gradient-to-br from-[#dfd4be] to-[#c7b99c] hover:brightness-105'
                          : 'bg-gradient-to-br from-[#5a3824] to-[#3f2516] hover:brightness-110'
                      } ${isSelected ? 'ring-2 sm:ring-4 ring-amber-400 ring-inset z-10 brightness-110' : ''} ${
                        isKingCheckSquare ? 'bg-gradient-to-r from-red-600 to-rose-700 animate-pulse text-white shadow-inner' : ''
                      }`}
                    >
                      {/* File / Rank Coordinates on edge cells */}
                      {colIdx === 0 && (
                        <span className={`absolute top-0.5 right-1 text-[9px] font-bold select-none ${isLight ? 'text-amber-950/60' : 'text-amber-200/50'}`}>
                          {8 - r}
                        </span>
                      )}
                      {rowIdx === 7 && (
                        <span className={`absolute bottom-0.5 left-1 text-[9px] font-bold select-none ${isLight ? 'text-amber-950/60' : 'text-amber-200/50'}`}>
                          {String.fromCharCode(65 + c)}
                        </span>
                      )}

                      {/* Piece Icon with 3D Luxury Shadows */}
                      {piece && (
                        <span
                          className={`select-none transition-transform active:scale-95 leading-none ${
                            piece.color === 'w'
                              ? 'text-amber-100 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] hover:scale-105 transition-transform'
                              : 'text-[#1c120c] filter drop-shadow-[0_3px_5px_rgba(245,158,11,0.3)] drop-shadow-[0_0_1px_rgba(255,255,255,0.7)] hover:scale-105 transition-transform'
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
                              ? 'w-full h-full border-2 sm:border-4 border-amber-400/90 bg-amber-400/25 ring-2 ring-amber-300 animate-pulse'
                              : 'w-3 sm:w-4.5 h-3 sm:h-4.5 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.9)] ring-2 ring-yellow-300'
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
              disabled={boardHistory.length === 0 || gameStatus !== 'playing' || gameMode === '2p'}
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
              disabled={gameMode === '2p'}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold text-red-400 transition-colors disabled:opacity-40"
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
    </div>
  );
};
