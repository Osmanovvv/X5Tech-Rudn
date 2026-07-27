// Создание новости (Task B3).
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import AdminShell, { PageHead } from "../../AdminShell";
import NewsForm from "../NewsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Новая новость — админка",
  robots: { index: false, follow: false },
};

export default async function NewNewsPage() {
  const user = await requireAdmin();

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
            title="Новая новость"
            note="После сохранения она сразу появится на сайте — в карусели на главной и в разделе «Новости»"
          />
        </div>
        <NewsForm />
      </div>
    </AdminShell>
  );
}
