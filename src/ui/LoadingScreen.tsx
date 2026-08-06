import { useEffect, useRef } from 'react';
import { config } from '../config';
import { prefersReducedMotion } from '../reducedMotion';
import { useAppStore } from '../state/useAppStore';

/**
 * Экран загрузки: полёт сквозь звёзды.
 *
 * Полосы разлетаются из центра и удлиняются к краю — так выглядят звёзды,
 * размазанные собственной скоростью: у края экрана угловая скорость выше, а
 * значит длиннее и след. Отсюда и рост радиуса: не линейный, а
 * пропорциональный самому радиусу — точка, летящая мимо камеры, уходит из
 * центра всё быстрее.
 *
 * В центре — чёрный круг с растворяющимся краем. Он закрывает место, где
 * полосы рождаются: без него в кадре была бы яркая точка схода.
 *
 * Когда планета собрана, фаза переключается на `entry`, и весь этот полёт
 * тормозит: скорость и длина следа падают до нуля, полосы становятся точками
 * и гаснут поверх уже проявившегося звёздного неба.
 */

interface Streak {
  angle: number;
  /** Радиус в долях половины меньшей стороны окна */
  radius: number;
  phase: number;
  /** Разброс скорости, чтобы поле не выглядело единым механизмом */
  rate: number;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

export function LoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const phase = useAppStore((state) => state.phase);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const canvas = canvasRef.current;
    const shade = shadeRef.current;
    if (!canvas || !shade) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const random = Math.random;
    const streaks: Streak[] = [];

    let width = 0;
    let height = 0;
    let half = 0;
    let maxRadius = 0;
    let dpr = 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      half = Math.min(width, height) / 2;
      maxRadius = Math.hypot(width, height) / 2 / half;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (streak: Streak, fresh: boolean) => {
      streak.angle = random() * Math.PI * 2;
      streak.phase = random() * Math.PI * 2;
      streak.rate = 0.75 + random() * 0.5;
      // На старте поле уже заполнено: иначе первые полсекунды экран пустой.
      // Радиус берётся по логарифму — движение экспоненциальное, и равномерная
      // выборка сбила бы всех в кучу у центра
      streak.radius = fresh
        ? config.loader.streakInnerRadius *
          Math.pow(maxRadius / config.loader.streakInnerRadius, random())
        : config.loader.streakInnerRadius;
    };

    let stopStart = 0;
    let last = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;

      const loader = config.loader;
      const wanted = Math.max(0, Math.round(loader.streakCount));
      while (streaks.length < wanted) {
        const streak: Streak = { angle: 0, radius: 0, phase: 0, rate: 1 };
        spawn(streak, true);
        streaks.push(streak);
      }
      if (streaks.length > wanted) streaks.length = wanted;

      // Торможение
      let brake = 0;
      if (phaseRef.current === 'entry') {
        if (!stopStart) stopStart = now;
        brake = easeOut(clamp01((now - stopStart) / config.entry.durationMs));
      }
      const motion = 1 - brake;

      // Фон уходит раньше полос: сначала за ними проступает планета и
      // настоящие звёзды, и только потом сами полосы, уже ставшие точками
      shade.style.opacity = String(1 - clamp01(brake / 0.45));
      const fade = 1 - clamp01((brake - 0.75) / 0.25);

      // Поле пустеет изнутри наружу. Иначе к концу торможения чёрный круг уже
      // растворился, а полосы всё ещё рождаются в той же точке — и точка схода
      // проступает белой вспышкой прямо на планете
      const hollow =
        loader.streakInnerRadius + brake * (maxRadius * 1.1 - loader.streakInnerRadius);

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const speed = loader.streakSpeed * motion * (reduced ? 0.35 : 1);
      const flicker = reduced ? 0 : loader.flickerDepth * motion;
      const spin = now / 1000;

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineWidth = loader.streakWidth;

      for (const streak of streaks) {
        streak.radius *= Math.exp(speed * streak.rate * delta);
        if (streak.radius > maxRadius) spawn(streak, false);

        const reach = clamp01(streak.radius / maxRadius);
        const length =
          (loader.streakLengthMin +
            (loader.streakLengthMax - loader.streakLengthMin) * reach) *
          motion;

        // Мерцание: у каждой полосы своя фаза, поле дрожит целиком, но не в такт
        const blink =
          1 - flicker * (0.5 + 0.5 * Math.sin(spin * loader.flickerHz * Math.PI * 2 + streak.phase));
        // Появление у центра и уход за краем — иначе полосы моргают на месте
        const born = clamp01((streak.radius - hollow) / (maxRadius * 0.12));
        const alpha = blink * born * (1 - Math.pow(reach, 6)) * fade;
        if (alpha <= 0.004) continue;

        const dirX = Math.cos(streak.angle);
        const dirY = Math.sin(streak.angle);
        const head = streak.radius * half;
        const tail = Math.max(streak.radius - length, loader.streakInnerRadius * 0.7) * half;

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(centerX + dirX * tail, centerY + dirY * tail);
        ctx.lineTo(centerX + dirX * head, centerY + dirY * head);
        ctx.stroke();
      }

      // Чёрный круг поверх полос
      ctx.globalCompositeOperation = 'source-over';
      const discAlpha = 1 - clamp01(brake / 0.5);
      if (discAlpha > 0.004) {
        const inner = loader.discRadius * half * 2 * (1 + brake * 0.8);
        const outer = inner * (1 + Math.max(loader.discFeather, 0.001));
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outer);
        gradient.addColorStop(0, `rgba(0, 0, 0, ${discAlpha})`);
        gradient.addColorStop(inner / outer, `rgba(0, 0, 0, ${discAlpha})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, outer, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="loader" aria-hidden="true">
      <div className="loader__shade" ref={shadeRef} />
      <canvas className="loader__canvas" ref={canvasRef} />
    </div>
  );
}
