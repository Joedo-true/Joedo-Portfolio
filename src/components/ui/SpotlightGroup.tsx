import { useRef, type ReactNode } from 'react';

/**
 * Единый «прожектор» на группу карточек: один источник света следует за
 * курсором по всей сетке. Каждая карточка показывает лишь свою часть света
 * (обрезано по её форме), поэтому в промежутках между карточками и за их
 * пределами свечение не видно. Реализовано через CSS-переменные без
 * ре-рендеров React.
 */
export function SpotlightGroup({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const update = (clientX: number, clientY: number) => {
    const root = ref.current;
    if (!root) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const cards = root.querySelectorAll<HTMLElement>('[data-spotlight]');
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        // Координаты курсора относительно каждой карточки (могут быть
        // отрицательными/за пределами — тогда радиальный градиент просто
        // не доходит до карточки, и свет на ней не виден).
        card.style.setProperty('--sx', `${clientX - r.left}px`);
        card.style.setProperty('--sy', `${clientY - r.top}px`);
      });
    });
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={(e) => update(e.clientX, e.clientY)}
      onMouseEnter={() => ref.current?.setAttribute('data-active', 'true')}
      onMouseLeave={() => ref.current?.setAttribute('data-active', 'false')}
    >
      {children}
    </div>
  );
}
