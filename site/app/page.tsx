// ВРЕМЕННАЯ страница-витрина токенов (чекпойнт Фазы 0).
// Заменяется на лендинг по мере вёрстки секций (Фазы 1–2).
const swatches = [
  ["ink", "bg-ink", "#272727"],
  ["lime", "bg-lime", "#B6E835"],
  ["lime-deep", "bg-lime-deep", "#99C726"],
  ["lime-soft", "bg-lime-soft", "#C7E047"],
  ["lavender", "bg-lavender", "#EBEAFF"],
  ["paper", "bg-paper", "#FAFAFA"],
  ["mist", "bg-mist", "#F1F1F1"],
  ["card", "bg-card", "#FCFCFC"],
] as const;

export default function Home() {
  return (
    <main className="container-site py-16 space-y-12">
      <section>
        <p className="font-mono text-xs uppercase tracking-wide border border-lime rounded-full inline-block px-5 py-2">
          На реальных данных
        </p>
        <h1 className="mt-6 text-[42px] leading-[42.8px] tracking-[-0.03em] font-bold">
          Изучай ИИ,
          <br />
          входи в профессию
          <br />
          вместе с X5 Tech
        </h1>
        <p className="mt-4 text-[13px]">
          Факультет искусственного интеллекта РУДН — витрина дизайн-токенов
          (шрифт временно Inter, ждём X5 Sans)
        </p>
        <div className="mt-6 flex gap-4">
          <a
            href="#"
            className="bg-lime-deep text-white text-sm font-bold rounded-[5px] px-11 py-5"
          >
            Отправить заявку →
          </a>
          <a
            href="#"
            className="bg-lime text-ink text-[13px] font-bold rounded-full px-7 py-5"
          >
            Подать заявку
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-medium mb-4">Палитра</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {swatches.map(([name, cls, hex]) => (
            <div key={name} className="rounded-xl border border-hairline overflow-hidden">
              <div className={`${cls} h-20`} />
              <div className="p-3 text-[13px]">
                <div className="font-medium">{name}</div>
                <div className="text-black/50">{hex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
