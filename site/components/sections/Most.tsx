// «X5 Tech — мост в реальную ИИ-практику» — секция 271:2145 (полноширинная 1200×599, лавандовый фон).
// Слева: лейбл, заголовок, подзаголовок, карточка-цитата Неверова. Справа: hero-стат 24 000+ и три стата.
// Мобильная — вертикальный стек. Контент секции фиксированный (не повторяющийся список) — инлайн.
import { asset } from "@/lib/asset";

const avatar = asset("/img/08-x5-most/image2090011510-1f336806-80w.webp");

// Три «малых» стата: жирное число + описание (десктопные переносы)
const STATS = [
  { num: "18 Пб", text: " Объём хранения\nкластера больших данных", top: 258 },
  { num: "6 000+", text: " IT-специалистов\nв команде", top: 366 },
  { num: "83 млн", text: " Участников программы\nлояльности Х5 взаимодействуют\nс нашими решениями", top: 452 },
];
// Мобильные версии (число + подпись с переносами)
const STATS_M = [
  { num: "24 000+", text: "магазинов в экосистеме Х5" },
  { num: "18 Пб", text: "Объём хранения кластера больших данных" },
  { num: "6 000+", text: "IT-специалистов в команде" },
  { num: "83 млн", text: "Участников программы лояльности\nвзаимодействуют с нашими решениями" },
];

function QuoteCard({ mobile }: { mobile?: boolean }) {
  return (
    <div
      className={`rounded-[16px] border border-l-[3px] border-[#b6e835] bg-white/85 ${
        mobile ? "relative p-[24px]" : "absolute left-[40px] top-[325px] h-[170px] w-[560px]"
      }`}
    >
      <p
        className={`whitespace-pre-line leading-[normal] text-ink ${
          mobile ? "text-[12px]" : "absolute left-[24px] top-[27px] right-[11px] text-[16px]"
        }`}
      >
        {mobile
          ? "Нам нужны инженеры, которые умеют\nдоводить модели до продукта.\nСтуденты программы начнут это\nделать раньше остальных — на наших\nзадачах, вместе с нашими командами."
          : "Нам нужны инженеры, которые умеют доводить модели\nдо продукта. Студенты программы начнут это делать раньше остальных — на наших задачах, вместе с нашими командами."}
      </p>
      <div className={mobile ? "mt-[20px] flex items-center gap-[12px]" : ""}>
        <img
          src={avatar}
          alt="Михаил Неверов"
          className={`size-[40px] rounded-[5px] object-cover ${mobile ? "" : "absolute left-[24px] top-[96px]"}`}
        />
        <div className={mobile ? "" : "contents"}>
          <p
            className={`text-[14px] font-bold text-ink ${
              mobile ? "" : "absolute left-[76px] top-[100px]"
            }`}
          >
            Михаил Неверов
          </p>
          <p
            className={`whitespace-pre-line text-[12px] leading-[normal] text-[rgba(39,39,39,0.85)] ${
              mobile ? "mt-[2px]" : "absolute left-[76px] top-[123px]"
            }`}
          >
            {mobile
              ? "Директор по развитию\nискусственного интеллекта\nв X5 Tech"
              : "Директор по развитию искусственного интеллекта в X5 Tech"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Most() {
  return (
    <section aria-label="X5 Tech — мост в реальную ИИ-практику" className="mt-[70px] bg-[#ebeaff]">
      {/* ===== Десктоп: калька 1200×599 ===== */}
      <div className="relative mx-auto hidden h-[599px] w-[1200px] lg:block">
        <p className="absolute left-[40px] top-[97px] font-mono text-[12px] uppercase text-ink">
          СТРАТЕГИЧЕСКИЙ ПАРТНЕР
        </p>
        <h2 className="absolute left-[40px] top-[125px] text-[40px] font-bold leading-[43.2px] tracking-[-0.88px] text-ink">
          {"X5 Tech — мост в реальную"}
          <br />
          ИИ-практику
        </h2>
        <p className="absolute left-[40px] top-[236px] whitespace-pre-line text-[16px] leading-[20px] text-[rgba(39,39,39,0.85)]">
          {"X5 Tech — технологический центр X5, крупнейшего ритейлера\nРоссии. ИИ тут — инструмент, который обеспечивает работу\n24 000+ магазинов и сотен тысяч сотрудников."}
        </p>
        <QuoteCard />

        {/* Правая колонка — статы */}
        <p className="absolute left-[752px] top-[100px] w-[373px] text-center text-[87px] font-bold leading-none text-ink">
          24 000+
        </p>
        <p className="absolute left-[755px] top-[182px] w-[367px] text-center text-[26px] text-ink">
          магазинов в экосистеме Х5
        </p>
        {STATS.map((s) => (
          <p
            key={s.num}
            className="absolute left-[755px] w-[401px] whitespace-pre-line text-[22px] leading-[28px] text-ink"
            style={{ top: s.top }}
          >
            <span className="text-[26px] font-bold">{s.num}</span>
            {s.text}
          </p>
        ))}
      </div>

      {/* ===== Мобильная: вертикальный стек ===== */}
      <div className="px-[15px] pb-[30px] pt-[30px] lg:hidden">
        <p className="font-mono text-[11px] uppercase text-ink">СТРАТЕГИЧЕСКИЙ ПАРТНЕР</p>
        <h2 className="mt-[12px] text-[20px] font-bold leading-[25px] tracking-[-0.5px] text-ink">
          {"X5 Tech — мост в реальную"}
          <br />
          ИИ-практику
        </h2>
        <p className="mt-[12px] whitespace-pre-line text-[12px] leading-[18px] text-[rgba(39,39,39,0.85)]">
          {"X5 Tech — технологический центр X5,\nкрупнейшего ритейлера России. ИИ тут —\nинструмент, который обеспечивает работу\n24 000+ магазинов и сотен тысяч сотрудников."}
        </p>

        <div className="mt-[24px] flex flex-col gap-[20px]">
          {STATS_M.map((s) => (
            <div key={s.num}>
              <p className="text-[26px] font-bold leading-none text-ink">{s.num}</p>
              <p className="mt-[8px] whitespace-pre-line text-[12px] leading-[16px] text-ink">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-[24px]">
          <QuoteCard mobile />
        </div>
      </div>
    </section>
  );
}
