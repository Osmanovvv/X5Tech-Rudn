// Аутентификация админки (Task B2). Zero-dependency: только node:crypto, без auth-библиотек.
// ТОЛЬКО СЕРВЕР (node:crypto в клиентский бандл не собирается).
//
// Модель: один аккаунт администратора, логин/хэш пароля и секрет подписи задаёт КЛИЕНТ в .env
// (см. .env.example и README). Пароль в открытом виде нигде не хранится и в код не попадает.
// Сессия — не в БД, а подписанная HMAC кука: сервер проверяет подпись и срок, состояние не хранит.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "rudn_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 часов — рабочая смена контент-менеджера

const USERNAME = process.env.ADMIN_USERNAME ?? "";
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? "";
const SECRET = process.env.SESSION_SECRET ?? "";

// Админка включается, только когда клиент задал все три переменные. Секрет по умолчанию
// НЕ генерируем: случайный ломался бы при каждом рестарте, а зашитый в код — это дыра.
export const adminConfigured = (): boolean => Boolean(USERNAME && PASSWORD_HASH && SECRET);

// ── Пароль: scrypt (встроенный, устойчив к перебору на GPU) ─────────────────────
// Формат строки в .env: scrypt$<salt_hex>$<hash_hex>. Генерируется `npm run admin:hash`.
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const hash = scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  let expected: Buffer;
  try {
    expected = Buffer.from(expectedHex, "hex");
  } catch {
    return false;
  }
  if (expected.length !== SCRYPT_KEYLEN) return false;
  const actual = scryptSync(password.normalize("NFKC"), salt, SCRYPT_KEYLEN);
  // Сравнение за постоянное время — иначе по времени ответа можно подбирать хэш побайтно
  return timingSafeEqual(actual, expected);
}

// ── Сессия: payload.signature, где signature = HMAC-SHA256(payload) ─────────────
type SessionPayload = { u: string; exp: number };

const b64url = (buf: Buffer) => buf.toString("base64url");
const sign = (data: string) => createHmac("sha256", SECRET).update(data).digest("base64url");

function createToken(username: string): string {
  const payload: SessionPayload = { u: username, exp: Date.now() + SESSION_TTL_MS };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${sign(body)}`;
}

// Возвращает имя пользователя или null. Проверяет подпись (constant-time) и срок жизни.
export function verifyToken(token: string | undefined): string | null {
  if (!token || !SECRET) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const givenSig = token.slice(dot + 1);
  const expectedSig = sign(body);
  const a = Buffer.from(givenSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload?.u || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (payload.u !== USERNAME) return null; // логин сменили в .env → старые сессии недействительны
    return payload.u;
  } catch {
    return null;
  }
}

// ── Работа с кукой ──────────────────────────────────────────────────────────────
// Secure по умолчанию включён: сессионную куку нельзя гонять по открытому HTTP.
// Клиент может отключить (SESSION_COOKIE_SECURE=0) для развёртывания без TLS —
// это задокументировано в .env.example как небезопасный вариант.
const cookieSecure = process.env.SESSION_COOKIE_SECURE !== "0";

export async function startSession(username: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(username), {
    httpOnly: true, // недоступна из JS → не украсть через XSS
    secure: cookieSecure,
    sameSite: "strict", // основная защита от CSRF
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// Текущий администратор или null. Использовать во всех защищённых местах.
export async function currentAdmin(): Promise<string | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

// Защита страницы: нет валидной сессии → на форму входа.
// ВАЖНО: проверку нельзя делать «один раз в layout» — Server Actions и роуты /api вызываются
// по сети напрямую, layout для них не выполняется. Поэтому requireAdmin() ставится в КАЖДОЙ
// защищённой странице И в каждом мутирующем действии (дока Next прямо предупреждает, что
// proxy/middleware — не полноценная авторизация, только оптимистичная проверка).
export async function requireAdmin(): Promise<string> {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

// То же для API-роутов: вместо редиректа — признак, по которому вернём 401.
export async function isAdminRequest(): Promise<boolean> {
  return (await currentAdmin()) !== null;
}

// Защита от CSRF на мутациях: браузер всегда шлёт Origin в кросс-сайтовых POST.
// Совпадает с Host → запрос свой. Плюс кука SameSite=Strict как основной барьер.
export async function sameOrigin(): Promise<boolean> {
  const h = await headers();
  const origin = h.get("origin");
  if (!origin) return true; // не браузерный клиент (curl/серверный вызов) — Origin отсутствует
  const host = h.get("x-forwarded-host") ?? h.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// ── Ограничение попыток входа (в памяти процесса, zero-dep) ─────────────────────
// Тормозит перебор пароля. Для одного Node-процесса на VPS этого достаточно.
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 10 * 60 * 1000;

export function loginBlocked(key: string): boolean {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (rec.until < Date.now()) {
    attempts.delete(key);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

export function noteFailedLogin(key: string): void {
  const rec = attempts.get(key);
  const now = Date.now();
  if (!rec || rec.until < now) attempts.set(key, { count: 1, until: now + LOCK_MS });
  else attempts.set(key, { count: rec.count + 1, until: now + LOCK_MS });
}

export function resetLoginAttempts(key: string): void {
  attempts.delete(key);
}

// Проверка логина: имя пользователя + пароль. Ошибку наружу отдаём одинаковую (без подсказок,
// какое именно поле неверно) — чтобы нельзя было перебирать существующие логины.
export function checkCredentials(username: string, password: string): boolean {
  if (!adminConfigured()) return false;
  const userOk = username.length === USERNAME.length && timingSafeEqual(Buffer.from(username), Buffer.from(USERNAME));
  const passOk = verifyPassword(password, PASSWORD_HASH);
  return userOk && passOk;
}
