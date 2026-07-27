// Страница 404 (Task 4.4). В output:'export' Next кладёт её в out/404.html — сервер клиента
// отдаёт её через `error_page 404 /404.html` (см. README).
// Живёт в КОРНЕ app/ (а не в группе (site)), чтобы ловить любые несопоставленные URL, поэтому
// шапку/футер подключает сама через SiteChrome — ту же оболочку, что и публичные страницы.
import type { Metadata } from "next";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <main className="bg-white">
        <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-[80px] text-center">
          <p className="font-mono text-[64px] font-bold leading-none text-lime md:text-[96px]">404</p>
          <h1 className="mt-[16px] text-[24px] font-bold tracking-[-0.4px] text-ink md:text-[32px]">
            Страница не найдена
          </h1>
          <p className="mt-[12px] max-w-[440px] text-[14px] leading-[20px] text-[rgba(39,39,39,0.85)] md:text-[16px]">
            Возможно, ссылка устарела или страница была перемещена. Вернитесь на главную или загляните в новости.
          </p>
          <div className="mt-[28px] flex flex-wrap items-center justify-center gap-[12px]">
            <Link
              href="/"
              className="flex h-[48px] items-center rounded-[5px] bg-lime px-[28px] text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98]"
            >
              На главную
            </Link>
            <Link
              href="/news/"
              className="flex h-[48px] items-center rounded-[5px] border border-hairline px-[28px] text-[14px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-[#f5f5f5]"
            >
              Все новости
            </Link>
          </div>
        </div>
      </main>
    </SiteChrome>
  );
}
