// Проверка доступности и семантики всех публичных страниц (Task 5.3).
// Запуск (сервер поднят): node scripts/qa-a11y.mjs
//
// Проверяем то, на чём Lighthouse снимает баллы Accessibility и SEO, плюс горизонтальный скролл
// на обеих макетных ширинах — он в этом проекте считается багом (docs/responsive-spec.md).
import { chromium } from "playwright";

const BASE = process.env.QA_URL || "http://localhost:3000";
const PAGES = [
  ["/", "главная"],
  ["/news/", "список новостей"],
  ["/news/den-otkrytyh-dverej-programmy-ii/", "новость"],
  ["/docs/pravila-priyoma/", "правовая страница"],
  ["/nesuschestvuyuschaya-stranica/", "404"],
];
const WIDTHS = [320, 1200];

const browser = await chromium.launch();
const problems = [];
const stats = [];

for (const [path, label] of PAGES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const r = await page.evaluate(() => {
      const bad = [];
      const text = (el) => (el.textContent || "").replace(/\s+/g, " ").trim();
      const name = (el) =>
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        text(el) ||
        [...el.querySelectorAll("img")].map((i) => i.getAttribute("alt")).join(" ").trim();

      if (document.documentElement.lang !== "ru") bad.push("нет lang=ru у <html>");
      if (!document.querySelector("main")) bad.push("нет landmark <main>");

      const h1 = [...document.querySelectorAll("h1")];
      if (h1.length !== 1) bad.push(`заголовков h1: ${h1.length} (нужен ровно один)`);

      // Пропуск уровней (h2 → h4) сбивает навигацию скринридера
      let prev = 0;
      for (const h of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
        const lvl = Number(h.tagName[1]);
        if (prev && lvl > prev + 1) bad.push(`пропущен уровень: ${h.tagName} после h${prev} («${text(h).slice(0, 40)}»)`);
        prev = lvl;
      }

      for (const img of document.querySelectorAll("img")) {
        if (img.getAttribute("alt") === null) bad.push(`<img> без alt: ${img.getAttribute("src")?.slice(-48)}`);
      }
      for (const a of document.querySelectorAll("a")) {
        if (!name(a)) bad.push(`ссылка без доступного имени: href=${a.getAttribute("href")}`);
        if (a.getAttribute("target") === "_blank" && !/noopener/.test(a.getAttribute("rel") || ""))
          bad.push(`target=_blank без rel=noopener: ${a.getAttribute("href")}`);
      }
      for (const b of document.querySelectorAll("button")) {
        if (!name(b)) bad.push("кнопка без доступного имени");
      }
      for (const f of document.querySelectorAll("input, select, textarea")) {
        if (f.type === "hidden" || f.tabIndex === -1) continue;
        const labelled =
          f.labels?.length || f.getAttribute("aria-label") || f.getAttribute("aria-labelledby") || f.getAttribute("title");
        if (!labelled) bad.push(`поле без подписи: name=${f.getAttribute("name")}`);
      }

      const de = document.documentElement;
      const overflow = de.scrollWidth - de.clientWidth;
      if (overflow > 1) bad.push(`горизонтальный скролл: +${overflow}px`);

      return { bad, nodes: document.querySelectorAll("*").length, height: de.scrollHeight };
    });

    stats.push(`${label} @${width}: узлов ${r.nodes}, высота ${r.height}px`);
    for (const b of new Set(r.bad)) problems.push(`${label} @${width}: ${b}`);
    await page.close();
  }
}

await browser.close();
stats.forEach((s) => console.log("  " + s));
if (problems.length) {
  console.log(`\nНайдено проблем: ${problems.length}`);
  problems.forEach((p) => console.log("  ✗ " + p));
  process.exit(1);
}
console.log("\nПроблем не найдено.");
