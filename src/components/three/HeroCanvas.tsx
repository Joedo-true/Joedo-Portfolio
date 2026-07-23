import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';

const Scene3D = lazy(() => import('./Scene3D'));

/** Красивый статичный запасной вариант (нет WebGL / reduced-motion) */
function OrbFallback() {
  return (
    <div className="relative grid h-full w-full place-items-center">
      <div className="relative h-64 w-64 sm:h-80 sm:w-80">
        <div className="absolute inset-0 animate-glow-pulse rounded-full bg-gradient-to-br from-brand-violet via-brand-indigo to-brand-fuchsia blur-2xl opacity-60" />
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-brand-indigo to-brand-violet shadow-glow" />
        <div className="absolute inset-0 animate-spin-slow rounded-full border border-white/20" />
        <div className="absolute -inset-6 animate-[spin-slow_40s_linear_infinite_reverse] rounded-full border border-brand-cyan/20" />
      </div>
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
