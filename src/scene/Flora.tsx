import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { config } from '../config';
import type { PlanetData } from '../planet/buildPlanet';
import {
  buildBoulder,
  buildBroadleafCrown,
  buildBroadleafTrunk,
  buildTreeCrown,
  buildTreeTrunk,
} from '../planet/props';
import type { InstanceSet } from '../planet/scatter';

/**
 * Леса и валуны одним инстансингом.
 *
 * Тысячи деревьев — это пять вызовов отрисовки: кроны и стволы двух пород да
 * камни. Матрицы посчитаны заранее при сборке планеты, здесь они только
 * перекладываются в атрибуты; крона к тому же красится поэкземплярно, поэтому
 * лес не выглядит покрашенным одной банкой.
 */

interface FloraProps {
  data: PlanetData;
}

export function Flora({ data }: FloraProps) {
  const meshes = useMemo(() => {
    const { conifers, broadleaf, rocks } = data.scatter;

    // Материал кроны белый: цвет приходит из instanceColor и умножается на него
    const leafMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const trunkMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(config.palette.trunk),
      flatShading: true,
    });
    const boulderMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(config.palette.boulder),
      flatShading: true,
    });

    const build = (
      geometry: THREE.BufferGeometry,
      material: THREE.Material,
      set: InstanceSet,
      tinted: boolean,
    ) => {
      if (set.count === 0) {
        geometry.dispose();
        return null;
      }
      const mesh = new THREE.InstancedMesh(geometry, material, set.count);
      mesh.instanceMatrix.array.set(set.matrices);
      mesh.instanceMatrix.needsUpdate = true;
      if (tinted && set.colors.length > 0) {
        mesh.instanceColor = new THREE.InstancedBufferAttribute(set.colors, 3);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Экземпляры раскиданы по всей сфере, общая оболочка ничего не отсечёт
      mesh.frustumCulled = false;
      return mesh;
    };

    const built: THREE.InstancedMesh[] = [];
    for (const mesh of [
      build(buildTreeCrown(), leafMaterial, conifers, true),
      build(buildTreeTrunk(), trunkMaterial, conifers, false),
      build(buildBroadleafCrown(), leafMaterial, broadleaf, true),
      build(buildBroadleafTrunk(), trunkMaterial, broadleaf, false),
      build(buildBoulder(), boulderMaterial, rocks, false),
    ]) {
      if (mesh) built.push(mesh);
    }
    return built;
  }, [data]);

  useEffect(
    () => () => {
      const materials = new Set<THREE.Material>();
      for (const mesh of meshes) {
        mesh.geometry.dispose();
        const used = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const item of used) materials.add(item);
        mesh.dispose();
      }
      for (const material of materials) material.dispose();
    },
    [meshes],
  );

  return (
    <>
      {meshes.map((mesh) => (
        <primitive key={mesh.uuid} object={mesh} />
      ))}
    </>
  );
}
