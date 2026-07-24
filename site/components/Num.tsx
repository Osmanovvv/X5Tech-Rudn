// Число, которое остров ScrollReveal досчитывает от 0 при ПЕРВОМ появлении (Task 3.4, спека
// «Счётчики»). Server Component: в DOM сразу финальное значение — для SEO, режима без JS и
// скринридера. Саму анимацию (0 → значение за ~800 мс, один раз) делает ScrollReveal по data-*.
// Парсит ведущее число (с пробелами-разрядами) и хвост-суффикс: «24 000+», «18 Пб», «4 года», «50».
export default function Num({ children }: { children: string }) {
  const s = String(children);
  const m = s.match(/^(\d[\d ]*\d|\d)(.*)$/);
  const to = m ? Number(m[1].replace(/ /g, "")) : NaN;
  if (!Number.isFinite(to) || to <= 0) return <>{s}</>;
  return (
    <span data-count-to={to} data-count-final={s}>
      {s}
    </span>
  );
}
