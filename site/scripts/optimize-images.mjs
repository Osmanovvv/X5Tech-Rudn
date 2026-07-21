// Оптимизация ассетов макета: figma-data/assets-raw/by-uuid → site/public/img/<section>/
// Растр → WebP q82 в двух ширинах (десктоп = 2x ширины в макете, мобайл = 640px cap),
// AVIF дополнительно для крупных ассетов hero. SVG копируются как есть.
// Итог: site/public/img/assets-map.json (uuid → файлы) для компонентов.
// Запуск: node scripts/optimize-images.mjs (из папки site/)
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW = path.join(ROOT, "figma-data", "assets-raw", "by-uuid");
const CTX_DIR = path.join(ROOT, "figma-data");
const OUT = path.resolve(import.meta.dirname, "..", "public", "img");
const manifest = JSON.parse(readFileSync(path.join(ROOT, "figma-data", "assets-raw", "manifest.json"), "utf8"));

// var-имя из ctx → слаг: imgMehaMaterialsColorGlass → meha-materials-color-glass
const varToSlug = (v) =>
  v.replace(/^img/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "") || "asset";

// Ширина рендера в десктопном макете: ищем w-[Npx]/size-[Npx] в обёртке вокруг src={var}
const ctxCache = new Map();
function renderWidth(sections, varName) {
  for (const s of sections) {
    if (!ctxCache.has(s)) {
      try { ctxCache.set(s, readFileSync(path.join(CTX_DIR, `ctx-${s}.md`), "utf8")); }
      catch { ctxCache.set(s, ""); }
    }
    const text = ctxCache.get(s);
    const idx = text.indexOf(`src={${varName}}`);
    if (idx === -1) continue;
    const back = text.slice(Math.max(0, idx - 600), idx);
    const m = [...back.matchAll(/(?:w|size)-\[(\d+(?:\.\d+)?)px\]/g)];
    if (m.length) return Math.ceil(Number(m[m.length - 1][1]));
  }
  return null;
}

const map = {};
const rows = [];
let heroBytes = 0;

for (const [uuid, info] of Object.entries(manifest)) {
  if (info.error) continue;
  const section = info.sections[0];
  const slug = varToSlug(info.var);
  const uuid8 = uuid.slice(0, 8);
  const src = path.join(RAW, info.file);
  const dir = path.join(OUT, section);
  mkdirSync(dir, { recursive: true });
  const entry = { section, slug, files: {} };

  if (info.file.endsWith(".svg")) {
    const name = `${slug}-${uuid8}.svg`;
    copyFileSync(src, path.join(dir, name));
    entry.files.svg = `/img/${section}/${name}`;
    const kb = statSync(path.join(dir, name)).size;
    if (section === "01-hero") heroBytes += kb;
    rows.push([uuid8, slug, "svg", "-", `${(kb / 1024).toFixed(1)}KB`]);
  } else {
    const img = sharp(src);
    const meta = await img.metadata();
    entry.width = meta.width;
    entry.height = meta.height;
    const rw = renderWidth(info.sections, info.var);
    const targets = [];
    if (meta.width <= 400) {
      targets.push(["native", meta.width]);
    } else {
      targets.push(["desktop", Math.min(meta.width, rw ? rw * 2 : 2400)]);
      const mobileW = Math.min(meta.width, 640);
      if (Math.abs(mobileW - targets[0][1]) > 100) targets.push(["mobile", mobileW]);
    }
    const outs = [];
    for (const [kind, w] of targets) {
      const name = `${slug}-${uuid8}-${w}w.webp`;
      await sharp(src).resize({ width: w }).webp({ quality: 82 }).toFile(path.join(dir, name));
      entry.files[`${kind}Webp`] = `/img/${section}/${name}`;
      const kb = statSync(path.join(dir, name)).size;
      outs.push(`${kind}:${w}w=${(kb / 1024).toFixed(0)}KB`);
      if (section === "01-hero" && kind !== "mobile") heroBytes += kb;
    }
    // AVIF для тяжёлых ассетов hero (LCP-кандидаты)
    if (section === "01-hero" && meta.width > 400) {
      const w = targets[0][1];
      const name = `${slug}-${uuid8}-${w}w.avif`;
      await sharp(src).resize({ width: w }).avif({ quality: 60 }).toFile(path.join(dir, name));
      entry.files.avif = `/img/${section}/${name}`;
      outs.push(`avif=${(statSync(path.join(dir, name)).size / 1024).toFixed(0)}KB`);
    }
    rows.push([uuid8, slug, `${meta.width}x${meta.height}`, rw ? `${rw}px` : "?", outs.join(" ")]);
  }
  map[uuid] = entry;
}

writeFileSync(path.join(OUT, "assets-map.json"), JSON.stringify(map, null, 2));
for (const r of rows) console.log(r.join("  |  "));
console.log(`\nfiles out: ${readdirSync(OUT, { recursive: true }).filter((f) => String(f).includes(".")).length}`);
console.log(`hero desktop set (webp+svg, без avif-дублей): ${(heroBytes / 1024).toFixed(0)}KB — бюджет 300KB`);
