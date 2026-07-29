"use client";

// Форма секции «Преподаватели и эксперты».
import { useActionState, useState } from "react";
import { photoSrc } from "@/lib/content-assets";
import type { Teacher, TeachersContent } from "@/lib/content-types";
import { saveTeachers, type ContentFormState } from "../actions";
import { Area, Card, Field, ListEditor, NumField, Result, SaveBar, hintCls, labelCls } from "../ui";

const fileCls =
  "w-full text-[13px] text-ink file:mr-[12px] file:h-[34px] file:cursor-pointer file:rounded-[5px] file:border-0 file:bg-lime file:px-[16px] file:text-[12px] file:font-bold file:text-ink";

const emptyTeacher = (): Teacher => ({
  photo: "",
  crop: { h: 100, top: 0 },
  name: "",
  spec: "",
});

export default function TeachersForm({ initial }: { initial: TeachersContent }) {
  const [state, action] = useActionState<ContentFormState, FormData>(saveTeachers, undefined);
  const [data, setData] = useState<TeachersContent>(initial);
  const set = (patch: Partial<TeachersContent>) => setData({ ...data, ...patch });

  return (
    <form action={action} className="mt-[24px] flex flex-col gap-[20px]">
      {/* Всё содержимое уходит одним полем; файлы фотографий — отдельными, по индексу строки */}
      <input type="hidden" name="payload" value={JSON.stringify(data)} />
      <Result state={state} />

      <Card title="Заголовки секции">
        <Field label="Заголовок" value={data.title} onChange={(v) => set({ title: v })} />
        <Field
          label="Заголовок на телефоне"
          value={data.titleM}
          onChange={(v) => set({ titleM: v })}
          hint="Перенос строки в этом поле — перенос в вёрстке."
        />
        <Area
          label="Подзаголовок"
          value={data.subtitle}
          onChange={(v) => set({ subtitle: v })}
          hint="Переносы строк сохраняются как есть — они повторяют макет."
        />
        <Area
          label="Подзаголовок на телефоне"
          value={data.subtitleM}
          onChange={(v) => set({ subtitleM: v })}
        />
      </Card>

      <div>
        <h2 className="mb-[12px] text-[16px] font-bold text-ink">
          Состав ({data.teachers.length})
        </h2>
        <ListEditor
          items={data.teachers}
          onChange={(teachers) => set({ teachers })}
          make={emptyTeacher}
          addLabel="Добавить преподавателя"
          itemTitle={(t, i) => `${i + 1}. ${t.name.replace(/\n/g, " ") || "новый преподаватель"}`}
          maxItems={40}
          render={(t, update, i) => (
            <>
              <Area
                label="ФИО"
                rows={2}
                value={t.name}
                onChange={(v) => update({ name: v })}
                hint="В карточке две строки: фамилия с именем, затем отчество — разбейте переносом."
              />
              <Area
                label="Специализация"
                rows={4}
                value={t.spec}
                onChange={(v) => update({ spec: v })}
                hint="Переносы строк сохраняются: в карточке текст выключен по макету."
              />

              <div>
                <label className={labelCls}>Фото</label>
                {t.photo ? (
                  // Предпросмотр в пропорции карточки: сразу видно, что попадёт в кадр
                  <div className="mb-[10px] h-[120px] w-[104px] overflow-hidden rounded-[8px] bg-[#eee]">
                    <img
                      src={photoSrc("07-prepodavateli", t.photo, 640)}
                      alt=""
                      className="w-full"
                      style={{ translate: `0 ${((t.crop.top / t.crop.h) * 100).toFixed(3)}%` }}
                    />
                  </div>
                ) : (
                  <p className={`${hintCls} mb-[10px]`}>Фото ещё не выбрано.</p>
                )}
                <input
                  type="file"
                  name={`teacherPhoto_${i}`}
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className={fileCls}
                />
                <p className={hintCls}>
                  Портрет от 600 px в ширину, лучше 1200 и больше. Загруженное фото заменит текущее
                  после сохранения, кадрирование сбросится на «как есть».
                </p>
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                <NumField
                  label="Кадр: высота, %"
                  value={t.crop.h}
                  step={0.01}
                  onChange={(v) => update({ crop: { ...t.crop, h: v } })}
                  hint="100 — фото целиком."
                />
                <NumField
                  label="Кадр: сдвиг, %"
                  value={t.crop.top}
                  step={0.01}
                  onChange={(v) => update({ crop: { ...t.crop, top: v } })}
                  hint="Минус — поднять кадр."
                />
                <label className="col-span-2 flex items-center gap-[8px] text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(t.fill)}
                    onChange={(e) => update({ fill: e.target.checked || undefined })}
                    className="size-[16px] accent-[#b6e835]"
                  />
                  Фото во всю высоту карточки
                </label>
              </div>
            </>
          )}
        />
      </div>

      <SaveBar note="Изменения появятся на сайте сразу после сохранения." />
    </form>
  );
}
