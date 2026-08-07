import { useEffect } from 'react';
import { config, startConfigBridge } from './config';
import { buildPlanet } from './planet/buildPlanet';
import { useAppStore } from './state/useAppStore';
import { Scene } from './scene/Scene';
import { LoadingScreen } from './ui/LoadingScreen';
import { BackButton } from './ui/BackButton';

export default function App() {
  const phase = useAppStore((state) => state.phase);

  useEffect(() => {
    const stopBridge = startConfigBridge();
    const store = useAppStore.getState();
    const timers: number[] = [];
    let cancelled = false;
    const startedAt = performance.now();

    buildPlanet((value) => {
      if (!cancelled) store.setProgress(value);
    })
      .catch((error) => {
        // Показать ошибку негде — на сайте нет ни строчки текста, поэтому
        // отправляем её туда, где её найдут
        console.error('Планета не собралась', error);
        return null;
      })
      .then(async (data) => {
        if (cancelled || !data) return;
        store.setPlanet(data);

        // Ждём, пока планета реально нарисуется. Первый её кадр — самый
        // тяжёлый: компиляция шейдеров и заливка буферов. Начать «остановку»
        // до него значит отдать ей половину анимации
        for (let i = 0; i < 3; i++) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        if (cancelled) return;

        // Планета обычно собирается быстрее, чем полёт успевает прочитаться.
        // Держим экран загрузки до минимальной длительности — но ни секунды
        // сверх готовности данных
        const wait = Math.max(0, config.loader.minDurationMs - (performance.now() - startedAt));
        timers.push(
          window.setTimeout(() => {
            store.setPhase('entry');
            timers.push(
              window.setTimeout(() => store.setPhase('idle'), config.entry.durationMs),
            );
          }, wait),
        );
      });

    return () => {
      cancelled = true;
      stopBridge();
      for (const id of timers) window.clearTimeout(id);
    };
  }, []);

  // Escape — второй способ вернуться, для тех, кто не пользуется мышью
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && useAppStore.getState().phase === 'zoomed') {
        useAppStore.getState().setPhase('idle');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loading = phase === 'loading' || phase === 'entry';

  return (
    <>
      <Scene />
      {loading && <LoadingScreen />}
      <BackButton />
      <p className="sr-only" role="status">
        {loading ? 'Планета собирается' : 'Планета готова. Нажмите на неё, чтобы подлететь ближе'}
      </p>

      {/*
        Порталы на планете открываются щелчком по холсту, а до холста нет ни
        фокуса, ни озвучки. Эти ссылки ведут туда же и всплывают по Tab —
        единственный способ добраться до них с клавиатуры
      */}
      <nav className="gates" aria-label="Переходы на другие сайты">
        <a href={config.links.market} target="_blank" rel="noopener noreferrer">
          Портал на рынке — Sollers Shop
        </a>
        <a href={config.links.reactor} target="_blank" rel="noopener noreferrer">
          Портал у станции — AutuDash CRM
        </a>
        <a href={config.links.observatory} target="_blank" rel="noopener noreferrer">
          Портал у обсерватории — FlexiCalc
        </a>
      </nav>
    </>
  );
}
