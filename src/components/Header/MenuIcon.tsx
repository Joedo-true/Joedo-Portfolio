import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import {
  createIridescentMaterial,
  iridescentPresets,
} from '../../three/shaders/iridescentMaterial';
import { useSiteStore, type HeaderIcon } from '../../store/useSiteStore';

/**
 * Кнопка меню: белая сфера на первом экране, тёмная в разделе 2.
 *
 * Цвет меняется не сам по себе, а через удар: сфера плавно расходится на две
 * полусферы, затем схлопывается обратно — быстро, но с плавным разгоном, —
 * и ровно в момент столкновения половин материал подменяется. Поэтому смена
 * цвета выглядит следствием удара, а не переключением палитры.
 *
 * Клик в Части 1 ничего не делает — поведение меню бриф не описывает (ТЗ 11.2).
 */

const RADIUS = 1.1;
/** Насколько расходится каждая половина, мировых единиц */
const GAP = 0.38;

function MenuSphere() {
  const target = useSiteStore((state) => state.headerIcon);
  const [shown, setShown] = useState<HeaderIcon>(target);

  const top = useRef<THREE.Group>(null);
  const bottom = useRef<THREE.Group>(null);

  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  // Полусферы открыты снизу и сверху, поэтому к каждой добавлен диск среза —
  // иначе в разведённом состоянии видно, что шар пустой внутри
  const geometry = useMemo(
    () => ({
      top: new THREE.SphereGeometry(RADIUS, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      bottom: new THREE.SphereGeometry(RADIUS, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      cap: new THREE.CircleGeometry(RADIUS, 40),
    }),
    [],
  );

  const material = useMemo(
    () =>
      createIridescentMaterial(
        shown === 'tesseract' ? iridescentPresets.iconWhite : iridescentPresets.iconDark,
      ),
    [shown],
  );

  useEffect(() => () => material.dispose(), [material]);
  useEffect(
    () => () => {
      geometry.top.dispose();
      geometry.bottom.dispose();
      geometry.cap.dispose();
    },
    [geometry],
  );

  useEffect(() => {
    if (target === shown) return;
    const upper = top.current?.position;
    const lower = bottom.current?.position;
    if (reduced || !upper || !lower) {
      setShown(target);
      return;
    }

    const timeline = gsap.timeline();
    timeline
      // Расходятся не спеша
      .to(upper, { y: GAP, duration: 0.45, ease: 'power2.out' }, 0)
      .to(lower, { y: -GAP, duration: 0.45, ease: 'power2.out' }, 0)
      // Схлопываются вдвое быстрее и с разгоном: вся скорость приходится на
      // конец, поэтому встреча половин читается как удар
      .to(
        upper,
        { y: 0, duration: 0.24, ease: 'power3.in', onComplete: () => setShown(target) },
        0.55,
      )
      .to(lower, { y: 0, duration: 0.24, ease: 'power3.in' }, 0.55)
      // Короткий отскок — без него удар не чувствуется, половины просто
      // останавливаются
      .to(upper, { y: GAP * 0.13, duration: 0.08, ease: 'power2.out' })
      .to(lower, { y: -GAP * 0.13, duration: 0.08, ease: 'power2.out' }, '<')
      .to(upper, { y: 0, duration: 0.18, ease: 'power2.inOut' })
      .to(lower, { y: 0, duration: 0.18, ease: 'power2.inOut' }, '<');

    return () => {
      timeline.kill();
      upper.y = 0;
      lower.y = 0;
    };
  }, [target, shown, reduced]);

  useFrame((state) => {
    material.uniforms.uTime.value = reduced ? 2.4 : state.clock.elapsedTime;
  });

  return (
    <>
      {/* key по материалу обязателен: primitive в R3F не реактивен, и без
          перемонтирования на мешах остался бы прежний материал — половины
          схлопывались бы, не меняя цвета */}
      <group ref={top}>
        <mesh geometry={geometry.top}>
          <primitive key={material.uuid} object={material} attach="material" />
        </mesh>
        {/* Диск среза смотрит вниз — в сторону второй половины */}
        <mesh geometry={geometry.cap} rotation={[Math.PI / 2, 0, 0]}>
          <primitive key={material.uuid} object={material} attach="material" />
        </mesh>
      </group>

      <group ref={bottom}>
        <mesh geometry={geometry.bottom}>
          <primitive key={material.uuid} object={material} attach="material" />
        </mesh>
        <mesh geometry={geometry.cap} rotation={[-Math.PI / 2, 0, 0]}>
          <primitive key={material.uuid} object={material} attach="material" />
        </mesh>
      </group>
    </>
  );
}

export function MenuIcon() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 4.6], fov: 42 }}
      style={{ pointerEvents: 'none' }}
    >
      <MenuSphere />
    </Canvas>
  );
}
