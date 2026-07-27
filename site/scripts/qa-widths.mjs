// Прогон по ширинам между макетными точками (Task 5.3, docs/responsive-spec.md).
// Запуск (сервер поднят): node scripts/qa-widths.mjs
//
// Между 320 и 1200 сайт не перевёрстывается, а масштабируется зумом от ближайшего макета,
// поэтому проверяем не «красиво ли», а признаки поломки масштабирования: горизонтальный скролл,
// съехавшую шапку и пропорцию высоты страницы к ширине — она должна меняться плавно, без скачков
// на границах диапазонов (768 — смена ветки, 1024 — бургер → капсула, 1200 — конец зума).
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const BASE = process.env.QA_URL || "http://localhost:3000";
const WIDTHS = [320, 375, 390, 430, 767, 768, 1023, 1024, 1199, 1200, 1440, 1920];
const OUT = path.resolve(import.meta.dirname, "../../figma-data/shots/widths");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const rows = [];
const problems = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content: "[data-reveal],[data-reveal-move],[data-reveal-scale]{opacity:1!important;translate:none!important;scale:none!important}",
  });

  const r = await page.evaluate(() => {
    const de = document.documentElement;
    const header = document.querySelector("header");
    const hb = header?.getBoundingClientRect();
    return {
      overflow: de.scrollWidth - de.clientWidth,
      height: de.scrollHeight,
      headerRight: hb ? Math.round(hb.right) : null,
      burger: Boolean(document.querySelector('header button[aria-controls="mobile-menu"]')?.checkVisibility?.()),
    };
  });

  if (r.overflow > 1) problems.push(`${width}: горизонтальный скролл +${r.overflow}px`);
  if (r.headerRight !== null && r.headerRight > width + 1) problems.push(`${width}: шапка шире вьюпорта (${r.headerRight})`);
  // Бургер по спеке живёт до 1024, капсула — с 1024
  const burgerExpected = width < 1024;
  if (r.burger !== burgerExpected) problems.push(`${width}: бургер ${r.burger ? "есть" : "нет"}, ожидался ${burgerExpected ? "есть" : "нет"}`);

  await page.screenshot({ path: path.join(OUT, `w-${width}.png`) });
  rows.push([String(width), `${r.height}px`, `h/w = ${(r.height / width).toFixed(2)}`, r.burger ? "бургер" : "капсула"]);
  await page.close();
}

await browser.close();
const wid = [0, 1, 2, 3].map((i) => Math.max(...rows.map((r) => r[i].length)));
for (const r of rows) console.log("  " + r.map((c, i) => c.padEnd(wid[i])).join("  |  "));
console.log(`\nскриншоты: ${OUT}`);
if (problems.length) {
  console.log(`\nПроблем: ${problems.length}`);
  problems.forEach((p) => console.log("  ✗ " + p));
  process.exit(1);
}
console.log("\nПоломок масштабирования не найдено.");
