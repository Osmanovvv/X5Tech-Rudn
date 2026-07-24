"use client";

// Форма создания/редактирования новости (Task B3). Клиентский компонент — ради показа ошибок
// полей и состояния отправки; вся валидация дублируется на сервере (см. actions.ts).
import { useActionState } from "react";
import Link from "next/link";
import type { NewsItem } from "@/lib/news";
import { createNews, updateNews, type NewsFormState } from "./actions";

const input =
  "h-[42px] w-full rounded-[5px] border border-[#e6e6e6] bg-white px-[12px] text-[14px] text-ink outline-none transition-colors duration-200 ease-motion focus:border-[#b6e835]";
const label = "mb-[6px] block text-[12px] font-medium text-[rgba(39,39,39,0.85)]";
const errText = "mt-[4px] text-[12px] text-red-600";

export default function NewsForm({ item }: { item?: NewsItem }) {
  const isEdit = Boolean(item);
  const [state, action, pending] = useActionState<NewsFormState, FormData>(
    isEdit ? updateNews : createNews,
    undefined,
  );
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={action} className="mt-[24px] flex flex-col gap-[18px]">
      {isEdit && <input type="hidden" name="slug" value={item!.slug} />}

      <div>
        <label htmlFor="title" className={label}>
          Заголовок
        </label>
        <input id="title" name="title" defaultValue={item?.title} required className={input} />
        {fe.title && <p className={errText}>{fe.title}</p>}
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
            className={input}
          />
          {fe.category && <p className={errText}>{fe.category}</p>}
        </div>
        <div className="sm:w-[200px]">
          <label htmlFor="date" className={label}>
            Дата публикации
          </label>
          <input id="date" name="date" type="date" defaultValue={item?.date} required className={input} />
          {fe.date && <p className={errText}>{fe.date}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className={label}>
          Короткое описание (в карточке)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          defaultValue={item?.excerpt}
          required
          rows={2}
          className={`${input} h-auto resize-y py-[10px]`}
        />
        {fe.excerpt && <p className={errText}>{fe.excerpt}</p>}
      </div>

      <div>
        <label htmlFor="body" className={label}>
          Текст новости
        </label>
        <textarea
          id="body"
          name="body"
          defaultValue={item?.body}
          required
          rows={10}
          className={`${input} h-auto resize-y py-[10px] leading-[22px]`}
        />
        <p className="mt-[4px] text-[12px] text-[rgba(39,39,39,0.72)]">
          Пустая строка между абзацами разделит текст на абзацы.
        </p>
        {fe.body && <p className={errText}>{fe.body}</p>}
      </div>

      <div>
        <label htmlFor="cover" className={label}>
          Обложка {isEdit && <span className="font-normal">(оставьте пустым, чтобы не менять)</span>}
        </label>
        <input
          id="cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="w-full text-[13px] text-ink file:mr-[12px] file:h-[36px] file:cursor-pointer file:rounded-[5px] file:border-0 file:bg-lime file:px-[16px] file:text-[13px] file:font-bold file:text-ink"
        />
        <p className="mt-[4px] text-[12px] text-[rgba(39,39,39,0.72)]">
          JPEG, PNG, WebP или AVIF, шире 600 px, до 8 МБ. Сжатие и подгонка размеров — автоматически.
        </p>
        {fe.cover && <p className={errText}>{fe.cover}</p>}
      </div>

      {state?.error && (
        <p role="alert" className="text-[13px] text-red-600">
          {state.error}
        </p>
      )}

      <div className="mt-[6px] flex items-center gap-[12px]">
        <button
          type="submit"
          disabled={pending}
          className="h-[46px] rounded-[5px] bg-lime px-[28px] text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Сохраняем…" : isEdit ? "Сохранить" : "Опубликовать"}
        </button>
        <Link
          href="/admin/news"
          className="text-[13px] text-[rgba(39,39,39,0.72)] underline underline-offset-2 hover:text-ink"
        >
          Отмена
        </Link>
      </div>
    </form>
  );
}
