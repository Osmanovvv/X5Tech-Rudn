// Список новостей в админке (Task B3).
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { getAllNews } from "@/lib/server/news-store";
import { asset } from "@/lib/asset";
import { coverPath, formatNewsDate, parseBody } from "@/lib/news";
import AdminShell, { Card, PageHead } from "../AdminShell";
import DeleteNews from "./DeleteNews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Новости — админка",
  robots: { index: false, follow: false },
};

export default async function AdminNewsList() {
  const user = await requireAdmin();
  const items = getAllNews();

  return (
    <AdminShell user={user} active="news">
      <PageHead
        title="Новости"
        note={
          items.length
            ? `${items.length} ${items.length === 1 ? "запись" : items.length < 5 ? "записи" : "записей"} · порядок на сайте — по дате, новые сверху`
            : undefined
        }
        action={
          <Link
            href="/admin/news/new"
            className="flex h-[45px] items-center rounded-[5px] bg-lime px-[24px] text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98]"
          >
            Добавить новость
          </Link>
        }
      />

      {items.length === 0 ? (
        <Card className="mt-[24px] text-center">
          <p className="text-[15px] font-medium text-ink">Новостей пока нет</p>
          <p className="mx-auto mt-[6px] max-w-[420px] text-[13px] leading-[20px] text-[rgba(39,39,39,0.72)]">
            Первая новость появится на сайте сразу после сохранения — и в карусели на главной,
            и в разделе «Новости».
          </p>
          <Link
            href="/admin/news/new"
            className="mt-[18px] inline-flex h-[45px] items-center rounded-[5px] bg-lime px-[24px] text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98]"
          >
            Добавить новость
          </Link>
        </Card>
      ) : (
        <ul className="mt-[24px] flex flex-col gap-[12px]">
          {items.map((item) => {
            const inText = parseBody(item.body).filter((b) => b.kind === "figure").length;
            return (
              <li
                key={item.slug}
                className="flex flex-wrap items-center gap-[16px] rounded-[15px] border border-hairline bg-paper p-[14px] transition-colors duration-200 ease-motion hover:bg-white"
              >
                <img
                  src={asset(coverPath(item.cover, 640))}
                  alt=""
                  className="h-[64px] w-[100px] shrink-0 rounded-[8px] bg-mist object-cover"
                />

                <div className="min-w-[220px] flex-1">
                  <p className="text-[15px] font-bold leading-[20px] text-ink">{item.title}</p>
                  <p className="mt-[4px] text-[12px] text-[rgba(39,39,39,0.6)]">
                    {formatNewsDate(item.date)} · {item.category}
                    {inText > 0 && ` · картинок в тексте: ${inText}`}
                  </p>
                  <a
                    href={asset(`/news/${item.slug}/`)}
                    target="_blank"
                    rel="noopener"
                    className="mt-[4px] inline-block break-all font-mono text-[11px] text-[rgba(39,39,39,0.6)] underline underline-offset-2 transition-colors duration-200 ease-motion hover:text-ink"
                  >
                    /news/{item.slug}/ ↗
                  </a>
                </div>

                <div className="flex items-center gap-[8px]">
                  <Link
                    href={`/admin/news/${item.slug}`}
                    className="flex h-[36px] items-center rounded-[5px] border border-hairline bg-white px-[16px] text-[13px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-mist"
                  >
                    Изменить
                  </Link>
                  <DeleteNews slug={item.slug} title={item.title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
