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

// Разряды пробелом: 24000 → «24 000» (тот же формат, что в макете).
const spaceThousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Досчёт 0 → значение за ~800 мс (спека: 700–900), один раз. Финал берём из data-count-final,
// чтобы он ТОЧНО совпал с исходной разметкой (пиксель-сверка и отсутствие «прыжка» в конце).
function startCount(el: HTMLElement) {
  const to = Number(el.getAttribute("data-count-to"));
  const final = el.getAttribute("data-count-final") ?? String(to);
  if (!Number.isFinite(to) || to <= 0) return;
  const tail = final.replace(/^(\d[\d ]*\d|\d)/, ""); // суффикс: «+», « Пб», « года»
  const dur = 800;
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const t0 = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / dur);
    if (t < 1) {
      el.textContent = spaceThousands(Math.round(to * easeOut(t))) + tail;
      requestAnimationFrame(tick);
    } else {
      el.textContent = final; // точное исходное значение
    }
  };
  requestAnimationFrame(tick);
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

      const targets = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-reveal], [data-reveal-move], [data-reveal-scale], [data-count-to]",
        ),
      );
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
              const el = e.target as HTMLElement;
              el.classList.add("is-in"); // безвредно для чистых счётчиков
              if (el.hasAttribute("data-count-to")) startCount(el);
              obs.unobserve(el); // каждый блок проигрывается один раз
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
