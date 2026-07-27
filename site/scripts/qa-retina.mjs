// Проверка ассетов на ретине (Task 5.3). Запуск (сервер поднят): node scripts/qa-retina.mjs
//
// На обычном экране мыло не видно: браузер и так рисует картинку в CSS-пикселях. Проблема
// вылезает на экранах с двойной плотностью — если исходник не вдвое шире своего места
// в вёрстке, изображение растягивается и выглядит мягким. Именно это здесь и ловится:
// сравниваем натуральную ширину файла с шириной, в которой он отрисован, и требуем ×2.
//
// Обратная ошибка тоже считается: исходник вчетверо шире нужного — это лишние килобайты,
// которые ничего не дают даже на ретине.
import { chromium } from "playwright";

const BASE = process.env.QA_URL || "http://localhost:3000";
const PAGES = [
  ["/", "главная"],
  ["/news/", "список новостей"],
  ["/news/den-otkrytyh-dverej-programmy-ii/", "новость"],
];

const browser = await chromium.launch();
const soft = [];
const waste = [];

for (const [pagePath, label] of PAGES) {
  for (const width of [320, 1200]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
    await page.goto(BASE + pagePath, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // Досматриваем страницу до конца, иначе lazy-картинки не загрузятся и natural* будут нулевыми
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
    });
    await page.waitForTimeout(1200);

    // ВАЖНО про naturalWidth. Если картинка выбрана из srcset с дескриптором `w`, браузер
    // возвращает не ширину файла, а её делённую на вычисленную плотность: для кандидата
    // 1456w при sizes=728px получится 728. Считать по ней — значит решить, что запаса нет,
    // хотя он ровно двойной. Поэтому настоящую ширину берём из имени файла: пайплайн
    // ассетов всегда именует их `-<ширина>w.webp`.
    const imgs = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((i) => i.getClientRects().length > 0 && i.naturalWidth > 0)
        .map((i) => {
          const src = i.currentSrc.split("/").pop().split("?")[0];
          const named = src.match(/-(\d+)w\.[a-z0-9]+$/i);
          return {
            src,
            css: Math.round(i.getBoundingClientRect().width),
            natural: named ? Number(named[1]) : i.naturalWidth,
            svg: /\.svg$/i.test(i.currentSrc),
          };
        })
    );

    for (const i of imgs) {
      if (i.svg || i.css < 8) continue; // вектор масштабируется без потерь
      const ratio = i.natural / i.css;
      const where = `${label} @${width}`;
      if (ratio < 1.9) soft.push(`${where}: ${i.src} — ${i.natural}px на ${i.css}px (×${ratio.toFixed(2)})`);
      else if (ratio > 4) waste.push(`${where}: ${i.src} — ${i.natural}px на ${i.css}px (×${ratio.toFixed(1)})`);
    }
    await page.close();
  }
}
await browser.close();

const uniq = (a) => [...new Set(a)];
const softU = uniq(soft);
const wasteU = uniq(waste);

if (wasteU.length) {
  console.log(`Избыточные (можно ужать, на качество не влияет): ${wasteU.length}`);
  wasteU.forEach((w) => console.log("   " + w));
}
if (softU.length) {
  console.log(`\nНедостаточное разрешение для ретины: ${softU.length}`);
  softU.forEach((s) => console.log("  ✗ " + s));
  process.exit(1);
}
console.log("\nВсе растровые картинки покрывают двойную плотность.");
