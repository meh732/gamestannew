import React, { useState, useEffect, useCallback, useId } from 'react';
import { WordleAttempt } from '../../types';
import {
  getRandomWord,
  normalizePersian,
  evaluateWordleGuess,
  PERSIAN_KEYBOARD_ROWS,
} from '../../utils/persianWords';
import { sounds } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Delete } from 'lucide-react';

interface WordleGameProps {
  onBack?: () => void;
  onWinReward?: (coins: number) => void;
}

export const WordleGame: React.FC<WordleGameProps> = ({ onBack, onWinReward }) => {
  const [targetWord, setTargetWord] = useState<string>(() => getRandomWord());
  const [attempts, setAttempts] = useState<WordleAttempt[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [keyStatuses, setKeyStatuses] = useState<Record<string, 'correct' | 'present' | 'absent'>>({});

  const headingId = useId();

  const resetGame = useCallback(() => {
    setTargetWord(getRandomWord());
    setAttempts([]);
    setCurrentInput('');
    setGameStatus('playing');
    setKeyStatuses({});
    sounds.playMove();
  }, []);

  // Handle Character Input
  const handleCharClick = (char: string) => {
    if (gameStatus !== 'playing') return;
    if (currentInput.length < 5) {
      setCurrentInput((prev) => prev + char);
      sounds.playClick();
    }
  };

  // Handle Backspace
  const handleBackspace = () => {
    if (gameStatus !== 'playing') return;
    setCurrentInput((prev) => prev.slice(0, -1));
    sounds.playClick();
  };

  // Handle Submit Guess
  const handleSubmit = useCallback(() => {
    if (gameStatus !== 'playing') return;
    if (currentInput.length !== 5) {
      sounds.playError();
      return;
    }

    const feedback = evaluateWordleGuess(currentInput, targetWord);
    const newAttempt: WordleAttempt = { word: currentInput, feedback };
    const newAttempts = [...attempts, newAttempt];
    setAttempts(newAttempts);

    // Update keyboard statuses
    setKeyStatuses((prev) => {
      const updated = { ...prev };
      for (let i = 0; i < 5; i++) {
        const char = currentInput[i];
        const status = feedback[i];
        if (status === 'correct' || (status === 'present' && updated[char] !== 'correct')) {
          updated[char] = status;
        } else if (!updated[char]) {
          updated[char] = 'absent';
        }
      }
      return updated;
    });

    const isWon = feedback.every((f) => f === 'correct');
    if (isWon) {
      setGameStatus('won');
      sounds.playWin();
      confetti({ particleCount: 90, spread: 70 });
      onWinReward?.(100);
    } else if (newAttempts.length >= 6) {
      setGameStatus('lost');
      sounds.playError();
    } else {
      sounds.playMove();
    }

    setCurrentInput('');
  }, [gameStatus, currentInput, targetWord, attempts, onWinReward]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (/^[\u0600-\u06FF]$/.test(e.key)) {
        handleCharClick(normalizePersian(e.key));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, handleSubmit]);

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 flex flex-col gap-4 text-slate-100 font-['Vazirmatn']">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-teal-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-2xl shadow-md shadow-teal-500/20">
            🔤
          </div>
          <div>
            <h1 id={headingId} className="text-lg sm:text-xl font-bold text-teal-300">حدس کلمه (وردل فارسی)</h1>
            <p className="text-xs text-slate-400">کلمه ۵ حرفی روز را حدس بزنید</p>
          </div>
        </div>

        {onBack && (
          <button
            id="wordle-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            بازگشت
          </button>
        )}
      </div>

      {/* 6 Rows Grid */}
      <div className="flex flex-col gap-2 max-w-[320px] mx-auto w-full">
        {Array.from({ length: 6 }).map((_, rowIdx) => {
          const attempt = attempts[rowIdx];
          const isCurrentRow = rowIdx === attempts.length;

          return (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, colIdx) => {
                let char = '';
                let cellBg = 'bg-slate-900/80 border-slate-700 text-slate-100';

                if (attempt) {
                  char = attempt.word[colIdx] || '';
                  const status = attempt.feedback[colIdx];
                  if (status === 'correct') {
                    cellBg = 'bg-emerald-600 border-emerald-500 text-white font-bold';
                  } else if (status === 'present') {
                    cellBg = 'bg-amber-500 border-amber-400 text-slate-950 font-bold';
                  } else {
                    cellBg = 'bg-slate-800 border-slate-700 text-slate-400';
                  }
                } else if (isCurrentRow) {
                  char = currentInput[colIdx] || '';
                  if (char) {
                    cellBg = 'bg-slate-800 border-teal-400 text-teal-300 ring-2 ring-teal-400/40 font-bold';
                  }
                }

                return (
                  <div
                    key={colIdx}
                    className={`aspect-square flex items-center justify-center rounded-xl border-2 text-xl font-bold transition-all ${cellBg}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Game Over Message */}
      {gameStatus !== 'playing' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 text-center max-w-sm mx-auto w-full">
          <Trophy className="w-10 h-10 text-amber-400" />
          <h2 className="text-xl font-bold text-teal-300">
            {gameStatus === 'won' ? 'آفرین! کلمه را درست حدس زدید 🎉' : 'فرصت‌ها به پایان رسید!'}
          </h2>
          <p className="text-xs text-slate-300">
            کلمه مورد نظر: <span className="font-bold text-amber-300 text-sm">{targetWord}</span>
          </p>
          <button
            id="wordle-play-again-btn"
            onClick={resetGame}
            className="mt-1 px-6 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all"
          >
            کلمه بعدی 🔤
          </button>
        </div>
      )}

      {/* Persian Keyboard */}
      <div className="flex flex-col gap-1.5 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 max-w-lg mx-auto w-full">
        {PERSIAN_KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {rIdx === 2 && (
              <button
                id="wordle-enter-btn"
                onClick={handleSubmit}
                className="px-2 sm:px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-black transition-colors"
              >
                ثبت
              </button>
            )}

            {row.map((char) => {
              const status = keyStatuses[char];
              let keyBg = 'bg-slate-800 hover:bg-slate-700 text-slate-200';
              if (status === 'correct') keyBg = 'bg-emerald-600 text-white font-bold';
              else if (status === 'present') keyBg = 'bg-amber-500 text-slate-950 font-bold';
              else if (status === 'absent') keyBg = 'bg-slate-900 text-slate-600 opacity-40';

              return (
                <button
                  key={char}
                  id={`wordle-key-${char}`}
                  onClick={() => handleCharClick(char)}
                  className={`min-w-[24px] sm:min-w-[32px] h-9 sm:h-10 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold border border-slate-700/60 active:scale-95 transition-all ${keyBg}`}
                >
                  {char}
                </button>
              );
            })}

            {rIdx === 2 && (
              <button
                id="wordle-backspace-btn"
                onClick={handleBackspace}
                className="px-2 sm:px-3 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center justify-center"
              >
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          id="wordle-reset-btn"
          onClick={resetGame}
          className="flex items-center gap-2 py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-teal-400" />
          <span>کلمه جدید</span>
        </button>
      </div>
    </div>
  );
};
