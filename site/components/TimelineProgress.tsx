"use client";

// Таймлайн секции «Программа обучения»: серая линия и зелёный отрезок поверх неё.
// Отрезок растёт вниз по мере прокрутки и укорачивается обратно при движении вверх —
// показывает, насколько программа пройдена.
//
// Почему компонент рисует ОБЕ линии, а не только зелёную: длину зелёной считаем в долях от
// серой, а для этого нужна её геометрия. Один владелец — никакой рассинхронизации.
//
// Величины из макета: линия начинается на 193px от верха секции, её высота 1686, зелёный
// отрезок в покое — 104.
import { useEffect, useRef } from "react";

const TOP = 193;
const HEIGHT = 1686;
const REST = 104; // длина зелёного отрезка в макете

export default function TimelineProgress() {
  const lineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    const fill = fillRef.current;
    if (!line || !fill) return;

    // Уважаем системную настройку «меньше движения»: там отрезок остаётся макетным.
    // Заодно это делает предсказуемой пиксельную сверку — она снимает страницы именно так.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (calm.matches) return;

    const restRatio = REST / HEIGHT;
    let raf = 0;
    let last = -1;

    const apply = () => {
      raf = 0;
      const r = line.getBoundingClientRect();
      if (r.height <= 0) return;
      // Опорная точка — середина экрана: линия заполнена ровно до того места, на которое
      // смотрит человек. Считаем долей, а не пикселями: секция между 768 и 1199 отрисована
      // с масштабированием, и пиксели там «не те».
      const anchor = window.innerHeight / 2;
      const progress = (anchor - r.top) / r.height;
      const ratio = Math.min(1, Math.max(restRatio, progress));
      const rounded = Math.round(ratio * 1000) / 1000;
      if (rounded === last) return; // не трогаем стиль, пока доля не изменилась
      last = rounded;
      // Пиксели, а не проценты: процент считался бы от высоты всей секции (1879), а не от
      // линии (1686). Секция между 768 и 1199 масштабируется целиком, поэтому её собственные
      // пиксели остаются верной единицей.
      fill.style.height = `${Math.round(rounded * HEIGHT)}px`;
    };

    const onScroll = () => {
      // Через requestAnimationFrame: событий прокрутки приходит куда больше, чем кадров,
      // и запись стиля на каждом из них заставляла бы браузер пересчитывать раскладку впустую
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={lineRef}
        className="absolute left-[6px] w-px bg-[#d8d8d8]"
        style={{ top: TOP, height: HEIGHT }}
        aria-hidden
      />
      {/* Стартовая длина — макетная: ровно её видит и посетитель с отключённой анимацией,
          и пиксельная сверка */}
      <div
        ref={fillRef}
        className="absolute left-[5px] w-[3px] bg-[#b6e835]"
        style={{ top: TOP, height: REST }}
        aria-hidden
      />
    </>
  );
}
