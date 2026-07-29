import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { Tesseract, buildTesseract } from './objects/Tesseract';
import { iridescentPresets } from './shaders/iridescentMaterial';
import { useSiteStore } from '../store/useSiteStore';

/**
 * Тессеракт первого экрана: тот же объект обслуживает и загрузку, и Hero —
 * на 85% прогресса он просто уезжает с «крупнее экрана» до рабочего размера
 * (ТЗ 6, шаг 3), а не подменяется вторым.
 */

/**
 * Доли высоты вьюпорта: на загрузке крупнее экрана, потом рабочий размер.
 *
 * Бриф даёт ориентир 140–160% и разрешает поправить по первому прогону — что и
 * потребовалось: фигура полая, и на 150% кадр попадает в её пустую середину,
 * экран остаётся чёрным. На 115% рёбра пересекают кадр, и «крупнее экрана»
 * читается. Рабочий размер тоже ниже ориентира: куб постоянно повёрнут, а его
 * проекция по диагонали шире грани примерно в полтора раза.
 */
const LOADING_SIZE = 1.15;
const HERO_SIZE = 0.4;
const SHRINK_AT = 85;

/** Полный оборот, с (ТЗ 6, шаг 5) */
const SPIN_Z = 14;
const SPIN_Y = 30;

function TesseractRig() {
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((state) => state.viewport);
  const size = useRef({ k: LOADING_SIZE });
  const shrunk = useRef(false);
  const progress = useSiteStore((state) => state.loadingProgress);

  const shape = useMemo(() => buildTesseract(), []);
  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(() => {
    if (progress < SHRINK_AT || shrunk.current) return;
    shrunk.current = true;
    gsap.to(size.current, { k: HERO_SIZE, duration: 1.1, ease: 'power3.inOut' });
  }, [progress]);

  useFrame((state) => {
    const node = group.current;
    if (!node) return;

    // Размер задан долей высоты экрана, поэтому считаем от вьюпорта в мировых
    // единицах — фигура одинаково смотрится на любом соотношении сторон
    node.scale.setScalar((size.current.k * viewport.height) / (shape.extent * 2));

    if (reduced) return;
    // Обе оси крутятся одновременно и линейно: время не берём по модулю,
    // поэтому склейки на 360° просто не существует
    const time = state.clock.elapsedTime;
    node.rotation.z = -time * ((Math.PI * 2) / SPIN_Z);
    node.rotation.y = time * ((Math.PI * 2) / SPIN_Y);
  });

  return (
    <group ref={group}>
      <Tesseract preset={iridescentPresets.tesseract} shape={shape} />
    </group>
  );
}

export function HeroScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ pointerEvents: 'none' }}
    >
      <TesseractRig />
    </Canvas>
  );
}
