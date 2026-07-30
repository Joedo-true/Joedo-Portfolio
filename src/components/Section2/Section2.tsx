import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Spiral } from '../../three/objects/Spiral';
import { iridescentPresets } from '../../three/shaders/iridescentMaterial';
import { useSiteStore } from '../../store/useSiteStore';

gsap.registerPlugin(ScrollTrigger);

/**
 * Раздел 2 (ТЗ 8).
 *
 * Накрытие раздела 1 не считается по скроллу вручную: первый экран прилипший
 * (`sticky` в обёртке в App), а этот раздел идёт следом обычным потоком с
 * собственным фоном и более высоким z-index — и закрывает прилипший сам.
 *
 * ScrollTrigger нужен только для порога: как только верх раздела прошёл
 * середину вьюпорта — то есть раздел перекрыл 50% высоты экрана — тема
 * переворачивается с тёмной на светлую, а иконка в шапке меняет форму.
 * Обе смены идут из одного обновления стора, поэтому не могут разъехаться.
 */

const PLACEHOLDER = '[ТЕКСТ РАЗДЕЛА 2 — предоставит пользователь]';

export function Section2() {
  const section = useRef<HTMLElement>(null);
  const setSection = useSiteStore((state) => state.setSection);

  useEffect(() => {
    const node = section.current;
    if (!node) return;

    const trigger = ScrollTrigger.create({
      trigger: node,
      start: 'top center',
      onEnter: () => setSection('section2'),
      onLeaveBack: () => setSection('hero'),
    });

    return () => trigger.kill();
  }, [setSection]);

  return (
    <section
      ref={section}
      id="section2"
      className="section2"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-0">
        {/* Спираль — левая часть, вертикальная ориентация */}
        <div className="section2-spiral">
          <Canvas
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0, 7], fov: 42 }}
            style={{ pointerEvents: 'none' }}
          >
            <Spiral preset={iridescentPresets.spiral} />
          </Canvas>
        </div>

        {/* Текст — правая часть, начинается с середины страницы по вертикали */}
        <div className="section2-copy">
          <p className="section2-body">{PLACEHOLDER}</p>
        </div>
      </div>
    </section>
  );
}
