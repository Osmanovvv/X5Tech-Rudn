"use client";

// Форма входа в админку (Task B2). Клиентский компонент только ради состояния ошибки и
// индикации отправки; сама проверка пароля — в Server Action (см. ../actions.ts).
import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <form action={action} className="mt-[24px] flex flex-col gap-[16px]">
      <div>
        <label htmlFor="username" className="mb-[6px] block text-[12px] text-[rgba(39,39,39,0.85)]">
          Логин
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className="h-[44px] w-full rounded-[5px] border border-[#e6e6e6] bg-white px-[14px] text-[14px] text-ink outline-none transition-colors duration-200 ease-motion focus:border-[#b6e835]"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-[6px] block text-[12px] text-[rgba(39,39,39,0.85)]">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-[44px] w-full rounded-[5px] border border-[#e6e6e6] bg-white px-[14px] text-[14px] text-ink outline-none transition-colors duration-200 ease-motion focus:border-[#b6e835]"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-[13px] text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-[4px] h-[48px] rounded-[5px] bg-lime text-[14px] font-bold text-ink transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
