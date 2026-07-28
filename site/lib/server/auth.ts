// Аутентификация админки (Task B2). Zero-dependency: только node:crypto, без auth-библиотек.
// ТОЛЬКО СЕРВЕР (node:crypto в клиентский бандл не собирается).
//
// Модель: один аккаунт администратора, логин/хэш пароля и секрет подписи задаёт КЛИЕНТ в .env
// (см. .env.example и README). Пароль в открытом виде нигде не хранится и в код не попадает.
// Сессия — не в БД, а подписанная HMAC кука: сервер проверяет подпись и срок, состояние не хранит.
import { timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPassword } from "./password";
import { createToken, readToken } from "./session-token";

export const SESSION_COOKIE = "rudn_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 часов — рабочая смена контент-менеджера

const USERNAME = process.env.ADMIN_USERNAME ?? "";
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? "";
const SECRET = process.env.SESSION_SECRET ?? "";

// Админка включается, только когда клиент задал все три переменные. Секрет по умолчанию
// НЕ генерируем: случайный ломался бы при каждом рестарте, а зашитый в код — это дыра.
export const adminConfigured = (): boolean => Boolean(USERNAME && PASSWORD_HASH && SECRET);

// ── Пароль и сессия ─────────────────────────────────────────────────────────────
// Сама криптография живёт в ./password и ./session-token — там она без привязки к запросу
// и покрыта тестами. Здесь остаётся только подстановка настроек из окружения.
export { hashPassword } from "./password";

/** Имя пользователя из подписанного токена или null. */
export const verifyToken = (token: string | undefined): string | null =>
  readToken(token, SECRET, USERNAME);

// ── Работа с кукой ──────────────────────────────────────────────────────────────
// Secure по умолчанию включён: сессионную куку нельзя гонять по открытому HTTP.
// Клиент может отключить (SESSION_COOKIE_SECURE=0) для развёртывания без TLS —
// это задокументировано в .env.example как небезопасный вариант.
const cookieSecure = process.env.SESSION_COOKIE_SECURE !== "0";

export async function startSession(username: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(username, SECRET, SESSION_TTL_MS), {
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
const MAX_TRACKED = 10_000;

// Просроченные записи удаляются только при повторном обращении по тому же ключу, поэтому поток
// запросов с разными ключами наращивал бы карту бесконечно. Подчищаем при превышении порога.
function sweepAttempts(now: number): void {
  if (attempts.size < MAX_TRACKED) return;
  for (const [key, rec] of attempts) if (rec.until < now) attempts.delete(key);
  // Если после уборки всё ещё переполнено (шторм активных попыток) — сбрасываем целиком:
  // потерять счётчики безопаснее, чем исчерпать память процесса.
  if (attempts.size >= MAX_TRACKED) attempts.clear();
}

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
  const now = Date.now();
  sweepAttempts(now);
  const rec = attempts.get(key);
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

  // Сравниваем БАЙТЫ, а не длины строк: у кириллицы длина строки и длина буфера расходятся,
  // и timingSafeEqual падал бы с RangeError на логине из кириллицы (и заодно выдавал бы,
  // что длина совпала). Разная длина буферов — сразу мимо.
  const given = Buffer.from(username, "utf8");
  const expected = Buffer.from(USERNAME, "utf8");
  const userOk = given.length === expected.length && timingSafeEqual(given, expected);

  // Пароль проверяем ТОЛЬКО при верном логине: scryptSync намеренно тяжёлый и синхронный,
  // и его безусловный вызов на каждую попытку блокировал бы весь сервер (процесс один).
  if (!userOk) return false;

  const result = checkPassword(password, PASSWORD_HASH);
  if (!result.ok && result.reason === "формат") {
    // Не «неверный пароль», а испорченная настройка — администратор иначе будет
    // бесконечно перебирать пароль. Частая причина: хэш записан через «$», и .env
    // обрезал его при подстановке переменных.
    console.error(
      "[auth] ADMIN_PASSWORD_HASH имеет неподдерживаемый вид — вход невозможен при любом пароле. " +
        "Сгенерируйте заново: npm run admin:hash (разделитель должен быть «:», а не «$»).",
    );
  }
  return result.ok;
}
