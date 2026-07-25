// Приём заявок с формы сайта (Task B4). Публичный POST — единственная точка, куда пишет
// посторонний, поэтому здесь и валидация, и защита от спама.
//
// Ответ намеренно скупой: наружу не уходит ничего о хранилище и о том, настроены ли уведомления.
import { NextResponse } from "next/server";
import { clientIp } from "@/lib/server/client-ip";
import { saveLead, validateLead, type LeadInput } from "@/lib/server/leads";
import { notifyNewLead } from "@/lib/server/notify";

export const dynamic = "force-dynamic";

// Осмысленная заявка — единицы килобайт; всё крупнее отсекаем не разбирая.
const MAX_BODY_BYTES = 32 * 1024;

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
  // Тело ограничиваем ДО разбора: иначе один запрос произвольного объёма съедает память.
  // Обычная заявка укладывается в пару килобайт.
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Слишком большой запрос." }, { status: 413 });
  }

  const ip = await clientIp();

  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Слишком много заявок подряд. Попробуйте позже." }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    // JSON-литералы null / "строка" / 42 разбираются успешно, но объектом не являются —
    // без этой проверки обращение к полям роняло обработчик и отдавало 500 вместо 400.
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
    }
    raw = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }

  // Ловушка для ботов: поле скрыто от людей, автозаполнялки его охотно заполняют.
  // Отвечаем «успехом», чтобы бот не подбирал обход.
  if (typeof raw._hp === "string" && raw._hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // Человек не заполнит форму быстрее пары секунд — а бот отправляет мгновенно.
  // Отсутствие метки тоже считаем ботом: иначе фильтр обходился бы простым «не слать поле _t».
  const startedAt = Number(raw._t);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 2000) {
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

  // Уведомление шлём БЕЗ ожидания: заявка уже сохранена, а недоступный мессенджер иначе
  // держал бы абитуриента в состоянии «Отправляем…» до восьми секунд и провоцировал повторные
  // отправки. Ошибки гасятся внутри notifyNewLead; процесс здесь долгоживущий (standalone),
  // поэтому обещание успевает выполниться после ответа.
  void notifyNewLead(lead);

  return NextResponse.json({ ok: true });
}
