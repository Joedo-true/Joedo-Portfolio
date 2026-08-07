import * as THREE from 'three';
import { buildHexSphere, type HexTile } from './hexSphere';
import { buildTerrain, type Biome, type Terrain } from './terrain';
import { scatterProps, type Scatter } from './scatter';
import { config } from '../config';

/**
 * Сборка планеты в одну слитую сетку.
 *
 * Плиток две с половиной тысячи, но геометрия у каждой своя (двенадцать из них
 * вообще пятиугольники), поэтому инстансинг тут не подходит. Ландшафт при этом
 * неподвижен, так что одна общая сетка с цветом в вершинах — самый дешёвый
 * вариант: один вызов отрисовки на всю планету.
 *
 * Плитки подняты по высоте ландшафта, и рельеф получается ступенчатым — это и
 * есть язык гекс-мира: не сглаженный холм, а террасы. Юбка каждой плитки при
 * этом опускается до уровня моря, а не на свою толщину: иначе между соседями
 * разной высоты зияли бы дыры на всю разницу.
 *
 * Сборка порезана на куски и отдаёт прогресс: экран загрузки показывает
 * реальную готовность, а не таймер.
 */

export interface PlanetData {
  geometry: THREE.BufferGeometry;
  tiles: HexTile[];
  terrain: Terrain;
  /** Радиус верхней грани каждой плитки */
  topRadius: Float32Array;
  /** Деревья и валуны — готовые матрицы для инстансов */
  scatter: Scatter;
  /** Радиус, по которому камера считает кадрирование */
  radius: number;
  /** Самая высокая точка суши — по ней ставится облачный слой */
  peakRadius: number;
  /** Поворот вокруг оси, при котором главный материк смотрит на камеру */
  homeSpin: number;
}

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

/** Радиус верхней грани плитки: ровное море, ступенчатая суша */
function topRadiusFor(biome: Biome, height01: number): number {
  const { landLift, sandLift, reliefHeight, reliefPower } = config.planet;
  if (biome === 'water') return 1;
  const base = biome === 'sand' ? sandLift : landLift;
  return 1 + base + reliefHeight * Math.pow(height01, reliefPower);
}

function colorFor(
  index: number,
  terrain: Terrain,
  target: THREE.Color,
): THREE.Color {
  const palette = config.palette;
  const { waterLine, deepLine } = terrain;
  const elevation = terrain.elevation[index];
  const height = terrain.height01[index];

  switch (terrain.biome[index]) {
    case 'water': {
      // Чем глубже, тем темнее; у самого берега — светлая отмель
      const depth = THREE.MathUtils.clamp(
        (waterLine - elevation) / Math.max(waterLine - deepLine, 1e-4),
        0,
        1,
      );
      target.set(palette.water).lerp(new THREE.Color(palette.waterDeep), depth);
      if (terrain.shoreWater[index]) {
        target.lerp(new THREE.Color(palette.waterShore), 0.32);
      }
      return target;
    }
    case 'sand':
      return target.set(palette.sand);
    case 'rock': {
      const { rockLine, snowLine } = config.planet;
      const t = THREE.MathUtils.clamp(
        (height - rockLine) / Math.max(snowLine - rockLine, 1e-4),
        0,
        1,
      );
      return target.set(palette.rock).lerp(new THREE.Color(palette.rockHigh), t);
    }
    case 'snow':
      return target.set(palette.snow);
    case 'podzol':
      return target.set(palette.podzol);
    case 'concrete':
      return target.set(palette.concrete);
    default: {
      // Трава темнеет к границе леса — низины сочнее склонов
      const t = THREE.MathUtils.clamp(height / Math.max(config.planet.rockLine, 1e-4), 0, 1);
      return target.set(palette.soil).lerp(new THREE.Color(palette.soilHigh), t);
    }
  }
}

/**
 * Цвет каждой плитки, смягчённый по соседям.
 *
 * Без этого граница биомов — рубленая линия: зелёный, следом сразу белый.
 * Каждая плитка остаётся одноцветной (так и было задумано), но её цвет
 * подтягивается к окружению, и переход читается уклоном, а не ступенью.
 *
 * Вода и суша между собой не смешиваются: урез воды — единственная граница,
 * которая должна остаться резкой, иначе берег превращается в кисель.
 */
function buildPalette(tiles: HexTile[], terrain: Terrain): Float32Array {
  const color = new THREE.Color();
  const raw = new Float32Array(tiles.length * 3);
  for (let i = 0; i < tiles.length; i++) {
    colorFor(i, terrain, color);
    color.toArray(raw, i * 3);
  }

  const blend = THREE.MathUtils.clamp(config.planet.colorBlend, 0, 1);
  if (blend <= 0) return raw;

  const mixed = raw.slice();
  for (let i = 0; i < tiles.length; i++) {
    const wet = terrain.biome[i] === 'water';
    let r = raw[i * 3];
    let g = raw[i * 3 + 1];
    let b = raw[i * 3 + 2];
    let count = 1;

    for (const neighbour of tiles[i].neighbours) {
      if ((terrain.biome[neighbour] === 'water') !== wet) continue;
      r += raw[neighbour * 3];
      g += raw[neighbour * 3 + 1];
      b += raw[neighbour * 3 + 2];
      count++;
    }

    mixed[i * 3] = THREE.MathUtils.lerp(raw[i * 3], r / count, blend);
    mixed[i * 3 + 1] = THREE.MathUtils.lerp(raw[i * 3 + 1], g / count, blend);
    mixed[i * 3 + 2] = THREE.MathUtils.lerp(raw[i * 3 + 2], b / count, blend);
  }

  return mixed;
}

export async function buildPlanet(onProgress: (value: number) => void): Promise<PlanetData> {
  const { frequency, tileGap, tileDepth } = config.planet;

  onProgress(0.03);
  await nextFrame();

  const tiles = buildHexSphere(frequency);
  onProgress(0.34);
  await nextFrame();

  const terrain = buildTerrain(tiles);
  onProgress(0.46);
  await nextFrame();

  const topRadius = new Float32Array(tiles.length);
  let peakRadius = 1;
  for (let i = 0; i < tiles.length; i++) {
    topRadius[i] = topRadiusFor(terrain.biome[i], terrain.height01[i]);
    if (topRadius[i] > peakRadius) peakRadius = topRadius[i];
  }

  const palette = buildPalette(tiles, terrain);

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
      color.fromArray(palette, i * 3);

      const outer = topRadius[i];
      // Юбка идёт до уровня моря, а не на толщину плитки: у соседей разная
      // высота, и короткая юбка оставила бы сквозные щели в склонах
      const inner = Math.min(1 - tileDepth, outer - tileDepth);

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

    onProgress(0.46 + 0.42 * (end / tiles.length));
    await nextFrame();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();

  onProgress(0.9);
  await nextFrame();

  const scatter = scatterProps(tiles, terrain, topRadius);

  onProgress(1);
  return {
    geometry,
    tiles,
    terrain,
    topRadius,
    scatter,
    radius: 1 + config.planet.landLift,
    peakRadius,
    // Наклон оси — поворот вокруг Z, он не трогает направление на камеру,
    // поэтому достаточно довернуть материк по долготе
    homeSpin: Math.atan2(-terrain.homeDirection.x, terrain.homeDirection.z),
  };
}
