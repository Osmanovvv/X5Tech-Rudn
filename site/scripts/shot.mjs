// Скриншот секции для пиксель-сверки с эталоном Figma.
// Запуск: node scripts/shot.mjs <url> <selector> <width> <out.png>
// Пример: node scripts/shot.mjs http://localhost:8231/ "#hero" 1200 ../figma-data/shots/01-hero-1200.png
import { chromium } from "playwright";
import path from "path";
import { mkdirSync } from "fs";

export async function shoot(url, selector, width, outPath) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: Number(width), height: 900 },
      deviceScaleFactor: 1, // сверка в CSS-пикселях; retina проверяется отдельно (Task 5.3)
    });
    await page.goto(url, { waitUntil: "networkidle" });
    // Дать догрузиться шрифтам — иначе сверка текста врёт
    await page.evaluate(() => document.fonts.ready);
    const el = page.locator(selector).first();
    await el.waitFor({ state: "visible", timeout: 10_000 });
    mkdirSync(path.dirname(outPath), { recursive: true });
    await el.screenshot({ path: outPath, animations: "disabled" });
    return outPath;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const [url, selector, width, out] = process.argv.slice(2);
  if (!out) {
    console.error("usage: node scripts/shot.mjs <url> <selector> <width> <out.png>");
    process.exit(2);
  }
  await shoot(url, selector, width, out);
  console.log(`shot: ${out}`);
}
