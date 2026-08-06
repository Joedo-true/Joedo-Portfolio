import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { config } from '../config';
import type { PlanetData } from '../planet/buildPlanet';
import {
  buildMarket,
  buildObservatory,
  buildReactor,
  orientOnSphere,
} from '../planet/landmarkGeometry';
import { useAppStore } from '../state/useAppStore';
import { useReducedMotion } from '../reducedMotion';

/**
 * Планета: слитая сетка плиток, три постройки на поверхности и вращение.
 *
 * Три вложенные группы, каждая со своей задачей:
 *   pitch — наклон от мыши (только вблизи),
 *   tilt  — постоянный наклон оси, как у Земли,
 *   spin  — собственное вращение и горизонтальная прокрутка мышью.
 *
 * Разделять их нужно именно так: если крутить наклонённую планету «по горизонту
 * экрана», ось поплывёт и планета начнёт кувыркаться.
 */

interface PlanetProps {
  data: PlanetData;
}

export function Planet({ data }: PlanetProps) {
  const gl = useThree((state) => state.gl);
  const phase = useAppStore((state) => state.phase);
  const setPhase = useAppStore((state) => state.setPhase);
  const reduced = useReducedMotion();

  const pitchGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  const tiltGroup = useRef<THREE.Group>(null);

  const rotation = useRef({
    spin: 0,
    pitch: 0,
    spinVelocity: 0,
    pitchVelocity: 0,
    dragging: false,
  });

  const material = useMemo(
    () => new THREE.MeshLambertMaterial({ vertexColors: true }),
    [],
  );

  const landmarks = useMemo(() => {
    const { tiles, terrain, radius } = data;

    /** Радиус плитки — общая единица длины для всех построек */
    const unitAt = (index: number) =>
      tiles[index].corners[0].distanceTo(tiles[index].center);

    const place = (object: THREE.Object3D, index: number) => {
      orientOnSphere(object, tiles[index].center, radius);
      return object;
    };

    const marketTile = terrain.landmarks.market.tile;
    const reactorTile = terrain.landmarks.reactor.tile;
    const observatoryTile = terrain.landmarks.observatory.tile;

    const reactor = buildReactor(unitAt(reactorTile), radius);

    return {
      market: place(buildMarket(unitAt(marketTile), radius), marketTile),
      reactor: place(reactor.group, reactorTile),
      steam: reactor.steam,
      towerHeight: reactor.towerHeight,
      steamRise: unitAt(reactorTile) * 2.4,
      observatory: place(buildObservatory(unitAt(observatoryTile), radius), observatoryTile),
    };
  }, [data]);

  useEffect(() => {
    return () => {
      material.dispose();
      for (const object of [landmarks.market, landmarks.reactor, landmarks.observatory]) {
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const used = Array.isArray(child.material) ? child.material : [child.material];
            for (const item of used) item.dispose();
          }
        });
      }
    };
  }, [material, landmarks]);

  // Вращение мышью. Слушаем канву целиком, а не саму планету: вести
  // указатель за её край — нормально, бросать вращение на полпути — нет.
  useEffect(() => {
    const element = gl.domElement;
    let pointer: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const down = (event: PointerEvent) => {
      if (useAppStore.getState().phase !== 'zoomed') return;
      pointer = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      rotation.current.dragging = true;
      rotation.current.spinVelocity = 0;
      rotation.current.pitchVelocity = 0;
      element.setPointerCapture(event.pointerId);
      element.style.cursor = 'grabbing';
    };

    const move = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      const { dragSensitivity, dragMaxPitch } = config.camera;
      const dx = (event.clientX - lastX) * dragSensitivity;
      const dy = (event.clientY - lastY) * dragSensitivity;
      lastX = event.clientX;
      lastY = event.clientY;

      const state = rotation.current;
      state.spin += dx;
      state.pitch = THREE.MathUtils.clamp(state.pitch + dy, -dragMaxPitch, dragMaxPitch);
      // Инерция подхватывает последний рывок, а не средний за жест
      state.spinVelocity = dx;
      state.pitchVelocity = dy;
    };

    const up = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return;
      pointer = null;
      rotation.current.dragging = false;
      // Захват мог уже слететь сам — например, если указатель ушёл из окна
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
      element.style.cursor = useAppStore.getState().phase === 'zoomed' ? 'grab' : '';
    };

    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    return () => {
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      element.style.cursor = '';
    };
  }, [gl]);

  useEffect(() => {
    gl.domElement.style.cursor = phase === 'zoomed' ? 'grab' : '';
  }, [gl, phase]);

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.05);
    const spin = rotation.current;

    if (phase !== 'zoomed' && !reduced) {
      spin.spin += config.planet.spinSpeed * step;
      // Наклон от мыши плавно сходит на нет при возврате на главный экран
      spin.pitch *= Math.pow(0.06, step);
    } else if (phase === 'zoomed' && !spin.dragging) {
      // Только выбег: пока палец на экране, поворот уже применён в обработчике,
      // и складывать его со скоростью значило бы крутить планету дважды
      const decay = Math.pow(config.camera.dragInertia, step * 60);
      spin.spin += spin.spinVelocity;
      spin.pitch = THREE.MathUtils.clamp(
        spin.pitch + spin.pitchVelocity,
        -config.camera.dragMaxPitch,
        config.camera.dragMaxPitch,
      );
      spin.spinVelocity *= decay;
      spin.pitchVelocity *= decay;
    }

    if (spinGroup.current) spinGroup.current.rotation.y = spin.spin;
    if (pitchGroup.current) pitchGroup.current.rotation.x = spin.pitch;
    if (tiltGroup.current) {
      tiltGroup.current.rotation.z = THREE.MathUtils.degToRad(config.planet.tiltDeg);
    }

    // Пар: клубы поднимаются над градирней, растут и тают. При «меньше
    // движения» время замирает — плюмаж над трубой остаётся, но стоит
    const puffs = landmarks.steam.children;
    const time = reduced ? 1.7 : state.clock.elapsedTime;
    for (let i = 0; i < puffs.length; i++) {
      const life = ((time * 0.32 + i / puffs.length) % 1 + 1) % 1;
      const puff = puffs[i] as THREE.Mesh;
      puff.position.y = landmarks.towerHeight + life * landmarks.steamRise;
      puff.scale.setScalar(0.4 + life * 1.3);
      const puffMaterial = puff.material as THREE.MeshBasicMaterial;
      puffMaterial.opacity = 0.42 * Math.min(1, life * 5) * (1 - life);
    }
  });

  return (
    <group ref={pitchGroup}>
      <group ref={tiltGroup}>
        <group ref={spinGroup}>
          <mesh geometry={data.geometry} material={material} raycast={() => null} />
          <primitive object={landmarks.market} />
          <primitive object={landmarks.reactor} />
          <primitive object={landmarks.observatory} />
        </group>

        {/*
          Мишень для указателя. Луч по сорока тысячам треугольников планеты
          считался бы на каждом движении мыши — гладкая сфера даёт тот же
          результат за одно уравнение. Сетка не прячется через `visible`:
          невидимые объекты и в луч не попадают, поэтому она рисуется, но
          ничего не пишет ни в цвет, ни в глубину.
        */}
        <mesh
          onClick={(event) => {
            event.stopPropagation();
            if (useAppStore.getState().phase === 'idle') setPhase('zoomed');
          }}
          onPointerOver={() => {
            if (useAppStore.getState().phase === 'idle') {
              gl.domElement.style.cursor = 'pointer';
            }
          }}
          onPointerOut={() => {
            if (useAppStore.getState().phase !== 'zoomed') gl.domElement.style.cursor = '';
          }}
        >
          <sphereGeometry args={[data.radius, 32, 24]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
