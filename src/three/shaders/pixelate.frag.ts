/**
 * Пиксельное «проявление» для 3D-контента (ТЗ 4.1, вариант A).
 *
 * Для DOM-текста тот же эффект делает `components/PixelReveal` на canvas 2D —
 * там это дешевле и не требует рендер-таргета. Этот шейдер нужен второму
 * применению из брифа: смене иконки хедера тессеракт ⇄ глобус (8.5), где
 * пикселизуется картинка, снятая со сцены в render target.
 *
 * uPixelSize — сторона блока в пикселях экрана: крупное значение = шум,
 * 1.0 = попиксельная чёткость.
 */
export const pixelateFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2  uResolution;
  uniform float uPixelSize;
  uniform float uBlur;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    float px = max(uPixelSize, 1.0);
    vec2 grid = max(uResolution / px, vec2(1.0));
    // Центр блока, а не его угол — иначе мозаика уезжает на полпикселя
    vec2 uv = (floor(vUv * grid) + 0.5) / grid;

    vec4 color = vec4(0.0);
    if (uBlur <= 0.001) {
      color = texture2D(uTexture, uv);
    } else {
      // Коробочное размытие 3×3 с шагом в один блок: смазывает границы
      // мозаики, чтобы шум не выглядел решёткой
      // имя tap, а не step: так называется встроенная функция GLSL, и тень
      // над ней компиляторы принимают по-разному
      vec2 tap = uBlur / uResolution;
      float total = 0.0;
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 offset = vec2(float(x), float(y)) * tap;
          float w = (x == 0 && y == 0) ? 2.0 : 1.0;
          color += texture2D(uTexture, uv + offset) * w;
          total += w;
        }
      }
      color /= total;
    }

    gl_FragColor = vec4(color.rgb, color.a * uOpacity);
  }
`;

/**
 * Пас во весь экран: вершины приходят уже в clip space (drei `ScreenQuad`),
 * поэтому камеру к ним применять не нужно — иначе квад уезжает из кадра.
 */
export const pixelateVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;
