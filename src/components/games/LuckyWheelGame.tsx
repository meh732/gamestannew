import React, { useState, useId } from 'react';
import { WheelSegment } from '../../types';
import { sounds } from '../../utils/audio';
import { gfx } from '../../engine/GraphicsEngine';
import confetti from 'canvas-confetti';
import { Trophy, Gift, RotateCw } from 'lucide-react';

interface LuckyWheelGameProps {
  onBack?: () => void;
  onPrizeWon?: (coins: number, gems: number) => void;
}

const SEGMENTS: WheelSegment[] = [
  { id: 1, label: '۵۰ سکه', icon: '🪙', type: 'coins', amount: 50, color: '#f59e0b', textColor: '#000', probability: 0.25 },
  { id: 2, label: '۵ الماس', icon: '💎', type: 'gems', amount: 5, color: '#06b6d4', textColor: '#000', probability: 0.15 },
  { id: 3, label: '۲۰۰ سکه', icon: '🪙', type: 'coins', amount: 200, color: '#ec4899', textColor: '#fff', probability: 0.20 },
  { id: 4, label: '۱۰ الماس', icon: '💎', type: 'gems', amount: 10, color: '#8b5cf6', textColor: '#fff', probability: 0.10 },
  { id: 5, label: '۵۰۰ سکه', icon: '🪙', type: 'coins', amount: 500, color: '#10b981', textColor: '#000', probability: 0.12 },
  { id: 6, label: 'بلیت طلایی', icon: '🎫', type: 'vip', amount: 1, color: '#3b82f6', textColor: '#fff', probability: 0.08 },
  { id: 7, label: '۱۰۰۰ جک‌پات', icon: '👑', type: 'coins', amount: 1000, color: '#eab308', textColor: '#000', probability: 0.05 },
  { id: 8, label: 'چرخش مجدد', icon: '🔄', type: 'spin', amount: 1, color: '#f43f5e', textColor: '#fff', probability: 0.05 },
];

export const LuckyWheelGame: React.FC<LuckyWheelGameProps> = ({ onBack, onPrizeWon }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningPrize, setWinningPrize] = useState<WheelSegment | null>(null);

  const headingId = useId();
  const segmentAngle = 360 / SEGMENTS.length;

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinningPrize(null);

    // Determine random winning segment
    const randomIdx = Math.floor(Math.random() * SEGMENTS.length);
    const targetSegment = SEGMENTS[randomIdx];

    // Compute extra full spins (5 to 8 rotations) + target angle
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 4));
    const targetAngle = extraSpins + (360 - randomIdx * segmentAngle - segmentAngle / 2);

    setRotation((prev) => prev + targetAngle);

    // Play periodic tick sound during rotation
    const tickInterval = setInterval(() => {
      sounds.playWheelTick();
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWinningPrize(targetSegment);
      sounds.playWin();
      confetti({ particleCount: 120, spread: 80 });
      gfx.spawnCoinShower(50);

      if (targetSegment.type === 'coins') {
        onPrizeWon?.(targetSegment.amount, 0);
      } else if (targetSegment.type === 'gems') {
        onPrizeWon?.(0, targetSegment.amount);
      }
    }, 4000);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-2 sm:p-4 flex flex-col gap-3 text-slate-100 font-['Vazirmatn'] overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shadow-black/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
            🎡
          </div>
          <div>
            <h1 id={headingId} className="text-sm sm:text-base font-black text-amber-300">گردونه شانس روزانه گیمستان</h1>
            <p className="text-[10px] text-slate-400">شانس خود را برای دریافت سکه و الماس محک بزنید</p>
          </div>
        </div>

        {onBack && (
          <button
            id="wheel-back-btn"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
          >
            بازگشت
          </button>
        )}
      </div>

      {/* Wheel Stage */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-6 rounded-3xl flex flex-col items-center justify-center gap-5 shadow-2xl relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Wheel Container */}
        <div className="relative w-56 sm:w-72 aspect-square flex items-center justify-center">
          {/* Wheel Pointer Pin */}
          <div className="absolute -top-3 z-30 flex flex-col items-center">
            <div className="w-5 h-7 bg-gradient-to-b from-amber-300 to-amber-500 clip-triangle shadow-lg shadow-black" />
            <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-amber-400 -mt-1.5 shadow-md" />
          </div>

          {/* Rotating Wheel Disc */}
          <div
            className="w-full h-full rounded-full border-4 sm:border-6 border-amber-500/80 shadow-[0_0_40px_rgba(234,179,8,0.3)] relative overflow-hidden transition-transform duration-[4000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {SEGMENTS.map((seg, idx) => {
                const startAngle = idx * segmentAngle;
                const endAngle = (idx + 1) * segmentAngle;
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                return (
                  <g key={seg.id}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={seg.color}
                      stroke="#0f172a"
                      strokeWidth="0.8"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Labels overlay */}
            {SEGMENTS.map((seg, idx) => {
              const angle = idx * segmentAngle + segmentAngle / 2;
              return (
                <div
                  key={seg.id}
                  className="absolute inset-0 flex items-start justify-center pt-2.5 text-[9px] sm:text-[11px] font-black select-none pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%',
                    color: seg.textColor,
                  }}
                >
                  <span className="flex flex-col items-center">
                    <span className="text-xs">{seg.icon}</span>
                    <span className="drop-shadow-sm">{seg.label}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Hub Button */}
          <button
            id="wheel-center-spin-btn"
            onClick={spinWheel}
            disabled={isSpinning}
            className="absolute z-20 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-3 border-slate-900 shadow-xl flex items-center justify-center text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isSpinning ? '...' : 'بچرخون!'}
          </button>
        </div>

        {/* Spin Button */}
        <button
          id="wheel-spin-btn"
          onClick={spinWheel}
          disabled={isSpinning}
          className="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'گردونه در حال چرخش...' : 'گرداندن گردونه شانس 🎡'}</span>
        </button>

        {/* Prize Dialog */}
        {winningPrize && (
          <div className="bg-amber-500/20 border border-amber-400 p-3.5 rounded-2xl flex items-center gap-3 text-center animate-bounce">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-xs font-bold text-amber-300">تبریک! برنده شدید:</div>
              <div className="text-base font-black text-white">
                {winningPrize.icon} {winningPrize.label}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
