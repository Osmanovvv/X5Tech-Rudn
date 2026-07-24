// Создание новости (Task B3).
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import NewsForm from "../NewsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Новая новость — админка",
  robots: { index: false, follow: false },
};

export default async function NewNewsPage() {
  await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-[760px] px-[20px] py-[40px]">
      <p className="text-[13px] text-[rgba(39,39,39,0.72)]">
        <Link href="/admin/news" className="underline underline-offset-2 hover:text-ink">
          ← Новости
        </Link>
      </p>
      <h1 className="mt-[12px] text-[24px] font-bold tracking-[-0.4px] text-ink">Новая новость</h1>
      <NewsForm />
    </main>
  );
}
