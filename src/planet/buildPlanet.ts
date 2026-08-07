import * as THREE from 'three';
import { buildHexSphere, type HexTile } from './hexSphere';
import { buildTerrain, type Biome, type LandmarkName, type Terrain } from './terrain';
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

/** Портал: светящаяся поверхность на дне колодца и всё, что нужно, чтобы по
 *  ней попасть указателем */
export interface Portal {
  name: LandmarkName;
  tile: number;
  /** Готовая сетка светящейся поверхности, уже в системе планеты */
  surface: THREE.BufferGeometry;
  /** Середина поверхности и наружная нормаль — по ним считается попадание */
  centre: THREE.Vector3;
  normal: THREE.Vector3;
  /** Радиус зоны попадания */
  reach: number;
  color: string;
  url: string;
}

export interface PlanetData {
  geometry: THREE.BufferGeometry;
  tiles: HexTile[];
  terrain: Terrain;
  portals: Portal[];
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
    case 'portal':
      return target.set(palette.portalFrame);
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
 * которая должна остаться резкой, иначе берег превращается в кисель. Рамка
 * портала не смешивается ни с чем: она рукотворная, у неё край и должен быть
 * рубленым.
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

  const family = (index: number) => {
    const biome = terrain.biome[index];
    if (biome === 'water') return 0;
    if (biome === 'portal') return 2;
    return 1;
  };

  const mixed = raw.slice();
  for (let i = 0; i < tiles.length; i++) {
    const own = family(i);
    let r = raw[i * 3];
    let g = raw[i * 3 + 1];
    let b = raw[i * 3 + 2];
    let count = 1;

    for (const neighbour of tiles[i].neighbours) {
      if (family(neighbour) !== own) continue;
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

/**
 * Светящаяся поверхность на дне каждого колодца.
 *
 * Строится по внутреннему краю самого колодца, а не отдельной окружностью, —
 * поэтому шестиугольник поверхности точно совпадает с рамкой, без зазора и
 * без разворота на случайный угол.
 */
function buildPortals(
  tiles: HexTile[],
  terrain: Terrain,
  topRadius: Float32Array,
  rings: Map<number, THREE.Vector3[]>,
): Portal[] {
  const palette = config.palette;
  const plan: [LandmarkName, number, string, string][] = [
    ['market', terrain.landmarks.market.portal, palette.portalMarket, config.links.market],
    ['reactor', terrain.landmarks.reactor.portal, palette.portalReactor, config.links.reactor],
    [
      'observatory',
      terrain.landmarks.observatory.portal,
      palette.portalObservatory,
      config.links.observatory,
    ],
  ];

  const portals: Portal[] = [];
  for (const [name, tile, color, url] of plan) {
    const ring = rings.get(tile);
    if (!ring || ring.length < 3) continue;

    // Поверхность чуть ниже края колодца и чуть уже его — иначе она дерётся
    // со стенкой за одни и те же пиксели
    const centre = tiles[tile].center
      .clone()
      .multiplyScalar(topRadius[tile] - config.portal.depth * 1.04);
    const rim = ring.map((point) => point.clone().lerp(centre, 0.06));

    const positions: number[] = [];
    const normal = tiles[tile].center.clone();
    for (let k = 0; k < rim.length; k++) {
      const next = (k + 1) % rim.length;
      positions.push(
        centre.x, centre.y, centre.z,
        rim[k].x, rim[k].y, rim[k].z,
        rim[next].x, rim[next].y, rim[next].z,
      );
    }

    const surface = new THREE.BufferGeometry();
    surface.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    surface.computeVertexNormals();

    let reach = 0;
    for (const point of rim) reach = Math.max(reach, point.distanceTo(centre));

    portals.push({ name, tile, surface, centre, normal, reach, color, url });
  }

  return portals;
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

  // У обычной плитки на угол приходится три треугольника: верх и две на стенку.
  // У портальной шесть: рамка вместо верха и ещё стенка колодца
  let vertexCount = 0;
  for (let i = 0; i < tiles.length; i++) {
    vertexCount += tiles[i].corners.length * (terrain.biome[i] === 'portal' ? 18 : 9);
  }

  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);

  /** Внутренние края колодцев — по ним потом строится светящаяся поверхность */
  const portalRings = new Map<number, THREE.Vector3[]>();

  // Стенки колодца красятся приглушённым цветом своего портала. Под углом,
  // а с орбиты угол почти всегда косой, дна не видно вовсе — виден только
  // колодец, и без этого отсвета портал читался бы чёрной ямой
  const wellTints = new Map<number, THREE.Color>();
  for (const [name, tint] of [
    ['market', config.palette.portalMarket],
    ['reactor', config.palette.portalReactor],
    ['observatory', config.palette.portalObservatory],
  ] as const) {
    const site = terrain.landmarks[name];
    wellTints.set(
      site.portal,
      new THREE.Color(config.palette.portalFrame).lerp(new THREE.Color(tint), 0.5),
    );
  }

  let cursor = 0;
  const color = new THREE.Color();
  const normal = new THREE.Vector3();
  const edgeA = new THREE.Vector3();
  const edgeB = new THREE.Vector3();
  const sideward = new THREE.Vector3();

  /**
   * Кладёт треугольник лицом наружу: если нормаль смотрит не туда, куда
   * указывает `outward`, меняем обход.
   *
   * Направление приходит снаружи, а не выводится из самого треугольника.
   * Раньше сторона выбиралась по знаку скалярного произведения нормали на
   * центр треугольника — и для боковых стенок это оказалось ровно нулём:
   * низ плитки лежит на тех же лучах из центра планеты, что и верх, поэтому
   * плоскость стенки проходит через центр планеты, а нормаль к ней
   * перпендикулярна любой точке этой плоскости. Знак решала ошибка округления,
   * половина стенок выворачивалась изнанкой и пропадала — сбоку у плиток
   * зияла пустота.
   */
  const pushTriangle = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    outward: THREE.Vector3,
  ) => {
    edgeA.subVectors(b, a);
    edgeB.subVectors(c, a);
    normal.crossVectors(edgeA, edgeB).normalize();

    let second = b;
    let third = c;
    if (normal.dot(outward) < 0) {
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

      const gate = terrain.biome[i] === 'portal';
      // Рамка портала чуть выше остальной земли: по этому бортику плитка и
      // читается сооружением, а не выбоиной
      const outer = topRadius[i] + (gate ? config.portal.lift : 0);
      // Юбка идёт до уровня моря, а не на толщину плитки: у соседей разная
      // высота, и короткая юбка оставила бы сквозные щели в склонах
      const inner = Math.min(1 - tileDepth, outer - tileDepth);

      const apex = tile.center.clone().multiplyScalar(outer);
      const top = tile.corners.map((corner) =>
        corner.clone().normalize().multiplyScalar(outer).lerp(apex, 1 - tileGap),
      );
      const bottom = top.map((point) => point.clone().normalize().multiplyScalar(inner));

      // Внутренний край рамки и дно колодца под ним
      const wellTop = topRadius[i] - config.portal.depth;
      const lip = gate ? top.map((point) => point.clone().lerp(apex, config.portal.frameWidth)) : [];
      const wellFloor = gate
        ? lip.map((point) => point.clone().normalize().multiplyScalar(inner))
        : [];
      const wellEdge = gate
        ? lip.map((point) => point.clone().normalize().multiplyScalar(wellTop))
        : [];

      const count = top.length;
      for (let k = 0; k < count; k++) {
        const next = (k + 1) % count;

        // Наружу для боковой стенки — вбок от оси плитки, к середине ребра,
        // а не вверх
        sideward
          .copy(top[k])
          .add(top[next])
          .multiplyScalar(0.5)
          .addScaledVector(tile.center, -0.5 * (top[k].dot(tile.center) + top[next].dot(tile.center)));

        if (gate) {
          // Плоская рамка кольцом вместо сплошного верха
          pushTriangle(top[k], top[next], lip[next], tile.center);
          pushTriangle(top[k], lip[next], lip[k], tile.center);

          // Стенка колодца смотрит внутрь — направление «наружу» у неё обратное
          const tint = wellTints.get(i);
          if (tint) color.copy(tint);
          sideward.negate();
          pushTriangle(lip[k], lip[next], wellFloor[next], sideward);
          pushTriangle(lip[k], wellFloor[next], wellFloor[k], sideward);
          sideward.negate();
          color.fromArray(palette, i * 3);
        } else {
          // Верхняя грань веером из центра плитки
          pushTriangle(apex, top[k], top[next], tile.center);
        }

        // Боковая стенка — она и создаёт ощущение толщины
        pushTriangle(top[k], top[next], bottom[next], sideward);
        pushTriangle(top[k], bottom[next], bottom[k], sideward);
      }

      if (gate) portalRings.set(i, wellEdge);
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
  const portals = buildPortals(tiles, terrain, topRadius, portalRings);

  onProgress(1);
  return {
    geometry,
    tiles,
    terrain,
    portals,
    topRadius,
    scatter,
    radius: 1 + config.planet.landLift,
    peakRadius,
    // Наклон оси — поворот вокруг Z, он не трогает направление на камеру,
    // поэтому достаточно довернуть материк по долготе
    homeSpin: Math.atan2(-terrain.homeDirection.x, terrain.homeDirection.z),
  };
}
