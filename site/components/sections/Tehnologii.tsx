// «Прикоснись к технологиям» — секция 271:2158 (полноширинная 1200×545, белый фон).
// Заголовок + лого X5 Tech + подзаголовок + 4 карточки-направления с 3D-иллюстрациями (повороты/кропы по ctx).
// Карточка едина для десктопа и мобилы: aspect-square + проценты. Контент фиксированный — инлайн.
import { asset } from "@/lib/asset";

const img = (name: string) => asset(`/img/09-tehnologii/${name}`);

const CARDS = [
  { left: 40, title: "Машинное обучение\nв ритейле", spec: "Прогноз спроса, персонализация,\nуправление цепочками" },
  { left: 325, title: "ИИ-\nпродукты", spec: "Сервисы для миллионов\nпокупателей" },
  { left: 610, title: "ИИ-\nкодинг", spec: "Помощники разработчика\nи автоматизация" },
  { left: 895, title: "Компьютерное\nзрение", spec: "Распознавание товаров\nи контроль полок" },
];

// Иллюстрации карточек (проценты от 270×270; трансформы из ctx)
function Illu({ i, mobile }: { i: number; mobile?: boolean }) {
  if (i === 0)
    return (
      <>
        <img
          src={img("image2090011460-4d9d1c9b-640w.webp")}
          alt=""
          aria-hidden
          className="absolute left-[7%] top-[14.1%] w-[37%] max-w-none rotate-180 -scale-y-100"
        />
        {!mobile && (
          <img
            src={img("arrow5-62744316.svg")}
            alt=""
            aria-hidden
            className="absolute left-[81.1%] top-[8.9%] h-[5.45%] w-[11.1%]"
          />
        )}
      </>
    );
  if (i === 1)
    return (
      <div className="absolute left-[6.7%] top-[10%] h-[48.9%] w-[41.9%] overflow-hidden">
        <img
          src={img("image2090011464-e4a32506-640w.webp")}
          alt=""
          aria-hidden
          className="absolute max-w-none"
          style={{ height: "126.22%", left: "-18.01%", top: "-15.64%", width: "135.11%" }}
        />
      </div>
    );
  if (i === 2)
    return (
      <>
        <img
          src={img("dop-materials-green-plastic-93d1a6d4-640w.webp")}
          alt=""
          aria-hidden
          className="absolute left-[16.3%] top-[15.9%] h-[38.1%] w-[37.8%] max-w-none -rotate-90 -scale-y-100"
        />
        <div className="absolute left-[24.8%] top-[14.1%] size-[34.1%] overflow-hidden">
          <img
            src={img("dop-elements-control-purple-210de6ae-640w.webp")}
            alt=""
            aria-hidden
            className="absolute max-w-none"
            style={{ left: "-7.41%", top: "-2.96%", width: "114.81%", height: "114.81%" }}
          />
        </div>
      </>
    );
  return (
    <>
      <img
        src={img("image2090011509-efbdc704-640w.webp")}
        alt=""
        aria-hidden
        className="absolute left-[-1.1%] top-[8.9%] h-[52.6%] w-[70.4%] max-w-none object-cover"
      />
      <div className="absolute left-[38.3%] top-[22.6%] size-[23.2%] rotate-30 -scale-y-100 overflow-hidden rounded-[36px]">
        <img
          src={img("image2090011468-11be8c2c-640w.webp")}
          alt=""
          aria-hidden
          className="absolute max-w-none"
          style={{ left: "-29.45%", top: "-55.57%", width: "157.91%", height: "157.91%" }}
        />
      </div>
    </>
  );
}

function TechCard({ i, mobile }: { i: number; mobile?: boolean }) {
  const c = CARDS[i];
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-[15px] bg-paper">
      <Illu i={i} mobile={mobile} />
      <p className="absolute left-[7%] top-[58.9%] whitespace-pre-line text-[18px] font-bold leading-[18px] tracking-[-0.175px] text-ink">
        {c.title}
      </p>
      <p className="absolute left-[7%] top-[77.8%] whitespace-pre-line text-[12px] leading-[normal] text-ink">
        {c.spec}
      </p>
    </div>
  );
}

export default function Tehnologii() {
  return (
    <section aria-label="Прикоснись к технологиям" className="mt-[70px] bg-white">
      {/* ===== Десктоп: калька 1200×545 ===== */}
      <div className="relative mx-auto hidden h-[545px] w-[1200px] lg:block">
        <h2 className="absolute left-[40px] top-[56px] text-[40px] font-bold leading-[43.2px] tracking-[-0.88px] text-ink">
          Прикоснись к технологиям
        </h2>
        <img
          src={img("x5tech-logo.webp")}
          alt="X5 Tech"
          className="absolute left-[610px] top-[60px] h-[33px] w-auto"
        />
        <p className="absolute left-[40px] top-[113px] whitespace-pre-line text-[16px] leading-[20px] text-[rgba(39,39,39,0.85)]">
          {"Вот несколько направлений над которыми работает\nбольшая команда инженеров компании"}
        </p>
        {CARDS.map((c, i) => (
          <div key={i} className="absolute top-[203px] w-[270px]" style={{ left: c.left }}>
            <TechCard i={i} />
          </div>
        ))}
      </div>

      {/* ===== Мобильная: вертикальный стек ===== */}
      <div className="bg-white px-[15px] pb-[30px] pt-[30px] lg:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold leading-[26px] tracking-[-0.5px] text-ink">
            Прикоснись
            <br />к технологиям
          </h2>
          <img
            src={img("x5tech-logo.webp")}
            alt="X5 Tech"
            className="h-[26px] w-auto shrink-0"
          />
        </div>
        <p className="mt-[10px] whitespace-pre-line text-[12px] leading-[18px] text-[rgba(39,39,39,0.85)]">
          {"Вот несколько направлений над которыми\nработает большая команда инженеров\nкомпании"}
        </p>
        <div className="mt-[20px] flex flex-col gap-[20px]">
          {CARDS.map((_, i) => (
            <TechCard key={i} i={i} mobile />
          ))}
        </div>
      </div>
    </section>
  );
}
