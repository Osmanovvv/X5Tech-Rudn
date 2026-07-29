// Общая оболочка админки: шапка с логотипами, навигация, выход.
//
// Почему это компонент, а не layout.tsx: layout не выполняется при вызове Server Actions, и
// проверять там сессию нельзя (см. комментарий в layout.tsx). Имя вошедшего оболочке нужно,
// а получает его каждая страница своим requireAdmin — поэтому передаём пропсом.
//
// Оформление — то же, что на сайте: те же токены (ink, lime, paper, hairline), скругления 15px,
// единый easing. Админка должна выглядеть частью продукта, а не служебной панелью.
import Link from "next/link";
import { asset } from "@/lib/asset";
import { logout } from "./actions";

const NAV = [
  { href: "/admin", label: "Обзор", key: "home" },
  { href: "/admin/news", label: "Новости", key: "news" },
  { href: "/admin/content", label: "Контент", key: "content" },
  { href: "/admin/leads", label: "Заявки", key: "leads" },
] as const;

export type AdminSection = (typeof NAV)[number]["key"];

export function AdminLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-[10px] ${className}`}>
      <img src={asset("/img/01-hero/logo-rudn-2x.webp")} alt="РУДН" className="h-[26px] w-auto" />
      <span aria-hidden className="text-[16px] text-[rgba(39,39,39,0.35)]">
        ×
      </span>
      <img src={asset("/img/01-hero/logo-x5-2x.webp")} alt="X5 Tech" className="h-[22px] w-auto" />
    </span>
  );
}

export default function AdminShell({
  user,
  active,
  children,
}: {
  user: string;
  active: AdminSection;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-hairline bg-white/95 backdrop-blur-[6px]">
        <div className="mx-auto flex w-full max-w-[1100px] flex-wrap items-center gap-x-[24px] gap-y-[12px] px-[20px] py-[14px]">
          <Link href="/admin" aria-label="Админка сайта" className="shrink-0">
            <AdminLogo />
          </Link>

          <nav aria-label="Разделы админки" className="flex items-center gap-[4px]">
            {NAV.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                aria-current={n.key === active ? "page" : undefined}
                className={`flex h-[36px] items-center rounded-full px-[16px] text-[13px] font-medium transition-colors duration-200 ease-motion ${
                  n.key === active ? "bg-lime text-ink" : "text-[rgba(39,39,39,0.72)] hover:bg-paper hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-[14px]">
            <Link
              href="/"
              className="hidden text-[13px] text-[rgba(39,39,39,0.72)] underline underline-offset-2 transition-colors duration-200 ease-motion hover:text-ink sm:block"
            >
              Открыть сайт ↗
            </Link>
            <span className="hidden text-[13px] text-[rgba(39,39,39,0.72)] md:block">{user}</span>
            <form action={logout}>
              <button
                type="submit"
                className="h-[36px] rounded-[5px] border border-hairline px-[16px] text-[13px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-paper active:scale-[0.98]"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-[20px] py-[32px]">{children}</main>

      <footer className="border-t border-hairline">
        <p className="mx-auto w-full max-w-[1100px] px-[20px] py-[18px] text-[12px] text-[rgba(39,39,39,0.55)]">
          Панель управления сайтом факультета искусственного интеллекта РУДН × X5 Tech
        </p>
      </footer>
    </div>
  );
}

// ===== Мелкие элементы, общие для страниц админки =====

export function PageHead({ title, note, action }: { title: string; note?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-[12px]">
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.6px] text-ink">{title}</h1>
        {note && <p className="mt-[6px] text-[13px] text-[rgba(39,39,39,0.72)]">{note}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[15px] border border-hairline bg-paper p-[20px] ${className}`}>{children}</div>
  );
}
