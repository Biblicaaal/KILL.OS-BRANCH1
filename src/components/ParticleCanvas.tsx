import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ParticleCanvasProps {
  completionPercent: number;
  intensity?: number;
}

export function ParticleCanvas({ completionPercent, intensity = 0.8 }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const percentRef = useRef(completionPercent);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    percentRef.current = completionPercent;
  }, [completionPercent]);

  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#ff2ed1', '#00e0ff', '#ffcc00', '#33ffcc'];

    const spawnRate = () => {
      const p = percentRef.current;
      const i = intensityRef.current;
      if (p >= 100) return 6 * i;
      if (p >= 80) return 4 * i;
      if (p >= 60) return 2 * i;
      if (p >= 40) return 1 * i;
      return 0.3 * i;
    };

    let spawnAccum = 0;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      spawnAccum += spawnRate();
      const toSpawn = Math.floor(spawnAccum);
      spawnAccum -= toSpawn;

      for (let i = 0; i < toSpawn; i++) {
        const xStart = canvas.width * 0.1 + Math.random() * canvas.width * 0.8;
        const yStart = canvas.height - 44 + Math.random() * 10;
        particlesRef.current.push({
          x: xStart,
          y: yStart,
          vx: (Math.random() - 0.5) * 2,
          vy: -(Math.random() * 2 + 0.5),
          life: 0,
          maxLife: 60 + Math.random() * 60,
          size: Math.random() * 3 + 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }

      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      for (const p of particlesRef.current) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
}
