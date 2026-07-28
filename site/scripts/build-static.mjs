// Запасная СТАТИЧЕСКАЯ сборка (Task B0/B3): STATIC=1 → next.config переключает output на
// 'export' и создаёт out/ — сайт без Node, для любого статик-хостинга.
//
// В этом режиме админки и API быть не может в принципе: у статики нет сервера, который бы их
// исполнял (Next и сам отказывается собирать route handlers с output:'export'). Поэтому на время
// сборки папки app/admin и app/api временно убираются из дерева маршрутов и возвращаются на
// место в finally — включая случай, когда сборка упала. Файлы при этом не редактируются.
//
// Итог статического режима: публичный сайт целиком (главная, /news, /docs, 404), без /admin,
// без приёма заявок и без обновления новостей без пересборки. Это задокументировано в README.
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const APP = path.join(ROOT, "app");
const SERVER_ONLY = ["admin", "api"];
const parked = (name) => path.join(APP, `_${name}.static-build-parked`);

// Страховка: если прошлый запуск прервали (Ctrl+C), папки могли остаться отложенными — вернём.
for (const name of SERVER_ONLY) {
  if (existsSync(parked(name)) && !existsSync(path.join(APP, name))) {
    renameSync(parked(name), path.join(APP, name));
    console.log(`[build:static] восстановлена app/${name} после прерванной сборки`);
  }
}

const moved = [];

function restore() {
  for (const name of moved) {
    if (existsSync(parked(name))) renameSync(parked(name), path.join(APP, name));
  }
  if (moved.length) console.log("[build:static] серверные разделы возвращены на место");
  moved.length = 0;
}

// finally НЕ выполняется при Ctrl+C и при завершении по сигналу: без этих обработчиков
// прерванная сборка оставила бы app/admin и app/api переименованными, и следующая ОБЫЧНАЯ
// сборка молча выпустила бы прод без админки и без /api.
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"]) {
  process.on(signal, () => {
    restore();
    process.exit(1);
  });
}
process.on("uncaughtException", (e) => {
  restore();
  console.error(e);
  process.exit(1);
});

try {
  for (const name of SERVER_ONLY) {
    const from = path.join(APP, name);
    if (existsSync(from)) {
      renameSync(from, parked(name));
      moved.push(name);
    }
  }
  if (moved.length) console.log(`[build:static] серверные разделы исключены: ${moved.join(", ")}`);

  // Типы маршрутов от предыдущей сборки помнят /admin и /api, которых в статике уже нет, —
  // проверка типов падает на несуществующих маршрутах. Удаляем, Next сгенерирует заново.
  for (const dir of ["dev/types", "types"]) {
    rmSync(path.join(ROOT, ".next", dir), { recursive: true, force: true });
  }

  process.env.STATIC = "1";
  execSync("next build --webpack", { stdio: "inherit" });
  flattenRscPayloads();
  writeHtaccess();
} finally {
  restore();
}

// Роутер Next предзагружает разметку соседних страниц и запрашивает её ПЛОСКИМ именем через
// точки: `__next.!KHNpdGUp.docs.$d$slug.__PAGE__.txt`. Экспорт же раскладывает те же данные
// ВЛОЖЕННЫМИ папками: `__next.!KHNpdGUp/docs/$d$slug/__PAGE__.txt`. На настоящем веб-сервере
// (nginx отдаёт файлы как есть) каждая такая предзагрузка возвращает 404 — десятки ошибок в
// консоли на каждой странице и минус балл Lighthouse. Навигация при этом работает: роутер
// откатывается на полную перезагрузку.
//
// Поэтому рядом с вложенными файлами кладём плоские копии с теми именами, которые реально
// запрашиваются. Файлы текстовые и мелкие, дубль не заметен.
function flattenRscPayloads() {
  const out = path.join(ROOT, "out");
  if (!existsSync(out)) return;
  let made = 0;

  const walkPage = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("__next.")) copyFlat(full, dir, entry.name);
      else walkPage(full);
    }
  };
  // Всё содержимое каталога `__next.X` переносится в имена вида `__next.X.a.b.c.txt`
  const copyFlat = (dir, pageDir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const next = `${prefix}.${entry.name}`;
      if (entry.isDirectory()) copyFlat(full, pageDir, next);
      else {
        const target = path.join(pageDir, next);
        if (!existsSync(target)) {
          copyFileSync(full, target);
          made++;
        }
      }
    }
  };

  walkPage(out);
  console.log(`[build:static] плоских копий разметки для предзагрузки: ${made}`);
}

// .htaccess для Apache. Кладём в саму сборку, чтобы настройка ехала вместе с файлами:
// на общем хостинге доступа к конфигу сервера обычно нет, только эта папка.
//
// Сжатие тут не «приятный бонус»: без него страница весит около 780 КБ вместо 130 —
// примерно две секунды на мобильном соединении и порядка 30 баллов Lighthouse.
// Для nginx та же настройка описана в README отдельно.
function writeHtaccess() {
  const out = path.join(ROOT, "out");
  if (!existsSync(out)) return;

  const text = `# Настройки Apache для статической сборки сайта. Файл создаётся автоматически
# скриптом scripts/build-static.mjs — правьте там, иначе изменения потеряются.

# ── Сжатие ──────────────────────────────────────────────────────────────────────
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml
  AddOutputFilterByType DEFLATE application/javascript application/json
  AddOutputFilterByType DEFLATE application/xml image/svg+xml
</IfModule>

# ── Кэш ─────────────────────────────────────────────────────────────────────────
# Файлы Next с хешем в имени неизменяемы: имя меняется вместе с содержимым.
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp                "access plus 1 year"
  ExpiresByType image/avif                "access plus 1 year"
  ExpiresByType font/woff2                "access plus 1 year"
  # Разметку не кэшируем: правки контента должны появляться сразу
  ExpiresByType text/html                 "access plus 0 seconds"
</IfModule>
<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|woff2|webp|avif|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>

# ── Типы файлов ─────────────────────────────────────────────────────────────────
# Старые сборки Apache не знают webp/avif и отдают их как поток байтов —
# браузер такую картинку не покажет.
<IfModule mod_mime.c>
  AddType image/webp .webp
  AddType image/avif .avif
  AddType font/woff2 .woff2
</IfModule>

# ── Страница 404 ────────────────────────────────────────────────────────────────
ErrorDocument 404 /404.html

# ── Каталоги ────────────────────────────────────────────────────────────────────
# Адреса заканчиваются слэшем (trailingSlash), внутри каждого лежит index.html.
DirectoryIndex index.html
Options -Indexes
`;

  writeFileSync(path.join(out, ".htaccess"), text, "utf8");
  console.log("[build:static] .htaccess для Apache записан (сжатие, кэш, 404)");
}
