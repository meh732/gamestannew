// Persian Mythological High-Performance WebGL/Canvas Particle & FX Engine

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  shape: 'circle' | 'spark' | 'coin' | 'diamond';
}

class VisualFXEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private isRunning = false;

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.resize();
    window.addEventListener('resize', this.resize);
    this.start();
  }

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    this.particles = [];
  }

  private resize = () => {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  private stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Golden Persian Sparks Explosion (e.g. for piece move, dice roll, win)
  public spawnSparks(x: number, y: number, count = 25, color = '#f59e0b') {
    const colors = [color, '#fbbf24', '#fef08a', '#ffffff', '#d97706'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 25,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.4 ? 'spark' : 'circle',
      });
    }
    if (!this.isRunning) this.start();
  }

  // Victory Gold Coin Shower (e.g. winning match, league prize, wheel jackpot)
  public spawnCoinShower(count = 35) {
    const w = this.canvas ? this.canvas.width : window.innerWidth;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 50,
        vx: (Math.random() - 0.5) * 3,
        vy: 3 + Math.random() * 5,
        size: 10 + Math.random() * 12,
        color: '#f59e0b',
        alpha: 1,
        life: 0,
        maxLife: 90 + Math.random() * 60,
        rotation: Math.random() * Math.PI * 2,
        vRot: 0.05 + Math.random() * 0.1,
        shape: 'coin',
      });
    }
    if (!this.isRunning) this.start();
  }

  // Diamond & Gem Burst (e.g. Candy / Jewels match)
  public spawnGemBurst(x: number, y: number, gemColor: string, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: gemColor,
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        shape: 'diamond',
      });
    }
    if (!this.isRunning) this.start();
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;

    // Clear with transparent frame
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRot;

      // Gravity for coins and sparks
      if (p.shape === 'coin') {
        p.vy += 0.15;
      } else if (p.shape === 'spark') {
        p.vy += 0.08;
        p.vx *= 0.96;
      }

      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.shape === 'coin') {
        // Render 3D Spinning Golden Coin
        const scaleX = Math.abs(Math.sin(p.rotation * 3));
        this.ctx.scale(Math.max(0.15, scaleX), 1);

        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#b45309';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        this.ctx.fillStyle = '#78350f';
        this.ctx.font = `bold ${Math.floor(p.size)}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('👑', 0, 0);
      } else if (p.shape === 'spark') {
        // Render 4-point Golden Star Spark
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        const s = p.size;
        this.ctx.moveTo(0, -s);
        this.ctx.quadraticCurveTo(0, 0, s, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, s);
        this.ctx.quadraticCurveTo(0, 0, -s, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, -s);
        this.ctx.fill();
      } else if (p.shape === 'diamond') {
        // Render Cut Diamond
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        const s = p.size;
        this.ctx.moveTo(0, -s);
        this.ctx.lineTo(s, 0);
        this.ctx.lineTo(0, s);
        this.ctx.lineTo(-s, 0);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      } else {
        // Soft Glow Circle
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      this.isRunning = false;
    }
  };
}

export const gfx = new VisualFXEngine();
