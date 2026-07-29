// Hero по макету: десктоп — ctx-01 (узел 271:1779, 1200×750, минус 84px шапки),
// мобильная — mobile-abs.json (узлы y 60–884). H1 в макете набран Inter Bold (D2).
// «X5 Tech» в заголовке чёрный на обеих ширинах: в мобильном макете он зелёный, но решение
// заказчика — держать десктопный вариант (расхождение C4 закрыто).
// Серый подзаголовок мобилы #818181 — по замеру эталона (было #6b6b6b, темнее макетного).
import { preload } from "react-dom";
import { asset } from "@/lib/asset";

const photo640 = "/img/01-hero/image5-611bcc67-640w.webp";
const photo1456 = "/img/01-hero/image5-611bcc67-1456w.webp";
const photo640Avif = "/img/01-hero/image5-611bcc67-640w.avif";
const photo1456Avif = "/img/01-hero/image5-611bcc67-1456w.avif";
const mobileArt = "/img/01-hero/mobile-art-2x.webp";
const mobileArtAvif = "/img/01-hero/mobile-art-2x.avif";

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
      {/* Центры блобов в координатах секции (y уже без шапки).
          loading="lazy" здесь не про отложенность — на десктопе блобы в первом экране и
          грузятся сразу. Он снимает АВТОМАТИЧЕСКИЙ preload React: без него мобильный браузер
          скачивал бы все три декоративных блока (54KB), хотя ветка скрыта display:none. */}
      <img
        src={asset("/img/01-hero/image2090011457-a627ba4b-612w.webp")}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute left-[633px] top-[176px] h-[306px] w-[306px] -scale-y-100 rotate-180"
      />
      <div className="absolute left-[418px] top-[180px] h-[387px] w-[387px]">
        <img
          src={asset("/img/01-hero/meha-materials-color-glass-55403441-800w.webp")}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute left-[19px] top-[19px] h-[349px] w-[349px] rotate-[-6.59deg]"
        />
        <div
          className="absolute left-[19px] top-[19px] h-[349px] w-[349px] bg-lime-soft mix-blend-hue"
          style={{
            maskImage: `url(${asset("/img/01-hero/meha-materials-color-glass-55403441-800w.webp")})`,
            maskSize: "100% 100%",
            WebkitMaskImage: `url(${asset("/img/01-hero/meha-materials-color-glass-55403441-800w.webp")})`,
            WebkitMaskSize: "100% 100%",
            rotate: "-6.59deg",
          }}
        />
      </div>
      <img
        src={asset("/img/01-hero/meha-materials-metal-5b128cb2-900w.webp")}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute left-[820px] top-[241px] h-[330px] w-[330px] rotate-[25.84deg]"
      />
    </div>
  );
}

function Badge({ mobile }: { mobile?: boolean }) {
  return (
    <p
      // Ширина по содержимому с одинаковыми полями, а не фиксированные 170 с прижатием
      // текста влево. При жёсткой ширине любое расхождение метрик шрифта на устройстве
      // копится ПУСТОТОЙ СПРАВА — на iPhone плашка выглядела наполовину пустой, хотя
      // в браузере на компьютере поля выходили ровно 21/21, как в макете.
      // Ширина макета при этом сохраняется, но теперь она следствие, а не жёсткое число:
      // замер даёт те же 170×28 и поля 21/21 на обеих ширинах.
      className={`flex w-fit items-center rounded-full border border-lime px-[19px] font-mono uppercase text-ink ${
        mobile ? "h-[28px] text-[12px] leading-[16px]" : "h-[36px] text-[12px]"
      }`}
    >
      На реальных данных
    </p>
  );
}

const CTA_BASE =
  "group rounded-[5px] bg-lime-deep font-bold text-white transition-[filter,scale] duration-200 ease-motion hover:brightness-95 active:scale-[0.98]";
const CTA_ARROW = asset("/img/01-hero/svg-8b38f743.svg");

function Cta({ mobile }: { mobile?: boolean }) {
  // Мобильная кнопка — центрированный ряд «текст + стрелка», а не абсолютные координаты.
  // В эталоне содержимое стоит ровно по центру (поля 69 и 71 при ширине кнопки 290),
  // а прежние left-[83px] и left-[219px] уводили его вправо: 84 слева против 56 справа —
  // это и было видно как «кнопка не такая». После правки поля 66/69, стрелка 12px
  // в ширину как в макете, зазор до неё 15 против макетных 14. Остаток в пару пикселей —
  // наш текст на 3px шире эталонного из-за метрик шрифта, ближе не подойти.
  if (mobile) {
    return (
      <a href="#forma" className={`${CTA_BASE} flex h-[60px] w-full items-center justify-center gap-[11px]`}>
        <span className="text-[14px] leading-[21px]">Отправить заявку</span>
        <img
          src={CTA_ARROW}
          alt=""
          aria-hidden
          // Сдвиг на 1.5px вниз: внутри своего квадрата иконка нарисована со смещением
          // вверх, поэтому при выравнивании по центру ряда её оптический центр оказывался
          // на 1.5px выше центра текста. В макете ровно та же картина (там иконка тоже
          // выше на 1.5px), так что это осознанное отклонение — по просьбе заказчика
          className="h-[18px] w-[18px] shrink-0 translate-y-[1.5px] transition-transform duration-200 ease-motion group-hover:translate-x-[4px]"
        />
      </a>
    );
  }
  // Десктоп — калька макета: положение текста и стрелки заданы координатами узлов
  return (
    <a href="#forma" className={`${CTA_BASE} relative block h-[60px] w-[240px]`}>
      <span className="absolute left-[44px] top-[calc(50%-1px)] -translate-y-1/2 text-[14px] leading-[21px]">
        Отправить заявку
      </span>
      <img
        src={CTA_ARROW}
        alt=""
        aria-hidden
        className="absolute left-[180px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-transform duration-200 ease-motion group-hover:translate-x-[4px]"
      />
    </a>
  );
}

function GlassCard({ mobile }: { mobile?: boolean }) {
  return (
    <div
      data-reveal
      className={`rounded-[14.8px] border-[1.06px] border-hairline bg-paper/95 backdrop-blur-[7.4px] ${
        mobile ? "relative h-[81px] w-[254px]" : "absolute left-[876px] top-[99px] h-[81px] w-[254px]"
      }`}
    >
      <p
        className={`absolute text-[14px] leading-[16px] text-ink ${
          // 24, а не 16: по замеру макета строки текста стоят на y=253 и 269 при карточке
          // от 226, то есть отступ сверху 24 и снизу 25 — текст стоит по центру. С 16
          // сверху весь запас уходил вниз, и под текстом зияла пустота (заметно на телефоне)
          mobile ? "left-[20px] top-[24px]" : "left-[19px] top-[23px]"
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
  // Предзагружаем AVIF-набор: браузеры без поддержки AVIF просто игнорируют такой preload
  // (type не совпал) и берут webp обычным путём — лишней загрузки нет.
  // imageSizes совпадает с sizes у <img>, иначе preload и вёрстка выберут разных кандидатов.
  // media обязателен: у hero две ветки вёрстки, и без него мобильный браузер тянул бы
  // ДЕСКТОПНОЕ фото (imageSizes 728px → кандидат 1456w, 61KB) высоким приоритетом — прямо
  // поверх собственного LCP-изображения, которое весит втрое меньше.
  preload(asset(photo1456Avif), {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    media: "(min-width: 768px)",
    imageSrcSet: `${asset(photo640Avif)} 640w, ${asset(photo1456Avif)} 1456w`,
    imageSizes: "728px",
  });
  // Зеркально: LCP мобильной ветки — единый арт-экспорт, его и греем на узких экранах
  preload(asset(mobileArtAvif), {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    media: "(max-width: 767.98px)",
  });

  return (
    <section aria-label="Факультет искусственного интеллекта РУДН и X5 Tech">
      {/* ===== Десктоп: абсолютная калька 1200×666 (750 минус шапка) ===== */}
      <div className="calque-1200 relative mx-auto hidden h-[666px] max-w-[1200px] overflow-hidden bg-white md:block">
        <HeroArt />
        {/* display:contents — <picture> не создаёт своего бокса, раскладка img не меняется */}
        <picture className="contents">
          <source
            type="image/avif"
            srcSet={`${asset(photo640Avif)} 640w, ${asset(photo1456Avif)} 1456w`}
            sizes="728px"
          />
          <img
            src={asset(photo1456)}
            srcSet={`${asset(photo640)} 640w, ${asset(photo1456)} 1456w`}
            sizes="728px"
            alt="Студенты факультета искусственного интеллекта с ноутбуками X5 Tech"
            fetchPriority="high"
            // lazy здесь не откладывает загрузку: на десктопе фото в первом экране, и его
            // байты уже летят по preload выше. Зато на мобильной, где эта ветка скрыта
            // display:none, браузер не скачает его вовсе — минус 61KB на телефоне.
            loading="lazy"
            data-reveal-scale
            className="absolute left-[429px] top-[148px] h-[485px] w-[728px] object-cover"
          />
        </picture>
        <div data-reveal className="absolute left-[40px] top-[63px]">
          <Badge />
        </div>
        {/* h1 — LCP-текст: только сдвиг, без opacity, чтобы не задерживать LCP */}
        <h1 data-reveal-move className="absolute left-[40px] top-[112px] w-[440px] text-[42px] font-bold leading-[42.84px] tracking-[-1.26px] text-ink">
          Изучай ИИ,
          <br />
          входи в профессию
          <br />
          вместе с X5 Tech
        </h1>
        <p data-reveal className="absolute left-[40px] top-[251px] w-[340px] text-[13px] leading-[normal] text-ink">
          Факультет искусственного интеллекта РУДН
          <br />
          Образовательная программа:
          <br />
          «Искусственный интеллект: разработка
          <br />и обучение интеллектуальных систем»
        </p>
        <div data-reveal className="absolute left-[40px] top-[331px]">
          <Cta />
        </div>
        <GlassCard />
        <div data-reveal>
          <Stats />
        </div>
      </div>

      {/* ===== Мобильная: верхняя текстовая зона фиксирована (284px, как в макете),
          арт в потоке с сохранением пропорций — на 321–430 растёт вниз, ничего не кропится ===== */}
      <div className="canvas-320 relative overflow-hidden bg-white md:hidden">
        <div className="relative h-[284px]">
          <div data-reveal className="absolute left-[15px] top-[31px]">
            <Badge mobile />
          </div>
          {/* Обе ветки hero живут в DOM одновременно, поэтому настоящий <h1> только один —
              десктопный. Здесь тот же заголовок с ролью heading level 1: скрытая ветка
              (display:none) для скринридера не существует, значит на каждой ширине AT видит
              ровно один заголовок первого уровня, а в разметке остаётся единственный тег h1. */}
          <p
            role="heading"
            aria-level={1}
            data-reveal-move
            className="absolute left-[15px] top-[71px] text-[22px] font-bold leading-[23px] tracking-[-1.3px] text-ink"
          >
            Изучай ИИ,
            <br />
            входи в профессию
            <br />
            вместе с X5 Tech
          </p>
          <p data-reveal className="absolute left-[15px] top-[155px] text-[13px] leading-[15px] text-[#818181]">
            Факультет искусственного интеллекта РУДН
            <br />
            Образовательная программа:
            <br />
            «Искусственный интеллект: разработка
            <br />и обучение интеллектуальных систем»
          </p>
        </div>
        {/* Порядок слоёв макета: арт (слой 21) ПОВЕРХ карточки (слой 2) — головы наезжают на карточку */}
        <picture className="contents">
          <source type="image/avif" srcSet={asset(mobileArtAvif)} />
          <img
            src={asset(mobileArt)}
            alt="Студенты факультета искусственного интеллекта с ноутбуками X5 Tech"
            fetchPriority="high"
            // Зеркально десктопной ветке: на широких экранах эта картинка скрыта и грузиться
            // не должна, а на узких её греет preload с media выше
            loading="lazy"
            data-reveal-scale
            // -1px снизу убирают белую нитку над кнопкой. Канва масштабируется свойством
            // zoom, поэтому низ картинки попадает на дробную координату и расходится
            // с верхом кнопки на 0.03–0.24px. При плотности 3 это давало две полностью
            // белые строки физических пикселей — на телефоне видно, на десктопе нет.
            // Ровно 1px (а не 0.5) — чтобы сдвиг остался целым: дробный уводил все секции
            // ниже на доли пикселя, и их высоты начинали прыгать на ±1px.
            className="relative z-[1] -mb-px block h-[233px] w-full"
          />
        </picture>
        <div className="absolute left-[15px] top-[226px] z-0">
          <GlassCard mobile />
        </div>
        <div data-reveal className="mx-[15px]">
          <Cta mobile />
        </div>
        <div data-reveal className="ml-[15px] mt-[25px] pb-[30px]">
          <Stats mobile />
        </div>
      </div>
      </section>
  );
}
