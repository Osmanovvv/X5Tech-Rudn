// Hero по макету: десктоп — ctx-01 (узел 271:1779, 1200×750, минус 84px шапки),
// мобильная — mobile-abs.json (узлы y 60–884). H1 в макете набран Inter Bold (D2),
// зелёный «X5 Tech» только на мобиле (C4), серый подзаголовок мобилы #6b6b6b — из макета.
import { preload } from "react-dom";
import { asset } from "@/lib/asset";

const photo640 = "/img/01-hero/image5-611bcc67-640w.webp";
const photo1456 = "/img/01-hero/image5-611bcc67-1456w.webp";

function HeroArt({ mobile }: { mobile?: boolean }) {
  // Группа 3D-блобов + фото; порядок слоёв как в макете (блобы под фото)
  if (mobile) {
    // Единый 2x-экспорт арт-группы макета (узел 271:2345, обрезан по фрейму 320):
    // кропы фото и бленды блобов как в Figma; тянется на всю ширину вьюпорта
    return (
      <div className="relative -mt-[23px] mx-[-15px] h-[233px]">
        <img
          src={asset("/img/01-hero/mobile-art-2x.webp")}
          alt="Студенты факультета искусственного интеллекта с ноутбуками X5 Tech"
          fetchPriority="high"
          className="h-[233px] w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div aria-hidden="true">
      {/* центры блобов в координатах секции (y уже без шапки) */}
      <img
        src={asset("/img/01-hero/image2090011457-a627ba4b-612w.webp")}
        alt=""
        decoding="async"
        className="absolute left-[633px] top-[176px] h-[306px] w-[306px] -scale-y-100 rotate-180"
      />
      <div className="absolute left-[418px] top-[180px] h-[387px] w-[387px]">
        <img
          src={asset("/img/01-hero/meha-materials-color-glass-55403441-700w.webp")}
          alt=""
          decoding="async"
          className="absolute left-[19px] top-[19px] h-[349px] w-[349px] rotate-[-6.59deg]"
        />
        <div
          className="absolute left-[19px] top-[19px] h-[349px] w-[349px] bg-lime-soft mix-blend-hue"
          style={{
            maskImage: `url(${asset("/img/01-hero/meha-materials-color-glass-55403441-700w.webp")})`,
            maskSize: "100% 100%",
            WebkitMaskImage: `url(${asset("/img/01-hero/meha-materials-color-glass-55403441-700w.webp")})`,
            WebkitMaskSize: "100% 100%",
            rotate: "-6.59deg",
          }}
        />
      </div>
      <img
        src={asset("/img/01-hero/meha-materials-metal-5b128cb2-660w.webp")}
        alt=""
        decoding="async"
        className="absolute left-[820px] top-[241px] h-[330px] w-[330px] rotate-[25.84deg]"
      />
    </div>
  );
}

function Badge({ mobile }: { mobile?: boolean }) {
  return (
    <p
      className={`flex items-center rounded-full border border-lime font-mono uppercase text-ink ${
        mobile
          ? "h-[28px] w-[170px] pl-[20px] text-[12px] leading-[16px]"
          : "h-[36px] w-[170px] pl-[19px] text-[12px]"
      }`}
    >
      На реальных данных
    </p>
  );
}

function Cta({ mobile }: { mobile?: boolean }) {
  return (
    <a
      href="#forma"
      className={`relative block rounded-[5px] bg-lime-deep font-bold text-white transition-[filter] hover:brightness-95 ${
        mobile ? "h-[60px] w-full" : "h-[60px] w-[240px]"
      }`}
    >
      <span
        className={`absolute -translate-y-1/2 text-[14px] leading-[21px] ${
          mobile ? "left-[83px] top-[calc(50%+2px)]" : "left-[44px] top-[calc(50%-1px)]"
        }`}
      >
        Отправить заявку
      </span>
      <img
        src={asset("/img/01-hero/svg-8b38f743.svg")}
        alt=""
        aria-hidden
        className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${
          mobile ? "left-[219px]" : "left-[180px]"
        }`}
      />
    </a>
  );
}

function GlassCard({ mobile }: { mobile?: boolean }) {
  return (
    <div
      className={`rounded-[14.8px] border-[1.06px] border-hairline bg-paper/95 backdrop-blur-[7.4px] ${
        mobile ? "relative h-[81px] w-[254px]" : "absolute left-[876px] top-[99px] h-[81px] w-[254px]"
      }`}
    >
      <p
        className={`absolute text-[14px] leading-[16px] text-ink ${
          mobile ? "left-[20px] top-[16px]" : "left-[19px] top-[23px]"
        }`}
      >
        AI-практика начинается
        <br />
        на 1 курсе, а не после диплома
      </p>
    </div>
  );
}

function Stats({ mobile }: { mobile?: boolean }) {
  const items = [
    ["50", "бюджетных мест"],
    ["152", "мест по договору"],
    ["4 года", "обучение - бакалавриат (очно)"],
  ] as const;
  if (mobile) {
    return (
      <dl>
        {items.map(([value, label], i) => (
          <div key={value}>
            {i > 0 && <div className="mb-[15px] mt-[15px] h-px w-[157px] bg-[#d8d8d8]" aria-hidden />}
            <dt className="sr-only">{label}</dt>
            <dd className="text-[24px] font-medium leading-[24px] text-ink">{value}</dd>
            <dd className="mt-[6px] text-[12px] uppercase leading-[14px] text-ink">{label}</dd>
          </div>
        ))}
      </dl>
    );
  }
  // Десктоп: абсолютные позиции из макета (центры значений 441/519/596 минус шапка)
  const valueTops = [429, 507, 584];
  const labelTops = [460, 538, 615];
  const lineTops = [491, 568];
  return (
    <dl>
      {items.map(([value, label], i) => (
        <div key={value}>
          <dt className="sr-only">{label}</dt>
          <dd
            className="absolute left-[40px] text-[24px] font-medium leading-[24px] text-ink"
            style={{ top: valueTops[i] }}
          >
            {value}
          </dd>
          <dd
            className="absolute left-[40px] text-[12px] uppercase leading-[14px] text-ink"
            style={{ top: labelTops[i] }}
          >
            {label}
          </dd>
        </div>
      ))}
      {lineTops.map((t) => (
        <div key={t} className="absolute left-[40px] h-px w-[157px] bg-[#d8d8d8]" style={{ top: t }} aria-hidden />
      ))}
    </dl>
  );
}

export default function Hero() {
  preload(asset(photo1456), {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: `${asset(photo640)} 640w, ${asset(photo1456)} 1456w`,
    imageSizes: "(max-width: 1023px) 100vw, 728px",
  });

  return (
    <section aria-label="Факультет искусственного интеллекта РУДН и X5 Tech">
      {/* ===== Десктоп: абсолютная калька 1200×666 (750 минус шапка) ===== */}
      <div className="relative mx-auto hidden h-[666px] max-w-[1200px] overflow-hidden bg-white lg:block">
        <HeroArt />
        <img
          src={asset(photo1456)}
          srcSet={`${asset(photo640)} 640w, ${asset(photo1456)} 1456w`}
          sizes="728px"
          alt="Студенты факультета искусственного интеллекта с ноутбуками X5 Tech"
          fetchPriority="high"
          className="absolute left-[429px] top-[148px] h-[485px] w-[728px] object-cover"
        />
        <div className="absolute left-[40px] top-[63px]">
          <Badge />
        </div>
        <h1 className="absolute left-[40px] top-[112px] w-[440px] text-[42px] font-bold leading-[42.84px] tracking-[-1.26px] text-ink">
          Изучай ИИ,
          <br />
          входи в профессию
          <br />
          вместе с X5 Tech
        </h1>
        <p className="absolute left-[40px] top-[251px] w-[340px] text-[13px] leading-[normal] text-ink">
          Факультет искусственного интеллекта РУДН
          <br />
          Образовательная программа:
          <br />
          «Искусственный интеллект: разработка
          <br />и обучение интеллектуальных систем»
        </p>
        <div className="absolute left-[40px] top-[331px]">
          <Cta />
        </div>
        <GlassCard />
        <Stats />
      </div>

      {/* ===== Мобильная: верхняя текстовая зона фиксирована (284px, как в макете),
          арт в потоке с сохранением пропорций — на 321–430 растёт вниз, ничего не кропится ===== */}
      <div className="relative overflow-hidden bg-white lg:hidden">
        <div className="relative h-[284px]">
          <div className="absolute left-[15px] top-[31px]">
            <Badge mobile />
          </div>
          <h1 className="absolute left-[15px] top-[71px] text-[22px] font-bold leading-[23px] tracking-[-1.3px] text-ink">
            Изучай ИИ,
            <br />
            входи в профессию
            <br />
            вместе с <span className="text-lime-deep">X5 Tech</span>
          </h1>
          <p className="absolute left-[15px] top-[155px] text-[12px] leading-[14px] text-[#6b6b6b]">
            Факультет искусственного интеллекта РУДН
            <br />
            Образовательная программа:
            <br />
            «Искусственный интеллект: разработка
            <br />и обучение интеллектуальных систем»
          </p>
        </div>
        {/* Порядок слоёв макета: арт (слой 21) ПОВЕРХ карточки (слой 2) — головы наезжают на карточку */}
        <img
          src={asset("/img/01-hero/mobile-art-2x.webp")}
          alt="Студенты факультета искусственного интеллекта с ноутбуками X5 Tech"
          fetchPriority="high"
          className="relative z-[1] block h-auto w-full"
        />
        <div className="absolute left-[15px] top-[226px] z-0">
          <GlassCard mobile />
        </div>
        <div className="mx-[15px]">
          <Cta mobile />
        </div>
        <div className="ml-[15px] mt-[25px] pb-[30px]">
          <Stats mobile />
        </div>
      </div>
      </section>
  );
}
