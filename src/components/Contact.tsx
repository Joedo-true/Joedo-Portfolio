import { useState, type FormEvent } from 'react';
import { site } from '../data/site';
import { SectionHeading } from './ui/SectionHeading';
import { Barcode } from './ui/Barcode';
import { WarpGridSVG } from './ui/WarpGridSVG';

interface FieldProps {
  id: string;
  label: string;
  hint: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
}

/** Поле ввода без «карточек»: только волосяная линия снизу */
function Field({ id, label, hint, type = 'text', textarea, value, onChange }: FieldProps) {
  const shared =
    'w-full bg-transparent px-0 py-3 font-mono text-sm text-white outline-none placeholder:text-white/25 border-b transition-colors focus:border-white/70';
  return (
    <div className="py-5">
      <label htmlFor={id} className="paren-label block">
        ({label})
      </label>
      {textarea ? (
        <textarea
          id={id}
          required
          rows={4}
          placeholder={hint}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${shared} resize-none`}
          style={{ borderColor: 'var(--line)' }}
        />
      ) : (
        <input
          id={id}
          type={type}
          required
          placeholder={hint}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
          style={{ borderColor: 'var(--line)' }}
        />
      )}
    </div>
  );
}

export function Contact() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [task, setTask] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Заявка с сайта — ${name || 'новый проект'}`);
    const body = encodeURIComponent(`Имя: ${name}\nСвязь: ${contact}\n\nЗадача:\n${task}`);
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact" className="relative rule-t py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          title="Contact"
          label="Get in touch"
          seed={43}
          intro="Опишите задачу в двух словах — вернусь с идеями, планом и оценкой в течение 24 часов. Бесплатно и ни к чему не обязывает."
        />
      </div>

      <div className="mt-14 rule-t">
        <div className="grid lg:grid-cols-[1.3fr_1fr]">
          {/* Форма */}
          <form onSubmit={handleSubmit} className="px-5 py-10 sm:px-8 lg:px-12">
            <div>
              <Field
                id="name"
                label="Ваше имя"
                hint="как к вам обращаться"
                value={name}
                onChange={setName}
              />
              <Field
                id="contact"
                label="Telegram или Email"
                hint="@username / mail@example.com"
                value={contact}
                onChange={setContact}
              />
              <Field
                id="task"
                label="Задача"
                hint="например: калькулятор стоимости услуг с формой заявки"
                textarea
                value={task}
                onChange={setTask}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="submit"
                className="pill pill-solid "
              >
                {sent ? 'Открываю почту…' : 'Отправить заявку'} <span aria-hidden>↗</span>
              </button>
              <span className="meta !normal-case !tracking-normal">
                Отвечаю в течение нескольких часов
              </span>
            </div>
          </form>

          {/* Прямые каналы */}
          <div className="relative rule-t lg:rule-l lg:border-t-0">
            <div className="pointer-events-none absolute inset-0 text-white">
              <WarpGridSVG className="h-full w-full" cols={13} rows={18} amp={18} opacity={0.26} duration={42} />
            </div>
            <a
              href={site.telegram.url}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-between gap-4 px-5 py-8 transition-colors hover:bg-white/[0.03] sm:px-8 lg:px-12"
            >
              <span>
                <span className="block font-mono text-base uppercase tracking-[0.08em] text-white">
                  Telegram
                </span>
                <span className="meta mt-1 block !normal-case !tracking-normal">
                  {site.telegram.handle}
                </span>
              </span>
              <span
                aria-hidden
                className="text-lg text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
              >
                ↗
              </span>
            </a>

            <a
              href={`mailto:${site.email}`}
              className="group relative flex items-center justify-between gap-4 px-5 py-8 rule-t transition-colors hover:bg-white/[0.03] sm:px-8 lg:px-12"
            >
              <span className="min-w-0">
                <span className="block font-mono text-base uppercase tracking-[0.08em] text-white">
                  Email
                </span>
                <span className="meta mt-1 block truncate !normal-case !tracking-normal">
                  {site.email}
                </span>
              </span>
              <span
                aria-hidden
                className="text-lg text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
              >
                ↗
              </span>
            </a>

            <div className="relative rule-t px-5 py-8 sm:px-8 lg:px-12">
              <Barcode seed={57} className="text-white/70" />
              <p className="meta mt-3 !normal-case !tracking-normal">
                Предпочитаете мессенджеры? Напишите в один клик — так быстрее.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
