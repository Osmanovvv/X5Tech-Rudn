// Вычисление Y-границ 13 секций мобильного фрейма из meta-mobile.xml.
// Координаты в metadata относительны родителя; абсолютный Y = сумма по цепочке предков.
import { readFileSync } from "fs";
import path from "path";

const xml = readFileSync(
  path.resolve(import.meta.dirname, "../../figma-data/meta-mobile.xml"),
  "utf8"
);

// Потоковый разбор тегов со стеком абсолютных Y
const tagRe = /<(\/?)([a-z-]+)((?:\s+[a-z-]+="[^"]*")*)\s*(\/?)>/g;
const attrRe = /([a-z-]+)="([^"]*)"/g;
const stack = []; // { absY }
const texts = []; // { name, absY }
const level1 = []; // { id, name, y, h }
let m;
while ((m = tagRe.exec(xml))) {
  const [, close, , attrsStr, selfClose] = m;
  if (close) {
    stack.pop();
    continue;
  }
  const attrs = {};
  let a;
  while ((a = attrRe.exec(attrsStr))) attrs[a[1]] = a[2];
  const y = Number(attrs.y ?? 0);
  const h = Number(attrs.height ?? 0);
  const parentAbs = stack.length ? stack[stack.length - 1].absY : -Number(attrs.y ?? 0); // корень нормируем в 0
  const absY = stack.length === 0 ? 0 : parentAbs + y;
  if (stack.length === 1) level1.push({ id: attrs.id, name: attrs.name ?? "", y, h });
  if (attrs.name) texts.push({ name: attrs.name, absY, h });
  if (!selfClose) stack.push({ absY });
}

const anchors = [
  ["02", "Тебе к нам"],
  ["03", "Программа даёт"],
  ["04", "Программа обучения"],
  ["05", "Треки третьего курса"],
  ["06", "Как поступить"],
  ["07", "Преподаватели и эксперты"],
  ["08", "мост в реальную"],
  ["09", "Прикоснись к технологиям"],
  ["10", "Аналитический центр"],
  ["11", "Новости и программы"],
  ["12", "Оставь заявку"],
  ["13", "Навигация"],
];

console.log("Якоря секций (absY):");
const bounds = [];
for (const [num, needle] of anchors) {
  const hit = texts
    .filter((t) => t.name.toLowerCase().includes(needle.toLowerCase()))
    .sort((a, b) => a.absY - b.absY)[0];
  console.log(`${num}  ${needle.padEnd(28)} ${hit ? Math.round(hit.absY) : "НЕ НАЙДЕН"}`);
  bounds.push(hit ? Math.round(hit.absY) : null);
}

console.log("\nВсего слоёв уровня 1:", level1.length);
console.log("Диапазон Y уровня 1:", Math.min(...level1.map((n) => n.y)), "…", Math.max(...level1.map((n) => n.y + n.h)));
