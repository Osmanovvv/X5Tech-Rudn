// Раздел «Контент»: список секций сайта, которые правятся без кода (требование ТЗ).
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { readSection } from "@/lib/server/content-store";
import AdminShell, { PageHead } from "../AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Контент — админка",
  robots: { index: false, follow: false },
};

export default async function ContentIndex() {
  const user = await requireAdmin();
  const program = readSection("program");
  const teachers = readSection("teachers");
  const admission = readSection("admission");

  const cards = [
    {
      href: "/admin/content/programma",
      title: "Программа обучения",
      note: `${program.courses.length} курса, дисциплин — ${program.courses.reduce((n, c) => n + c.disciplines.length, 0)}`,
    },
    {
      href: "/admin/content/prepodavateli",
      title: "Преподаватели и эксперты",
      note: `${teachers.teachers.length} человек`,
    },
    {
      href: "/admin/content/postuplenie",
      title: "Как поступить",
      note: `этапов: ${admission.budget.steps.length} по бюджету и ${admission.contract.steps.length} по договору, предметов — ${admission.exams.rows.length}`,
    },
  ];

  return (
    <AdminShell user={user} active="content">
      <div className="mx-auto w-full max-w-[760px]">
        <PageHead
          title="Контент"
          note="Состав программы, преподавателей и порядка приёма правится здесь — правки появляются на сайте сразу, пересборка не нужна"
        />
        <div className="mt-[24px] flex flex-col gap-[12px]">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block rounded-[15px] border border-hairline bg-paper p-[20px] transition-[transform,box-shadow] duration-200 ease-motion hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(39,39,39,0.08)]"
            >
              <p className="text-[16px] font-bold text-ink">{c.title}</p>
              <p className="mt-[4px] text-[13px] text-[rgba(39,39,39,0.6)]">{c.note}</p>
            </Link>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
