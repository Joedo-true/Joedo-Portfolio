import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { IridescentMaterial, type IridescentPreset } from '../shaders/iridescentMaterial';

/**
 * Спираль раздела 2 (ТЗ 2.2 и 8.3).
 *
 * Форма взята у регулировочного винта, но без резьбы: гладкая труба вдоль
 * параметрической кривой x=r·cosθ, y=θ·pitch, z=r·sinθ. Витков больше и
 * фигура вытянутее, чем на референсе.
 *
 * Раз в 6 секунд спираль расходится на верхнюю и нижнюю половины и снова
 * сходится. Вращение вокруг своей оси при этом не останавливается — по брифу
 * замирает только вертикальное положение половин.
 */

/** Отрезок винтовой линии: t от 0 до 1 внутри диапазона [from, to] */
class HelixSegment extends THREE.Curve<THREE.Vector3> {
  constructor(
    private readonly turns: number,
    private readonly radius: number,
    private readonly height: number,
    private readonly from: number,
    private readonly to: number,
  ) {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const u = this.from + (this.to - this.from) * t;
    const angle = u * Math.PI * 2 * this.turns;
    return target.set(
      Math.cos(angle) * this.radius,
      (u - 0.5) * this.height,
      Math.sin(angle) * this.radius,
    );
  }
}

const TURNS = 7;
const RADIUS = 0.55;
/** С запасом на разведённое состояние: половины расходятся ещё на 2×GAP */
const HEIGHT = 3.6;
const TUBE = 0.1;
/** Полный оборот вокруг своей оси, с — предложение ТЗ 8.3 по умолчанию */
const SPIN = 10;
/** Насколько половины расходятся, мировых единиц */
const GAP = 0.5;

export function Spiral({ preset }: { preset: IridescentPreset }) {
  const upper = useRef<THREE.Mesh>(null);
  const lower = useRef<THREE.Mesh>(null);
  const spin = useRef<THREE.Group>(null);

  // Пресет — сразу при создании, чтобы первый кадр не ушёл палитрой по умолчанию
  const material = useMemo(() => {
    const instance = new IridescentMaterial() as THREE.ShaderMaterial;
    for (const [name, value] of Object.entries(preset)) {
      if (instance.uniforms[name]) instance.uniforms[name].value = value;
    }
    return instance;
  }, [preset]);

  const geometries = useMemo(
    () => ({
      lower: new THREE.TubeGeometry(
        new HelixSegment(TURNS, RADIUS, HEIGHT, 0, 0.5),
        220,
        TUBE,
        16,
        false,
      ),
      upper: new THREE.TubeGeometry(
        new HelixSegment(TURNS, RADIUS, HEIGHT, 0.5, 1),
        220,
        TUBE,
        16,
        false,
      ),
    }),
    [],
  );

  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(
    () => () => {
      material.dispose();
      geometries.upper.dispose();
      geometries.lower.dispose();
    },
    [material, geometries],
  );

  // Цикл разделения. Таймлайн длится 3.5с, дальше пауза 2.5с — вместе ровно
  // 6с между стартами, как в таблице ТЗ 8.3.
  useEffect(() => {
    if (reduced || !upper.current || !lower.current) return;
    const top = upper.current.position;
    const bottom = lower.current.position;

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });
    timeline
      .to(top, { y: GAP, duration: 1.5, ease: 'power2.out' }, 0)
      .to(bottom, { y: -GAP, duration: 1.5, ease: 'power2.out' }, 0)
      // 1.5–2.0с — пауза в разведённом состоянии
      .to(top, { y: 0, duration: 1.5, ease: 'power2.in' }, 2)
      .to(bottom, { y: 0, duration: 1.5, ease: 'power2.in' }, 2);

    return () => {
      timeline.kill();
      top.y = 0;
      bottom.y = 0;
    };
  }, [reduced]);

  useFrame((state) => {
    material.uniforms.uTime.value = reduced ? 2.4 : state.clock.elapsedTime;
    if (reduced || !spin.current) return;
    // Только вокруг своей длинной оси и только в одну сторону
    spin.current.rotation.y = state.clock.elapsedTime * ((Math.PI * 2) / SPIN);
  });

  return (
    <group ref={spin}>
      <mesh ref={upper} geometry={geometries.upper} frustumCulled={false}>
        <primitive object={material} attach="material" />
      </mesh>
      <mesh ref={lower} geometry={geometries.lower} frustumCulled={false}>
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}
