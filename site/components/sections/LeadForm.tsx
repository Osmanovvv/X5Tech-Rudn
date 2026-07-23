// «Оставь заявку» — секция 271:2238 (полноширинная 1200×850). Слева фото, справа карточка-форма.
// Функциональная форма (client): поля имя/фамилия/почта/телефон/комментарий, 2 чекбокса согласий,
// кнопка. Отправка на site.leadEndpoint (пока null → локальный экран «спасибо»). id=forma (якорь навигации).
"use client";
import { useState, type FormEvent } from "react";
import { asset } from "@/lib/asset";
import site from "@/content/site.json";

const photo = asset("/img/12-forma/image2090011425-893213cd-1024w.webp");
const leadEndpoint = (site as { leadEndpoint: string | null }).leadEndpoint;

function Field({
  name,
  label,
  placeholder,
  type = "text",
  required,
  half,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  half?: boolean;
}) {
  return (
    <div className={half ? "" : "w-full"}>
      <label
        htmlFor={name}
        className="mb-[5px] block text-[12px] text-[rgba(39,39,39,0.85)] lg:text-[10px] lg:uppercase"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-[42px] w-full rounded-[5px] border border-[#f5f5f5] bg-white px-[14px] text-[13px] text-ink outline-none placeholder:text-[rgba(39,39,39,0.55)] focus:border-[#b6e835]"
      />
    </div>
  );
}

function Consent({ name, required, children }: { name: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-[10px] text-[12px] leading-[16px] text-ink">
      <input
        type="checkbox"
        name={name}
        required={required}
        className="mt-[1px] size-[18px] shrink-0 cursor-pointer rounded-[3px] border border-black accent-[#b6e835]"
      />
      <span>{children}</span>
    </label>
  );
}

export default function LeadForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      if (leadEndpoint) {
        const res = await fetch(leadEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error();
      }
      setSent(true);
      form.reset();
    } catch {
      setError("Не удалось отправить. Попробуйте позже или напишите на ai-priem@rudn.ru.");
    }
  }

  return (
    <section id="forma" aria-label="Оставь заявку" className="bg-white">
      <div className="mx-auto max-w-[1200px] px-[15px] py-[30px] lg:px-[40px] lg:pb-[48px] lg:pt-[40px]">
        <h2 className="text-[22px] font-bold leading-[26px] tracking-[-0.5px] text-ink lg:text-[40px] lg:leading-[normal] lg:tracking-[-0.88px]">
          Оставь заявку – расскажем, как поступить
        </h2>

        <div className="mt-[20px] flex flex-col gap-[20px] lg:mt-[20px] lg:flex-row lg:gap-[30px]">
          {/* Фото */}
          <div className="overflow-hidden rounded-[15px] lg:h-[662px] lg:w-[581px] lg:shrink-0">
            <img
              src={photo}
              alt="Абитуриентка оставляет заявку на программу"
              className="size-full object-cover"
              style={{ aspectRatio: "581 / 662" }}
            />
          </div>

          {/* Карточка-форма */}
          <div className="rounded-[15px] border border-[#eee] bg-[#fcfcfc] p-[24px] lg:flex-1 lg:px-[36px] lg:py-[46px]">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-[40px] text-center">
                <p className="text-[20px] font-bold text-ink">Спасибо, заявка отправлена!</p>
                <p className="mt-[8px] text-[14px] text-[rgba(39,39,39,0.85)]">
                  Менеджер приёмной комиссии свяжется с тобой в течение дня.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <p className="whitespace-pre-line text-[18px] font-medium leading-[normal] text-ink">
                  {"Менеджер приёмной комиссии\nсвяжется с тобой в течение дня"}
                </p>

                <div className="mt-[20px] flex flex-col gap-[19px]">
                  <div className="flex flex-col gap-[19px] lg:flex-row lg:gap-[10px]">
                    <Field name="name" label="Ваше имя" placeholder="Иван" required half />
                    <Field name="surname" label="Фамилия" placeholder="Иванов" half />
                  </div>
                  <Field name="email" label="Электронная почта" placeholder="test@mail.ru" type="email" required />
                  <Field name="phone" label="Телефон" placeholder="+7 900 123 45 67" type="tel" required />
                  <div>
                    <label
                      htmlFor="comment"
                      className="mb-[5px] block text-[12px] text-[rgba(39,39,39,0.85)] lg:text-[10px] lg:uppercase"
                    >
                      Комментарий/вопрос
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      placeholder="напишите, что-нибудь (не обязательно)"
                      className="h-[100px] w-full resize-none rounded-[5px] border border-[#f5f5f5] bg-white px-[14px] py-[12px] text-[13px] text-ink outline-none placeholder:text-[rgba(39,39,39,0.55)] focus:border-[#b6e835]"
                    />
                  </div>
                </div>

                <div className="mt-[20px] flex flex-col gap-[16px]">
                  <Consent name="consent_pd" required>
                    Я выражаю{" "}
                    <span className="text-[#3b63c9]">Согласие на обработку персональных данных X5 Tech</span>
                  </Consent>
                  <Consent name="consent_ads">
                    Я выражаю{" "}
                    <span className="text-[#3b63c9]">
                      Согласие на получение рассылок информационного и рекламного содержания от X5 Tech
                    </span>
                  </Consent>
                </div>

                {error && <p className="mt-[12px] text-[12px] text-red-600">{error}</p>}

                <button
                  type="submit"
                  className="mt-[24px] h-[60px] w-full rounded-[5px] bg-lime text-[14px] font-bold text-ink transition-[filter] hover:brightness-95 lg:w-[242px]"
                >
                  Отправить заявку
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
