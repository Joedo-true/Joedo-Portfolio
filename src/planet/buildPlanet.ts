import * as THREE from 'three';
import { buildHexSphere, type HexTile } from './hexSphere';
import { buildTerrain, type Biome, type Terrain } from './terrain';
import { config } from '../config';

/**
 * Сборка планеты в одну слитую сетку.
 *
 * Плиток две с половиной тысячи, но геометрия у каждой своя (двенадцать из них
 * вообще пятиугольники), поэтому инстансинг тут не подходит. Ландшафт при этом
 * неподвижен, так что одна общая сетка с цветом в вершинах — самый дешёвый
 * вариант: один вызов отрисовки на всю планету.
 *
 * Сборка порезана на куски и отдаёт прогресс: экран загрузки показывает
 * реальную готовность, а не таймер.
 */

export interface PlanetData {
  geometry: THREE.BufferGeometry;
  tiles: HexTile[];
  terrain: Terrain;
  /** Внешний радиус суши — по нему камера считает кадрирование */
  radius: number;
}

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

function liftFor(biome: Biome): number {
  const { landLift, sandLift } = config.planet;
  if (biome === 'water') return 0;
  if (biome === 'sand') return sandLift;
  return landLift;
}

function colorFor(
  biome: Biome,
  elevation: number,
  terrain: Terrain,
  target: THREE.Color,
): THREE.Color {
  const palette = config.palette;
  const { waterLine, deepLine } = terrain;

  switch (biome) {
    case 'water': {
      // Чем глубже, тем темнее: отмель у берега и русло реки заметно светлее
      const depth = THREE.MathUtils.clamp(
        (waterLine - elevation) / Math.max(waterLine - deepLine, 1e-4),
        0,
        1,
      );
      return target.set(palette.water).lerp(new THREE.Color(palette.waterDeep), depth);
    }
    case 'sand':
      return target.set(palette.sand);
    case 'podzol':
      return target.set(palette.podzol);
    case 'concrete':
      return target.set(palette.concrete);
    default: {
      const height = THREE.MathUtils.clamp((elevation - waterLine) / 0.35, 0, 1);
      return target.set(palette.soil).lerp(new THREE.Color(palette.soilHigh), height);
    }
  }
}

export async function buildPlanet(onProgress: (value: number) => void): Promise<PlanetData> {
  const { frequency, tileGap, tileDepth, landLift } = config.planet;

  onProgress(0.04);
  await nextFrame();

  const tiles = buildHexSphere(frequency);
  onProgress(0.4);
  await nextFrame();

  const terrain = buildTerrain(tiles);
  onProgress(0.55);
  await nextFrame();

  let vertexCount = 0;
  for (const tile of tiles) vertexCount += tile.corners.length * 9;

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);

  let cursor = 0;
  const color = new THREE.Color();
  const normal = new THREE.Vector3();
  const edgeA = new THREE.Vector3();
  const edgeB = new THREE.Vector3();
  const middle = new THREE.Vector3();

  /** Кладёт треугольник наружу: если нормаль смотрит внутрь, меняем обход */
  const pushTriangle = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    edgeA.subVectors(b, a);
    edgeB.subVectors(c, a);
    normal.crossVectors(edgeA, edgeB).normalize();
    middle.copy(a).add(b).add(c).multiplyScalar(1 / 3);

    let second = b;
    let third = c;
    if (normal.dot(middle) < 0) {
      normal.negate();
      second = c;
      third = b;
    }

    for (const point of [a, second, third]) {
      const offset = cursor * 3;
      positions[offset] = point.x;
      positions[offset + 1] = point.y;
      positions[offset + 2] = point.z;
      normals[offset] = normal.x;
      normals[offset + 1] = normal.y;
      normals[offset + 2] = normal.z;
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
      cursor++;
    }
  };

  const CHUNK = 220;
  for (let start = 0; start < tiles.length; start += CHUNK) {
    const end = Math.min(start + CHUNK, tiles.length);

    for (let i = start; i < end; i++) {
      const tile = tiles[i];
      const biome = terrain.biome[i];
      colorFor(biome, terrain.elevation[i], terrain, color);

      const outer = 1 + liftFor(biome);
      const inner = outer - tileDepth;

      const apex = tile.center.clone().multiplyScalar(outer);
      const top = tile.corners.map((corner) =>
        corner.clone().normalize().multiplyScalar(outer).lerp(apex, 1 - tileGap),
      );
      const bottom = top.map((point) => point.clone().normalize().multiplyScalar(inner));

      const count = top.length;
      for (let k = 0; k < count; k++) {
        const next = (k + 1) % count;
        // Верхняя грань веером из центра плитки
        pushTriangle(apex, top[k], top[next]);
        // Боковая стенка — она и создаёт ощущение толщины
        pushTriangle(top[k], top[next], bottom[next]);
        pushTriangle(top[k], bottom[next], bottom[k]);
      }
    }

    onProgress(0.55 + 0.45 * (end / tiles.length));
    await nextFrame();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  onProgress(1);
  return { geometry, tiles, terrain, radius: 1 + landLift };
}
