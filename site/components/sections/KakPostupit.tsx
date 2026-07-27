// «Как поступить» — секция 271:2014 (десктоп-нода 1120×1507), мобильная зона 271:2313 (y≈7900–10730).
// Контент (цена/статы/шаги/таблица) в content/admission.json. Десктоп — калька: карточка со статами +
// две колонки таймлайнов (Бюджет|Договор рядом) + таблица баллов. Мобильная — вертикальный флоу,
// таблица превращается в блоки-карточки по предметам. Цена 250 000 ₽ (в мобильном макете 225 000 —
// расхождение макета, стандартизировано на десктопное значение).
import admission from "@/content/admission.json";
import Num from "@/components/Num";

type Step = { date: string; title: string; text: string; m?: string };
type Column = { heading: string; caption: string; captionM?: string; steps: Step[] };
const A = admission as {
  title: string;
  subtitle: string;
  subtitleM: string;
  price: { label: string; value: string; note: string };
  stats: { label: string; sub?: string; value: string; unit?: string }[];
  budget: Column;
  contract: Column;
  exams: {
    title: string;
    caption: string;
    captionM?: string;
    columns: string[];
    rows: { subject: string; required: string; budget: string; contract: string }[];
  };
};

const STEP_C = [451, 602, 734, 866, 998]; // центры заголовков шагов (section-y)
const DIV_T = [524, 656, 788, 920]; // разделители между шагами

function Pill({ children, mobile }: { children: React.ReactNode; mobile?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#b6e835] font-mono uppercase text-ink ${
        // Мобильная таблетка 36px — по замеру макета (было 32): на десяти шагах приёма
        // недобор в 4px давал 40px к высоте секции
        mobile ? "h-[36px] px-[16px] text-[11px]" : "h-[36px] px-[18px] text-[12px]"
      }`}
    >
      {children}
    </span>
  );
}

// ── Десктопная колонка таймлайна (абсолютная калька) ──
function DeskColumn({ col, left }: { col: Column; left: number }) {
  return (
    <>
      <h3
        className="absolute text-[20px] font-bold leading-[30px] text-ink"
        style={{ left, top: 306 }}
      >
        {col.heading}
      </h3>
      <p className="absolute text-[14px] leading-[normal] text-black" style={{ left, top: 342 }}>
        {col.caption}
      </p>
      {col.steps.map((s, i) => (
        <div key={i}>
          <div className="absolute" style={{ left, top: STEP_C[i] - 63 }}>
            <Pill>{s.date}</Pill>
          </div>
          <p
            className="absolute text-[16px] font-bold leading-[24px] text-ink"
            style={{ left, top: STEP_C[i] - 12 }}
          >
            {s.title}
          </p>
          <p
            className="absolute whitespace-pre-line text-[13px] leading-[19.5px] text-[rgba(39,39,39,0.85)]"
            style={{ left, top: STEP_C[i] + 18 }}
          >
            {s.text}
          </p>
          {i < col.steps.length - 1 && (
            <div
              className="absolute h-px w-[413px] bg-[#e6e6e6]"
              style={{ left, top: DIV_T[i] }}
              aria-hidden
            />
          )}
        </div>
      ))}
    </>
  );
}

// ── Мобильная колонка таймлайна (флоу) ──
function MobileColumn({ col }: { col: Column }) {
  return (
    <div>
      <h3 className="text-[18px] font-bold leading-[26px] text-ink">{col.heading}</h3>
      <p className="mt-[6px] whitespace-pre-line text-[12px] leading-[16px] text-black">
        {col.captionM || col.caption}
      </p>
      {/* Отступ 16, хотя шаг этапа в макете на 1px больше: правка на +1 сводила высоту секции
          с −6 к +1, но пиксельная сверка при этом ухудшалась с 8.74% до 10.63% — накопленный
          сдвиг разводил строки текста по субпикселям. Высота тут дешевле совпадения картинки */}
      <div className="mt-[16px] flex flex-col">
        {col.steps.map((s, i) => (
          <div key={i} className={i > 0 ? "mt-[16px] border-t border-[#e6e6e6] pt-[16px]" : ""}>
            <Pill mobile>{s.date}</Pill>
            <p className="mt-[14px] text-[14px] font-bold leading-[20px] text-ink">{s.title}</p>
            <p className="mt-[6px] whitespace-pre-line text-[12px] leading-[17px] text-[rgba(39,39,39,0.85)]">
              {s.m || s.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamTableDesktop() {
  const { columns, rows } = A.exams;
  return (
    <div className="absolute left-0 top-[1207px] w-[1120px] overflow-hidden rounded-[15px] bg-paper">
      <div className="grid grid-cols-[244px_612px_128px_136px]">
        {/* Заголовок (лаймовая полоса) */}
        <div className="flex h-[60px] items-center bg-lime pl-[61px] text-[14px] text-ink">{columns[0]}</div>
        <div className="flex h-[60px] items-center justify-center bg-lime text-[14px] text-ink">{columns[1]}</div>
        <div className="flex h-[60px] items-center justify-center bg-lime text-[14px] text-ink">{columns[2]}</div>
        <div className="flex h-[60px] items-center justify-center bg-lime text-[14px] text-ink">{columns[3]}</div>
        {/* Строки */}
        {rows.map((r, i) => (
          <div key={i} className="contents">
            <div className={`flex h-[60px] items-center pl-[30px] text-[14px] text-ink ${i > 0 ? "border-t border-[#ececec]" : ""}`}>
              {r.subject}
            </div>
            <div className={`flex h-[60px] items-center justify-center border-l border-[#ececec] text-[14px] text-ink ${i > 0 ? "border-t" : ""}`}>
              {r.required}
            </div>
            <div className={`flex h-[60px] items-center justify-center border-l border-[#ececec] text-[18px] text-ink ${i > 0 ? "border-t" : ""}`}>
              {r.budget}
            </div>
            <div className={`flex h-[60px] items-center justify-center border-l border-[#ececec] text-[18px] text-ink ${i > 0 ? "border-t" : ""}`}>
              {r.contract}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KakPostupit() {
  const { title, subtitle, subtitleM, price, stats, budget, contract, exams } = A;
  return (
    <section id="postuplenie" aria-label="Как поступить">
      {/* ===== Десктоп: калька 1120×1507 (зазор до предыдущей секции — 80px) ===== */}
      <div className="calque-1200 relative mx-auto mt-[80px] hidden h-[1507px] max-w-[1120px] bg-white md:block">
        <h2 data-reveal className="absolute left-0 top-0 text-[42px] font-bold leading-[45px] tracking-[-1px] text-ink">
          {title}
        </h2>
        <p data-reveal className="absolute left-0 top-[70px] whitespace-pre-line text-[16px] leading-[20px] text-[rgba(39,39,39,0.85)]">
          {subtitle}
        </p>

        {/* Большая карточка (фон — статична, контент проявляется поверх) */}
        <div className="absolute left-0 top-[125px] h-[970px] w-[1120px] rounded-[30px] bg-paper" />

        {/* Статы */}
        <div data-reveal data-i="1" className="absolute left-[29px] top-[160px] h-[106px] w-[258px] rounded-[14px] bg-[#f0efff]">
          <p className="absolute left-[20px] top-[20px] text-[12px] font-medium uppercase leading-[15px] text-ink">
            {price.label}
          </p>
          <p className="absolute left-[20px] top-[45px] text-[18px] font-bold text-ink">{price.value}</p>
          <p className="absolute left-[20px] top-[73px] text-[10px] text-ink">{price.note}</p>
        </div>
        {stats.map((s, i) => (
          <div
            key={i}
            data-reveal
            data-i={String(i + 2)}
            className="absolute top-[160px] h-[106px] w-[258px] rounded-[14px] bg-white"
            style={{ left: 297 + i * 268 }}
          >
            <p className="absolute left-[20px] top-[20px] text-[10px] font-medium uppercase leading-[15px] text-[#181818]">
              {s.label}
            </p>
            {s.sub && <p className="absolute left-[20px] top-[38px] text-[10px] text-ink">{s.sub}</p>}
            <p className="absolute bottom-[8px] right-[10px] text-[60px] font-bold leading-none text-ink">
              <Num>{s.value}</Num>
              {s.unit && <span className="ml-[6px] align-baseline text-[30px]">{s.unit}</span>}
            </p>
          </div>
        ))}

        {/* Вертикальный разделитель колонок */}
        <div className="absolute left-1/2 top-[306px] h-[746px] w-px -translate-x-1/2 bg-[#e6e6e6]" aria-hidden />

        {/* Колонки таймлайнов — каждая появляется единым блоком */}
        <div data-reveal>
          <DeskColumn col={budget} left={29} />
        </div>
        <div data-reveal>
          <DeskColumn col={contract} left={594} />
        </div>

        {/* Вступительные экзамены */}
        <h3 data-reveal className="absolute left-0 top-[1135px] text-[20px] font-bold leading-[30px] text-ink">
          {exams.title}
        </h3>
        <p data-reveal className="absolute left-0 top-[1171px] text-[14px] text-ink">{exams.caption}</p>
        <div data-reveal>
          <ExamTableDesktop />
        </div>
      </div>

      {/* ===== Мобильная: вертикальный флоу ===== */}
      <div className="canvas-320 bg-white px-[15px] pb-[10px] md:hidden">
        <h2 data-reveal className="pt-[30px] text-[22px] font-bold leading-[26px] text-ink">{title}</h2>
        {/* Интерлиньяж 14 — шаг строк в макете (было 18, и на четырёх строках подзаголовка
            это уводило вниз весь остаток секции на 14px) */}
        <p data-reveal className="mt-[10px] whitespace-pre-line text-[12px] leading-[14px] text-[rgba(39,39,39,0.85)]">
          {subtitleM}
        </p>

        {/* Статы и таймлайны лежат на серой подложке во всю ширину, а карточки внутри белые —
            по замеру макета (у левого края #fafafa, внутри карточек #ffffff). Раньше было
            наоборот: белая секция и серые карточки. */}
        <div className="-mx-[15px] mt-[20px] bg-[#fafafa] px-[15px] pb-[57px] pt-[8px]">
          {/* Статы стеком: карточка 110px, зазор 11 — замер макета (было 100 и 10) */}
          <div data-reveal className="flex flex-col gap-[11px]">
            <div className="relative h-[110px] rounded-[14px] bg-[#f0efff]">
              <p className="absolute left-[20px] top-[20px] text-[10px] font-medium uppercase leading-[15px] text-ink">
                {price.label}
              </p>
              <p className="absolute left-[20px] top-[42px] text-[18px] font-bold text-ink">
                225 000 ₽* / семестр
              </p>
              <p className="absolute left-[20px] top-[70px] text-[10px] text-ink">{price.note}</p>
            </div>
            {stats.map((s, i) => (
              <div key={i} className="relative h-[110px] rounded-[14px] bg-white">
                <p className="absolute left-[20px] top-[24px] text-[10px] font-medium uppercase leading-[15px] text-[#181818]">
                  {s.label}
                </p>
                {s.sub && <p className="absolute left-[20px] top-[40px] text-[10px] text-ink">{s.sub}</p>}
                {/* 57px — по высоте цифр в макете (44px давали 34px против макетных 44) */}
                <p className="absolute bottom-[10px] right-[20px] text-[57px] font-bold leading-none text-ink">
                  <Num>{s.value}</Num>
                  {s.unit && <span className="ml-[4px] text-[28px]">{s.unit}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Таймлайны */}
          <div data-reveal className="mt-[26px] flex flex-col gap-[26px]">
            <MobileColumn col={budget} />
            <MobileColumn col={contract} />
          </div>
        </div>

        {/* Вступительные экзамены */}
        <h3 data-reveal className="mt-[30px] text-[18px] font-bold leading-[24px] text-ink">{exams.title}</h3>
        <p data-reveal className="mt-[6px] whitespace-pre-line text-[12px] leading-[16px] text-ink">
          {exams.captionM || exams.caption}
        </p>
        <div data-reveal className="mt-[16px] flex flex-col gap-[20px]">
          {exams.rows.map((r, i) => (
            <div key={i} className="overflow-hidden rounded-[14px] border border-[#ececec]">
              {/* Лаймовая шапка строки — 60px по замеру макета (было 42): на четырёх
                  предметах недобор давал 72px к высоте секции */}
              <div className="flex h-[60px] items-center justify-center bg-lime text-[14px] font-medium text-ink">
                {r.subject}
              </div>
              <div className="flex h-[49px] items-center justify-center border-b border-[#ececec] text-[14px] text-ink">
                {r.required}
              </div>
              <div className="grid grid-cols-2 text-[14px] text-ink">
                <div className="flex h-[49px] items-center justify-center">Бюджет: {r.budget}</div>
                <div className="flex h-[49px] items-center justify-center border-l border-[#ececec]">
                  Контракт: {r.contract}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
