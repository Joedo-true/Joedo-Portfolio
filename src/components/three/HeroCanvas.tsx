import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';

const Scene3D = lazy(() => import('./Scene3D'));

/** Статичный запасной вариант (нет WebGL / reduced-motion): плоская сетка */
function OrbFallback() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="warp-grid absolute inset-0 opacity-80" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-neon-magenta/70" />
    </div>
  );
}

class WebGLBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function HeroCanvas() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Пробуем создать WebGL-контекст; если не выходит — оставляем CSS-фолбэк
    let webgl = false;
    try {
      const c = document.createElement('canvas');
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webgl = false;
    }
    setEnabled(!reduced && webgl);
  }, []);

  if (!enabled) return <OrbFallback />;

  return (
    <WebGLBoundary fallback={<OrbFallback />}>
      <Suspense fallback={<OrbFallback />}>
        <Scene3D />
      </Suspense>
    </WebGLBoundary>
  );
}
