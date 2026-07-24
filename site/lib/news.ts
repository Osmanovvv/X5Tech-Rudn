// Чистое ядро новостей (Task 4.1 → переработано в B1): тип и функции без побочных эффектов.
// ВАЖНО: модуль изоморфный — никакого fs/node-API, потому что его импортирует и клиентский
// остров Novosti. Чтение из файла живёт в lib/server/news-store.ts (только сервер).
export type NewsItem = {
  slug: string;
  title: string;
  category: string;
  date: string; // ISO YYYY-MM-DD
  cover: string;
  excerpt: string;
  body: string;
};

// Канонический порядок — по дате убыванию. ISO-даты сравнимы лексикографически;
// Array.prototype.sort стабилен, поэтому при равных датах сохраняется исходный порядок.
export const sortNews = (items: NewsItem[]): NewsItem[] =>
  [...items].sort((a, b) => b.date.localeCompare(a.date));

// Последние n новостей по дате (правило роста карусели/списка). n ≤ 0 → пусто.
export const latest = (items: NewsItem[], n: number): NewsItem[] =>
  sortNews(items).slice(0, Math.max(0, n));

// Поиск одной новости по слагу; undefined — если не найдена (для notFound()).
export const getNews = (items: NewsItem[], slug: string): NewsItem | undefined =>
  items.find((item) => item.slug === slug);

// Другие новости (для блока «Другие новости» на странице новости).
export const otherNews = (items: NewsItem[], slug: string, n = 3): NewsItem[] =>
  sortNews(items.filter((item) => item.slug !== slug)).slice(0, Math.max(0, n));

// Дата новости в формате макета: «2026-06-18» → «18.06.2026».
export const formatNewsDate = (iso: string): string => iso.split("-").reverse().join(".");
