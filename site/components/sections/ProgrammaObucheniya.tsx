// «Программа обучения» — секция 271:1884 (десктоп-нода 1130×1879), мобильная зона 271:2313 (y≈3688–6290).
// Контент курсов/дисциплин/статистики вынесен в content/program.json (требование ТЗ — редактируется без кода).
// Десктоп — абсолютная калька: таймлайн слева, чипы дисциплин flex-wrap (ширина колонки 600px повторяет
// раскладку макета), 3 фото + стат-карточка «50%+», лавандовая плашка. Мобильная — вертикальный флоу.
import { asset } from "@/lib/asset";
import program from "@/content/program.json";

type Discipline = string | { label: string; ghost?: boolean; m?: string };
type Course = {
  num: string;
  name: string;
  subtitle: string;
  subM?: string;
  photo?: string;
  stat?: boolean;
  disciplines: Discipline[];
};

const { title, badge, badgeM, courses, highlight, stat } = program as {
  title: string;
  badge: string;
  badgeM: string;
  courses: Course[];
  highlight: { after: number; title: string; text: string };
  stat: { value: string; note: string };
};

const dLabel = (d: Discipline) => (typeof d === "string" ? d : d.label);
const dGhost = (d: Discipline) => (typeof d === "string" ? false : !!d.ghost);
// Мобильная форма чипа: точные переносы из макета (жёсткие \n), иначе — та же подпись
const dMobile = (d: Discipline) => (typeof d === "string" ? d : d.m || d.label);

// Визуальные якоря десктоп-кальки (в системе координат ноды 271:1884)
type Anchor = { head: number; sub: number; chips: number; dot: number; photo?: { top: number; h: number } };
const DESK: Anchor[] = [
  { head: 181, sub: 228, chips: 273, dot: 183, photo: { top: 181, h: 270 } },
  { head: 531, sub: 578, chips: 623, dot: 548, photo: { top: 531, h: 335 } },
  { head: 946, sub: 993, chips: 1038, dot: 962, photo: { top: 946, h: 335 } },
  { head: 1479, sub: 1526, chips: 1571, dot: 1496 },
];

function Chip({ d, mobile }: { d: Discipline; mobile?: boolean }) {
  const ghost = dGhost(d);
  return (
    <span
      className={`rounded-[20px] border border-[#b6e835] text-ink ${
        ghost ? "bg-transparent" : "bg-white"
      } ${
        mobile
          ? "inline-flex w-fit items-center whitespace-pre px-[16px] py-[9px] text-[13px] leading-[18px]"
          : "inline-flex h-[39px] items-center whitespace-nowrap px-[19px] text-[14px] leading-none"
      }`}
    >
      {mobile ? dMobile(d) : dLabel(d)}
    </span>
  );
}

function StatNote({ mobile }: { mobile?: boolean }) {
  // «стажеров переходят в штат в X5 Tech» — 3 строки на десктопе, 2 на мобиле; «X5 Tech» — medium
  const x5 = (
    <>
      в штат в <span className="font-medium">X5 Tech</span>
    </>
  );
  if (mobile) {
    return (
      <p className="text-[14px] leading-[18px] text-ink">
        стажеров
        <br />
        переходят
        <br />
        {x5}
      </p>
    );
  }
  return (
    <p className="text-[16px] leading-[22px] text-ink">
      стажеров
      <br />
      переходят
      <br />
      {x5}
    </p>
  );
}

function StatCard({ mobile }: { mobile?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#f0efff] ${
        mobile ? "h-[200px] rounded-[14px]" : "h-full rounded-[15px]"
      }`}
    >
      {/* Блоб-иллюстрация правого-нижнего угла — чёткая вырезка из эталона (с тенью) */}
      <img
        src={asset("/img/04-programma-obucheniya/stat-blob.webp")}
        alt=""
        aria-hidden
        className={
          mobile
            ? "absolute bottom-0 right-0 w-[175px]"
            : "absolute left-[150px] top-[88px] h-[222px] w-[290px]"
        }
      />
      <div className="relative">
        <p
          className={`font-bold text-ink ${
            mobile ? "pl-[20px] pt-[18px] text-[44px] leading-none" : "pl-[38px] pt-[30px] text-[80px] leading-none"
          }`}
        >
          {stat.value}
        </p>
        <div className={mobile ? "pl-[20px] pt-[12px]" : "pl-[38px] pt-[19px]"}>
          <StatNote mobile={mobile} />
        </div>
      </div>
    </div>
  );
}

export default function ProgrammaObucheniya() {
  return (
    <section aria-label={title}>
      {/* ===== Десктоп: калька 1130×1879 ===== */}
      <div className="relative mx-auto hidden h-[1879px] max-w-[1130px] overflow-hidden bg-white lg:block">
        {/* Заголовок + бейдж */}
        <h2 className="absolute left-0 right-0 top-[4px] text-center text-[42px] font-bold leading-[normal] tracking-[-1.26px] text-ink">
          {title}
        </h2>
        <p className="absolute left-1/2 top-[65px] flex h-[36px] w-[537px] -translate-x-1/2 items-center justify-center rounded-full border border-[#b6e835] px-[24px] text-center font-mono text-[12px] uppercase leading-[normal] text-ink">
          {badge}
        </p>

        {/* Таймлайн слева: серая линия + зелёный верхний сегмент + квадратные точки */}
        <div className="absolute left-[6px] top-[193px] h-[1686px] w-px bg-[#d8d8d8]" aria-hidden />
        <div className="absolute left-[5px] top-[193px] h-[104px] w-[3px] bg-[#b6e835]" aria-hidden />
        {DESK.map((c, i) => (
          <div
            key={i}
            className="absolute left-0 size-[14px] rounded-[10px] bg-[#b6e835]"
            style={{ top: c.dot }}
            aria-hidden
          />
        ))}

        {/* Курсы: заголовок, подзаголовок, чипы (flex-wrap в колонке 600px) */}
        {courses.map((course, i) => {
          const L = DESK[i];
          return (
            <div key={i}>
              <h3
                className="absolute left-[50px] text-[28px] font-bold leading-[42px] text-ink"
                style={{ top: L.head }}
              >
                {course.num}: {course.name}
              </h3>
              <p
                className="absolute left-[50px] text-[16px] leading-[24px] text-[rgba(39,39,39,0.85)]"
                style={{ top: L.sub }}
              >
                {course.subtitle}
              </p>
              <div
                className="absolute left-[50px] flex w-[600px] flex-wrap gap-[12px]"
                style={{ top: L.chips }}
              >
                {course.disciplines.map((d, j) => (
                  <Chip key={j} d={d} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Фото курсов справа (690…1130) */}
        {courses.map((course, i) =>
          course.photo ? (
            <img
              key={i}
              src={asset(`/img/04-programma-obucheniya/${course.photo}-880w.webp`)}
              alt=""
              className="absolute left-[690px] w-[440px] rounded-[15px] object-cover"
              style={{ top: DESK[i].photo!.top, height: DESK[i].photo!.h }}
            />
          ) : null,
        )}

        {/* Лавандовая плашка после 3 курса */}
        <div className="absolute left-[50px] right-0 top-[1308px] h-[91px] rounded-[12px] bg-[#ebeaff]">
          <p className="absolute left-[32px] top-[21px] text-[16px] font-bold leading-[24px] text-ink">
            {highlight.title}
          </p>
          <p className="absolute left-[32px] top-[49px] text-[14px] leading-[21px] text-ink">
            {highlight.text}
          </p>
        </div>

        {/* Стат-карточка «50%+» (место 4 курса справа) */}
        <div className="absolute left-[690px] top-[1554px] h-[310px] w-[440px]">
          <StatCard />
        </div>
      </div>

      {/* ===== Мобильная: вертикальный флоу ===== */}
      <div className="bg-white px-[15px] pb-[10px] lg:hidden">
        <h2 className="pt-[30px] text-center text-[22px] font-bold leading-[26px] tracking-[-0.5px] text-ink">
          {title}
        </h2>
        <p className="mx-auto mt-[16px] w-fit whitespace-pre-line rounded-[18px] border border-[#b6e835] px-[24px] py-[10px] text-center font-mono text-[11px] uppercase leading-[16px] text-ink">
          {badgeM}
        </p>

        <div className="mt-[24px] flex flex-col gap-[30px]">
          {courses.map((course, i) => (
            <div key={i}>
              <h3 className="text-[22px] font-bold leading-[26px] text-ink">
                {course.num}: {course.name}
              </h3>
              <p className="mt-[5px] whitespace-pre-line text-[13px] leading-[18px] text-[rgba(39,39,39,0.85)]">
                {course.subM || course.subtitle}
              </p>

              {course.stat ? (
                <div className="mt-[18px]">
                  <StatCard mobile />
                </div>
              ) : (
                <img
                  src={asset(`/img/04-programma-obucheniya/${course.photo}-640w.webp`)}
                  alt=""
                  className="mt-[18px] block w-full rounded-[14px] object-cover"
                  style={{ aspectRatio: [`290/178`, `290/221`, `290/215`][i] }}
                />
              )}

              <div className="mt-[18px] flex flex-col items-start gap-[10px]">
                {course.disciplines.map((d, j) => (
                  <Chip key={j} d={d} mobile />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
