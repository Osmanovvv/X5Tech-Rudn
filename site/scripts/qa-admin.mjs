// Сквозная проверка админки: вход, создание, правка, удаление, защита разделов, выход.
//
// Запуск (сервер поднят, в .env заданы доступы):
//   ADMIN_PASS="ваш-пароль" node scripts/qa-admin.mjs
// Логин берётся из ADMIN_USERNAME, адрес — из QA_URL (по умолчанию localhost:3000).
//
// Проверка МЕНЯЕТ данные: создаёт новость и удаляет её же. Гоняйте на тестовом DATA_DIR —
// самый простой способ задать его, не трогая рабочий .env, это временный .env.local.
import { chromium } from "playwright";

const BASE = (process.env.QA_URL || "http://localhost:3000").replace(/\/+$/, "");
const USER = process.env.ADMIN_USERNAME || "admin";
const PASS = process.env.ADMIN_PASS;
if (!PASS) {
  console.error('Не задан пароль: ADMIN_PASS="…" node scripts/qa-admin.mjs');
  process.exit(2);
}

const TITLE = "Проверка админки: временная новость";
const problems = [];
const step = async (name, fn) => {
  try {
    await fn();
    console.log("  ✓ " + name);
  } catch (e) {
    console.log("  ✗ " + name + " — " + e.message.split("\n")[0].slice(0, 110));
    problems.push(name);
  }
};

const br = await chromium.launch();
const pg = await br.newPage({ viewport: { width: 1280, height: 900 } });

await pg.goto(BASE + "/admin/login/", { waitUntil: "networkidle" });
await step("вход по логину и паролю", async () => {
  await pg.fill("#username", USER);
  await pg.fill("#password", PASS);
  await pg.click("button[type=submit]");
  await pg.waitForURL(/\/admin\/?$/, { timeout: 30000 });
});

for (const path of ["/admin/news/", "/admin/content/", "/admin/content/programma/", "/admin/leads/"]) {
  await step("открывается " + path, async () => {
    const r = await pg.goto(BASE + path, { waitUntil: "networkidle" });
    if (!r.ok()) throw new Error("ответ " + r.status());
  });
}

await step("создание новости с обложкой", async () => {
  await pg.goto(BASE + "/admin/news/new/", { waitUntil: "networkidle" });
  await pg.fill("#title", TITLE);
  await pg.fill("#excerpt", "Короткое описание для проверки, что всё сохраняется как надо.");
  await pg.fill("#body", "Первый абзац проверки.\n\nВторой абзац проверки.");
  await pg.setInputFiles("#cover", "public/img/11-novosti/asset-6eab3432-1400w.webp");
  // Кнопку выбираем по подписи: в шапке админки есть вторая кнопка-submit («Выйти»),
  // и селектор button[type=submit] попадал бы в неё
  await pg.click('button[type=submit]:has-text("Опубликовать")');
  await pg.waitForURL(/\/admin\/news\/?$/, { timeout: 60000 });
  await pg.waitForSelector(`text=${TITLE}`, { timeout: 15000 });
});

await step("новость сразу открывается на сайте", async () => {
  const href = await pg.locator(`li:has-text("${TITLE}") a[href^="/news/"]`).first().getAttribute("href");
  const r = await pg.request.get(BASE + href);
  if (!r.ok()) throw new Error("страница новости отдала " + r.status());
  if (!(await r.text()).includes(TITLE)) throw new Error("на странице нет заголовка");
});

await step("правка сохраняется", async () => {
  await pg.locator(`li:has-text("${TITLE}") a:has-text("Изменить")`).first().click();
  await pg.waitForSelector("#title", { timeout: 20000 });
  await pg.fill("#excerpt", "Описание изменено при проверке.");
  await pg.click('button[type=submit]:has-text("Сохранить изменения")');
  await pg.waitForURL(/\/admin\/news\/?$/, { timeout: 60000 });
  await pg.waitForSelector(`text=${TITLE}`, { timeout: 15000 });
});

await step("удаление требует подтверждения и отменяется", async () => {
  const row = pg.locator(`li:has-text("${TITLE}")`).first();
  await row.locator('button:has-text("Удалить")').click();
  await row.locator('button:has-text("Да, удалить")').waitFor({ timeout: 5000 });
  await row.locator('button:has-text("Отмена")').click();
  await row.locator('button:has-text("Удалить")').waitFor({ timeout: 5000 });
});

await step("удаление после подтверждения", async () => {
  const row = pg.locator(`li:has-text("${TITLE}")`).first();
  await row.locator('button:has-text("Удалить")').click();
  await row.locator('button:has-text("Да, удалить")').click();
  await pg.waitForTimeout(4000);
  if (await pg.locator(`text=${TITLE}`).count()) throw new Error("новость осталась в списке");
});

await step("без сессии разделы и выгрузка закрыты", async () => {
  const ctx = await br.newContext();
  const anon = await ctx.newPage();
  for (const p of ["/admin/", "/admin/news/", "/admin/content/", "/admin/leads/"]) {
    await anon.goto(BASE + p, { waitUntil: "domcontentloaded" });
    if (!/\/admin\/login/.test(anon.url())) throw new Error(p + " открылся без входа");
  }
  const csv = await ctx.request.get(BASE + "/api/admin/leads.csv");
  if (csv.status() === 200) throw new Error("CSV с персональными данными отдаётся без входа");
  await ctx.close();
});

await step("выход завершает сессию", async () => {
  await pg.goto(BASE + "/admin/", { waitUntil: "networkidle" });
  await pg.click('button:has-text("Выйти")');
  await pg.waitForURL(/\/admin\/login/, { timeout: 20000 });
});

await br.close();
if (problems.length) {
  console.log(`\nПроблем: ${problems.length}`);
  process.exit(1);
}
console.log("\nАдминка работает полностью.");
