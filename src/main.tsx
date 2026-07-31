import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Только Regular и Medium — явное требование брифа (ТЗ 1). Сабсеты latin и
// cyrillic, потому что тексты сайта русские; остальные не подключаем.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/cyrillic-400.css';
import '@fontsource/inter/cyrillic-500.css';
// Только для счётчика загрузки — сверхлёгкое начертание, цифры латиницей
import '@fontsource/jetbrains-mono/latin-200.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import './index.css';
import './styles/tokens.css';
import App from './App.tsx';
import { Sandbox } from './debug/Sandbox';

// Отладочный режим (ТЗ 10): песочница фаз открывается по ?debug=1 и не
// пересекается с обычной страницей.
const isDebug = new URLSearchParams(window.location.search).has('debug');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isDebug ? <Sandbox /> : <App />}</StrictMode>,
);
