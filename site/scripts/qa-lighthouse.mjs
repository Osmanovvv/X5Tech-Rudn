// Lighthouse по собранной статике (Task 5.3). Запуск: node scripts/qa-lighthouse.mjs
// Перед этим: npm run build:static
//
// Меряем именно out/, а не dev-сервер: в разработке Next отдаёт несжатые чанки, HMR-клиент
// и оверлей ошибок — баллы получаются заниженными и к продакшену отношения не имеют.
// Отчёты складываются в figma-data/lighthouse/.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { startStatic } from "./serve-static.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "site", "out");
const REPORTS = path.join(ROOT, "figma-data", "lighthouse");
if (!existsSync(OUT)) {
  console.error("Нет папки out/ — сначала `npm run build:static`");
  process.exit(2);
}
rmSync(REPORTS, { recursive: true, force: true });
mkdirSync(REPORTS, { recursive: true });

const PAGES = [
  ["/", "glavnaya"],
  ["/news/", "novosti"],
  ["/news/den-otkrytyh-dverej-programmy-ii/", "novost"],
];
// Пороги из docs/budget.md
const TARGET = { mobile: { performance: 90, accessibility: 95 }, desktop: { performance: 95, accessibility: 95 } };

const { server, url } = await startStatic(OUT, 4322);
const rows = [];
let failed = 0;

for (const [pagePath, slug] of PAGES) {
  for (const preset of ["mobile", "desktop"]) {
    const out = path.join(REPORTS, `${slug}-${preset}.json`);
    // Через shell: на Windows npx — это .cmd, а spawnSync такие файлы напрямую не запускает.
    // Пути в кавычках: каталог проекта содержит пробел.
    const cmd = [
      "npx --yes lighthouse@12", `"${url + pagePath}"`,
      // Прямые слеши обязательны: команда идёт через shell, а он съедает обратные как экранирование
      "--quiet", "--output=json", `--output-path="${out.replace(/\\/g, "/")}"`,
      preset === "desktop" ? "--preset=desktop" : "--form-factor=mobile",
      "--only-categories=performance,accessibility,best-practices,seo",
      '--chrome-flags="--headless=new --no-sandbox --disable-gpu"',
    ].join(" ");
    // Запуск ТОЛЬКО асинхронный: статический сервер живёт в этом же процессе, а execSync
    // блокирует цикл событий — Chrome стучался бы в порт, который перестал отвечать,
    // и падал с «Target closed».
    // На Windows Lighthouse к тому же валится с EPERM при удалении временного профиля Chrome —
    // уже ПОСЛЕ того, как записал отчёт. Поэтому код возврата игнорируем, а факт успеха
    // определяем по наличию файла отчёта.
    await new Promise((done) => {
      const p = spawn(cmd, { shell: true, stdio: "ignore" });
      const kill = setTimeout(() => p.kill(), 300_000);
      p.on("exit", () => { clearTimeout(kill); done(); });
      p.on("error", () => { clearTimeout(kill); done(); });
    });
    if (!existsSync(out)) {
      console.error(`Lighthouse не отдал отчёт для ${pagePath} (${preset})`);
      process.exit(2);
    }
    const r = JSON.parse(readFileSync(out, "utf8"));
    const sc = (k) => Math.round((r.categories[k]?.score ?? 0) * 100);
    const perf = sc("performance");
    const a11y = sc("accessibility");
    const t = TARGET[preset];
    const ok = perf >= t.performance && a11y >= t.accessibility;
    if (!ok) failed++;
    rows.push([
      `${slug} · ${preset}`, String(perf), String(a11y), String(sc("best-practices")), String(sc("seo")),
      `LCP ${(r.audits["largest-contentful-paint"]?.numericValue / 1000).toFixed(2)}с`,
      `CLS ${(r.audits["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(3)}`,
      `TBT ${Math.round(r.audits["total-blocking-time"]?.numericValue ?? 0)}мс`,
      ok ? "OK" : `НИЖЕ ЦЕЛИ (perf≥${t.performance}, a11y≥${t.accessibility})`,
    ]);
  }
}
server.close();

const head = ["страница", "perf", "a11y", "best", "seo", "LCP", "CLS", "TBT", ""];
const all = [head, ...rows];
const w = head.map((_, i) => Math.max(...all.map((r) => r[i].length)));
for (const r of all) console.log(r.map((c, i) => c.padEnd(w[i])).join("  "));
console.log(`\nотчёты: ${REPORTS}`);
process.exit(failed ? 1 : 0);
