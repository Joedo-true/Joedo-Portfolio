import type { ReactNode } from 'react';

/** Бесконечная бегущая строка (всегда в движении). */
export function Marquee({
  items,
  className,
  reverse,
}: {
  items: ReactNode[];
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={`mask-fade-x overflow-hidden ${className ?? ''}`}>
      <div
        className="flex w-max animate-marquee items-center gap-10"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-10" aria-hidden={dup === 1}>
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                {item}
                <span className="text-brand-violet/50">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
