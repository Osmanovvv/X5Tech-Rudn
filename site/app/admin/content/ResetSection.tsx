"use client";

// Возврат раздела к исходному содержимому из макета. Отдельной кнопкой, с подтверждением:
// действие затирает все правки редактора, и случайный клик тут дорого стоит.
import { useState, useTransition } from "react";
import { resetSection, type ContentFormState } from "./actions";
import type { SectionKey } from "@/lib/server/content-store";
import { Result } from "./ui";

export default function ResetSection({ section }: { section: SectionKey }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ContentFormState>(undefined);

  return (
    <div className="mt-[24px] rounded-[12px] border border-[#e6e6e6] bg-[#fafafa] p-[16px]">
      <p className="text-[13px] font-bold text-ink">Вернуть содержимое из макета</p>
      <p className="mt-[4px] text-[12px] leading-[18px] text-[rgba(39,39,39,0.6)]">
        Все правки этого раздела будут заменены исходным вариантом, с которым сайт был сдан.
        Остальные разделы не затрагиваются.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Вернуть исходное содержимое раздела? Внесённые правки будут потеряны.")) return;
          start(async () => setState(await resetSection(section)));
        }}
        className="mt-[12px] inline-flex h-[38px] items-center rounded-[5px] border border-[#e6e6e6] bg-white px-[16px] text-[12px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-[#f5f5f5] disabled:opacity-50"
      >
        {pending ? "Возвращаю…" : "Вернуть как в макете"}
      </button>
      <div className="mt-[12px]">
        <Result state={state} />
      </div>
    </div>
  );
}
