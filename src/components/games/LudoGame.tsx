import React, { useState, useId } from 'react';
import { GameMode } from '../../types';
import { sounds } from '../../utils/audio';
import { GameModeBanner } from '../common/GameModeBanner';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy } from 'lucide-react';

interface LudoGameProps {
  initialMode?: GameMode;
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

const TOTAL_TRACK_STEPS = 20;

export const LudoGame: React.FC<LudoGameProps> = ({
  initialMode = 'ai',
  onBack,
  onWinReward,
}) => {
  const [redPos, setRedPos] = useState<number>(0); // 0 = at home base, 1-19 = on track, 20 = goal
  const [bluePos, setBluePos] = useState<number>(0);
  const [diceVal, setDiceVal] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<'red' | 'blue'>('red');
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [winner, setWinner] = useState<'red' | 'blue' | null>(null);
  const [logMessage, setLogMessage] = useState<string>('برای شروع نبرد، تاس بیندازید!');

  const headingId = useId();

  const resetGame = () => {
    setRedPos(0);
    setBluePos(0);
    setDiceVal(1);
    setIsRolling(false);
    setCurrentTurn('red');
    setWinner(null);
    setLogMessage('بازی جدید آغاز شد. نوبت سهراب یل (قرمز) است.');
    sounds.playMove();
  };

  // Roll Dice and Execute Turn
  const rollDice = () => {
    if (isRolling || winner) return;
    setIsRolling(true);
    sounds.playDiceRoll();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceVal(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 8) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDiceVal(finalDice);
        setIsRolling(false);
        processTurn(finalDice, currentTurn);
      }
    }, 60);
  };

  const processTurn = (rolled: number, turn: 'red' | 'blue') => {
    if (turn === 'red') {
      let nextPos = redPos;
      if (redPos === 0) {
        if (rolled === 6) {
          nextPos = 1;
          setLogMessage('با تاس ۶، مهره سهراب یل وارد هفت‌خان شد! جایزه پرتاب دوباره 🎲');
          setRedPos(nextPos);
          sounds.playMove();
          return;
        } else {
          setLogMessage(`تاس ${rolled} آمد. برای ورود به زمین نیاز به تاس ۶ دارید.`);
        }
      } else {
        nextPos = Math.min(TOTAL_TRACK_STEPS, redPos + rolled);
        setRedPos(nextPos);
        sounds.playMove();

        // Check if captured blue
        if (nextPos === bluePos && nextPos > 0 && nextPos < TOTAL_TRACK_STEPS) {
          setBluePos(0);
          setLogMessage('مهره حریف زده شد و به قلعه اولیه بازگشت! ⚔️');
          sounds.playCapture();
        } else {
          setLogMessage(`سهراب ${rolled} خانه به جلو تا پله ${nextPos} حرکت کرد.`);
        }

        if (nextPos >= TOTAL_TRACK_STEPS) {
          setWinner('red');
          sounds.playWin();
          confetti({ particleCount: 100, spread: 80 });
          onWinReward?.(gameMode === 'league' ? 300 : 150);
          return;
        }
      }

      if (rolled !== 6) {
        setCurrentTurn('blue');
        if (gameMode === 'ai' || gameMode === 'league') {
          setTimeout(aiRoll, 1000);
        }
      }
    } else {
      // Blue turn
      let nextPos = bluePos;
      if (bluePos === 0) {
        if (rolled === 6) {
          nextPos = 1;
          setLogMessage('حریف با تاس ۶ وارد میدان شد! پرتاب مجدد');
          setBluePos(nextPos);
          sounds.playMove();
          if (gameMode === 'ai' || gameMode === 'league') {
            setTimeout(aiRoll, 1000);
          }
          return;
        } else {
          setLogMessage(`حریف تاس ${rolled} آورد و نتوانست وارد شود.`);
        }
      } else {
        nextPos = Math.min(TOTAL_TRACK_STEPS, bluePos + rolled);
        setBluePos(nextPos);
        sounds.playMove();

        // Check if captured red
        if (nextPos === redPos && nextPos > 0 && nextPos < TOTAL_TRACK_STEPS) {
          setRedPos(0);
          setLogMessage('مهره شما توسط حریف زده شد و به پایگاه بازگشت! ⚔️');
          sounds.playCapture();
        } else {
          setLogMessage(`حریف ${rolled} خانه به جلو حرکت کرد.`);
        }

        if (nextPos >= TOTAL_TRACK_STEPS) {
          setWinner('blue');
          sounds.playError();
          return;
        }
      }

      if (rolled !== 6) {
        setCurrentTurn('red');
      } else if (gameMode === 'ai' || gameMode === 'league') {
        setTimeout(aiRoll, 1000);
      }
    }
  };

  const aiRoll = () => {
    if (winner) return;
    rollDice();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-5 flex flex-col gap-4 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-rose-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-2xl shadow-md shadow-rose-500/20">
            🎲
          </div>
          <div>
            <h1 id={headingId} className="text-lg sm:text-xl font-bold text-rose-300">
              منچ و لوردیو هفت‌خان شاهنامه
            </h1>
            <p className="text-xs text-slate-400">تاس سه‌بعدی متحرک، زدن مهره و مسابقه تا کاپ نهایی</p>
          </div>
        </div>

        {onBack && (
          <button
            id="ludo-back-btn"
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
        turn={currentTurn === 'red' ? 'p1' : 'p2'}
        p1Name="سهراب یل (قرمز)"
        p2Name={gameMode === 'pvp' ? 'رستم دستان (آبی)' : 'سیمرغ هوشمند (آبی)'}
        leaguePrize={300}
      />

      {/* Board Stage */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-3xl flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        {/* Track Step Visualization */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="text-rose-400">🔴 سهراب یل (شما): پله {redPos} / ۲۰</span>
            <span className="text-cyan-400">🔵 {gameMode === 'pvp' ? 'رستم دستان' : 'سیمرغ'}: پله {bluePos} / ۲۰</span>
          </div>

          <div className="relative h-6 bg-slate-950 rounded-full border border-slate-800 p-1 flex items-center">
            {/* Steps Markers */}
            <div className="w-full flex justify-between px-2">
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === 0
                      ? 'bg-slate-700'
                      : i === 20
                      ? 'bg-amber-400 ring-2 ring-amber-300'
                      : i % 5 === 0
                      ? 'bg-slate-500'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Red Token */}
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-rose-500 border-2 border-white shadow-lg shadow-rose-500/50 flex items-center justify-center text-[9px] font-black text-white transition-all duration-300 z-10"
              style={{ left: `calc(${(redPos / TOTAL_TRACK_STEPS) * 94}% + 2px)` }}
            >
              🔴
            </div>

            {/* Blue Token */}
            <div
              className="absolute bottom-0.5 w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-lg shadow-cyan-500/50 flex items-center justify-center text-[9px] font-black text-white transition-all duration-300 z-10"
              style={{ left: `calc(${(bluePos / TOTAL_TRACK_STEPS) * 94}% + 2px)` }}
            >
              🔵
            </div>
          </div>
        </div>

        {/* 3D Dice Stage */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          {/* Animated 3D Dice */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-slate-200 text-slate-950 font-black text-4xl flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.6)] border-2 border-slate-300 select-none ${
                isRolling ? 'animate-spin' : 'hover:scale-105'
              } transition-transform`}
            >
              {diceVal === 1 && '⚀'}
              {diceVal === 2 && '⚁'}
              {diceVal === 3 && '⚂'}
              {diceVal === 4 && '⚃'}
              {diceVal === 5 && '⚄'}
              {diceVal === 6 && '⚅'}
            </div>
            <span className="text-xs font-bold text-slate-400">تاس: {diceVal}</span>
          </div>

          {/* Roll Button & Status */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
              {logMessage}
            </div>

            <button
              id="ludo-roll-dice-btn"
              onClick={rollDice}
              disabled={isRolling || winner !== null || (currentTurn === 'blue' && gameMode !== 'pvp')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm shadow-xl shadow-rose-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{isRolling ? 'در حال پرتاب...' : 'پرتاب تاس منچ 🎲'}</span>
            </button>
          </div>
        </div>

        {/* Win Modal */}
        {winner && (
          <div className="p-4 bg-amber-500/20 border border-amber-400 rounded-2xl flex flex-col items-center gap-2 text-center">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            <div className="text-base font-black text-amber-300">
              {winner === 'red' ? 'سهراب یل برنده شد و به کاپ رسید! 🏆' : 'حریف برنده شد!'}
            </div>
            <button
              id="ludo-play-again-btn"
              onClick={resetGame}
              className="mt-1 px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              بازی مجدد
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          id="ludo-reset-btn"
          onClick={resetGame}
          className="flex items-center gap-2 py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>شروع نو</span>
        </button>
      </div>
    </div>
  );
};
