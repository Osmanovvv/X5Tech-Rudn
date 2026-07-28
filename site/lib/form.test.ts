import { test } from "node:test";
import assert from "node:assert/strict";
import { formString, formText, formFile, formFiles } from "./form.ts";

const fd = (entries: [string, string | File][]): FormData => {
  const d = new FormData();
  for (const [k, v] of entries) d.append(k, v);
  return d;
};
const file = (name: string, bytes = 10) =>
  new File([new Uint8Array(bytes)], name, { type: "image/webp" });

test("строковое поле читается как есть", () => {
  assert.equal(formString(fd([["a", " текст "]]), "a"), " текст ");
});

test("отсутствующее поле — пустая строка", () => {
  assert.equal(formString(fd([]), "нет"), "");
});

test("файл вместо текстового поля НЕ превращается в «[object File]»", () => {
  // Ради этого случая модуль и написан: String(File) дал бы строку из 13 символов,
  // которая прошла бы проверку «минимум 10 символов» и попала бы в данные
  const value = formString(fd([["title", file("x.webp")]]), "title");
  assert.equal(value, "");
  // Ниже намеренно воспроизводится сам дефект — в этом и смысл теста: показать, что
  // наивное приведение даёт 13 символов, а это больше минимальной длины у половины
  // полей формы, то есть подделка прошла бы валидацию. Правило линтера здесь ловит
  // ровно то, что мы демонстрируем, поэтому отключено точечно.
  /* eslint-disable-next-line @typescript-eslint/no-base-to-string */
  const naive = String(file("x.webp"));
  assert.equal(naive, "[object File]");
  assert.ok(naive.length >= 10);
});

test("CRLF из textarea приводится к LF, края обрезаются", () => {
  assert.equal(formText(fd([["b", "  первый\r\n\r\nвторой  "]]), "b"), "первый\n\nвторой");
});

test("пустой input file читается как отсутствие файла", () => {
  assert.equal(formFile(fd([["cover", file("empty.webp", 0)]]), "cover"), null);
});

test("выбранный файл возвращается", () => {
  const f = formFile(fd([["cover", file("cover.webp")]]), "cover");
  assert.equal(f?.name, "cover.webp");
});

test("строка в поле файла не считается файлом", () => {
  assert.equal(formFile(fd([["cover", "подделка"]]), "cover"), null);
});

test("несколько файлов: пустые отсеиваются", () => {
  const files = formFiles(
    fd([
      ["img", file("a.webp")],
      ["img", file("пусто.webp", 0)],
      ["img", file("b.webp")],
    ]),
    "img",
  );
  assert.deepEqual(
    files.map((f) => f.name),
    ["a.webp", "b.webp"],
  );
});
