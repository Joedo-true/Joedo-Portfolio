import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  /** Сила притяжения к курсору (0–1) */
  strength?: number;
  ariaLabel?: string;
}

/**
 * Кнопка с «магнитным» эффектом — слегка тянется за курсором.
 * На мобильных (без hover) эффект не мешает нажатию.
 */
export function MagneticButton({
  children,
  className,
  href,
  type = 'button',
  onClick,
  strength = 0.35,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const commonProps = {
    ref: ref as never,
    className,
    style: { x: springX, y: springY },
    onMouseMove: handleMove,
    onMouseLeave: reset,
    'aria-label': ariaLabel,
  };

  if (href) {
    return (
      <motion.a href={href} {...commonProps}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} {...commonProps}>
      {children}
    </motion.button>
  );
}
