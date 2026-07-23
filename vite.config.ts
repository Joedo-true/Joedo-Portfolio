import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // `vite build --mode standalone` собирает ВЕСЬ сайт в один self-contained
  // index.html (JS + CSS встроены inline). Такой файл открывается двойным
  // кликом прямо в браузере — без сервера и без сборки.
  const standalone = mode === 'standalone';

  return {
    // Относительные пути к ресурсам — работает и на хостинге, и по file://
    base: './',
    plugins: [react(), ...(standalone ? [viteSingleFile()] : [])],
    build: standalone
      ? {
          outDir: 'standalone',
          emptyOutDir: true,
        }
      : {
          rollupOptions: {
            output: {
              // Разделяем вендоры для лучшего кэширования и быстрой первой загрузки
              manualChunks: {
                react: ['react', 'react-dom'],
                motion: ['framer-motion'],
                charts: ['recharts'],
              },
            },
          },
        },
  };
});
