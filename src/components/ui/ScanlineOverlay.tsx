/**
 * Тонкая CRT-развёртка поверх страницы: горизонтальные линии + едва заметное
 * зерно. Даёт «экранную» фактуру, из-за которой плоский near-black перестаёт
 * выглядеть просто чёрной заливкой.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function ScanlineOverlay() {
  return (
    <>
      {/* Развёртка */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.5] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 3px)',
        }}
      />
      {/* Зерно */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[101] opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: NOISE, backgroundSize: '140px 140px' }}
      />
    </>
  );
}
