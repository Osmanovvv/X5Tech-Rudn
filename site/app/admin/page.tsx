// Обзор админки: что происходит с сайтом прямо сейчас — сколько новостей и заявок,
// когда была последняя, куда пишутся данные, включены ли уведомления.
// Динамическая страница: читает куку сессии, поэтому пререндеру не подлежит.
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { getAllNews } from "@/lib/server/news-store";
import { getLeads } from "@/lib/server/leads";
import { telegramConfigured } from "@/lib/server/notify";
import { DATA_DIR } from "@/lib/server/store";
import { formatNewsDate } from "@/lib/news";
import AdminShell, { Card, PageHead } from "./AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Обзор — админка",
  robots: { index: false, follow: false },
};

function Stat({ value, label, href, hint }: { value: string; label: string; href?: string; hint?: string }) {
  const body = (
    <>
      <p className="text-[40px] font-bold leading-[44px] tracking-[-1px] text-ink">{value}</p>
      <p className="mt-[6px] text-[13px] font-medium text-ink">{label}</p>
      {hint && <p className="mt-[2px] text-[12px] text-[rgba(39,39,39,0.6)]">{hint}</p>}
    </>
  );
  const cls =
    "block rounded-[15px] border border-hairline bg-paper p-[20px] transition-[transform,box-shadow] duration-200 ease-motion";
  return href ? (
    <Link href={href} className={`${cls} hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(39,39,39,0.08)]`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function AdminHome() {
  const user = await requireAdmin(); // нет сессии → редирект на /admin/login
  const news = getAllNews();
  const leads = getLeads();

  const today = new Date().toISOString().slice(0, 10);
  const leadsToday = leads.filter((l) => l.createdAt.slice(0, 10) === today).length;
  const lastLead = leads[0]?.createdAt;

  return (
    <AdminShell user={user} active="home">
      <PageHead title="Обзор" note="Состояние сайта на текущий момент" />

      <div className="mt-[24px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          value={String(news.length)}
          label="Новостей опубликовано"
          href="/admin/news"
          hint={news[0] ? `последняя — ${formatNewsDate(news[0].date)}` : "ни одной"}
        />
        <Stat
          value={String(leads.length)}
          label="Заявок с формы"
          href="/admin/leads"
          hint={
            lastLead ? `последняя — ${new Date(lastLead).toLocaleString("ru-RU")}` : "ни одной"
          }
        />
        <Stat value={String(leadsToday)} label="Заявок сегодня" href="/admin/leads" />
      </div>

      <div className="mt-[16px] grid grid-cols-1 gap-[16px] lg:grid-cols-2">
        <Card>
          <h2 className="text-[15px] font-bold text-ink">Уведомления в Telegram</h2>
          <p className="mt-[8px] text-[13px] leading-[20px] text-[rgba(39,39,39,0.72)]">
            {telegramConfigured() ? (
              <>
                <span className="font-medium text-ink">Включены.</span> Каждая заявка дублируется в чат
                сразу после сохранения. Недоступность Telegram не приводит к потере заявки.
              </>
            ) : (
              <>
                <span className="font-medium text-ink">Выключены.</span> Заявки сохраняются и видны
                здесь. Чтобы они дублировались в Telegram, задайте <code>TELEGRAM_BOT_TOKEN</code> и{" "}
                <code>TELEGRAM_CHAT_ID</code> в <code>.env</code> — порядок в README.
              </>
            )}
          </p>
        </Card>

        <Card>
          <h2 className="text-[15px] font-bold text-ink">Где лежат данные</h2>
          <p className="mt-[8px] break-all font-mono text-[12px] leading-[18px] text-[rgba(39,39,39,0.72)]">
            {DATA_DIR}
          </p>
          <p className="mt-[8px] text-[13px] leading-[20px] text-[rgba(39,39,39,0.72)]">
            Новости, заявки и загруженные обложки. Резервному копированию подлежит только этот
            каталог — остальное восстанавливается пересборкой.
          </p>
        </Card>
      </div>

      <Card className="mt-[16px]">
        <h2 className="text-[15px] font-bold text-ink">Что можно делать</h2>
        <ul className="mt-[10px] flex flex-col gap-[6px] text-[13px] leading-[20px] text-[rgba(39,39,39,0.72)]">
          <li>
            <Link href="/admin/news/new" className="font-medium text-ink underline underline-offset-2">
              Добавить новость
            </Link>{" "}
            — она появится на сайте сразу, пересборка не нужна.
          </li>
          <li>Вставить картинки прямо в текст новости — подсказка есть в форме.</li>
          <li>
            <Link href="/admin/leads" className="font-medium text-ink underline underline-offset-2">
              Выгрузить заявки в CSV
            </Link>{" "}
            — файл открывается в Excel.
          </li>
        </ul>
      </Card>
    </AdminShell>
  );
}
