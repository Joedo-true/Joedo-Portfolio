import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { CubicBezierLine, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { FileNode } from '../../data/fileTree';

// Палитра — в тон сайту (плоский неон на near-black)
const C = {
  soma: '#E8E8EC',
  somaEmissive: '#2A2A30',
  folder: '#FFFFFF',
  file: '#9A9AA4',
  line: '#FFFFFF',
  back: '#FFFFFF',
};

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Равномерное распределение точек по сфере (спираль Фибоначчи) */
function fibDir(i: number, n: number) {
  const y = 1 - (2 * (i + 0.5)) / Math.max(1, n);
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
  return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
}

const labelStyle = { textShadow: '0 1px 6px rgba(0,0,0,0.9)' } as const;

function Dendrite({ end, delay }: { end: THREE.Vector3; delay: number }) {
  // Плавная дуга (кубический Безье): линия мягко изгибается вбок,
  // отходит от сомы и так же плавно приходит к узлу.
  const { c1, c2, curve } = useMemo(() => {
    const perp = new THREE.Vector3(-end.z, end.x, end.y).normalize().multiplyScalar(end.length() * 0.3);
    const a = end.clone().multiplyScalar(0.3).add(perp);
    const b = end.clone().multiplyScalar(0.7).add(perp);
    return { c1: a, c2: b, curve: new THREE.CubicBezierCurve3(new THREE.Vector3(0, 0, 0), a, b, end) };
  }, [end]);

  const ref = useRef<THREE.Object3D & { material?: THREE.Material & { opacity: number } }>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const start = useRef(performance.now());
  const life = 1900; // мс на пробег импульса (медленнее — спокойнее)
  const phase = (delay % life) / life;

  useFrame(() => {
    const now = performance.now();
    const el = now - start.current;
    const mat = ref.current?.material;
    if (mat) mat.opacity = easeOut(Math.min(1, Math.max(0, (el - delay) / 600))) * 0.24;
    const p = pulse.current;
    if (p && el > delay) {
      const tt = (el / life + phase) % 1;
      curve.getPoint(tt, p.position);
      const glow = Math.min(1, tt * 5) * (1 - tt);
      p.scale.setScalar(0.05 + glow * 0.08);
      (p.material as THREE.MeshBasicMaterial).opacity = glow * 0.5;
    }
  });

  return (
    <>
      <CubicBezierLine
        ref={ref as never}
        start={[0, 0, 0]}
        end={[end.x, end.y, end.z]}
        midA={[c1.x, c1.y, c1.z]}
        midB={[c2.x, c2.y, c2.z]}
        color={C.line}
        lineWidth={0.85}
        transparent
        opacity={0}
      />
      <mesh ref={pulse}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color="#FFFFFF"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

/** Прозрачная увеличенная зона клика */
function HitArea({
  onClick,
  onHover,
  radius = 0.8,
}: {
  onClick: () => void;
  onHover: (v: boolean) => void;
  radius?: number;
}) {
  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        onHover(false);
        document.body.style.cursor = '';
      }}
    >
      <sphereGeometry args={[radius, 12, 12]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function ChildNode({
  child,
  dir,
  radius,
  index,
  onOpen,
}: {
  child: FileNode;
  dir: THREE.Vector3;
  radius: number;
  index: number;
  onOpen: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const start = useRef(performance.now());
  const [hover, setHover] = useState(false);
  const isFolder = child.type === 'folder';
  const target = useMemo(() => dir.clone().multiplyScalar(radius), [dir, radius]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = Math.min(1, Math.max(0, (performance.now() - start.current - index * 55) / 480));
    g.position.copy(target).multiplyScalar(easeOut(t));
    const pop = easeOutBack(Math.min(1, t));
    const bob = 1 + Math.sin(state.clock.elapsedTime * 1.6 + index) * 0.04;
    g.scale.setScalar(pop * (hover ? 1.35 : 1) * bob);
  });

  return (
    <group ref={group}>
      {isFolder && <HitArea onClick={onOpen} onHover={setHover} />}
      <mesh>
        {isFolder ? <octahedronGeometry args={[0.28, 0]} /> : <sphereGeometry args={[0.16, 20, 20]} />}
        <meshStandardMaterial
          color={isFolder ? C.folder : C.file}
          emissive={isFolder ? C.folder : C.file}
          emissiveIntensity={hover ? 0.6 : 0.28}
          roughness={0.5}
          metalness={0.15}
          flatShading={isFolder}
        />
      </mesh>
      <Html center distanceFactor={11} position={[0, isFolder ? 0.6 : 0.44, 0]} pointerEvents="none" zIndexRange={[10, 0]}>
        <div
          className={`select-none whitespace-nowrap font-mono text-[11px] ${
            isFolder ? 'font-semibold text-white' : 'text-white/60'
          }`}
          style={labelStyle}
        >
          {isFolder ? child.name + '/' : child.name}
        </div>
      </Html>
    </group>
  );
}

function BackNode({ onBack }: { onBack: () => void }) {
  const ref = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const pos = useMemo(() => new THREE.Vector3(0.35, -1, 0.3).normalize().multiplyScalar(2.4), []);
  useFrame((state) => {
    if (ref.current) {
      const bob = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
      ref.current.scale.setScalar((hover ? 1.35 : 1) * bob);
    }
  });
  return (
    <group ref={ref} position={pos}>
      <HitArea onClick={onBack} onHover={setHover} radius={0.7} />
      <mesh>
        <torusGeometry args={[0.24, 0.08, 8, 20]} />
        <meshStandardMaterial color={C.back} emissive={C.back} emissiveIntensity={hover ? 0.65 : 0.35} roughness={0.45} />
      </mesh>
      <Html center distanceFactor={11} position={[0, 0.52, 0]} pointerEvents="none" zIndexRange={[10, 0]}>
        <div className="select-none whitespace-nowrap font-mono text-[11px] font-semibold text-white" style={labelStyle}>
          ← назад
        </div>
      </Html>
    </group>
  );
}

function Soma({ name }: { name: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.05);
      ref.current.rotation.y += 0.003;
      ref.current.rotation.x += 0.0015;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.6, 2]} />
        <meshStandardMaterial color={C.soma} emissive={C.somaEmissive} emissiveIntensity={0.38} roughness={0.42} metalness={0.2} flatShading />
      </mesh>
      <Html center distanceFactor={12} position={[0, -1.05, 0]} pointerEvents="none" zIndexRange={[10, 0]}>
        <div className="select-none whitespace-nowrap rounded-lg bg-white/5 px-2.5 py-1 font-mono text-xs font-bold text-white backdrop-blur-sm" style={labelStyle}>
          {name}
        </div>
      </Html>
    </group>
  );
}

/** «Расцветание» из центра при каждом открытии папки (ремонтируется по ключу) */
function Bloom({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef(performance.now());
  useFrame(() => {
    if (ref.current) {
      const t = Math.min(1, (performance.now() - start.current) / 450);
      ref.current.scale.setScalar(0.5 + easeOut(t) * 0.5);
    }
  });
  return <group ref={ref}>{children}</group>;
}

/** Синаптический фон из частиц */
function Particles() {
  const geo = useMemo(() => {
    const n = 90;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = fibDir(i, n).multiplyScalar(3.2 + Math.random() * 2.5);
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={C.file} size={0.042} sizeAttenuation transparent opacity={0.3} />
    </points>
  );
}

export function NeuronScene({
  node,
  path,
  onOpen,
  onBack,
}: {
  node: FileNode;
  path: number[];
  onOpen: (index: number) => void;
  onBack: () => void;
}) {
  const children = node.children ?? [];
  const n = children.length;
  const radius = Math.min(3.4, 2.5 + n * 0.05);
  const dirs = useMemo(() => children.map((_, i) => fibDir(i, n)), [children, n]);

  // Нейрон вращается постоянно — наведение на узел вращение не останавливает.
  const spin = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.12;
  });

  // Сброс курсора при навигации: узел под курсором мог размонтироваться без pointer-out.
  const pathKey = path.join('/');
  useEffect(() => {
    document.body.style.cursor = '';
  }, [pathKey]);

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 0, 0]} color={C.soma} intensity={1.5} distance={16} decay={0} />
      <pointLight position={[5, 4, 4]} color={C.folder} intensity={0.75} decay={0} />
      <pointLight position={[-5, -3, -3]} color={C.back} intensity={0.65} decay={0} />

      <group ref={spin}>
        <Bloom key={path.join('/')}>
          <Soma name={node.name} />
          {children.map((child, i) => (
            <group key={child.name}>
              <Dendrite end={dirs[i].clone().multiplyScalar(radius)} delay={i * 55} />
              <ChildNode child={child} dir={dirs[i]} radius={radius} index={i} onOpen={() => onOpen(i)} />
            </group>
          ))}
          {path.length > 0 && <BackNode onBack={onBack} />}
        </Bloom>
      </group>

      <Particles />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
      />
    </>
  );
}
