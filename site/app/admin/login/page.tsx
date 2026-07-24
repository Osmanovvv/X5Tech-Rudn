// Страница входа в админку (Task B2). Динамическая: читает куку сессии.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigured, currentAdmin } from "@/lib/server/auth";
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
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-[20px] py-[60px]">
      <div className="w-full max-w-[380px] rounded-[15px] border border-hairline bg-paper p-[28px]">
        <h1 className="text-[22px] font-bold tracking-[-0.4px] text-ink">Админка сайта</h1>
        <p className="mt-[6px] text-[13px] text-[rgba(39,39,39,0.72)]">
          Управление новостями и заявками
        </p>

        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className="mt-[20px] rounded-[8px] bg-white p-[14px] text-[13px] leading-[20px] text-ink">
            Админка ещё не настроена. Задайте в <code>.env</code> переменные{" "}
            <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD_HASH</code> и{" "}
            <code>SESSION_SECRET</code> — см. README, раздел «Деплой на VPS».
          </p>
        )}
      </div>
    </main>
  );
}
