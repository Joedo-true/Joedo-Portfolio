import { useMemo } from 'react';

/**
 * Искривлённая проволочная сетка с бегущей волной.
 *
 * Поле смещения периодично по горизонтали: рисуем ровно два периода и
 * сдвигаем полотно на один период. В момент замыкания цикла картинка
 * совпадает сама с собой, поэтому волна идёт бесшовно и бесконечно.
 * Движение — один CSS-трансформ на весь SVG (без пересчёта путей в кадре).
 */
export function WarpGridSVG({
  cols = 26,
  rows = 20,
  amp = 26,
  className = '',
  opacity = 0.45,
  /** Плавное затухание к краям, чтобы сетка не обрывалась рамкой */
  fade = true,
  /** Длительность полного прохода волны, сек. Больше — спокойнее */
  duration = 26,
}: {
  cols?: number;
  rows?: number;
  amp?: number;
  className?: string;
  opacity?: number;
  fade?: boolean;
  duration?: number;
}) {
  // Один период волны в единицах viewBox; полотно шириной в два периода
  const P = 1200;
  const W = P * 2;
  const H = 520;

  const { vLines, hLines } = useMemo(() => {
    // Гармоники целые — иначе стык периодов будет заметен
    const pt = (x: number, v: number): [number, number] => {
      const u = x / P;
      const dx = amp * 0.5 * Math.sin(2 * Math.PI * u + v * Math.PI * 2.1);
      const dy = amp * Math.sin(2 * Math.PI * u * 2 + v * Math.PI * 1.1);
      return [x + dx, v * H + dy];
    };

    const d = (pts: [number, number][]) =>
      pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

    // Вертикали: по `cols` штук на период, дважды
    const totalCols = cols * 2;
    const v: string[] = [];
    for (let c = 0; c < totalCols; c++) {
      const x = (c / cols) * P;
      const pts: [number, number][] = [];
      for (let s = 0; s <= rows * 2; s++) pts.push(pt(x, s / (rows * 2)));
      v.push(d(pts));
    }

    // Горизонтали: тянутся через оба периода
    const samples = cols * 6;
    const h: string[] = [];
    for (let r = 0; r <= rows; r++) {
      const vv = r / rows;
      const pts: [number, number][] = [];
      for (let s = 0; s <= samples; s++) pts.push(pt((s / samples) * W, vv));
      h.push(d(pts));
    }

    return { vLines: v, hLines: h };
  }, [cols, rows, amp]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      aria-hidden
      style={
        fade
          ? {
              // Затухание живёт на контейнере, поэтому остаётся неподвижным,
              // пока линии под ним едут
              WebkitMaskImage:
                'radial-gradient(ellipse 62% 62% at 50% 50%, #000 42%, rgba(0,0,0,0.55) 72%, transparent 100%)',
              maskImage:
                'radial-gradient(ellipse 62% 62% at 50% 50%, #000 42%, rgba(0,0,0,0.55) 72%, transparent 100%)',
            }
          : undefined
      }
    >
      <svg
        className="animate-wave h-full w-[200%]"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        focusable="false"
        style={{ animationDuration: `${duration}s` }}
      >
        <g
          stroke="currentColor"
          strokeWidth="0.7"
          fill="none"
          opacity={opacity}
          vectorEffect="non-scaling-stroke"
        >
          {vLines.map((p, i) => (
            <path key={`v${i}`} d={p} />
          ))}
          {hLines.map((p, i) => (
            <path key={`h${i}`} d={p} />
          ))}
        </g>
      </svg>
    </div>
  );
}
