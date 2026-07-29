"use server";

// Правка контента секций «Программа обучения», «Преподаватели», «Как поступить».
//
// Форма присылает всё содержимое секции одним полем payload (JSON) плюс, при необходимости,
// файлы новых фотографий отдельными полями. Так сделано намеренно: у секций вложенная
// структура со списками внутри списков, и раскладывать её по плоским именам formData —
// значит городить разбор, который легко разойдётся с формой. JSON проверяется на сервере
// поле за полем (lib/server/content-validate.ts), поэтому доверия к клиенту тут не больше,
// чем при обычных полях.
import { revalidatePath } from "next/cache";
import { requireAdmin, sameOrigin } from "@/lib/server/auth";
import { readSectionForEdit, saveSection, sectionSeed, type SectionKey } from "@/lib/server/content-store";
import { DataUnreadableError } from "@/lib/server/store";
import { savePhoto } from "@/lib/server/uploads";
import {
  ContentInvalidError,
  validateAdmission,
  validateProgram,
  validateTeachers,
} from "@/lib/server/content-validate";


export type ContentFormState = { error?: string; ok?: string } | undefined;

// Преамбула любого мутирующего действия: живая сессия + свой источник запроса.
// Server Actions вызываются по сети напрямую, layout для них не выполняется — без этих
// двух проверок правка контента была бы открыта кому угодно.
async function denyIfNotAdmin(): Promise<ContentFormState> {
  await requireAdmin();
  if (!(await sameOrigin())) return { error: "Запрос отклонён (посторонний источник)." };
  return undefined;
}

// Секции показываются только на главной, поэтому обновляем её одну.
function revalidateSite() {
  revalidatePath("/");
}

function parsePayload(formData: FormData): unknown {
  const raw = formData.get("payload");
  if (typeof raw !== "string" || !raw) throw new ContentInvalidError("пустой запрос");
  if (raw.length > 400_000) throw new ContentInvalidError("слишком большой запрос");
  try {
    return JSON.parse(raw);
  } catch {
    throw new ContentInvalidError("не удалось разобрать данные формы");
  }
}

// Общий каркас: проверка доступа → разбор → валидация → запись. Ошибки возвращаем текстом,
// понятным редактору, а не трассировкой.
async function handle(
  formData: FormData,
  run: (payload: unknown, formData: FormData) => Promise<void>,
): Promise<ContentFormState> {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  try {
    await run(parsePayload(formData), formData);
  } catch (e) {
    if (e instanceof ContentInvalidError) return { error: `Не сохранено — ${e.message}` };
    if (e instanceof DataUnreadableError) {
      return {
        error:
          "Файл этого раздела повреждён и не читается. Правка заблокирована, чтобы не потерять " +
          "данные — проверьте файл в каталоге данных (подробности в журнале сервера).",
      };
    }
    console.error("[admin/content] не удалось сохранить:", e instanceof Error ? e.message : e);
    return { error: "Не удалось сохранить. Подробности в журнале сервера." };
  }
  revalidateSite();
  return { ok: "Сохранено. Изменения уже на сайте." };
}

// Загрузка фотографий, присланных вместе с формой. Поле называется <prefix><индекс>, индекс —
// позиция в списке: так файл попадает ровно тому элементу, у которого его выбрали.
async function attachPhotos(
  formData: FormData,
  prefix: string,
  count: number,
  hint: (i: number) => string,
): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  for (let i = 0; i < count; i++) {
    const file = formData.get(`${prefix}${i}`);
    if (!(file instanceof File) || file.size === 0) continue;
    const saved = await savePhoto(file, hint(i));
    if (!saved.ok) throw new ContentInvalidError(`фото №${i + 1}: ${saved.error}`);
    result.set(i, saved.cover);
  }
  return result;
}

/* ── Действия ── */

export async function saveProgram(_prev: ContentFormState, formData: FormData): Promise<ContentFormState> {
  return handle(formData, async (payload, fd) => {
    const value = validateProgram(payload);
    const photos = await attachPhotos(fd, "coursePhoto_", value.courses.length, (i) =>
      `kurs-${value.courses[i]?.num || i + 1}`,
    );
    for (const [i, name] of photos) value.courses[i] = { ...value.courses[i], photo: name };
    // Валидируем ещё раз: имена файлов пришли из загрузчика, но правило одно для всех путей
    await saveSection("program", validateProgram(value));
  });
}

export async function saveTeachers(_prev: ContentFormState, formData: FormData): Promise<ContentFormState> {
  return handle(formData, async (payload, fd) => {
    const value = validateTeachers(payload);
    const photos = await attachPhotos(fd, "teacherPhoto_", value.teachers.length, (i) =>
      value.teachers[i]?.name.replace(/\n/g, " ") || `prepodavatel-${i + 1}`,
    );
    for (const [i, name] of photos) {
      // У загруженного фото своих макетных процентов нет: ставим кроп по умолчанию —
      // картинка на всю ширину карточки без сдвига, дальше редактор подгоняет вручную.
      value.teachers[i] = { ...value.teachers[i], photo: name, crop: { h: 100, top: 0 } };
    }
    await saveSection("teachers", validateTeachers(value));
  });
}

export async function saveAdmission(_prev: ContentFormState, formData: FormData): Promise<ContentFormState> {
  return handle(formData, async (payload) => {
    await saveSection("admission", validateAdmission(payload));
  });
}

/* ── Возврат к исходному содержимому из макета ── */

export async function resetSection<K extends SectionKey>(key: K): Promise<ContentFormState> {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;
  try {
    // Читаем текущее строго: если файл повреждён, лучше не трогать его вовсе — редактор
    // сначала должен увидеть проблему, а не затереть данные «сбросом».
    readSectionForEdit(key);
    await saveSection(key, sectionSeed(key));
  } catch (e) {
    if (e instanceof DataUnreadableError) {
      return { error: "Файл раздела повреждён — сброс заблокирован, чтобы не потерять данные." };
    }
    throw e;
  }
  revalidateSite();
  return { ok: "Содержимое возвращено к исходному из макета." };
}
