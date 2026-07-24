// Загрузка и отдача обложек новостей (Task B3). ТОЛЬКО СЕРВЕР.
//
// Файлы кладём в DATA_DIR/uploads, а НЕ в public/: папка public входит в состав сборки, и при
// следующем деплое (замене папки) загруженные картинки исчезли бы. В DATA_DIR они переживают
// пересборку и бэкапятся вместе с новостями и заявками.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { slugify } from "@/lib/slug";
import { DATA_DIR } from "./store";

export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

// Те же два размера, что у картинок из макета (пайплайн Task 0.3): карточка и страница новости.
const WIDTHS = [640, 1400] as const;
const MAX_BYTES = 8 * 1024 * 1024; // 8 МБ на исходник
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type UploadResult = { ok: true; cover: string } | { ok: false; error: string };

// Сохраняет обложку и возвращает значение для поля cover («upload:<имя>»).
export async function saveCover(file: File, titleHint: string): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: false, error: "Файл не выбран." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Файл больше 8 МБ — загрузите картинку полегче." };
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Поддерживаются JPEG, PNG, WebP и AVIF." };
  }

  const input = Buffer.from(await file.arrayBuffer());

  // Проверяем, что это действительно картинка (а не переименованный файл), и заодно узнаём размер
  const meta = await sharp(input)
    .metadata()
    .catch(() => null);
  if (!meta) {
    return { ok: false, error: "Не удалось прочитать изображение — файл повреждён или это не картинка." };
  }
  if (!meta.width || !meta.height) return { ok: false, error: "Не удалось определить размеры изображения." };
  if (meta.width < 600) return { ok: false, error: "Изображение уже 600 px — для обложки нужно шире." };

  mkdirSync(UPLOADS_DIR, { recursive: true });

  // Имя файла: только латиница/цифры/дефис + метка времени (без пользовательского ввода в пути).
  // Метка нужна, чтобы правка обложки не перетирала старый файл, который ещё может быть в кэше.
  const base = `${slugify(titleHint).slice(0, 48) || "cover"}-${Date.now().toString(36)}`;

  // Ре-энкодинг в webp: приводит к единому формату, срезает метаданные и обезвреживает
  // потенциально опасное содержимое исходника (полезная нагрузка не переживает пересжатие).
  for (const width of WIDTHS) {
    const out = await sharp(input)
      .rotate() // учесть EXIF-ориентацию, иначе фото с телефона ляжет боком
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    writeFileSync(path.join(UPLOADS_DIR, `${base}-${width}w.webp`), out);
  }

  return { ok: true, cover: `upload:${base}` };
}

// Чтение файла обложки для отдачи роутом /api/uploads.
// Имя проверяем строгим шаблоном и дополнительно сверяем итоговый путь — чтобы «../» не увёл
// чтение за пределы каталога загрузок (path traversal).
export function readUpload(name: string): Buffer | null {
  if (!/^[a-z0-9][a-z0-9-]*-(640|1400)w\.webp$/.test(name)) return null;
  const file = path.join(UPLOADS_DIR, name);
  const rel = path.relative(UPLOADS_DIR, file);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  if (!existsSync(file)) return null;
  return readFileSync(file);
}
