import * as THREE from 'three';

/**
 * Гекс-сфера: многогранник Голдберга, двойственный геодезической сфере.
 *
 * Икосаэдр делится на сетку частоты `frequency`, вершины проецируются на сферу
 * — получается геодезическая сфера из треугольников. Её двойственник и есть
 * покрытие из шестиугольников: вокруг каждой вершины геодезической сферы
 * собирается многоугольник из центроидов прилежащих треугольников.
 *
 * Плиток выходит ровно 10·f²+2, из них двенадцать — пятиугольники (на вершинах
 * исходного икосаэдра). Замостить сферу одними шестиугольниками нельзя, это
 * следствие теоремы Эйлера, а не упрощение.
 *
 * При f = 16 это 2562 плитки и около 83 плиток по окружности.
 */

const PHI = (1 + Math.sqrt(5)) / 2;

const ICO_VERTICES: readonly [number, number, number][] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];

const ICO_FACES: readonly [number, number, number][] = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

export interface HexTile {
  /** Центр плитки — единичный вектор */
  center: THREE.Vector3;
  /** Углы по кругу против часовой стрелки, если смотреть снаружи */
  corners: THREE.Vector3[];
  /** Индексы соседних плиток */
  neighbours: number[];
}

function buildGeodesic(frequency: number) {
  const positions: THREE.Vector3[] = [];
  const lookup = new Map<string, number>();
  const triangles: [number, number, number][] = [];

  const addVertex = (v: THREE.Vector3) => {
    v.normalize();
    // Точка на общем ребре двух граней считается дважды и расходится в
    // последних битах — округление до шести знаков склеивает её обратно
    const key = `${v.x.toFixed(6)},${v.y.toFixed(6)},${v.z.toFixed(6)}`;
    const found = lookup.get(key);
    if (found !== undefined) return found;
    const id = positions.length;
    positions.push(v);
    lookup.set(key, id);
    return id;
  };

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (const [ia, ib, ic] of ICO_FACES) {
    a.fromArray(ICO_VERTICES[ia]).normalize();
    b.fromArray(ICO_VERTICES[ib]).normalize();
    c.fromArray(ICO_VERTICES[ic]).normalize();

    // Барицентрическая сетка по грани
    const grid: number[][] = [];
    for (let i = 0; i <= frequency; i++) {
      const row: number[] = [];
      for (let j = 0; j <= frequency - i; j++) {
        const k = frequency - i - j;
        const point = new THREE.Vector3()
          .addScaledVector(a, k / frequency)
          .addScaledVector(b, i / frequency)
          .addScaledVector(c, j / frequency);
        row.push(addVertex(point));
      }
      grid.push(row);
    }

    for (let i = 0; i < frequency; i++) {
      for (let j = 0; j < frequency - i; j++) {
        triangles.push([grid[i][j], grid[i + 1][j], grid[i][j + 1]]);
        if (j < frequency - i - 1) {
          triangles.push([grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]);
        }
      }
    }
  }

  return { positions, triangles };
}

export function buildHexSphere(frequency: number): HexTile[] {
  const { positions, triangles } = buildGeodesic(frequency);

  const centroids = triangles.map(([i, j, k]) =>
    new THREE.Vector3()
      .add(positions[i])
      .add(positions[j])
      .add(positions[k])
      .normalize(),
  );

  const incident: number[][] = positions.map(() => []);
  triangles.forEach((triangle, index) => {
    for (const vertex of triangle) incident[vertex].push(index);
  });

  const tangent = new THREE.Vector3();
  const bitangent = new THREE.Vector3();
  const helper = new THREE.Vector3();

  const tiles: HexTile[] = positions.map((center, vertex) => {
    // Базис касательной плоскости, чтобы разложить углы по кругу
    helper.set(0, 0, 1);
    tangent.crossVectors(helper, center);
    if (tangent.lengthSq() < 1e-8) tangent.crossVectors(helper.set(1, 0, 0), center);
    tangent.normalize();
    bitangent.crossVectors(center, tangent);

    const localTangent = tangent.clone();
    const localBitangent = bitangent.clone();

    const corners = incident[vertex]
      .map((face) => centroids[face])
      .sort(
        (p, q) =>
          Math.atan2(p.dot(localBitangent), p.dot(localTangent)) -
          Math.atan2(q.dot(localBitangent), q.dot(localTangent)),
      );

    return { center: center.clone(), corners, neighbours: [] };
  });

  const seen = new Set<number>();
  const link = (x: number, y: number) => {
    const key = x < y ? x * positions.length + y : y * positions.length + x;
    if (seen.has(key)) return;
    seen.add(key);
    tiles[x].neighbours.push(y);
    tiles[y].neighbours.push(x);
  };
  for (const [i, j, k] of triangles) {
    link(i, j);
    link(j, k);
    link(k, i);
  }

  return tiles;
}
