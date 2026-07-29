"use client";

// Форма секции «Программа обучения»: курсы, дисциплины, плашка и карточка статистики.
import { useActionState, useState } from "react";
import { photoSrc } from "@/lib/content-assets";
import type { Course, Discipline, ProgramContent } from "@/lib/content-types";
import { saveProgram, type ContentFormState } from "../actions";
import { Area, Card, Field, ListEditor, NumField, Result, SaveBar, hintCls, inputCls, labelCls } from "../ui";

const fileCls =
  "w-full text-[13px] text-ink file:mr-[12px] file:h-[34px] file:cursor-pointer file:rounded-[5px] file:border-0 file:bg-lime file:px-[16px] file:text-[12px] file:font-bold file:text-ink";

const emptyCourse = (n: number): Course => ({
  num: `${n} курс`,
  name: "",
  subtitle: "",
  disciplines: [""],
});

// Дисциплина хранится строкой, если у неё нет настроек, — так же, как в макетном JSON.
// В форме удобнее всегда работать с объектом, поэтому раскладываем и собираем обратно.
const dOpen = (d: Discipline) =>
  typeof d === "string" ? { label: d, ghost: false, m: "" } : { label: d.label, ghost: !!d.ghost, m: d.m ?? "" };
const dClose = (d: { label: string; ghost: boolean; m: string }): Discipline =>
  !d.ghost && !d.m ? d.label : { label: d.label, ...(d.ghost ? { ghost: true } : {}), ...(d.m ? { m: d.m } : {}) };

/** Дисциплины курса: подпись, мобильный вариант и «призрачная» отметка. */
function Disciplines({
  items,
  onChange,
}: {
  items: Discipline[];
  onChange: (next: Discipline[]) => void;
}) {
  const open = items.map(dOpen);
  const commit = (next: typeof open) => onChange(next.map(dClose));
  const patch = (i: number, p: Partial<(typeof open)[number]>) =>
    commit(open.map((d, j) => (i === j ? { ...d, ...p } : d)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= open.length) return;
    const next = [...open];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  return (
    <div className="sm:col-span-2">
      <label className={labelCls}>Дисциплины ({items.length})</label>
      <div className="flex flex-col gap-[8px]">
        {open.map((d, i) => (
          <div key={i} className="rounded-[8px] border border-[#eee] bg-[#fafafa] p-[10px]">
            <div className="flex flex-wrap items-center gap-[8px]">
              <input
                className={`${inputCls} h-[38px] min-w-[200px] flex-1`}
                value={d.label}
                placeholder="Название дисциплины"
                onChange={(e) => patch(i, { label: e.target.value })}
              />
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="h-[38px] rounded-[5px] border border-[#e6e6e6] bg-white px-[10px] text-[12px] disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === open.length - 1}
                className="h-[38px] rounded-[5px] border border-[#e6e6e6] bg-white px-[10px] text-[12px] disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => commit(open.filter((_, j) => j !== i))}
                disabled={open.length <= 1}
                className="h-[38px] rounded-[5px] border border-[#e6e6e6] bg-white px-[10px] text-[12px] text-red-600 disabled:opacity-40"
              >
                Удалить
              </button>
            </div>
            <div className="mt-[8px] flex flex-wrap items-center gap-[14px]">
              <label className="flex items-center gap-[6px] text-[12px] text-ink">
                <input
                  type="checkbox"
                  checked={d.ghost}
                  onChange={(e) => patch(i, { ghost: e.target.checked })}
                  className="size-[15px] accent-[#b6e835]"
                />
                Без заливки
              </label>
              <input
                className={`${inputCls} h-[34px] min-w-[220px] flex-1 text-[13px]`}
                value={d.m}
                placeholder="Вариант для телефона (можно пусто)"
                onChange={(e) => patch(i, { m: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => commit([...open, { label: "", ghost: false, m: "" }])}
        className="mt-[8px] inline-flex h-[34px] items-center rounded-[5px] border border-[#e6e6e6] bg-white px-[12px] text-[12px] font-bold text-ink hover:bg-[#f5f5f5]"
      >
        + Добавить дисциплину
      </button>
      <p className={hintCls}>
        «Без заливки» — таблетка с прозрачным фоном, как у последних дисциплин в макете. Поле для
        телефона нужно, когда на узкой ширине подпись переносится иначе.
      </p>
    </div>
  );
}

export default function ProgramForm({ initial }: { initial: ProgramContent }) {
  const [state, action] = useActionState<ContentFormState, FormData>(saveProgram, undefined);
  const [data, setData] = useState<ProgramContent>(initial);
  const set = (patch: Partial<ProgramContent>) => setData({ ...data, ...patch });

  return (
    <form action={action} className="mt-[24px] flex flex-col gap-[20px]">
      <input type="hidden" name="payload" value={JSON.stringify(data)} />
      <Result state={state} />

      <Card title="Заголовок и бейдж">
        <Field label="Заголовок секции" value={data.title} onChange={(v) => set({ title: v })} />
        <div />
        <Area label="Бейдж" rows={2} value={data.badge} onChange={(v) => set({ badge: v })} />
        <Area
          label="Бейдж на телефоне"
          rows={3}
          value={data.badgeM}
          onChange={(v) => set({ badgeM: v })}
          hint="Переносы строк повторяют макет — на узкой ширине текст стоит в три строки."
        />
      </Card>

      <div>
        <h2 className="mb-[12px] text-[16px] font-bold text-ink">Курсы ({data.courses.length})</h2>
        <ListEditor
          items={data.courses}
          onChange={(courses) => set({ courses })}
          make={() => emptyCourse(data.courses.length + 1)}
          addLabel="Добавить курс"
          itemTitle={(c, i) => `${i + 1}. ${c.num}${c.name ? `: ${c.name}` : ""}`}
          maxItems={12}
          render={(c, update, i) => (
            <>
              <Field label="Номер" value={c.num} onChange={(v) => update({ num: v })} />
              <Field label="Название" value={c.name} onChange={(v) => update({ name: v })} />
              <Area
                label="Подзаголовок"
                rows={2}
                value={c.subtitle}
                onChange={(v) => update({ subtitle: v })}
              />
              <Area
                label="Подзаголовок на телефоне"
                rows={2}
                value={c.subM ?? ""}
                onChange={(v) => update({ subM: v || undefined })}
                hint="Пусто — берётся обычный подзаголовок."
              />

              <div className="sm:col-span-2">
                <label className="flex items-center gap-[8px] text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(c.stat)}
                    onChange={(e) =>
                      update({ stat: e.target.checked || undefined, photo: e.target.checked ? undefined : c.photo })
                    }
                    className="size-[16px] accent-[#b6e835]"
                  />
                  Вместо фото — карточка со статистикой
                </label>
              </div>

              {c.stat ? null : (
                <div className="sm:col-span-2">
                  <label className={labelCls}>Фото курса</label>
                  {c.photo ? (
                    <img
                      src={photoSrc("04-programma-obucheniya", c.photo, 640)}
                      alt=""
                      className="mb-[10px] h-[120px] w-[212px] rounded-[8px] object-cover"
                    />
                  ) : (
                    <p className={`${hintCls} mb-[10px]`}>Фото ещё не выбрано.</p>
                  )}
                  <input
                    type="file"
                    name={`coursePhoto_${i}`}
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className={fileCls}
                  />
                  <p className={hintCls}>
                    Горизонтальное фото от 1400 px в ширину. Загруженное заменит текущее после
                    сохранения.
                  </p>
                </div>
              )}

              <Disciplines items={c.disciplines} onChange={(disciplines) => update({ disciplines })} />
            </>
          )}
        />
      </div>

      <Card title="Лавандовая плашка">
        <NumField
          label="После какого курса"
          value={data.highlight.after}
          onChange={(v) => set({ highlight: { ...data.highlight, after: v } })}
          hint={`Номер по порядку, от 1 до ${data.courses.length}.`}
        />
        <div />
        <Field
          label="Заголовок"
          wide
          value={data.highlight.title}
          onChange={(v) => set({ highlight: { ...data.highlight, title: v } })}
        />
        <Area
          label="Текст"
          rows={2}
          value={data.highlight.text}
          onChange={(v) => set({ highlight: { ...data.highlight, text: v } })}
        />
      </Card>

      <Card title="Карточка статистики">
        <Field
          label="Значение"
          value={data.stat.value}
          onChange={(v) => set({ stat: { ...data.stat, value: v } })}
          hint="Например «50%+»."
        />
        <Field
          label="Подпись"
          value={data.stat.note}
          onChange={(v) => set({ stat: { ...data.stat, note: v } })}
          hint="Служебное поле: сама подпись в вёрстке набрана по макету построчно."
        />
      </Card>

      <SaveBar note="Изменения появятся на сайте сразу после сохранения." />
    </form>
  );
}
