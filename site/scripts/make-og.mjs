// Генерация статичной OG-картинки 1200×630 → public/og.jpg (Task 5.1).
// Рисуется в Chromium теми же шрифтами и токенами, что и сайт: подставится X5 Sans — картинка
// пересоберётся в фирменном шрифте одной командой, без ручного экспорта из Figma.
// Запуск: node scripts/make-og.mjs (из site/)
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const SITE = path.resolve(import.meta.dirname, "..");
const b64 = (p, mime) => `data:${mime};base64,${readFileSync(path.join(SITE, p)).toString("base64")}`;

const photo = b64("public/img/01-hero/image5-611bcc67-1456w.webp", "image/webp");
const logoRudn = b64("public/img/01-hero/logo-rudn-2x.webp", "image/webp");
const logoX5 = b64("public/img/01-hero/logo-x5-2x.webp", "image/webp");

const fontBold = b64("app/fonts/Inter-Bold.woff2", "font/woff2");
const fontRegular = b64("app/fonts/Inter-Regular.woff2", "font/woff2");
const fontMono = b64("app/fonts/IBMPlexMono-Regular.woff2", "font/woff2");

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>
@font-face{font-family:X5;src:url(${fontBold}) format('woff2');font-weight:700}
@font-face{font-family:X5;src:url(${fontRegular}) format('woff2');font-weight:400}
@font-face{font-family:Plex;src:url(${fontMono}) format('woff2');font-weight:400}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;font-family:X5,sans-serif;color:#272727;background:#fff;display:flex;overflow:hidden}
.left{width:700px;padding:56px 0 56px 64px;display:flex;flex-direction:column;justify-content:space-between}
.logos{display:flex;align-items:center;gap:20px}
.logos img.r{height:44px}.logos img.x{height:37px}
.logos span{font-size:26px;color:rgba(39,39,39,.35)}
.badge{display:inline-flex;align-items:center;align-self:flex-start;height:34px;padding:0 20px;border:1px solid #b6e835;border-radius:999px;font-family:Plex;font-size:14px;letter-spacing:.04em;text-transform:uppercase}
.rule{width:64px;height:6px;background:#b6e835;border-radius:3px;margin-top:26px}
h1{font-size:46px;font-weight:700;line-height:52px;letter-spacing:-1px;margin-top:18px}
p{margin-top:18px;max-width:580px;font-size:21px;line-height:29px;color:rgba(39,39,39,.85)}
.right{position:relative;width:500px;height:630px}
.right img{width:100%;height:100%;object-fit:cover}
.right:after{content:"";position:absolute;inset:0 auto 0 0;width:120px;background:linear-gradient(90deg,#fff,rgba(255,255,255,0))}
</style></head><body>
<div class="left">
  <div class="logos"><img class="r" src="${logoRudn}"><span>&times;</span><img class="x" src="${logoX5}"></div>
  <div>
    <span class="badge">Бакалавриат · 2026</span>
    <div class="rule"></div>
    <h1>Искусственный интеллект: разработка и обучение интеллектуальных систем</h1>
    <p>Совместная программа РУДН и X5 Tech — реальные данные и проекты с инженерами индустрии</p>
  </div>
</div>
<div class="right"><img src="${photo}"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const buf = await page.screenshot({ type: "jpeg", quality: 88 });
await browser.close();

const out = path.join(SITE, "public", "og.jpg");
writeFileSync(out, buf);
console.log(`og: ${out} (${(buf.length / 1024).toFixed(0)}KB, 1200x630)`);
