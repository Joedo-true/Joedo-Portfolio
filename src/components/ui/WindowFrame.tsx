import type { ReactNode } from 'react';

/**
 * Рамка-«окно» файлового менеджера: моноширинная титульная строка с именем
 * файла и крестиком. Используется как обёртка для превью интерфейсов.
 */
export function WindowFrame({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`win ${className}`}>
      <div className="win-bar">
        <span className="truncate tracking-[0.06em]">{title}</span>
        <span aria-hidden className="pl-3 text-white/45">
          ✕
        </span>
      </div>
      {children}
    </div>
  );
}
