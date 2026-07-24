import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import { fontSans, fontMono } from "./fonts";
import "./globals.css";

// Ставит .reveal-ready на <html> ДО первой отрисовки (иначе уже видимый контент моргнёт).
// Выполняется синхронно при парсинге, до <body>-контента. Страховочный таймер снимет класс
// через 2с, если остров ScrollReveal не успеет/не загрузится — контент не останется скрытым.
// Под reduced motion класс не ставим вовсе.
const REVEAL_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var r=document.documentElement;r.classList.add('reveal-ready');window.__revealTimer=setTimeout(function(){r.classList.remove('reveal-ready')},2000)}}catch(e){}`;

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
      // Инлайн-скрипт REVEAL_BOOT добавляет класс .reveal-ready на <html> до гидрации —
      // сервер об этом классе не знает, поэтому подавляем ожидаемое несовпадение атрибута.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
        <Header />
        {children}
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
