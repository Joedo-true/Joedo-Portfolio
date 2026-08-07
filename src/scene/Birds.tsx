import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { config } from '../config';
import { buildBird } from '../planet/props';
import { seededRandom } from '../planet/noise';
import { useReducedMotion } from '../reducedMotion';

/**
 * Стаи над планетой.
 *
 * Каждая стая идёт по своему большому кругу: у круга есть ось, а птицы
 * расставлены вдоль него со сдвигом по фазе и небольшим разбросом вбок и по
 * высоте — строй, а не цепочка. Крылья машут сжатием матрицы по вертикали,
 * так что вся стая рисуется одним вызовом.
 */

interface Flight {
  /** Базис большого круга: птица идёт из `along` в `side` */
  along: THREE.Vector3;
  side: THREE.Vector3;
  phase: number;
  /** Сдвиги отдельной птицы внутри строя */
  offsets: { lead: number; drift: number; lift: number; flap: number }[];
}

export function Birds() {
  const reduced = useReducedMotion();

  const { mesh, flights } = useMemo(() => {
    const birds = config.birds;
    const flockCount = Math.max(0, Math.round(birds.flocks));
    const perFlock = Math.max(1, Math.round(birds.perFlock));
    const total = flockCount * perFlock;

    const geometry = buildBird();
    const material = new THREE.MeshBasicMaterial({ color: 0xf4f6fb });
    const instanced = new THREE.InstancedMesh(geometry, material, Math.max(total, 1));
    instanced.frustumCulled = false;
    instanced.count = total;

    const random = seededRandom(config.planet.seed + 6421);
    const list: Flight[] = [];

    for (let f = 0; f < flockCount; f++) {
      // Ось круга — случайное направление; из неё выводится плоскость полёта
      const z = random() * 2 - 1;
      const ring = Math.sqrt(Math.max(1 - z * z, 0));
      const angle = random() * Math.PI * 2;
      const axis = new THREE.Vector3(Math.cos(angle) * ring, z, Math.sin(angle) * ring).normalize();

      const along = new THREE.Vector3(0, 1, 0).cross(axis);
      if (along.lengthSq() < 1e-6) along.set(1, 0, 0).cross(axis);
      along.normalize();
      const side = new THREE.Vector3().crossVectors(axis, along).normalize();

      const offsets = [];
      for (let i = 0; i < perFlock; i++) {
        offsets.push({
          lead: i * 0.012 + random() * 0.004,
          drift: (i % 2 === 0 ? 1 : -1) * (0.5 + i * 0.35) * 0.012,
          lift: (random() - 0.5) * 0.03,
          flap: random() * Math.PI * 2,
        });
      }

      list.push({ along, side, phase: random() * Math.PI * 2, offsets });
    }

    return { mesh: instanced, flights: list };
  }, []);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      mesh.dispose();
    },
    [mesh],
  );

  useFrame((state) => {
    const birds = config.birds;
    const time = reduced ? 0 : state.clock.elapsedTime;

    const position = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const up = new THREE.Vector3();
    const basis = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const matrix = new THREE.Matrix4();

    let index = 0;
    for (const flight of flights) {
      for (const bird of flight.offsets) {
        const t = flight.phase + time * birds.speed + bird.lead;
        const radius = birds.radius + bird.lift;

        position
          .copy(flight.along)
          .multiplyScalar(Math.cos(t))
          .addScaledVector(flight.side, Math.sin(t))
          .normalize();
        // Сдвиг вбок от линии полёта — иначе стая идёт гуськом
        position.addScaledVector(
          new THREE.Vector3().crossVectors(flight.along, flight.side),
          bird.drift,
        );
        position.normalize().multiplyScalar(radius);

        // Нос по касательной к кругу, спина — наружу от планеты
        forward
          .copy(flight.along)
          .multiplyScalar(-Math.sin(t))
          .addScaledVector(flight.side, Math.cos(t))
          .normalize();
        up.copy(position).normalize();
        const right = new THREE.Vector3().crossVectors(up, forward).normalize();
        up.crossVectors(forward, right).normalize();
        basis.makeBasis(right, up, forward);
        quaternion.setFromRotationMatrix(basis);

        const size = 0.012 * birds.scale;
        const flap = 0.45 + 0.85 * (0.5 + 0.5 * Math.sin(time * birds.flapHz * 6.28 + bird.flap));
        scale.set(size, size * flap, size);

        matrix.compose(position, quaternion, scale);
        mesh.setMatrixAt(index, matrix);
        index++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <primitive object={mesh} />;
}
