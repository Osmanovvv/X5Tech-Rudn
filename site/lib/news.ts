// Единая точка чтения новостей: сортировка по дате (свежие первыми), latest(n), поиск по слагу.
// Потребители: карусель на главной (Novosti), список /news, страница /news/[slug] (Фаза 4).
// Контент статичен на сборке (output: 'export') — все функции чистые и синхронные.
import news from "@/content/news.json";

export type NewsItem = {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO YYYY-MM-DD
  cover: string;
  excerpt: string;
  body: string;
};

const data = news as { title: string; allLabel: string; items: NewsItem[] };

// Заголовки секции из того же JSON (нужны карусели и списку /news).
export const newsMeta = { title: data.title, allLabel: data.allLabel };

// Канонический порядок — по дате убыванию. ISO-даты сравнимы лексикографически;
// Array.prototype.sort в V8 стабилен, поэтому при равных датах сохраняется исходный порядок.
const sorted: NewsItem[] = [...data.items].sort((a, b) => b.date.localeCompare(a.date));

// Все новости в каноническом порядке. Отдаём копию — чтобы вызывающий не мутировал кэш модуля.
export const allNews = (): NewsItem[] => [...sorted];

// Последние n новостей по дате (правило роста карусели/списка). n ≤ 0 → пусто.
export const latest = (n: number): NewsItem[] => sorted.slice(0, Math.max(0, n));

// Поиск одной новости по слагу; undefined — если не найдена (для notFound() в Task 4.3).
export const getNews = (slug: string): NewsItem | undefined =>
  sorted.find((item) => item.slug === slug);

// Три другие новости (для блока «Другие новости» на странице новости, Task 4.3).
export const otherNews = (slug: string, n = 3): NewsItem[] =>
  sorted.filter((item) => item.slug !== slug).slice(0, Math.max(0, n));

// Дата новости в формате макета: «2026-06-18» → «18.06.2026».
export const formatNewsDate = (iso: string): string => iso.split("-").reverse().join(".");
