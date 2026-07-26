// Страница отдельной новости (Task 4.3). SSG под output:'export': generateStaticParams отдаёт
// все слаги, dynamicParams=false → неизвестный слаг отдаётся статической 404. params в Next 16 —
// Promise (await обязателен). generateMetadata кладёт title/description/OG из самой новости.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OtherNews from "@/components/OtherNews";
import { asset, withBasePath } from "@/lib/asset";
import { getNews, otherNews, formatNewsDate, coverPath } from "@/lib/news";
import { getAllNews } from "@/lib/server/news-store";

// dynamicParams НЕ объявляем намеренно. Дефолт (true) позволяет Node-режиму отрисовать
// новость, добавленную админкой уже после сборки, — иначе свежая новость отдаёт 404 (поймано
// e2e). Явное «true» при этом писать нельзя: с output:'export' оно роняет сборку, а вычисляемое
// значение Next не принимает (конфиг сегмента должен быть литералом). Статическому экспорту
// дефолт не мешает: он просто выгружает пути из generateStaticParams.
// Несуществующая новость в обоих режимах даёт 404 — её отсекает notFound() ниже.

export function generateStaticParams() {
  return getAllNews().map((item) => ({ slug: item.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getNews(getAllNews(), slug);
  if (!item) return {};
  const title = `${item.title} — Новости РУДН × X5 Tech`;
  return {
    title,
    description: item.excerpt,
    alternates: { canonical: withBasePath(`/news/${item.slug}/`) },
    openGraph: {
      title: item.title,
      description: item.excerpt,
      type: "article",
      locale: "ru_RU",
      publishedTime: item.date,
    },
  };
}

export default async function NewsArticle({ params }: Props) {
  const { slug } = await params;
  const all = getAllNews();
  const item = getNews(all, slug);
  if (!item) notFound();

  const others = otherNews(all, slug, 6); // карусель: в макете видно 4, остальные листаются
  // Абзацы разделяются пустой строкой. Регулярка терпима к CRLF и лишним пробелам —
  // текст может прийти как из репозитория, так и из формы админки.
  const paragraphs = item.body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className="bg-white">
      {/* Раскладка по макету 391:57 (десктоп 1200) и 391:1690 (мобильная 320):
          крошки → фото во всю ширину с тегом поверх → заголовок → текст → дата → «Другие новости».
          Канва как у секций лендинга: 320 масштабируется зумом, 1200 — калька 1:1. */}
      <div className="canvas-320 calque-fluid mx-auto max-w-[1200px] px-[15px] pb-[40px] pt-[19px] md:px-[40px] md:pb-[60px] md:pt-[19px]">
        <article>
          {/* Крошки — строго в одну строку, как в макете: длинный заголовок новости обрезается
              многоточием, иначе на узкой канве строка ломается и всё ниже съезжает. */}
          <nav
            aria-label="Хлебные крошки"
            className="flex items-center whitespace-nowrap text-[12px] leading-[normal] text-[rgba(39,39,39,0.72)] md:text-[13px]"
          >
            <Link href="/" className="shrink-0 transition-colors duration-200 ease-motion hover:text-ink">
              Главная
            </Link>
            <span className="mx-[6px] shrink-0" aria-hidden>
              -
            </span>
            <span className="truncate text-ink">{item.title}</span>
          </nav>

          {/* Фото во всю ширину контейнера; тег категории — поверх картинки слева сверху */}
          <div className="relative mt-[20px] overflow-hidden rounded-[15px] md:mt-[19px]">
            <img
              src={asset(coverPath(item.cover, 1400))}
              alt=""
              className="aspect-[290/200] w-full object-cover md:aspect-[1120/600]"
            />
            <span className="absolute left-[15px] top-[15px] inline-flex h-[25px] items-center rounded-full bg-white px-[17px] font-mono text-[12px] uppercase text-ink md:left-[20px] md:top-[20px]">
              {item.category}
            </span>
          </div>

          <h1 className="mt-[20px] text-[22px] font-bold leading-[27px] tracking-[-0.5px] text-ink md:mt-[33px] md:text-[42px] md:leading-[45px] md:tracking-[-1px]">
            {item.title}
          </h1>

          {/* Ширина текстовой колонки — по макету (855 на десктопе), на мобиле во всю канву */}
          <div className="mt-[23px] max-w-[860px] md:mt-[24px]">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="mt-[21px] whitespace-pre-line text-[12px] leading-[17px] text-ink first:mt-0 md:text-[14px]"
              >
                {p}
              </p>
            ))}
          </div>

          <time
            dateTime={item.date}
            className="mt-[30px] block text-[12px] leading-[normal] text-ink md:text-[13px]"
          >
            {formatNewsDate(item.date)}
          </time>
        </article>

        <OtherNews items={others} />
      </div>
    </main>
  );
}
