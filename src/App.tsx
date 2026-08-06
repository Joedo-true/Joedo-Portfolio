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
      .then((data) => {
        if (cancelled || !data) return;
        store.setPlanet(data);

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
    </>
  );
}
