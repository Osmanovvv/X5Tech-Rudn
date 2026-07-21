"use client";

// Шапка-капсула по макету: десктоп — ctx-01 (узлы 271:1786–1797, капсула 1120×69),
// мобильная — meta-mobile (271:2320–2804, капсула 290×45, бургер 21×16).
// Открытое состояние бургера в макете не нарисовано — см. docs/deviations.md D3.
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

const NAV = [
  { href: "#programma", label: "Программа" },
  { href: "#prepodavateli", label: "Преподаватели" },
  { href: "#postuplenie", label: "Поступление" },
  { href: "#novosti", label: "Новости" },
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
          <a href="#" aria-label="Наверх" className="max-lg:hidden">
            <Logos />
          </a>
          <a href="#" aria-label="Наверх" className="lg:hidden">
            <Logos compact />
          </a>

          {/* Десктопное меню: позиции из макета (первый пункт на 378px секции, шаги 46/46/52) */}
          <nav className="ml-[121px] flex shrink items-center gap-x-[46px] text-[13px] max-lg:hidden">
            {NAV.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap text-ink hover:opacity-70 ${i === 3 ? "ml-[6px]" : ""}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="#forma"
            className="ml-auto flex h-[45px] w-[150px] items-center rounded-full bg-lime pl-[26px] text-[13px] font-bold text-ink hover:brightness-95 max-lg:hidden"
          >
            Подать заявку
          </a>

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
          className="fixed inset-0 z-[60] flex flex-col bg-white p-[20px] lg:hidden"
        >
          <div className="flex h-[45px] items-center">
            <Logos compact />
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
              className="-mr-[8px] ml-auto flex h-[44px] w-[44px] items-center justify-center text-[28px] leading-none text-ink"
            >
              ×
            </button>
          </div>
          <nav className="mt-[32px] flex flex-col">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-hairline py-[18px] text-[24px] font-medium text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <a
            href="#forma"
            onClick={() => setOpen(false)}
            className="mt-auto flex h-[56px] items-center justify-center rounded-[5px] bg-lime-deep text-[14px] font-bold text-white"
          >
            Подать заявку
          </a>
        </div>
      )}
    </header>
  );
}
