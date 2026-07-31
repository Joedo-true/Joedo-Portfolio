import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  createIridescentMaterial,
  type IridescentPreset,
} from '../shaders/iridescentMaterial';

/**
 * Тессеракт — гиперкуб в стандартной 3D-проекции (ТЗ 2.1).
 *
 * Внешний куб (12 рёбер) + внутренний, той же ориентации и по центру
 * (12 рёбер) + 8 соединительных рёбер вершина-в-вершину. Итого 32 ребра —
 * трубы одинаковой толщины, а не wireframe-линии.
 *
 * Рёбра собраны в один InstancedMesh: фигура рисуется как минимум дважды
 * (крупная на загрузке и маленькая иконкой в хедере), 32 отдельных меша были
 * бы расточительны. В вершинах — второй InstancedMesh из шариков того же
 * радиуса: он скругляет стыки, поэтому трубы можно оставить без крышек.
 */

const CUBE_EDGE_BITS = [1, 2, 4];

/** Восемь вершин куба; индекс — битовая маска знаков по осям x,y,z */
function cubeCorners(half: number, center: THREE.Vector3) {
  const corners: THREE.Vector3[] = [];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        corners.push(
          new THREE.Vector3(center.x + sx * half, center.y + sy * half, center.z + sz * half),
        );
      }
    }
  }
  return corners;
}

export interface TesseractShape {
  segments: [THREE.Vector3, THREE.Vector3][];
  joints: THREE.Vector3[];
  /** Половина габарита фигуры в мировых единицах — по нему считается масштаб */
  extent: number;
}

/**
 * `shift` смещает внутренний куб к вершине внешнего. По умолчанию 0 —
 * внутренний куб строго по центру, классическая проекция гиперкуба, где все
 * восемь соединительных рёбер одинаковы и расходятся по диагоналям.
 */
export function buildTesseract(outerHalf = 1, innerHalf = 0.46, shift = 0): TesseractShape {
  const outer = cubeCorners(outerHalf, new THREE.Vector3(0, 0, 0));
  const inner = cubeCorners(innerHalf, new THREE.Vector3(shift, shift, shift));

  // Рёбра куба — пары вершин, различающиеся ровно одним битом, то есть
  // знаком ровно по одной оси. Таких пар 12.
  const cubeEdges: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (CUBE_EDGE_BITS.includes(i ^ j)) cubeEdges.push([i, j]);
    }
  }

  const segments: [THREE.Vector3, THREE.Vector3][] = [];
  for (const [a, b] of cubeEdges) segments.push([outer[a], outer[b]]);
  for (const [a, b] of cubeEdges) segments.push([inner[a], inner[b]]);
  // Соединительные: каждая вершина внутреннего куба к своей во внешнем
  for (let i = 0; i < 8; i++) segments.push([inner[i], outer[i]]);

  return { segments, joints: [...outer, ...inner], extent: outerHalf };
}

export function Tesseract({
  preset,
  tubeRadius = 0.055,
  shape,
}: {
  preset: IridescentPreset;
  /** В иконочном масштабе рёбра стоит утолщать, иначе силуэт теряется (ТЗ 7) */
  tubeRadius?: number;
  shape?: TesseractShape;
}) {
  const { segments, joints } = useMemo(() => shape ?? buildTesseract(), [shape]);

  const edges = useRef<THREE.InstancedMesh>(null);
  const vertices = useRef<THREE.InstancedMesh>(null);

  // Один материал на оба меша: это буквально одни и те же трубы
  const material = useMemo(() => createIridescentMaterial(preset), [preset]);

  useEffect(() => () => material.dispose(), [material]);

  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const midpoint = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    if (edges.current) {
      segments.forEach(([a, b], index) => {
        direction.subVectors(b, a);
        const length = direction.length();
        midpoint.addVectors(a, b).multiplyScalar(0.5);
        quaternion.setFromUnitVectors(up, direction.normalize());
        // Труба единичной длины вдоль Y — тянем только по Y
        scale.set(1, length, 1);
        matrix.compose(midpoint, quaternion, scale);
        edges.current!.setMatrixAt(index, matrix);
      });
      edges.current.instanceMatrix.needsUpdate = true;
    }

    if (vertices.current) {
      joints.forEach((point, index) => {
        matrix.makeTranslation(point.x, point.y, point.z);
        vertices.current!.setMatrixAt(index, matrix);
      });
      vertices.current.instanceMatrix.needsUpdate = true;
    }
  }, [segments, joints]);

  // Зерно в шейдере пересчитывается каждый кадр и мерцает само по себе —
  // при reduced-motion время замораживаем, иначе фигура остаётся «живой»
  // даже с выключенным вращением (ТЗ 10).
  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = reduced ? 2.4 : state.clock.elapsedTime;
  });

  return (
    <group>
      <instancedMesh
        ref={edges}
        args={[undefined, undefined, segments.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[tubeRadius, tubeRadius, 1, 14, 1, true]} />
        <primitive object={material} attach="material" />
      </instancedMesh>

      <instancedMesh
        ref={vertices}
        args={[undefined, undefined, joints.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[tubeRadius, 16, 12]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
    </group>
  );
}
