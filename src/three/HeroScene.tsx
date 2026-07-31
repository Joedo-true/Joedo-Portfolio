import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { buildTesseract } from './objects/tesseractShape';
import { ParticleTesseract } from './objects/ParticleTesseract';
import { iridescentPresets } from './shaders/iridescentMaterial';
import { useSiteStore } from '../store/useSiteStore';

/**
 * Тессеракт первого экрана: тот же объект обслуживает и загрузку, и Hero —
 * на 85% прогресса он просто уезжает с «крупнее экрана» до рабочего размера
 * (ТЗ 6, шаг 3), а не подменяется вторым.
 */

/**
 * Доли высоты вьюпорта. Числа заметно ниже ориентиров ТЗ (140–160% и 40–50%)
 * по одной причине: куб всё время повёрнут, и по диагонали его проекция шире
 * номинала примерно в полтора раза. На 115% фигура не помещалась в кадр
 * целиком, на 70% она занимает почти всю высоту и читается вся.
 */
const LOADING_SIZE = 0.55;
const HERO_SIZE = 0.4;
const SHRINK_AT = 85;

function TesseractRig() {
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((state) => state.viewport);
  const size = useRef({ k: LOADING_SIZE });
  const shrunk = useRef(false);
  const progress = useSiteStore((state) => state.loadingProgress);

  const isLoaded = useSiteStore((state) => state.isLoaded);
  const shape = useMemo(() => buildTesseract(), []);

  // Каждая частица — икосаэдр в 80 граней, и на 2200 штук это 176 тысяч
  // треугольников за кадр. На узком экране фигура и так мельче, поэтому
  // частиц берём меньше — плотность строки от этого не страдает.
  const particleCount = useMemo(() => (window.innerWidth < 768 ? 1300 : 2200), []);

  useEffect(() => {
    if (progress < SHRINK_AT || shrunk.current) return;
    shrunk.current = true;
    gsap.to(size.current, { k: HERO_SIZE, duration: 1.1, ease: 'power3.inOut' });
  }, [progress]);

  useFrame(() => {
    const node = group.current;
    if (!node) return;
    // Размер задан долей высоты экрана, поэтому считаем от вьюпорта в мировых
    // единицах — фигура одинаково смотрится на любом соотношении сторон
    node.scale.setScalar((size.current.k * viewport.height) / (shape.extent * 2));
  });

  return (
    <group ref={group}>
      {/* Вращение живёт внутри: оно набирается по мере сборки частиц */}
      <ParticleTesseract
        shape={shape}
        preset={iridescentPresets.tesseract}
        formed={isLoaded}
        count={particleCount}
      />
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
