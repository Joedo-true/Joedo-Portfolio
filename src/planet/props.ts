import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { seededRandom } from './noise';
import { config } from '../config';

/**
 * Мелочь, которой планета обрастает: дерево, валун, облако.
 *
 * Всё строится один раз в единичном масштабе с основанием в нуле, а размер и
 * поворот приходят из матрицы экземпляра. Шесть сегментов на конус — не
 * экономия, а стиль: гранёный силуэт читается на плитке размером в двадцать
 * пикселей, а гладкий превращается в зелёное пятно.
 */

/** Крона: три яруса конусов, общая высота ровно 1 */
export function buildTreeCrown(): THREE.BufferGeometry {
  const tiers: [number, number, number][] = [
    [0.3, 0.46, 0.37],
    [0.24, 0.42, 0.62],
    [0.17, 0.38, 0.83],
  ];
  const parts = tiers.map(([radius, height, y]) => {
    const cone = new THREE.ConeGeometry(radius, height, 6, 1);
    cone.translate(0, y, 0);
    return cone;
  });
  const merged = mergeGeometries(parts) as THREE.BufferGeometry;
  for (const part of parts) part.dispose();
  return merged;
}

/** Ствол — виден только снизу кроны, поэтому короткий и тонкий */
export function buildTreeTrunk(): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(0.045, 0.06, 0.26, 5, 1);
  trunk.translate(0, 0.13, 0);
  return trunk;
}

/**
 * Крона лиственного: два слипшихся кома. Сплошной хвойник читается как щётка,
 * поэтому в низинах между ёлками стоят круглые деревья — силуэт леса сразу
 * перестаёт быть однородным.
 */
export function buildBroadleafCrown(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const blobs: [number, number, number, number][] = [
    [0.33, 0, 0.66, 0],
    [0.24, 0.17, 0.82, -0.08],
    [0.2, -0.16, 0.79, 0.1],
  ];
  for (const [radius, x, y, z] of blobs) {
    const blob = new THREE.IcosahedronGeometry(radius, 0);
    blob.translate(x, y, z);
    parts.push(blob);
  }
  const merged = mergeGeometries(parts) as THREE.BufferGeometry;
  for (const part of parts) part.dispose();
  return merged;
}

/** Ствол лиственного повыше — под круглой кроной он виден */
export function buildBroadleafTrunk(): THREE.BufferGeometry {
  const trunk = new THREE.CylinderGeometry(0.04, 0.055, 0.5, 5, 1);
  trunk.translate(0, 0.25, 0);
  return trunk;
}

/** Валун: двадцатигранник, посаженный основанием в ноль */
export function buildBoulder(): THREE.BufferGeometry {
  const rock = new THREE.IcosahedronGeometry(0.5, 0);
  rock.translate(0, 0.34, 0);
  return rock;
}

/**
 * Облако — горсть слипшихся шаров.
 *
 * Три вещи отличают кучевое облако от грозди шариков, и все три здесь есть:
 * плоское основание (шары сажаются низами на одну плоскость, а не по центрам),
 * шапка (к середине облака шары крупнее, к краям мельче) и вытянутость вдоль
 * ветра. Сглаженное затенение вместо гранёного: облако — единственное в кадре,
 * что не должно выглядеть высеченным.
 */
export function buildCloud(seed: number): THREE.BufferGeometry {
  const random = seededRandom(seed);
  const puffs: THREE.BufferGeometry[] = [];
  const count = 7 + Math.floor(random() * 4);

  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2;
    const away = Math.pow(random(), 0.65);
    const x = Math.cos(angle) * away * 1.05;
    const z = Math.sin(angle) * away * 0.5;
    // Крупные шары в середине, мелкие по краям — отсюда и форма шапки
    const radius = 0.3 + (1 - away) * 0.4 + random() * 0.08;

    const puff = new THREE.IcosahedronGeometry(radius, 2);
    // Низ на общей плоскости: у кучевого облака основание плоское
    puff.translate(x, radius * 0.82, z);
    puffs.push(puff);
  }

  const merged = mergeGeometries(puffs) as THREE.BufferGeometry;
  for (const puff of puffs) puff.dispose();
  merged.translate(0, -0.42, 0);
  merged.computeVertexNormals();
  return merged;
}

/**
 * Птица: галочка из двух крыльев. Взмах делается сжатием по вертикали прямо
 * в матрице экземпляра, поэтому вся стая — один вызов отрисовки.
 */
export function buildBird(): THREE.BufferGeometry {
  const wings: THREE.BufferGeometry[] = [];
  for (const side of [-1, 1]) {
    const wing = new THREE.BoxGeometry(0.5, 0.07, 0.16);
    wing.translate(side * 0.26, 0.06, 0);
    wing.rotateZ(side * -0.42);
    wings.push(wing);
  }
  const merged = mergeGeometries(wings) as THREE.BufferGeometry;
  for (const wing of wings) wing.dispose();
  return merged;
}

/**
 * Облачный слой над планетой. Стоит выше самой высокой вершины — иначе облака
 * протыкаются горами насквозь.
 */
export function buildCloudLayer(): THREE.Group {
  const group = new THREE.Group();
  const clouds = config.clouds;
  const random = seededRandom(config.planet.seed + 9157);
  const variants = [11, 29, 47, 83, 131, 197].map((seed) => buildCloud(seed));
  const material = new THREE.MeshLambertMaterial({
    color: new THREE.Color(config.palette.cloud),
    transparent: clouds.opacity < 1,
    opacity: clouds.opacity,
  });

  const up = new THREE.Vector3(0, 1, 0);
  const count = Math.max(0, Math.round(clouds.count));
  for (let i = 0; i < count; i++) {
    // Широта через косинус, иначе облака скучиваются у полюсов
    const z = random() * 2 - 1;
    const ring = Math.sqrt(Math.max(1 - z * z, 0));
    const angle = random() * Math.PI * 2;
    const direction = new THREE.Vector3(Math.cos(angle) * ring, z, Math.sin(angle) * ring);

    const mesh = new THREE.Mesh(variants[i % variants.length], material);
    mesh.position.copy(direction).multiplyScalar(clouds.radius + random() * clouds.spread);
    mesh.quaternion.setFromUnitVectors(up, direction);
    mesh.rotateY(random() * Math.PI * 2);
    const size = (0.03 + random() * 0.03) * clouds.scale;
    // Чуть разной вытянутости: одинаковые силуэты выдают штамповку
    mesh.scale.set(size * (0.9 + random() * 0.35), size * (0.75 + random() * 0.3), size);
    group.add(mesh);
  }

  return group;
}

/** Ореол атмосферы: свечение по краю диска, снаружи внутрь */
export function buildAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(config.palette.atmosphere) },
      uStrength: { value: config.atmosphere.strength },
      uPower: { value: config.atmosphere.power },
      uInner: { value: 0.3 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      uniform float uPower;
      uniform float uInner;
      varying vec3 vNormal;
      varying vec3 vView;

      void main() {
        // rim растёт от нуля в центре диска до единицы у силуэта оболочки.
        // Планета закрывает всё до uInner, поэтому воздух виден в полосе
        // uInner..1 — и свечение должно быть ярче всего у ВНУТРЕННЕЙ границы
        // этой полосы, у самого края планеты, гаснув наружу. Если гнать его
        // просто по rim, максимум окажется на силуэте оболочки, и вокруг
        // планеты повиснет обруч — ровно то, чем это и выглядело
        float rim = clamp(1.0 - abs(dot(vNormal, vView)), 0.0, 1.0);
        float away = clamp((rim - uInner) / max(1.0 - uInner, 1e-3), 0.0, 1.0);
        float glow = pow(1.0 - away, uPower) * uStrength;
        gl_FragColor = vec4(uColor * glow, glow);
        #include <colorspace_fragment>
      }
    `,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}
