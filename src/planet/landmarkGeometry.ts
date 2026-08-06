import * as THREE from 'three';
import { config } from '../config';

/**
 * Три рукотворных объекта на поверхности: рынок, АЭС и обсерватория.
 *
 * Общий язык у всех трёх: только коробки, цилиндры и конусы, плоское
 * затенение, три материала на всё — светлые стены, тёмные детали, один
 * акцент. Ничего круглее двадцати сегментов: объекты видны размером в
 * несколько плиток, и лишняя геометрия туда всё равно не прочитается.
 *
 * Всё строится в локальной системе, где +Y — наружу от планеты, а единица
 * `unit` равна радиусу плитки. Планета маленькая, и объект шириной в шесть
 * плиток заметно выгибается вместе с поверхностью — поэтому каждая постройка
 * ставится не в касательную плоскость, а прямо на сферу (`seat`). Без этого
 * крайние лавки рынка висели бы над землёй на треть своей высоты.
 */

function materials() {
  const light = new THREE.MeshLambertMaterial({
    color: new THREE.Color(config.palette.structureLight),
    flatShading: true,
  });
  const dark = new THREE.MeshLambertMaterial({
    color: new THREE.Color(config.palette.structureDark),
    flatShading: true,
  });
  const accent = new THREE.MeshLambertMaterial({
    color: new THREE.Color(config.palette.structureAccent),
    flatShading: true,
  });
  return { light, dark, accent };
}

function box(
  material: THREE.Material,
  size: [number, number, number],
  position: [number, number, number],
  rotationY = 0,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.y = rotationY;
  return mesh;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Сажает часть постройки на сферу: смещение (x, z) отсчитывается по
 * поверхности, а не по касательной, и объект доворачивается по местной нормали.
 *
 * Возвращается обёртка, а не сам объект: собственные сдвиг и поворот детали
 * должны остаться при ней. Крыша знает только, что лежит на высоте своего
 * корпуса, и это знание нельзя затирать посадкой на сферу.
 */
function seat(child: THREE.Object3D, x: number, z: number, radius: number): THREE.Group {
  const pivot = new THREE.Group();
  const along = Math.hypot(x, z);

  if (along > 1e-9) {
    const angle = along / radius;
    const sin = Math.sin(angle);
    const normal = new THREE.Vector3((x / along) * sin, Math.cos(angle), (z / along) * sin);
    pivot.position.copy(normal).multiplyScalar(radius);
    pivot.position.y -= radius;
    pivot.quaternion.setFromUnitVectors(UP, normal);
  }

  pivot.add(child);
  return pivot;
}

/** Рынок: семь лавок в два ряда — прилавок, четыре стойки и двускатный навес */
export function buildMarket(unit: number, radius: number): THREE.Group {
  const { light, dark, accent } = materials();
  const group = new THREE.Group();

  const stall = (turn: number) => {
    const one = new THREE.Group();
    const width = unit * 1.35;
    const depth = unit * 0.95;

    one.add(box(light, [width, unit * 0.42, depth], [0, unit * 0.21, 0]));
    const postX = width * 0.42;
    const postZ = depth * 0.34;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        one.add(
          box(dark, [unit * 0.1, unit * 0.85, unit * 0.1], [sx * postX, unit * 0.63, sz * postZ]),
        );
      }
    }

    // Навес двускатный и уже прилавка. Плоская крыша во всю ширину, а смотрят
    // на рынок сверху, слилась бы с соседними в сплошную полосу; конёк и
    // выступающие из-под него углы прилавка читаются как отдельная лавка
    for (const side of [-1, 1]) {
      const slope = box(
        accent,
        [width * 0.86, unit * 0.08, depth * 0.72],
        [0, unit * 1.08, side * depth * 0.29],
      );
      slope.rotation.x = side * 0.62;
      one.add(slope);
    }

    one.rotation.y = turn;
    return one;
  };

  const step = unit * 1.95;
  const row = unit * 1.35;
  const layout: [number, number, number][] = [
    [-step, -row, 0.05],
    [0, -row, -0.08],
    [step, -row, 0.12],
    [-step * 1.5, row, 0.3],
    [-step * 0.5, row, 0.22],
    [step * 0.5, row, 0.34],
    [step * 1.5, row, 0.18],
  ];
  for (const [x, z, turn] of layout) group.add(seat(stall(turn), x, z, radius));

  return group;
}

/**
 * АЭС: одна большая градирня с пережимом посередине и три технических
 * корпуса рядом. Профиль градирни задан ломаной и раскручен вокруг оси —
 * цилиндром такой силуэт не получить.
 */
export function buildReactor(
  unit: number,
  radius: number,
): { group: THREE.Group; steam: THREE.Group; towerHeight: number } {
  const { light, dark } = materials();
  const group = new THREE.Group();

  const height = unit * 3.4;
  // Силуэт градирни: широкое основание, пережим на двух третях высоты и
  // раструб к устью. Цилиндром или конусом это не передать
  const waistAt = (t: number) =>
    t <= 0.72
      ? 0.62 + 0.38 * Math.pow((0.72 - t) / 0.72, 1.7)
      : 0.62 + 0.26 * Math.pow((t - 0.72) / 0.28, 1.4);

  const profile: THREE.Vector2[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    profile.push(new THREE.Vector2(unit * 1.15 * waistAt(t), t * height));
  }
  const tower = new THREE.Mesh(new THREE.LatheGeometry(profile, 22), light);
  group.add(tower);

  // Обод точно по устью: шире — и получится воронка вместо градирни
  const mouth = unit * 1.15 * waistAt(1);
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(mouth * 1.04, mouth * 1.04, unit * 0.14, 22, 1, true),
    dark,
  );
  rim.position.y = height - unit * 0.04;
  group.add(rim);

  const hall = box(light, [unit * 1.7, unit * 0.9, unit * 1.1], [0, unit * 0.45, 0]);
  const hallRoof = box(dark, [unit * 1.8, unit * 0.12, unit * 1.2], [0, unit * 0.96, 0]);
  const hallBlock = new THREE.Group();
  hallBlock.add(hall, hallRoof);
  group.add(seat(hallBlock, unit * 2.5, unit * 0.4, radius));

  const shed = box(light, [unit * 0.95, unit * 0.62, unit * 0.95], [0, unit * 0.31, 0], 0.4);
  group.add(seat(shed, unit * 1.7, -unit * 1.8, radius));

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(unit * 0.66, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    light,
  );
  group.add(seat(dome, -unit * 2.1, unit * 1.05, radius));

  // Пар: несколько клубов, которые компонент сцены поднимает и растворяет.
  // Материал у каждого свой — иначе не выставить им разную прозрачность.
  const steam = new THREE.Group();
  const puffGeometry = new THREE.IcosahedronGeometry(unit * 0.5, 1);
  for (let i = 0; i < 5; i++) {
    // Материал без освещения: затенённый пар у края планеты выходит тёмным
    // и читается на чёрном небе как грязь, а не как пар
    const puff = new THREE.Mesh(
      puffGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    puff.position.y = height;
    steam.add(puff);
  }
  group.add(steam);

  return { group, steam, towerHeight: height };
}

/** Обсерватория: телескоп на вилочной опоре и лабораторный корпус с куполом */
export function buildObservatory(unit: number, radius: number): THREE.Group {
  const { light, dark } = materials();
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(unit * 0.95, unit * 1.15, unit * 0.45, 18),
    dark,
  );
  base.position.y = unit * 0.22;
  group.add(base);

  for (const sx of [-1, 1]) {
    group.add(box(light, [unit * 0.2, unit * 1.2, unit * 0.2], [sx * unit * 0.58, unit * 1.05, 0]));
  }

  // Труба телескопа: наклонена к небу, чтобы силуэт читался с орбиты
  const tube = new THREE.Group();
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(unit * 0.42, unit * 0.5, unit * 2.4, 18),
    light,
  );
  barrel.rotation.z = Math.PI / 2;
  tube.add(barrel);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(unit * 0.52, unit * 0.52, unit * 0.16, 18),
    dark,
  );
  cap.rotation.z = Math.PI / 2;
  cap.position.x = unit * 1.2;
  tube.add(cap);
  tube.position.y = unit * 1.65;
  tube.rotation.z = -0.62;
  group.add(tube);

  const lab = new THREE.Group();
  lab.add(box(light, [unit * 1.9, unit * 0.8, unit * 1.3], [0, unit * 0.4, 0]));
  lab.add(box(dark, [unit * 2, unit * 0.1, unit * 1.4], [0, unit * 0.85, 0]));
  const labDome = new THREE.Mesh(
    new THREE.SphereGeometry(unit * 0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    light,
  );
  labDome.position.set(unit * 0.35, unit * 0.88, 0);
  lab.add(labDome);
  group.add(seat(lab, unit * 2.6, unit * 0.7, radius));

  return group;
}

/** Ставит объект на плитку: местная ось +Y смотрит наружу планеты */
export function orientOnSphere(object: THREE.Object3D, center: THREE.Vector3, radius: number) {
  object.position.copy(center).multiplyScalar(radius);
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), center.clone().normalize());
}
