// Приёмка собранной статики (Task 6.1): поднимаем out/ обычным сервером БЕЗ SPA-фолбэка
// и обходим все адреса — из sitemap.xml и все внутренние ссылки со страниц.
// Так проверяется то, чего dev-сервер показать не может: правильность trailingSlash,
// наличие index.html в каждом каталоге и отдача 404.html с кодом 404.
//
// Запуск: node scripts/qa-static.mjs   (перед этим npm run build:static)
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { startStatic } from "./serve-static.mjs";

const OUT = path.resolve(import.meta.dirname, "..", "out");
if (!existsSync(OUT)) {
  console.error("Нет папки out/ — сначала `npm run build:static`");
  process.exit(2);
}

const { server, url } = await startStatic(OUT, 4321);
const problems = [];
const seen = new Set();

const get = async (p) => {
  const res = await fetch(url + p, { redirect: "manual" });
  return { status: res.status, body: res.headers.get("content-type")?.includes("text/html") ? await res.text() : "" };
};

// 1) Все адреса из карты сайта — они уйдут в поисковики, каждый обязан отвечать 200
const sitemap = readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
console.log(`адресов в sitemap.xml: ${sitemapUrls.length}`);

// 2) Плюс внутренние ссылки со всех страниц (футер, крошки, документы) — их в карте нет
const queue = [...new Set([...sitemapUrls, "/", "/news/"])];
while (queue.length) {
  const p = queue.shift();
  if (seen.has(p)) continue;
  seen.add(p);
  const { status, body } = await get(p);
  if (status !== 200) problems.push(`${p} → ${status}`);
  for (const m of body.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (/\.(png|jpe?g|webp|avif|svg|ico|css|js|xml|txt)$/i.test(href)) continue;
    if (href.startsWith("/_next/")) continue;
    if (!seen.has(href)) queue.push(href);
  }
}
console.log(`проверено адресов: ${seen.size}`);

// 3) Несуществующий адрес обязан отдать 404 (а не 200 и не пустоту)
const missing = await get("/takoj-stranicy-net/");
if (missing.status !== 404) problems.push(`несуществующий адрес → ${missing.status}, ожидался 404`);
else if (!/не найдена/i.test(missing.body)) problems.push("404 отдаёт не нашу страницу ошибки");

// 4) Адрес без слеша на конце: при trailingSlash:true каталог всё равно должен открываться
const noSlash = await get("/news");
if (noSlash.status !== 200) problems.push(`/news (без слеша) → ${noSlash.status}`);

// 5) Служебные файлы
for (const f of ["/robots.txt", "/sitemap.xml", "/og.jpg", "/favicon.ico", "/icon.svg", "/apple-icon.png"]) {
  const { status } = await get(f);
  if (status !== 200) problems.push(`${f} → ${status}`);
}

server.close();
if (problems.length) {
  console.log(`\nПроблем: ${problems.length}`);
  problems.forEach((p) => console.log("  ✗ " + p));
  process.exit(1);
}
console.log("\nВсе адреса отвечают, 404 работает, служебные файлы на месте.");
