import { useMemo } from 'react';

/**
 * Декоративный штрихкод — разделитель под заголовками секций.
 * Рисунок штрихов детерминированно выводится из `seed`, поэтому у каждой
 * секции свой узор, но он не «прыгает» между рендерами.
 */
export function Barcode({
  seed = 1,
  className = '',
  width = 108,
  height = 24,
}: {
  seed?: number;
  className?: string;
  width?: number;
  height?: number;
}) {
  const bars = useMemo(() => {
    // Простой детерминированный ГПСЧ (mulberry32)
    let s = seed * 0x9e3779b9;
    const rnd = () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const out: { x: number; w: number }[] = [];
    let x = 0;
    while (x < width - 2) {
      const w = rnd() < 0.72 ? 1 : rnd() < 0.6 ? 2 : 3;
      out.push({ x, w });
      x += w + (rnd() < 0.5 ? 1 : 2);
    }
    return out;
  }, [seed, width]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
      focusable="false"
    >
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="currentColor" />
      ))}
    </svg>
  );
}
