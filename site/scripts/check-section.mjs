// Сверка секции сайта с эталоном Figma: скриншот → (кроп эталона) → pixelmatch → diff + overlay.
// Запуск: node scripts/check-section.mjs <name> <url> <selector> <width> <ref.png> [cropX,cropY,cropW,cropH[,scale]] [threshold%]
// Кроп задаётся в МАКЕТНЫХ px; scale — масштаб эталона (мобильный рендер = 0.8839, десктоп = 1).
// Пример шапки: node scripts/check-section.mjs header-1200 http://localhost:8231/ header 1200 ../figma-data/refs/desktop-01-hero.png 0,0,1200,84 2
import sharp from "sharp";
import path from "path";
import { mkdirSync } from "fs";
import { shoot } from "./shot.mjs";
import { compare, writeOverlay } from "./compare.mjs";

const [name, url, selector, width, refPath, cropArg, thresholdArg] = process.argv.slice(2);
if (!refPath) {
  console.error("usage: check-section.mjs <name> <url> <selector> <width> <ref.png> [x,y,w,h[,scale]] [threshold%]");
  process.exit(2);
}
const ROOT = path.resolve(import.meta.dirname, "../..");
const shotsDir = path.join(ROOT, "figma-data", "shots");
const diffsDir = path.join(ROOT, "figma-data", "diffs");
mkdirSync(shotsDir, { recursive: true });
mkdirSync(diffsDir, { recursive: true });

const shotPath = path.join(shotsDir, `${name}.png`);
await shoot(url, selector, Number(width), shotPath);

let refUse = path.resolve(refPath);
if (cropArg && cropArg.includes(",")) {
  const [x, y, w, h, scale = "1"] = cropArg.split(",").map(Number);
  const s = Number(scale) || 1;
  const croppedPath = path.join(shotsDir, `${name}-ref-crop.png`);
  await sharp(refUse)
    .extract({
      left: Math.round(x * s),
      top: Math.round(y * s),
      width: Math.round(w * s),
      height: Math.round(h * s),
    })
    .toFile(croppedPath);
  refUse = croppedPath;
}

const diffPath = path.join(diffsDir, `${name}-diff.png`);
const overlayPath = path.join(diffsDir, `${name}-overlay.html`);
const threshold = thresholdArg ? Number(thresholdArg) : 2;
const r = await compare(shotPath, refUse, diffPath, threshold);
writeOverlay(shotPath, refUse, overlayPath);
console.log(
  `${name}: ${r.width}x${r.height}, diff ${r.pct.toFixed(2)}% (порог ${threshold}%) → ${r.pass ? "PASS" : "FAIL"}`
);
console.log(`shot: ${shotPath}\ndiff: ${diffPath}\noverlay: ${overlayPath}`);
process.exit(r.pass ? 0 : 1);
