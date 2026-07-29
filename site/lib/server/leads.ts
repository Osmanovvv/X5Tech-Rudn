// Заявки с формы сайта (Task B4). ТОЛЬКО СЕРВЕР.
// Хранение — DATA_DIR/leads.jsonl (по строке на заявку): дописывание атомарнее перезаписи,
// потерять уже принятые заявки при сбое почти невозможно.
//
// ПЕРСОНАЛЬНЫЕ ДАННЫЕ: файл лежит вне раздаваемых папок и доступен только через админку.
// Никакого публичного чтения — роут /api/leads принимает POST и ничего не возвращает наружу.
import { appendJsonl, readJsonl } from "./store";
import type { Lead, LeadInput } from "@/lib/lead-validate";

// Реэкспорт: вызывающий код (роут приёма, админка) продолжает брать всё из одного места
export { validateLead, cleanComment, countLinks } from "@/lib/lead-validate";
export type { Lead, LeadInput } from "@/lib/lead-validate";

const LEADS_FILE = "leads.jsonl";


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
