"use client";

// Блок «Другие новости» на странице новости — карусель по макету 391:57 (десктоп) и 391:1690
// (мобильная). Отдельный островок: он грузится только на /news/<slug>, бюджет главной не растёт.
// Карточки и стрелки — те же, что в карусели лендинга, чтобы блоки выглядели одинаково.
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { coverPath, formatNewsDate, type NewsItem } from "@/lib/news";

const backIcon = asset("/img/11-novosti/svg-e2782076.svg");
const fwdIcon = asset("/img/11-novosti/svg1-c1b79cac.svg");
const DOTS = 5;

function Card({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}/`}
      className="block w-[290px] shrink-0 snap-start overflow-hidden rounded-[15px] bg-paper md:w-[270px]"
    >
      <div className="relative aspect-[290/165] overflow-hidden md:aspect-[270/165]">
        <img
          src={asset(coverPath(item.cover, 640))}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <span className="absolute left-[12px] top-[12px] inline-flex h-[25px] items-center rounded-full bg-white px-[17px] font-mono text-[12px] uppercase text-ink">
          {item.category}
        </span>
      </div>
      <div className="px-[14px] pb-[24px] pt-[16px]">
        <h3 className="text-[16px] font-bold leading-[18px] tracking-[-0.175px] text-ink">{item.title}</h3>
        <p className="mt-[10px] text-[12px] leading-[normal] text-[rgba(39,39,39,0.85)]">{item.excerpt}</p>
        <p className="mt-[16px] text-[12px] leading-[normal] text-[rgba(39,39,39,0.85)]">
          {formatNewsDate(item.date)}
        </p>
      </div>
    </Link>
  );
}

function ArrowBtn({ icon, onClick, label }: { icon: string; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-[44px] shrink-0 items-center justify-center rounded-full border border-[#f3f3f3] bg-white transition-[background-color,scale] duration-200 ease-motion hover:bg-paper active:scale-95"
    >
      <img src={icon} alt="" aria-hidden className="size-[20px]" />
    </button>
  );
}

export default function OtherNews({ items }: { items: NewsItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollByCard = useCallback((dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth < 400 ? el.clientWidth : 285), behavior: "smooth" });
  }, []);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const frac = max > 0 ? el.scrollLeft / max : 0;
    setActive(Math.round(frac * (DOTS - 1)));
  }, []);

  if (items.length === 0) return null;

  const allLink = (
    <Link
      href="/news/"
      className="whitespace-nowrap text-[14px] font-bold leading-[21px] text-ink transition-opacity duration-200 ease-motion hover:opacity-70"
    >
      Все новости →
    </Link>
  );

  return (
    <section aria-label="Другие новости" className="mt-[68px] md:mt-[82px]">
      {/* ===== Десктоп: заголовок слева, стрелки и «Все новости» справа ===== */}
      <div className="hidden items-end justify-between md:flex">
        <h2 className="text-[40px] font-bold leading-[43.2px] tracking-[-0.88px] text-ink">Другие новости</h2>
        <div className="flex items-center gap-[15px] pb-[6px]">
          <ArrowBtn icon={backIcon} onClick={() => scrollByCard(-1)} label="Предыдущие новости" />
          <ArrowBtn icon={fwdIcon} onClick={() => scrollByCard(1)} label="Следующие новости" />
          <div className="ml-[8px]">{allLink}</div>
        </div>
      </div>

      {/* ===== Мобильная: заголовок, ниже стрелки вокруг «Все новости» ===== */}
      <div className="md:hidden">
        <h2 className="text-[22px] font-bold leading-[26px] tracking-[-0.5px] text-ink">Другие новости</h2>
        <div className="mt-[18px] flex items-center justify-between">
          <ArrowBtn icon={backIcon} onClick={() => scrollByCard(-1)} label="Предыдущие новости" />
          {allLink}
          <ArrowBtn icon={fwdIcon} onClick={() => scrollByCard(1)} label="Следующие новости" />
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="mt-[24px] flex snap-x snap-mandatory gap-[15px] overflow-x-auto scroll-smooth pb-[6px] [scrollbar-width:none] md:mt-[63px] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <Card key={item.slug} item={item} />
        ))}
      </div>

      <div className="mt-[34px] flex items-center justify-center gap-[12px] md:mt-[31px]">
        {Array.from({ length: DOTS }).map((_, i) => (
          <span
            key={i}
            className={i === active ? "size-[12px] rounded-full bg-lime" : "size-[10px] rounded-full bg-ink"}
            aria-hidden
          />
        ))}
      </div>
    </section>
  );
}
