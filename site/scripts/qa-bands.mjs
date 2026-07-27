// Построчная сверка мобильных секций с макетом (диагностика к qa-figma).
// Запуск (сервер поднят): node scripts/qa-bands.mjs [имя-секции …]
//
// Процент расхождения говорит «что-то не так», но не говорит ЧТО. Здесь оба изображения
// сводятся к списку горизонтальных полос контента (строк текста, картинок, разделителей) и
// сравниваются их позиции. Видно ровно то, что нужно для правки: сдвиг блока, лишний отступ,
// другой интерлиньяж (шаг между полосами), лишняя или пропавшая строка.
//
// Сравнение идёт ОТНОСИТЕЛЬНО первой полосы: границы мобильных эталонов нарезаны по фрейму и
// включают межсекционные зазоры, поэтому абсолютные координаты сравнивать бессмысленно.
import sharp from "sharp";
import path from "path";
import { existsSync } from "fs";
import { shoot } from "./shot.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const URL = process.env.QA_URL || "http://localhost:3000/";
const SHOTS = path.join(ROOT, "figma-data/shots/qa");
const REFS = path.join(ROOT, "figma-data/refs/mobile");
const SECTIONS = ["01-hero", "02-tebe-k-nam", "03-programma-daet", "04-programma-obucheniya",
  "05-treki", "06-kak-postupit", "07-prepodavateli", "08-x5-most", "09-tehnologii", "10-grant",
  "11-novosti", "12-forma"];

// Полосы контента: подряд идущие строки, где есть неб��лые пиксели.
async function bands(file, resizeTo) {
  let img = sharp(file).flatten({ background: "#ffffff" });
  if (resizeTo) img = img.resize({ width: resizeTo });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const dark = [];
  for (let y = 0; y < info.height; y++) {
    let n = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      if (data[i] < 200 || data[i + 1] < 200 || data[i + 2] < 200) n++;
    }
    dark.push(n);
  }
  const out = [];
  let start = null;
  dark.forEach((d, y) => {
    if (d > 0 && start === null) start = y;
    if (d === 0 && start !== null) {
      if (y - start > 3) out.push([start, y]);
      start = null;
    }
  });
  if (start !== null) out.push([start, dark.length]);
  return { list: out, height: info.height };
}

const only = process.argv.slice(2);
const targets = only.length ? SECTIONS.filter((s) => only.some((o) => s.includes(o))) : SECTIONS;

for (const s of targets) {
  const i = SECTIONS.indexOf(s);
  const shotPath = path.join(SHOTS, `bands-${s}.png`);
  const refPath = path.join(REFS, `section-${s}.png`);
  if (!existsSync(refPath)) continue;
  await shoot(URL, `main > section:nth-of-type(${i + 1})`, 320, shotPath);

  const ours = await bands(shotPath);
  const ref = await bands(refPath, 320);
  const o0 = ours.list[0]?.[0] ?? 0;
  const r0 = ref.list[0]?.[0] ?? 0;

  console.log(`\n=== ${s} === наш ${ours.height}px, макет ${ref.height}px (Δ ${ours.height - ref.height >= 0 ? "+" : ""}${ours.height - ref.height})`);
  console.log(`полос: наш ${ours.list.length}, макет ${ref.list.length}`);
  const n = Math.max(ours.list.length, ref.list.length);
  const bad = [];
  for (let k = 0; k < n; k++) {
    const a = ours.list[k];
    const b = ref.list[k];
    if (!a || !b) {
      bad.push(`  #${k}: ${a ? `только у нас ${a[0] - o0}` : `только в макете ${b[0] - r0}`}`);
      continue;
    }
    const d = a[0] - o0 - (b[0] - r0);
    if (Math.abs(d) >= 4) bad.push(`  #${k}: наш y=${a[0] - o0}, макет y=${b[0] - r0}  → Δ${d > 0 ? "+" : ""}${d}`);
  }
  if (!bad.length) console.log("  все полосы совпадают (±3px)");
  else bad.slice(0, 14).forEach((l) => console.log(l));
  if (bad.length > 14) console.log(`  … ещё ${bad.length - 14}`);
}
