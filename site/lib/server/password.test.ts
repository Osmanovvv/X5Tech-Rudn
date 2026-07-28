import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPassword, hashPassword, verifyPassword } from "./password.ts";

test("свой пароль подходит, чужой — нет", () => {
  const stored = hashPassword("длинный-пароль-администратора");
  assert.ok(verifyPassword("длинный-пароль-администратора", stored));
  assert.ok(!verifyPassword("длинный-пароль-администратор", stored));
});

test("соль разная при каждой генерации", () => {
  const a = hashPassword("одинаковый-пароль");
  const b = hashPassword("одинаковый-пароль");
  assert.notEqual(a, b, "два хэша одного пароля не должны совпадать");
  assert.ok(verifyPassword("одинаковый-пароль", a));
  assert.ok(verifyPassword("одинаковый-пароль", b));
});

test("разделитель «:», а не «$»", () => {
  // Через «$» строка схлопывалась бы при подстановке переменных в .env,
  // и вход в админку становился невозможен при любом пароле
  const stored = hashPassword("пароль");
  assert.match(stored, /^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
});

test("испорченный хэш — это «формат», а не «неверный пароль»", () => {
  // Различать обязательно: администратор иначе бесконечно перебирает пароль,
  // хотя сломана настройка
  for (const broken of ["scrypt", "scrypt$соль$хэш", "", "scrypt:соль", "bcrypt:a:b"]) {
    const r = checkPassword("любой", broken);
    assert.deepEqual(r, { ok: false, reason: "формат" }, `для «${broken}»`);
  }
});

test("хэш из верного префикса и мусора не идёт на сравнение", () => {
  // Buffer.from(hex) не бросает исключение, а молча обрезает строку на первом
  // неверном символе: 128 верных символов с мусором в конце давали ровно 64 байта
  const stored = `scrypt:${"ab".repeat(16)}:${"cd".repeat(64)}!!!мусор`;
  assert.deepEqual(checkPassword("любой", stored), { ok: false, reason: "формат" });
});

test("хэш нужной формы, но не тот — это «пароль»", () => {
  const stored = hashPassword("настоящий-пароль");
  assert.deepEqual(checkPassword("поддельный-пароль", stored), { ok: false, reason: "пароль" });
});

test("нормализация: одна и та же буква разными кодовыми точками", () => {
  // «й» бывает одним символом и парой «и + краткая». Без NFKC пароль,
  // введённый на другом устройстве, не подошёл бы
  const composed = "паройль";
  const decomposed = "паройль";
  assert.notEqual(composed, decomposed, "строки должны различаться посимвольно");
  assert.ok(verifyPassword(decomposed, hashPassword(composed)));
});
