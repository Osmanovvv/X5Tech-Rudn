// Редактирование новости (Task B3).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { getAllNews } from "@/lib/server/news-store";
import { getNews } from "@/lib/news";
import { asset } from "@/lib/asset";
import AdminShell, { PageHead } from "../../AdminShell";
import NewsForm from "../NewsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Редактирование новости — админка",
  robots: { index: false, follow: false },
};

export default async function EditNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireAdmin();
  const { slug } = await params;
  const item = getNews(getAllNews(), slug);
  if (!item) notFound();

  return (
    <AdminShell user={user} active="news">
      <div className="mx-auto w-full max-w-[760px]">
        <Link
          href="/admin/news"
          className="text-[13px] text-[rgba(39,39,39,0.72)] underline underline-offset-2 transition-colors duration-200 ease-motion hover:text-ink"
        >
          ← Все новости
        </Link>
        <div className="mt-[12px]">
          <PageHead
            title="Редактирование"
            note="Адрес страницы при смене заголовка не меняется — уже разосланные ссылки продолжат работать"
            action={
              <a
                href={asset(`/news/${item.slug}/`)}
                target="_blank"
                rel="noopener"
                className="flex h-[45px] items-center rounded-[5px] border border-hairline px-[20px] text-[13px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-paper"
              >
                Открыть на сайте ↗
              </a>
            }
          />
        </div>
        <NewsForm item={item} />
      </div>
    </AdminShell>
  );
}
