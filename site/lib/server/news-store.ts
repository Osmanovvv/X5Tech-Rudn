// Серверное чтение/запись новостей (Task B1). ТОЛЬКО СЕРВЕР (через store.ts тянет node:fs).
//
// Источник правды — DATA_DIR/news.json (его правит админка). Пока файла нет — отдаём сид
// из content/news.json, который лежит в репозитории: сайт работает сразу после деплоя,
// до первого захода в админку. Первая же запись из админки создаёт файл в DATA_DIR.
//
// Читаем ВНУТРИ функции (не на уровне модуля), чтобы после revalidatePath страница
// перечитала актуальные данные, а не закэшированный при импорте снимок.
import seed from "@/content/news.json";
import { sortNews, type NewsItem } from "@/lib/news";
import { readJson, writeJson } from "./store";

const NEWS_FILE = "news.json";

const seedData = seed as { title: string; allLabel: string; items: NewsItem[] };

// Заголовки секции («Новости и программы», «Все новости») — статический контент макета,
// админкой не правится, поэтому живёт в репозитории, а не в DATA_DIR.
export const newsMeta = { title: seedData.title, allLabel: seedData.allLabel };

// Все новости в каноническом порядке (свежие первыми).
export function getAllNews(): NewsItem[] {
  const stored = readJson<{ items: NewsItem[] } | null>(NEWS_FILE, null);
  const items = stored?.items ?? seedData.items;
  return sortNews(items);
}

// Полная перезапись списка (админка). Порядок нормализуем при чтении.
export function saveAllNews(items: NewsItem[]): Promise<void> {
  return writeJson(NEWS_FILE, { items });
}
