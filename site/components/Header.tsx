"use client";

// Шапка-капсула по макету: десктоп — ctx-01 (узлы 271:1786–1797, капсула 1120×69),
// мобильная — meta-mobile (271:2320–2804, капсула 290×45, бургер 21×16).
// Открытое меню — по макету 388:2 нового файла (панель 290×650): прежняя версия была нашей
// выдумкой (отклонение D3), теперь дизайн есть и отклонение снято.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import site from "@/content/site.json";

// Корневые пути (не голые якоря): на подстраницах /news, /docs якорь #programma указывал бы в
// пустоту. next/link + «/#…» уводит на главную к секции и корректно применяет basePath.
const NAV = [
  { href: "/#programma", label: "Программа" },
  { href: "/#prepodavateli", label: "Преподаватели" },
  { href: "/#postuplenie", label: "Поступление" },
  { href: "/#novosti", label: "Новости" },
];

function Logos({ compact }: { compact?: boolean }) {
  // Лого — чёткие 2x-рендеры узлов макета (271:1789/1790), без кропов деформированных исходников
  return (
    <span className="flex items-center">
      <img
        src={asset("/img/01-hero/logo-rudn-2x.webp")}
        alt="РУДН"
        className={compact ? "h-[22px] w-[64px]" : "h-[27px] w-[79px]"}
      />
      <img
        src={asset("/img/01-hero/asset-0671023b.svg")}
        alt=""
        aria-hidden
        className={
          compact ? "ml-[12px] mr-[6px] h-[8px] w-[8px]" : "ml-[15px] mr-[7px] h-[10px] w-[10px]"
        }
      />
      <img
        src={asset("/img/01-hero/logo-x5-2x.webp")}
        alt="X5 Tech"
        className={compact ? "h-[19px] w-[62px]" : "h-[23px] w-[76px]"}
      />
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Оверлей: блокировка скролла, Escape, focus trap, возврат фокуса на бургер
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const overlay = overlayRef.current;
    overlay?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !overlay) return;
      const focusables = overlay.querySelectorAll<HTMLElement>("a, button");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      burgerRef.current?.focus();
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-[1200px] px-[15px] pt-[15px] lg:px-10">
        <div
          className={`flex h-[45px] items-center rounded-full bg-paper pl-[20px] pr-[15px] lg:h-[69px] lg:pl-[30px] lg:pr-[30px] transition-shadow ${
            scrolled ? "shadow-[0_8px_24px_rgba(39,39,39,0.10)]" : ""
          }`}
        >
          <Link href="/" aria-label="На главную" className="max-lg:hidden">
            <Logos />
          </Link>
          <Link href="/" aria-label="На главную" className="lg:hidden">
            <Logos compact />
          </Link>

          {/* Десктопное меню: позиции из макета (первый пункт на 378px секции, шаги 46/46/52) */}
          {/* 1024–1199: отступы макета (121/46) не влезают — кнопка наезжает на «Новости».
              Сжимаем их в этом диапазоне, на >=1200 возвращаем значения макета. */}
          <nav className="ml-[40px] flex shrink items-center gap-x-[28px] text-[13px] max-lg:hidden dt:ml-[121px] dt:gap-x-[46px]">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap text-ink transition-opacity duration-200 ease-motion hover:opacity-70 ${i === 3 ? "ml-[6px]" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/#forma"
            className="ml-auto flex h-[45px] w-[150px] items-center rounded-full bg-lime pl-[26px] text-[13px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98] max-lg:hidden"
          >
            Подать заявку
          </Link>

          <button
            ref={burgerRef}
            type="button"
            aria-label="Открыть меню"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
            className="-mr-[8px] ml-auto flex h-[44px] w-[44px] items-center justify-center lg:hidden"
          >
            {/* Иконка из макета (узел «menu» 21×16): средняя линия короче — 14px, прижата влево */}
            <span className="flex w-[21px] flex-col items-start gap-[5px]">
              <span className="h-[2px] w-full rounded bg-ink" />
              <span className="h-[2px] w-[14px] rounded bg-ink" />
              <span className="h-[2px] w-full rounded bg-ink" />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          ref={overlayRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
          className="fixed inset-0 z-[60] overflow-y-auto bg-white lg:hidden"
        >
          {/* Канва 320. Панель макета — 290 в ширину (поля 15, как у капсулы шапки), внутри неё
              контент шириной 240 с отступом 25 → суммарно 40 от края экрана (388:2). */}
          <div className="canvas-320 px-[40px] pb-[33px] pt-[15px]">
            {/* Шапка панели: логотипы слева, крестик в круглой кнопке справа */}
            <div className="flex h-[45px] items-center">
              <Logos compact />
              <button
                type="button"
                aria-label="Закрыть меню"
                onClick={() => setOpen(false)}
                className="ml-auto flex size-[45px] items-center justify-center rounded-full bg-paper text-ink transition-colors duration-200 ease-motion hover:bg-mist"
              >
                {/* Косой крест из двух линий — как в макете (не текстовый символ ×) */}
                <span className="relative block size-[16px]" aria-hidden>
                  <span className="absolute left-0 top-[7px] block h-[2px] w-full rounded bg-ink [transform:rotate(45deg)]" />
                  <span className="absolute left-0 top-[7px] block h-[2px] w-full rounded bg-ink [transform:rotate(-45deg)]" />
                </span>
              </button>
            </div>

            {/* Пункты меню — выровнены по правому краю, без разделителей. Шаг 37px по макету */}
            <nav className="mt-[26px] flex flex-col items-end gap-[20px]">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-[14px] leading-[normal] text-ink transition-opacity duration-200 ease-motion hover:opacity-70"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/#forma"
              onClick={() => setOpen(false)}
              className="mt-[24px] flex h-[45px] items-center justify-center rounded-full bg-lime text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98]"
            >
              Подать заявку
            </Link>

            {/* Контакты приёмной комиссии — те же данные, что в футере (site.json) */}
            <p className="mt-[24px] text-right text-[12px] font-bold uppercase leading-[normal] text-[rgba(39,39,39,0.75)]">
              Приёмная комиссия
            </p>
            <div className="mt-[13px] flex flex-col gap-[20px]">
              {site.footer.contacts.map((c) => (
                <span key={c.value} className="block text-right">
                  <a
                    href={c.href}
                    className="block font-medium leading-[normal] text-ink transition-colors duration-200 ease-motion hover:text-lime-deep"
                    style={{ fontSize: c.size }}
                  >
                    {c.value}
                  </a>
                  <span className="mt-[6px] block text-[12px] leading-[normal] text-[rgba(39,39,39,0.75)]">
                    {c.note}
                  </span>
                </span>
              ))}
            </div>

            <p className="mt-[25px] text-right text-[12px] font-bold uppercase leading-[normal] text-[rgba(39,39,39,0.75)]">
              X5 Tech в социальных сетях
            </p>
            <div className="mt-[13px] flex flex-col items-end gap-[13px]">
              {site.footer.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] leading-[normal] text-ink transition-colors duration-200 ease-motion hover:text-lime-deep"
                >
                  {s.label} <span aria-hidden className="text-[15px] leading-none">↗</span>
                  <span className="sr-only"> (откроется в новой вкладке)</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
