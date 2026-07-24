import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { fileTrees, type FileNode } from '../../data/fileTree';
import { NeuronScene } from './NeuronScene';

/** Спускаемся по дереву по массиву индексов */
function nodeAtPath(root: FileNode, path: number[]): FileNode {
  let cur = root;
  for (const i of path) {
    const next = cur.children?.[i];
    if (!next) break;
    cur = next;
  }
  return cur;
}

export default function StructureModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const root = fileTrees[projectId];
  const [path, setPath] = useState<number[]>([]);

  // Esc закрывает, блокируем скролл фона
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      document.body.style.cursor = '';
    };
  }, [onClose]);

  const current = useMemo(() => (root ? nodeAtPath(root, path) : undefined), [root, path]);

  if (!root || !current) return null;

  const open = (i: number) => {
    const child = current.children?.[i];
    if (child?.type === 'folder') setPath((p) => [...p, i]);
  };
  const back = () => setPath((p) => p.slice(0, -1));

  // Хлебные крошки: корень + пройденный путь
  const crumbs: { name: string; path: number[] }[] = [{ name: root.name, path: [] }];
  {
    let cur = root;
    const acc: number[] = [];
    for (const i of path) {
      const next = cur.children?.[i];
      if (!next) break;
      acc.push(i);
      crumbs.push({ name: next.name, path: [...acc] });
      cur = next;
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[200] flex flex-col bg-ink-950/70 backdrop-blur-xl"
        onClick={onClose}
      >
        {/* Цветные пятна-подсветка */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-violet/15 blur-3xl" />

        {/* Верхняя панель */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-violet">
              Структура проекта
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-slate-300">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-600">/</span>}
                  <button
                    onClick={() => setPath(c.path)}
                    className={`rounded px-1.5 py-0.5 font-mono transition-colors hover:text-white ${
                      i === crumbs.length - 1 ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {c.name}
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-brand-violet/60 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </motion.div>

        {/* 3D-нейрон */}
        <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 10.5], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            <NeuronScene node={current} path={path} onOpen={open} onBack={back} />
          </Canvas>

          {/* Подсказка */}
          <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              Вращайте мышью · клик по <span className="text-cyan-300">папке</span> — открыть
              {path.length > 0 && <> · <span className="text-fuchsia-300">кольцо</span> — назад</>}
            </span>
          </div>

          {/* Легенда */}
          <div className="pointer-events-none absolute right-5 top-4 hidden flex-col gap-1.5 text-xs text-slate-400 sm:flex">
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-cyan-400" /> папка</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-violet-400" /> файл</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
