"use client";

// Общие элементы форм раздела «Контент». Клиентские: формы держат содержимое секции в
// состоянии и отправляют его одним JSON — раскладывать вложенные списки по плоским именам
// formData значило бы городить разбор, который легко разойдётся с формой.
import { useFormStatus } from "react-dom";

export const inputCls =
  "h-[45px] w-full rounded-[5px] border border-[#e6e6e6] bg-white px-[14px] text-[14px] text-ink outline-none transition-colors duration-200 ease-motion placeholder:text-[rgba(39,39,39,0.4)] focus:border-[#b6e835]";
export const areaCls =
  "min-h-[86px] w-full resize-y rounded-[5px] border border-[#e6e6e6] bg-white px-[14px] py-[10px] text-[14px] leading-[21px] text-ink outline-none transition-colors duration-200 ease-motion placeholder:text-[rgba(39,39,39,0.4)] focus:border-[#b6e835]";
export const labelCls = "mb-[6px] block text-[12px] font-medium text-ink";
export const hintCls = "mt-[6px] text-[12px] leading-[18px] text-[rgba(39,39,39,0.6)]";
const btnCls =
  "inline-flex h-[34px] items-center rounded-[5px] border border-[#e6e6e6] bg-white px-[12px] text-[12px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-[#f5f5f5] disabled:opacity-40";

export function Field({
  label,
  value,
  onChange,
  hint,
  placeholder,
  wide,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label className={labelCls}>{label}</label>
      <input
        className={inputCls}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className={hintCls}>{hint}</p> : null}
    </div>
  );
}

export function Area({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="sm:col-span-2">
      <label className={labelCls}>{label}</label>
      <textarea
        className={areaCls}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className={hintCls}>{hint}</p> : null}
    </div>
  );
}

export function NumField({
  label,
  value,
  onChange,
  hint,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  step?: number;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        step={step}
        className={inputCls}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
      {hint ? <p className={hintCls}>{hint}</p> : null}
    </div>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-[15px] border border-hairline bg-paper p-[20px]">
      <legend className="px-[6px] text-[12px] font-bold uppercase tracking-[0.04em] text-[rgba(39,39,39,0.6)]">
        {title}
      </legend>
      <div className="grid gap-[16px] sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/**
 * Список с добавлением, удалением и перестановкой. Порядок здесь — это порядок на сайте,
 * поэтому кнопки «вверх/вниз» обязательны: без них поменять местами курсы или этапы можно
 * было бы только пересоздав их.
 */
export function ListEditor<T>({
  items,
  onChange,
  make,
  addLabel,
  itemTitle,
  minItems = 1,
  maxItems = 40,
  render,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  make: () => T;
  addLabel: string;
  itemTitle: (item: T, i: number) => string;
  minItems?: number;
  maxItems?: number;
  render: (item: T, update: (patch: Partial<T>) => void, i: number) => React.ReactNode;
}) {
  const replace = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, j) => (i === j ? { ...it, ...patch } : it)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="flex flex-col gap-[14px]">
      {items.map((item, i) => (
        <div key={i} className="rounded-[12px] border border-[#e6e6e6] bg-white p-[16px]">
          <div className="mb-[14px] flex flex-wrap items-center gap-[8px]">
            <span className="mr-auto text-[13px] font-bold text-ink">{itemTitle(item, i)}</span>
            <button type="button" className={btnCls} onClick={() => move(i, -1)} disabled={i === 0}>
              ↑
            </button>
            <button
              type="button"
              className={btnCls}
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
            >
              ↓
            </button>
            <button
              type="button"
              className={`${btnCls} text-red-600`}
              onClick={() => remove(i)}
              disabled={items.length <= minItems}
              title={items.length <= minItems ? "Последний элемент удалить нельзя" : "Удалить"}
            >
              Удалить
            </button>
          </div>
          <div className="grid gap-[16px] sm:grid-cols-2">{render(item, (p) => replace(i, p), i)}</div>
        </div>
      ))}
      <div>
        <button
          type="button"
          className={btnCls}
          onClick={() => onChange([...items, make()])}
          disabled={items.length >= maxItems}
        >
          + {addLabel}
        </button>
      </div>
    </div>
  );
}

/** Полоса сохранения: кнопка знает о состоянии отправки формы, поэтому двойного клика не будет. */
export function SaveBar({ note }: { note?: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 z-10 -mx-[4px] flex flex-wrap items-center gap-[12px] border-t border-hairline bg-white/95 px-[4px] py-[14px] backdrop-blur">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-[45px] items-center rounded-[5px] bg-lime px-[24px] text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Сохраняю…" : "Сохранить"}
      </button>
      {note ? <span className="text-[12px] text-[rgba(39,39,39,0.6)]">{note}</span> : null}
    </div>
  );
}

export function Result({ state }: { state?: { error?: string; ok?: string } }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p
      role="status"
      className={`rounded-[8px] px-[14px] py-[10px] text-[13px] ${
        state.error ? "bg-red-50 text-red-700" : "bg-[#f2fadf] text-ink"
      }`}
    >
      {state.error ?? state.ok}
    </p>
  );
}
