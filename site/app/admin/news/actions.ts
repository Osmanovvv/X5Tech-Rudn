"use server";

// CRUD новостей (Task B3). Каждое действие само проверяет сессию и источник запроса:
// Server Actions вызываются по сети напрямую, layout для них не выполняется.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, sameOrigin } from "@/lib/server/auth";
import { getAllNewsForEdit, saveAllNews } from "@/lib/server/news-store";
import { DataUnreadableError } from "@/lib/server/store";
import { removeCover, saveCover } from "@/lib/server/uploads";
import { slugify } from "@/lib/slug";
import { formFile, formFiles, formString, formText } from "@/lib/form";
import { bodyUploads, type NewsItem } from "@/lib/news";

export type NewsFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

// Преамбула любого мутирующего действия: живая сессия + свой источник запроса.
// Вынесена не ради краткости, а чтобы проверка не могла разойтись между действиями
// и чтобы её нельзя было забыть, добавляя новое: Server Actions вызываются по сети
// напрямую, и пропуск этих двух строк открывает запись кому угодно.
// Возвращает состояние с отказом либо undefined, если проверка пройдена.
async function denyIfNotAdmin(): Promise<NewsFormState> {
  await requireAdmin(); // нет сессии → редирект на форму входа, дальше код не идёт
  if (!(await sameOrigin())) return { error: "Запрос отклонён (посторонний источник)." };
  return undefined;
}

// Страницы, которые показывают новости. Вызывается после каждой правки — контент на сайте
// обновляется без пересборки (в статическом режиме этого нет, см. README).
// Обновляем ВЕСЬ сегмент /news/[slug], а не только изменённый адрес: блок «Другие новости»
// есть на каждой странице новости, и без этого он показывал бы старые карточки и ссылки
// на уже удалённые новости.
function revalidateNews() {
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/news/[slug]", "page");
}

// Чтение списка перед правкой. Повреждённый файл — не повод записать поверх него сид.
function readForEdit(): { items: NewsItem[] } | { error: string } {
  try {
    return { items: getAllNewsForEdit() };
  } catch (e) {
    if (e instanceof DataUnreadableError) {
      return {
        error:
          "Файл новостей повреждён и не читается. Правка заблокирована, чтобы не потерять данные — " +
          "проверьте news.json в каталоге данных (подробности в журнале сервера).",
      };
    }
    throw e;
  }
}

// Уникальный слаг: «мой-заголовок», при совпадении — «-2», «-3», …
function uniqueSlug(title: string, items: NewsItem[], keepSlug?: string): string {
  const base = slugify(title).slice(0, 80) || "novost";
  let candidate = base;
  let n = 2;
  while (items.some((i) => i.slug === candidate && i.slug !== keepSlug)) candidate = `${base}-${n++}`;
  return candidate;
}

function readFields(formData: FormData) {
  // formText нормализует CRLF и обрезает края; не-строки (например, подсунутый файл)
  // читаются как пустое значение и не проходят валидацию — см. lib/form.ts
  return {
    title: formText(formData, "title"),
    category: formText(formData, "category"),
    date: formText(formData, "date"),
    excerpt: formText(formData, "excerpt"),
    body: formText(formData, "body"),
  };
}

// Картинки для ТЕЛА новости (макеты новостей 2–4): загружаются тем же конвейером, что обложка,
// а в текст дописываются готовыми markdown-строками — редактор потом переносит их между абзацами.
// Возвращает дополненный текст либо ошибку поля.
async function attachBodyImages(
  formData: FormData,
  body: string,
  titleHint: string
): Promise<{ body: string } | { error: string }> {
  const files = formFiles(formData, "bodyImages");
  if (!files.length) return { body };
  if (files.length > 6) return { error: "За раз можно добавить не больше шести картинок." };

  const added: string[] = [];
  for (const file of files) {
    const saved = await saveCover(file, `${titleHint}-v-tekste`);
    if (!saved.ok) {
      added.forEach(removeCover); // не оставляем полузагруженный набор в каталоге
      return { error: saved.error };
    }
    added.push(saved.cover);
  }
  const markers = added.map((ref) => `![](${ref})`).join("\n\n");
  return { body: `${body}\n\n${markers}` };
}

function validate(f: ReturnType<typeof readFields>): Record<string, string> {
  const e: Record<string, string> = {};
  if (f.title.length < 3) e.title = "Заголовок — минимум 3 символа.";
  if (f.title.length > 160) e.title = "Заголовок длиннее 160 символов.";
  if (!f.category) e.category = "Укажите категорию (например, «события»).";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) e.date = "Дата в формате ГГГГ-ММ-ДД.";
  else if (Number.isNaN(new Date(f.date).getTime())) e.date = "Такой даты не существует.";
  if (f.excerpt.length < 10) e.excerpt = "Короткое описание — минимум 10 символов.";
  if (f.excerpt.length > 300) e.excerpt = "Описание длиннее 300 символов.";
  if (f.body.length < 10) e.body = "Текст новости — минимум 10 символов.";
  return e;
}

export async function createNews(_prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const fields = readFields(formData);
  const fieldErrors = validate(fields);
  const cover = formFile(formData, "cover");
  if (!cover) fieldErrors.cover = "Загрузите обложку.";
  // Проверка на !cover нужна и здесь: без неё тип остаётся File | null и требует приведения
  if (!cover || Object.keys(fieldErrors).length) return { fieldErrors };

  const uploaded = await saveCover(cover, fields.title);
  if (!uploaded.ok) return { fieldErrors: { cover: uploaded.error } };

  const withImages = await attachBodyImages(formData, fields.body, fields.title);
  if ("error" in withImages) {
    removeCover(uploaded.cover);
    return { fieldErrors: { bodyImages: withImages.error } };
  }
  fields.body = withImages.body;

  // Список читаем ПОСЛЕ обработки картинки: пересжатие занимает сотни миллисекунд, и снимок,
  // сделанный до него, мог устареть — параллельная правка была бы затёрта целиком.
  const current = readForEdit();
  if ("error" in current) {
    // Новость не создаётся — только что сохранённая обложка осталась бы мусором в каталоге
    removeCover(uploaded.cover);
    return { error: current.error };
  }

  const item: NewsItem = {
    ...fields,
    slug: uniqueSlug(fields.title, current.items),
    cover: uploaded.cover,
  };
  await saveAllNews([item, ...current.items]);
  revalidateNews();
  redirect("/admin/news");
}

export async function updateNews(_prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const currentSlug = formString(formData, "slug");
  const fields = readFields(formData);
  const fieldErrors = validate(fields);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  // Сначала долгая операция (пересжатие обложки), и только потом — чтение списка и запись.
  // Если читать список до неё, параллельная правка за это время была бы затёрта.
  let newCover: string | null = null;
  const cover = formFile(formData, "cover");
  if (cover) {
    const uploaded = await saveCover(cover, fields.title);
    if (!uploaded.ok) return { fieldErrors: { cover: uploaded.error } };
    newCover = uploaded.cover;
  }

  const withImages = await attachBodyImages(formData, fields.body, fields.title);
  if ("error" in withImages) {
    if (newCover) removeCover(newCover);
    return { fieldErrors: { bodyImages: withImages.error } };
  }
  fields.body = withImages.body;

  const current = readForEdit();
  if ("error" in current) return { error: current.error };

  const existing = current.items.find((i) => i.slug === currentSlug);
  if (!existing) return { error: "Новость не найдена — возможно, её уже удалили." };

  // Слаг менять не будем, если заголовок правится: старые ссылки на новость должны продолжать
  // работать. Пересоздать адрес можно, удалив новость и заведя заново.
  const updated: NewsItem = { ...fields, slug: existing.slug, cover: newCover ?? existing.cover };
  await saveAllNews(current.items.map((i) => (i.slug === existing.slug ? updated : i)));

  // Прежняя обложка больше не нужна — иначе каталог загрузок растёт без предела,
  // а замененные картинки остаются доступными по прямой ссылке.
  if (newCover && existing.cover !== newCover) removeCover(existing.cover);
  // То же для картинок внутри текста: редактор стёр строку ![](upload:…) — удаляем файл
  const kept = new Set(bodyUploads(updated.body));
  bodyUploads(existing.body)
    .filter((ref) => !kept.has(ref))
    .forEach(removeCover);

  revalidateNews();
  redirect("/admin/news");
}

// Удаление возвращает состояние, а не void: раньше при повреждённом файле, чужом источнике
// или уже удалённой новости действие просто выходило — пользователь жал «Да, удалить»
// и не получал никакого ответа, а новость оставалась на месте.
export async function deleteNews(_prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const slug = formString(formData, "slug");
  const current = readForEdit();
  if ("error" in current) return { error: current.error }; // файл повреждён — удалять вслепую нельзя

  const doomed = current.items.find((i) => i.slug === slug);
  if (!doomed) return { error: "Новость не найдена — возможно, её уже удалили. Обновите страницу." };

  await saveAllNews(current.items.filter((i) => i.slug !== slug));
  // Не оставляем осиротевшие файлы в каталоге загрузок — ни обложку, ни картинки из текста
  removeCover(doomed.cover);
  bodyUploads(doomed.body).forEach(removeCover);
  revalidateNews();
  redirect("/admin/news");
}
