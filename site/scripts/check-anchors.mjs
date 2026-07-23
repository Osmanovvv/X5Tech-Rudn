// Проверка якорей: каждая внутренняя ссылка href="#id" в собранном HTML обязана иметь цель.
// Ловит рассинхрон «пункт меню есть, а id секции забыли» — так уже терялись 3 пункта из 6.
// Запуск: npm run build && node scripts/check-anchors.mjs
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import path from "path";

const OUT = path.resolve(import.meta.dirname, "..", "out");
if (!existsSync(OUT)) {
  console.error("out/ не найден — сначала npm run build");
  process.exit(2);
}

function htmlFiles(dir) {
  const res = [];
  for (const entry of readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (statSync(p).isDirectory()) res.push(...htmlFiles(p));
    else if (entry.endsWith(".html")) res.push(p);
  }
  return res;
}

let failed = 0;
for (const file of htmlFiles(OUT)) {
  const html = readFileSync(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  // href="#" (кнопка «Наверх») не имеет группы захвата и сюда не попадает — это валидно
  const anchors = new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]));
  const missing = [...anchors].filter((a) => !ids.has(a));
  const rel = path.relative(OUT, file) || "index.html";

  // Строго спрашиваем только со страниц, где секции реально есть (сейчас — главная).
  // На служебных страницах шапка/футер ссылаются на секции главной: это межстраничная
  // навигация, её чинить корневыми basePath-ссылками в Фазе 4 (появятся /news и /docs).
  const isLanding = rel === "index.html";

  if (!missing.length) {
    console.log(`✓ ${rel}: якорей ${anchors.size}, все резолвятся`);
  } else if (isLanding) {
    failed++;
    console.error(`✗ ${rel}: нет целей → ${missing.map((m) => "#" + m).join(", ")}`);
  } else {
    console.warn(`! ${rel}: ссылки на секции главной (${missing.length}) — нужны корневые ссылки, Фаза 4`);
  }
}

if (failed) {
  console.error(`\nБитых страниц: ${failed}`);
  process.exit(1);
}
console.log("\nЯкоря главной на месте.");
