// Чтение полей формы без сюрпризов.
//
// FormData.get() возвращает string | File | null, а String(File) молча даёт "[object File]".
// Значит подделанный запрос, где вместо текстового поля прислан файл, проходил бы проверку
// длины («[object File]» — это 13 символов) и попадал в данные. Поэтому всё, что не строка,
// считаем отсутствующим, а файлы читаем отдельными функциями с явным типом.
//
// Модуль общий для Server Actions и роутов /api: FormData — веб-стандарт, привязки к Node нет.

/** Строковое поле; файл или отсутствие → пустая строка. */
export function formString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

/**
 * Многострочное поле. Браузер по спецификации шлёт содержимое textarea с переводами строк
 * CRLF; без нормализации разбиение текста на абзацы (по пустой строке) не срабатывает,
 * и вся новость склеивается в один абзац — было поймано e2e.
 */
export function formText(data: FormData, key: string): string {
  return formString(data, key).replace(/\r\n/g, "\n").trim();
}

/** Файл, если он действительно выбран: пустой input даёт File нулевого размера. */
export function formFile(data: FormData, key: string): File | null {
  const value = data.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

/** Все выбранные файлы одного поля (input multiple). */
export function formFiles(data: FormData, key: string): File[] {
  return data.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);
}
