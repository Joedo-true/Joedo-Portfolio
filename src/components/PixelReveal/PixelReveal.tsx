import { createElement, useEffect, useRef, useState } from 'react';

/**
 * Пиксельное проявление текста (ТЗ 4.1, вариант A).
 *
 * Текст рисуется в офскрин-canvas тем же шрифтом и цветом, что и настоящий
 * DOM-узел, затем уменьшается и растягивается обратно без интерполяции —
 * получается честная мозаика, а не размытие. Блок мозаики едет от
 * `maxPixelSize` к 1 пикселю, размытие гаснет параллельно.
 *
 * DOM-узел с текстом остаётся в разметке (скринридеры, поиск, выделение) и в
 * конце проявления подменяет собой canvas кроссфейдом — так расхождение в
 * полпикселя между canvas-версией и версией браузера не читается как рывок.
 *
 * При `prefers-reduced-motion` мозаика не строится вообще: остаётся простое
 * появление (ТЗ 10).
 */

type RevealTag = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';

interface PixelRevealProps {
  /** Текст. `\n` — принудительный перенос строки, остальное переносится по ширине */
  text: string;
  as?: RevealTag;
  className?: string;
  /** Запуск проявления */
  play?: boolean;
  /** Задержка перед стартом, с */
  delay?: number;
  /** Длительность проявления, с */
  duration?: number;
  /** Стартовая сторона пиксельного блока, px */
  maxPixelSize?: number;
  onDone?: () => void;
}

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** Жадный перенос по ширине контейнера; `\n` уважается как жёсткий перенос */
const wrapLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
};

export function PixelReveal({
  text,
  as = 'div',
  className = '',
  play = true,
  delay = 0,
  duration = 1,
  maxPixelSize = 26,
  onDone,
}: PixelRevealProps) {
  const hostRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!play || done) return;
    const host = hostRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!host || !textEl || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    let raf = 0;
    let source: HTMLCanvasElement | null = null;
    const scratch = document.createElement('canvas');

    const finish = () => {
      textEl.style.opacity = '1';
      setDone(true);
      onDone?.();
    };

    /** Перерисовать эталон: чёткий текст в офскрин-canvas */
    const paintSource = () => {
      const rect = host.getBoundingClientRect();
      const cs = getComputedStyle(textEl);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));

      const src = document.createElement('canvas');
      src.width = Math.round(w * dpr);
      src.height = Math.round(h * dpr);
      const sctx = src.getContext('2d');
      if (!sctx) return null;
      sctx.scale(dpr, dpr);

      const fontSize = parseFloat(cs.fontSize);
      const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.2;
      sctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
      // letterSpacing на canvas 2D есть не везде — без него текст просто чуть уже
      if ('letterSpacing' in sctx) {
        (sctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      }
      sctx.fillStyle = cs.color;
      sctx.textBaseline = 'middle';

      const align: CanvasTextAlign =
        cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' ? 'right' : 'left';
      sctx.textAlign = align;
      const x = align === 'center' ? w / 2 : align === 'right' ? w : 0;

      // text-transform браузер применяет при вёрстке, а fillText о нём не знает:
      // без этого мозаика рисует исходный регистр, и в конце кроссфейда текст
      // скачком меняет и регистр, и ширину строк
      const shown =
        cs.textTransform === 'uppercase'
          ? text.toUpperCase()
          : cs.textTransform === 'lowercase'
            ? text.toLowerCase()
            : cs.textTransform === 'capitalize'
              ? text.replace(/(^|\s)(\S)/g, (_, space, letter) => space + letter.toUpperCase())
              : text;

      for (const [i, line] of wrapLines(sctx, shown, w).entries()) {
        sctx.fillText(line, x, lineHeight * (i + 0.5));
      }

      canvas.width = src.width;
      canvas.height = src.height;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      return src;
    };

    const draw = (p: number) => {
      if (!source) return;
      const eased = 1 - (1 - p) ** 3; // power3.out — ТЗ 3, «появление»
      const pixel = Math.max(1, Math.round(maxPixelSize * (1 - eased)));
      const blur = 7 * (1 - eased);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = Math.min(1, eased * 2.2);
      ctx.filter = blur > 0.05 ? `blur(${blur}px)` : 'none';

      if (pixel <= 1) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(source, 0, 0);
      } else {
        const sw = Math.max(1, Math.round(canvas.width / pixel));
        const sh = Math.max(1, Math.round(canvas.height / pixel));
        scratch.width = sw;
        scratch.height = sh;
        const tctx = scratch.getContext('2d');
        if (tctx) {
          tctx.imageSmoothingEnabled = true;
          tctx.drawImage(source, 0, 0, sw, sh);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(scratch, 0, 0, sw, sh, 0, 0, canvas.width, canvas.height);
        }
      }

      ctx.filter = 'none';
      ctx.globalAlpha = 1;

      // Кроссфейд на настоящий текст в самом конце
      const swap = smoothstep(0.82, 1, p);
      textEl.style.opacity = String(swap);
      canvas.style.opacity = String(1 - swap);
    };

    const start = async () => {
      // Пока шрифт не загружен, метрики текста врут и мозаика не совпадёт
      // с финальной раскладкой
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        textEl.style.transition = 'opacity 0.5s ease-out';
        textEl.style.opacity = '1';
        finish();
        return;
      }

      source = paintSource();
      if (!source) {
        finish();
        return;
      }

      const t0 = performance.now() + delay * 1000;
      const tick = (now: number) => {
        if (cancelled) return;
        const p = Math.min(1, Math.max(0, (now - t0) / (duration * 1000)));
        draw(p);
        if (p < 1) raf = requestAnimationFrame(tick);
        else finish();
      };
      raf = requestAnimationFrame(tick);
    };

    // Смена ширины по ходу проявления — перерисовать эталон под новую раскладку
    const ro = new ResizeObserver(() => {
      if (!cancelled && source) source = paintSource();
    });
    ro.observe(host);

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [play, done, text, delay, duration, maxPixelSize, onDone]);

  return createElement(
    as,
    { ref: hostRef, className, style: { position: 'relative' } },
    <span
      key="text"
      ref={textRef}
      style={{ whiteSpace: 'pre-line', opacity: done ? 1 : 0, display: 'block' }}
    >
      {text}
    </span>,
    done ? null : (
      <canvas
        key="canvas"
        ref={canvasRef}
        aria-hidden
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
    ),
  );
}
