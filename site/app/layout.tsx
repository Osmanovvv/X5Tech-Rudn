import type { Metadata } from "next";
import site from "@/content/site.json";
import { fontSans, fontMono } from "./fonts";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  IS_PLACEHOLDER_DOMAIN,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import "./globals.css";

// Корневой layout: только документ, шрифты и глобальные стили. Шапка/футер и motion-обвязка
// живут в components/SiteChrome (подключается в app/(site)/layout.tsx и на странице 404),
// чтобы админка /admin рендерилась без маркетингового окружения — см. Task B2.

// SEO-обвязка (Task 5.1). metadataBase делает canonical и OG абсолютными; шаблон заголовка
// добавляет к подстраницам общий хвост. Домен и код Вебмастера — из content/site.json.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s — ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "РУДН" }, { name: "X5 Tech" }],
  keywords: [
    "искусственный интеллект",
    "бакалавриат ИИ",
    "РУДН",
    "X5 Tech",
    "машинное обучение",
    "поступление 2026",
    "факультет искусственного интеллекта",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, images: [OG_IMAGE.url] },
  // Пока домен — плейсхолдер, отдавать сайт роботам нельзя: canonical вёл бы в никуда (см. robots.ts)
  robots: IS_PLACEHOLDER_DOMAIN
    ? { index: false, follow: false }
    : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  verification: site.yandexVerification ? { yandex: site.yandexVerification } : undefined,
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
      // Инлайн-скрипт REVEAL_BOOT (в SiteChrome) добавляет класс .reveal-ready на <html> до
      // гидрации — сервер об этом классе не знает, поэтому подавляем ожидаемое несовпадение.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
