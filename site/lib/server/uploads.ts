// Загрузка и отдача обложек новостей (Task B3). ТОЛЬКО СЕРВЕР.
//
// Файлы кладём в DATA_DIR/uploads, а НЕ в public/: папка public входит в состав сборки, и при
// следующем деплое (замене папки) загруженные картинки исчезли бы. В DATA_DIR они переживают
// пересборку и бэкапятся вместе с новостями и заявками.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { slugify } from "@/lib/slug";
import { DATA_DIR } from "./store";

export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

// Три размера: карточка (290 px), страница новости (1120 px) и та же страница на экране
// двойной плотности. Без 2240 обложка на ретине показывалась в 1400 px на 1120-пиксельном
// месте — это 0.63 от нужного разрешения, заметное мыло.
//
// withoutEnlargement оставлен: если исходник уже 2240, файл получится меньше заявленного
// имени. Браузер тогда покажет ту же картинку, что и сегодня, — то есть хуже не станет,
// а апскейл только раздул бы вес без единого нового пикселя. Форма админки просит
// загружать от 2240 px, чтобы этот случай был редким.
const WIDTHS = [640, 1400, 2240] as const;
const MAX_BYTES = 8 * 1024 * 1024; // 8 МБ на исходник
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
// Форматы, определённые по СОДЕРЖИМОМУ файла (sharp). MIME из запроса задаёт клиент, ему верить
// нельзя: он лишь отсеивает очевидный мусор до чтения картинки.
const ALLOWED_FORMATS = ["jpeg", "png", "webp", "avif"];

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
  // Сверяем РЕАЛЬНЫЙ формат, а не заявленный: иначе достаточно было подменить Content-Type,
  // чтобы протащить, например, SVG со скриптом или анимацию неожиданного формата.
  if (!meta.format || !ALLOWED_FORMATS.includes(meta.format)) {
    return { ok: false, error: "Поддерживаются JPEG, PNG, WebP и AVIF." };
  }
  if (meta.width < 600) return { ok: false, error: "Изображение уже 600 px — для обложки нужно шире." };
  // Огромные полотна разжимаются в память целиком (16000×16000 ≈ 1 ГБ) — ограничиваем площадь
  const MAX_PIXELS = 50_000_000;
  if (meta.width * meta.height > MAX_PIXELS) {
    return { ok: false, error: "Слишком большое изображение — уменьшите разрешение." };
  }

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

// Удаление обложки (при замене или удалении новости). Картинки из макета («asset-…») не трогаем:
// они лежат в public/ и принадлежат сборке, а не каталогу загрузок.
export function removeCover(cover: string): void {
  if (!cover.startsWith("upload:")) return;
  const base = cover.slice("upload:".length);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(base)) return; // защита от подстановки пути
  for (const width of WIDTHS) {
    const file = path.join(UPLOADS_DIR, `${base}-${width}w.webp`);
    const rel = path.relative(UPLOADS_DIR, file);
    if (rel.startsWith("..") || path.isAbsolute(rel)) continue;
    try {
      rmSync(file, { force: true });
    } catch (e) {
      // Не смогли удалить — это не повод ронять правку новости, просто сообщаем
      console.error("[uploads] не удалось удалить файл обложки:", e instanceof Error ? e.message : e);
    }
  }
}

// Чтение файла обложки для отдачи роутом /api/uploads.
// Имя проверяем строгим шаблоном и дополнительно сверяем итоговый путь — чтобы «../» не увёл
// чтение за пределы каталога загрузок (path traversal).
export function readUpload(name: string): Buffer | null {
  const match = /^([a-z0-9][a-z0-9-]*)-(640|1400|2240)w\.webp$/.exec(name);
  if (!match) return null;

  const inside = (file: string): string | null => {
    const rel = path.relative(UPLOADS_DIR, file);
    return rel.startsWith("..") || path.isAbsolute(rel) ? null : file;
  };

  const file = inside(path.join(UPLOADS_DIR, name));
  if (file && existsSync(file)) return readFileSync(file);

  // Обложки, загруженные до появления ширины 2240, состоят из двух файлов. Без запасного пути
  // srcset ссылался бы на несуществующий файл, и у старых новостей картинка просто не грузилась
  // бы на ретине. Отдаём ближайший меньший из имеющихся — он и так лучший, что у нас есть.
  const [, base, requested] = match;
  const smaller = WIDTHS.filter((w) => w < Number(requested)).sort((a, b) => b - a);
  for (const width of smaller) {
    const alt = inside(path.join(UPLOADS_DIR, `${base}-${width}w.webp`));
    if (alt && existsSync(alt)) return readFileSync(alt);
  }
  return null;
}

// Фотографии редактируемых секций (преподаватели, курсы) проходят тот же конвейер, что и
// обложки: три ширины, webp, префикс «upload:». Отдельное имя — чтобы в вызывающем коде было
// видно, что грузится не обложка новости.
export const savePhoto = saveCover;
