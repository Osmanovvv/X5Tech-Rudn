# План разработки фронтенда «РУДН ИИ × X5 Tech» — v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> v2 после адверсарной ревизии (33 агента, 26 подтверждённых замечаний — все внесены).

**Goal:** Пиксель-перфект фронтенд лендинга по Figma-макету (13 секций, десктоп 1200 + мобильная 320), со страницами новостей, SEO и PageSpeed ≥ 90, передаваемый клиенту папкой с README.

**Architecture:** Next.js (App Router) в режиме `output: 'export'` — статические файлы для любого сервера РУДН; путь к динамике остаётся (см. Task 4.5). Контент — в JSON (`site/content/`), компоненты только рендерят. Все секции — Server Components; `'use client'` разрешён ровно четырём островам: Header (бургер), NewsCarousel, LeadForm, ScrollReveal. Сторонние runtime-зависимости запрещены (маска телефона, карусель, анимации — руками).

**Tech Stack:** Next.js 16 + React + TypeScript, Tailwind CSS v4 + CSS-переменные, шрифты self-hosted через `next/font/local`, sharp для изображений, Playwright + pixelmatch для сверки.

**Исходные данные (выгружены 21.07.2026, повторно из Figma не качать):**
- `figma-data/ctx-01…13.md` — код-референс секций; `meta-landing-pc.xml`, `meta-mobile.xml` — деревья слоёв с геометрией (мобильная структура — только здесь)
- MCP-клиент: `tools/figma-oauth/mcp.js` (переносится из scratchpad в Task 0.1); fileKey `CeEt0PKuTYT6RctMmv0hGn`
- Node id секций: hero 271:1779, тебе-к-нам 271:1818, программа-даёт 271:1844, программа-обучения 271:1884, треки 271:1984, как-поступить 271:2014, преподаватели 271:2112, x5-мост 271:2145, технологии 271:2158, грант 271:2188, новости 271:2191, форма 271:2238, footer 271:2273, мобильная 271:2313

**Правило качества (каждая секция):**
1. Эталон запрашивается из Figma ОДИН раз и сохраняется в `figma-data/refs/<node-id>.png`; повторные сверки — только с локальным файлом. Расхождение свежего скриншота Figma с сохранённым эталоном = дизайнер правит макет = **стоп и вопрос пользователю**, никаких молчаливых правок. При принятой правке — точечная перевыгрузка ctx одной секции.
2. Сверка инструментом Task 0.4 (не «на глаз»): браузерный скриншот секции на **1200** и **320** (мобильная база макета — именно 320, не 390) → приведение к меньшему размеру → pixelmatch; порог: десктоп ≤ 2%, мобильные полосы ≤ 3.5% (мобильный эталон существует только в масштабе 0.884 из-за лимита рендера Figma 16384px — растровые элементы дают шумовой пол ~2–3%; фактический замер шума: header 3.03% при визуально идентичной вёрстке). Спорные зоны — режимом наложения; каждое падение сверки разбирается по diff-карте, а не закрывается порогом.
3. Смоук без эталона: 390, 430, 768, 1024 — по адаптивной спецификации Task 0.5.
4. Сознательные отклонения от макета (blur, hairline-прозрачности, 3D-рендеры) — записываются в `docs/deviations.md` (что/почему/скриншоты) и показываются пользователю вместе с секцией; одобрение секции = одобрение её отклонений. Первая запись уже есть: hairline 0.1→0.4.
5. Показ пользователю → одобрение (**предварительное до подключения X5 Sans**, см. Task 5.2) → коммит.

**Паузы между вызовами Figma MCP ≥ 8 сек. Скачивание ассетов по прямым URL квоту MCP не тратит.**

**Дефолты при молчании внешних людей (график не останавливается):**
- X5 Sans не пришёл к началу Фазы 5 → сдаём на Inter + задокументированная процедура замены в README + пометка клиенту; Фазу 2 стараемся не закрывать без шрифта — эскалировать через Никиту при старте Фазы 2.
- Нет ответа про сервер к Фазе 4 → админка строится по варианту «локальный инструмент + пересборка» (Task 4.5) — работает и на статике, и на Node.
- Нет эндпойнта формы → URL живёт в `site.json.leadEndpoint`, поведение-заглушка честное (Task 2.12).
- Дизайнер молчит про анимации 5 рабочих дней после Task 3.4 → список считается согласованным.
- Нет адресов правовых документов → страницы-заглушки `/docs/*` с пометкой в README (Task 4.4).

---

## Фаза 0 — Каркас и инструменты

### Task 0.1: Перенос Figma-клиента, git, скаффолд

**Files:** Create: `tools/figma-oauth/`, `.gitignore`, `.gitattributes`, `site/`

- [ ] Перенести `mcp.js`, `oauth.js`, `tokens.json`, `session.json` из scratchpad в `tools/figma-oauth/` (сессионный temp может быть очищен ОС — сейчас это единая точка отказа). Проверить работу: `node tools/figma-oauth/mcp.js call whoami '{}'`
- [ ] Дописать в `mcp.js` авто-refresh: при 401 — POST token_endpoint c `grant_type=refresh_token` из tokens.json, перезапись файла
- [ ] `git init`; `.gitignore`: `node_modules/`, `.next/`, `out/`, `figma-data/assets-raw/`, **`tools/figma-oauth/tokens.json`**, `tools/figma-oauth/session.json`; `.gitattributes`: `* text=auto`, `*.png *.webp *.avif *.woff2 *.ico binary`
- [ ] Коммит docs + figma-data (ctx/meta/refs — канонический снимок версии макета); проверить `git status`, что tokens.json НЕ в индексе
- [ ] `npx create-next-app@latest site --ts --tailwind --app --no-src-dir --import-alias "@/*" --skip-git` (если .git внутри site появился — удалить)
- [ ] `site/next.config.ts`:
```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,            // out/news/<slug>/index.html — работает на любом статик-сервере
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',  // подпапка на сервере клиента — открытый вопрос №5
  images: { unoptimized: true },
};
```
- [ ] Внутренние ссылки — только `next/link`; пути к img/fonts не хардкодить в JSON/CSS (basePath), фоновые картинки — через компоненты
- [ ] `npm run build` → `out/` создаётся; зафиксировать в `docs/budget.md` First Load JS пустого проекта (ожидание ~102-105KB gz — это пол бюджета; наш код поверх ≤ 15-20KB, итоговый бюджет ≤ 125KB gz с обоснованием в README)
- [ ] Коммит `chore: scaffold, static export, figma tooling`

### Task 0.2: Шрифты и дизайн-токены

**Files:** Create: `site/app/fonts.ts`, `site/public/fonts/*`, Modify: `site/app/globals.css`, `site/app/layout.tsx`

- [ ] Скачать **Inter** woff2 (Regular/Medium/Bold, кириллица+латиница) → `site/public/fonts/inter/` — это явный временный шрифт вёрстки (в системах его нет, Google CDN запрещён по ТЗ)
- [ ] Скачать **IBM Plex Mono** Regular woff2 (кириллица+латиница) → `site/public/fonts/plex-mono/`
- [ ] `fonts.ts`: `next/font/local` (совместим со static export; сам ставит preload с crossorigin и генерит metric-fallback): `sans` = X5 Sans файлы, когда придут / пока Inter; `mono` = IBM Plex Mono; переменные `--font-sans`, `--font-mono` в Tailwind
- [ ] Токены в `globals.css` (`@theme`): ink #272727, lime #B6E835, lime-deep #99C726, lime-soft #C7E047, lavender #EBEAFF, paper #FAFAFA, mist #F1F1F1, card #FCFCFC, hairline rgba(216,216,216,0.4) (отклонение — в deviations.md)
- [ ] `layout.tsx`: **`<html lang="ru">`** (дефолт create-next-app — en, это SEO-дефект)
- [ ] Контейнер `.container-site`: max-width 1200, паддинги 20px < 768
- [ ] Коммит `feat: fonts (self-hosted), design tokens`

### Task 0.3: Ассеты — все секции сразу

**Files:** Create: `scripts/fetch-assets.mjs`, `scripts/optimize-images.mjs`, `site/lib/slug.ts` (переносится сюда из Фазы 4 — нужен раньше)

- [ ] `slug.ts`: транслит кириллицы + kebab-case, юнит-тест на 5 заголовках (`«День открытых дверей» → den-otkrytyh-dverej`)
- [ ] `fetch-assets.mjs`: собрать ВСЕ ссылки `figma.com/api/mcp/asset/<uuid>` из всех ctx-файлов (~98 шт) → скачать с Bearer в `figma-data/assets-raw/<section>/`. Имена: `slug(data-name)-<uuid8>.<ext>` (в макете кириллица, пробелы и 4 одинаковых «День открытых дверей» — иначе коллизии-перезаписи); писать `map.json` (uuid → файл → секция). Прямые URL временные — качаем всё сейчас, пока живые; квоту MCP это не тратит. Паузы 2с
- [ ] Лог скрипта: фактический пиксельный размер каждого исходника vs размер ноды в макете (если экспорт 1x — НЕ апскейлить, пометить в map.json)
- [ ] `optimize-images.mjs` (sharp): два таргета ширины (мобильный/десктопный кроп по фактическим размерам в макетах) × WebP q82 (+AVIF для hero) → `site/public/img/<section>/`; SVG — как есть
- [ ] Проверка: hero-набор (фото + 2 блоба с прозрачностью) суммарно ≤ 300KB
- [ ] Коммит `feat: full asset pipeline (98 assets)`

### Task 0.4: Инструмент пиксель-сверки

**Files:** Create: `scripts/compare.mjs`, `scripts/shot.mjs`, devDep: playwright, pixelmatch, pngjs

- [ ] `shot.mjs`: Playwright chromium, `deviceScaleFactor: 1`, viewport width 1200|320, скриншот элемента по селектору `#<section-id>` → `figma-data/shots/<section>-<width>.png`
- [ ] `compare.mjs`: resize эталона (sharp) к размеру браузерного скриншота → pixelmatch → процент отличий + diff-карта `figma-data/diffs/…png`; выход 0 при ≤ 2%
- [ ] Режим наложения: генерит HTML со слоями (browser 50% поверх эталона + difference blend) для ручной доводки
- [ ] Прогон на тестовой странице (цветной прямоугольник) — инструмент работает end-to-end
- [ ] Коммит `feat: pixel-compare tooling`

### Task 0.5: Адаптивная спецификация (утверждается пользователем ДО вёрстки)

**Files:** Create: `docs/responsive-spec.md`

- [ ] Таблица: 320–767 = мобильная раскладка (база 320: контейнер 100%, паддинги 20, шрифты/радиусы фиксированы, фото тянутся object-fit; 321–430 — только растяжение, без перевёрстки); 768–1023 = промежуточная (сетки 4→2, hero в колонку, меню ещё десктопное ИЛИ уже бургер — зафиксировать: бургер < 1024); ≥ 1024 = десктоп (контейнер до 1200, центр); ≥ 1200 = контейнер 1200 по центру, full-bleed фоны/ленты/hero-фон тянутся
- [ ] Правило коллапса для каждого типа блока (карточки 4→2→1, таймлайн в колонку, таблица экзаменов < 768 — карточки строк, две колонки Бюджет/Контракт < 768 — стопка)
- [ ] **Показать пользователю, получить одобрение — до Task 2.1**
- [ ] Коммит `docs: responsive spec`

### Task 0.6: Мобильные эталоны (у мобильных секций нет node id!)

**Files:** Create: `scripts/mobile-refs.mjs`, `figma-data/refs/mobile/*`

- [ ] Мобильный макет — один фрейм 271:2313 (320×18535, 330 слоёв россыпью). `get_screenshot` целиком отдаст даунскейл — непригодно. Скачать полноразмерный рендер частями: сгруппировать дочерние ноды по Y-диапазонам из `meta-mobile.xml` (полосы по ~3000px), для каждой полосы get_screenshot по 3–5 нодам-якорям, либо (запасной путь) прогнать REST `GET /v1/images?ids=271:2313&scale=1` — 320×18535 = 5.9MP, в лимит рендера REST входит; если scope `mcp:connect` на REST не пустит — разовый personal access token от пользователя (1 минута, Figma → Settings → Security)
- [ ] Нарезать рендер по Y-границам секций (сопоставить с 13 десктопными секциями по контенту) → `figma-data/refs/mobile/section-NN.png`; границы записать в `figma-data/mobile-sections.json`
- [ ] Визуальная проверка нарезки (13 файлов, каждый — цельная секция)
- [ ] Коммит `feat: mobile reference slices`

**Чекпойнт Фазы 0: показать пользователю структуру проекта, страницу с токенами, спецификацию 0.5, примеры мобильных эталонов. First Load JS в docs/budget.md.**

---

## Фаза 1 — Сквозные элементы

### Task 1.1: Header (ctx-01, слои 271:1786–1797)
- [ ] Десктоп: капсула #FAFAFA 1120×69 r1000, лого РУДН × X5 Tech, меню 13px (якоря #programma #prepodavateli #postuplenie #novosti), кнопка «Подать заявку» #B6E835 → #forma
- [ ] Мобильная (320, по refs/mobile): компактная капсула, бургер < 1024 → полноэкранный оверлей: **focus trap, Escape закрывает, фокус возвращается на кнопку, aria-expanded/aria-controls**, скролл боди заблокирован
- [ ] Sticky после 40px с тенью; плавный скролл к якорям
- [ ] Сверка 0.4 (1200/320) + смоук 390/768/1024 → показ → коммит

### Task 1.2: Footer (ctx-13) + site.json
- [ ] `site/content/site.json`: контакты, адрес, соцсети, 7 правовых ссылок (`{ label, href }` — адреса пока `/docs/<slug>/`, см. Task 4.4), `siteUrl` (домен клиента — открытый вопрос №6, пока плейсхолдер), `leadEndpoint: null`, `metrikaId: null`, флаг вебмастера
- [ ] Тёмный #272727, 4 колонки → мобильная стопка по refs/mobile; копирайт
- [ ] Сверка → показ → коммит

---

## Фаза 2 — Секции (по одной; одобрение предварительное до X5 Sans)

Шаблон: компонент из `ctx-NN` (Server Component) → мобильная раскладка по `refs/mobile/section-NN.png` и meta-mobile → эталон десктопа в `figma-data/refs/` (1 вызов get_screenshot, один раз) → сверка 0.4 на 1200 и 320 (≤2%) → смоук 390/430/768/1024 по спецификации 0.5 → отклонения в deviations.md → показ пользователю → коммит. После каждой фазы — First Load JS в budget.md (не только в конце!).

### Task 2.1: Hero (271:1779)
- [ ] Заголовок Bold 42/42.8 ls −3%; бейдж IBM Plex Mono в капсуле-бордере; CTA #99C726 со стрелкой; статы 50/152/4 года; фото + 2 блоба + глассморфизм-карточка
- [ ] LCP: `<picture>` AVIF/WebP, отдельный мобильный кроп; preload через `imagesrcset`/`imagesizes` (или два `<link media=…>`), `fetchpriority="high"` только LCP-фото; блобы `decoding="async" fetchpriority="low"` (не lazy — above the fold); `backdrop-blur` замерить в Performance с троттлингом — при просадке на мобиле заменить полупрозрачным фоном (в deviations.md)

### Task 2.2: «Тебе к нам, если ты» (271:1818)
- [ ] Заголовок с лаймовым подчёркиванием; 4 карточки (4→2→1); ленты — статичная разметка с углами (анимация в 3.1)

### Task 2.3: «Программа даёт» (271:1844) — bento + 3D-иллюстрации, мобильная стопка

### Task 2.4: «Программа обучения» (271:1884) — `content/program.json`
- [ ] Схема `[{ course, title, note, photo, tags[] }]` — все 4 курса и чипы из ctx-04; таймлайн; карта «50%+ в штат X5 Tech»

### Task 2.5: «Треки третьего курса» (271:1984) — 2 карточки NLP/CV

### Task 2.6: «Как поступить?» (271:2014) — `content/admission.json`
- [ ] Статы (250 000 ₽/семестр + сноска, 50, 152, 4 года); Бюджет/Контракт `[{ dateChip, title, text }]`; таблица экзаменов
- [ ] < 768: колонки — стопка, таблица — карточки строк; если аккордеон — aria-expanded, клавиатура

### Task 2.7: «Преподаватели» (271:2112) — `content/teachers.json`, 6 персон (ФИО из текста ctx-07)

### Task 2.8: «X5 Tech — мост» (271:2145) — лавандовая #EBEAFF, цитата Неверова, статы

### Task 2.9: «Прикоснись к технологиям» (271:2158) — 4 карточки с 3D-иконками

### Task 2.10: Грант-полоса (271:2188)

### Task 2.11: «Новости и программы» (271:2191) — `content/news.json` + NewsCarousel
- [ ] Схема `{ slug, title, category, date, cover, excerpt, body }`, слаг из Task 0.3-slug.ts; 5 демо
- [ ] **Карусель показывает последние 6 новостей по дате** (правило роста); scroll-snap без библиотек; стрелки — `<button aria-label>`, клавиатурно доступны; точки; свайп; «Все новости →» на /news

### Task 2.12: Форма заявки (271:2238) — остров LeadForm
- [ ] Поля: Имя, Фамилия, Почта, Телефон (маска руками ~30 строк), Комментарий; 2 чекбокса согласий (ссылки → страницы Task 4.4)
- [ ] **Никакого файла в app/api** (POST-роут уронит static-сборку). Отправка: клиентский fetch на абсолютный `site.json.leadEndpoint`; пока он null — честная имитация: console.log + сообщение «Отправка заявок будет подключена; напишите на ai-priem@rudn.ru» (mailto) — НЕ фейковое «Спасибо»
- [ ] Состояния: idle / **pending (кнопка disabled)** / success / **error с повтором**; формат запроса (метод, поля, Content-Type) — в README для бэкенда клиента

**Фаза 2 закрыта, когда 13 секций + header/footer одобрены (предварительно). First Load JS ≤ бюджет.**

---

## Фаза 3 — Анимации

### Task 3.1: Marquee-ленты — CSS keyframes translateX, контент ×2, `will-change: transform`; **пауза вне вьюпорта** (IntersectionObserver → animation-play-state) и при prefers-reduced-motion
### Task 3.2: Появления при скролле — остров ScrollReveal (opacity/translateY 12px, stagger 60мс), reduced-motion → выкл
### Task 3.3: Ховеры кнопок/карточек, плавные якоря
### Task 3.4: Скринкаст всех анимаций → дизайнеру через Никиту; **молчание 5 рабочих дней = согласовано**

---

## Фаза 4 — Новости и служебные страницы

### Task 4.1: `site/lib/news.ts` — чтение news.json, сортировка, поиск по слагу, `latest(n)`
### Task 4.2: `/news` — сетка карточек; **обложки ниже фолда loading="lazy"**; при > 12 новостей — SSG-пагинация `/news/page/N` (решение зафиксировать с пользователем); **собственные generateMetadata (title/description/OG)** — «мета-теги на каждой странице» из ТЗ
### Task 4.3: `/news/[slug]` — generateStaticParams, generateMetadata; **notFound() для неизвестного слага**; «Другие новости» (3)
### Task 4.4: Правовые страницы и 404
- [ ] Собрать из ctx-12/ctx-13 полный список правовых ссылок; запрос клиенту адресов/текстов (открытый вопрос №7); пока — шаблонные страницы `/docs/<slug>/` с пометкой-заглушкой и записью в README
- [ ] `app/not-found.tsx` в стиле сайта; README: `error_page 404 /404.html`
### Task 4.5: Решение по админке (поднято из Фазы 6 — админка входит в ТЗ, не опция)
- [ ] Дефолт (работает и на статике, и на Node, не трогает сданный фронт): **локальный инструмент** `tools/admin/` — маленькое приложение (запускается `npm run admin` на машине контент-менеджера): CRUD news.json (заголовок → авто-слаг, обложка → копирование в img и оптимизация sharp) + кнопка «Пересобрать» (`npm run build`). Задачи: форма редактирования, валидация схемы, тест цикла «добавил новость → build → страница появилась»
- [ ] Если клиент ответил «есть Node»: апгрейд-вариант — Next без `output:'export'` (условный конфиг `output: process.env.STATIC ? 'export' : undefined`), `/admin` с auth + API; **поставка меняется со статики на Node-процесс, README переписывается** — отдельным мини-планом
- [ ] В README в любом случае: процесс «изменил контент → пересборка»

**Чекпойнт: список, страница новости, 404, демо админ-инструмента.**

---

## Фаза 5 — SEO, шрифт, производительность

### Task 5.1: SEO-обвязка
- [ ] `metadataBase` из `site.json.siteUrl`; canonical; OG-теги + **статичный og-image 1200×630** (из hero-ассетов); favicon-набор (ico + apple-touch-icon + svg)
- [ ] `app/sitemap.ts`, `app/robots.ts` (абсолютные URL от siteUrl; в README — «сменили домен → пересборка»)
- [ ] Слот Вебмастера (meta verification из site.json); **Метрика/Вебвизор — только отложенно**: динамическая вставка после `load` + requestIdleCallback (или первый pointerdown/scroll), ID из `site.json.metrikaId`; синхронный сниппет в head запрещён (−5..15 баллов mobile). README: Lighthouse-приёмка меряется с включённым счётчиком
- [ ] Семантика: один h1, section id, alt всех img — чек-лист
- [ ] Рекомендация сверх ТЗ (согласовать с пользователем): JSON-LD EducationalOrganization (главная) + NewsArticle (новости) — расширенные сниппеты Яндекса
### Task 5.2: X5 Sans
- [ ] woff2-сабсеты (кириллица+латиница) Regular/Medium/Bold → fonts.ts; метрико-совместимый fallback (size-adjust/ascent/descent-override — next/font сгенерит)
- [ ] **Полная пересверка ВСЕХ секций + /news + /news/[slug] на 1200 и 320 инструментом 0.4** (метрики шрифта другие — поплывут переносы и высоты) → доводка → повторный показ секций с изменениями
### Task 5.3: Аудит производительности
- [ ] `content-visibility: auto` + `contain-intrinsic-size` на секции ниже фолда (страница длинная, мобильная ~19k px; DOM-аудит Lighthouse); `loading="lazy"` на все img кроме hero
- [ ] Lighthouse (Perf + **Accessibility**) каждой страницы: ≥ 90 mobile / ≥ 95 desktop; TBT/INP с включённой Метрикой; CLS < 0.1 (размеры img, шрифтовой fallback)
- [ ] Бюджет: First Load JS ≤ 125KB gz (пол Next ~105KB задокументирован в budget.md)
- [ ] Прогон 320/375/390/430/768/1024/1200/1440/1920 со скриншотами; **hero, фото курсов и преподавателей — дополнительно deviceScaleFactor=2** (retina-мыло не видно на DPR1)

---

## Фаза 6 — Передача

### Task 6.1: README и сборка
- [ ] README: требования (Node только для сборки/админки), `npm ci && npm run build`, деплой = `out/` на сервер; **пересборка под подпапку** (`NEXT_PUBLIC_BASE_PATH`); правка content/*.json + пересборка; админ-инструмент; куда вписать metrikaId/verification/siteUrl/leadEndpoint (+ формат запроса формы); error_page 404; процедура замены шрифта (если сдаём на Inter); согласованные отклонения (ссылка на deviations.md)
- [ ] Чистая сборка по README с нуля; прогон `out/` статик-сервером **без SPA-фолбэков** (`python -m http.server`) — клик по всем URL из sitemap (trailingSlash-проверка)
- [ ] Финальный коммит, архив папки

---

## Открытые вопросы (с дефолтами — см. шапку)
1. Файлы X5 Sans (woff2, R/M/B) — Никита. Дефолт: Inter.
2. Сервер РУДН: Node или статика? Дефолт: статика + локальный админ-инструмент.
3. Эндпойнт формы. Дефолт: leadEndpoint в site.json + честная заглушка.
4. Список анимаций — дизайнер. Дефолт: наш список после 5 раб. дней.
5. **Корень домена или подпапка?** Дефолт: корень; пересборка с NEXT_PUBLIC_BASE_PATH описана в README.
6. **Финальный домен (siteUrl)** — для canonical/sitemap/OG. Дефолт: плейсхолдер + README.
7. **Правовые документы** (тексты/адреса для 7 ссылок футера и 2 согласий формы). Дефолт: страницы-заглушки /docs/*.
8. JSON-LD (рекомендация сверх ТЗ) — да/нет.
