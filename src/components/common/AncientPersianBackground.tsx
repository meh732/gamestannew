import React, { useEffect, useRef } from 'react';

interface AncientPersianBackgroundProps {
  shiftIndex?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  maxOpacity: number;
  pulseSpeed: number;
  color: string;
}

export const AncientPersianBackground: React.FC<AncientPersianBackgroundProps> = ({
  shiftIndex = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Parallax translation calculated strictly for GPU Compositor (translate3d)
  const parallaxX = (shiftIndex % 6) * -18;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // High-performance Particle Generator (30 golden fire embers & mystic sparks)
    const colors = ['#f59e0b', '#fbbf24', '#d97706', '#fef3c7', '#ef4444'];
    const particlesCount = window.innerWidth < 768 ? 25 : 45;

    const particles: Particle[] = Array.from({ length: particlesCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1.2,
      speedY: -(Math.random() * 0.6 + 0.2), // Rising gently like palace fire embers
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.7 + 0.2,
      maxOpacity: Math.random() * 0.6 + 0.3,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // High-efficiency single-pass Render Loop (Zero DOM nodes, 60fps GPU acceleration)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.speedY;
        p.x += p.speedX;
        p.opacity += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

        // Reset particle when it floats off top or sides
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw luminous glowing circular ember
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(p.maxOpacity, p.opacity));
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#060811]">
      {/* 1. Deep Midnight Palace Gradient (Hardware Accelerated) */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a0e1c] via-[#060812] to-[#030408] transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: `translate3d(${parallaxX * 0.3}px, 0, 0)`,
        }}
      />

      {/* 2. Ancient Persepolis Bas-Relief Geometric Lattice */}
      <div
        className="absolute inset-0 opacity-[0.06] transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: `translate3d(${parallaxX * 0.6}px, 0, 0)`,
          backgroundImage: `radial-gradient(#f59e0b 1.2px, transparent 1.2px), radial-gradient(#d97706 1px, #060811 1px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      {/* 3. Colonnade of Persepolis (ستون‌های باشکوه تخت جمشید) in Horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-80 opacity-25 flex justify-around items-end transition-transform duration-700 ease-out will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(${parallaxX * 0.8}px, 0, 0)`,
        }}
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="w-8 sm:w-12 bg-gradient-to-t from-amber-600/50 via-amber-900/20 to-transparent border-t-2 border-amber-400/50 rounded-t-md"
            style={{
              height: `${160 + (idx % 3) * 35}px`,
            }}
          />
        ))}
      </div>

      {/* 4. Golden Faravahar Celestial Emblem Watermark */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.05] transition-transform duration-700 ease-out will-change-transform pointer-events-none"
        style={{
          transform: `translate3d(calc(-50% + ${parallaxX * 0.4}px), 0, 0)`,
        }}
      >
        <svg viewBox="0 0 200 100" className="w-full h-full" fill="#f59e0b">
          <circle cx="100" cy="40" r="14" />
          <path d="M 100 20 L 105 10 L 95 10 Z" />
          <path d="M 114 40 C 140 20, 180 30, 195 50 C 160 55, 130 50, 114 45 Z" />
          <path d="M 86 40 C 60 20, 20 30, 5 50 C 40 55, 70 50, 86 45 Z" />
          <circle cx="100" cy="40" r="18" fill="none" stroke="#f59e0b" strokeWidth="2" />
        </svg>
      </div>

      {/* 5. Golden Fire Embers Canvas Engine (GPU Canvas 2D, 60fps) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};
