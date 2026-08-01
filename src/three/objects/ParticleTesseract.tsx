import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { sampleEdgePoints, type TesseractShape } from './tesseractShape';
import type { IridescentPreset } from '../shaders/iridescentMaterial';

/**
 * Тессеракт, собранный из отдельных частиц.
 *
 * Одни и те же шарики проходят через две фазы и никуда не деваются:
 *   uForm = 0 — крутятся в вихре-воронке;
 *   uForm = 1 — стоят на рёбрах тессеракта и вращаются вместе с фигурой.
 *
 * Обе позиции считаются в вершинном шейдере, а не на CPU: две тысячи
 * инстансов пришлось бы каждый кадр переписывать матрицами, и это бы съело
 * весь бюджет кадра. instanceMatrix при этом не используется вовсе — вместо
 * него у каждой частицы свои инстансные атрибуты.
 */

const vertexShader = /* glsl */ `
  attribute vec3 aTarget;
  // Место частицы в облаке-сфере: обычная точка, а не полярные координаты
  attribute vec3 aVortex;
  attribute float aSeed;
  attribute float aDelay;

  uniform float uTime;
  uniform float uForm;
  uniform float uScale;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vSeed;

  void main() {
    // Облако крутится вокруг Y, но слои идут с разной скоростью: у оси быстрее,
    // по краю медленнее — иначе сфера вращалась бы как твёрдый шар
    float axisDist = length(aVortex.xz);
    float angle = uTime * (0.3 + 0.75 / (axisDist + 0.7));
    float c = cos(angle);
    float s = sin(angle);
    vec3 vortexPos = vec3(
      aVortex.x * c - aVortex.z * s,
      aVortex.y,
      aVortex.x * s + aVortex.z * c
    );

    // Турбулентность: три несоизмеримые частоты, у каждой частицы свои фазы.
    // Она добавляется до сборки, поэтому в собранной фигуре её уже нет.
    vec3 turbulence = vec3(
      sin(uTime * 0.90 + aSeed * 53.0 + aVortex.y * 3.1),
      sin(uTime * 0.73 + aSeed * 37.0 + aVortex.x * 2.7),
      sin(uTime * 1.13 + aSeed * 29.0 + aVortex.z * 3.7)
    );
    vortexPos += turbulence * 0.19;

    // Сборка с разбегом: частицы прилетают не одновременно, поэтому фигура
    // проступает, а не возникает целиком
    float k = clamp((uForm - aDelay) / max(1.0 - aDelay, 0.001), 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);

    vec3 center = mix(vortexPos, aTarget, k);

    // Микродрожание остаётся и в собранном виде, иначе фигура выглядит мёртвой
    center += vec3(
      sin(uTime * 1.7 + aSeed * 31.0),
      cos(uTime * 1.3 + aSeed * 21.0),
      sin(uTime * 1.1 + aSeed * 17.0)
    ) * 0.005;

    vec3 local = position * uScale + center;
    vec4 mvPosition = modelViewMatrix * vec4(local, 1.0);

    vNormal = normalize(normalMatrix * normal);
    vViewDir = -mvPosition.xyz;
    vSeed = aSeed;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorD;
  uniform vec3 uHighlight;
  uniform float uTime;
  uniform float uSaturation;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vSeed;

  // Та же замкнутая в кольцо развёртка, что у основного движка
  vec3 ramp(float t) {
    float s = fract(t) * 4.0;
    if (s < 1.0) return mix(uColorA, uColorB, s);
    if (s < 2.0) return mix(uColorB, uColorC, s - 1.0);
    if (s < 3.0) return mix(uColorC, uColorD, s - 2.0);
    return mix(uColorD, uColorA, s - 3.0);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 2.2);

    // Оттенок закреплён за частицей: по облаку идёт градиент, а не один цвет
    float t = vSeed * 1.7 + (N.y * 0.5 + 0.5) * 0.35 + uTime * 0.07;
    vec3 color = ramp(t);

    color = mix(color, uHighlight, fresnel * 0.5);
    color += uHighlight * pow(1.0 - ndv, 8.0) * 0.35;

    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, uSaturation);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

/** Полный оборот собранной фигуры, с (ТЗ 6, шаг 5) */
const SPIN_Z = 14;
const SPIN_Y = 30;

/** Радиус облака до сборки, в мировых единицах (половина тессеракта — 1) */
const CLOUD_RADIUS = 1.3;

export function ParticleTesseract({
  shape,
  preset,
  formed,
  count = 11000,
  particleRadius = 0.0045,
}: {
  shape: TesseractShape;
  preset: IridescentPreset;
  /** true — частицы собираются в тессеракт */
  formed: boolean;
  count?: number;
  particleRadius?: number;
}) {
  const spin = useRef<THREE.Group>(null);
  const form = useRef({ value: 0 });

  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const geometry = useMemo(() => {
    const points = sampleEdgePoints(shape, count);
    const total = points.length;

    const targets = new Float32Array(total * 3);
    const vortex = new Float32Array(total * 3);
    const seeds = new Float32Array(total);
    const delays = new Float32Array(total);

    for (let i = 0; i < total; i++) {
      targets[i * 3] = points[i].x;
      targets[i * 3 + 1] = points[i].y;
      targets[i * 3 + 2] = points[i].z;

      // Облако-сфера. Направление берём равномерно по сфере: если просто
      // раскидать углы, частицы скучиваются у полюсов. Радиус смещён к
      // оболочке — сплошной шар выглядел бы комком, а не облаком.
      const cosTheta = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const ring = Math.sqrt(1 - cosTheta * cosTheta);
      const radius = CLOUD_RADIUS * (0.4 + 0.6 * Math.cbrt(Math.random()));
      vortex[i * 3] = ring * Math.cos(phi) * radius;
      vortex[i * 3 + 1] = cosTheta * radius;
      vortex[i * 3 + 2] = ring * Math.sin(phi) * radius;

      seeds[i] = Math.random();
      delays[i] = Math.random() * 0.45;
    }

    // Радиус 1: реальный размер задаётся uScale в шейдере.
    // Детализация 0 — 20 граней: на трёх пикселях экрана она неотличима от
    // гладкой сферы, а частиц теперь тысячи, и каждая грань на счету.
    const buffer = new THREE.IcosahedronGeometry(1, 0);
    buffer.setAttribute('aTarget', new THREE.InstancedBufferAttribute(targets, 3));
    buffer.setAttribute('aVortex', new THREE.InstancedBufferAttribute(vortex, 3));
    buffer.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
    buffer.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delays, 1));
    return { buffer, total };
  }, [shape, count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uForm: { value: 0 },
          uScale: { value: particleRadius },
          uColorA: { value: preset.uColorA },
          uColorB: { value: preset.uColorB },
          uColorC: { value: preset.uColorC },
          uColorD: { value: preset.uColorD },
          uHighlight: { value: preset.uHighlight },
          uSaturation: { value: preset.uSaturation },
        },
      }),
    [preset, particleRadius],
  );

  useEffect(
    () => () => {
      material.dispose();
      geometry.buffer.dispose();
    },
    [material, geometry],
  );

  // Сборка запускается один раз, когда загрузка закончилась
  useEffect(() => {
    if (reduced) {
      // Без анимации фигура должна быть сразу собрана, а не крутиться вихрем
      form.current.value = 1;
      return;
    }
    if (!formed) return;
    const tween = gsap.to(form.current, { value: 1, duration: 2, ease: 'power2.inOut' });
    return () => {
      tween.kill();
    };
  }, [formed, reduced]);

  useFrame((state, delta) => {
    const time = reduced ? 2.4 : state.clock.elapsedTime;
    material.uniforms.uTime.value = time;
    material.uniforms.uForm.value = form.current.value;

    if (reduced || !spin.current) return;
    // Вращение фигуры набирается по мере сборки: пока частицы в вихре, крутит
    // сам вихрь, и вторая карусель поверх него читалась бы кашей
    const ramp = form.current.value;
    spin.current.rotation.z -= delta * ((Math.PI * 2) / SPIN_Z) * ramp;
    spin.current.rotation.y += delta * ((Math.PI * 2) / SPIN_Y) * ramp;
  });

  return (
    <group ref={spin}>
      <instancedMesh
        args={[geometry.buffer, material, geometry.total]}
        frustumCulled={false}
      />
    </group>
  );
}
