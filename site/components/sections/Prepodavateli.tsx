// «Преподаватели и эксперты» — секция 271:2112 (десктоп-нода 1115×828), мобильная зона 271:2313.
// Состав правится в админке (/admin/content/prepodavateli): читаем через content-store, а
// content/teachers.json остаётся сидом на случай, когда правок ещё не было.
// Карточка едина для десктопа и мобилы: aspect-ratio 260/332 +
// проценты (у каждого фото свой кроп из ctx). Десктоп — сетка 4×2, мобила — стек. Переносы имён/
// специализаций одинаковы (ширина карточки ~260 в обоих), прошиты в json.

import { photoSrc } from "@/lib/content-assets";
import { readSection } from "@/lib/server/content-store";
import type { Teacher } from "@/lib/content-types";

function TeacherCard({ t }: { t: Teacher }) {
  return (
    // Пропорция карточки на мобильной — 290×330 по замеру макета (десктопная 260×332 давала
    // 370px при ширине 290, то есть на 40px выше макетной). Десктоп остаётся прежним.
    <div className="group relative aspect-[290/330] w-full overflow-hidden rounded-[18px] bg-[#d8d8d8] md:aspect-[260/332]">
      {/* Фото (свой кроп; у Тынченко контейнер на всю высоту карточки) */}
      <div
        className={`absolute inset-x-0 top-0 overflow-hidden rounded-[20px] ${t.fill ? "h-full" : "h-[86.45%]"}`}
      >
        {/* Кроп ведём ТОЛЬКО от ширины: картинка тянется на 100% ширины, высота — своя
            natural. Проценты из макета (crop.h) считаются от высоты контейнера, а она у
            мобильной карточки другая (290×330 против 260×332) — от этого фото сплющивало
            по вертикали примерно на 11%, лица становились шире. Сдвиг задаём свойством
            translate: проценты в нём считаются от собственной высоты картинки, поэтому
            кадр держится одинаково при любой ширине. crop.top/crop.h как раз и есть доля
            высоты картинки. На десктопе результат совпадает с прежним до 0.2px. */}
        <img
          loading="lazy"
          src={photoSrc("07-prepodavateli", t.photo, 640)}
          alt={t.name.replace(/\n/g, " ")}
          className="absolute left-0 top-0 w-full max-w-none transition-transform duration-200 ease-motion group-hover:scale-[1.015]"
          style={{ translate: `0 ${((t.crop.top / t.crop.h) * 100).toFixed(3)}%` }}
        />
      </div>
      {/* Белая плашка с именем и специализацией */}
      <div className="absolute inset-x-0 top-[60.54%] h-[39.46%] rounded-b-[20px] border-t border-[#d5d5d5] bg-paper" />
      <p className="absolute left-[5.4%] top-[65.06%] whitespace-pre-line text-[15px] font-bold leading-[16px] text-ink">
        {t.name}
      </p>
      <p className="absolute left-[5.4%] top-[77.1%] whitespace-pre-line text-[12px] leading-[15px] text-[rgba(39,39,39,0.85)]">
        {t.spec}
      </p>
    </div>
  );
}

export default function Prepodavateli() {
  const { title, titleM, subtitle, subtitleM, teachers: list } = readSection("teachers");
  return (
    <section id="prepodavateli" aria-label="Преподаватели и эксперты">
      {/* ===== Десктоп: калька 1115×828 (зазор до предыдущей секции — 80px) ===== */}
      <div className="calque-1200 relative mx-auto mt-[80px] hidden h-[828px] max-w-[1115px] bg-white md:block">
        <h2 data-reveal className="absolute left-0 top-0 text-[42px] font-bold leading-[45px] tracking-[-1px] text-ink">
          {title}
        </h2>
        <p data-reveal className="absolute left-0 top-[60px] whitespace-pre-line text-[16px] leading-[20px] text-[rgba(39,39,39,0.85)]">
          {subtitle}
        </p>
        {/* Спека 06: проявлять рядами по 3–4 — data-i по номеру ряда (4 карточки в ряд) */}
        {list.map((t, i) => (
          <div
            key={i}
            data-reveal
            data-i={String(Math.floor(i / 4) + 1)}
            className="absolute w-[260px]"
            style={{ left: (i % 4) * 285, top: 132 + Math.floor(i / 4) * 364 }}
          >
            <TeacherCard t={t} />
          </div>
        ))}
      </div>

      {/* ===== Мобильная: вертикальный стек ===== */}
      <div className="canvas-320 bg-white px-[15px] pb-[10px] md:hidden">
        {/* Заголовок с явным переносом: в мобильном макете он разбит «Преподаватели /
            и эксперты», а естественный перенос ставил «и» в конец первой строки */}
        <h2 data-reveal className="whitespace-pre-line pt-[30px] text-[22px] font-bold leading-[26px] text-ink">
          {titleM}
        </h2>
        <p data-reveal className="mt-[12px] whitespace-pre-line text-[12px] leading-[18px] text-[rgba(39,39,39,0.85)]">
          {subtitleM}
        </p>
        <div data-reveal className="mt-[20px] flex flex-col gap-[20px]">
          {list.map((t, i) => (
            <TeacherCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
