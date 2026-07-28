import type { ReactNode } from 'react';
import { Barcode } from './Barcode';

/**
 * Заголовок секции: крупный тонкий верхний регистр с мигающим терминальным
 * курсором, под ним — штрихкод. Справа — метка в скобках.
 */
export function SectionHeading({
  title,
  label,
  seed = 1,
  intro,
}: {
  /** Крупный заголовок (латиница/кириллица, выводится как есть) */
  title: string;
  /** Метка в скобках справа, например SCHEDULE */
  label?: string;
  seed?: number;
  intro?: ReactNode;
}) {
  return (
    <div className="relative">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="display text-white">
            {title}
            <span className="ml-1 animate-caret text-white/70">_</span>
          </h2>
          <Barcode seed={seed} className="mt-5 text-white/80" />
        </div>
        {label && <span className="paren-label hidden shrink-0 pb-2 sm:block">({label})</span>}
      </div>

      {intro && (
        <p className="mt-7 max-w-xl text-sm leading-relaxed text-white/55">{intro}</p>
      )}
    </div>
  );
}
