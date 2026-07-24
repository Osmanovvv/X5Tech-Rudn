// Приём заявок с формы сайта (Task B4). Публичный POST — единственная точка, куда пишет
// посторонний, поэтому здесь и валидация, и защита от спама.
//
// Ответ намеренно скупой: наружу не уходит ничего о хранилище и о том, настроены ли уведомления.
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { saveLead, validateLead, type LeadInput } from "@/lib/server/leads";
import { notifyNewLead } from "@/lib/server/notify";

export const dynamic = "force-dynamic";

// Ограничение частоты: не больше 5 заявок с одного адреса за 10 минут.
const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  // Подчищаем карту, чтобы она не росла бесконечно на долгоживущем процессе
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return recent.length > RATE_LIMIT;
}

export async function POST(req: Request) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Слишком много заявок подряд. Попробуйте позже." }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  // Ловушка для ботов: поле скрыто от людей, автозаполнялки его охотно заполняют.
  // Отвечаем «успехом», чтобы бот не подбирал обход.
  if (typeof raw._hp === "string" && raw._hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Человек не заполнит форму быстрее пары секунд — а бот отправляет мгновенно.
  const startedAt = Number(raw._t);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < 2000) {
    return NextResponse.json({ ok: true });
  }

  const result = validateLead(raw);
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
  }

  const input: LeadInput = result.lead;
  let lead;
  try {
    lead = await saveLead(input);
  } catch (e) {
    console.error("[leads] не удалось сохранить заявку:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "Не удалось сохранить заявку." }, { status: 500 });
  }

  // Уведомление — уже после сохранения: заявка не должна теряться из-за недоступности
  // мессенджера (внутри всё обёрнуто в try/catch и ограничено таймаутом).
  await notifyNewLead(lead);

  return NextResponse.json({ ok: true });
}
