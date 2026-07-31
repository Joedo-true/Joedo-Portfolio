import { useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  IridescentMaterial,
  iridescentPresets,
  type IridescentPreset,
} from '../three/shaders/iridescentMaterial';
import { PixelReveal } from '../components/PixelReveal/PixelReveal';

/**
 * Песочница Фазы 0 (ТЗ 5) — открывается по `?debug=1`.
 *
 * Здесь проверяются два самых рискованных куска проекта до того, как на них
 * встанет хореография: шейдерный «движок» во всех четырёх раскрасках и
 * пиксельное проявление текста.
 */

const presetNames = ['tesseract', 'iconWhite', 'spiral', 'iconDark'] as const;
type PresetName = (typeof presetNames)[number];

const presetLabels: Record<PresetName, string> = {
  tesseract: 'Тессеракт — цветной',
  iconWhite: 'Кнопка меню — белая сфера',
  spiral: 'Спираль — сине-зелёная',
  iconDark: 'Глобус — монохром тёмный',
};

/** Шейдер на примитиве: ТЗ 5, пункт 3 */
function ShaderTorus({ preset }: { preset: IridescentPreset }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.45;
      mesh.current.rotation.x += delta * 0.17;
    }
  });

  return (
    <mesh ref={mesh}>
      <torusGeometry args={[1, 0.36, 64, 160]} />
      <iridescentMaterial ref={material} key={IridescentMaterial.key} {...preset} />
    </mesh>
  );
}

const panel: React.CSSProperties = {
  border: '1px solid rgba(245,245,242,0.14)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  minWidth: 0,
};

const label: React.CSSProperties = {
  fontSize: 'var(--font-nav-size)',
  letterSpacing: 'var(--font-nav-tracking)',
  fontWeight: 500,
  opacity: 0.55,
};

const button = (active: boolean): React.CSSProperties => ({
  font: 'inherit',
  fontSize: 13,
  padding: '7px 12px',
  cursor: 'pointer',
  color: 'var(--text-on-dark)',
  background: active ? 'rgba(245,245,242,0.14)' : 'transparent',
  border: '1px solid rgba(245,245,242,0.22)',
});

export function Sandbox() {
  const [presetName, setPresetName] = useState<PresetName>('tesseract');
  const [revealKey, setRevealKey] = useState(0);
  const [maxPixelSize, setMaxPixelSize] = useState(26);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-dark)',
        color: 'var(--text-on-dark)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 400,
        padding: 'clamp(16px, 3vw, 40px)',
      }}
    >
      {/* Кегль демо-заголовка задаём здесь: PixelReveal снимает стили с DOM-узла,
          поэтому мозаика автоматически повторит любой размер и выравнивание */}
      <style>{`
        .pixel-reveal-demo {
          font-size: clamp(28px, 3.4vw, 46px);
          line-height: 1.08;
          font-weight: 500;
          margin: 0;
        }
      `}</style>
      <p style={{ ...label, marginBottom: 24 }}>Фаза 0 — песочница фундамента</p>

      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'start',
        }}
      >
        {/* (а) Шейдер на примитиве, цветной и монохромный */}
        <div style={panel}>
          <p style={label}>(а) iridescentMaterial на торе</p>
          <div style={{ height: 300, background: 'var(--bg-dark)' }}>
            <Canvas dpr={[1, 2]} gl={{ antialias: true }} camera={{ position: [0, 0, 4], fov: 40 }}>
              <ShaderTorus preset={iridescentPresets[presetName]} />
            </Canvas>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {presetNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setPresetName(name)}
                style={button(name === presetName)}
              >
                {presetLabels[name]}
              </button>
            ))}
          </div>
        </div>

        {/* (б) Пиксельное проявление текста */}
        <div style={panel}>
          <p style={label}>(б) PixelReveal на тексте</p>
          <div style={{ minHeight: 300, display: 'flex', alignItems: 'center' }}>
            <PixelReveal
              key={revealKey}
              text={'[ОСНОВНОЙ ЗАГОЛОВОК]\nпроявляется из шума'}
              as="h2"
              maxPixelSize={maxPixelSize}
              duration={1.1}
              className="pixel-reveal-demo"
            />
          </div>
          <label style={{ ...label, display: 'flex', alignItems: 'center', gap: 10 }}>
            блок {maxPixelSize}px
            <input
              type="range"
              min={6}
              max={64}
              value={maxPixelSize}
              onChange={(event) => setMaxPixelSize(Number(event.target.value))}
              style={{ flex: 1 }}
            />
          </label>
          <button type="button" onClick={() => setRevealKey((k) => k + 1)} style={button(false)}>
            Проиграть заново
          </button>
        </div>

      </div>
    </div>
  );
}
