// Нарезка НОВОГО мобильного эталона (figma-data/refs/new/mobile-271-2313.png, 320×19901)
// на секционные слайсы. Запуск (сервер поднят): node scripts/slice-mobile-new.mjs
//
// Границы секций в макете руками не размечаем — они ищутся автоматически. Для каждой нашей
// секции берётся её «профиль тёмности» (доля неб��лых пикселей построчно) и скользящим окном
// ищется место в эталоне, где такой же профиль совпадает лучше всего. Профиль — одномерный
// сигнал, поэтому поиск быстрый и устойчив к тому, что содержимое местами расходится
// (ради этого всё и затевается).
//
// Секции ищутся по порядку: окно поиска начинается там, где кончилась предыдущая.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { shoot } from "./shot.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const URL = process.env.QA_URL || "http://localhost:3000/";
const REF = path.join(ROOT, "figma-data/refs/new/mobile-271-2313.png");
const OUT = path.join(ROOT, "figma-data/refs/new/mobile");
const SHOTS = path.join(ROOT, "figma-data/shots/qa/new");

const NAMES = ["01-hero", "02-tebe-k-nam", "03-programma-daet", "04-programma-obucheniya",
  "05-treki", "06-kak-postupit", "07-prepodavateli", "08-x5-most", "09-tehnologii", "10-grant",
  "11-novosti", "12-forma", "13-footer"];

mkdirSync(OUT, { recursive: true });
mkdirSync(SHOTS, { recursive: true });

// Доля «не фоновых» пикселей в каждой строке. Порог мягкий: ловим и текст, и цветные плашки.
async function profile(file) {
  const { data, info } = await sharp(file).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const out = new Float32Array(info.height);
  for (let y = 0; y < info.height; y++) {
    let n = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      if (data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235) n++;
    }
    out[y] = n / info.width;
  }
  return out;
}

const refProfile = await profile(REF);
const refMeta = await sharp(REF).metadata();
console.log(`эталон ${refMeta.width}×${refMeta.height}`);

const cost = (q, from) => {
  let s = 0;
  for (let i = 0; i < q.length; i++) {
    const r = from + i < refProfile.length ? refProfile[from + i] : 0;
    const d = q[i] - r;
    s += d * d;
  }
  return s / q.length;
};

// Тёмный футер — надёжный якорь: первая строка, где почти вся ширина залита #272727.
// Корреляция профиля на хвосте ненадёжна (форма и футер длинные, а места до конца фрейма мало),
// поэтому конец разметки задаём точно, а не поиском.
let footerTop = refProfile.length;
{
  const { data, info } = await sharp(REF).flatten({ background: "#ffffff" }).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let y = 0; y < info.height; y++) {
    let dark = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      if (data[i] < 70 && data[i + 1] < 70 && data[i + 2] < 70) dark++;
    }
    if (dark / info.width > 0.9) { footerTop = y; break; }
  }
  console.log(`якорь: тёмный футер с y=${footerTop} (высота ${info.height - footerTop})`);
}

// Сначала снимаем ВСЕ секции: чтобы ограничить поиск сверху, нужно знать, сколько места
// займут секции ниже — иначе длинная секция садится в конец фрейма, где для неё нет места.
const QS = [];
for (let i = 0; i < NAMES.length; i++) {
  const sel = i === 12 ? "footer" : `main > section:nth-of-type(${i + 1})`;
  const shotPath = path.join(SHOTS, `${NAMES[i]}.png`);
  await shoot(URL, sel, 320, shotPath);
  QS.push({ q: await profile(shotPath), shotPath });
}

// Границы секций в новом фрейме. Найдены поиском по профилю (невязка каждой печатается ниже)
// и сверены глазами по вырезкам из эталона. Зафиксированы здесь, чтобы нарезка была
// воспроизводимой: поиск по хвосту неустойчив — форма и футер длинные, места до конца фрейма
// мало, и секция может «сесть» не туда.
const TOPS = [60, 883, 2264, 3609, 6377, 7875, 10762, 14438, 15140, 16547, 16856, 17361, 18550];

const bounds = [];
let cursor = 0;
for (let i = 0; i < NAMES.length; i++) {
  const q = QS[i].q;
  // Сколько ещё должно поместиться между этой секцией и футером
  const rest = QS.slice(i + 1, 12).reduce((s, x) => s + x.q.length, 0);

  // Ищем по ВСЕЙ оставшейся части эталона, а не в узком окне рядом с предыдущей секцией:
  // последовательный поиск накапливает ошибку — стоит одной секции сесть на 300px не туда,
  // и все следующие уезжают за ней. Глобальный минимум так не ошибается.
  // Грубый проход идёт по прореженному вчетверо профилю, точный — вокруг найденного места.
  // Футер не ищем вовсе: его начало известно точно по якорю.
  let best;
  if (TOPS[i] !== undefined) {
    best = { at: TOPS[i], c: cost(q, TOPS[i]) };
  } else {
    const lo = Math.max(0, cursor - 60);
    const hi = Math.max(lo, Math.min(footerTop - 200, footerTop - rest - q.length + 400));
    best = { at: lo, c: Infinity };
    for (let at = lo; at <= hi; at += 4) {
      const c = cost(q, at);
      if (c < best.c) best = { at, c };
    }
    for (let at = Math.max(0, best.at - 4); at <= best.at + 4; at++) {
      const c = cost(q, at);
      if (c < best.c) best = { at, c };
    }
  }

  // Слайс режем ДО начала следующей секции — так эталонный кусок это ровно секция макета,
  // а не «столько же пикселей, сколько у нас».
  const nextTop = TOPS[i + 1] ?? refProfile.length;
  const height = Math.max(40, Math.min(nextTop - best.at, refProfile.length - best.at));
  await sharp(REF)
    .extract({ left: 0, top: best.at, width: 320, height })
    .flatten({ background: "#ffffff" })
    .toFile(path.join(OUT, `section-${NAMES[i]}.png`));

  bounds.push({ name: NAMES[i], top: best.at, height, ours: q.length, cost: Number(best.c.toFixed(5)) });
  console.log(
    `${NAMES[i].padEnd(24)} y=${String(best.at).padStart(5)}  высота наша ${String(q.length).padStart(5)}` +
      `  невязка ${best.c.toFixed(4)}`
  );
  cursor = best.at + q.length;
}

writeFileSync(path.join(ROOT, "figma-data/mobile-sections-new.json"), JSON.stringify({ frame: 19901, bounds }, null, 2));
console.log(`\nслайсы: ${OUT}`);
