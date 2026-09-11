import { useEffect, useRef } from 'react';

export default function StarsBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf = 0;
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      s: Math.random() * 0.35 + 0.05,
      o: Math.random() * 0.7 + 0.2,
      hue: Math.random() > 0.7 ? 190 : Math.random() > 0.5 ? 260 : 220,
    }));
    const parts = Array.from({ length: 28 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      // nebulosas
      const g1 = ctx.createRadialGradient(w * 0.15, h * 0.2, 0, w * 0.15, h * 0.2, w * 0.4);
      g1.addColorStop(0, 'rgba(34,211,238,0.10)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);
      const g2 = ctx.createRadialGradient(w * 0.85, h * 0.75, 0, w * 0.85, h * 0.75, w * 0.45);
      g2.addColorStop(0, 'rgba(139,92,246,0.12)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.y -= s.s;
        if (s.y < -5) { s.y = h + 5; s.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${s.o})`;
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(34,211,238,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.globalAlpha = (1 - d / 140) * 0.6;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34,211,238,0.35)';
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" />;
}
