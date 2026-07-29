// Страница отдельной новости (Task 4.3). SSG под output:'export': generateStaticParams отдаёт
// все слаги, dynamicParams=false → неизвестный слаг отдаётся статической 404. params в Next 16 —
// Promise (await обязателен). generateMetadata кладёт title/description/OG из самой новости.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import OtherNews from "@/components/OtherNews";
import { asset } from "@/lib/asset";
import { getNews, otherNews, formatNewsDate, coverPath, parseBody, coverWidths } from "@/lib/news";
import { abs, breadcrumbs, og, OG_IMAGE, SITE_NAME } from "@/lib/seo";
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
  const url = abs(`/news/${item.slug}/`);
  // Обложка новости как OG-картинка: у карточек 1400w соотношение отличается от 1.91:1, но
  // соцсети кадрируют сами, а конкретное фото информативнее общей заглушки сайта.
  const cover = { url: coverPath(item.cover, 1400), alt: item.title };
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: url },
    openGraph: og({
      url,
      title: item.title,
      description: item.excerpt,
      type: "article",
      publishedTime: item.date,
      images: [cover, OG_IMAGE],
    }),
    twitter: { card: "summary_large_image", title: item.title, description: item.excerpt, images: [cover.url] },
  };
}

export default async function NewsArticle({ params }: Props) {
  const { slug } = await params;
  const all = getAllNews();
  const item = getNews(all, slug);
  if (!item) notFound();

  const others = otherNews(all, slug, 6); // карусель: в макете видно 4, остальные листаются
  const blocks = parseBody(item.body);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: item.title,
        description: item.excerpt,
        image: [abs(coverPath(item.cover, 1400))],
        datePublished: item.date,
        dateModified: item.date,
        inLanguage: "ru-RU",
        articleSection: item.category,
        mainEntityOfPage: { "@type": "WebPage", "@id": abs(`/news/${item.slug}/`) },
        author: { "@type": "Organization", name: SITE_NAME, url: abs("/") },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: abs("/"),
          logo: { "@type": "ImageObject", url: abs("/img/01-hero/logo-rudn-2x.webp") },
        },
      },
      breadcrumbs([
        { name: "Главная", path: "/" },
        { name: "Новости", path: "/news/" },
        { name: item.title, path: `/news/${item.slug}/` },
      ]),
    ],
  };

  return (
    <main className="bg-white">
      <JsonLd data={schema} />
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
            {/* srcset: на десктопе обложка занимает 1120 px, то есть на экране двойной
                плотности нужен файл 2240. sizes намеренно назван по МАКСИМАЛЬНОЙ ширине
                места: секции масштабируются свойством zoom, и точный расчёт вводил бы
                браузер в заблуждение — а ошибка в меньшую сторону даёт мыло. */}
            <img
              src={asset(coverPath(item.cover, 1400))}
              srcSet={coverWidths(item.cover).map((w) => `${asset(coverPath(item.cover, w))} ${w}w`).join(", ")}
              sizes="(min-width: 768px) 1120px, 100vw"
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

          {/* Ширина текстовой колонки — по макету (855 на десктопе), на мобиле во всю канву.
              Между абзацами могут стоять картинки — см. parseBody в lib/news.ts. */}
          <div className="mt-[23px] max-w-[860px] md:mt-[24px]">
            {blocks.map((block, i) =>
              block.kind === "p" ? (
                <p
                  key={i}
                  className="mt-[21px] whitespace-pre-line text-[12px] leading-[17px] text-ink first:mt-0 md:text-[14px]"
                >
                  {block.text}
                </p>
              ) : (
                <figure key={i} className="mt-[26px] flex gap-[10px] first:mt-0 md:mt-[30px] md:gap-[20px]">
                  {block.images.map((img, j) => (
                    <img
                      key={j}
                      src={asset(coverPath(img.src, 1400))}
                      srcSet={coverWidths(img.src).map((w) => `${asset(coverPath(img.src, w))} ${w}w`).join(", ")}
                      // Одиночная картинка занимает те же 860 px, что колонка текста; в паре —
                      // половину за вычетом зазора. На ретине это 1720 и 840 соответственно
                      sizes={
                        block.images.length === 1
                          ? "(min-width: 768px) 860px, 100vw"
                          : "(min-width: 768px) 420px, 50vw"
                      }
                      alt={img.alt}
                      loading="lazy"
                      decoding="async"
                      className={`min-w-0 flex-1 rounded-[15px] object-cover ${
                        // Одна картинка повторяет пропорции обложки, пара — стандартные 3:2,
                        // чтобы ряд был ровным. Кроп через object-cover, как у обложки.
                        block.images.length === 1 ? "aspect-[290/200] md:aspect-[860/460]" : "aspect-[3/2]"
                      }`}
                    />
                  ))}
                </figure>
              )
            )}
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
