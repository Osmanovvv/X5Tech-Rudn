// Страница входа в админку (Task B2). Динамическая: читает куку сессии.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminConfigured, currentAdmin } from "@/lib/server/auth";
import { AdminLogo } from "../AdminShell";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Вход — админка",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Уже вошли — незачем показывать форму
  if (await currentAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-[20px] py-[40px]">
      <div className="w-full max-w-[400px]">
        <AdminLogo className="justify-center" />

        <div className="mt-[24px] rounded-[15px] border border-hairline bg-paper p-[28px]">
          <h1 className="text-[22px] font-bold tracking-[-0.4px] text-ink">Панель управления</h1>
          <p className="mt-[6px] text-[13px] leading-[19px] text-[rgba(39,39,39,0.72)]">
            Новости сайта и заявки с формы
          </p>

          {adminConfigured() ? (
            <LoginForm />
          ) : (
            <p className="mt-[20px] rounded-[8px] bg-white p-[14px] text-[13px] leading-[20px] text-ink">
              Админка ещё не настроена. Задайте в <code>.env</code> переменные{" "}
              <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD_HASH</code> и{" "}
              <code>SESSION_SECRET</code> — порядок описан в README, раздел «Развёртывание
              на сервере».
            </p>
          )}
        </div>

        <p className="mt-[18px] text-center text-[13px]">
          <Link
            href="/"
            className="text-[rgba(39,39,39,0.72)] underline underline-offset-2 transition-colors duration-200 ease-motion hover:text-ink"
          >
            ← Вернуться на сайт
          </Link>
        </p>
      </div>
    </main>
  );
}
