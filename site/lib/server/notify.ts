// Уведомления о новых заявках в Telegram (Task B4). ТОЛЬКО СЕРВЕР.
//
// Выключено по умолчанию: работает, только если клиент задал в .env
//   TELEGRAM_BOT_TOKEN  — токен бота от @BotFather
//   TELEGRAM_CHAT_ID    — куда слать (личный чат, группа или канал с ботом-администратором)
// Без них заявки просто сохраняются — приём с сайта не ломается.
//
// Токен — секрет: он только в .env клиента, в репозиторий не попадает и в тексте уведомления
// не фигурирует. Ошибки отправки не должны терять заявку, поэтому вызывающий код их гасит.
import type { Lead } from "./leads";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";
// Адрес Bot API можно переопределить: с некоторых серверов api.telegram.org недоступен напрямую,
// и уведомления шлют через свой прокси. По умолчанию — официальный адрес.
const API_BASE = (process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org").replace(/\/+$/, "");

export const telegramConfigured = (): boolean => Boolean(TOKEN && CHAT_ID);

// Telegram-разметка HTML требует экранирования этих символов, иначе сообщение не отправится
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function format(lead: Lead): string {
  const lines = [
    "<b>Новая заявка с сайта</b>",
    "",
    `<b>Имя:</b> ${esc(lead.name)}${lead.surname ? " " + esc(lead.surname) : ""}`,
    `<b>Почта:</b> ${esc(lead.email)}`,
    `<b>Телефон:</b> ${esc(lead.phone)}`,
  ];
  if (lead.comment) lines.push(`<b>Комментарий:</b> ${esc(lead.comment)}`);
  lines.push("", `Согласие на рассылку: ${lead.consentAds ? "да" : "нет"}`);
  lines.push(`Время: ${new Date(lead.createdAt).toLocaleString("ru-RU")}`);
  return lines.join("\n");
}

// Отправка уведомления. Никогда не бросает исключение: заявка уже сохранена, и сбой мессенджера
// не повод показывать абитуриенту ошибку. Проблемы пишем в лог сервера.
export async function notifyNewLead(lead: Lead): Promise<void> {
  if (!telegramConfigured()) return;
  try {
    const res = await fetch(`${API_BASE}/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: format(lead),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000), // не держим ответ пользователю из-за медленного API
    });
    if (!res.ok) {
      // Тело ответа Telegram описывает причину (неверный chat_id, бот не в чате и т.п.).
      // Токен в лог не пишем.
      const detail = await res.text().catch(() => "");
      console.error("[notify] Telegram не принял уведомление:", res.status, detail.slice(0, 300));
    }
  } catch (e) {
    // Текст ошибки fetch содержит полный URL, а в нём — токен бота. В журнал он попасть не должен,
    // поэтому вырезаем токен из сообщения перед записью.
    const raw = e instanceof Error ? e.message : String(e);
    const safe = TOKEN ? raw.split(TOKEN).join("<токен скрыт>") : raw;
    console.error("[notify] не удалось отправить уведомление в Telegram:", safe);
  }
}
