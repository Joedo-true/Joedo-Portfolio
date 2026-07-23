import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Абстрактная интерактивная сцена: сетка точек и геометрические фигуры,
 * которые мягко и плавно следуют за курсором (параллакс на разных слоях).
 * Работает на motion-value + spring — без перерисовок React на каждое движение,
 * поэтому не грузит процессор.
 */
export function InteractiveGrid() {
  const ref = useRef<HTMLDivElement>(null);

  // Нормализованное положение курсора относительно центра сцены (-0.5 … 0.5)
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const sx = useSpring(px, { stiffness: 90, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 90, damping: 18, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // На тач-устройствах курсора нет — оставляем лёгкую статичную анимацию float.
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (!canHover) return;

    let frame = 0;
    const handle = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        px.set(Math.max(-0.5, Math.min(0.5, x)));
        py.set(Math.max(-0.5, Math.min(0.5, y)));
      });
    };

    window.addEventListener('mousemove', handle);
    return () => {
      window.removeEventListener('mousemove', handle);
      cancelAnimationFrame(frame);
    };
  }, [px, py]);

  // Разная глубина слоёв => ощущение объёма.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const useLayer = (depth: number) => ({
    x: useTransform(sx, (v) => v * depth),
    y: useTransform(sy, (v) => v * depth),
  });

  const dots = useLayer(26);
  const shapeA = useLayer(70);
  const shapeB = useLayer(48);
  const shapeC = useLayer(95);
  const glow = useLayer(40);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Мягкое градиентное свечение, следующее за курсором */}
      <motion.div
        style={{ x: glow.x, y: glow.y }}
        className="absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2
          rounded-full bg-[radial-gradient(circle,_rgba(139,92,246,0.28),_transparent_62%)] blur-2xl"
      />

      {/* Точечная сетка */}
      <motion.svg
        style={{ x: dots.x, y: dots.y }}
        className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 text-slate-400/40 dark:text-slate-500/30"
      >
        <defs>
          <pattern id="hero-dots" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="currentColor" />
          </pattern>
          <radialGradient id="hero-dots-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="hero-dots-mask">
            <rect width="100%" height="100%" fill="url(#hero-dots-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" mask="url(#hero-dots-mask)" />
      </motion.svg>

      {/* Геометрические фигуры — только на широких экранах, в свободной
          правой зоне, чтобы не перекрывать заголовок. */}

      {/* Кольцо */}
      <motion.div
        style={{ x: shapeB.x, y: shapeB.y }}
        className="absolute right-[10%] top-[16%] hidden h-40 w-40 animate-float rounded-full border-2 border-brand-violet/40 md:block"
      />

      {/* Скруглённый квадрат с градиентом */}
      <motion.div
        style={{ x: shapeA.x, y: shapeA.y }}
        className="absolute right-[16%] top-[44%] hidden h-24 w-24 rotate-12 rounded-2xl
          bg-gradient-to-br from-brand-violet/70 to-brand-fuchsia/60 shadow-glow md:block"
      />

      {/* Маленький изумрудный ромб */}
      <motion.div
        style={{ x: shapeC.x, y: shapeC.y }}
        className="absolute right-[8%] bottom-[20%] hidden h-14 w-14 rotate-45 rounded-lg
          bg-gradient-to-br from-brand-emerald/80 to-teal-400/60 shadow-glow-sm md:block"
      />

      {/* Контурный треугольник */}
      <motion.svg
        style={{ x: shapeB.x, y: shapeB.y }}
        width="84"
        height="84"
        viewBox="0 0 90 90"
        className="absolute right-[30%] bottom-[16%] hidden animate-float text-brand-indigo/50 lg:block"
        fill="none"
      >
        <path d="M45 8 82 78 8 78Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </motion.svg>

      {/* Точка-акцент */}
      <motion.div
        style={{ x: shapeC.x, y: shapeC.y }}
        className="absolute right-[34%] top-[30%] hidden h-4 w-4 rounded-full bg-brand-fuchsia shadow-glow-sm lg:block"
      />
    </div>
  );
}
