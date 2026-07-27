// Заявки с сайта (Task B4). Персональные данные — только за авторизацией.
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/auth";
import { asset } from "@/lib/asset";
import { getLeads } from "@/lib/server/leads";
import { telegramConfigured } from "@/lib/server/notify";
import AdminShell, { Card, PageHead } from "../AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заявки — админка",
  robots: { index: false, follow: false },
};

export default async function AdminLeads() {
  const user = await requireAdmin();
  const leads = getLeads();
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = leads.filter((l) => l.createdAt.slice(0, 10) === today).length;

  return (
    <AdminShell user={user} active="leads">
      <PageHead
        title="Заявки"
        note={
          leads.length
            ? `Всего ${leads.length}${todayCount ? `, сегодня ${todayCount}` : ""} · уведомления в Telegram ${
                telegramConfigured() ? "включены" : "выключены"
              }`
            : undefined
        }
        action={
          leads.length > 0 && (
            <a
              // asset() добавляет basePath: без него ссылка ведёт в 404 при размещении в подпапке
              href={asset("/api/admin/leads.csv")}
              className="flex h-[45px] items-center rounded-[5px] bg-lime px-[24px] text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98]"
            >
              Скачать CSV
            </a>
          )
        }
      />

      {leads.length === 0 ? (
        <Card className="mt-[24px] text-center">
          <p className="text-[15px] font-medium text-ink">Заявок пока нет</p>
          <p className="mx-auto mt-[6px] max-w-[460px] text-[13px] leading-[20px] text-[rgba(39,39,39,0.72)]">
            Они появятся здесь сразу после отправки формы на сайте. Заявка сохраняется первой, и
            только потом уходит уведомление — сбой Telegram не приведёт к её потере.
          </p>
        </Card>
      ) : (
        <>
          <div className="mt-[24px] overflow-x-auto rounded-[15px] border border-hairline">
            <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="bg-paper text-[11px] uppercase tracking-[0.03em] text-[rgba(39,39,39,0.6)]">
                  <th className="px-[16px] py-[13px] font-medium">Когда</th>
                  <th className="px-[16px] py-[13px] font-medium">Имя</th>
                  <th className="px-[16px] py-[13px] font-medium">Контакты</th>
                  <th className="px-[16px] py-[13px] font-medium">Комментарий</th>
                  <th className="px-[16px] py-[13px] font-medium">Рассылка</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    className="border-t border-hairline align-top transition-colors duration-200 ease-motion hover:bg-paper"
                  >
                    <td className="whitespace-nowrap px-[16px] py-[14px] text-[rgba(39,39,39,0.6)]">
                      {new Date(l.createdAt).toLocaleString("ru-RU")}
                    </td>
                    <td className="px-[16px] py-[14px] font-medium text-ink">
                      {l.name} {l.surname}
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <a
                        href={`mailto:${l.email}`}
                        className="block text-[#3b63c9] underline underline-offset-2"
                      >
                        {l.email}
                      </a>
                      <a
                        href={`tel:${l.phone.replace(/\s/g, "")}`}
                        className="mt-[4px] block whitespace-nowrap text-ink"
                      >
                        {l.phone}
                      </a>
                    </td>
                    <td className="max-w-[320px] whitespace-pre-line px-[16px] py-[14px] text-[rgba(39,39,39,0.85)]">
                      {l.comment || "—"}
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <span
                        className={`inline-flex h-[24px] items-center rounded-full px-[10px] text-[12px] ${
                          l.consentAds ? "bg-lime text-ink" : "bg-mist text-[rgba(39,39,39,0.6)]"
                        }`}
                      >
                        {l.consentAds ? "согласен" : "нет"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-[14px] text-[12px] leading-[18px] text-[rgba(39,39,39,0.6)]">
            В таблице персональные данные абитуриентов. Выгруженный CSV храните так же
            бережно, как и сам сайт, и не дольше, чем требуется.
          </p>
        </>
      )}
    </AdminShell>
  );
}
