/**
 * CRT-фактура поверх страницы: развёртка + зерно.
 *
 * Оба слоя собраны в один элемент: полноэкранный слой с mix-blend-mode —
 * дорогая операция композитинга, и два таких слоя стоили заметно дороже
 * одного. Прозрачности вшиты прямо в градиент и в цвет шума, поэтому
 * картинка та же, а композитится один раз.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function ScanlineOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] mix-blend-overlay"
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 3px), ${NOISE}`,
        backgroundSize: 'auto, 140px 140px',
        opacity: 0.85,
      }}
    />
  );
}
