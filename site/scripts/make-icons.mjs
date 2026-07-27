// Иконки сайта из app/icon.svg (Task 5.1): favicon.ico (16+32) и apple-icon.png 180×180.
// SVG — источник правды, растр пересобирается командой; в репозитории лежат оба.
// Запуск: node scripts/make-icons.mjs (из site/)
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const APP = path.resolve(import.meta.dirname, "..", "app");
const svg = readFileSync(path.join(APP, "icon.svg"));

// Apple требует непрозрачный квадрат без скруглений — iOS скругляет сам и на прозрачном
// фоне подставляет чёрный. Поэтому рисуем на лаймовой подложке во всю площадь.
const apple = await sharp({
  create: { width: 180, height: 180, channels: 4, background: "#b6e835" },
})
  .composite([{ input: await sharp(svg).resize(180, 180).png().toBuffer() }])
  .png()
  .toBuffer();
writeFileSync(path.join(APP, "apple-icon.png"), apple);

// Минимальный ICO-контейнер с PNG-кадрами (поддерживают все актуальные браузеры).
const sizes = [16, 32, 48];
const frames = [];
for (const s of sizes) frames.push({ s, png: await sharp(svg).resize(s, s).png({ compressionLevel: 9 }).toBuffer() });

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(frames.length, 4);

const dir = Buffer.alloc(16 * frames.length);
let offset = header.length + dir.length;
frames.forEach((f, i) => {
  const o = i * 16;
  dir.writeUInt8(f.s === 256 ? 0 : f.s, o); // width
  dir.writeUInt8(f.s === 256 ? 0 : f.s, o + 1); // height
  dir.writeUInt8(0, o + 2); // палитра не используется
  dir.writeUInt8(0, o + 3); // reserved
  dir.writeUInt16LE(1, o + 4); // color planes
  dir.writeUInt16LE(32, o + 6); // bits per pixel
  dir.writeUInt32LE(f.png.length, o + 8);
  dir.writeUInt32LE(offset, o + 12);
  offset += f.png.length;
});

const ico = Buffer.concat([header, dir, ...frames.map((f) => f.png)]);
writeFileSync(path.join(APP, "favicon.ico"), ico);

console.log(`icons: favicon.ico (${sizes.join("+")}, ${(ico.length / 1024).toFixed(1)}KB), apple-icon.png 180×180`);
