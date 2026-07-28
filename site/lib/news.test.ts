import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bodyUploads,
  coverPath,
  formatNewsDate,
  latest,
  otherNews,
  parseBody,
  sortNews,
  type NewsItem,
} from "./news.ts";

const item = (slug: string, date: string): NewsItem => ({
  slug,
  date,
  title: slug,
  category: "события",
  cover: "asset-1",
  excerpt: "",
  body: "",
});

test("сортировка по дате убыванию", () => {
  const got = sortNews([item("a", "2026-01-05"), item("b", "2026-03-01"), item("c", "2026-02-01")]);
  assert.deepEqual(
    got.map((i) => i.slug),
    ["b", "c", "a"],
  );
});

test("сортировка не портит исходный массив", () => {
  const src = [item("a", "2026-01-05"), item("b", "2026-03-01")];
  sortNews(src);
  assert.equal(src[0].slug, "a");
});

test("при равных датах сохраняется исходный порядок", () => {
  const got = sortNews([item("первый", "2026-01-01"), item("второй", "2026-01-01")]);
  assert.deepEqual(
    got.map((i) => i.slug),
    ["первый", "второй"],
  );
});

test("latest с неположительным n возвращает пусто", () => {
  const src = [item("a", "2026-01-01")];
  assert.deepEqual(latest(src, 0), []);
  assert.deepEqual(latest(src, -3), []);
});

test("otherNews исключает текущую новость", () => {
  const src = [item("a", "2026-01-01"), item("b", "2026-02-01"), item("c", "2026-03-01")];
  assert.deepEqual(
    otherNews(src, "b").map((i) => i.slug),
    ["c", "a"],
  );
});

test("дата в формат макета", () => {
  assert.equal(formatNewsDate("2026-06-18"), "18.06.2026");
});

test("путь к обложке: из макета и из админки", () => {
  assert.equal(coverPath("asset-6eab3432", 640), "/img/11-novosti/asset-6eab3432-640w.webp");
  assert.equal(coverPath("upload:priem-abc", 1400), "/api/uploads/priem-abc-1400w.webp");
});

test("абзацы разделяются пустой строкой", () => {
  const blocks = parseBody("Первый абзац.\n\nВторой абзац.");
  assert.deepEqual(blocks, [
    { kind: "p", text: "Первый абзац." },
    { kind: "p", text: "Второй абзац." },
  ]);
});

test("CRLF и лишние пробелы между абзацами не мешают", () => {
  // Текст приходит и из репозитория, и из textarea админки
  const blocks = parseBody("Первый.\r\n   \r\nВторой.");
  assert.equal(blocks.length, 2);
});

test("одинокая картинка становится блоком-иллюстрацией", () => {
  const blocks = parseBody("Текст.\n\n![подпись](upload:foto-1)");
  assert.deepEqual(blocks[1], {
    kind: "figure",
    images: [{ alt: "подпись", src: "upload:foto-1" }],
  });
});

test("две картинки в одной строке идут в ряд", () => {
  const blocks = parseBody("![слева](upload:a) ![справа](upload:b)");
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].kind, "figure");
  if (blocks[0].kind === "figure") assert.equal(blocks[0].images.length, 2);
});

test("больше двух в ряд разбивается на пары — макет большего не предполагает", () => {
  const blocks = parseBody("![](upload:a) ![](upload:b) ![](upload:c)");
  assert.equal(blocks.length, 2);
  if (blocks[0].kind === "figure") assert.equal(blocks[0].images.length, 2);
  if (blocks[1].kind === "figure") assert.equal(blocks[1].images.length, 1);
});

test("картинка внутри текста абзаца оставляет абзац текстом", () => {
  const blocks = parseBody("Смотри ![тут](upload:a) внимательно.");
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].kind, "p");
});

test("bodyUploads находит только загруженные файлы", () => {
  const body = "![a](upload:foto-1)\n\n![b](asset-iz-maketa)\n\n![c](upload:foto-2)";
  assert.deepEqual(bodyUploads(body), ["upload:foto-1", "upload:foto-2"]);
});

test("пустое тело даёт пустой список блоков", () => {
  assert.deepEqual(parseBody(""), []);
  assert.deepEqual(parseBody("\n\n   \n\n"), []);
});
