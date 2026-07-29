"use client";

// Форма секции «Как поступить»: стоимость, показатели, этапы приёма и таблица экзаменов.
import { useActionState, useState } from "react";
import type { AdmissionColumn, AdmissionContent, AdmissionStep, ExamRow } from "@/lib/content-types";
import { saveAdmission, type ContentFormState } from "../actions";
import { Area, Card, Field, ListEditor, Result, SaveBar, hintCls, inputCls, labelCls } from "../ui";

const emptyStep = (): AdmissionStep => ({ date: "", title: "", text: "" });
const emptyRow = (): ExamRow => ({ subject: "", required: "", budget: "", contract: "" });

/** Колонка приёма: «Бюджет» или «Договор» — заголовок, подпись и список этапов. */
function Column({
  title,
  col,
  onChange,
}: {
  title: string;
  col: AdmissionColumn;
  onChange: (next: AdmissionColumn) => void;
}) {
  return (
    <div>
      <h2 className="mb-[12px] text-[16px] font-bold text-ink">
        {title} — этапы ({col.steps.length})
      </h2>
      <div className="mb-[14px] grid gap-[16px] rounded-[12px] border border-[#e6e6e6] bg-white p-[16px] sm:grid-cols-2">
        <Field label="Заголовок колонки" value={col.heading} onChange={(v) => onChange({ ...col, heading: v })} />
        <div />
        <Area label="Подпись" rows={2} value={col.caption} onChange={(v) => onChange({ ...col, caption: v })} />
        <Area
          label="Подпись на телефоне"
          rows={2}
          value={col.captionM ?? ""}
          onChange={(v) => onChange({ ...col, captionM: v || undefined })}
          hint="Пусто — берётся обычная подпись."
        />
      </div>
      <ListEditor
        items={col.steps}
        onChange={(steps) => onChange({ ...col, steps })}
        make={emptyStep}
        addLabel="Добавить этап"
        itemTitle={(s, i) => `${i + 1}. ${s.title || "новый этап"}`}
        maxItems={12}
        render={(s, update) => (
          <>
            <Field label="Срок" value={s.date} onChange={(v) => update({ date: v })} hint="Например «до 25 июля»." />
            <Field label="Заголовок" value={s.title} onChange={(v) => update({ title: v })} />
            <Area label="Текст" rows={2} value={s.text} onChange={(v) => update({ text: v })} />
            <Area
              label="Текст на телефоне"
              rows={2}
              value={s.m ?? ""}
              onChange={(v) => update({ m: v || undefined })}
              hint="Пусто — берётся обычный текст."
            />
          </>
        )}
      />
    </div>
  );
}

export default function AdmissionForm({ initial }: { initial: AdmissionContent }) {
  const [state, action] = useActionState<ContentFormState, FormData>(saveAdmission, undefined);
  const [data, setData] = useState<AdmissionContent>(initial);
  const set = (patch: Partial<AdmissionContent>) => setData({ ...data, ...patch });

  return (
    <form action={action} className="mt-[24px] flex flex-col gap-[20px]">
      <input type="hidden" name="payload" value={JSON.stringify(data)} />
      <Result state={state} />

      <Card title="Заголовки секции">
        <Field label="Заголовок" value={data.title} onChange={(v) => set({ title: v })} />
        <div />
        <Area label="Подзаголовок" rows={2} value={data.subtitle} onChange={(v) => set({ subtitle: v })} />
        <Area
          label="Подзаголовок на телефоне"
          rows={3}
          value={data.subtitleM}
          onChange={(v) => set({ subtitleM: v })}
          hint="Переносы строк повторяют макет."
        />
      </Card>

      <Card title="Стоимость">
        <Field label="Подпись" value={data.price.label} onChange={(v) => set({ price: { ...data.price, label: v } })} />
        <Field
          label="Значение"
          value={data.price.value}
          onChange={(v) => set({ price: { ...data.price, value: v } })}
          hint="Показывается и на десктопе, и на телефоне."
        />
        <Field
          label="Сноска"
          wide
          value={data.price.note}
          onChange={(v) => set({ price: { ...data.price, note: v } })}
        />
      </Card>

      <div>
        <h2 className="mb-[12px] text-[16px] font-bold text-ink">Показатели</h2>
        <p className={`${hintCls} mb-[12px] mt-0`}>
          Ровно три карточки — столько мест в макете. Цифра оживает счётчиком, поэтому в поле
          «значение» нужны только цифры.
        </p>
        <div className="grid gap-[14px] sm:grid-cols-3">
          {data.stats.map((s, i) => (
            <div key={i} className="rounded-[12px] border border-[#e6e6e6] bg-white p-[14px]">
              <label className={labelCls}>Подпись</label>
              <input
                className={inputCls}
                value={s.label}
                onChange={(e) =>
                  set({ stats: data.stats.map((x, j) => (i === j ? { ...x, label: e.target.value } : x)) })
                }
              />
              <label className={`${labelCls} mt-[10px]`}>Вторая строка</label>
              <input
                className={inputCls}
                value={s.sub ?? ""}
                placeholder="можно пусто"
                onChange={(e) =>
                  set({
                    stats: data.stats.map((x, j) =>
                      i === j ? { ...x, sub: e.target.value || undefined } : x,
                    ),
                  })
                }
              />
              <div className="mt-[10px] grid grid-cols-2 gap-[10px]">
                <div>
                  <label className={labelCls}>Значение</label>
                  <input
                    className={inputCls}
                    value={s.value}
                    onChange={(e) =>
                      set({ stats: data.stats.map((x, j) => (i === j ? { ...x, value: e.target.value } : x)) })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Приписка</label>
                  <input
                    className={inputCls}
                    value={s.unit ?? ""}
                    placeholder="года"
                    onChange={(e) =>
                      set({
                        stats: data.stats.map((x, j) =>
                          i === j ? { ...x, unit: e.target.value || undefined } : x,
                        ),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Column title="Бюджет" col={data.budget} onChange={(budget) => set({ budget })} />
      <Column title="Договор" col={data.contract} onChange={(contract) => set({ contract })} />

      <Card title="Вступительные экзамены">
        <Field label="Заголовок" value={data.exams.title} onChange={(v) => set({ exams: { ...data.exams, title: v } })} />
        <div />
        <Area
          label="Подпись"
          rows={2}
          value={data.exams.caption}
          onChange={(v) => set({ exams: { ...data.exams, caption: v } })}
        />
        <Area
          label="Подпись на телефоне"
          rows={2}
          value={data.exams.captionM ?? ""}
          onChange={(v) => set({ exams: { ...data.exams, captionM: v || undefined } })}
          hint="Пусто — берётся обычная подпись."
        />
        <div className="sm:col-span-2">
          <label className={labelCls}>Заголовки колонок таблицы</label>
          <div className="grid gap-[10px] sm:grid-cols-4">
            {data.exams.columns.map((c, i) => (
              <input
                key={i}
                className={inputCls}
                value={c}
                onChange={(e) =>
                  set({
                    exams: {
                      ...data.exams,
                      columns: data.exams.columns.map((x, j) => (i === j ? e.target.value : x)),
                    },
                  })
                }
              />
            ))}
          </div>
          <p className={hintCls}>Колонок ровно четыре — по числу столбцов в макете.</p>
        </div>
      </Card>

      <div>
        <h2 className="mb-[12px] text-[16px] font-bold text-ink">
          Строки таблицы экзаменов ({data.exams.rows.length})
        </h2>
        <ListEditor
          items={data.exams.rows}
          onChange={(rows) => set({ exams: { ...data.exams, rows } })}
          make={emptyRow}
          addLabel="Добавить предмет"
          itemTitle={(r, i) => `${i + 1}. ${r.subject || "новый предмет"}`}
          maxItems={12}
          render={(r, update) => (
            <>
              <Field label="Предмет" value={r.subject} onChange={(v) => update({ subject: v })} />
              <Field
                label="Условие"
                value={r.required}
                onChange={(v) => update({ required: v })}
                hint="Что написано во второй колонке."
              />
              <Field label="Балл: бюджет" value={r.budget} onChange={(v) => update({ budget: v })} />
              <Field label="Балл: договор" value={r.contract} onChange={(v) => update({ contract: v })} />
            </>
          )}
        />
      </div>

      <SaveBar note="Изменения появятся на сайте сразу после сохранения." />
    </form>
  );
}
