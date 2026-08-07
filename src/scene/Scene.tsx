import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { config } from '../config';
import { buildAtmosphereMaterial } from '../planet/props';
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

// По умолчанию gsap при просадке кадров растягивает анимации, чтобы они не
// «прыгали». Здесь это вредно: фазы переключает обычный таймер, а полосы на
// экране загрузки живут по своим часам — растянутая анимация камеры отстаёт
// от них и не успевает доехать. Пусть время идёт по-настоящему
gsap.ticker.lagSmoothing(0);

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
    const idle = { width: view.idleWidthFraction, height: view.idleMaxHeightFraction };

    if (phase === 'entry') {
      gsap.killTweensOf(target);
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
      gsap.killTweensOf(target);
      gsap.to(target, {
        width: view.zoomWidthFraction,
        height: view.zoomMaxHeightFraction,
        duration: view.zoomDurationMs / 1000,
        ease: 'power2.inOut',
      });
      return;
    }

    if (phase !== 'idle') return;

    if (from === 'zoomed') {
      gsap.killTweensOf(target);
      gsap.to(target, { ...idle, duration: view.zoomDurationMs / 1000, ease: 'power2.inOut' });
      return;
    }

    // Возврат из «остановки». Фазу переключает таймер, а анимацию ведёт
    // gsap — и стартует она только после того, как React отрисует кадр с уже
    // собранной планетой. На небыстрой машине этот кадр занимает столько, что
    // таймер успевает раньше; если просто оборвать анимацию, планета так и
    // застынет недоехавшей. Поэтому здесь не обрыв, а докат до нужного размера
    const short = Math.abs(target.width - idle.width) < idle.width * 0.005;
    if (from === 'entry' && !short) {
      gsap.killTweensOf(target);
      gsap.to(target, { ...idle, duration: 0.45, ease: 'power2.out' });
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

/** Небо и свет читаются из конфига на ходу — их правят чаще всего */
function Atmosphere() {
  const material = useMemo(() => buildAtmosphereMaterial(), []);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.HemisphereLight>(null);
  const gl = useThree((state) => state.gl);
  const background = useRef('');

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    if (background.current !== config.palette.background) {
      background.current = config.palette.background;
      gl.setClearColor(new THREE.Color(config.palette.background), 1);
    }
    if (key.current) key.current.intensity = config.light.keyIntensity;
    if (rim.current) rim.current.intensity = config.light.rimIntensity;
    if (fill.current) fill.current.intensity = config.light.fillIntensity;

    material.uniforms.uStrength.value = config.atmosphere.strength;
    material.uniforms.uPower.value = config.atmosphere.power;
    // Где кончается планета и начинается видимый воздух — зависит от того,
    // насколько оболочка больше самой планеты
    const ratio = Math.min((1 + config.planet.landLift) / config.atmosphere.radius, 0.999);
    material.uniforms.uInner.value = 1 - Math.sqrt(1 - ratio * ratio);
  });

  return (
    <>
      {/*
        Тёплый свет местной звезды рисует терминатор, холодный контровой
        из-за планеты отбивает её край от неба — без него силуэт слипается
        с фоном. Полусферический подсвечивает ночную сторону ровно настолько,
        чтобы там читались плитки, а не чёрный провал.
      */}
      <hemisphereLight
        ref={fill}
        args={[
          new THREE.Color(config.palette.skyLight),
          new THREE.Color(config.palette.groundLight),
          config.light.fillIntensity,
        ]}
      />
      {/*
        Тени бросает только основной свет, и рамка его карты обтягивает
        планету целиком: горы кладут тень на равнину, деревья — на траву.
        Без них плитки читаются наклейками, а не рельефом
      */}
      <directionalLight
        ref={key}
        position={[4.2, 3.2, 8.4]}
        color={0xffe2bd}
        intensity={config.light.keyIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.012}
        shadow-camera-near={5}
        shadow-camera-far={16}
        shadow-camera-left={-1.35}
        shadow-camera-right={1.35}
        shadow-camera-top={1.35}
        shadow-camera-bottom={-1.35}
      />
      <directionalLight
        ref={rim}
        position={[-7, 2, -5]}
        color={new THREE.Color(config.palette.rimLight)}
        intensity={config.light.rimIntensity}
      />

      <mesh material={material} renderOrder={2} raycast={() => null}>
        <sphereGeometry args={[config.atmosphere.radius, 48, 32]} />
      </mesh>
    </>
  );
}

export function Scene() {
  const planet = useAppStore((state) => state.planet);
  const radius = planet?.radius ?? 1;

  return (
    <Canvas
      className="scene"
      flat
      shadows="soft"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: config.camera.fov, near: 0.05, far: 400, position: [0, 0, 12] }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(config.palette.background), 1)}
    >
      <Atmosphere />
      <Starfield />
      {planet && <Planet data={planet} />}
      <CameraRig radius={radius} />
    </Canvas>
  );
}
