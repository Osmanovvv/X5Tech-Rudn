// Нарезка полного рендера мобильного фрейма на 13 секционных эталонов.
// Рендер REST API пришёл с авто-масштабом (лимит 16384px по стороне) — границы масштабируем.
// Запуск: node scripts/slice-mobile-refs.mjs (из site/)
import sharp from "sharp";
import { writeFileSync } from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "figma-data/refs/mobile/_full.png");
const OUT = path.join(ROOT, "figma-data/refs/mobile");

const FRAME_H = 18535; // высота фрейма «Мобильная» в макетных px
const BOUNDS = [0, 884, 2264, 3607, 6392, 7870, 10757, 13125, 13905, 15230, 15565, 16076, 17330, 18535];
const NAMES = ["01-hero", "02-tebe-k-nam", "03-programma-daet", "04-programma-obucheniya", "05-treki",
  "06-kak-postupit", "07-prepodavateli", "08-x5-most", "09-tehnologii", "10-grant",
  "11-novosti", "12-forma", "13-footer"];

const meta = await sharp(SRC).metadata();
const scale = meta.height / FRAME_H;
console.log(`render ${meta.width}x${meta.height}, scale=${scale.toFixed(4)} (1.0 = макетные px)`);

const sections = {};
for (let i = 0; i < 13; i++) {
  const top = Math.round(BOUNDS[i] * scale);
  const bottom = Math.min(Math.round(BOUNDS[i + 1] * scale), meta.height);
  const name = `section-${NAMES[i]}.png`;
  await sharp(SRC)
    .extract({ left: 0, top, width: meta.width, height: bottom - top })
    .flatten({ background: "#ffffff" })
    .toFile(path.join(OUT, name));
  sections[NAMES[i]] = { yTop: BOUNDS[i], yBottom: BOUNDS[i + 1], file: `refs/mobile/${name}` };
  console.log(`${name}: y ${BOUNDS[i]}–${BOUNDS[i + 1]} (${BOUNDS[i + 1] - BOUNDS[i]}px макета)`);
}
writeFileSync(
  path.join(ROOT, "figma-data/mobile-sections.json"),
  JSON.stringify({ frameHeight: FRAME_H, renderScale: Number(scale.toFixed(4)), sections }, null, 2)
);
console.log("DONE");
