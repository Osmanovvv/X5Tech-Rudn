import type { Metadata } from "next";
import { fontSans, fontMono } from "./fonts";
import "./globals.css";

// Корневой layout: только документ, шрифты и глобальные стили. Шапка/футер и motion-обвязка
// живут в components/SiteChrome (подключается в app/(site)/layout.tsx и на странице 404),
// чтобы админка /admin рендерилась без маркетингового окружения — см. Task B2.

// Базовые метаданные; полная SEO-обвязка (metadataBase, OG, канониклы) — Task 5.1
export const metadata: Metadata = {
  title: "Факультет искусственного интеллекта РУДН × X5 Tech",
  description:
    "Бакалавриат «Искусственный интеллект: разработка и обучение интеллектуальных систем» — совместная программа РУДН и X5 Tech.",
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
