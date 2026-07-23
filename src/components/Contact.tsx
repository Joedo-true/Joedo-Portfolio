import { useState, type FormEvent } from 'react';
import { site } from '../data/site';
import { Reveal } from './ui/Reveal';
import { MagneticButton } from './ui/MagneticButton';

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

/** Поле ввода: при фокусе рамка подсвечивается мягким градиентом */
function Field({ id, label, type = 'text', placeholder, textarea, value, onChange, required }: FieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      <div className="group relative rounded-xl p-[1.5px] transition-all duration-300">
        {/* Градиентная подсветка рамки при фокусе */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-violet via-brand-fuchsia to-brand-indigo opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
        {textarea ? (
          <textarea
            id={id}
            required={required}
            rows={4}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="relative block w-full resize-none rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-slate-400 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />
        ) : (
          <input
            id={id}
            type={type}
            required={required}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="relative block w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-slate-400 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
          />
        )}
      </div>
    </label>
  );
}

function TelegramGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.9 4.3 18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1 .5l.36-5.13L18.1 6.6c.4-.36-.09-.56-.63-.2L6.2 13.6l-4.98-1.56c-1.08-.34-1.1-1.08.23-1.6l19.47-7.5c.9-.34 1.7.2 1.4 1.36Z" />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 6 9 6 9-6" />
    </svg>
  );
}

export function Contact() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [task, setTask] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Без бэкенда: собираем письмо и открываем почтовый клиент.
    const subject = encodeURIComponent(`Заявка с сайта — ${name || 'новый проект'}`);
    const body = encodeURIComponent(
      `Имя: ${name}\nСвязь: ${contact}\n\nЗадача:\n${task}`,
    );
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      {/* Фоновое свечение */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-brand-violet/15 blur-3xl" />

      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="eyebrow">Экспонат 05 — Контакты</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-ink-950 dark:text-white sm:text-4xl md:text-[2.75rem]">
              Есть проект в голове? <span className="text-gradient">Давайте сделаем его реальностью</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              Опишите задачу в двух словах — вернусь с идеями, планом и оценкой в течение 24 часов. Это
              бесплатно и ни к чему не обязывает.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Форма */}
          <Reveal>
            <form onSubmit={handleSubmit} className="panel rounded-3xl p-6 sm:p-8">
              <div className="space-y-5">
                <Field id="name" label="Ваше имя" placeholder="Как к вам обращаться" value={name} onChange={setName} required />
                <Field
                  id="contact"
                  label="Ваш Telegram или Email"
                  placeholder="@username или mail@example.com"
                  value={contact}
                  onChange={setContact}
                  required
                />
                <Field
                  id="task"
                  label="Опишите вашу задачу"
                  placeholder="Например: нужен калькулятор стоимости услуг с формой заявки…"
                  textarea
                  value={task}
                  onChange={setTask}
                  required
                />
              </div>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <MagneticButton
                  type="submit"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-violet to-brand-indigo px-7 py-3.5 text-base font-semibold text-white shadow-glow transition-all duration-300 hover:from-brand-fuchsia hover:to-brand-violet sm:w-auto"
                >
                  {sent ? 'Спасибо! Открываю почту…' : 'Отправить заявку'}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                </MagneticButton>
                <p className="text-xs text-slate-400">Отвечаю обычно в течение нескольких часов</p>
              </div>
            </form>
          </Reveal>

          {/* Альтернатива — мессенджеры в один клик */}
          <Reveal delay={0.1}>
            <div className="panel flex h-full flex-col justify-center gap-4 rounded-3xl p-6 sm:p-8">
              <p className="text-lg font-semibold text-ink-900 dark:text-white">
                Предпочитаете мессенджеры?
              </p>
              <p className="-mt-2 text-sm text-slate-500 dark:text-slate-400">
                Напишите мне в один клик — так даже быстрее.
              </p>

              <a
                href={site.telegram.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl bg-[#229ED9] px-5 py-4 text-white transition-transform hover:-translate-y-0.5"
              >
                <TelegramGlyph />
                <span className="flex-1">
                  <span className="block text-sm font-semibold">Telegram</span>
                  <span className="block text-xs text-white/80">{site.telegram.handle}</span>
                </span>
                <span aria-hidden className="text-lg transition-transform group-hover:translate-x-1">→</span>
              </a>

              <a
                href={`mailto:${site.email}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-5 py-4 text-ink-900 transition-transform hover:-translate-y-0.5 dark:border-ink-700 dark:bg-ink-900/60 dark:text-white"
              >
                <span className="text-brand-violet">
                  <MailGlyph />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">Email</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{site.email}</span>
                </span>
                <span aria-hidden className="text-lg transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
