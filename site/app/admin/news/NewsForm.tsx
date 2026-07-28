"use client";

// Форма создания/редактирования новости (Task B3). Клиентский компонент — ради показа ошибок
// полей, счётчиков длины и состояния отправки; вся валидация дублируется на сервере
// (см. actions.ts): без этого форму можно было бы обойти запросом напрямую.
import { useActionState, useState } from "react";
import Link from "next/link";
import type { NewsItem } from "@/lib/news";
import { createNews, updateNews, type NewsFormState } from "./actions";

const input =
  "h-[45px] w-full rounded-[5px] border border-[#e6e6e6] bg-white px-[14px] text-[14px] text-ink outline-none transition-colors duration-200 ease-motion placeholder:text-[rgba(39,39,39,0.4)] focus:border-[#b6e835]";
const label = "mb-[6px] block text-[12px] font-medium text-ink";
const hint = "mt-[6px] text-[12px] leading-[18px] text-[rgba(39,39,39,0.6)]";
const errText = "mt-[6px] text-[12px] text-red-600";
const fileInput =
  "w-full text-[13px] text-ink file:mr-[12px] file:h-[38px] file:cursor-pointer file:rounded-[5px] file:border-0 file:px-[18px] file:text-[13px] file:font-bold file:text-ink";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-[15px] border border-hairline bg-paper p-[20px]">
      <legend className="px-[6px] text-[12px] font-bold uppercase tracking-[0.04em] text-[rgba(39,39,39,0.6)]">
        {title}
      </legend>
      <div className="flex flex-col gap-[18px]">{children}</div>
    </fieldset>
  );
}

// Счётчик краснеет на подходе к пределу, который проверит сервер, — чтобы не узнавать
// о превышении только после отправки
function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span
      className={`text-[12px] tabular-nums ${value > max ? "text-red-600" : "text-[rgba(39,39,39,0.5)]"}`}
    >
      {value} / {max}
    </span>
  );
}

export default function NewsForm({ item }: { item?: NewsItem }) {
  const isEdit = Boolean(item);
  const [state, action, pending] = useActionState<NewsFormState, FormData>(
    isEdit ? updateNews : createNews,
    undefined,
  );
  const fe = state?.fieldErrors ?? {};

  const [title, setTitle] = useState(item?.title ?? "");
  const [excerpt, setExcerpt] = useState(item?.excerpt ?? "");
  // У новой новости дата по умолчанию — сегодняшняя: пустое поле легко не заметить,
  // а от даты зависит порядок на сайте
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="mt-[24px] flex flex-col gap-[16px]">
      {isEdit && <input type="hidden" name="slug" value={item!.slug} />}

      <Section title="О чём новость">
        <div>
          <div className="flex items-end justify-between gap-[12px]">
            <label htmlFor="title" className={label}>
              Заголовок
            </label>
            <Counter value={title.length} max={160} />
          </div>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="День открытых дверей программы ИИ"
            className={input}
          />
          {fe.title ? (
            <p className={errText}>{fe.title}</p>
          ) : (
            !isEdit && (
              <p className={hint}>
                По заголовку составится адрес страницы. Потом он не меняется — чтобы уже
                разосланные ссылки продолжали работать.
              </p>
            )
          )}
        </div>

        <div className="flex flex-col gap-[18px] sm:flex-row">
          <div className="flex-1">
            <label htmlFor="category" className={label}>
              Категория
            </label>
            <input
              id="category"
              name="category"
              defaultValue={item?.category ?? "события"}
              required
              placeholder="события"
              className={input}
            />
            {fe.category ? (
              <p className={errText}>{fe.category}</p>
            ) : (
              <p className={hint}>Показывается плашкой поверх обложки.</p>
            )}
          </div>
          <div className="sm:w-[220px]">
            <label htmlFor="date" className={label}>
              Дата публикации
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={item?.date ?? today}
              required
              className={input}
            />
            {fe.date ? (
              <p className={errText}>{fe.date}</p>
            ) : (
              <p className={hint}>По ней новости сортируются.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between gap-[12px]">
            <label htmlFor="excerpt" className={label}>
              Короткое описание
            </label>
            <Counter value={excerpt.length} max={300} />
          </div>
          <textarea
            id="excerpt"
            name="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            placeholder="Одно-два предложения — их видно в карточке на главной"
            className={`${input} h-auto resize-y py-[12px] leading-[20px]`}
          />
          {fe.excerpt && <p className={errText}>{fe.excerpt}</p>}
        </div>
      </Section>

      <Section title="Текст">
        <div>
          <label htmlFor="body" className={label}>
            Текст новости
          </label>
          <textarea
            id="body"
            name="body"
            defaultValue={item?.body}
            required
            rows={12}
            placeholder={"Первый абзац.\n\nВторой абзац — между ними пустая строка."}
            className={`${input} h-auto resize-y py-[12px] leading-[22px]`}
          />
          {fe.body && <p className={errText}>{fe.body}</p>}
          <div className="mt-[10px] rounded-[8px] bg-white p-[12px] text-[12px] leading-[19px] text-[rgba(39,39,39,0.72)]">
            <p>
              <span className="font-bold text-ink">Абзацы</span> разделяются пустой строкой.
            </p>
            <p className="mt-[6px]">
              <span className="font-bold text-ink">Картинка</span> — отдельной строкой:{" "}
              <code className="rounded bg-mist px-[5px] py-[1px]">![подпись](upload:имя)</code>
            </p>
            <p className="mt-[6px]">
              <span className="font-bold text-ink">Две в ряд</span> — обе записи в одной строке:{" "}
              <code className="rounded bg-mist px-[5px] py-[1px]">![](upload:a) ![](upload:b)</code>
            </p>
          </div>
        </div>
      </Section>

      <Section title="Картинки">
        <div>
          <label htmlFor="cover" className={label}>
            Обложка{" "}
            {isEdit && (
              <span className="font-normal text-[rgba(39,39,39,0.6)]">— оставьте пустым, чтобы не менять</span>
            )}
          </label>
          <input
            id="cover"
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className={`${fileInput} file:bg-lime`}
          />
          {fe.cover ? (
            <p className={errText}>{fe.cover}</p>
          ) : (
            <p className={hint}>
              JPEG, PNG, WebP или AVIF, до 8 МБ. Сжатие и размеры — автоматически. Лучше брать
              исходник шириной от 2240 px: на странице новости обложка большая, и на экранах
              с высокой плотностью точек мелкий файл выглядит нерезким.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bodyImages" className={label}>
            Картинки в текст{" "}
            <span className="font-normal text-[rgba(39,39,39,0.6)]">— необязательно, до шести за раз</span>
          </label>
          <input
            id="bodyImages"
            name="bodyImages"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className={`${fileInput} file:bg-mist`}
          />
          {fe.bodyImages ? (
            <p className={errText}>{fe.bodyImages}</p>
          ) : (
            <p className={hint}>
              После сохранения строки <code className="rounded bg-mist px-[5px] py-[1px]">![](upload:…)</code>{" "}
              допишутся в конец текста — откройте новость снова и перенесите их между нужными
              абзацами.
            </p>
          )}
        </div>
      </Section>

      {state?.error && (
        <p role="alert" className="rounded-[8px] bg-red-50 p-[14px] text-[13px] leading-[20px] text-red-700">
          {state.error}
        </p>
      )}

      <div className="mt-[4px] flex flex-wrap items-center gap-[14px]">
        <button
          type="submit"
          disabled={pending}
          className="h-[50px] rounded-[5px] bg-lime px-[32px] text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
        >
          {pending ? "Сохраняем…" : isEdit ? "Сохранить изменения" : "Опубликовать"}
        </button>
        <Link
          href="/admin/news"
          className="text-[13px] text-[rgba(39,39,39,0.72)] underline underline-offset-2 transition-colors duration-200 ease-motion hover:text-ink"
        >
          Отмена
        </Link>
        {pending && (
          <span className="text-[12px] text-[rgba(39,39,39,0.6)]">
            картинки пересжимаются, это несколько секунд
          </span>
        )}
      </div>
    </form>
  );
}
