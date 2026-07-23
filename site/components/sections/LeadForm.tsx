// «Оставь заявку» — секция 271:2238 (полноширинная 1200×850). Слева фото, справа карточка-форма.
// Функциональная форма (client): поля имя/фамилия/почта/телефон/комментарий, 2 чекбокса согласий,
// кнопка. Отправка на site.leadEndpoint (пока null → локальный экран «спасибо»). id=forma (якорь навигации).
"use client";
import { useState, type FormEvent } from "react";
import { asset } from "@/lib/asset";
import site from "@/content/site.json";

const photo = asset("/img/12-forma/image2090011425-893213cd-1024w.webp");
const leadEndpoint = (site as { leadEndpoint: string | null }).leadEndpoint;
// Почта приёмной комиссии берётся из site.json, чтобы адрес не жил в двух местах
const contactEmail =
  site.footer.contacts.find((c) => c.href.startsWith("mailto:"))?.href.replace("mailto:", "") ??
  "ai-priem@rudn.ru";

// Маска российского телефона: любые цифры → «+7 900 123 45 67». 8/пустой ведущий → 7.
function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits[0] === "8") digits = "7" + digits.slice(1);
  if (digits[0] !== "7") digits = "7" + digits;
  const rest = digits.slice(1, 11); // до 10 цифр после «7»
  let out = "+7";
  if (rest.length) out += " " + rest.slice(0, 3);
  if (rest.length > 3) out += " " + rest.slice(3, 6);
  if (rest.length > 6) out += " " + rest.slice(6, 8);
  if (rest.length > 8) out += " " + rest.slice(8, 10);
  return out;
}

function Field({
  name,
  label,
  placeholder,
  type = "text",
  required,
  half,
  onInput,
  inputMode,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  half?: boolean;
  onInput?: (e: FormEvent<HTMLInputElement>) => void;
  inputMode?: "text" | "tel" | "email" | "numeric";
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
        inputMode={inputMode}
        required={required}
        placeholder={placeholder}
        onInput={onInput}
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
  // idle → pending → sent | error;  notice — эндпойнт не настроен (заявка НЕ отправлена)
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "notice" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Приёмник заявок не подключён — честно об этом говорим, а не показываем «Спасибо»
    if (!leadEndpoint) {
      console.log("[LeadForm] заявка НЕ отправлена: leadEndpoint не настроен. Данные формы:", data);
      setStatus("notice");
      return;
    }

    setStatus("pending");
    try {
      const res = await fetch(leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setError(`Не удалось отправить. Попробуйте ещё раз или напишите на ${contactEmail}.`);
    }
  }

  return (
    <section id="forma" aria-label="Оставь заявку" className="bg-white">
      <div className="mx-auto max-w-[1200px] px-[15px] py-[30px] lg:px-[40px] lg:pb-[48px] lg:pt-[40px]">
        <h2 className="text-[22px] font-bold leading-[26px] tracking-[-0.5px] text-ink lg:text-[40px] lg:leading-[normal] lg:tracking-[-0.88px]">
          Оставь заявку – расскажем, как поступить
        </h2>

        <div className="mt-[20px] flex flex-col gap-[20px] lg:mt-[40px] lg:flex-row lg:gap-[30px]">
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
            {status === "sent" ? (
              <div className="flex h-full flex-col items-center justify-center py-[40px] text-center">
                <p className="text-[20px] font-bold text-ink">Спасибо, заявка отправлена!</p>
                <p className="mt-[8px] text-[14px] text-[rgba(39,39,39,0.85)]">
                  Менеджер приёмной комиссии свяжется с тобой в течение дня.
                </p>
              </div>
            ) : status === "notice" ? (
              <div className="flex h-full flex-col items-center justify-center py-[40px] text-center">
                <p className="text-[20px] font-bold text-ink">Отправка заявок пока не подключена</p>
                <p className="mt-[8px] text-[14px] text-[rgba(39,39,39,0.85)]">
                  Приём заявок с сайта скоро заработает. Пока напишите нам на{" "}
                  <a href={`mailto:${contactEmail}`} className="font-medium text-[#3b63c9] underline">
                    {contactEmail}
                  </a>{" "}
                  — ответим и всё расскажем.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-[20px] h-[45px] rounded-[5px] border border-[#eee] px-[24px] text-[13px] font-bold text-ink hover:bg-[#f5f5f5]"
                >
                  Вернуться к форме
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <p className="whitespace-pre-line text-[14px] font-medium leading-[normal] text-ink lg:text-[18px]">
                  {"Менеджер приёмной комиссии\nсвяжется с тобой в течение дня"}
                </p>

                <div className="mt-[20px] flex flex-col gap-[19px]">
                  <div className="flex flex-col gap-[19px] lg:flex-row lg:gap-[10px]">
                    <Field name="name" label="Ваше имя" placeholder="Иван" required half />
                    <Field name="surname" label="Фамилия" placeholder="Иванов" half />
                  </div>
                  <Field name="email" label="Электронная почта" placeholder="test@mail.ru" type="email" required />
                  <Field
                    name="phone"
                    label="Телефон"
                    placeholder="+7 900 123 45 67"
                    type="tel"
                    inputMode="tel"
                    required
                    onInput={(e) => {
                      e.currentTarget.value = formatPhone(e.currentTarget.value);
                    }}
                  />
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
                  disabled={status === "pending"}
                  className="mt-[24px] h-[60px] w-full rounded-[5px] bg-lime text-[14px] font-bold text-ink transition-[filter] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 lg:w-[242px]"
                >
                  {status === "pending" ? "Отправляем…" : "Отправить заявку"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
