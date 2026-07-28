import { useEffect, useRef } from 'react';

/**
 * Сетка с рябью — вид сверху.
 *
 * Полотно неподвижно: смещается каждый узел по отдельности. Поле смещения
 * складывается из двух концентрических источников ряби (волны расходятся
 * кругами и затухают с расстоянием) и пологой диагональной зыби. Точки
 * ходят по маленьким орбитам, соседи запаздывают друг за другом — так
 * читается волна, идущая по плоскости, а не едущее полотно.
 *
 * Рисуется на canvas: 45+ ломаных пересчитываются каждый кадр, в SVG это
 * означало бы столько же обновлений DOM. Кадры не идут, пока блок за
 * пределами экрана.
 */
export function WaveGrid({
  cols = 30,
  rows = 20,
  amp = 14,
  opacity = 0.42,
  speed = 1,
  className = '',
  fade = true,
}: {
  cols?: number;
  rows?: number;
  /** Максимальный размах хода узла, px */
  amp?: number;
  opacity?: number;
  speed?: number;
  className?: string;
  fade?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Источники ряби в долях от размера блока
    const sources = [
      { x: 0.24, y: 0.32, k: 0.055, w: 1.5, a: 1 },
      { x: 0.78, y: 0.68, k: 0.042, w: -1.1, a: 0.85 },
    ];

    /** Смещение узла (px) в момент времени t */
    const offset = (px: number, py: number, t: number): [number, number] => {
      let dx = 0;
      let dy = 0;

      for (const s of sources) {
        const cx = s.x * w;
        const cy = s.y * h;
        const vx = px - cx;
        const vy = py - cy;
        const r = Math.hypot(vx, vy) || 1;
        // Круговая волна, затухающая с расстоянием от источника
        const wave = Math.sin(r * s.k - t * s.w) / (1 + r * 0.006);
        dx += (vx / r) * wave * s.a;
        dy += (vy / r) * wave * s.a;
      }

      // Пологая зыбь по диагонали — чтобы поле не выглядело только круговым
      dx += 0.35 * Math.sin(py * 0.02 + t * 0.6);
      dy += 0.35 * Math.cos(px * 0.018 - t * 0.5);

      return [dx * amp, dy * amp];
    };

    let raf = 0;
    let start = performance.now();
    let running = true;

    const draw = (now: number) => {
      const t = reduced ? 0 : ((now - start) / 1000) * speed;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
      ctx.lineWidth = 1;

      const stepX = w / cols;
      const stepY = h / rows;

      // Узлы считаем один раз на кадр и переиспользуем для обоих направлений
      const px: number[] = [];
      const py: number[] = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x0 = c * stepX;
          const y0 = r * stepY;
          const [dx, dy] = offset(x0, y0, t);
          const i = r * (cols + 1) + c;
          px[i] = x0 + dx;
          py[i] = y0 + dy;
        }
      }

      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const i = r * (cols + 1) + c;
          if (c === 0) ctx.moveTo(px[i], py[i]);
          else ctx.lineTo(px[i], py[i]);
        }
      }
      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const i = r * (cols + 1) + c;
          if (r === 0) ctx.moveTo(px[i], py[i]);
          else ctx.lineTo(px[i], py[i]);
        }
      }
      ctx.stroke();

      if (running && !reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) requestAnimationFrame(draw);
    });
    ro.observe(wrap);

    // За пределами экрана кадры не считаем
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) {
          running = true;
          start = performance.now() - 1;
          raf = requestAnimationFrame(draw);
        } else if (!e.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: '120px' },
    );
    io.observe(wrap);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [cols, rows, amp, opacity, speed]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={
        fade
          ? {
              WebkitMaskImage:
                'radial-gradient(ellipse 64% 64% at 50% 50%, #000 40%, rgba(0,0,0,0.5) 74%, transparent 100%)',
              maskImage:
                'radial-gradient(ellipse 64% 64% at 50% 50%, #000 40%, rgba(0,0,0,0.5) 74%, transparent 100%)',
            }
          : undefined
      }
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
