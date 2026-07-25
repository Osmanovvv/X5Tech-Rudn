// Досборка standalone-пакета (Task B5). Запускается автоматически после `npm run build`.
//
// Next кладёт в .next/standalone самодостаточный сервер, но НЕ копирует туда public/ и
// .next/static — предполагается, что их раздаёт CDN. У нас всё раздаёт сам Node, поэтому
// копируем их сюда же. Без этого сайт поднимется без картинок, шрифтов и стилей.
import { copyFileSync, cpSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SA = path.join(ROOT, ".next", "standalone");

// В статическом режиме standalone не создаётся — досборка не нужна.
if (process.env.STATIC) process.exit(0);

if (!existsSync(path.join(SA, "server.js"))) {
  console.error("[pack] .next/standalone/server.js не найден — сборка не завершилась?");
  process.exit(1);
}

// Копируем начисто: иначе повторный запуск вкладывает папку в саму себя (static/static)
for (const [from, to] of [
  [path.join(ROOT, "public"), path.join(SA, "public")],
  [path.join(ROOT, ".next", "static"), path.join(SA, ".next", "static")],
]) {
  if (!existsSync(from)) continue;
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

// .env копируем рядом с server.js: standalone-сервер делает chdir в свой каталог и ищет .env
// ИМЕННО там, а не в корне проекта. Без этой копии запуск «node .next/standalone/server.js»
// стартовал бы вообще без настроек — админка оказалась бы «не настроена», а данные (заявки!)
// писались бы внутрь .next и стирались следующей сборкой.
const envSrc = path.join(ROOT, ".env");
if (existsSync(envSrc)) {
  copyFileSync(envSrc, path.join(SA, ".env"));
  console.log("[pack] .env скопирован в .next/standalone");
} else {
  console.log("[pack] .env в корне не найден — сервер возьмёт настройки из окружения (systemd EnvironmentFile)");
}

console.log("[pack] standalone готов: .next/standalone (сервер + public + статика)");
console.log("[pack] запуск:  node .next/standalone/server.js");
