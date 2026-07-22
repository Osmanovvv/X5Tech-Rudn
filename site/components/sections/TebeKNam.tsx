// «Тебе к нам, если ты» — секция 271:1818 (1200×602), мобильная зона 884–2264.
// Ленты пока статичны (анимация — Фаза 3, Task 3.1). Порядок слоёв: ленты поверх карточек.
import { asset } from "@/lib/asset";

// Переносы строк — точно как в мобильном эталоне макета
const MOBILE_TEXTS = [
  "Обладаешь базой\nв математике и алгоритмах для\nсоздания алгоритмов будущего",
  "Хочешь получить реальный опыт в X5\nTech и строить карьеру в крупнейших\nIT-компаниях с первого курса",
  "Готов к высокому темпу:\nкогда учебный план диктует\nне только университет,\nно и бэклог реального бизнеса",
  "Попадаешь в комьюнити\nамбициозных студентов\nи ищешь среду, где рядом такие\nже заряженные кодеры\nи практикующие лиды",
];
const MOBILE_TEXT_W = [217, 244, 227, 227];

const CARDS = [
  {
    img: "rectangle2-efc959bc",
    text: (
      <>
        Обладаешь базой <br />в математике и алгоритмах для создания алгоритмов будущего
      </>
    ),
  },
  {
    img: "rectangle4-1961647e",
    text: (
      <>
        Хочешь получить реальный опыт в X5 Tech и строить карьеру <br />в крупнейших IT-компаниях{" "}
        <br />с первого курса
      </>
    ),
  },
  {
    img: "rectangle3-ce94c9f1",
    text: (
      <>
        Готов к высокому темпу: <br />
        когда учебный план диктует <br />
        не только университет, <br />
        но и бэклог реального бизнеса
      </>
    ),
  },
  {
    img: "rectangle5-f1b08240",
    text: (
      <>
        Попадаешь в комьюнити амбициозных студентов <br />и ищешь среду, где рядом такие же
        заряженные кодеры <br />и практикующие лиды
      </>
    ),
  },
] as const;

function RibbonPill() {
  return (
    <span className="flex h-[36px] w-[271px] shrink-0 items-center rounded-full bg-lime pl-[20px] text-[12px] font-bold text-ink">
      РУДН × X5 TECH • БАКАЛАВРИАТ ИИ
    </span>
  );
}

export default function TebeKNam() {
  return (
    <section aria-label="Тебе к нам, если ты">
      {/* ===== Десктоп: калька 1200×602 ===== */}
      <div className="relative mx-auto hidden h-[602px] max-w-[1200px] overflow-hidden bg-white lg:block">
        <h2 className="absolute left-[40px] top-[76px] text-[42px] font-bold leading-[normal] tracking-[-1.26px] text-ink">
          Тебе к нам, если ты
        </h2>
        <img
          src={asset("/img/02-tebe-k-nam/vector1-dec88355.svg")}
          alt=""
          aria-hidden
          className="absolute left-[278px] top-[125px] h-[2px] w-[160px] max-w-none"
        />

        {[40, 320, 610, 900].map((left, i) => (
          <div
            key={left}
            className="absolute top-[156px] h-[300px] w-[260px] rounded-[18px] border border-hairline bg-paper"
            style={{ left }}
          >
            {/* Плашка — нижний слой (child 0 в макете), фото рисуется поверх неё */}
            {i === 3 && (
              <div className="absolute left-0 top-[176px] h-[123px] w-full rounded-[18px] bg-paper/60 backdrop-blur-[5px]" />
            )}
            <img
              src={asset(`/img/02-tebe-k-nam/${CARDS[i].img}-520w.webp`)}
              alt=""
              className="relative h-[182px] w-full rounded-[18px] object-cover"
            />
            <p
              className="absolute left-[20px] w-[220px] -translate-y-1/2 text-[13px] leading-[normal] text-ink"
              style={{ top: i === 3 ? 240 : 232 }}
            >
              {CARDS[i].text}
            </p>
          </div>
        ))}

        {/* Лента: полоса-фон, по ней ряд капсул (одна конструкция; анимация в Фазе 3) */}
        <div className="absolute left-[-48px] top-[474px] flex h-[103px] w-[1310px] rotate-[-2.58deg] items-center">
          <div className="absolute inset-x-0 top-1/2 h-[44px] -translate-y-1/2 bg-lime" />
          <div className="relative flex gap-[13.4px] pl-[67px]">
            <RibbonPill />
            <RibbonPill />
            <RibbonPill />
            <RibbonPill />
          </div>
        </div>
      </div>

      {/* ===== Мобильная: флоу по узлам 884–2264 ===== */}
      <div className="relative overflow-hidden bg-white lg:hidden">
        <h2 className="ml-[15px] pt-[30px] text-[22px] font-bold leading-[26px] text-ink">
          Тебе к нам, если ты
        </h2>
        <img
          src={asset("/img/02-tebe-k-nam/vector1-dec88355.svg")}
          alt=""
          aria-hidden
          className="ml-[134px] mt-[1px] h-[2px] w-[80px]"
        />
        <div className="mx-[15px] mt-[20px] flex flex-col gap-[15px]">
          {CARDS.map((card, i) => (
            <div
              key={card.img}
              className="relative rounded-[18px] border border-hairline bg-paper"
              style={{ height: [280, 290, 290, 300][i] }}
            >
              {/* Плашка — нижний слой (child 0 в макете), фото поверх */}
              {i === 3 && (
                <div className="absolute left-0 top-[177px] h-[123px] w-full rounded-[18px] bg-paper/60 backdrop-blur-[5px]" />
              )}
              <img
                src={asset(`/img/02-tebe-k-nam/${card.img}-640w.webp`)}
                alt=""
                className="relative h-[190px] w-full rounded-[18px] object-cover"
              />
              <p
                className="absolute top-[210px] whitespace-pre-line text-[12px] leading-[14px] text-ink"
                style={{ left: i === 0 ? 21 : 20, width: MOBILE_TEXT_W[i] }}
              >
                {MOBILE_TEXTS[i]}
              </p>
            </div>
          ))}
        </div>
        {/* Нижняя лента: та же конструкция */}
        <div className="relative h-[96px] overflow-hidden">
          <div className="absolute left-[-200px] top-[8px] flex h-[80px] w-[900px] rotate-[-2.58deg] items-center">
            <div className="absolute inset-x-0 top-1/2 h-[44px] -translate-y-1/2 bg-lime" />
            <div className="relative flex gap-[13.4px] pl-[62px]">
              <RibbonPill />
              <RibbonPill />
              <RibbonPill />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
