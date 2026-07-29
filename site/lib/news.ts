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

// Путь к обложке. Два источника:
//   «asset-6eab3432»      — картинки из макета, лежат в public/img/11-novosti (пайплайн Task 0.3);
//   «upload:<имя>»        — загруженные через админку, лежат в DATA_DIR/uploads и отдаются
//                           роутом /api/uploads (переживают пересборку, бэкапятся с данными).
// Результат ещё нужно прогнать через asset() — он добавит basePath.
// Ширины, в которых существует обложка. У двух источников они РАЗНЫЕ, и это не мелочь:
// загруженная через админку картинка режется конвейером в три ширины (lib/server/uploads.ts),
// а макетные лежат в репозитории только в 640 и 1400 — исходник шириной 1400, и файла 2240
// у них физически нет. Один общий список давал 404 на каждой странице с макетной обложкой.
export const UPLOAD_COVER_WIDTHS = [640, 1400, 2240] as const;
export const ASSET_COVER_WIDTHS = [640, 1400] as const;
export type CoverWidth = (typeof UPLOAD_COVER_WIDTHS)[number];

export const isUploadedCover = (cover: string): boolean => cover.startsWith("upload:");

/** Ширины, в которых обложка реально существует. */
export const coverWidths = (cover: string): readonly CoverWidth[] =>
  isUploadedCover(cover) ? UPLOAD_COVER_WIDTHS : ASSET_COVER_WIDTHS;

export const coverPath = (cover: string, width: CoverWidth): string =>
  cover.startsWith("upload:")
    ? `/api/uploads/${cover.slice("upload:".length)}-${width}w.webp`
    : `/img/11-novosti/${cover}-${width}w.webp`;

// ===== Разбор тела новости на блоки =====
//
// В макетах новостей 2–4 (391:872 / 391:988 / 391:1107) внутри текста стоят картинки: одна на
// всю ширину колонки, две подряд на своих строках и две в ряд. Чтобы это можно было набрать
// в обычном textarea админки, картинка записывается markdown-синтаксисом на ОТДЕЛЬНОЙ строке:
//
//   ![подпись к фото](upload:den-otkrytyh-dverej-mfk3x1)   — одна картинка во всю колонку
//   ![слева](upload:a) ![справа](upload:b)                 — две в ряд (в одной строке)
//
// Ссылка — то же значение, что и у cover: «upload:<имя>» для загруженного через админку файла
// или «<slug>» для картинки из макета в public/img/11-novosti.
export type NewsBlock =
  | { kind: "p"; text: string }
  | { kind: "figure"; images: { src: string; alt: string }[] };

const IMG_RE = /!\[([^\]]*)\]\(\s*([A-Za-z0-9:_-]+)\s*\)/g;

/** Ссылки на загруженные файлы внутри текста — нужны, чтобы удалять их вместе с новостью. */
export const bodyUploads = (body: string): string[] =>
  [...body.matchAll(IMG_RE)].map((m) => m[2]).filter((src) => src.startsWith("upload:"));

export function parseBody(body: string): NewsBlock[] {
  const blocks: NewsBlock[] = [];
  // Абзацы разделяются пустой строкой. Регулярка терпима к CRLF и лишним пробелам — текст
  // может прийти и из репозитория, и из формы админки.
  for (const chunk of body.split(/\r?\n\s*\r?\n/)) {
    const para = chunk.trim();
    if (!para) continue;
    // Абзац целиком состоит из картинок → это блок-иллюстрация, а не текст
    const only = para.replace(IMG_RE, "").trim();
    if (!only) {
      const images = [...para.matchAll(IMG_RE)].map((m) => ({ alt: m[1].trim(), src: m[2] }));
      // Больше двух в ряд макет не предполагает — лишние переносим в следующий блок
      for (let i = 0; i < images.length; i += 2) {
        blocks.push({ kind: "figure", images: images.slice(i, i + 2) });
      }
      continue;
    }
    blocks.push({ kind: "p", text: para });
  }
  return blocks;
}
