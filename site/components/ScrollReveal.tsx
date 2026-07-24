"use client";

// Один IntersectionObserver на всю страницу для появления групп [data-reveal].
// Наблюдаем смысловые группы, а НЕ секции целиком: высокие секции (до ~3000px на мобиле)
// физически не набирают 18% видимости и иначе не показались бы никогда.
// Класс .reveal-ready на <html> ставит инлайн-скрипт в layout ДО первой отрисовки (см. layout.tsx);
// здесь мы лишь снимаем его страховочный таймер и вешаем/снимаем класс .is-in.
import { useEffect } from "react";

declare global {
  interface Window {
    __revealTimer?: ReturnType<typeof setTimeout>;
  }
}

export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const clearFallback = () => {
      if (window.__revealTimer) {
        clearTimeout(window.__revealTimer);
        window.__revealTimer = undefined;
      }
    };

    try {
      // reduced motion: ничего не прячем (CSS уже под no-preference), снимаем страховку и выходим
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        clearFallback();
        root.classList.remove("reveal-ready");
        return;
      }

      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      // Остров жив и взял управление — отменяем аварийный таймер инлайн-скрипта
      clearFallback();

      if (targets.length === 0) {
        root.classList.remove("reveal-ready");
        return;
      }

      const io = new IntersectionObserver(
        (entries, obs) => {
          for (const e of entries) {
            // спека: запуск на 15–20% видимости; страховка — группа выше экрана (top в верхних 85%)
            if (
              e.isIntersecting &&
              (e.intersectionRatio >= 0.18 || e.boundingClientRect.top < window.innerHeight * 0.85)
            ) {
              e.target.classList.add("is-in");
              obs.unobserve(e.target); // каждый блок проигрывается один раз
            }
          }
        },
        { threshold: [0, 0.18] },
      );

      targets.forEach((t) => io.observe(t));
      return () => io.disconnect();
    } catch {
      // Любая ошибка инициализации не должна оставить контент невидимым
      clearFallback();
      root.classList.remove("reveal-ready");
    }
  }, []);

  return null;
}
