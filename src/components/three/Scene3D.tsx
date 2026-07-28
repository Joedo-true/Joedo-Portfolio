import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Нормализованное положение курсора (-1…1) без ре-рендеров React */
function usePointerRef() {
  const ref = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return ref;
}

/**
 * Искривлённая проволочная плоскость — сигнатурный объект оформления.
 * Вершины смещаются двумя синусоидами: получается «текучая» сетка,
 * лежащая в перспективе. Смещение считается на CPU по буферу вершин —
 * это дёшево при такой плотности и не требует кастомных шейдеров.
 */
function WarpMesh({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const SEG_X = 48;
  const SEG_Y = 26;

  const geometry = useMemo(() => new THREE.PlaneGeometry(15, 8, SEG_X, SEG_Y), []);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);
  const mesh = useRef<THREE.LineSegments>(null);
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      // Две бегущие волны разной частоты — «ткань» без явного повтора
      const z =
        Math.sin(x * 0.55 + t * 0.5) * 0.5 +
        Math.sin(y * 0.9 - t * 0.35) * 0.32 +
        Math.sin((x + y) * 0.32 + t * 0.22) * 0.28;
      arr[i + 2] = z;
    }
    pos.needsUpdate = true;

    if (group.current) {
      const p = pointer.current;
      // Мягкий доворот к курсору
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -1.02 + p.y * 0.12,
        0.05,
      );
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, p.x * 0.1, 0.05);
    }
  });

  const wireframe = useMemo(() => new THREE.WireframeGeometry(geometry), [geometry]);

  return (
    <group ref={group} rotation={[-1.02, 0, 0]} position={[0, -0.4, 0]}>
      <lineSegments ref={mesh} geometry={wireframe}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.22} />
      </lineSegments>
    </group>
  );
}

/** Парящая грань-осколок: плоский неоновый контур, без свечения */
function Shard({
  position,
  color,
  size = 0.5,
  speed = 1,
}: {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.25 * speed;
    ref.current.rotation.y += delta * 0.32 * speed;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.6 * speed) * 0.22;
  });
  return (
    <mesh ref={ref} position={position}>
      <tetrahedronGeometry args={[size, 0]} />
      <meshBasicMaterial color={color} wireframe />
    </mesh>
  );
}

export default function Scene3D() {
  const pointer = usePointerRef();
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 7.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{
        pointerEvents: 'none',
        // Края растворяются, чтобы сетка не обрезалась рамкой канваса
        WebkitMaskImage:
          'radial-gradient(ellipse 78% 76% at 50% 50%, #000 46%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 78% 76% at 50% 50%, #000 46%, transparent 100%)',
      }}
    >
      <WarpMesh pointer={pointer} />
      <Shard position={[2.6, 1.3, 1]} color="#FF3DAF" size={0.42} />
      <Shard position={[-2.9, 0.9, 0.6]} color="#3B5BFF" size={0.34} speed={1.3} />
      <Shard position={[2.1, -1.5, 1.4]} color="#C6FF3D" size={0.26} speed={0.8} />
    </Canvas>
  );
}
