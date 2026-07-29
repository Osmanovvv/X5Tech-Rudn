// Проверка валидации контента секций. Действия админки вызываются по сети напрямую, поэтому
// сюда может прийти какой угодно JSON — тесты фиксируют, что мусор не попадёт в файл данных.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ContentInvalidError,
  validateAdmission,
  validateProgram,
  validateTeachers,
} from "./content-validate.ts";
import program from "../../content/program.json" with { type: "json" };
import teachers from "../../content/teachers.json" with { type: "json" };
import admission from "../../content/admission.json" with { type: "json" };

const invalid = (fn: () => unknown, why: string) =>
  assert.throws(fn, (e: unknown) => e instanceof ContentInvalidError, why);

/* ── Содержимое из репозитория проходит проверку как есть ── */

test("макетная программа проходит валидацию без изменений", () => {
  assert.deepEqual(validateProgram(program), program);
});

test("макетные преподаватели проходят валидацию без изменений", () => {
  assert.deepEqual(validateTeachers(teachers), teachers);
});

test("макетный приём проходит валидацию без изменений", () => {
  assert.deepEqual(validateAdmission(admission), admission);
});

/* ── Обязательные поля ── */

test("пустой заголовок не проходит", () => {
  invalid(() => validateProgram({ ...program, title: "   " }), "пустой заголовок должен отклоняться");
});

test("курс без фото и без отметки статистики не проходит", () => {
  const broken = { ...program, courses: [{ ...program.courses[0], photo: undefined }] };
  invalid(() => validateProgram(broken), "курс обязан иметь фото либо карточку статистики");
});

test("список курсов не может быть пустым", () => {
  invalid(() => validateProgram({ ...program, courses: [] }), "пустой список курсов");
});

/* ── Защита пути: имя файла подставляется в адрес картинки ── */

test("имя фото с переходом по каталогам отклоняется", () => {
  const broken = {
    ...teachers,
    teachers: [{ ...teachers.teachers[0], photo: "../../../etc/passwd" }],
  };
  invalid(() => validateTeachers(broken), "«..» в имени файла недопустимо");
});

test("имя фото со слэшем отклоняется", () => {
  const broken = { ...teachers, teachers: [{ ...teachers.teachers[0], photo: "a/b" }] };
  invalid(() => validateTeachers(broken), "слэш в имени файла недопустим");
});

test("загруженное фото с корректным именем принимается", () => {
  const ok = {
    ...teachers,
    teachers: [{ ...teachers.teachers[0], photo: "upload:ivanov-m1a2b3" }],
  };
  assert.equal(validateTeachers(ok).teachers[0].photo, "upload:ivanov-m1a2b3");
});

/* ── Ограничения размера: без них одна отправка раздула бы файл данных ── */

test("слишком длинная подпись отклоняется", () => {
  const broken = { ...program, title: "я".repeat(200) };
  invalid(() => validateProgram(broken), "перебор по длине");
});

test("слишком длинный список дисциплин отклоняется", () => {
  const broken = {
    ...program,
    courses: [{ ...program.courses[0], disciplines: Array.from({ length: 40 }, (_, i) => `д${i}`) }],
  };
  invalid(() => validateProgram(broken), "больше 30 дисциплин");
});

/* ── Посторонние ключи не попадают в файл ── */

test("лишние поля отбрасываются", () => {
  const withJunk = { ...teachers, вредное: "<script>", teachers: [{ ...teachers.teachers[0], hack: 1 }] };
  const clean = validateTeachers(withJunk);
  assert.equal("вредное" in clean, false);
  assert.equal("hack" in clean.teachers[0], false);
});

/* ── Нормализация ── */

test("переносы Windows приводятся к обычным", () => {
  const withCrlf = { ...teachers, subtitle: "первая\r\nвторая" };
  assert.equal(validateTeachers(withCrlf).subtitle, "первая\nвторая");
});

// Плашку переносим на первый курс: в этих проверках программа из одного курса, а ссылка
// на третий осталась бы недействительной и заслонила бы то, что проверяется
const oneCourse = (disciplines: unknown[]) => ({
  ...program,
  courses: [{ ...program.courses[0], disciplines }],
  highlight: { ...program.highlight, after: 1 },
});

test("дисциплина без настроек хранится строкой", () => {
  assert.deepEqual(validateProgram(oneCourse([{ label: "Алгебра" }])).courses[0].disciplines, [
    "Алгебра",
  ]);
});

test("дисциплина с настройками сохраняет их", () => {
  const out = validateProgram(oneCourse([{ label: "Алгебра", ghost: true, m: "Алг." }]));
  assert.deepEqual(out.courses[0].disciplines, [{ label: "Алгебра", ghost: true, m: "Алг." }]);
});

/* ── Структурные ограничения секции приёма ── */

test("показателей должно быть ровно три", () => {
  invalid(() => validateAdmission({ ...admission, stats: admission.stats.slice(0, 2) }), "нужно три");
});

test("колонок таблицы экзаменов ровно четыре", () => {
  const broken = { ...admission, exams: { ...admission.exams, columns: ["а", "б"] } };
  invalid(() => validateAdmission(broken), "нужно четыре колонки");
});

test("плашка не может ссылаться на несуществующий курс", () => {
  const broken = { ...program, highlight: { ...program.highlight, after: 99 } };
  invalid(() => validateProgram(broken), "номер курса вне диапазона");
});
