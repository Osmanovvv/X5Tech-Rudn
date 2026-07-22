// «Программа даёт» — секция 271:1844 (1200×602), мобильная зона 2264–3607.
// Bento: лавандовая карта #F0EFFF (свой оттенок, не EBEAFF!) + 5 карточек с иллюстрациями-кропами.
// Кропы иллюстраций воспроизводят трансформы макета дословно (ctx-03).
import { asset } from "@/lib/asset";

const A = "/img/03-programma-daet";

/* Иллюстрации карточек: кропы из ctx (проценты — от контейнера) */
function BlobColorGlass({ size, deg }: { size: number; deg: number }) {
  const src = asset(`${A}/meha-materials-color-glass-853d880e-130w.webp`);
  return (
    <span className="relative block" style={{ width: size, height: size, rotate: `${deg}deg` }}>
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {/* hue-тон только по форме блоба: маска альфой той же картинки */}
      <span
        className="absolute inset-0 bg-lime-soft mix-blend-hue"
        style={{ maskImage: `url(${src})`, maskSize: "100% 100%", WebkitMaskImage: `url(${src})`, WebkitMaskSize: "100% 100%" }}
      />
    </span>
  );
}
function PurpleControl({ size }: { size: number }) {
  return (
    <span className="relative block overflow-hidden" style={{ width: size, height: size }}>
      <img
        src={asset(`${A}/dop-elements-control-purple-a11b7e3e-${size > 100 ? "640w" : "122w"}.webp`)}
        alt=""
        className="absolute left-[-7.41%] top-[-2.96%] h-[114.81%] w-[114.81%] max-w-none"
      />
    </span>
  );
}

const CARDS = [
  {
    key: "industry",
    title: "Погружение в индустрию",
    dtop: 117,
    dleft: 599,
    dwidth: 273,
    textW: 166,
    text: (
      <>
        Обучение вместе с <span className="font-medium">X5 Tech</span> – <br />
        это не экскурсии в офис раз <br />в год, а работа с реальными <br />
        задачами, которые <br />подготовят тебя к карьере.
      </>
    ),
  },
  {
    key: "project",
    title: "Проектный формат",
    dtop: 117,
    dleft: 887,
    dwidth: 273,
    textW: 177,
    text: (
      <>
        С первого курса работаешь <br />
        над реальными задачами, <br />а не абстрактными <br />упражнениями
      </>
    ),
  },
  {
    key: "network",
    title: "Нетворкинг и карьера",
    dtop: 261,
    dleft: 599,
    dwidth: 273,
    textW: 178,
    text: (
      <>
        Прямой контакт <br />с ML-инженерами <br />
        X5 Tech, стажировки <br />и карьерные треки
      </>
    ),
  },
  {
    key: "campus",
    title: "Доступ к современному кампусу",
    dtop: 261,
    dleft: 887,
    dwidth: 273,
    textW: 201,
    text: (
      <>
        Технологичные аудитории, <br />
        AI-лаборатории <br />и пространства <br />
        для командной работы
      </>
    ),
  },
  {
    key: "infra",
    title: "Топовую техническую инфраструктуру",
    dtop: 405,
    dleft: 599,
    dwidth: 561,
    textW: 322,
    text: (
      <>
        Вычислительные кластеры, GPU-серверы <br />и облачные платформы для обучения моделей
      </>
    ),
  },
] as const;

function CardIllustration({ k, mobile }: { k: string; mobile?: boolean }) {
  // Структура кропов — дословно из ctx: внешний span (позиция) -> flip-обёртка -> рунды+overflow -> img со сдвигами
  switch (k) {
    case "industry":
      return (
        <>
          <span className="absolute" style={mobile ? { left: 191, top: 27 } : { left: 181, top: 59 }}>
            <BlobColorGlass size={mobile ? 82 : 64} deg={-19.5} />
          </span>
          <span className="absolute" style={mobile ? { left: 217, top: 30 } : { left: 197, top: 52 }}>
            <PurpleControl size={61} />
          </span>
        </>
      );
    case "network":
      return (
        <span className="absolute" style={{ left: mobile ? 173 : 156, bottom: -1 }}>
          <span className="block -scale-y-100 rotate-180">
            <span className="relative block h-[83px] w-[117px] overflow-hidden rounded-bl-[15px]">
              <img
                src={asset(`${A}/image2090011445-21f54626-234w.webp`)}
                alt=""
                className="absolute left-[-34.98%] top-0 h-full w-[133.34%] max-w-none"
              />
            </span>
          </span>
        </span>
      );
    case "project":
      return (
        <span className="absolute" style={{ left: mobile ? 204 : 186, bottom: -1 }}>
          <span className="block -scale-y-100 rotate-180">
            <span className="relative block h-[81px] w-[86px] overflow-hidden rounded-[15.88px]">
              <img
                src={asset(`${A}/image2090011460-ca02c3ca-172w.webp`)}
                alt=""
                className="absolute left-[-17.06%] top-[-15.32%] h-[127.6%] w-[117.87%] max-w-none"
              />
            </span>
          </span>
        </span>
      );
    case "campus":
      return (
        <span className="absolute" style={{ left: mobile ? 210 : 193, bottom: 1 }}>
          <span className="block -scale-y-100 rotate-180">
            <span className="relative block h-[80px] w-[80px] overflow-hidden rounded-bl-[15px] rounded-tl-[15px] rounded-tr-[15px]">
              <img
                src={asset(`${A}/image2090011482-6a28dd31-160w.webp`)}
                alt=""
                className="absolute left-0 top-[-52.11%] h-[152.11%] w-[100.18%] max-w-none"
              />
            </span>
          </span>
        </span>
      );
    default:
      return null;
  }
}

/* Фото у «Топовой инфраструктуры» — узел уровня секции (271:1881), не карточки */
function InfraPhoto({ mobile }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <span className="absolute" style={{ left: 205, top: 46 }}>
        <span className="block -scale-y-100 rotate-90">
          <span className="relative block h-[80px] w-[85px] overflow-hidden rounded-[15.88px]">
            <img
              src={asset(`${A}/image2090011448-6cf76c99-196w.webp`)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-bottom"
            />
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className="absolute left-[1057px] top-[436px] flex h-[98px] w-[103px] items-center justify-center">
      <span className="block -scale-y-100 rotate-90">
        <span className="relative block h-[103px] w-[98px] overflow-hidden rounded-[15.88px]">
          <img
            src={asset(`${A}/image2090011448-6cf76c99-196w.webp`)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        </span>
      </span>
    </span>
  );
}

const BULLETS_DESKTOP = [
  "Общая база первые два года: алгоритмы, ML, инженерия данных",
  "Глубокая специализация и проекты по выбранному треку с 3 курса",
  "Возможность миксовать дисциплины обоих треков",
];
const BULLETS_MOBILE = [
  "Общая база первые два года:\nалгоритмы, ML, инженерия данных",
  "Глубокая специализация и проекты\nпо выбранному треку с 3 курса",
  "Возможность миксовать\nдисциплины обоих треков",
];

export default function ProgrammaDaet() {
  return (
    <section aria-label="Программа даёт" id="programma">
      {/* ===== Десктоп: калька 1200×602 ===== */}
      <div className="relative mx-auto hidden h-[602px] max-w-[1200px] overflow-hidden bg-white lg:block">
        <h2 className="absolute left-[40px] top-[46px] text-[42px] font-bold leading-[normal] tracking-[-1.26px] text-ink">
          Программа даёт
        </h2>

        {/* Лавандовая карта */}
        <div className="absolute left-[40px] top-[117px] h-[417px] w-[540px] rounded-[15px] bg-[#f0efff]" />
        <p className="absolute left-[70px] top-[164px] text-[18px] font-bold leading-[normal] text-black">
          2 специалиста в одном дипломе
        </p>
        {BULLETS_DESKTOP.map((b, i) => (
          <span key={i}>
            <span
              className="absolute left-[70px] h-[6px] w-[6px] rounded-full bg-lime"
              style={{ top: [207, 236, 265][i] }}
            />
            <span
              className="absolute left-[87px] whitespace-nowrap text-[12px] font-medium leading-[21px] text-ink"
              style={{ top: [199, 228, 257][i] }}
            >
              {b}
            </span>
          </span>
        ))}
        <span className="absolute left-[54px] top-[293px] h-[226px] w-[226px]">
          <img src={asset(`${A}/meha-materials-metal-47efdf61-452w.webp`)} alt="" className="h-full w-full object-cover" />
        </span>
        <span className="absolute left-[113px] top-[319px]">
          <PurpleControl size={157} />
        </span>
        <p className="absolute left-[329px] top-[350px] w-[211px] text-[18px] font-bold leading-[19px] text-ink">
          Компьютерное <br />зрение или обработка <br />естественного языка
        </p>
        <p className="absolute left-[329px] top-[422px] w-[177px] text-[13px] leading-[normal] text-ink">
          выбери трек на 3 курсе <br />и углубись в практику
        </p>

        {CARDS.map((c) => (
          <div
            key={c.key}
            className="absolute h-[129px] rounded-[15.88px] border-[1.13px] border-hairline bg-paper backdrop-blur-[7.9px]"
            style={{ left: c.dleft, top: c.dtop, width: c.dwidth }}
          >
            <p
              className="absolute left-[19px] whitespace-nowrap text-[12px] font-bold tracking-[-0.175px] text-ink"
              style={{ top: c.key === "infra" ? 34 : 18 }}
            >
              {c.title}
            </p>
            <p
              className="absolute left-[19px] text-[11px] leading-[normal] text-ink/85"
              style={{ top: c.key === "infra" ? 66 : 56, width: c.textW }}
            >
              {c.text}
            </p>
            <CardIllustration k={c.key} />
          </div>
        ))}
        <InfraPhoto />
      </div>

      {/* ===== Мобильная: флоу по узлам 2264–3607 ===== */}
      <div className="relative overflow-hidden bg-white lg:hidden">
        <h2 className="ml-[15px] pt-[30px] text-[22px] font-bold leading-[26px] text-ink">
          Программа даёт
        </h2>

        {/* Лавандовая карта 290×520 (в потоке, абсолюты внутри) */}
        <div className="relative mx-[15px] mt-[20px] h-[520px] rounded-[15px] bg-[#f0efff]">
          <p className="absolute left-[20px] top-[25px] whitespace-pre-line text-[14px] font-bold leading-[17px] text-black">
            {"2 специалиста\nв одном дипломе"}
          </p>
          {BULLETS_MOBILE.map((b, i) => (
            <span key={i}>
              <span
                className="absolute left-[20px] h-[6px] w-[6px] rounded-full bg-lime"
                style={{ top: [84, 136, 186][i] }}
              />
              <span
                className="absolute left-[36px] whitespace-pre-line text-[12px] font-medium leading-[16px] text-ink"
                style={{ top: [79, 131, 178][i] }}
              >
                {b}
              </span>
            </span>
          ))}
          <span className="absolute left-[20px] top-[222px] h-[181px] w-[181px]">
            <img src={asset(`${A}/meha-materials-metal-47efdf61-452w.webp`)} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="absolute left-[67px] top-[243px]">
            <PurpleControl size={126} />
          </span>
          <p className="absolute left-[20px] top-[418px] w-[250px] text-[14px] font-bold leading-[19px] text-ink">
            Компьютерное зрение или обработка естественного языка
          </p>
          <p className="absolute left-[20px] top-[468px] whitespace-pre-line text-[12px] leading-[14px] text-ink">
            {"выбери трек на 3 курсе и углубись\nв практику"}
          </p>
        </div>

        {/* 5 карточек */}
        <div className="mx-[15px] mt-[15px] flex flex-col gap-[15px] pb-[30px]">
          {[
            { c: CARDS[0], mtext: "Обучение вместе с X5 Tech – это не экскурсии в офис раз\nв год, а работа с реальными задачами, которые подготовят тебя к карьере.", h: 129, tW: 166 },
            { c: CARDS[1], mtext: "С первого курса работаешь\nнад реальными задачами,\nа не абстрактными упражнениями", h: 129, tW: 177 },
            { c: CARDS[2], mtext: "Прямой контакт\nс ML-инженерами\nX5 Tech, стажировки\nи карьерные треки", h: 129, tW: 178 },
            { c: CARDS[3], mtext: "Технологичные аудитории,\nAI-лаборатории\nи пространства\nдля командной работы", h: 129, tW: 201 },
            { c: CARDS[4], mtext: "Вычислительные кластеры,\nGPU-серверы и облачные\nплатформы для обучения\nмоделей", h: 126, tW: 217 },
          ].map(({ c, mtext, h, tW }) => (
            <div
              key={c.key}
              className="relative rounded-[15.88px] border-[1.13px] border-hairline bg-paper backdrop-blur-[7.9px]"
              style={{ height: h }}
            >
              <p className="absolute left-[20px] top-[13px] whitespace-nowrap text-[12px] font-bold text-ink">
                {c.title}
              </p>
              <p
                className="absolute left-[20px] top-[43px] whitespace-pre-line text-[11px] leading-[13px] text-ink/85"
                style={{ width: tW }}
              >
                {mtext}
              </p>
              {c.key === "infra" ? <InfraPhoto mobile /> : <CardIllustration k={c.key} mobile />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
