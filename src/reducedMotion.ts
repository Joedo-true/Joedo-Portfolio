import { useEffect, useState } from 'react';

/**
 * Системная настройка «меньше движения».
 *
 * Сайт держится на движении, поэтому отключаем только то, что действительно
 * может укачать: мерцание полос, разгон-торможение и собственное вращение
 * планеты. Приближение по клику и вращение мышью остаются — это прямой ответ
 * на действие пользователя, а без них сайтом просто нельзя пользоваться.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}
