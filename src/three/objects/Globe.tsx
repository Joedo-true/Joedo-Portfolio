import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { IridescentMaterial, type IridescentPreset } from '../shaders/iridescentMaterial';

/**
 * Глобус — форма кнопки меню в разделе 2 (ТЗ 8.5). Сфера на том же
 * шейдерном движке, что и тессеракт, только в монохром-тёмной раскраске:
 * фон под ней уже светлый.
 *
 * Вращение бриф не описывает (ТЗ 11.3) — оставлена статичной, как и
 * иконка-тессеракт, чтобы две формы одной кнопки вели себя одинаково.
 */
export function Globe({
  preset,
  /** Подобран так, чтобы глобус занимал в кнопке столько же, сколько тессеракт */
  radius = 1.1,
}: {
  preset: IridescentPreset;
  radius?: number;
}) {
  // Пресет применяем при создании материала, а не в эффекте: иначе первый
  // кадр успевает отрисоваться палитрой по умолчанию — на мобильном глобус
  // мигал радужным вместо монохром-тёмного.
  const material = useMemo(() => {
    const instance = new IridescentMaterial() as THREE.ShaderMaterial;
    for (const [name, value] of Object.entries(preset)) {
      if (instance.uniforms[name]) instance.uniforms[name].value = value;
    }
    return instance;
  }, [preset]);

  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    material.uniforms.uTime.value = reduced ? 2.4 : state.clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[radius, 48, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
