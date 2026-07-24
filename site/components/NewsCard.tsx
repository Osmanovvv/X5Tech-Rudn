// Карточка новости для сетки /news и блока «Другие новости» (Task 4.2/4.3). Server Component,
// оборачивается в next/link → страница /news/<slug>/. Обложки ниже фолда — loading="lazy"
// (первые в сетке передают priority, чтобы не лениться над фолдом). Стиль — как карточка в
// карусели на главной, но кликабельная и резиновая (grid-элемент, а не фикс-ширина карусели).
import Link from "next/link";
import { asset } from "@/lib/asset";
import { formatNewsDate, type NewsItem } from "@/lib/news";

export default function NewsCard({ item, priority }: { item: NewsItem; priority?: boolean }) {
  return (
    <Link
      href={`/news/${item.slug}/`}
      className="group block overflow-hidden rounded-[15px] bg-paper transition-[box-shadow,transform] duration-200 ease-motion hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(39,39,39,0.10)]"
    >
      <div className="relative aspect-[270/165] overflow-hidden">
        <img
          src={asset(`/img/11-novosti/${item.cover}-640w.webp`)}
          alt=""
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 size-full object-cover transition-transform duration-300 ease-motion group-hover:scale-[1.03]"
        />
        <span className="absolute left-[12px] top-[12px] inline-flex h-[25px] items-center rounded-full bg-white px-[17px] font-mono text-[12px] uppercase text-ink">
          {item.category}
        </span>
      </div>
      <div className="px-[16px] pb-[24px] pt-[16px]">
        <h3 className="text-[16px] font-bold leading-[20px] tracking-[-0.175px] text-ink">{item.title}</h3>
        <p className="mt-[10px] line-clamp-2 text-[13px] leading-[18px] text-[rgba(39,39,39,0.85)]">
          {item.excerpt}
        </p>
        <p className="mt-[16px] text-[12px] leading-[normal] text-[rgba(39,39,39,0.6)]">
          {formatNewsDate(item.date)}
        </p>
      </div>
    </Link>
  );
}
