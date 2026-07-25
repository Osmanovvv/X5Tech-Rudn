// Файловое хранилище (Task B1). Zero-dependency: обычные файлы в DATA_DIR, никакой БД —
// клиент деплоит сам, лишних сервисов на VPS ставить не нужно.
// ТОЛЬКО СЕРВЕР: импорт node:fs физически не соберётся в клиентский бандл (сборка упадёт),
// поэтому отдельный маркер server-only не нужен.
import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync, appendFileSync } from "node:fs";
import path from "node:path";

// Каталог данных задаёт клиент в .env (см. .env.example).
export const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));

// Без DATA_DIR данные лягут рядом с запущенным приложением (в standalone-сборке — прямо внутри
// .next), и следующая пересборка или замена папки при деплое их уничтожит. Молча допустить это
// нельзя: речь о заявках абитуриентов. Предупреждаем в журнал при старте.
if (!process.env.DATA_DIR) {
  console.warn(
    `[store] ВНИМАНИЕ: переменная DATA_DIR не задана — данные пишутся в ${DATA_DIR}.\n` +
      "         Это внутри папки приложения: при следующей сборке или деплое они будут потеряны.\n" +
      "         Задайте DATA_DIR в .env (см. .env.example и README, раздел «Развёртывание»).",
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
  return next as Promise<T>;
}

// BOM обязателен к обрезке: редакторы Windows (и PowerShell `-Encoding utf8`) пишут UTF-8 с BOM,
// а JSON.parse на нём падает — без этого правка файла «блокнотом» молча откатила бы весь контент
// к сиду. Проверено: см. комментарий к fallback ниже.
const stripBom = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

export function readJson<T>(name: string, fallback: T): T {
  const file = dataPath(name);
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(stripBom(readFileSync(file, "utf8"))) as T;
  } catch (e) {
    // Битый файл не должен ронять сайт: отдаём fallback и ГРОМКО пишем в лог сервера —
    // иначе подмена данных на сид прошла бы незаметно для админа.
    console.error(
      `[store] ${file} не разобран как JSON — использую значение по умолчанию. Файл не тронут:`,
      e instanceof Error ? e.message : e,
    );
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
