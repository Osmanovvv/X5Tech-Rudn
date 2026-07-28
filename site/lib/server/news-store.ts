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
import { readJson, readJsonSafe, writeJson } from "./store";

const NEWS_FILE = "news.json";

// satisfies, а не as: приведение молча переопределяло бы тип, а проверка формы —
// настоящая, и сломается сразу, если контентный JSON перестанет ей соответствовать
const seedData = seed satisfies { title: string; allLabel: string; items: NewsItem[] };

// Заголовки секции («Новости и программы», «Все новости») — статический контент макета,
// админкой не правится, поэтому живёт в репозитории, а не в DATA_DIR.
export const newsMeta = { title: seedData.title, allLabel: seedData.allLabel };

// В статической сборке роута /api/uploads не существует (он вырезается вместе с app/api),
// поэтому загруженные через админку обложки там не отдаются. Брать оттуда новости — значит
// выпустить раздел с битыми картинками, так что статика использует только сид из репозитория.
const useStoredNews = !process.env.STATIC;

// Все новости в каноническом порядке (свежие первыми). Для показа страниц: если файл повреждён,
// сайт всё равно отрисуется на сиде (в журнал уже записана ошибка).
export function getAllNews(): NewsItem[] {
  if (!useStoredNews) return sortNews(seedData.items);
  const stored = readJsonSafe<{ items: NewsItem[] } | null>(NEWS_FILE, null);
  const items = stored?.items ?? seedData.items;
  return sortNews(items);
}

// То же, но СТРОГО: повреждённый файл бросает исключение. Использовать перед правкой из админки,
// чтобы не записать сид поверх настоящих (пусть и нечитаемых сейчас) данных.
export function getAllNewsForEdit(): NewsItem[] {
  const stored = readJson<{ items: NewsItem[] } | null>(NEWS_FILE, null);
  return sortNews(stored?.items ?? seedData.items);
}

// Полная перезапись списка (админка). Порядок нормализуем при чтении.
export function saveAllNews(items: NewsItem[]): Promise<void> {
  return writeJson(NEWS_FILE, { items });
}
