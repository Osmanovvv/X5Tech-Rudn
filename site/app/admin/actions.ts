"use server";

// Server Actions входа/выхода (Task B2). Выполняются только на сервере.
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminConfigured,
  checkCredentials,
  endSession,
  loginBlocked,
  noteFailedLogin,
  resetLoginAttempts,
  sameOrigin,
  startSession,
} from "@/lib/server/auth";

export type LoginState = { error?: string } | undefined;

// Ключ ограничения попыток — IP из заголовков прокси (nginx ставит x-forwarded-for),
// с запасным вариантом на случай прямого подключения.
async function clientKey(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!(await sameOrigin())) return { error: "Запрос отклонён (посторонний источник)." };

  if (!adminConfigured()) {
    return { error: "Админка не настроена: задайте ADMIN_USERNAME, ADMIN_PASSWORD_HASH и SESSION_SECRET в .env" };
  }

  const key = await clientKey();
  if (loginBlocked(key)) {
    return { error: "Слишком много попыток входа. Попробуйте через 10 минут." };
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!checkCredentials(username, password)) {
    noteFailedLogin(key);
    // Намеренно одинаковый текст: не подсказываем, что именно неверно
    return { error: "Неверный логин или пароль." };
  }

  resetLoginAttempts(key);
  await startSession(username);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  if (!(await sameOrigin())) return; // чужой сайт не должен разлогинивать админа
  await endSession();
  redirect("/admin/login");
}
