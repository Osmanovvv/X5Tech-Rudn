// Сквозная сверка вёрстки с эталонами Figma по всем секциям лендинга.
// Запуск (сервер должен быть поднят):
//   node scripts/qa-figma.mjs              — прогон, таблица + diff'ы в figma-data/diffs/qa
//   node scripts/qa-figma.mjs hero forma   — только совпадающие по имени проверки
//
// Методика. Эталон приводится к ширине скриншота ТОЛЬКО по ширине (аспект сохраняется), затем
// подбирается вертикальное смещение dy, при котором расхождение минимально, и сравнивается общая
// по высоте часть. Так сверяется содержимое, а не случайное совпадение внешних отступов:
// мобильные эталоны нарезаны по границам фрейма, поэтому межсекционные зазоры попадают то в один
// слайс, то в другой, и «в лоб» секции не совмещаются. Найденное dy печатается — если оно равно
// внешнему margin секции, это норма, а не расхождение.
//
// Порог 8% — не допуск на брак, а известный фон от подмены шрифта (D2: Inter вместо X5 Sans,
// у него другие метрики, поэтому глифы не попадают пиксель в пиксель). После получения X5 Sans
// пороги пересматриваются вниз.
import path from "path";
import { mkdirSync, existsSync } from "fs";
import sharp from "sharp";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { shoot } from "./shot.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const REFS = path.join(ROOT, "figma-data", "refs");
const SHOTS = path.join(ROOT, "figma-data", "shots", "qa");
const DIFFS = path.join(ROOT, "figma-data", "diffs", "qa");
const URL = process.env.QA_URL || "http://localhost:3000/";
const THRESHOLD = 8;

const M = "main > ";
const MOBILE_SECTIONS = ["01-hero", "02-tebe-k-nam", "03-programma-daet", "04-programma-obucheniya",
  "05-treki", "06-kak-postupit", "07-prepodavateli", "08-x5-most", "09-tehnologii", "10-grant",
  "11-novosti", "12-forma"];

const JOBS = [
  // ===== десктоп 1200: узлы Figma совпадают с боксами секций (кроме hero — его эталон снят с шапкой)
  { name: "d-01-hero", sel: `${M}section:nth-of-type(1)`, ref: "desktop-01-hero.png" },
  { name: "d-02-tebe-k-nam", sel: `${M}section:nth-of-type(2)`, ref: "desktop-02-tebe-k-nam.png" },
  { name: "d-03-programma-daet", sel: "#programma", ref: "desktop-03-programma-daet.png" },
  { name: "d-04-programma-obuch", sel: `${M}section:nth-of-type(4) > div:nth-child(1)`, ref: "desktop-04-programma-obucheniya.png" },
  { name: "d-05-treki", sel: "#treki > div:nth-child(1)", ref: "desktop-05-treki.png" },
  { name: "d-06-kak-postupit", sel: "#postuplenie > div:nth-child(1)", ref: "desktop-06-kak-postupit.png" },
  { name: "d-07-prepodavateli", sel: "#prepodavateli > div:nth-child(1)", ref: "new/prepodavateli-frame8.png" },
  { name: "d-08-x5-most", sel: `${M}section:nth-of-type(8)`, ref: "desktop-08-x5-most.png" },
  { name: "d-09-tehnologii", sel: `${M}section:nth-of-type(9)`, ref: "desktop-09-tehnologii.png" },
  { name: "d-10-grant", sel: `${M}section:nth-of-type(10)`, ref: "desktop-10-grant.png" },
  { name: "d-11-novosti", sel: "#novosti", ref: "desktop-11-novosti.png" },
  { name: "d-12-forma", sel: "#forma", ref: "desktop-12-forma.png" },
  { name: "d-13-footer", sel: "footer", ref: "desktop-13-footer.png" },
  // ===== мобильная 320
  ...MOBILE_SECTIONS.map((s, i) => ({
    name: `m-${s}`, sel: `${M}section:nth-of-type(${i + 1})`, ref: `mobile/section-${s}.png`, w: 320,
  })),
  { name: "m-13-footer", sel: "footer", ref: "mobile/section-13-footer.png", w: 320 },
  // ===== бургер-меню (панель существует в DOM только открытой)
  { name: "m-burger", sel: "#mobile-menu", ref: "new/burger-388-2.png", w: 320, open: true },
];

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const jobs = (only.length ? JOBS.filter((j) => only.some((o) => j.name.includes(o))) : JOBS)
  .map((j) => ({ ...j, w: j.w ?? 1200 }));

mkdirSync(SHOTS, { recursive: true });
mkdirSync(DIFFS, { recursive: true });

const toPng = async (buf) => PNG.sync.read(buf);

// Сравнение с сохранением аспекта: эталон масштабируется по ширине скриншота, дальше обе картинки
// режутся по общей высоте со смещением dy у эталона.
async function diffAt(shot, ref, dy) {
  const h = Math.min(shot.height, ref.height - dy);
  if (h <= 40) return { pct: 100, mismatched: 0, h: 0 };
  const cut = (png, top) => {
    const out = new PNG({ width: png.width, height: h });
    png.data.copy(out.data, 0, top * png.width * 4, (top + h) * png.width * 4);
    return out;
  };
  const a = cut(shot, 0);
  const b = cut(ref, dy);
  const diff = new PNG({ width: a.width, height: h });
  const mismatched = pixelmatch(a.data, b.data, diff.data, a.width, h, { threshold: 0.15, includeAA: false });
  return { pct: (mismatched / (a.width * h)) * 100, diff, h };
}

const rows = [];
let failed = 0;
for (const job of jobs) {
  const shotPath = path.join(SHOTS, `${job.name}.png`);
  const refPath = path.join(REFS, job.ref);
  if (!existsSync(refPath)) {
    rows.push([job.name, "—", "НЕТ ЭТАЛОНА", job.ref]);
    failed++;
    continue;
  }
  try {
    await shoot(URL, job.sel, job.w, shotPath, { openBurger: job.open });
  } catch (e) {
    rows.push([job.name, "—", "ОШИБКА СЪЁМКИ", e.message.split("\n")[0].slice(0, 50)]);
    failed++;
    continue;
  }
  const shot = await toPng(await sharp(shotPath).flatten({ background: "#ffffff" }).png().toBuffer());
  const ref = await toPng(
    await sharp(refPath).flatten({ background: "#ffffff" }).resize({ width: shot.width }).png().toBuffer()
  );
  // Грубый проход шагом 8 по ±160, затем точный ±8 вокруг найденного минимума
  let best = null;
  for (let dy = 0; dy <= Math.min(160, Math.max(0, ref.height - shot.height)); dy += 8) {
    const r = await diffAt(shot, ref, dy);
    if (!best || r.pct < best.pct) best = { ...r, dy };
  }
  if (!best) best = { ...(await diffAt(shot, ref, 0)), dy: 0 };
  for (let dy = Math.max(0, best.dy - 8); dy <= best.dy + 8; dy++) {
    const r = await diffAt(shot, ref, dy);
    if (r.pct < best.pct) best = { ...r, dy };
  }
  if (best.diff) best.diff.pack().pipe((await import("fs")).createWriteStream(path.join(DIFFS, `${job.name}.png`)));
  const ok = best.pct <= THRESHOLD;
  if (!ok) failed++;
  rows.push([job.name, `${best.pct.toFixed(2)}%`, ok ? "OK" : "ВЫШЕ ПОРОГА",
    `dy=${best.dy}, сверено ${best.h}px из ${shot.height}`]);
}

const wid = [0, 1, 2, 3].map((i) => Math.max(...rows.map((r) => String(r[i]).length)));
for (const r of rows) console.log(r.map((c, i) => String(c).padEnd(wid[i])).join("  |  "));
console.log(`\n${rows.length - failed}/${rows.length} в пределах ${THRESHOLD}%`);
process.exit(failed ? 1 : 0);
