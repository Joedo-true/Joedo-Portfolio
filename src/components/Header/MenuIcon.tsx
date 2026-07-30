import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type * as THREE from 'three';
import gsap from 'gsap';
import { Tesseract } from '../../three/objects/Tesseract';
import { Globe } from '../../three/objects/Globe';
import { iridescentPresets } from '../../three/shaders/iridescentMaterial';
import { useSiteStore, type HeaderIcon } from '../../store/useSiteStore';

/**
 * Кнопка меню: тессеракт в разделе 1, глобус в разделе 2 (ТЗ 7.3 и 8.5).
 *
 * Смена формы идёт через пиксельное проявление: силуэт разваливается в
 * мозаику, под ней геометрия подменяется, затем мозаика собирается обратно уже
 * новой формой. Мгновенная подмена брифом запрещена.
 *
 * Мозаика получается без шейдера и без render target: буфер холста сжимается
 * до нескольких пикселей, а браузер растягивает его обратно без интерполяции.
 * Размер буфера меняем прямо у рендерера, а не пропом `dpr`: проп идёт через
 * состояние React, и на просадках кадров промежуточные значения теряются —
 * замер показывал, что мозаика не доходит даже до одного пикселя на блок.
 *
 * Клик в Части 1 ничего не делает — поведение меню бриф не описывает (ТЗ 11.2).
 */

const SHARP_DPR = 2;
const NOISE_DPR = 0.09;

export function MenuIcon() {
  const target = useSiteStore((state) => state.headerIcon);
  const [shown, setShown] = useState<HeaderIcon>(target);
  const renderer = useRef<THREE.WebGLRenderer | null>(null);

  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(() => {
    if (target === shown) return;
    const gl = renderer.current;
    if (reduced || !gl) {
      setShown(target);
      return;
    }

    const element = gl.domElement;
    const width = element.clientWidth;
    const height = element.clientHeight;

    const apply = (dpr: number) => {
      gl.setPixelRatio(dpr);
      // false — не трогать CSS-размер: элемент остаётся 52px, мельчает только буфер
      gl.setSize(width, height, false);
      element.style.imageRendering = dpr < 1 ? 'pixelated' : 'auto';
    };

    const state = { dpr: SHARP_DPR };
    const timeline = gsap.timeline();
    timeline
      .to(state, {
        dpr: NOISE_DPR,
        duration: 0.35,
        ease: 'power2.inOut',
        onUpdate: () => apply(state.dpr),
        // Форму подменяем на дне — под неразличимым шумом
        onComplete: () => setShown(target),
      })
      .to(state, {
        dpr: SHARP_DPR,
        duration: 0.45,
        ease: 'power2.inOut',
        onUpdate: () => apply(state.dpr),
      });

    return () => {
      timeline.kill();
      apply(SHARP_DPR);
    };
  }, [target, shown, reduced]);

  return (
    <Canvas
      dpr={SHARP_DPR}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 4.6], fov: 42 }}
      style={{ pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        renderer.current = gl;
      }}
    >
      {shown === 'tesseract' ? (
        /* Угол подобран так, чтобы в 52 пикселях ещё читалось «куб в кубе» */
        <group rotation={[-0.42, 0.68, 0]} scale={1.05}>
          <Tesseract preset={iridescentPresets.iconLight} tubeRadius={0.1} />
        </group>
      ) : (
        <Globe preset={iridescentPresets.iconDark} />
      )}
    </Canvas>
  );
}
