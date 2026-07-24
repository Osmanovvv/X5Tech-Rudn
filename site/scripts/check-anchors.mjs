// Проверка якорей в собранном HTML. Ловит рассинхрон «пункт меню есть, а id секции забыли».
// Две формы ссылок:
//   href="#id"   — одностраничный якорь: цель обязана быть в ТОМ ЖЕ файле (актуально для главной);
//   href="/#id"  — межстраничная навигация на секцию главной (шапка/футер на /news, /docs после
//                  Фазы 4): цель обязана быть в index.html.
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

const idsOf = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

// id-цели главной (для проверки корневых ссылок /#id со всех страниц).
const homeFile = path.join(OUT, "index.html");
const homeIds = existsSync(homeFile) ? idsOf(readFileSync(homeFile, "utf8")) : new Set();

let failed = 0;
for (const file of htmlFiles(OUT)) {
  const html = readFileSync(file, "utf8");
  const ids = idsOf(html);
  const rel = path.relative(OUT, file) || "index.html";

  // href="#id" — цель в этом же документе. href="#" (кнопки) сюда не попадает.
  const same = new Set([...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]));
  const missingSame = [...same].filter((a) => !ids.has(a));

  // href="/#id" (в т.ч. с basePath: href="/base/#id") — цель на главной.
  const root = new Set([...html.matchAll(/href="\/[^"]*#([^"]+)"/g)].map((m) => m[1]));
  const missingRoot = [...root].filter((a) => !homeIds.has(a));

  if (!missingSame.length && !missingRoot.length) {
    console.log(`✓ ${rel}: якорей ${same.size + root.size}, все резолвятся`);
    continue;
  }
  if (missingSame.length) {
    failed++;
    console.error(`✗ ${rel}: локальные якоря без целей → ${missingSame.map((m) => "#" + m).join(", ")}`);
  }
  if (missingRoot.length) {
    failed++;
    console.error(`✗ ${rel}: корневые ссылки без целей на главной → ${missingRoot.map((m) => "/#" + m).join(", ")}`);
  }
}

if (failed) {
  console.error(`\nБитых страниц: ${failed}`);
  process.exit(1);
}
console.log("\nВсе якоря (локальные и корневые /#) резолвятся.");
