// Проверка и нормализация заявки с формы. Файл БЕЗ серверных импортов: его подключает и
// хранилище (lib/server/leads.ts), и тесты — им не нужен доступ к файловой системе.
//
// Форма публичная, поэтому проверка здесь — единственная, которой можно доверять:
// браузерные ограничения обходятся запросом напрямую.

export type Lead = {
  id: string;
  createdAt: string; // ISO
  name: string;
  surname: string;
  email: string;
  phone: string;
  comment: string;
  consentPd: boolean;
  consentAds: boolean;
};

export type LeadInput = Omit<Lead, "id" | "createdAt">;

const MAX = { name: 80, surname: 80, email: 160, phone: 32, comment: 2000 };

// Комментарий — единственное поле произвольного текста, и по нему заходит спам: подборки
// ссылок оседают в журнале заявок и уезжают в уведомление приёмной комиссии.
// Одну-две ссылки пропускаем (абитуриент вправе приложить портфолио или репозиторий),
// на большем количестве отказываем — это уже не вопрос, а рассылка.
const MAX_LINKS = 2;
// Ссылка считается целиком: раньше «https://a.ru» попадало в счёт дважды — отдельно схема,
// отдельно домен, и одна ссылка на репозиторий уже упиралась в предел.
// Отрицательный просмотр назад отсекает почту: «ivan@mail.ru» — это не ссылка.
const LINK_RE = /(?:https?:\/\/|www\.)\S+|(?<![@\w.])[a-z0-9-]+\.(?:ru|com|net|org|io|biz|xyz|top|info|shop|site|online)\b/gi;

export const countLinks = (s: string): number => (s.match(LINK_RE) ?? []).length;

/**
 * Приведение произвольного текста к безопасному виду ДО записи в файл заявок.
 * Управляющие символы (кроме перевода строки) убираем: они не несут смысла, зато ломают
 * разбор журнала и вывод в терминале. Больше двух пустых строк подряд схлопываем —
 * так «простыню» из переводов строк нельзя раздуть до предела длины.
 */
export const cleanComment = (s: string): string =>
  s
    // Управляющие символы вырезаем намеренно — на это и ругается правило линтера.
    // Диапазоны обходят перевод строки: он здесь единственный осмысленный.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Проверка на стороне сервера — единственная, которой можно доверять: браузерную легко обойти.
export function validateLead(raw: Record<string, unknown>): { ok: true; lead: LeadInput } | { ok: false; errors: Record<string, string> } {
  const str = (v: unknown) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : "");
  const name = str(raw.name);
  const surname = str(raw.surname);
  const email = str(raw.email);
  const phone = str(raw.phone);
  const comment = cleanComment(str(raw.comment));
  const truthy = (v: unknown) => v === true || v === "true" || v === "on" || v === "1";

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Укажите имя.";
  else if (name.length > MAX.name) errors.name = "Имя слишком длинное.";
  if (surname.length > MAX.surname) errors.surname = "Фамилия слишком длинная.";
  // Намеренно простая проверка почты: строгие регулярки отсекают валидные адреса
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Проверьте адрес почты.";
  else if (email.length > MAX.email) errors.email = "Адрес почты слишком длинный.";
  // Проверяем И длину строки, И количество цифр: без первой в файл персональных данных
  // попадала бы строка произвольного размера (цифр в ней могло быть ровно 11).
  const digits = phone.replace(/\D/g, "");
  if (phone.length > MAX.phone) errors.phone = "Номер телефона слишком длинный.";
  else if (digits.length < 11 || digits.length > 15) errors.phone = "Проверьте номер телефона.";
  if (comment.length > MAX.comment) errors.comment = "Комментарий длиннее 2000 символов.";
  else if (countLinks(comment) > MAX_LINKS) {
    errors.comment = "Слишком много ссылок в комментарии — напишите вопрос текстом.";
  }
  if (!truthy(raw.consent_pd)) errors.consent_pd = "Без согласия на обработку данных заявку принять нельзя.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    lead: { name, surname, email, phone, comment, consentPd: true, consentAds: truthy(raw.consent_ads) },
  };
}
