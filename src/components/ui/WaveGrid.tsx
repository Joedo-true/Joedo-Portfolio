import { useEffect, useRef } from 'react';

/**
 * Сетка с рябью — вид сверху.
 *
 * Полотно неподвижно: смещается каждый узел по отдельности. Поле смещения
 * складывается из двух концентрических источников ряби (волны расходятся
 * кругами и затухают с расстоянием) и пологой диагональной зыби.
 *
 * При `interactive` добавляется указатель: узлы внутри небольшого круга под
 * курсором расступаются — линии цепляются за мышь, но след за ней не тянется.
 * Смещение от курсора у каждого узла своё и живёт с задержкой: под нажим узел
 * уходит быстро, а возвращается в несколько раз дольше. Из-за этой асимметрии
 * сетка ведёт себя вязко, а не как натянутая резина.
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
  animated = true,
  interactive = false,
}: {
  cols?: number;
  rows?: number;
  /** Максимальный размах хода узла, px */
  amp?: number;
  opacity?: number;
  speed?: number;
  className?: string;
  fade?: boolean;
  /** false — один статичный кадр, цикл анимации не запускается вовсе */
  animated?: boolean;
  /** Реакция на курсор: узлы расступаются в круге под мышью */
  interactive?: boolean;
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
    const still = !animated || reduced;
    const STATIC_T = 2.4;
    const live = interactive && !reduced;

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

    // ——— Указатель ———
    // Курсор ведём с запаздыванием: сетка тянется за ним, а не дёргается.
    // Никаких расходящихся колец — только локальный круг под курсором,
    // иначе за мышью тянется след с заметным «хвостом».
    const ptr = { x: 0, y: 0, tx: 0, ty: 0, inside: false, held: false };
    const PUSH_R = 120; // радиус круга воздействия
    const PUSH = 11; // сила расталкивания, px

    // Смещение от курсора — состояние каждого узла, а не функция позиции мыши:
    // иначе линии встают на место ровно так же резко, как уходит курсор.
    // Доли даны на кадр при 60 Гц, пересчёт под реальный кадр — в `ease`.
    const nodes = (cols + 1) * (rows + 1);
    const pushX = new Float32Array(nodes);
    const pushY = new Float32Array(nodes);
    const ATTACK = 0.16; // уступить нажиму — примерно 0.1 с
    const RELEASE = 0.018; // вернуться на место — примерно 1 с, в 9 раз дольше
    /** Доля «за кадр при 60 Гц» → доля за фактический кадр длиной dt */
    const ease = (k: number, dt: number) => 1 - (1 - k) ** (dt * 60);

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ptr.inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      if (!ptr.inside) return;
      ptr.tx = x;
      ptr.ty = y;
    };
    const onDown = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      ptr.held = true;
    };
    const onUp = () => {
      ptr.held = false;
    };
    const onLeave = () => {
      ptr.inside = false;
    };

    if (live) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    // Источники ряби в долях от размера блока
    const sources = [
      { x: 0.24, y: 0.32, k: 0.055, w: 1.5, a: 1 },
      { x: 0.78, y: 0.68, k: 0.042, w: -1.1, a: 0.85 },
    ];

    /** Смещение узла (px). `t` — время поля ряби, с учётом speed. */
    const offset = (px: number, py: number, t: number): [number, number] => {
      let dx = 0;
      let dy = 0;

      for (const s of sources) {
        const cx = s.x * w;
        const cy = s.y * h;
        const vx = px - cx;
        const vy = py - cy;
        const r = Math.hypot(vx, vy) || 1;
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
    let last = start;
    let running = true;

    const draw = (now: number) => {
      const t = still ? STATIC_T : ((now - start) / 1000) * speed;
      // Ограничение сверху: после возврата на вкладку кадр «длиной» в минуту
      // не должен разом дёрнуть всю сетку
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      // Курсор догоняет цель — сглаживает рывки мыши
      const kAttack = ease(ATTACK, dt);
      const kRelease = ease(RELEASE, dt);
      if (live) {
        const kPtr = ease(0.16, dt);
        ptr.x += (ptr.tx - ptr.x) * kPtr;
        ptr.y += (ptr.ty - ptr.y) * kPtr;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
      ctx.lineWidth = 1;

      const stepX = w / cols;
      const stepY = h / rows;

      const px: number[] = [];
      const py: number[] = [];
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x0 = c * stepX;
          const y0 = r * stepY;
          const [dx, dy] = offset(x0, y0, still ? STATIC_T : t);
          const i = r * (cols + 1) + c;

          if (live) {
            // Куда курсор толкает узел прямо сейчас (0, если курсор далеко)
            let gx = 0;
            let gy = 0;
            if (ptr.inside) {
              const vx = x0 - ptr.x;
              const vy = y0 - ptr.y;
              const d = Math.hypot(vx, vy) || 1;
              if (d < PUSH_R) {
                const f = (1 - d / PUSH_R) ** 2 * PUSH * (ptr.held ? 1.5 : 1);
                gx = (vx / d) * f;
                gy = (vy / d) * f;
              }
            }
            // Сравниваем квадраты длин — без корня: узел уступает быстро,
            // а расходится обратно медленно
            const k =
              gx * gx + gy * gy > pushX[i] * pushX[i] + pushY[i] * pushY[i] ? kAttack : kRelease;
            pushX[i] += (gx - pushX[i]) * k;
            pushY[i] += (gy - pushY[i]) * k;
            px[i] = x0 + dx + pushX[i];
            py[i] = y0 + dy + pushY[i];
          } else {
            px[i] = x0 + dx;
            py[i] = y0 + dy;
          }
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

      if (running && !still) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => {
      resize();
      if (still) requestAnimationFrame(draw);
    });
    ro.observe(wrap);

    const io = still
      ? null
      : new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting && !running) {
              running = true;
              start = performance.now() - 1;
              last = start;
              // Пока блок был за экраном, кадры не шли: возвращаемся к
              // нетронутой сетке, а не к застывшей вмятине от курсора
              pushX.fill(0);
              pushY.fill(0);
              raf = requestAnimationFrame(draw);
            } else if (!e.isIntersecting) {
              running = false;
              cancelAnimationFrame(raf);
            }
          },
          { rootMargin: '120px' },
        );
    io?.observe(wrap);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      if (live) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointerleave', onLeave);
      }
    };
  }, [cols, rows, amp, opacity, speed, animated, interactive]);

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
