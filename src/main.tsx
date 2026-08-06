import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Без StrictMode намеренно: он монтирует дерево дважды, а вместе с ним дважды
// собиралась бы вся планета — две с половиной тысячи плиток на каждый запуск
// дев-сервера.
createRoot(document.getElementById('root')!).render(<App />);
