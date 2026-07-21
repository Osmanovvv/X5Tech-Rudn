// E2E-самопроверка инструмента сверки: рендерим страницу с известной геометрией,
// сверяем с программно собранным эталоном (совпадение) и со сдвинутым (расхождение).
// Запуск: node scripts/selftest-compare.mjs
import sharp from "sharp";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { shoot } from "./shot.mjs";
import { compare } from "./compare.mjs";

const tmp = path.resolve(import.meta.dirname, ".selftest");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

// Страница: белый холст 400x300, лаймовый прямоугольник 200x150 в позиции (100,50)
const html = path.join(tmp, "page.html");
writeFileSync(
  html,
  `<!doctype html><meta charset="utf-8"><body style="margin:0">
<div id="target" style="position:relative;width:400px;height:300px;background:#fff">
  <div style="position:absolute;left:100px;top:50px;width:200px;height:150px;background:#B6E835"></div>
</div>`
);

const rect = (left) =>
  sharp({ create: { width: 400, height: 300, channels: 3, background: "#ffffff" } })
    .composite([
      {
        input: { create: { width: 200, height: 150, channels: 3, background: "#B6E835" } },
        left,
        top: 50,
      },
    ])
    .png();

const refGood = path.join(tmp, "ref-good.png");
const refBad = path.join(tmp, "ref-bad.png"); // прямоугольник сдвинут на 30px
await rect(100).toFile(refGood);
await rect(130).toFile(refBad);

const shot = path.join(tmp, "shot.png");
await shoot(pathToFileURL(html).href, "#target", 1200, shot);

const good = await compare(shot, refGood, path.join(tmp, "diff-good.png"));
const bad = await compare(shot, refBad, path.join(tmp, "diff-bad.png"));

console.log(`совпадающий эталон: ${good.pct.toFixed(3)}% (ожидание ≈0, PASS) → ${good.pass ? "PASS" : "FAIL"}`);
console.log(`сдвинутый эталон:   ${bad.pct.toFixed(2)}% (ожидание >2, FAIL) → ${bad.pass ? "PASS" : "FAIL"}`);

const ok = good.pass && good.pct < 0.5 && !bad.pass;
console.log(ok ? "SELFTEST OK" : "SELFTEST BROKEN");
process.exit(ok ? 0 : 1);
