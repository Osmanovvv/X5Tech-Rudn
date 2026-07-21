// Пиксель-сверка скриншота с эталоном Figma.
// Запуск: node scripts/compare.mjs <shot.png> <ref.png> <diff.png> [threshold%] [overlay.html]
// Эталон приводится к размеру скриншота (sharp), затем pixelmatch.
// Выход 0 — расхождение ≤ порога (по умолчанию 2%), 1 — больше.
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

export async function compare(shotPath, refPath, diffPath, thresholdPct = 2) {
  // Приводим к МЕНЬШЕМУ из двух размеров: downscale честнее, чем растягивание
  // (апскейл эталона размывает края и даёт ложные расхождения).
  const shotMeta = await sharp(shotPath).metadata();
  const refMeta = await sharp(refPath).metadata();
  const w = Math.min(shotMeta.width, refMeta.width);
  const h = Math.round((w / shotMeta.width) * shotMeta.height);
  const shot = PNG.sync.read(
    await sharp(shotPath).resize(w, h, { fit: "fill" }).png().toBuffer()
  );
  const ref = PNG.sync.read(
    await sharp(refPath).resize(w, h, { fit: "fill" }).png().toBuffer()
  );
  const diff = new PNG({ width: shot.width, height: shot.height });
  const mismatched = pixelmatch(shot.data, ref.data, diff.data, shot.width, shot.height, {
    threshold: 0.15, // допуск на антиалиасинг текста браузер-vs-Figma
    includeAA: false,
  });
  mkdirSync(path.dirname(diffPath), { recursive: true });
  writeFileSync(diffPath, PNG.sync.write(diff));
  const pct = (mismatched / (shot.width * shot.height)) * 100;
  return { pct, mismatched, width: shot.width, height: shot.height, pass: pct <= thresholdPct };
}

export function writeOverlay(shotPath, refPath, outHtml) {
  const b64 = (p) => `data:image/png;base64,${readFileSync(p).toString("base64")}`;
  writeFileSync(
    outHtml,
    `<!doctype html><meta charset="utf-8"><title>overlay</title>
<style>body{margin:0;background:#888;font:13px system-ui}.wrap{position:relative}img{display:block;max-width:none}
.ref{position:absolute;inset:0;opacity:.5}.controls{position:fixed;top:8px;right:8px;background:#fff;padding:8px 12px;border-radius:8px;z-index:9}
body.diff .ref{opacity:1;mix-blend-mode:difference}</style>
<div class="controls"><label><input type="checkbox" onchange="document.body.classList.toggle('diff',this.checked)"> difference</label>
<input type="range" min="0" max="100" value="50" oninput="document.querySelector('.ref').style.opacity=this.value/100"></div>
<div class="wrap"><img src="${b64(shotPath)}"><img class="ref" src="${b64(refPath)}"></div>`
  );
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const [shotP, refP, diffP, thr, overlayP] = process.argv.slice(2);
  if (!diffP) {
    console.error("usage: node scripts/compare.mjs <shot.png> <ref.png> <diff.png> [threshold%] [overlay.html]");
    process.exit(2);
  }
  const r = await compare(shotP, refP, diffP, thr ? Number(thr) : 2);
  if (overlayP) writeOverlay(shotP, refP, overlayP);
  console.log(
    `${r.width}x${r.height}: ${r.mismatched}px diff = ${r.pct.toFixed(2)}% → ${r.pass ? "PASS" : "FAIL"}`
  );
  process.exit(r.pass ? 0 : 1);
}
