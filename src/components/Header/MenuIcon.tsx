import { Canvas } from '@react-three/fiber';
import { Tesseract } from '../../three/objects/Tesseract';
import { iridescentPresets } from '../../three/shaders/iridescentMaterial';

/**
 * Кнопка меню первого экрана: тот же тессеракт, ужатый до иконки (ТЗ 7.3).
 *
 * Не вращается — угол зафиксирован такой, при котором «куб внутри куба» ещё
 * читается, а не сливается в клубок линий. Рёбра в этом масштабе толще, чем
 * у крупной фигуры: иначе на 48 пикселях силуэт теряется.
 *
 * По клику в Части 1 ничего не происходит — бриф поведение меню не описывает
 * (ТЗ 7, открытый момент), поэтому это пока только визуальный элемент.
 */
export function MenuIcon() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 4.6], fov: 42 }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Угол подобран так, чтобы в 52 пикселях ещё читалось «куб в кубе»:
          грани не смотрят в камеру плашмя и не сливаются в один силуэт */}
      <group rotation={[-0.42, 0.68, 0]} scale={1.05}>
        <Tesseract preset={iridescentPresets.iconLight} tubeRadius={0.1} />
      </group>
    </Canvas>
  );
}
