// Правка секции «Преподаватели и эксперты» (требование ТЗ: состав меняется без кода).
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { readSection } from "@/lib/server/content-store";
import AdminShell, { PageHead } from "../../AdminShell";
import ResetSection from "../ResetSection";
import TeachersForm from "./TeachersForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Преподаватели и эксперты — админка",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireAdmin();
  const initial = readSection("teachers");

  return (
    <AdminShell user={user} active="content">
      <div className="mx-auto w-full max-w-[860px]">
        <Link
          href="/admin/content"
          className="text-[13px] text-[rgba(39,39,39,0.72)] underline underline-offset-2 transition-colors duration-200 ease-motion hover:text-ink"
        >
          ← Контент
        </Link>
        <div className="mt-[12px]">
          <PageHead title="Преподаватели и эксперты" note="Состав преподавателей, их фотографии и подписи секции" />
        </div>
        <TeachersForm initial={initial} />
        <ResetSection section="teachers" />
      </div>
    </AdminShell>
  );
}
