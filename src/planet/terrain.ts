import * as THREE from 'three';
import { Noise3D } from './noise';
import type { HexTile } from './hexSphere';
import { config } from '../config';

/**
 * Из шума — география.
 *
 * Один только порог по шуму даёт не сушу, а камуфляж: россыпь озёр в материке и
 * островов в океане, и как следствие — песок почти на каждой клетке, потому что
 * берегом оказывается вся суша. Поэтому здесь четыре шага, и каждый убирает
 * конкретный артефакт:
 *
 *   1. Крупная форма с искажением области — материки с изрезанным берегом, но
 *      без мелкой ряби (высокие октавы дают именно рябь, а не детали).
 *   2. Уровень моря берётся не константой, а по доле воды: сколько бы ни менял
 *      зерно, океана всегда столько, сколько задано.
 *   3. Чистка: лужи в два тайла становятся сушей, одинокие тайлы в океане —
 *      водой. Остаются настоящие озёра и настоящие острова.
 *   4. Реки текут вниз по склону от вершин к морю, а не рисуются изолинией
 *      второго шума: у реки должно быть устье.
 *
 * Всё детерминировано: результат зависит только от зерна в конфиге.
 */

export type Biome =
  | 'water'
  | 'sand'
  | 'soil'
  | 'rock'
  | 'snow'
  | 'podzol'
  | 'concrete'
  /** Плитка-портал: вместо ровного верха у неё каменная рамка и колодец */
  | 'portal';

export type LandmarkName = 'market' | 'reactor' | 'observatory';

export interface LandmarkPlacement {
  /** Индекс центральной плитки */
  tile: number;
  /** Индекс плитки-портала рядом с постройкой */
  portal: number;
}

export interface Terrain {
  biome: Biome[];
  /** Высота в единицах шума, нужна для оттенков воды и суши */
  elevation: Float32Array;
  /** Высота, ниже которой лежит вода — от неё считается глубина */
  waterLine: number;
  /** Высота, на которой вода уже полностью тёмная */
  deepLine: number;
  /** Высота суши, приведённая к 0..1: 0 — урез воды, 1 — вершина.
   *  От неё зависит и подъём плитки, и камень со снегом, и граница леса */
  height01: Float32Array;
  /** Вода, касающаяся суши: по ней рисуется отмель */
  shoreWater: Uint8Array;
  /** Направление на середину самого большого материка. Планету разворачивают
   *  так, чтобы при первом взгляде он был к зрителю, а не открытый океан */
  homeDirection: THREE.Vector3;
  landmarks: {
    market: LandmarkPlacement;
    reactor: LandmarkPlacement;
    observatory: LandmarkPlacement;
  };
}

/** Плитки в радиусе `depth` шагов по соседям, включая саму центральную */
function collectPatch(tiles: HexTile[], start: number, depth: number): number[] {
  const seen = new Set<number>([start]);
  let frontier = [start];
  for (let step = 0; step < depth; step++) {
    const next: number[] = [];
    for (const index of frontier) {
      for (const neighbour of tiles[index].neighbours) {
        if (seen.has(neighbour)) continue;
        seen.add(neighbour);
        next.push(neighbour);
      }
    }
    frontier = next;
  }
  return [...seen];
}

/** Связные области из плиток, для которых `member` истинно */
function components(tiles: HexTile[], member: (index: number) => boolean): number[][] {
  const seen = new Uint8Array(tiles.length);
  const groups: number[][] = [];

  for (let start = 0; start < tiles.length; start++) {
    if (seen[start] || !member(start)) continue;

    const group: number[] = [];
    const queue = [start];
    seen[start] = 1;
    while (queue.length > 0) {
      const index = queue.pop() as number;
      group.push(index);
      for (const neighbour of tiles[index].neighbours) {
        if (seen[neighbour] || !member(neighbour)) continue;
        seen[neighbour] = 1;
        queue.push(neighbour);
      }
    }
    groups.push(group);
  }

  return groups;
}

/** Высота, ниже которой оказывается ровно `fraction` планеты */
function levelAtFraction(elevation: Float32Array, fraction: number): number {
  const sorted = Float32Array.from(elevation).sort();
  const clamped = Math.min(Math.max(fraction, 0.02), 0.98);
  return sorted[Math.round(clamped * (sorted.length - 1))];
}

/**
 * Реки: спуск по склону от вершины до моря.
 *
 * Мелкие впадины река переливает через край — иначе почти каждый путь
 * обрывается через три шага в первой же ямке шума и до устья не доходит.
 */
function carveRivers(
  tiles: HexTile[],
  biome: Biome[],
  elevation: Float32Array,
  isRiver: Uint8Array,
) {
  const { riverCount, riverMinLength } = config.planet;

  const peaks: number[] = [];
  for (let i = 0; i < tiles.length; i++) if (biome[i] === 'soil') peaks.push(i);
  peaks.sort((a, b) => elevation[b] - elevation[a]);

  // Истоки разносим по планете: иначе все реки стекут с одной горы
  const sources: number[] = [];
  for (const candidate of peaks) {
    if (sources.length >= Math.round(riverCount)) break;
    const far = sources.every(
      (source) => tiles[source].center.dot(tiles[candidate].center) < 0.9,
    );
    if (far) sources.push(candidate);
  }

  for (const source of sources) {
    const path: number[] = [];
    const visited = new Set<number>();
    let current = source;

    for (let step = 0; step < 60; step++) {
      if (visited.has(current)) break;
      visited.add(current);
      path.push(current);

      let next = -1;
      let lowest = elevation[current];
      for (const neighbour of tiles[current].neighbours) {
        if (elevation[neighbour] < lowest) {
          lowest = elevation[neighbour];
          next = neighbour;
        }
      }

      if (next === -1) {
        // Впадина: перехлёстываем через самый низкий край, как озеро
        let lowestRim = Infinity;
        for (const neighbour of tiles[current].neighbours) {
          if (visited.has(neighbour)) continue;
          if (elevation[neighbour] < lowestRim) {
            lowestRim = elevation[neighbour];
            next = neighbour;
          }
        }
        if (next === -1) break;
      }

      // Дошли до воды — устье найдено
      if (biome[next] === 'water') break;
      current = next;
    }

    if (path.length < riverMinLength) continue;
    for (const index of path) {
      biome[index] = 'water';
      isRiver[index] = 1;
    }
  }
}

/**
 * Ближайшая к заданному направлению плитка, вокруг которой на `clearance` шагов
 * нет ни воды, ни занятой земли, и площадка достаточно ровная: объекты не
 * должны стоять по колено в реке или враскоряку на горном уступе.
 */
function findSite(
  tiles: HexTile[],
  biome: Biome[],
  height01: Float32Array,
  direction: THREE.Vector3,
  clearance: number,
  taken: Set<number>,
): number {
  const { x: dx, y: dy, z: dz } = direction;
  const length = Math.hypot(dx, dy, dz) || 1;
  const flatEnough = 0.07;

  let fallback = -1;
  let fallbackDot = -Infinity;
  for (let i = 0; i < tiles.length; i++) {
    if (taken.has(i) || biome[i] === 'water') continue;
    const center = tiles[i].center;
    const dot = (center.x * dx + center.y * dy + center.z * dz) / length;
    if (dot > fallbackDot) {
      fallbackDot = dot;
      fallback = i;
    }
  }

  // Запас ослабляется по шагу, а не отбрасывается разом. Раньше, если под
  // полный запас чистого места не нашлось, поиск сразу сваливался на
  // «ближайшую сушу» — и станция вставала на пятачок посреди океана, потому
  // что этот пятачок и оказывался ближайшим к заданному направлению
  for (let room = clearance; room >= 1; room--) {
    let best = -1;
    let bestDot = -Infinity;

    for (let i = 0; i < tiles.length; i++) {
      if (taken.has(i) || biome[i] === 'water') continue;
      const center = tiles[i].center;
      const dot = (center.x * dx + center.y * dy + center.z * dz) / length;
      if (dot <= bestDot) continue;

      const patch = collectPatch(tiles, i, room);
      if (patch.some((index) => biome[index] === 'water' || taken.has(index))) continue;

      let low = Infinity;
      let high = -Infinity;
      for (const index of patch) {
        if (height01[index] < low) low = height01[index];
        if (height01[index] > high) high = height01[index];
      }
      if (high - low > flatEnough) continue;

      bestDot = dot;
      best = i;
    }

    if (best !== -1) return best;
  }

  return fallback;
}

export function buildTerrain(tiles: HexTile[]): Terrain {
  const planet = config.planet;

  const shape = new Noise3D(planet.seed);
  const warp = new Noise3D(planet.seed + 7331);
  const detail = new Noise3D(planet.seed + 20641);

  const elevation = new Float32Array(tiles.length);

  for (let i = 0; i < tiles.length; i++) {
    const { x, y, z } = tiles[i].center;
    const w = planet.warpScale;

    // Искажение области: точка сдвигается перед выборкой, и ровный овал
    // материка превращается в берег с заливами и полуостровами. Высокие
    // октавы такого не дают — они только сыплют мелкую рябь
    const ox = warp.noise(x * w, y * w, z * w) * planet.warpStrength;
    const oy = warp.noise(x * w + 5.2, y * w + 1.3, z * w + 9.1) * planet.warpStrength;
    const oz = warp.noise(x * w - 3.7, y * w + 8.4, z * w - 2.6) * planet.warpStrength;

    const c = planet.continentScale;
    const continents = shape.fbm((x + ox) * c, (y + oy) * c, (z + oz) * c, 4);
    const d = planet.detailScale;
    const roughness = detail.fbm(x * d, y * d, z * d, 2) * planet.detailStrength;
    elevation[i] = continents + roughness;
  }

  const waterLine = levelAtFraction(elevation, planet.waterFraction);

  const biome: Biome[] = new Array(tiles.length);
  for (let i = 0; i < tiles.length; i++) {
    biome[i] = elevation[i] < waterLine ? 'water' : 'soil';
  }

  // Лужи в пару плиток — это шум, а не озеро; одинокая плитка в океане — не
  // остров. Убираем и то, и другое: именно из-за них берег превращался в кашу
  for (const puddle of components(tiles, (i) => biome[i] === 'water')) {
    if (puddle.length < planet.lakeMinTiles) for (const i of puddle) biome[i] = 'soil';
  }
  for (const island of components(tiles, (i) => biome[i] !== 'water')) {
    if (island.length < planet.islandMinTiles) for (const i of island) biome[i] = 'water';
  }

  const isRiver = new Uint8Array(tiles.length);
  carveRivers(tiles, biome, elevation, isRiver);

  // Песчаные берега: суша у моря и у озёр, но только пологая. Если песком
  // становится вся кромка воды, им зарастает треть планеты — обрыв к морю
  // остаётся зелёным, пляж есть там, где берег полого сходит в воду.
  // Вдоль рек песка нет: русло в один тайл читается само, а песчаная кайма
  // вокруг него съела бы всю зелень.
  const beachLine = levelAtFraction(
    elevation,
    planet.waterFraction + (1 - planet.waterFraction) * planet.beachBand,
  );
  const beforeShores = biome.slice();
  for (let i = 0; i < tiles.length; i++) {
    if (beforeShores[i] === 'water' || elevation[i] > beachLine) continue;
    const coastal = tiles[i].neighbours.some(
      (n) => beforeShores[n] === 'water' && !isRiver[n],
    );
    if (coastal) biome[i] = 'sand';
  }

  // Приведённая высота суши. Верх шкалы берём не по абсолютному максимуму —
  // одна случайная вершина шума задрала бы её, и все остальные горы стали бы
  // холмами
  const peakLine = levelAtFraction(elevation, 0.985);
  const height01 = new Float32Array(tiles.length);
  const span = Math.max(peakLine - waterLine, 1e-4);
  for (let i = 0; i < tiles.length; i++) {
    if (biome[i] === 'water') continue;
    height01[i] = Math.min(Math.max((elevation[i] - waterLine) / span, 0), 1);
  }

  // Сглаживание высоты по соседям. Сырой шум даёт одиночные уступы: плитка на
  // голову выше всех вокруг, потом обрыв. Пара усреднений превращает их в
  // ровную лестницу, и склон читается склоном, а не осыпью
  for (let pass = 0; pass < Math.max(0, Math.round(planet.reliefSmoothing)); pass++) {
    const before = height01.slice();
    for (let i = 0; i < tiles.length; i++) {
      if (biome[i] === 'water') continue;
      let sum = before[i];
      let count = 1;
      for (const neighbour of tiles[i].neighbours) {
        if (biome[neighbour] === 'water') continue;
        sum += before[neighbour];
        count++;
      }
      height01[i] = before[i] * 0.45 + (sum / count) * 0.55;
    }
  }

  // Выше границы леса трава сходит на камень, ещё выше ложится снег
  for (let i = 0; i < tiles.length; i++) {
    if (biome[i] !== 'soil') continue;
    if (height01[i] >= planet.snowLine) biome[i] = 'snow';
    else if (height01[i] >= planet.rockLine) biome[i] = 'rock';
  }

  // Отмель: вода у самого берега светлее — по этой кайме читается урез воды
  const shoreWater = new Uint8Array(tiles.length);
  for (let i = 0; i < tiles.length; i++) {
    if (biome[i] !== 'water') continue;
    if (tiles[i].neighbours.some((n) => biome[n] !== 'water')) shoreWater[i] = 1;
  }

  // Середина самого большого материка. Именно она встречает зрителя: если
  // повернуть планету как попало, первый кадр с большой вероятностью придётся
  // на открытый океан
  const homeDirection = new THREE.Vector3(0, 0, 1);
  let biggest: number[] = [];
  for (const land of components(tiles, (i) => biome[i] !== 'water')) {
    if (land.length > biggest.length) biggest = land;
  }
  if (biggest.length > 0) {
    const sum = new THREE.Vector3();
    for (const index of biggest) sum.add(tiles[index].center);
    if (sum.lengthSq() > 1e-8) homeDirection.copy(sum).normalize();
  }

  // Постройки расставляются не по абсолютным направлениям, а относительно
  // главного материка: иначе рынок с равной вероятностью оказывается посреди
  // океана — там, где суши просто нет
  const east = new THREE.Vector3(0, 1, 0).cross(homeDirection);
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0).cross(homeDirection);
  east.normalize();
  const north = new THREE.Vector3().crossVectors(homeDirection, east).normalize();

  const around = (yaw: number, pitch: number) =>
    new THREE.Vector3()
      .addScaledVector(homeDirection, Math.cos(yaw) * Math.cos(pitch))
      .addScaledVector(east, Math.sin(yaw) * Math.cos(pitch))
      .addScaledVector(north, Math.sin(pitch))
      .normalize();

  const taken = new Set<number>();
  const place = (direction: THREE.Vector3, pad: number) => {
    const tile = findSite(tiles, biome, height01, direction, pad + 1, taken);
    for (const index of collectPatch(tiles, tile, pad + 1)) taken.add(index);
    return tile;
  };

  // Рынок встречает зрителя, остальные два разнесены по разные стороны шара
  const market = place(around(0.36, 0.14), planet.padRadius);
  const reactor = place(around(-2.05, 0.3), planet.padRadius);
  const observatory = place(around(2.4, -0.55), planet.padRadius);

  // Площадки: под рынком подзол, под техникой — бетон. Заодно выравниваем их
  // по высоте центральной плитки — постройка ставится в одну точку, и уступ
  // под её краем оставил бы половину зданий висеть в воздухе
  const pave = (center: number, kind: Biome) => {
    for (const index of collectPatch(tiles, center, planet.padRadius)) {
      biome[index] = kind;
      height01[index] = height01[center];
    }
  };
  pave(market, 'podzol');
  pave(reactor, 'concrete');
  pave(observatory, 'concrete');

  // Портал — не предмет на плитке, а сама плитка: у неё вместо ровного верха
  // каменная рамка и колодец. У рынка он в середине площади, у станции и
  // обсерватории — на соседней плитке, потому что центральную занимает
  // градирня или башня. Куда именно смотрит соседняя, постройка узнает потом
  // и повернётся к ней свободным боком
  const portalOf = (center: number, ownCentre: boolean) =>
    ownCentre ? center : tiles[center].neighbours[0];

  const marketPortal = portalOf(market, true);
  const reactorPortal = portalOf(reactor, false);
  const observatoryPortal = portalOf(observatory, false);
  for (const index of [marketPortal, reactorPortal, observatoryPortal]) {
    biome[index] = 'portal';
  }

  return {
    biome,
    elevation,
    waterLine,
    // Глубину меряем по самой планете, а не фиксированным числом: иначе на
    // одном зерне океан весь тёмный, на другом весь светлый
    deepLine: levelAtFraction(elevation, planet.waterFraction * 0.3),
    height01,
    shoreWater,
    homeDirection,
    landmarks: {
      market: { tile: market, portal: marketPortal },
      reactor: { tile: reactor, portal: reactorPortal },
      observatory: { tile: observatory, portal: observatoryPortal },
    },
  };
}
