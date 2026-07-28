// Подпись и проверка сессионного токена — чистые функции без доступа к запросу и окружению.
//
// Выделено из auth.ts: тот импортирует next/headers и читает переменные окружения на уровне
// модуля, поэтому подпись сессии нельзя было проверить тестом — а это ровно тот код, где
// ошибка не видна ни глазами, ни e2e (подделанный токен либо примут, либо нет, и узнаем мы
// об этом от посторонних). Секрет и текущее время передаются аргументами, чтобы тест мог
// проверить и просрочку, и подделку.
import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionPayload = { u: string; exp: number };

const sign = (data: string, secret: string): string =>
  createHmac("sha256", secret).update(data).digest("base64url");

/** Токен вида `<payload>.<подпись>`; payload — base64url от JSON. */
export function createToken(username: string, secret: string, ttlMs: number, now = Date.now()): string {
  const payload: SessionPayload = { u: username, exp: now + ttlMs };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

/**
 * Разбор токена: подпись, срок, совпадение имени. Возвращает имя пользователя или null.
 *
 * Порядок важен: сначала проверяется ПОДПИСЬ и только потом разбирается payload — иначе
 * разбор чужих данных шёл бы раньше доказательства их подлинности.
 */
export function readToken(
  token: string | undefined,
  secret: string,
  expectedUser: string,
  now = Date.now(),
): string | null {
  if (!token || !secret) return null;

  // Разделитель ищем с конца: base64url не содержит точки, поэтому последняя точка —
  // всегда граница подписи, даже если payload когда-нибудь начнёт её содержать
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(body, secret));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload?.u !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < now) return null;
    // Логин сменили в .env → ранее выданные сессии обязаны стать недействительными
    if (payload.u !== expectedUser) return null;
    return payload.u;
  } catch {
    return null;
  }
}
