// Файловое хранилище (Task B1). Zero-dependency: обычные файлы в DATA_DIR, никакой БД —
// клиент деплоит сам, лишних сервисов на VPS ставить не нужно.
// ТОЛЬКО СЕРВЕР: импорт node:fs физически не соберётся в клиентский бандл (сборка упадёт),
// поэтому отдельный маркер server-only не нужен.
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync, appendFileSync } from "node:fs";
import path from "node:path";

// Каталог данных задаёт клиент в .env (см. .env.example).
export const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));

// Каталог данных внутри сборки — прямой путь к потере заявок абитуриентов: `next build`
// очищает .next целиком, а деплой заменяет папку приложения. Поэтому:
//   • путь внутри .next — это ОШИБКА конфигурации, о ней кричим отдельно;
//   • просто незаданный DATA_DIR — предупреждение (для локального запуска это нормально).
const insideBuildDir = DATA_DIR.split(path.sep).includes(".next");

if (insideBuildDir) {
  console.error(
    `[store] ОШИБКА КОНФИГУРАЦИИ: каталог данных находится внутри сборки — ${DATA_DIR}\n` +
      "        Следующая сборка (`npm run build`) удалит его вместе с новостями и ЗАЯВКАМИ.\n" +
      "        Задайте DATA_DIR в .env — путь ВНЕ папки приложения, например /var/lib/rudn-ai/data\n" +
      "        (см. .env.example и README, раздел «Развёртывание на сервере»).",
  );
} else if (!process.env.DATA_DIR) {
  console.warn(
    `[store] ВНИМАНИЕ: переменная DATA_DIR не задана — данные пишутся в ${DATA_DIR}.\n` +
      "        Для сервера задайте DATA_DIR в .env (см. README, раздел «Развёртывание»).",
  );
}

export const dataPath = (name: string) => path.join(DATA_DIR, name);

export function ensureDataDir(): void {
  mkdirSync(DATA_DIR, { recursive: true });
}

// ── Атомарная запись ────────────────────────────────────────────────────────────
// Пишем во временный файл и переименовываем: rename в пределах тома атомарен, поэтому
// читатель никогда не увидит «полуфайл», даже если процесс упадёт в момент записи.
// Очередь (цепочка промисов) на файл — чтобы параллельные правки из админки не гонялись.
const queues = new Map<string, Promise<unknown>>();

function enqueue<T>(key: string, task: () => Promise<T> | T): Promise<T> {
  const prev = queues.get(key) ?? Promise.resolve();
  const next = prev.then(task, task); // ошибка предыдущей задачи не блокирует очередь
  queues.set(
    key,
    next.catch(() => undefined),
  );
  return next;
}

// BOM обязателен к обрезке: редакторы Windows (и PowerShell `-Encoding utf8`) пишут UTF-8 с BOM,
// а JSON.parse на нём падает — без этого правка файла «блокнотом» молча откатила бы весь контент
// к сиду. Проверено: см. комментарий к fallback ниже.
const stripBom = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

// Файл существует, но прочитать его не удалось. Отличать это состояние от «файла ещё нет»
// критично: иначе повреждённый news.json подменялся бы сидом, а первая же правка из админки
// записала бы этот сид поверх настоящих данных — то есть молча уничтожила бы контент.
export class DataUnreadableError extends Error {}

export function readJson<T>(name: string, fallback: T): T {
  const file = dataPath(name);
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(stripBom(readFileSync(file, "utf8"))) as T;
  } catch (e) {
    console.error(
      `[store] ${file} не удалось прочитать. Файл НЕ ИЗМЕНЁН, правка данных заблокирована ` +
        "до исправления или удаления файла:",
      e instanceof Error ? e.message : e,
    );
    throw new DataUnreadableError(name);
  }
}

// Мягкий вариант для мест, где сайт обязан отрисоваться даже при повреждённом файле
// (публичные страницы). Возвращает fallback, но НЕ разрешает последующую запись —
// за это отвечает readJson выше.
export function readJsonSafe<T>(name: string, fallback: T): T {
  try {
    return readJson(name, fallback);
  } catch {
    return fallback;
  }
}

export function writeJson<T>(name: string, value: T): Promise<void> {
  return enqueue(name, () => {
    ensureDataDir();
    const file = dataPath(name);
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, JSON.stringify(value, null, 2), "utf8");
    renameSync(tmp, file); // атомарная подмена
  });
}

// ── Журнал (JSON Lines) — для заявок: только дописывание, потери при падении минимальны ──
export function appendJsonl(name: string, record: unknown): Promise<void> {
  return enqueue(name, () => {
    ensureDataDir();
    appendFileSync(dataPath(name), JSON.stringify(record) + "\n", "utf8");
  });
}

export function readJsonl<T>(name: string): T[] {
  const file = dataPath(name);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line) as T;
      } catch {
        return null; // повреждённую строку пропускаем, остальные читаются
      }
    })
    .filter((v): v is T => v !== null);
}
