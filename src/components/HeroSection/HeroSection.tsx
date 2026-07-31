import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSiteStore } from '../../store/useSiteStore';
import { HeroScene } from '../../three/HeroScene';
import { PixelReveal } from '../PixelReveal/PixelReveal';
import { LoadingScreen } from '../LoadingScreen/LoadingScreen';

/**
 * Первый экран: загрузка и Hero живут в одной секции и делят один тессеракт
 * (ТЗ, Фазы 1 и 2). Шапка вынесена в SiteHeader — она закреплена и переживает
 * прокрутку в раздел 2.
 *
 * Раздел остаётся тёмным всегда, даже после переворота темы (ТЗ 8.2), поэтому
 * цвета взяты из `--bg-dark` напрямую, а не из темовых `--bg`/`--text`.
 */

const HEADLINE = 'React\nинтерфейсы\nпод ключ';
const SUBLINE =
  'Калькуляторы лидов, CRM-панели и умные каталоги. Ускоряю загрузку, навожу порядок в логике и делаю так, чтобы каждый экран работал на заявку.';

/** Стартовое размытие: сайт проявляется из расфокуса, а не включается разом */
const OPEN_BLUR = 18;
const OPEN_DURATION = 1.4;

export function HeroSection() {
  const isLoaded = useSiteStore((state) => state.isLoaded);
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const state = { blur: OPEN_BLUR };
    node.style.filter = `blur(${OPEN_BLUR}px)`;

    const tween = gsap.to(state, {
      blur: 0,
      duration: OPEN_DURATION,
      ease: 'power3.out',
      onUpdate: () => {
        node.style.filter = `blur(${state.blur}px)`;
      },
      // Снимаем фильтр совсем: он держит слой композитинга и создаёт
      // containing block, а после проявления это уже ни к чему
      onComplete: () => {
        node.style.filter = '';
      },
    });

    return () => {
      tween.kill();
      node.style.filter = '';
    };
  }, []);

  return (
    <section
      ref={section}
      id="top"
      className="relative flex h-[100svh] flex-col overflow-hidden"
      style={{ background: 'var(--bg-dark)', color: 'var(--text-on-dark)' }}
    >
      {/* Тессеракт во весь экран — фигура и есть сигнатура страницы */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Затемнение под текстом. Бриф просит не добавлять лишнего, но текст
          лежит поверх светлых труб тессеракта и без подложки не читается —
          контраст относится к обязательному минимуму (ТЗ 10). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            'radial-gradient(ellipse 44% 38% at 50% 52%, rgba(10,10,11,0.6) 0%, rgba(10,10,11,0.4) 50%, rgba(10,10,11,0.14) 76%, transparent 100%)',
        }}
      />

      {/* Центральный текст */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-16 text-center">
        <div className="max-w-3xl">
          <PixelReveal
            text={HEADLINE}
            as="h1"
            play={isLoaded}
            duration={1.1}
            maxPixelSize={30}
            className="hero-display"
          />
          <PixelReveal
            text={SUBLINE}
            as="p"
            play={isLoaded}
            delay={0.18}
            duration={0.9}
            maxPixelSize={12}
            className="hero-subline"
          />
        </div>
      </div>

      <LoadingScreen />
    </section>
  );
}
