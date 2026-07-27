// Скриншот секции для пиксель-сверки с эталоном Figma.
// Запуск: node scripts/shot.mjs <url> <selector> <width> <out.png>
// Пример: node scripts/shot.mjs http://localhost:8231/ "#hero" 1200 ../figma-data/shots/01-hero-1200.png
import { chromium } from "playwright";
import path from "path";
import { mkdirSync } from "fs";

// opts.openBurger — открыть мобильное меню перед съёмкой (панель существует в DOM только открытой)
export async function shoot(url, selector, width, outPath, opts = {}) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: Number(width), height: 900 },
      deviceScaleFactor: 1, // сверка в CSS-пикселях; retina проверяется отдельно (Task 5.3)
      // Фаза 3: под reduced-motion появления/счётчики показывают КОНЕЧНОЕ состояние сразу —
      // эталоны детерминированы, гонки с IntersectionObserver нет.
      reducedMotion: "reduce",
    });
    await page.goto(url, { waitUntil: "networkidle" });
    // Дать догрузиться шрифтам — иначе сверка текста врёт
    await page.evaluate(() => document.fonts.ready);
    // Страховка на случай, если reveal когда-либо окажется активен при съёмке: показать группы
    await page.addStyleTag({
      content:
        "[data-reveal],[data-reveal-move],[data-reveal-scale]{opacity:1!important;translate:none!important;scale:none!important}",
    });
    // Липкая шапка перекрывает секции при скролле к ним — прячем (кроме съёмки самой шапки
    // и мобильного меню, которое живёт внутри неё)
    if (!/^header/.test(selector) && !opts.openBurger) {
      await page.addStyleTag({ content: "header { visibility: hidden !important }" });
    }
    if (opts.openBurger) {
      await page.getByRole("button", { name: /меню/i }).first().click();
      await page.waitForTimeout(400);
    }
    const el = page.locator(selector).first();
    await el.waitFor({ state: "visible", timeout: 10_000 });
    // Ниже первого экрана картинки помечены loading="lazy" и начинают грузиться только когда
    // секция подъезжает к вьюпорту. Без этого ожидания сверка ловила бы полупустые секции.
    // Ждём только ВИДИМЫЕ картинки и не дольше 5 секунд: у секций две ветки вёрстки, и та,
    // что скрыта display:none, свои lazy-картинки не загрузит никогда — ожидание бы зависло.
    await el.scrollIntoViewIfNeeded();
    await el
      .evaluate(
        (node) =>
          new Promise((done) => {
            const pending = [...node.querySelectorAll("img")].filter(
              (img) => !img.complete && img.getClientRects().length > 0
            );
            if (!pending.length) return done(null);
            let left = pending.length;
            const tick = () => --left <= 0 && done(null);
            pending.forEach((img) => {
              img.addEventListener("load", tick, { once: true });
              img.addEventListener("error", tick, { once: true });
            });
            setTimeout(() => done(null), 5000);
          })
      )
      .catch(() => {});
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
