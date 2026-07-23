import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/** Глобальное нормализованное положение курсора (-1…1), без ре-рендеров React */
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

function AccentSolid({
  position,
  color,
  geo,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  geo: 'octa' | 'tetra' | 'torus' | 'box';
  scale?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.4;
    mesh.current.rotation.y += delta * 0.55;
  });
  return (
    <Float speed={2.2} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh ref={mesh} position={position} scale={scale}>
        {geo === 'octa' && <octahedronGeometry args={[0.5, 0]} />}
        {geo === 'tetra' && <tetrahedronGeometry args={[0.55, 0]} />}
        {geo === 'torus' && <torusGeometry args={[0.42, 0.16, 16, 40]} />}
        {geo === 'box' && <boxGeometry args={[0.6, 0.6, 0.6]} />}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          metalness={0.35}
          roughness={0.25}
          flatShading
        />
      </mesh>
    </Float>
  );
}

function Crystal({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const cage = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const p = pointer.current;
    if (group.current) {
      // Мягко доворачиваем сцену к курсору
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, p.x * 0.5, 0.045);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -p.y * 0.35, 0.045);
    }
    if (core.current) {
      core.current.rotation.y += delta * 0.12;
      core.current.rotation.z += delta * 0.05;
    }
    if (cage.current) {
      cage.current.rotation.y -= delta * 0.08;
      cage.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <group ref={group}>
      {/* Светящееся «ядро» — морфящийся икосаэдр */}
      <mesh ref={core}>
        <icosahedronGeometry args={[1.55, 20]} />
        <MeshDistortMaterial
          color="#6D5AE6"
          emissive="#3B1D8F"
          emissiveIntensity={0.55}
          roughness={0.22}
          metalness={0.28}
          distort={0.34}
          speed={1.5}
        />
      </mesh>

      {/* Каркас-«клетка» — техно-оболочка */}
      <mesh ref={cage} scale={1.001}>
        <icosahedronGeometry args={[2.35, 1]} />
        <meshBasicMaterial color="#8B5CF6" wireframe transparent opacity={0.22} />
      </mesh>

      {/* Плавающие акцентные фигуры */}
      <AccentSolid position={[2.9, 1.3, -1]} color="#22D3EE" geo="octa" />
      <AccentSolid position={[-3.1, -1.1, -0.5]} color="#D946EF" geo="tetra" scale={1.1} />
      <AccentSolid position={[2.4, -1.9, 0.5]} color="#8B5CF6" geo="torus" scale={0.9} />
      <AccentSolid position={[-2.6, 1.9, -1.5]} color="#6366F1" geo="box" scale={0.7} />
    </group>
  );
}

export default function Scene3D() {
  const pointer = usePointerRef();
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 6, 5]} intensity={1.1} />
      <pointLight position={[-7, -3, -3]} color="#D946EF" intensity={2.6} decay={0} />
      <pointLight position={[7, 4, 2]} color="#22D3EE" intensity={2.1} decay={0} />
      <pointLight position={[0, 0, 4]} color="#8B5CF6" intensity={1.2} decay={0} />
      <Crystal pointer={pointer} />
    </Canvas>
  );
}
