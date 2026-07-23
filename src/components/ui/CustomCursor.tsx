import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Кастомный курсор: точка + догоняющее кольцо, которое увеличивается
 * над интерактивными элементами. Дополняет системный курсор (не прячет его),
 * поэтому не мешает вводу текста и доступности. Только для мыши.
 */
export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
      const el = e.target as HTMLElement;
      setActive(!!el.closest('a, button, input, textarea, [data-cursor]'));
    };
    const leave = () => setVisible(false);

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
    };
  }, [x, y, visible]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[120] hidden md:block">
      {/* Кольцо */}
      <motion.div
        className="absolute -ml-4 -mt-4 h-8 w-8 rounded-full border border-brand-violet/70 mix-blend-difference"
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
        animate={{ scale: active ? 1.8 : 1, borderColor: active ? 'rgba(217,70,239,0.9)' : 'rgba(139,92,246,0.7)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      {/* Точка */}
      <motion.div
        className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-brand-fuchsia"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
