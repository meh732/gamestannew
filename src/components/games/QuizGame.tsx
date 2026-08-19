import React, { useState, useEffect, useCallback, useId } from 'react';
import { GameMode } from '../../types';
import { QUIZ_QUESTIONS } from '../../utils/quizQuestions';
import { sounds } from '../../utils/audio';
import { GameModeBanner } from '../common/GameModeBanner';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface QuizGameProps {
  initialMode?: GameMode;
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  initialMode = 'ai',
  onBack,
  onWinReward,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<'p1' | 'p2'>('p1');

  const headingId = useId();
  const question = QUIZ_QUESTIONS[currentIdx];

  // Handle Answer Selection
  const handleSelectOption = useCallback(
    (optIdx: number) => {
      if (isAnswered || isGameOver) return;
      setSelectedOption(optIdx);
      setIsAnswered(true);

      const isCorrect = optIdx === question.correctIndex;
      if (isCorrect) {
        const pointsEarned = 100 + timeLeft * 10 + streak * 20;
        if (currentTurnPlayer === 'p1') {
          setScore((s) => s + pointsEarned);
        } else {
          setP2Score((s) => s + pointsEarned);
        }
        setStreak((st) => st + 1);
        sounds.playWin();
      } else {
        setStreak(0);
        sounds.playError();
      }
    },
    [isAnswered, isGameOver, question, timeLeft, streak, currentTurnPlayer]
  );

  // Timer
  useEffect(() => {
    if (isAnswered || isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSelectOption(-1); // Timeout
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnswered, isGameOver, handleSelectOption]);

  const handleNextQuestion = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((idx) => idx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
      if (gameMode === 'pvp') {
        setCurrentTurnPlayer((p) => (p === 'p1' ? 'p2' : 'p1'));
      }
      sounds.playMove();
    } else {
      setIsGameOver(true);
      sounds.playWin();
      confetti({ particleCount: 100, spread: 80 });
      const winReward = gameMode === 'league' ? 250 : 120;
      onWinReward?.(winReward);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setP2Score(0);
    setStreak(0);
    setTimeLeft(15);
    setIsGameOver(false);
    setCurrentTurnPlayer('p1');
    sounds.playMove();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-5 flex flex-col gap-4 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-md shadow-purple-500/20">
            📜
          </div>
          <div>
            <h1 id={headingId} className="text-lg sm:text-xl font-bold text-purple-300">
              آزمون دانش و حکمت فردوسی
            </h1>
            <p className="text-xs text-slate-400">کوییز چهارگزینه‌ای اساطیر، ادبیات، منطق و اطلاعات عمومی</p>
          </div>
        </div>

        {onBack && (
          <button
            id="quiz-back-btn"
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
          handleRestart();
        }}
        difficulty={difficulty}
        onChangeDifficulty={setDifficulty}
        turn={currentTurnPlayer}
        p1Name="فردوسی توسی (بازیکن ۱)"
        p2Name={gameMode === 'pvp' ? 'حکیم سنایی (بازیکن ۲)' : 'سیمرغ دانا'}
        leaguePrize={250}
      />

      {/* Score & Progress Banner */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-purple-300">
            پرسش {currentIdx + 1} از {QUIZ_QUESTIONS.length}
          </span>
          <span className="text-amber-400">
            {gameMode === 'pvp' ? `امتیاز شما: ${score} | حریف: ${p2Score}` : `امتیاز: ${score}`}
          </span>
          {streak > 1 && (
            <span className="text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
              🔥 {streak} پاسخ متوالی!
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 font-mono text-sm font-bold text-amber-400">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{timeLeft} ثانیه</span>
        </div>
      </div>

      {/* Question Card */}
      {!isGameOver ? (
        <div className="bg-slate-900/90 border border-purple-500/40 p-5 rounded-3xl flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
              {question.category}
            </span>
            {gameMode === 'pvp' && (
              <span className="text-xs font-bold text-amber-300">
                نوبت پاسخگویی: {currentTurnPlayer === 'p1' ? 'بازیکن ۱' : 'بازیکن ۲'}
              </span>
            )}
          </div>

          <p className="text-base font-bold text-slate-100 leading-relaxed">{question.question}</p>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
            {question.options.map((option, idx) => {
              let btnStyle = 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-slate-200';

              if (isAnswered) {
                if (idx === question.correctIndex) {
                  btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30';
                } else if (selectedOption === idx) {
                  btnStyle = 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30';
                } else {
                  btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  id={`quiz-option-${idx}`}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm font-semibold transition-all active:scale-95 text-right ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && idx === question.correctIndex && <CheckCircle2 className="w-5 h-5 text-white" />}
                  {isAnswered && selectedOption === idx && idx !== question.correctIndex && (
                    <XCircle className="w-5 h-5 text-white" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner after answer */}
          {isAnswered && (
            <div className="bg-purple-950/40 border border-purple-500/30 p-3.5 rounded-2xl flex flex-col gap-2 mt-2">
              <p className="text-xs text-purple-200 leading-relaxed font-medium">
                💡 <span className="font-bold">توضیح:</span> {question.explanation}
              </p>
              <div className="flex justify-end">
                <button
                  id="quiz-next-btn"
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  {currentIdx + 1 < QUIZ_QUESTIONS.length ? 'پرسش بعدی ⬅️' : 'مشاهده کارنامه پایانی 🏆'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Game Over Result Screen */
        <div className="bg-slate-900/90 border border-purple-500/50 p-6 rounded-3xl flex flex-col items-center gap-4 text-center shadow-2xl">
          <Trophy className="w-16 h-16 text-amber-400 animate-bounce" />
          <h2 className="text-2xl font-black text-purple-300">پایان آزمون حکمت فردوسی!</h2>
          <div className="text-base font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-6 py-2 rounded-2xl">
            امتیاز نهایی: {score}
          </div>
          <button
            id="quiz-restart-btn"
            onClick={handleRestart}
            className="mt-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-600/30"
          >
            شروع دوباره آزمون 📜
          </button>
        </div>
      )}
    </div>
  );
};
