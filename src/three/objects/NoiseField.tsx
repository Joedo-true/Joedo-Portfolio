import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Облако частиц внутри тессеракта — тот же язык «шума», что у пиксельного
 * проявления текста, только объёмный.
 *
 * Мерцание не плавное: яркость каждой частицы пересчитывается ступенями по
 * 12 раз в секунду, поэтому облако именно рябит, а не дышит. Частицы ещё и
 * дрожат вокруг своих мест — без этого при неподвижной камере облако
 * выглядело бы приклеенным к стеклу.
 *
 * Складывающее смешивание и отключённая запись глубины: точки должны
 * светиться сквозь трубы, а не спорить с ними за глубину.
 */

const vertexShader = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uDpr;
  uniform float uJitter;
  varying float vFlicker;

  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.6 + aSeed * 43.0) * uJitter;
    p.y += cos(uTime * 0.5 + aSeed * 31.0) * uJitter;
    p.z += sin(uTime * 0.7 + aSeed * 17.0) * uJitter;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);

    // Ступенчатое время: 12 значений в секунду вместо непрерывного —
    // именно это читается как шум, а не как пульсация
    float step = floor(uTime * 12.0) * 0.37;
    vFlicker = pow(fract(sin(aSeed * 91.7 + step) * 43758.5453), 2.0);

    // Размер задан прямо в CSS-пикселях: точки должны остаться пылинками,
    // как бы ни масштабировалась сама фигура. 5.0 — опорное расстояние до
    // камеры, ближние частицы чуть крупнее дальних.
    gl_PointSize = uSize * uDpr * (5.0 / max(-mvPosition.z, 0.001));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFlicker;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    float dist = dot(offset, offset);
    if (dist > 0.25) discard;
    float alpha = smoothstep(0.25, 0.0, dist) * vFlicker * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function NoiseField({
  count = 2300,
  /** Половина стороны куба, в котором рассыпаны частицы */
  extent = 0.9,
  /** Диаметр частицы в CSS-пикселях */
  size = 2.6,
  opacity = 0.8,
  color = '#ffffff',
}: {
  count?: number;
  extent?: number;
  size?: number;
  opacity?: number;
  color?: string;
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((state) => state.viewport.dpr);

  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() * 2 - 1) * extent;
      positions[i * 3 + 1] = (Math.random() * 2 - 1) * extent;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * extent;
      seeds[i] = Math.random();
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return buffer;
  }, [count, extent]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uDpr: { value: dpr },
      uJitter: { value: 0.014 },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
    }),
    // dpr намеренно вне зависимостей: он обновляется в кадре, пересоздавать
    // из-за него весь набор uniform-ов незачем
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size, opacity, color],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = reduced ? 2.4 : state.clock.elapsedTime;
    material.current.uniforms.uDpr.value = state.viewport.dpr;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
}
