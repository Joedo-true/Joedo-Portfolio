import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { config } from '../config';
import { useAppStore } from '../state/useAppStore';
import { useReducedMotion } from '../reducedMotion';
import { Starfield } from './Starfield';
import { Planet } from './Planet';

/**
 * Камера всё время смотрит в центр и двигается только по одной оси —
 * расстоянию. Целятся не в расстояние, а в долю экрана, которую должна занять
 * планета: тогда при смене размера окна кадр пересчитывается сам, а анимации
 * можно вести прямо по «занимаемой ширине».
 */

interface Framing {
  /** Доля ширины окна под диаметр планеты */
  width: number;
  /** Потолок по высоте — планета не станет выше этой доли окна */
  height: number;
}

function distanceFor(radius: number, framing: Framing, aspect: number) {
  const tanY = Math.tan((config.camera.fov * Math.PI) / 360);
  const tanX = tanY * aspect;
  // Силуэт шара — конус с половинным углом asin(R/d); на картинке он занимает
  // tan(угла) от полуэкрана, отсюда и обратный ход к расстоянию
  const byWidth = radius / Math.sin(Math.atan(framing.width * tanX));
  const byHeight = radius / Math.sin(Math.atan(framing.height * tanY));
  return Math.max(byWidth, byHeight);
}

function CameraRig({ radius }: { radius: number }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const phase = useAppStore((state) => state.phase);
  const reduced = useReducedMotion();

  const framing = useRef<Framing>({
    width: config.camera.idleWidthFraction / config.entry.approachFrom,
    height: config.camera.idleMaxHeightFraction / config.entry.approachFrom,
  });
  const previous = useRef(phase);

  useEffect(() => {
    const from = previous.current;
    previous.current = phase;

    const target = framing.current;
    const { camera: view, entry } = config;
    gsap.killTweensOf(target);

    if (phase === 'entry') {
      const idle = { width: view.idleWidthFraction, height: view.idleMaxHeightFraction };
      target.width = idle.width / entry.approachFrom;
      target.height = idle.height / entry.approachFrom;

      const duration = entry.durationMs / 1000;
      if (reduced) {
        gsap.to(target, { ...idle, duration, ease: 'power2.out' });
      } else {
        // Резкая остановка: планета быстро подходит, проскакивает свой размер
        // и оседает назад — так тормозит масса. Ease не круче третьей степени:
        // на expo вся дистанция съедалась за сотню миллисекунд, и торможение
        // просто не успевало прочитаться — планета возникала уже стоящей
        gsap
          .timeline()
          .to(target, {
            width: idle.width * entry.overshoot,
            height: idle.height * entry.overshoot,
            duration: duration * 0.6,
            ease: 'power3.out',
          })
          .to(target, { ...idle, duration: duration * 0.4, ease: 'power1.inOut' });
      }
      return;
    }

    if (phase === 'zoomed') {
      gsap.to(target, {
        width: view.zoomWidthFraction,
        height: view.zoomMaxHeightFraction,
        duration: view.zoomDurationMs / 1000,
        ease: 'power2.inOut',
      });
      return;
    }

    if (phase === 'idle' && from === 'zoomed') {
      gsap.to(target, {
        width: view.idleWidthFraction,
        height: view.idleMaxHeightFraction,
        duration: view.zoomDurationMs / 1000,
        ease: 'power2.inOut',
      });
    }
  }, [phase, reduced]);

  useFrame(() => {
    if (camera.fov !== config.camera.fov) {
      camera.fov = config.camera.fov;
      camera.updateProjectionMatrix();
    }
    camera.position.set(0, 0, distanceFor(radius, framing.current, size.width / size.height));
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function Scene() {
  const planet = useAppStore((state) => state.planet);
  const radius = planet?.radius ?? 1;

  return (
    <Canvas
      className="scene"
      flat
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: config.camera.fov, near: 0.05, far: 400, position: [0, 0, 12] }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 1)}
    >
      {/*
        Один направленный источник — свет местной звезды, он и рисует
        терминатор на левом краю. Полусферический подсвечивает ночную сторону
        ровно настолько, чтобы там читались плитки, а не чёрный провал.
      */}
      <hemisphereLight args={[0x8fa6c4, 0x1a1f27, 0.55]} />
      <directionalLight position={[6, 4, 8]} intensity={1.75} />

      <Starfield />
      {planet && <Planet data={planet} />}
      <CameraRig radius={radius} />
    </Canvas>
  );
}
