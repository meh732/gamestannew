import React, { useEffect, useState } from 'react';

interface AncientPersianBackgroundProps {
  shiftIndex?: number;
}

export const AncientPersianBackground: React.FC<AncientPersianBackgroundProps> = ({
  shiftIndex = 0,
}) => {
  const [particles, setParticles] = useState<
    Array<{ id: number; left: number; top: number; size: number; duration: number; delay: number }>
  >([]);

  useEffect(() => {
    // Generate glowing fire embers & golden dust
    const items = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
    }));
    setParticles(items);
  }, []);

  // Parallax offset based on current room index
  const parallaxX = (shiftIndex % 6) * -25;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#070913]">
      {/* Deep Atmospheric Gradient Layers */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#090d1a] via-[#060810] to-[#030408] transition-all duration-700"
        style={{
          transform: `translateX(${parallaxX * 0.3}px) scale(1.05)`,
        }}
      />

      {/* Ancient Persepolis Bas-Relief Wall Motif (نقش‌برجسته‌های کهن تخت جمشید) */}
      <div
        className="absolute inset-0 opacity-[0.07] bg-repeat transition-transform duration-700 ease-out"
        style={{
          transform: `translateX(${parallaxX}px)`,
          backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#d97706 1px, #070913 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Persepolis Giant Colonnade Silhouette in Distance */}
      <div
        className="absolute inset-x-0 bottom-0 h-96 opacity-20 flex justify-around items-end transition-transform duration-700 ease-out"
        style={{
          transform: `translateX(${parallaxX * 0.6}px)`,
        }}
      >
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            className="w-10 sm:w-14 bg-gradient-to-t from-amber-600/40 via-amber-900/20 to-transparent border-t-4 border-amber-400/40 rounded-t-lg"
            style={{
              height: `${240 + (idx % 3) * 40}px`,
            }}
          />
        ))}
      </div>

      {/* Giant Luminous Faravahar Emblem in Center Sky */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-[0.05] transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(calc(-50% + ${parallaxX * 0.4}px), 0) scale(1.1)`,
        }}
      >
        <svg viewBox="0 0 200 100" className="w-full h-full" fill="#f59e0b">
          <circle cx="100" cy="40" r="14" />
          <path d="M 100 20 L 105 10 L 95 10 Z" />
          <path d="M 114 40 C 140 20, 180 30, 195 50 C 160 55, 130 50, 114 45 Z" />
          <path d="M 86 40 C 60 20, 20 30, 5 50 C 40 55, 70 50, 86 45 Z" />
        </svg>
      </div>

      {/* Floating Golden Fire Embers & Sparks */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-400/70 shadow-[0_0_8px_#f59e0b] animate-pulse"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_100%)] opacity-80" />
    </div>
  );
};
