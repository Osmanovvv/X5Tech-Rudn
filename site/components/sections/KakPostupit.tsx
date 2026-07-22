// «Как поступить» — секция 271:2014 (десктоп-нода 1120×1507), мобильная зона 271:2313 (y≈7900–10730).
// Контент (цена/статы/шаги/таблица) в content/admission.json. Десктоп — калька: карточка со статами +
// две колонки таймлайнов (Бюджет|Договор рядом) + таблица баллов. Мобильная — вертикальный флоу,
// таблица превращается в блоки-карточки по предметам. Цена 250 000 ₽ (в мобильном макете 225 000 —
// расхождение макета, стандартизировано на десктопное значение).
import admission from "@/content/admission.json";

type Step = { date: string; title: string; text: string; m?: string };
type Column = { heading: string; caption: string; steps: Step[] };
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
        mobile ? "h-[32px] px-[16px] text-[11px]" : "h-[36px] px-[18px] text-[12px]"
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
        {col.caption}
      </p>
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
    <section aria-label="Как поступить">
      {/* ===== Десктоп: калька 1120×1507 (зазор до предыдущей секции — 80px) ===== */}
      <div className="relative mx-auto mt-[80px] hidden h-[1507px] max-w-[1120px] bg-white lg:block">
        <h2 className="absolute left-0 top-0 text-[42px] font-bold leading-[45px] tracking-[-1px] text-ink">
          {title}
        </h2>
        <p className="absolute left-0 top-[70px] whitespace-pre-line text-[16px] leading-[20px] text-[rgba(39,39,39,0.85)]">
          {subtitle}
        </p>

        {/* Большая карточка */}
        <div className="absolute left-0 top-[125px] h-[970px] w-[1120px] rounded-[30px] bg-paper" />

        {/* Статы */}
        <div className="absolute left-[29px] top-[160px] h-[106px] w-[258px] rounded-[14px] bg-[#f0efff]">
          <p className="absolute left-[20px] top-[20px] text-[12px] font-medium uppercase leading-[15px] text-ink">
            {price.label}
          </p>
          <p className="absolute left-[20px] top-[45px] text-[18px] font-bold text-ink">{price.value}</p>
          <p className="absolute left-[20px] top-[73px] text-[10px] text-ink">{price.note}</p>
        </div>
        {stats.map((s, i) => (
          <div
            key={i}
            className="absolute top-[160px] h-[106px] w-[258px] rounded-[14px] bg-white"
            style={{ left: 297 + i * 268 }}
          >
            <p className="absolute left-[20px] top-[20px] text-[10px] font-medium uppercase leading-[15px] text-[#181818]">
              {s.label}
            </p>
            {s.sub && <p className="absolute left-[20px] top-[38px] text-[10px] text-ink">{s.sub}</p>}
            <p className="absolute bottom-[8px] right-[10px] text-[60px] font-bold leading-none text-ink">
              {s.value}
              {s.unit && <span className="ml-[6px] align-baseline text-[30px]">{s.unit}</span>}
            </p>
          </div>
        ))}

        {/* Вертикальный разделитель колонок */}
        <div className="absolute left-1/2 top-[306px] h-[746px] w-px -translate-x-1/2 bg-[#e6e6e6]" aria-hidden />

        {/* Колонки таймлайнов */}
        <DeskColumn col={budget} left={29} />
        <DeskColumn col={contract} left={594} />

        {/* Вступительные экзамены */}
        <h3 className="absolute left-0 top-[1135px] text-[20px] font-bold leading-[30px] text-ink">
          {exams.title}
        </h3>
        <p className="absolute left-0 top-[1171px] text-[14px] text-ink">{exams.caption}</p>
        <ExamTableDesktop />
      </div>

      {/* ===== Мобильная: вертикальный флоу ===== */}
      <div className="bg-white px-[15px] pb-[10px] lg:hidden">
        <h2 className="pt-[30px] text-[22px] font-bold leading-[26px] text-ink">{title}</h2>
        <p className="mt-[10px] whitespace-pre-line text-[12px] leading-[18px] text-[rgba(39,39,39,0.85)]">
          {subtitleM}
        </p>

        {/* Статы стеком */}
        <div className="mt-[20px] flex flex-col gap-[10px]">
          <div className="relative h-[100px] rounded-[14px] bg-[#f0efff]">
            <p className="absolute left-[20px] top-[20px] text-[10px] font-medium uppercase leading-[15px] text-ink">
              {price.label}
            </p>
            <p className="absolute left-[20px] top-[42px] text-[18px] font-bold text-ink">
              225 000 ₽* / семестр
            </p>
            <p className="absolute left-[20px] top-[70px] text-[10px] text-ink">{price.note}</p>
          </div>
          {stats.map((s, i) => (
            <div key={i} className="relative h-[100px] rounded-[14px] bg-paper">
              <p className="absolute left-[20px] top-[24px] text-[10px] font-medium uppercase leading-[15px] text-[#181818]">
                {s.label}
              </p>
              {s.sub && <p className="absolute left-[20px] top-[40px] text-[10px] text-ink">{s.sub}</p>}
              <p className="absolute bottom-[10px] right-[20px] text-[44px] font-bold leading-none text-ink">
                {s.value}
                {s.unit && <span className="ml-[4px] text-[22px]">{s.unit}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Таймлайны */}
        <div className="mt-[26px] flex flex-col gap-[26px]">
          <MobileColumn col={budget} />
          <MobileColumn col={contract} />
        </div>

        {/* Вступительные экзамены */}
        <h3 className="mt-[30px] text-[18px] font-bold leading-[24px] text-ink">{exams.title}</h3>
        <p className="mt-[6px] whitespace-pre-line text-[12px] leading-[16px] text-ink">{exams.caption}</p>
        <div className="mt-[16px] flex flex-col gap-[16px]">
          {exams.rows.map((r, i) => (
            <div key={i} className="overflow-hidden rounded-[14px] border border-[#ececec]">
              <div className="flex h-[42px] items-center justify-center bg-lime text-[14px] font-medium text-ink">
                {r.subject}
              </div>
              <div className="flex h-[44px] items-center justify-center border-b border-[#ececec] text-[14px] text-ink">
                {r.required}
              </div>
              <div className="grid grid-cols-2 text-[14px] text-ink">
                <div className="flex h-[44px] items-center justify-center">Бюджет: {r.budget}</div>
                <div className="flex h-[44px] items-center justify-center border-l border-[#ececec]">
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
