// Список новостей в админке (Task B3).
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { getAllNews } from "@/lib/server/news-store";
import { asset } from "@/lib/asset";
import { coverPath, formatNewsDate } from "@/lib/news";
import { deleteNews } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Новости — админка",
  robots: { index: false, follow: false },
};

export default async function AdminNewsList() {
  await requireAdmin();
  const items = getAllNews();

  return (
    <main className="mx-auto w-full max-w-[900px] px-[20px] py-[40px]">
      <p className="text-[13px] text-[rgba(39,39,39,0.72)]">
        <Link href="/admin" className="underline underline-offset-2 hover:text-ink">
          ← Админка
        </Link>
      </p>

      <div className="mt-[12px] flex flex-wrap items-center justify-between gap-[12px]">
        <h1 className="text-[24px] font-bold tracking-[-0.4px] text-ink">Новости</h1>
        <Link
          href="/admin/news/new"
          className="flex h-[42px] items-center rounded-[5px] bg-lime px-[20px] text-[13px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98]"
        >
          + Добавить новость
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-[28px] text-[14px] text-[rgba(39,39,39,0.72)]">
          Новостей пока нет. Нажмите «Добавить новость».
        </p>
      ) : (
        <ul className="mt-[24px] flex flex-col gap-[12px]">
          {items.map((item) => (
            <li
              key={item.slug}
              className="flex flex-wrap items-center gap-[14px] rounded-[12px] border border-hairline bg-paper p-[12px]"
            >
              <img
                src={asset(coverPath(item.cover, 640))}
                alt=""
                className="h-[56px] w-[86px] shrink-0 rounded-[6px] object-cover"
              />
              <div className="min-w-[200px] flex-1">
                <p className="text-[14px] font-bold leading-[18px] text-ink">{item.title}</p>
                <p className="mt-[4px] text-[12px] text-[rgba(39,39,39,0.72)]">
                  {formatNewsDate(item.date)} · {item.category} · /news/{item.slug}/
                </p>
              </div>
              <div className="flex items-center gap-[8px]">
                <Link
                  href={`/admin/news/${item.slug}`}
                  className="flex h-[36px] items-center rounded-[5px] border border-hairline px-[14px] text-[13px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-white"
                >
                  Изменить
                </Link>
                <form action={deleteNews}>
                  <input type="hidden" name="slug" value={item.slug} />
                  <button
                    type="submit"
                    className="h-[36px] rounded-[5px] border border-hairline px-[14px] text-[13px] text-red-600 transition-colors duration-200 ease-motion hover:bg-red-50"
                  >
                    Удалить
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
