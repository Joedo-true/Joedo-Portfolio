import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSiteStore } from '../../store/useSiteStore';

/**
 * Счётчик загрузки (ТЗ 6, шаги 2 и 4).
 *
 * Тяжёлых ассетов у страницы нет, поэтому прогресс идёт по таймеру, как и
 * разрешает бриф. Единственное, чего действительно ждём, — шрифт: пока он не
 * готов, до 100% не доводим, иначе заголовок Hero успеет проявиться
 * подстановочным шрифтом и переверстается уже на глазах.
 *
 * На 100% счётчик уходит вниз за пределы экрана и уступает место Hero.
 */

const RUN_MS = 3000;

export function LoadingScreen() {
  const counter = useRef<HTMLParagraphElement>(null);
  const progress = useSiteStore((state) => state.loadingProgress);
  const isLoaded = useSiteStore((state) => state.isLoaded);
  const setLoadingProgress = useSiteStore((state) => state.setLoadingProgress);
  const setLoaded = useSiteStore((state) => state.setLoaded);

  useEffect(() => {
    let raf = 0;
    let fontsReady = false;
    const start = performance.now();

    const ready = document.fonts?.ready;
    if (ready) void ready.then(() => (fontsReady = true));
    else fontsReady = true;

    const tick = (now: number) => {
      const value = Math.min(100, ((now - start) / RUN_MS) * 100);
      setLoadingProgress(fontsReady ? value : Math.min(value, 99));
      if (value < 100 || !fontsReady) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [setLoadingProgress]);

  useEffect(() => {
    if (progress < 100 || isLoaded) return;
    const node = counter.current;
    if (!node) {
      setLoaded(true);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(node, { opacity: 0, duration: 0.4, onComplete: () => setLoaded(true) });
      return;
    }
    gsap.to(node, {
      y: '18vh',
      opacity: 0,
      duration: 0.55,
      ease: 'power2.in',
      onComplete: () => setLoaded(true),
    });
  }, [progress, isLoaded, setLoaded]);

  if (isLoaded) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-10">
      <p
        ref={counter}
        aria-live="polite"
        aria-label={`Загрузка ${Math.floor(progress)} процентов`}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-counter-size)',
          fontWeight: 400,
          color: 'var(--text-on-dark)',
          // Табличные цифры: иначе ширина счётчика прыгает на каждом разряде
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {String(Math.floor(progress)).padStart(3, '0')}
      </p>
    </div>
  );
}
