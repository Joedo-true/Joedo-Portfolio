import { useId, useMemo } from 'react';

/**
 * Искривлённая проволочная сетка — статичный 2D-SVG, без WebGL и без реакции
 * на курсор. Линии обеих семей проходят через общее поле смещения, поэтому
 * сетка читается как натянутая волнами ткань.
 */
export function WarpGridSVG({
  cols = 44,
  rows = 20,
  amp = 26,
  className = '',
  opacity = 0.5,
  /** Плавное затухание к краям, чтобы сетка не обрывалась рамкой */
  fade = true,
}: {
  cols?: number;
  rows?: number;
  amp?: number;
  className?: string;
  opacity?: number;
  fade?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const W = 1200;
  const H = 520;

  const { vLines, hLines } = useMemo(() => {
    // Общее поле смещения: продольная волна по X + поперечная по Y
    const pt = (u: number, v: number): [number, number] => {
      const x = u * W + amp * 0.55 * Math.sin(v * Math.PI * 2.1 + u * 1.6);
      const y = v * H + amp * Math.sin(u * Math.PI * 2.6 + v * 1.1);
      return [x, y];
    };

    const path = (points: [number, number][]) =>
      points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

    const v: string[] = [];
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const pts: [number, number][] = [];
      for (let s = 0; s <= rows * 2; s++) pts.push(pt(u, s / (rows * 2)));
      v.push(path(pts));
    }

    const h: string[] = [];
    for (let r = 0; r <= rows; r++) {
      const vv = r / rows;
      const pts: [number, number][] = [];
      for (let s = 0; s <= cols * 2; s++) pts.push(pt(s / (cols * 2), vv));
      h.push(path(pts));
    }

    return { vLines: v, hLines: h };
  }, [cols, rows, amp]);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      {fade && (
        <defs>
          <radialGradient id={`f-${id}`} cx="50%" cy="50%" r="62%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="62%" stopColor="#fff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`m-${id}`}>
            <rect width={W} height={H} fill={`url(#f-${id})`} />
          </mask>
        </defs>
      )}
      <g
        mask={fade ? `url(#m-${id})` : undefined}
        stroke="currentColor"
        strokeWidth="0.7"
        fill="none"
        opacity={opacity}
        vectorEffect="non-scaling-stroke"
      >
        {vLines.map((d, i) => (
          <path key={`v${i}`} d={d} />
        ))}
        {hLines.map((d, i) => (
          <path key={`h${i}`} d={d} />
        ))}
      </g>
    </svg>
  );
}
