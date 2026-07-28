// Футер по макету ctx-13 (узел 271:2273, 1200×431, фон #272727, верхний бордер белый 4%).
// ≥1024 — точная абсолютная раскладка макета; ниже — flow-стопка по мобильному эталону.
// Контент целиком из content/site.json. Опечатка макета «Противодействи» исправлена (D4).
import Link from "next/link";
import site from "@/content/site.json";
import { asset } from "@/lib/asset";

const f = site.footer;

// Внутренние ссылки — next/link (применяет basePath при деплое в подпапку, Task 0.1).
// Внешние (http) и tel/mailto — обычный <a>; http открываем в новой вкладке. И там и там
// это <a> с теми же классами/стилями, поэтому раскладка футера не меняется (d-13/m-13).
function FLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (/^https?:|^tel:|^mailto:/.test(href)) {
    const blank = href.startsWith("http");
    return (
      <a href={href} className={className} style={style} {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
        {blank && <span className="sr-only"> (откроется в новой вкладке)</span>}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

function FooterLogos() {
  // Лого — чёткие 2x-рендеры узлов макета (271:2310/2311), не деформированные исходники
  return (
    <span className="flex items-center">
      <img
        loading="lazy"
        src={asset("/img/13-footer/logo-rudn-2x.webp")}
        alt="РУДН"
        className="h-[27px] w-[79px]"
      />
      {/* Отступы как в шапке (ml-15/mr-7): там локап принят, а в футере они были зеркально
          переставлены (ml-7/mr-15), из-за чего крестик прижимался к РУДН («× уехал»).
          Значения подобраны под видимые границы логотипов, а не под рамки картинок */}
      <img
        loading="lazy"
        src={asset("/img/13-footer/asset-463eeb0a.svg")}
        alt=""
        aria-hidden
        className="ml-[15px] mr-[7px] h-[10px] w-[10px]"
      />
      <img
        loading="lazy"
        src={asset("/img/13-footer/logo-x5-2x.webp")}
        alt="X5 Tech"
        className="h-[23px] w-[76px]"
      />
    </span>
  );
}

const h = "text-[12px] font-bold uppercase text-white/75";
const link = "text-[12px] text-white hover:text-lime transition-colors";

export default function Footer() {
  return (
    <footer className="bg-ink text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* ===== Десктоп ≥1024: координаты из ctx-13 дословно (центры + translate) ===== */}
      <div className="calque-1200 relative mx-auto hidden h-[431px] max-w-[1200px] md:block">
        <div className="absolute left-[40px] top-[54px]">
          <FooterLogos />
        </div>
        <p className="absolute left-[40px] top-[116px] w-[247px] -translate-y-1/2 whitespace-pre-line text-[12px] leading-[normal] text-white">
          {f.description}
        </p>
        <p className="absolute left-[40px] top-[210px] w-[227px] -translate-y-1/2 whitespace-pre-line text-[12px] leading-[normal] text-white/90">
          {f.address}
        </p>

        <p className={`absolute left-[348.66px] top-[60px] -translate-y-1/2 ${h}`}>Навигация</p>
        <nav aria-label="Навигация по сайту">
          {f.nav.map((item, i) => (
            <FLink
              key={item.href}
              href={`/${item.href}`}
              className={`absolute left-[348.66px] leading-[normal] ${link}`}
              style={{ top: 90.5 + i * 29 }}
            >
              {item.label}
            </FLink>
          ))}
        </nav>

        <p className={`absolute left-[583.33px] top-[60px] -translate-y-1/2 ${h}`}>Приёмная комиссия</p>
        {f.contacts.map((c, i) => (
          <span key={c.value} className="absolute left-[583.33px]" style={{ top: 86.5 + i * 58.5 }}>
            <a
              href={c.href}
              className="absolute top-[12px] block -translate-y-1/2 whitespace-nowrap font-medium leading-[normal] text-white transition-colors hover:text-lime"
              style={{ fontSize: c.size }}
            >
              {c.value}
            </a>
            <span className="absolute top-[35.5px] block w-[200px] -translate-y-1/2 whitespace-nowrap text-[12px] leading-[normal] text-[#d8d8d8]">
              {c.note}
            </span>
          </span>
        ))}

        <p className={`absolute left-[861.66px] top-[60px] -translate-y-1/2 ${h}`}>Документы и правовая информация</p>
        {f.docs.map((d, i) => (
          <FLink
            key={d.label}
            href={d.href}
            className={`absolute left-[862px] -translate-y-1/2 leading-[normal] ${link}`}
            style={{ top: [97, 124, 153, 181, 208, 237][i] }}
          >
            {d.label} <span aria-hidden className="text-[15px] leading-none">↗</span>
          </FLink>
        ))}

        <p className={`absolute left-[862px] top-[279px] -translate-y-1/2 ${h}`}>X5 Tech в социальных сетях</p>
        {f.social.map((s, i) => (
          <FLink
            key={s.label}
            href={s.href}
            className={`absolute left-[862px] leading-[normal] ${link}`}
            style={{ top: 306 + i * 29 }}
          >
            {s.label} <span aria-hidden className="text-[15px] leading-none">↗</span>
          </FLink>
        ))}

        <p className="absolute left-[40px] top-[calc(50%+121.5px)] -translate-y-1/2 text-[12px] leading-[normal] text-white">
          {f.copyright}
        </p>
        {f.legal.map((l, i) => (
          <FLink
            key={l.label}
            href={l.href}
            className="absolute top-[calc(50%+156px)] -translate-y-1/2 text-[12px] leading-[normal] text-mist transition-colors hover:text-lime"
            style={{ left: [40, 264.23, 461.39][i] }}
          >
            {l.label}
          </FLink>
        ))}
      </div>

      {/* ===== Мобильная стопка: точные интервалы из mobile-abs.json (футер 17232–18535) ===== */}
      <div className="canvas-320 px-[15px] pb-[170px] pt-[33px] md:hidden">
        <FooterLogos />
        <p className="mt-[20px] w-[247px] whitespace-pre-line text-[12px] leading-[14px]">{f.description}</p>

        <p className={`mt-[35px] ${h}`}>Навигация</p>
        <nav aria-label="Навигация по сайту" className="mt-[15px] flex flex-col gap-[12px]">
          {f.nav.map((item) => (
            <FLink key={item.href} href={`/${item.href}`} className={`leading-[17px] ${link}`}>
              {item.label}
            </FLink>
          ))}
        </nav>

        <p className={`mt-[30px] ${h}`}>Приёмная комиссия</p>
        <div className="mt-[11px]">
          {f.contacts.map((c) => (
            <span key={c.value} className="mt-[14px] block">
              <a href={c.href} className="block font-medium leading-[18px] text-white" style={{ fontSize: c.size }}>
                {c.value}
              </a>
              <span className="mt-[7px] block text-[12px] leading-[14px] text-[#d8d8d8]">{c.note}</span>
            </span>
          ))}
        </div>

        <p className={`mt-[30px] ${h}`}>Документы и правовая информация</p>
        <div className="mt-[12px] flex flex-col gap-[12px]">
          {f.docs.map((d) => (
            <FLink key={d.label} href={d.href} className={`leading-[15px] ${link}`}>
              {d.label} <span aria-hidden className="text-[15px] leading-none">↗</span>
            </FLink>
          ))}
        </div>

        <p className={`mt-[31px] ${h}`}>X5 Tech в социальных сетях</p>
        <div className="mt-[16px] flex flex-col gap-[12px]">
          {f.social.map((s) => (
            <FLink key={s.label} href={s.href} className={`leading-[17px] ${link}`}>
              {s.label} <span aria-hidden className="text-[15px] leading-none">↗</span>
            </FLink>
          ))}
        </div>

        <p className="mt-[30px] w-[227px] whitespace-pre-line text-[12px] leading-[14px] text-white/90">{f.address}</p>

        <div className="mt-[30px] flex flex-col gap-[10px]">
          {f.legal.map((l) => (
            <FLink key={l.label} href={l.href} className="text-[12px] leading-[19px] text-mist">
              {l.label}
            </FLink>
          ))}
        </div>
        <p className="mt-[30px] text-[12px] leading-[14px]">{f.copyright}</p>
      </div>
      </footer>
  );
}
