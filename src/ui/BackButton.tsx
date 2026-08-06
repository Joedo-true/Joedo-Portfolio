import { useAppStore } from '../state/useAppStore';

/**
 * Единственная кнопка на сайте — возврат с орбиты к обзору.
 *
 * Стрелка нарисована одной ломаной без древка: у кнопки нет ни рамки, ни
 * подложки, и чем меньше в ней линий, тем меньше она спорит с планетой.
 * Появляется только вблизи — на главном экране возвращаться некуда.
 */
export function BackButton() {
  const phase = useAppStore((state) => state.phase);
  const setPhase = useAppStore((state) => state.setPhase);
  const shown = phase === 'zoomed';

  return (
    <button
      type="button"
      className={`back${shown ? ' back--shown' : ''}`}
      onClick={() => setPhase('idle')}
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      aria-label="Отдалиться от планеты"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path
          d="M14.5 5 L7.5 12 L14.5 19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
