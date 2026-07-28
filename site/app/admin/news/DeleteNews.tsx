"use client";

// Удаление новости с подтверждением в два шага (Task B3 → доработка).
// Раньше кнопка удаляла с первого клика: промах мышью стоил новости и её обложки, отмены нет.
// Диалог браузера не используем — он выпадает из оформления и на мобильных выглядит чужеродно.
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteNews, type NewsFormState } from "./actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-[36px] rounded-[5px] bg-red-600 px-[14px] text-[13px] font-bold text-white transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98] disabled:opacity-70"
    >
      {pending ? "Удаляем…" : "Да, удалить"}
    </button>
  );
}

export default function DeleteNews({ slug, title }: { slug: string; title: string }) {
  const [armed, setArmed] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [state, action] = useActionState<NewsFormState, FormData>(deleteNews, undefined);

  // Подтверждение живёт 6 секунд: если пользователь отвлёкся, кнопка сама возвращается
  // в безопасное состояние и следующий клик уже ничего не удалит.
  // Отказ с сервера подтверждение НЕ снимает: иначе сообщение исчезло бы вместе с формой,
  // не успев прочитаться.
  useEffect(() => {
    if (!armed || state?.error) return;
    cancelRef.current?.focus();
    const t = setTimeout(() => setArmed(false), 6000);
    return () => clearTimeout(t);
  }, [armed, state?.error]);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        aria-label={`Удалить новость «${title}»`}
        className="h-[36px] rounded-[5px] border border-hairline px-[14px] text-[13px] text-red-600 transition-colors duration-200 ease-motion hover:border-red-300 hover:bg-red-50"
      >
        Удалить
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-[6px]">
      <form action={action} className="flex items-center gap-[8px]">
        <input type="hidden" name="slug" value={slug} />
        <ConfirmButton />
        <button
          ref={cancelRef}
          type="button"
          onClick={() => setArmed(false)}
          className="h-[36px] rounded-[5px] border border-hairline px-[14px] text-[13px] text-ink transition-colors duration-200 ease-motion hover:bg-white"
        >
          Отмена
        </button>
      </form>
      {state?.error && (
        <p role="alert" className="max-w-[320px] text-right text-[12px] leading-[17px] text-red-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
