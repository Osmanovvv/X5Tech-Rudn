import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify } from "./slug.ts";

test("новостной заголовок", () => {
  assert.equal(
    slugify("День открытых дверей программы ИИ"),
    "den-otkrytyh-dverej-programmy-ii"
  );
});

test("тире и мягкий знак", () => {
  assert.equal(
    slugify("Треки третьего курса — выбери направление"),
    "treki-tretego-kursa-vyberi-napravlenie"
  );
});

test("латиница и цифры сохраняются", () => {
  assert.equal(
    slugify("X5 Tech — мост в реальную ИИ-практику"),
    "x5-tech-most-v-realnuyu-ii-praktiku"
  );
});

test("щ/ж/ю/я", () => {
  assert.equal(slugify("Общающаяся жюри-язва"), "obshchayushchayasya-zhyuri-yazva");
});

test("мусорные символы и края", () => {
  assert.equal(slugify("  Ёжик, №1!  "), "ezhik-1");
});
