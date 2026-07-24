// Дашборд админки (Task B2 — каркас; разделы наполняются в B3 «Новости» и B4 «Заявки»).
// Динамическая страница: читает куку сессии, поэтому пререндеру не подлежит.
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Админка",
  robots: { index: false, follow: false },
};

export default async function AdminHome() {
  const user = await requireAdmin(); // нет сессии → редирект на /admin/login

  return (
    <main className="mx-auto w-full max-w-[900px] px-[20px] py-[40px]">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.4px] text-ink">Админка сайта</h1>
          <p className="mt-[4px] text-[13px] text-[rgba(39,39,39,0.72)]">Вы вошли как {user}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="h-[40px] rounded-[5px] border border-hairline px-[18px] text-[13px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-[#f5f5f5]"
          >
            Выйти
          </button>
        </form>
      </div>

      <div className="mt-[28px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
        <Link
          href="/admin/news"
          className="rounded-[15px] border border-hairline bg-paper p-[20px] transition-shadow duration-200 ease-motion hover:shadow-[0_10px_28px_rgba(39,39,39,0.08)]"
        >
          <h2 className="text-[16px] font-bold text-ink">Новости</h2>
          <p className="mt-[6px] text-[13px] leading-[18px] text-[rgba(39,39,39,0.72)]">
            Добавить, отредактировать или удалить новость, загрузить обложку.
          </p>
        </Link>

        <Link
          href="/admin/leads"
          className="rounded-[15px] border border-hairline bg-paper p-[20px] transition-shadow duration-200 ease-motion hover:shadow-[0_10px_28px_rgba(39,39,39,0.08)]"
        >
          <h2 className="text-[16px] font-bold text-ink">Заявки</h2>
          <p className="mt-[6px] text-[13px] leading-[18px] text-[rgba(39,39,39,0.72)]">
            Заявки с формы на сайте, выгрузка в CSV.
          </p>
        </Link>
      </div>

      <p className="mt-[28px] text-[13px] text-[rgba(39,39,39,0.72)]">
        <Link href="/" className="underline underline-offset-2 hover:text-ink">
          ← Открыть сайт
        </Link>
      </p>
    </main>
  );
}
