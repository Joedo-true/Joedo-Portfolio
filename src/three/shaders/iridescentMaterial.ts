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
  uniform float uBaseAlpha;

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
    // Стекло рисуется с двух сторон: у задних граней нормаль смотрит от зрителя,
    // без разворота они гасли бы в чёрный
    if (!gl_FrontFacing) N = -N;
    vec3 V = normalize(vViewDir);
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float fresnel = pow(1.0 - ndv, 2.6);

    // Полосы идут по нормали: при вращении объекта они бегут по поверхности —
    // это и читается как «переливание», а не как покрашенная текстура.
    // Второй, более слабый член по X ломает ощущение горизонтальных полос.
    float t = (N.y * 0.5 + 0.5) * uBandScale
            + (N.x * 0.5 + 0.5) * uBandScale * 0.35
            + fresnel * 0.9
            + uTime * uDrift;

    // Тонкая плёнка: каналы разведены по фазе, поэтому по поверхности идёт
    // радужная волна, а не однородный сдвиг цвета — как на мыльном пузыре
    vec3 base = ramp(t);
    vec3 film = vec3(ramp(t + 0.03).r, ramp(t + 0.07).g, ramp(t + 0.11).b);
    vec3 color = mix(base, film, 0.55);

    color = mix(color, uHighlight, fresnel * 0.6);
    color += uHighlight * pow(1.0 - ndv, 9.0) * 0.45;

    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(luma), color, uSaturation);

    float grain =
      (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453) - 0.5)
      * uGrainAmount;
    color += grain;

    // Стекло: тело почти прозрачно, кромки плотные. uBaseAlpha = 1 возвращает
    // обычный непрозрачный материал.
    float alpha = mix(uBaseAlpha, 1.0, fresnel);

    gl_FragColor = vec4(color, alpha);
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
    uBaseAlpha: 1,
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
  uDrift: number;
  /** Плотность тела: 1 — обычный материал, меньше — полупрозрачное стекло */
  uBaseAlpha: number;
}

const preset = (
  colors: [string, string, string, string],
  highlight: string,
  rest: Pick<
    IridescentPreset,
    'uSaturation' | 'uGrainAmount' | 'uBandScale' | 'uDrift' | 'uBaseAlpha'
  >,
): IridescentPreset => ({
  uColorA: new THREE.Color(colors[0]),
  uColorB: new THREE.Color(colors[1]),
  uColorC: new THREE.Color(colors[2]),
  uColorD: new THREE.Color(colors[3]),
  uHighlight: new THREE.Color(highlight),
  ...rest,
});

/** Применения одного движка — ТЗ 2.3, значения из токенов раздела 3. */
export const iridescentPresets = {
  /** Тессеракт: цветное стекло — тело прозрачное, кромки плотные */
  tesseract: preset(['#2bb89a', '#e14bd1', '#7b5cfa', '#f2a93b'], '#fafaf7', {
    uSaturation: 1,
    uGrainAmount: 0.045,
    uBandScale: 1.7,
    uDrift: 0.13,
    uBaseAlpha: 0.3,
  }),
  /** Кнопка меню на первом экране — белая сфера */
  iconWhite: preset(['#d8d8d6', '#ffffff', '#eaeaea', '#f7f7f6'], '#ffffff', {
    uSaturation: 0.08,
    uGrainAmount: 0.02,
    uBandScale: 1,
    uDrift: 0.03,
    uBaseAlpha: 1,
  }),
  /** Спираль раздела 2 — сине-голубо-зелёная */
  spiral: preset(['#3fd0e0', '#2bb89a', '#3b82f6', '#0e7c86'], '#eafcff', {
    uSaturation: 1,
    uGrainAmount: 0.05,
    uBandScale: 1.35,
    uDrift: 0.06,
    uBaseAlpha: 1,
  }),
  /** Глобус в хедере раздела 2 — монохром, тёмные тона */
  iconDark: preset(['#000000', '#2a2a2a', '#141414', '#232323'], '#3a3a3a', {
    uSaturation: 0.12,
    uGrainAmount: 0.03,
    uBandScale: 1.1,
    uDrift: 0.03,
    uBaseAlpha: 1,
  }),
} satisfies Record<string, IridescentPreset>;

/**
 * Материал с уже применённым пресетом. Пресет ставится синхронно, а не в
 * эффекте: иначе первый кадр успевает отрисоваться палитрой по умолчанию.
 * Прозрачные пресеты получают двусторонний рендер и не пишут в буфер
 * глубины — иначе ближняя труба закрывала бы дальние и стекло не читалось.
 */
export function createIridescentMaterial(preset: IridescentPreset): THREE.ShaderMaterial {
  const material = new IridescentMaterial() as THREE.ShaderMaterial;
  for (const [name, value] of Object.entries(preset)) {
    if (material.uniforms[name]) material.uniforms[name].value = value;
  }

  const isGlass = preset.uBaseAlpha < 1;
  material.transparent = isGlass;
  material.depthWrite = !isGlass;
  material.side = isGlass ? THREE.DoubleSide : THREE.FrontSide;
  return material;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      iridescentMaterial: MaterialNode<THREE.ShaderMaterial, typeof IridescentMaterial>;
    }
  }
}
