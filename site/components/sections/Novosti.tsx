// «Новости и программы» — секция 271:2191 (полноширинная 1200×545). Карусель карточек новостей
// (тег «события», фото, заголовок, описание, дата) + стрелки < > + «Все новости →» + точки-пагинация.
// Контент в content/news.json (редактируется/пополняется через админку — Фаза 4). Client — скролл-снап.
"use client";
import { useCallback, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import news from "@/content/news.json";

type Item = { tag: string; image: string; title: string; excerpt: string; date: string };
const { title, allLabel, items } = news as { title: string; allLabel: string; items: Item[] };

const DOTS = 5;
const backIcon = asset("/img/11-novosti/svg-e2782076.svg");
const fwdIcon = asset("/img/11-novosti/svg1-c1b79cac.svg");

function NewsCard({ item }: { item: Item }) {
  return (
    <article className="w-[290px] shrink-0 overflow-hidden rounded-[15px] bg-paper lg:w-[270px]">
      <div className="relative aspect-[270/165] overflow-hidden">
        <img
          src={asset(`/img/11-novosti/${item.image}-640w.webp`)}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <span className="absolute left-[12px] top-[12px] inline-flex h-[25px] items-center rounded-full bg-white px-[17px] font-mono text-[12px] uppercase text-ink">
          {item.tag}
        </span>
      </div>
      <div className="px-[14px] pb-[24px] pt-[16px]">
        <h3 className="text-[16px] font-bold leading-[18px] tracking-[-0.175px] text-ink">{item.title}</h3>
        <p className="mt-[10px] text-[12px] leading-[normal] text-[rgba(39,39,39,0.85)]">{item.excerpt}</p>
        <p className="mt-[16px] text-[12px] leading-[normal] text-[rgba(39,39,39,0.85)]">{item.date}</p>
      </div>
    </article>
  );
}

function ArrowBtn({ icon, onClick, label }: { icon: string; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-[44px] items-center justify-center rounded-full border border-[#f3f3f3] bg-white transition-colors hover:bg-paper"
    >
      <img src={icon} alt="" aria-hidden className="size-[20px]" />
    </button>
  );
}

export default function Novosti() {
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

  const AllLink = (
    <a href="#novosti" className="whitespace-nowrap text-[14px] font-bold leading-[21px] text-ink">
      {allLabel} →
    </a>
  );
  const Controls = (
    <>
      <ArrowBtn icon={backIcon} onClick={() => scrollByCard(-1)} label="Предыдущие новости" />
      <ArrowBtn icon={fwdIcon} onClick={() => scrollByCard(1)} label="Следующие новости" />
    </>
  );

  return (
    <section id="novosti" aria-label={title} className="mt-[60px] bg-white">
      <div className="mx-auto max-w-[1200px]">
        {/* ===== Десктоп: шапка ===== */}
        <div className="hidden items-center justify-between pl-[40px] pr-[35px] pt-[55px] lg:flex">
          <h2 className="text-[40px] font-bold leading-[43.2px] tracking-[-0.88px] text-ink">{title}</h2>
          <div className="flex items-center gap-[15px]">
            {Controls}
            <div className="ml-[8px]">{AllLink}</div>
          </div>
        </div>

        {/* ===== Мобильная: шапка ===== */}
        <div className="px-[15px] pt-[30px] lg:hidden">
          <h2 className="text-center text-[22px] font-bold leading-[26px] text-ink">{title}</h2>
          <div className="mt-[18px] flex items-center justify-between">
            <ArrowBtn icon={backIcon} onClick={() => scrollByCard(-1)} label="Предыдущие новости" />
            {AllLink}
            <ArrowBtn icon={fwdIcon} onClick={() => scrollByCard(1)} label="Следующие новости" />
          </div>
        </div>

        {/* ===== Дорожка карточек ===== */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="mt-[26px] flex gap-[15px] overflow-x-auto scroll-smooth pb-[6px] pl-[15px] pr-[15px] [scrollbar-width:none] lg:mt-[29px] lg:w-[calc(100%-35px)] lg:pl-[40px] lg:pr-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, i) => (
            <NewsCard key={i} item={item} />
          ))}
        </div>

        {/* ===== Точки ===== */}
        <div className="mt-[24px] flex items-center justify-center gap-[12px] pb-[10px] lg:mt-[33px] lg:pb-[68px]">
          {Array.from({ length: DOTS }).map((_, i) => (
            <span
              key={i}
              className={
                i === active
                  ? "size-[12px] rounded-full bg-lime"
                  : "size-[10px] rounded-full bg-ink"
              }
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}
