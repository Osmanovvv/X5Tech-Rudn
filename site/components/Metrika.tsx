"use client";

// Яндекс.Метрика с отложенной загрузкой (Task 5.1).
//
// Синхронный сниппет в <head> стоит 5–15 баллов Lighthouse на мобиле: он блокирует главный поток
// ровно в тот момент, когда браузер считает интерактивность. Поэтому счётчик подключается ПОСЛЕ
// полной загрузки страницы — в простое (requestIdleCallback) или при первом действии пользователя,
// что случится раньше. Просмотр страницы при этом не теряется: Метрика при инициализации сама
// отправляет hit, а не полагается на момент вставки.
//
// ID берётся из content/site.json → metrikaId. Пока он null, компонент не рендерит ничего и в
// бандл не тянет ни байта разметки.
import { useEffect } from "react";
import site from "@/content/site.json";

const ID = site.metrikaId as number | string | null;

export default function Metrika() {
  useEffect(() => {
    if (!ID) return;
    if (document.getElementById("ym-script")) return;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      cleanup();
      const s = document.createElement("script");
      s.id = "ym-script";
      s.async = true;
      s.src = "https://mc.yandex.ru/metrika/tag.js";
      s.onload = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).ym?.(ID, "init", {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true,
        });
      };
      document.head.appendChild(s);
    };

    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, start));
      if (idle) cancelIdle(idle);
    };

    // Ждём полной загрузки, дальше — простоя главного потока (или первого действия)
    const ric: typeof requestIdleCallback | undefined =
      window.requestIdleCallback;
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    let idle: number | undefined;
    const afterLoad = () => {
      idle = ric
        ? ric(start, { timeout: 5000 })
        : (setTimeout(start, 2500) as unknown as number);
    };

    events.forEach((e) =>
      window.addEventListener(e, start, { once: true, passive: true }),
    );
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    return cleanup;
  }, []);

  if (!ID) return null;
  // Резервный путь для пользователей без JS — Метрика такой трафик считает пиксельным запросом
  return (
    <noscript>
      <div>
        <img
          src={`https://mc.yandex.ru/watch/${ID}`}
          style={{ position: "absolute", left: "-9999px" }}
          alt=""
        />
      </div>
    </noscript>
  );
}
