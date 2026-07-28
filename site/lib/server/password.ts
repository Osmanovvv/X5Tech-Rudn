// Хэш пароля администратора — чистая криптография, без привязки к запросу и к окружению.
//
// Выделено из auth.ts по двум причинам. Первая: auth.ts импортирует next/headers, и из-за
// этого хэширование нельзя было ни протестировать, ни вызвать из скрипта установки —
// scripts/admin-hash.mjs реализовывал те же scrypt-параметры повторно, и при их расхождении
// сгенерированный хэш молча переставал подходить. Вторая: у этого кода нет ни состояния,
// ни запроса, поэтому ему нечего делать в модуле сессий.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const SCRYPT_KEYLEN = 64;

/**
 * Формат строки в .env: `scrypt:<соль_hex>:<хэш_hex>`.
 *
 * Разделитель именно «:», а НЕ «$»: значения в .env проходят подстановку переменных, и строка
 * вида `scrypt$соль$хэш` схлопывалась бы до «scrypt» — вход в админку становился невозможен
 * (проверено). Двоеточие подстановке не подвержено.
 *
 * NFKC-нормализация пароля обязательна: одна и та же буква с диакритикой может быть введена
 * разными последовательностями кодовых точек, и без приведения пароль «не подошёл бы» после
 * смены раскладки или устройства ввода.
 */
export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const hash = scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/** Причина отказа — для диагностики настройки, наружу пользователю не показывается. */
export type PasswordCheck = { ok: true } | { ok: false; reason: "формат" | "пароль" };

export function checkPassword(password: string, stored: string): PasswordCheck {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return { ok: false, reason: "формат" };

  const [, salt, expectedHex] = parts;
  // Буфер из строки с нечётной длиной или не-hex символами Buffer.from молча обрежет,
  // поэтому длину проверяем явно — иначе укороченный хэш сравнивался бы «успешно»
  if (!/^[0-9a-fA-F]+$/.test(expectedHex)) return { ok: false, reason: "формат" };
  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== SCRYPT_KEYLEN) return { ok: false, reason: "формат" };

  const actual = scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN);
  // Сравнение за постоянное время — иначе по времени ответа хэш подбирается побайтно
  return timingSafeEqual(actual, expected) ? { ok: true } : { ok: false, reason: "пароль" };
}

export const verifyPassword = (password: string, stored: string): boolean =>
  checkPassword(password, stored).ok;
