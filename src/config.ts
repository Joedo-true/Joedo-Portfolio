/**
 * Все настраиваемые параметры сайта в одном месте.
 *
 * Значения выставлены наружу двумя способами сразу, потому что расширения для
 * живой правки читают разное:
 *
 *   1. CSS-переменные на :root — `--loader-streak-count`, `--planet-sea-level`
 *      и так далее. Имя получается из пути в объекте: loader.streakCount →
 *      --loader-streak-count.
 *   2. Глобальный объект `window.SITE_CONFIG` — та же структура, обычные числа
 *      и строки.
 *
 * Правка любой из двух поверхностей подхватывается на ходу: значения
 * перечитываются пять раз в секунду, перезагружать страницу не нужно.
 * Параметры, помеченные `rebuild`, требуют пересборки планеты — они меняются
 * только при перезагрузке, потому что от них зависит сама геометрия.
 */

export interface Config {
  loader: {
    /** Минимальная длительность экрана загрузки, мс. Сборка планеты обычно
     *  успевает раньше, а эффект разгона должен успеть прочитаться */
    minDurationMs: number;
    /** Сколько полос живёт на экране одновременно */
    streakCount: number;
    /** Доля экрана в секунду */
    streakSpeed: number;
    streakLengthMin: number;
    streakLengthMax: number;
    streakWidth: number;
    /** Откуда полосы стартуют, доля половины меньшей стороны экрана */
    streakInnerRadius: number;
    /** Частота мерцания, Гц */
    flickerHz: number;
    /** Насколько глубоко мерцание гасит полосу, 0..1 */
    flickerDepth: number;
    /** Радиус чёрного круга, доля меньшей стороны экрана */
    discRadius: number;
    /** Мягкость окантовки круга, 0..1 */
    discFeather: number;
  };
  entry: {
    /** «Резкая остановка»: за сколько полосы тормозят в точки */
    durationMs: number;
    /** Насколько планета проскакивает свой размер перед тем, как осесть */
    overshoot: number;
    /** Во сколько раз планета меньше в начале «остановки», чем в конце */
    approachFrom: number;
  };
  stars: {
    count: number;
    /** Радиус звёздной сферы в радиусах планеты */
    radius: number;
    /** Размер звезды в css-пикселях */
    sizeMin: number;
    sizeMax: number;
    brightness: number;
  };
  planet: {
    /** rebuild. Частота геодезической сетки: плиток ≈ 10·f²+2 */
    frequency: number;
    /** rebuild */
    seed: number;
    /** rebuild. Доля планеты под водой. У Земли 0.71 */
    waterFraction: number;
    /** rebuild. Масштаб материков: меньше — крупнее материки */
    continentScale: number;
    /** rebuild. Масштаб искажения берега */
    warpScale: number;
    /** rebuild. Сила искажения: 0 — гладкие овалы, много — рваные архипелаги */
    warpStrength: number;
    /** rebuild. Масштаб мелкого рельефа */
    detailScale: number;
    /** rebuild. Вклад мелкого рельефа в высоту */
    detailStrength: number;
    /** rebuild. Какая доля суши по высоте может стать пляжем, 0..1 */
    beachBand: number;
    /** rebuild. Водоёмы мельче этого числа плиток засыпаются */
    lakeMinTiles: number;
    /** rebuild. Острова мельче этого числа плиток затапливаются */
    islandMinTiles: number;
    /** rebuild. Сколько рек пробуем провести */
    riverCount: number;
    /** rebuild. Короткие ручьи не в счёт */
    riverMinLength: number;
    /** rebuild. Радиус площадки под постройками, шагов по плиткам */
    padRadius: number;
    /** rebuild. Зазор между плитками, 1 — вплотную */
    tileGap: number;
    /** rebuild. Насколько суша поднята над водой */
    landLift: number;
    /** rebuild. Насколько песок поднят над водой */
    sandLift: number;
    /** rebuild. Толщина плитки */
    tileDepth: number;
    /** Скорость собственного вращения, рад/с */
    spinSpeed: number;
    /** Наклон оси, градусы — как у Земли */
    tiltDeg: number;
  };
  camera: {
    fov: number;
    /** Доля ширины экрана, которую занимает планета на главном экране */
    idleWidthFraction: number;
    /** Предохранитель: доля высоты экрана, которую планета не переходит.
     *  На широком мониторе 60% ширины — это больше высоты окна, и планету
     *  срезало бы сверху и снизу. Поставьте 99, чтобы отключить */
    idleMaxHeightFraction: number;
    /** То же после приближения */
    zoomWidthFraction: number;
    /** Вблизи планета намеренно выходит за края по вертикали */
    zoomMaxHeightFraction: number;
    zoomDurationMs: number;
    /** Чувствительность вращения мышью */
    dragSensitivity: number;
    /** Затухание инерции после отпускания, 0..1 */
    dragInertia: number;
    /** Предел наклона планеты мышью, радианы */
    dragMaxPitch: number;
  };
  palette: {
    water: string;
    waterDeep: string;
    sand: string;
    soil: string;
    soilHigh: string;
    /** Подзол под рынком — чуть темнее песка */
    podzol: string;
    /** Технический грунт под АЭС и обсерваторией */
    concrete: string;
    structureLight: string;
    structureDark: string;
    structureAccent: string;
    star: string;
  };
}

export const config: Config = {
  loader: {
    minDurationMs: 2600,
    streakCount: 280,
    streakSpeed: 2.4,
    streakLengthMin: 0.05,
    streakLengthMax: 0.34,
    streakWidth: 1.4,
    streakInnerRadius: 0.055,
    flickerHz: 24,
    flickerDepth: 0.72,
    discRadius: 0.085,
    discFeather: 0.6,
  },
  entry: {
    durationMs: 1400,
    overshoot: 1.05,
    approachFrom: 2.8,
  },
  stars: {
    count: 3200,
    radius: 46,
    sizeMin: 1,
    sizeMax: 2.6,
    brightness: 1,
  },
  planet: {
    frequency: 16,
    seed: 20240815,
    waterFraction: 0.62,
    continentScale: 1.05,
    warpScale: 1.9,
    warpStrength: 0.24,
    detailScale: 3.2,
    detailStrength: 0.06,
    beachBand: 0.38,
    lakeMinTiles: 5,
    islandMinTiles: 3,
    riverCount: 12,
    riverMinLength: 5,
    padRadius: 2,
    tileGap: 0.95,
    landLift: 0.013,
    sandLift: 0.006,
    tileDepth: 0.016,
    spinSpeed: 0.022,
    tiltDeg: 23.4,
  },
  camera: {
    fov: 38,
    idleWidthFraction: 0.6,
    idleMaxHeightFraction: 0.86,
    zoomWidthFraction: 0.9,
    zoomMaxHeightFraction: 1.7,
    zoomDurationMs: 1500,
    dragSensitivity: 0.0042,
    dragInertia: 0.93,
    dragMaxPitch: 1.05,
  },
  palette: {
    water: '#2a6fb0',
    waterDeep: '#1d4f85',
    sand: '#d8c07a',
    soil: '#4e8a45',
    soilHigh: '#3d6f37',
    podzol: '#bfa062',
    concrete: '#a9abaf',
    structureLight: '#d9dade',
    structureDark: '#4a4d52',
    structureAccent: '#b4553f',
    star: '#ffffff',
  },
};

/** Параметры, от которых зависит сама геометрия: меняются только с перезагрузкой */
export const REBUILD_KEYS = new Set([
  'planet.frequency',
  'planet.seed',
  'planet.waterFraction',
  'planet.continentScale',
  'planet.warpScale',
  'planet.warpStrength',
  'planet.detailScale',
  'planet.detailStrength',
  'planet.beachBand',
  'planet.lakeMinTiles',
  'planet.islandMinTiles',
  'planet.riverCount',
  'planet.riverMinLength',
  'planet.padRadius',
  'planet.tileGap',
  'planet.landLift',
  'planet.sandLift',
  'planet.tileDepth',
]);

type Leaf = { path: string; cssVar: string; group: Record<string, unknown>; key: string };

/** loader.streakCount → --loader-streak-count */
function toCssVar(path: string) {
  return `--${path.replace(/\./g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

function collectLeaves(source: Record<string, unknown>, prefix = ''): Leaf[] {
  const leaves: Leaf[] = [];
  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      leaves.push(...collectLeaves(value as Record<string, unknown>, path));
    } else {
      leaves.push({ path, cssVar: toCssVar(path), group: source, key });
    }
  }
  return leaves;
}

const leaves = collectLeaves(config as unknown as Record<string, unknown>);

declare global {
  interface Window {
    SITE_CONFIG?: Config;
  }
}

/**
 * Публикует значения в обе поверхности правки и начинает следить за ними.
 * Возвращает функцию остановки.
 */
export function startConfigBridge(): () => void {
  const root = document.documentElement;

  // Что мы в последний раз считали действующим значением. Без этой памяти
  // синхронизация односторонняя: опрос каждые 200 мс затирал бы правку в
  // window.SITE_CONFIG значением из CSS-переменной, и работала бы только одна
  // из двух поверхностей. Сравнение с запомненным показывает, какую сторону
  // тронули, — она и главная
  const known = new Map<string, string>();
  const reported = new Set<string>();

  for (const leaf of leaves) {
    const value = String(leaf.group[leaf.key]);
    root.style.setProperty(leaf.cssVar, value);
    known.set(leaf.cssVar, value);
  }
  window.SITE_CONFIG = config;

  const poll = () => {
    const computed = getComputedStyle(root);
    for (const leaf of leaves) {
      const raw = computed.getPropertyValue(leaf.cssVar).trim();
      const current = String(leaf.group[leaf.key]);
      const seen = known.get(leaf.cssVar);

      if (raw && raw !== seen) {
        // Правили CSS-переменную
        if (typeof leaf.group[leaf.key] === 'number') {
          const next = Number.parseFloat(raw);
          if (!Number.isFinite(next)) continue;
          leaf.group[leaf.key] = next;
        } else {
          leaf.group[leaf.key] = raw;
        }
        known.set(leaf.cssVar, raw);

        // Иначе правка выглядит как «ничего не произошло»: значение принято,
        // но геометрия планеты собрана один раз при загрузке
        if (REBUILD_KEYS.has(leaf.path) && !reported.has(leaf.path)) {
          reported.add(leaf.path);
          console.info(
            `[config] ${leaf.path} задаёт саму геометрию планеты — обновите страницу, чтобы увидеть изменение`,
          );
        }
      } else if (current !== seen) {
        // Правили сам объект — выносим значение наружу
        root.style.setProperty(leaf.cssVar, current);
        known.set(leaf.cssVar, current);
      }
    }
  };

  const id = window.setInterval(poll, 200);
  return () => window.clearInterval(id);
}
