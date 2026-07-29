import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend, type MaterialNode } from '@react-three/fiber';

/**
 * Один шейдерный «движок» на весь проект (ТЗ 2.3).
 *
 * Тессеракт, его монохромная иконка в хедере, спираль и глобус — это не четыре
 * материала, а один с разными uniform-ами: палитра задаётся uColorA..D,
 * «цветность» — uSaturation (1.0 — полная, ~0.1 — монохром; ноль не берём,
 * иначе пропадает объём, который даёт френель).
 *
 * Готовые наборы — в `iridescentPresets` ниже.
 */

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    mat4 modelView = modelViewMatrix;
    vec3 objectNormal = normal;

    #ifdef USE_INSTANCING
      // Рёбра тессеракта — один InstancedMesh с разной длиной труб, то есть с
      // неравномерным масштабом. Обратно-транспонированная матрица не даёт
      // нормалям «поехать» на растянутых рёбрах.
      modelView = modelViewMatrix * instanceMatrix;
      objectNormal = transpose(inverse(mat3(instanceMatrix))) * objectNormal;
    #endif

    vec4 mvPosition = modelView * vec4(position, 1.0);
    vNormal = normalize(transpose(inverse(mat3(modelView))) * objectNormal);
    vViewDir = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  uniform vec3  uColorD;
  uniform vec3  uHighlight;
  uniform float uGrainAmount;
  uniform float uSaturation;
  uniform float uBandScale;
  uniform float uDrift;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  // Развёртка палитры замкнута в кольцо (D → A), иначе на полосах виден стык.
  // «Почти белый» из брифа даёт не эта развёртка, а подмешивание uHighlight
  // по френелю ниже — так светлеют именно кромки, как на глянцевом хроме.
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
    float fresnel = pow(1.0 - ndv, 2.4);

    // Полосы идут по нормали: при вращении объекта они бегут по поверхности —
    // это и читается как «переливание», а не как покрашенная текстура.
    float t = (N.y * 0.5 + 0.5) * uBandScale + fresnel * 0.7 + uTime * uDrift;
    vec3 color = ramp(t);

    color = mix(color, uHighlight, fresnel * 0.6);
    color += uHighlight * pow(1.0 - ndv, 8.0) * 0.35;

    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, uSaturation);

    float grain =
      (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453) - 0.5)
      * uGrainAmount;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const IridescentMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorA: new THREE.Color('#2bb89a'),
    uColorB: new THREE.Color('#e14bd1'),
    uColorC: new THREE.Color('#7b5cfa'),
    uColorD: new THREE.Color('#f2a93b'),
    uHighlight: new THREE.Color('#fafaf7'),
    uGrainAmount: 0.055,
    uSaturation: 1,
    uBandScale: 1.6,
    uDrift: 0.05,
  },
  vertexShader,
  fragmentShader,
);

extend({ IridescentMaterial });

export interface IridescentPreset {
  uColorA: THREE.Color;
  uColorB: THREE.Color;
  uColorC: THREE.Color;
  uColorD: THREE.Color;
  uHighlight: THREE.Color;
  uSaturation: number;
  uGrainAmount: number;
  uBandScale: number;
}

const preset = (
  colors: [string, string, string, string],
  highlight: string,
  uSaturation: number,
  uGrainAmount: number,
  uBandScale: number,
): IridescentPreset => ({
  uColorA: new THREE.Color(colors[0]),
  uColorB: new THREE.Color(colors[1]),
  uColorC: new THREE.Color(colors[2]),
  uColorD: new THREE.Color(colors[3]),
  uHighlight: new THREE.Color(highlight),
  uSaturation,
  uGrainAmount,
  uBandScale,
});

/** Четыре применения одного движка — ТЗ 2.3, значения из токенов раздела 3. */
export const iridescentPresets = {
  /** Тессеракт на загрузке и в разделе 1 — полная цветная палитра */
  tesseract: preset(['#2bb89a', '#e14bd1', '#7b5cfa', '#f2a93b'], '#fafaf7', 1, 0.055, 1.6),
  /** Иконка-тессеракт в хедере раздела 1 — монохром, светлые тона */
  iconLight: preset(['#d8d8d6', '#ffffff', '#e6e6e4', '#f2f2f0'], '#ffffff', 0.12, 0.03, 1.1),
  /** Спираль раздела 2 — сине-голубо-зелёная */
  spiral: preset(['#3fd0e0', '#2bb89a', '#3b82f6', '#0e7c86'], '#eafcff', 1, 0.05, 1.35),
  /** Глобус в хедере раздела 2 — монохром, тёмные тона */
  iconDark: preset(['#000000', '#2a2a2a', '#141414', '#232323'], '#3a3a3a', 0.12, 0.03, 1.1),
} satisfies Record<string, IridescentPreset>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      iridescentMaterial: MaterialNode<THREE.ShaderMaterial, typeof IridescentMaterial>;
    }
  }
}
