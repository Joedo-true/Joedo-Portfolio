import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { config } from '../config';
import { seededRandom } from '../planet/noise';

/**
 * Звёзды за планетой: неподвижные точки на большой сфере.
 *
 * Точки, а не спрайты: звезда должна оставаться одного размера независимо от
 * того, насколько камера подъехала к планете — иначе при приближении небо
 * поедет вместе с планетой и разрушит ощущение расстояния. Поэтому размер
 * задаётся прямо в пикселях, без перспективного уменьшения.
 *
 * Яркость и размер у каждой звезды свои — ровное поле одинаковых точек читается
 * как шум, а не как небо. Раскладка детерминированная: небо всегда одно и то же.
 */

const vertexShader = /* glsl */ `
  attribute float size;
  attribute float shade;
  uniform float uDpr;
  varying float vShade;

  void main() {
    vShade = shade;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uDpr;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uBrightness;
  varying float vShade;

  void main() {
    // Круглая звезда с мягким краем: квадратные точки на чёрном сразу видно
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.16, d);
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(uColor, alpha * vShade * uBrightness);
    #include <colorspace_fragment>
  }
`;

export function Starfield() {
  const dpr = useThree((state) => state.viewport.dpr);
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const { count, radius, sizeMin, sizeMax } = config.stars;
    const random = seededRandom(0x5ee7);

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const shades = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Равномерно по сфере: широта берётся через косинус, иначе звёзды
      // скучиваются у полюсов
      const z = random() * 2 - 1;
      const ring = Math.sqrt(1 - z * z);
      const angle = random() * Math.PI * 2;

      positions[i * 3] = Math.cos(angle) * ring * radius;
      positions[i * 3 + 1] = Math.sin(angle) * ring * radius;
      positions[i * 3 + 2] = z * radius;

      // Мелких звёзд должно быть заметно больше крупных
      const magnitude = Math.pow(random(), 2.2);
      sizes[i] = sizeMin + (sizeMax - sizeMin) * magnitude;
      shades[i] = 0.5 + 0.5 * magnitude;
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    result.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    result.setAttribute('shade', new THREE.BufferAttribute(shades, 1));
    return result;
  }, []);

  const uniforms = useMemo(
    () => ({
      uDpr: { value: dpr },
      uColor: { value: new THREE.Color(config.palette.star) },
      uBrightness: { value: config.stars.brightness },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Цвет и яркость правятся на ходу, раскладка — нет: она в атрибутах
  const appliedColor = useRef(config.palette.star);
  useFrame(() => {
    if (!material.current) return;
    const values = material.current.uniforms;
    values.uDpr.value = dpr;
    values.uBrightness.value = config.stars.brightness;
    if (appliedColor.current !== config.palette.star) {
      appliedColor.current = config.palette.star;
      (values.uColor.value as THREE.Color).set(config.palette.star);
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
