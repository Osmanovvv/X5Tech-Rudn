// Выгрузка заявок в CSV (Task B4). Только для авторизованного администратора: это персональные
// данные абитуриентов. Без сессии — 401, никакого содержимого.
import { isAdminRequest } from "@/lib/server/auth";
import { getLeads, leadsToCsv } from "@/lib/server/leads";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminRequest())) {
    return new Response("Требуется вход", { status: 401 });
  }

  const csv = leadsToCsv(getLeads());
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="zayavki-${stamp}.csv"`,
      // Персональные данные не должны оседать в кэшах прокси и браузера
      "Cache-Control": "no-store, private",
    },
  });
}
