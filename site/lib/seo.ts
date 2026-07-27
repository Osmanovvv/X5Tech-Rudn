// Единая точка правды для SEO: домен, абсолютные URL, тексты по умолчанию (Task 5.1).
//
// Домен берётся из content/site.json → siteUrl, но перекрывается переменной окружения
// NEXT_PUBLIC_SITE_URL на этапе сборки. Так клиент меняет домен без правки репозитория:
//   NEXT_PUBLIC_SITE_URL=https://ai.rudn.ru npm run build
// Значение попадает в canonical, OG, sitemap и robots — все они абсолютные, потому что
// Яндекс и Google требуют абсолютных URL в sitemap, а относительный canonical теряет
// basePath при размещении сайта в подпапке (см. lib/asset.ts).
import type { Metadata } from "next";
import site from "@/content/site.json";

const RAW = process.env.NEXT_PUBLIC_SITE_URL || site.siteUrl;
/** Домен без слеша на конце. */
export const SITE_URL = RAW.replace(/\/+$/, "");
/** Сайт живёт на плейсхолдер-домене — canonical/sitemap отдавать наружу ещё нельзя. */
export const IS_PLACEHOLDER_DOMAIN = /\.example$/.test(new URL(SITE_URL).hostname);

const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/** Абсолютный URL страницы или ассета с учётом basePath: abs("/news/") → https://…/news/ */
export const abs = (path: string): string => `${SITE_URL}${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;

export const SITE_NAME = "Факультет искусственного интеллекта РУДН × X5 Tech";
export const PROGRAM_NAME =
  "Искусственный интеллект: разработка и обучение интеллектуальных систем";
export const DEFAULT_TITLE = SITE_NAME;
export const DEFAULT_DESCRIPTION =
  `Бакалавриат «${PROGRAM_NAME}» — совместная программа РУДН и X5 Tech: реальные данные, проекты с инженерами X5 и трудоустройство в индустрии.`;

/** Статичная OG-картинка 1200×630 (генерируется scripts/make-og.mjs из ассетов hero). */
export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

// Next сливает metadata поверхностно: openGraph страницы ЦЕЛИКОМ заменяет корневой, а не
// дополняет его. Поэтому og-блок страницы всегда собираем через этот хелпер — иначе тихо
// теряются og:type, og:locale и og:site_name.
type Og = NonNullable<Metadata["openGraph"]>;
export const og = <T extends Og>(o: T) => ({
  type: "website",
  locale: "ru_RU",
  siteName: SITE_NAME,
  images: [OG_IMAGE],
  ...o,
});

/** Хлебные крошки в Schema.org — те же, что видит пользователь. */
export const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: abs(t.path),
  })),
});
