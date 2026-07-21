// Футер по макету ctx-13 (узел 271:2273, 1200×431, фон #272727, верхний бордер белый 4%).
// ≥1024 — точная абсолютная раскладка макета; ниже — flow-стопка по мобильному эталону.
// Контент целиком из content/site.json. Опечатка макета «Противодействи» исправлена (D4).
import site from "@/content/site.json";
import { asset } from "@/lib/asset";

const f = site.footer;

function FooterLogos() {
  // Явные размеры контейнеров: Tailwind-префлайт ставит img { height: auto }
  return (
    <span className="flex items-center">
      <img
        src={asset("/img/13-footer/image3-70a96a39-158w.webp")}
        alt="РУДН"
        className="h-[27px] w-[79px] object-contain"
      />
      <img
        src={asset("/img/13-footer/asset-463eeb0a.svg")}
        alt=""
        aria-hidden
        className="ml-[15px] mr-[7px] h-[10px] w-[10px]"
      />
      {/* Исходник анизотропно сжат в квадрат — восстанавливаем пропорции растяжением (fill), как рендерит Figma */}
      <img
        src={asset("/img/13-footer/image4-7b8506fd-152w.webp")}
        alt="X5 Tech"
        className="h-[23px] w-[76px] max-w-none object-fill"
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
      <div className="relative mx-auto hidden h-[431px] max-w-[1200px] lg:block">
        <div className="absolute left-[40px] top-[54px]">
          <FooterLogos />
        </div>
        <p className="absolute left-[40px] top-[116px] -translate-y-1/2 whitespace-pre-line text-[12px] leading-[normal] text-white">
          {f.description}
        </p>
        <p className="absolute left-[40px] top-[210px] -translate-y-1/2 whitespace-pre-line text-[12px] leading-[normal] text-white/90">
          {f.address}
        </p>

        <p className={`absolute left-[348.66px] top-[60px] -translate-y-1/2 ${h}`}>Навигация</p>
        <nav aria-label="Навигация по сайту">
          {f.nav.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className={`absolute left-[348.66px] leading-[normal] ${link}`}
              style={{ top: 90.5 + i * 29 }}
            >
              {item.label}
            </a>
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
          <a
            key={d.label}
            href={d.href}
            className={`absolute left-[862px] -translate-y-1/2 leading-[normal] ${link}`}
            style={{ top: [97, 124, 153, 181, 208, 237][i] }}
          >
            {d.label} ↗
          </a>
        ))}

        <p className={`absolute left-[862px] top-[279px] -translate-y-1/2 ${h}`}>X5 Tech в социальных сетях</p>
        {f.social.map((s, i) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`absolute left-[862px] leading-[normal] ${link}`}
            style={{ top: 306 + i * 29 }}
          >
            {s.label} ↗
          </a>
        ))}

        <p className="absolute left-[40px] top-[calc(50%+121.5px)] -translate-y-1/2 text-[12px] leading-[normal] text-white">
          {f.copyright}
        </p>
        {f.legal.map((l, i) => (
          <a
            key={l.label}
            href={l.href}
            className="absolute top-[calc(50%+156px)] -translate-y-1/2 text-[12px] leading-[normal] text-mist transition-colors hover:text-lime"
            style={{ left: [40, 264.23, 461.39][i] }}
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* ===== Мобильная стопка: точные интервалы из mobile-abs.json (футер 17232–18535) ===== */}
      <div className="px-[15px] pb-[129px] pt-[33px] lg:hidden">
        <FooterLogos />
        <p className="mt-[20px] whitespace-pre-line text-[12px] leading-[14px]">{f.description}</p>

        <p className={`mt-[35px] ${h}`}>Навигация</p>
        <nav aria-label="Навигация по сайту" className="mt-[15px] flex flex-col gap-[12px]">
          {f.nav.map((item) => (
            <a key={item.href} href={item.href} className={`leading-[17px] ${link}`}>
              {item.label}
            </a>
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
            <a key={d.label} href={d.href} className={`leading-[15px] ${link}`}>
              {d.label} ↗
            </a>
          ))}
        </div>

        <p className={`mt-[31px] ${h}`}>X5 Tech в социальных сетях</p>
        <div className="mt-[16px] flex flex-col gap-[12px]">
          {f.social.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={`leading-[17px] ${link}`}>
              {s.label} ↗
            </a>
          ))}
        </div>

        <p className="mt-[30px] whitespace-pre-line text-[12px] leading-[14px] text-white/90">{f.address}</p>

        <div className="mt-[30px] flex flex-col gap-[10px]">
          {f.legal.map((l) => (
            <a key={l.label} href={l.href} className="text-[12px] leading-[19px] text-mist">
              {l.label}
            </a>
          ))}
        </div>
        <p className="mt-[30px] text-[12px] leading-[14px]">{f.copyright}</p>
      </div>
      </footer>
  );
}
