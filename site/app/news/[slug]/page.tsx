// Страница отдельной новости (Task 4.3). SSG под output:'export': generateStaticParams отдаёт
// все слаги, dynamicParams=false → неизвестный слаг отдаётся статической 404. params в Next 16 —
// Promise (await обязателен). generateMetadata кладёт title/description/OG из самой новости.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsCard from "@/components/NewsCard";
import { asset, withBasePath } from "@/lib/asset";
import { allNews, getNews, otherNews, formatNewsDate } from "@/lib/news";

// Неизвестные слаги не рендерятся on-demand (в статике этого и нет) → 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return allNews().map((item) => ({ slug: item.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getNews(slug);
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
  const item = getNews(slug);
  if (!item) notFound();

  const others = otherNews(slug, 3);
  const paragraphs = item.body.split("\n\n").filter(Boolean);

  return (
    <main className="bg-white">
      <article className="container-site pt-[28px] md:pt-[48px]">
        <div className="mx-auto max-w-[760px]">
          <nav aria-label="Хлебные крошки" className="text-[13px] text-[rgba(39,39,39,0.72)]">
            <Link href="/" className="transition-colors duration-200 ease-motion hover:text-ink">
              Главная
            </Link>
            <span className="mx-[8px]" aria-hidden>
              /
            </span>
            <Link href="/news/" className="transition-colors duration-200 ease-motion hover:text-ink">
              Новости
            </Link>
          </nav>

          <div className="mt-[20px] flex items-center gap-[12px]">
            <span className="inline-flex h-[25px] items-center rounded-full border border-lime px-[16px] font-mono text-[12px] uppercase text-ink">
              {item.category}
            </span>
            <time dateTime={item.date} className="text-[13px] text-[rgba(39,39,39,0.72)]">
              {formatNewsDate(item.date)}
            </time>
          </div>

          <h1 className="mt-[16px] text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-ink md:text-[38px] md:tracking-[-0.7px]">
            {item.title}
          </h1>

          <div className="mt-[24px] overflow-hidden rounded-[15px]">
            <img
              src={asset(`/img/11-novosti/${item.cover}-1400w.webp`)}
              alt=""
              className="aspect-[270/165] w-full object-cover"
            />
          </div>

          <div className="mt-[28px] pb-[8px]">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="mt-[16px] whitespace-pre-line text-[16px] leading-[26px] text-ink first:mt-0 md:text-[17px] md:leading-[28px]"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section aria-label="Другие новости" className="container-site pb-[80px] pt-[40px] md:pt-[56px]">
          <div className="mx-auto max-w-[1120px]">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[22px] font-bold leading-[1.2] tracking-[-0.4px] text-ink md:text-[28px]">
                Другие новости
              </h2>
              <Link
                href="/news/"
                className="whitespace-nowrap text-[14px] font-bold text-ink transition-opacity duration-200 ease-motion hover:opacity-70"
              >
                Все новости →
              </Link>
            </div>
            <div className="mt-[24px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
              {others.map((n) => (
                <NewsCard key={n.slug} item={n} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
