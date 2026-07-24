// Список всех новостей (Task 4.2). Server Component: сетка карточек, сортировка по дате из
// lib/news. Обложки первого ряда — priority (над фолдом), остальные — lazy. Пагинации нет:
// правило плана — /news/page/N только при > 12 новостей (сейчас их меньше). Дизайна в Figma
// для этой страницы нет — верстаем в визуальном языке сайта (токены, шапка/футер из layout).
import type { Metadata } from "next";
import Link from "next/link";
import NewsCard from "@/components/NewsCard";
import { withBasePath } from "@/lib/asset";
import { getAllNews, newsMeta } from "@/lib/server/news-store";

const TITLE = `${newsMeta.title} — Факультет ИИ РУДН × X5 Tech`;
const DESCRIPTION =
  "Новости, события и программы факультета искусственного интеллекта РУДН и X5 Tech: дни открытых дверей, анонсы и материалы для абитуриентов.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: withBasePath("/news/") },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "ru_RU" },
};

export default function NewsIndex() {
  const items = getAllNews();

  return (
    <main className="bg-white">
      <div className="container-site pb-[80px] pt-[28px] md:pt-[48px]">
        <nav aria-label="Хлебные крошки" className="text-[13px] text-[rgba(39,39,39,0.72)]">
          <Link href="/" className="transition-colors duration-200 ease-motion hover:text-ink">
            Главная
          </Link>
          <span className="mx-[8px]" aria-hidden>
            /
          </span>
          <span className="text-ink">Новости</span>
        </nav>

        <h1 className="mt-[16px] text-[28px] font-bold leading-[1.1] tracking-[-0.5px] text-ink md:mt-[20px] md:text-[42px] md:tracking-[-0.88px]">
          {newsMeta.title}
        </h1>
        <p className="mt-[12px] max-w-[640px] text-[14px] leading-[20px] text-[rgba(39,39,39,0.85)] md:text-[16px]">
          {DESCRIPTION}
        </p>

        {items.length > 0 ? (
          <div className="mt-[28px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-3 md:mt-[40px]">
            {items.map((item, i) => (
              <NewsCard key={item.slug} item={item} priority={i < 3} headingLevel={2} />
            ))}
          </div>
        ) : (
          <p className="mt-[40px] text-[14px] text-[rgba(39,39,39,0.72)]">Пока нет опубликованных новостей.</p>
        )}
      </div>
    </main>
  );
}
