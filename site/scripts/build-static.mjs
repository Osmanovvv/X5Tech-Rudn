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
import { existsSync, renameSync, rmSync } from "node:fs";
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
} finally {
  restore();
}
