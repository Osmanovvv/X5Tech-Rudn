// Заявки с сайта (Task B4). Персональные данные — только за авторизацией.
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { asset } from "@/lib/asset";
import { getLeads } from "@/lib/server/leads";
import { telegramConfigured } from "@/lib/server/notify";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заявки — админка",
  robots: { index: false, follow: false },
};

export default async function AdminLeads() {
  await requireAdmin();
  const leads = getLeads();

  return (
    <main className="mx-auto w-full max-w-[1100px] px-[20px] py-[40px]">
      <p className="text-[13px] text-[rgba(39,39,39,0.72)]">
        <Link href="/admin" className="underline underline-offset-2 hover:text-ink">
          ← Админка
        </Link>
      </p>

      <div className="mt-[12px] flex flex-wrap items-center justify-between gap-[12px]">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.4px] text-ink">Заявки</h1>
          <p className="mt-[4px] text-[13px] text-[rgba(39,39,39,0.72)]">
            Всего: {leads.length}
            {" · "}
            Уведомления в Telegram:{" "}
            {telegramConfigured() ? "включены" : "выключены (задайте токен бота в .env)"}
          </p>
        </div>
        {leads.length > 0 && (
          <a
            // asset() добавляет basePath: без него ссылка ведёт в 404 при размещении в подпапке
            href={asset("/api/admin/leads.csv")}
            className="flex h-[42px] items-center rounded-[5px] border border-hairline px-[20px] text-[13px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-[#f5f5f5]"
          >
            Скачать CSV
          </a>
        )}
      </div>

      {leads.length === 0 ? (
        <p className="mt-[28px] text-[14px] text-[rgba(39,39,39,0.72)]">
          Заявок пока нет. Они появятся здесь сразу после отправки формы на сайте.
        </p>
      ) : (
        <div className="mt-[24px] overflow-x-auto rounded-[12px] border border-hairline">
          <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-paper text-[12px] uppercase text-[rgba(39,39,39,0.72)]">
                <th className="px-[14px] py-[12px] font-medium">Дата</th>
                <th className="px-[14px] py-[12px] font-medium">Имя</th>
                <th className="px-[14px] py-[12px] font-medium">Контакты</th>
                <th className="px-[14px] py-[12px] font-medium">Комментарий</th>
                <th className="px-[14px] py-[12px] font-medium">Рассылка</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-hairline align-top">
                  <td className="whitespace-nowrap px-[14px] py-[12px] text-[rgba(39,39,39,0.72)]">
                    {new Date(l.createdAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-[14px] py-[12px] font-medium text-ink">
                    {l.name} {l.surname}
                  </td>
                  <td className="px-[14px] py-[12px]">
                    <a href={`mailto:${l.email}`} className="block text-[#3b63c9] underline underline-offset-2">
                      {l.email}
                    </a>
                    <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="mt-[4px] block text-ink">
                      {l.phone}
                    </a>
                  </td>
                  <td className="max-w-[320px] whitespace-pre-line px-[14px] py-[12px] text-[rgba(39,39,39,0.85)]">
                    {l.comment || "—"}
                  </td>
                  <td className="px-[14px] py-[12px] text-[rgba(39,39,39,0.72)]">{l.consentAds ? "да" : "нет"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
