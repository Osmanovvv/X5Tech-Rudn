// Адреса картинок редактируемых секций. Без серверных импортов: используется и в вёрстке,
// и в предпросмотре админки.
//
// У картинки два источника. Штатная лежит в сборке (public/img/<папка>/<имя>-<ширина>w.webp) —
// это фото из макета. Загруженная через админку хранится в DATA_DIR/uploads и отдаётся роутом
// /api/uploads: в public её класть нельзя, следующий деплой заменил бы папку вместе с файлом.
// Отличаем по префиксу «upload:» — та же договорённость, что и у обложек новостей.
import { asset } from "./asset";

export const UPLOAD_PREFIX = "upload:";

export const isUploaded = (name: string): boolean => name.startsWith(UPLOAD_PREFIX);

// Загруженные картинки сохраняются в трёх ширинах (см. lib/server/uploads.ts). Штатные из
// макета нарезаны под свои места и ширины у них другие, поэтому для загруженной берём
// ближайшую НЕ МЕНЬШУЮ: меньшая дала бы апскейл и мыло.
const UPLOAD_WIDTHS = [640, 1400, 2240] as const;
const nearestUploadWidth = (want: number) =>
  UPLOAD_WIDTHS.find((w) => w >= want) ?? UPLOAD_WIDTHS[UPLOAD_WIDTHS.length - 1];

/**
 * Путь к картинке секции.
 * @param dir  папка в public/img (например «07-prepodavateli»)
 * @param name имя файла без размера и расширения либо «upload:<имя>»
 * @param width ширина из набора, в котором картинка сохранена
 */
export function photoSrc(dir: string, name: string, width: number): string {
  return isUploaded(name)
    ? asset(`/api/uploads/${name.slice(UPLOAD_PREFIX.length)}-${nearestUploadWidth(width)}w.webp`)
    : asset(`/img/${dir}/${name}-${width}w.webp`);
}
