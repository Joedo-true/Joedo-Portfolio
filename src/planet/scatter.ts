import * as THREE from 'three';
import { Noise3D, seededRandom } from './noise';
import type { HexTile } from './hexSphere';
import type { Terrain } from './terrain';
import { config } from '../config';

/**
 * Что стоит на плитках: леса и валуны.
 *
 * Деревья не рассыпаны равномерно — густота берётся из отдельного поля шума,
 * поэтому лес растёт пятнами, между которыми остаются луга. Равномерная посадка
 * читается как газон, а не как лес: это ровно та разница, из-за которой планета
 * выглядит либо живой, либо покрытой ворсом.
 *
 * Всё детерминировано: положение каждого дерева выводится из зерна и номера
 * плитки, Math.random здесь нет.
 */

export interface InstanceSet {
  /** По 16 чисел на экземпляр — готовая матрица для InstancedMesh */
  matrices: Float32Array;
  /** По 3 числа на экземпляр; у валунов пусто */
  colors: Float32Array;
  count: number;
}

export interface Scatter {
  conifers: InstanceSet;
  broadleaf: InstanceSet;
  rocks: InstanceSet;
}

const UP = new THREE.Vector3(0, 1, 0);

/** Точка на верхней грани плитки со сдвигом от центра */
function pointOnTile(
  tile: HexTile,
  radius: number,
  distance: number,
  angle: number,
  target: THREE.Vector3,
) {
  const tangent = new THREE.Vector3(0, 0, 1).cross(tile.center);
  if (tangent.lengthSq() < 1e-8) tangent.set(1, 0, 0).cross(tile.center);
  tangent.normalize();
  const bitangent = new THREE.Vector3().crossVectors(tile.center, tangent);

  target
    .copy(tile.center)
    .addScaledVector(tangent, Math.cos(angle) * distance)
    .addScaledVector(bitangent, Math.sin(angle) * distance)
    .normalize()
    .multiplyScalar(radius);
  return target;
}

export function scatterProps(
  tiles: HexTile[],
  terrain: Terrain,
  topRadius: Float32Array,
): Scatter {
  const flora = config.flora;
  const planet = config.planet;

  const forest = new Noise3D(planet.seed + 4409);

  const coniferMatrices: number[] = [];
  const coniferColors: number[] = [];
  const broadleafMatrices: number[] = [];
  const broadleafColors: number[] = [];
  const rockMatrices: number[] = [];

  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const spin = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const dark = new THREE.Color(config.palette.treeDark);
  const light = new THREE.Color(config.palette.treeLight);
  const tint = new THREE.Color();

  const push = (into: number[], stride: THREE.Matrix4) => {
    for (let k = 0; k < 16; k++) into.push(stride.elements[k]);
  };

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const biome = terrain.biome[i];
    if (biome === 'water' || biome === 'podzol' || biome === 'concrete') continue;

    const random = seededRandom(planet.seed + i * 2654435761);
    const unit = tile.corners[0].distanceTo(tile.center);
    const height = terrain.height01[i];
    const surface = topRadius[i];

    // ── лес ────────────────────────────────────────────────────────────────
    if (biome === 'soil' && height < flora.treeLine) {
      const { x, y, z } = tile.center;
      const s = flora.forestScale;
      const patch = forest.fbm(x * s, y * s, z * s, 3);
      // Порог сдвинут так, что примерно треть суши остаётся безлесной
      let density = THREE.MathUtils.clamp((patch + 0.1) / 0.4, 0, 1);
      // К границе леса деревья редеют, а не обрываются линейкой
      density *= 1 - THREE.MathUtils.smoothstep(height, flora.treeLine - 0.18, flora.treeLine);

      const expected = density * flora.treePerTile * flora.treeDensity;
      let count = Math.floor(expected);
      if (random() < expected - count) count++;

      for (let k = 0; k < count; k++) {
        // sqrt даёт равномерное заполнение круга: без него всё сбивается в центр
        const distance = Math.sqrt(random()) * unit * 0.62;
        pointOnTile(tile, surface, distance, random() * Math.PI * 2, position);
        normal.copy(position).normalize();

        quaternion.setFromUnitVectors(UP, normal);
        spin.setFromAxisAngle(UP, random() * Math.PI * 2);
        quaternion.multiply(spin);

        const size = unit * flora.treeScale * (0.72 + random() * 0.62);
        scale.set(size, size * (0.85 + random() * 0.45), size);
        matrix.compose(position, quaternion, scale);

        // Круглые деревья держатся низин: выше по склону лес становится
        // сплошь хвойным, как оно и бывает
        const roundChance = 0.45 * (1 - THREE.MathUtils.smoothstep(height, 0.12, 0.45));
        const round = random() < roundChance;
        push(round ? broadleafMatrices : coniferMatrices, matrix);

        tint.copy(dark).lerp(light, round ? 0.35 + random() * 0.5 : random() * random());
        (round ? broadleafColors : coniferColors).push(tint.r, tint.g, tint.b);
      }
    }

    // ── валуны ─────────────────────────────────────────────────────────────
    const stony = biome === 'rock' || biome === 'snow';
    const chance = flora.rockChance * (stony ? 1 : 0.22);
    if (random() < chance) {
      const distance = Math.sqrt(random()) * unit * 0.5;
      pointOnTile(tile, surface, distance, random() * Math.PI * 2, position);
      normal.copy(position).normalize();

      quaternion.setFromUnitVectors(UP, normal);
      spin.setFromAxisAngle(UP, random() * Math.PI * 2);
      quaternion.multiply(spin);

      const size = unit * flora.rockScale * (0.3 + random() * 0.4);
      scale.set(size * (0.8 + random() * 0.5), size * (0.6 + random() * 0.5), size);
      matrix.compose(position, quaternion, scale);
      push(rockMatrices, matrix);
    }
  }

  const set = (matrices: number[], colors: number[]): InstanceSet => ({
    matrices: new Float32Array(matrices),
    colors: new Float32Array(colors),
    count: matrices.length / 16,
  });

  return {
    conifers: set(coniferMatrices, coniferColors),
    broadleaf: set(broadleafMatrices, broadleafColors),
    rocks: set(rockMatrices, []),
  };
}
