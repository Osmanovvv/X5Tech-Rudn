// Заявки с формы сайта (Task B4). ТОЛЬКО СЕРВЕР.
// Хранение — DATA_DIR/leads.jsonl (по строке на заявку): дописывание атомарнее перезаписи,
// потерять уже принятые заявки при сбое почти невозможно.
//
// ПЕРСОНАЛЬНЫЕ ДАННЫЕ: файл лежит вне раздаваемых папок и доступен только через админку.
// Никакого публичного чтения — роут /api/leads принимает POST и ничего не возвращает наружу.
import { appendJsonl, readJsonl } from "./store";

const LEADS_FILE = "leads.jsonl";

export type Lead = {
  id: string;
  createdAt: string; // ISO
  name: string;
  surname: string;
  email: string;
  phone: string;
  comment: string;
  consentPd: boolean;
  consentAds: boolean;
};

export type LeadInput = Omit<Lead, "id" | "createdAt">;

const MAX = { name: 80, surname: 80, email: 160, phone: 32, comment: 2000 };

// Проверка на стороне сервера — единственная, которой можно доверять: браузерную легко обойти.
export function validateLead(raw: Record<string, unknown>): { ok: true; lead: LeadInput } | { ok: false; errors: Record<string, string> } {
  const str = (v: unknown) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : "");
  const name = str(raw.name);
  const surname = str(raw.surname);
  const email = str(raw.email);
  const phone = str(raw.phone);
  const comment = str(raw.comment);
  const truthy = (v: unknown) => v === true || v === "true" || v === "on" || v === "1";

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Укажите имя.";
  else if (name.length > MAX.name) errors.name = "Имя слишком длинное.";
  if (surname.length > MAX.surname) errors.surname = "Фамилия слишком длинная.";
  // Намеренно простая проверка почты: строгие регулярки отсекают валидные адреса
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Проверьте адрес почты.";
  else if (email.length > MAX.email) errors.email = "Адрес почты слишком длинный.";
  // Проверяем И длину строки, И количество цифр: без первой в файл персональных данных
  // попадала бы строка произвольного размера (цифр в ней могло быть ровно 11).
  const digits = phone.replace(/\D/g, "");
  if (phone.length > MAX.phone) errors.phone = "Номер телефона слишком длинный.";
  else if (digits.length < 11 || digits.length > 15) errors.phone = "Проверьте номер телефона.";
  if (comment.length > MAX.comment) errors.comment = "Комментарий длиннее 2000 символов.";
  if (!truthy(raw.consent_pd)) errors.consent_pd = "Без согласия на обработку данных заявку принять нельзя.";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    lead: { name, surname, email, phone, comment, consentPd: true, consentAds: truthy(raw.consent_ads) },
  };
}

// Возвращает сохранённую заявку — с ней потом уходит уведомление (нужны id и время).
export async function saveLead(input: LeadInput): Promise<Lead> {
  const lead: Lead = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  await appendJsonl(LEADS_FILE, lead);
  return lead;
}

// Все заявки, свежие первыми (для админки).
export function getLeads(): Lead[] {
  return readJsonl<Lead>(LEADS_FILE).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Выгрузка в CSV для приёмной комиссии. Разделитель «;» и BOM — чтобы Excel на Windows
// открыл файл с кириллицей без «кракозябр» и не склеил всё в одну колонку.
export function leadsToCsv(leads: Lead[]): string {
  const head = ["Дата", "Имя", "Фамилия", "Почта", "Телефон", "Комментарий", "Согласие на рассылку"];

  // Значения приходят от посторонних людей через публичную форму. Excel и LibreOffice
  // исполняют ячейку как формулу, если она начинается с = + - @ или управляющего символа —
  // так через комментарий к заявке можно было бы атаковать компьютер приёмной комиссии.
  // Обезвреживаем ведущим апострофом: он не отображается, но делает ячейку текстовой.
  const neutralize = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);
  const esc = (v: string) => `"${neutralize(String(v)).replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [
      new Date(l.createdAt).toLocaleString("ru-RU"),
      l.name,
      l.surname,
      l.email,
      l.phone,
      l.comment.replace(/\n/g, " "),
      l.consentAds ? "да" : "нет",
    ]
      .map(esc)
      .join(";"),
  );
  return "﻿" + [head.map(esc).join(";"), ...rows].join("\r\n");
}
