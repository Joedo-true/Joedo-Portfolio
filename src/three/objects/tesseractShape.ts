import * as THREE from 'three';

/**
 * Каркас тессеракта — гиперкуба в стандартной 3D-проекции (ТЗ 2.1).
 *
 * Внешний куб (12 рёбер) + внутренний той же ориентации и по центру
 * (12 рёбер) + 8 соединительных рёбер вершина-в-вершину. Итого 32 ребра.
 *
 * Здесь только геометрия каркаса: рисуют её частицы (`ParticleTesseract`),
 * рассыпанные по этим отрезкам.
 */

const CUBE_EDGE_BITS = [1, 2, 4];

/** Восемь вершин куба; индекс — битовая маска знаков по осям x, y, z */
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

/**
 * Точки, равномерно рассыпанные по всем рёбрам: на каждое ребро приходится
 * доля точек пропорционально его длине, иначе короткие рёбра выглядели бы
 * гуще длинных. Возвращает ровно столько точек, сколько получилось, — точное
 * попадание в `count` тут не нужно.
 */
export function sampleEdgePoints(shape: TesseractShape, count: number): THREE.Vector3[] {
  const lengths = shape.segments.map(([a, b]) => a.distanceTo(b));
  const total = lengths.reduce((sum, value) => sum + value, 0);

  const points: THREE.Vector3[] = [];
  shape.segments.forEach(([a, b], index) => {
    const share = Math.max(2, Math.round((lengths[index] / total) * count));
    for (let i = 0; i < share; i++) {
      points.push(new THREE.Vector3().lerpVectors(a, b, i / (share - 1)));
    }
  });
  return points;
}
