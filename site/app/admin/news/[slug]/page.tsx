// Редактирование новости (Task B3).
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { getAllNews } from "@/lib/server/news-store";
import { getNews } from "@/lib/news";
import NewsForm from "../NewsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Редактирование новости — админка",
  robots: { index: false, follow: false },
};

export default async function EditNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const item = getNews(getAllNews(), slug);
  if (!item) notFound();

  return (
    <main className="mx-auto w-full max-w-[760px] px-[20px] py-[40px]">
      <p className="text-[13px] text-[rgba(39,39,39,0.72)]">
        <Link href="/admin/news" className="underline underline-offset-2 hover:text-ink">
          ← Новости
        </Link>
      </p>
      <h1 className="mt-[12px] text-[24px] font-bold tracking-[-0.4px] text-ink">Редактирование</h1>
      <p className="mt-[4px] text-[13px] text-[rgba(39,39,39,0.72)]">
        Адрес страницы: /news/{item.slug}/ — при смене заголовка он не меняется, чтобы не ломать
        существующие ссылки.
      </p>
      <NewsForm item={item} />
    </main>
  );
}
