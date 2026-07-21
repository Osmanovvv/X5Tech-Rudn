import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { fontSans, fontMono } from "./fonts";
import "./globals.css";

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
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
