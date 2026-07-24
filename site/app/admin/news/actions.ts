"use server";

// CRUD новостей (Task B3). Каждое действие само проверяет сессию и источник запроса:
// Server Actions вызываются по сети напрямую, layout для них не выполняется.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, sameOrigin } from "@/lib/server/auth";
import { getAllNews, saveAllNews } from "@/lib/server/news-store";
import { saveCover } from "@/lib/server/uploads";
import { slugify } from "@/lib/slug";
import type { NewsItem } from "@/lib/news";

export type NewsFormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

// Страницы, которые показывают новости. Вызывается после каждой правки — контент на сайте
// обновляется без пересборки (в статическом режиме этого нет, см. README).
function revalidateNews(slug?: string) {
  revalidatePath("/");
  revalidatePath("/news");
  if (slug) revalidatePath(`/news/${slug}`);
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
  // Браузер по спецификации отправляет содержимое textarea с переводами строк CRLF. Если это
  // не нормализовать, разбиение текста на абзацы (по пустой строке) не сработает и вся новость
  // склеится в один абзац — поймано e2e.
  const get = (k: string) => String(formData.get(k) ?? "").replace(/\r\n/g, "\n").trim();
  return {
    title: get("title"),
    category: get("category"),
    date: get("date"),
    excerpt: get("excerpt"),
    body: get("body"),
  };
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
  await requireAdmin();
  if (!(await sameOrigin())) return { error: "Запрос отклонён (посторонний источник)." };

  const fields = readFields(formData);
  const fieldErrors = validate(fields);
  const file = formData.get("cover");
  if (!(file instanceof File) || file.size === 0) fieldErrors.cover = "Загрузите обложку.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const uploaded = await saveCover(file as File, fields.title);
  if (!uploaded.ok) return { fieldErrors: { cover: uploaded.error } };

  const items = getAllNews();
  const item: NewsItem = { ...fields, slug: uniqueSlug(fields.title, items), cover: uploaded.cover };
  await saveAllNews([item, ...items]);
  revalidateNews(item.slug);
  redirect("/admin/news");
}

export async function updateNews(_prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  await requireAdmin();
  if (!(await sameOrigin())) return { error: "Запрос отклонён (посторонний источник)." };

  const currentSlug = String(formData.get("slug") ?? "");
  const items = getAllNews();
  const existing = items.find((i) => i.slug === currentSlug);
  if (!existing) return { error: "Новость не найдена — возможно, её уже удалили." };

  const fields = readFields(formData);
  const fieldErrors = validate(fields);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  let cover = existing.cover;
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    const uploaded = await saveCover(file, fields.title);
    if (!uploaded.ok) return { fieldErrors: { cover: uploaded.error } };
    cover = uploaded.cover;
  }

  // Слаг менять не будем, если заголовок правится: старые ссылки на новость должны продолжать
  // работать. Пересоздать адрес можно, удалив новость и заведя заново.
  const updated: NewsItem = { ...fields, slug: existing.slug, cover };
  await saveAllNews(items.map((i) => (i.slug === existing.slug ? updated : i)));
  revalidateNews(updated.slug);
  redirect("/admin/news");
}

export async function deleteNews(formData: FormData): Promise<void> {
  await requireAdmin();
  if (!(await sameOrigin())) return;

  const slug = String(formData.get("slug") ?? "");
  const items = getAllNews();
  if (!items.some((i) => i.slug === slug)) return;

  await saveAllNews(items.filter((i) => i.slug !== slug));
  revalidateNews(slug);
  redirect("/admin/news");
}
