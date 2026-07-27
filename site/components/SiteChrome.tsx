// Оболочка публичного сайта: шапка, контент, футер + motion-обвязка (Task B2).
// Вынесена из корневого layout, чтобы админка (/admin) не получала маркетинговую шапку
// с кнопкой «Подать заявку» и футер РУДН. Порядок узлов внутри <body> сохранён 1:1 —
// пиксель-сверка замороженных точек не должна заметить разницы.
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Metrika from "@/components/Metrika";
import ScrollReveal from "@/components/ScrollReveal";

// Ставит .reveal-ready на <html> ДО первой отрисовки (иначе уже видимый контент моргнёт).
// Выполняется синхронно при парсинге. Страховочный таймер снимет класс через 2с, если остров
// ScrollReveal не успеет/не загрузится — контент не останется скрытым.
// Под reduced motion класс не ставим вовсе.
const REVEAL_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var r=document.documentElement;r.classList.add('reveal-ready');window.__revealTimer=setTimeout(function(){r.classList.remove('reveal-ready')},2000)}}catch(e){}`;

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: REVEAL_BOOT }} />
      <Header />
      {children}
      <Footer />
      <ScrollReveal />
      {/* Метрика — отложенно и только на публичных страницах; админке счётчик не нужен */}
      <Metrika />
    </>
  );
}
