// «Преподаватели и эксперты» — секция 271:2112 (десктоп-нода 1115×828), мобильная зона 271:2313.
// Контент в content/teachers.json. Карточка едина для десктопа и мобилы: aspect-ratio 260/332 +
// проценты (у каждого фото свой кроп из ctx). Десктоп — сетка 4×2, мобила — стек. Переносы имён/
// специализаций одинаковы (ширина карточки ~260 в обоих), прошиты в json.
import { asset } from "@/lib/asset";
import teachers from "@/content/teachers.json";

type Teacher = { photo: string; crop: { h: number; top: number }; fill?: boolean; name: string; spec: string };
const T = teachers as { title: string; subtitle: string; subtitleM: string; teachers: Teacher[] };

function TeacherCard({ t }: { t: Teacher }) {
  return (
    <div className="relative aspect-[260/332] w-full overflow-hidden rounded-[18px] bg-[#d8d8d8]">
      {/* Фото (свой кроп; у Тынченко контейнер на всю высоту карточки) */}
      <div
        className={`absolute inset-x-0 top-0 overflow-hidden rounded-[20px] ${t.fill ? "h-full" : "h-[86.45%]"}`}
      >
        <img
          src={asset(`/img/07-prepodavateli/${t.photo}-640w.webp`)}
          alt={t.name.replace(/\n/g, " ")}
          className="absolute left-0 w-full max-w-none"
          style={{ height: `${t.crop.h}%`, top: `${t.crop.top}%` }}
        />
      </div>
      {/* Белая плашка с именем и специализацией */}
      <div className="absolute inset-x-0 top-[60.54%] h-[39.46%] rounded-b-[20px] border-t border-[#d5d5d5] bg-paper" />
      <p className="absolute left-[5.4%] top-[65.06%] whitespace-pre-line text-[15px] font-bold leading-[16px] text-ink">
        {t.name}
      </p>
      <p className="absolute left-[5.4%] top-[77.1%] whitespace-pre-line text-[12px] leading-[15px] text-[rgba(39,39,39,0.85)]">
        {t.spec}
      </p>
    </div>
  );
}

export default function Prepodavateli() {
  const { title, subtitle, subtitleM, teachers: list } = T;
  return (
    <section id="prepodavateli" aria-label="Преподаватели и эксперты">
      {/* ===== Десктоп: калька 1115×828 (зазор до предыдущей секции — 80px) ===== */}
      <div className="relative mx-auto mt-[80px] hidden h-[828px] max-w-[1115px] bg-white lg:block">
        <h2 className="absolute left-0 top-0 text-[42px] font-bold leading-[45px] tracking-[-1px] text-ink">
          {title}
        </h2>
        <p className="absolute left-0 top-[60px] whitespace-pre-line text-[16px] leading-[20px] text-[rgba(39,39,39,0.85)]">
          {subtitle}
        </p>
        {list.map((t, i) => (
          <div
            key={i}
            className="absolute w-[260px]"
            style={{ left: (i % 4) * 285, top: 132 + Math.floor(i / 4) * 364 }}
          >
            <TeacherCard t={t} />
          </div>
        ))}
      </div>

      {/* ===== Мобильная: вертикальный стек ===== */}
      <div className="bg-white px-[15px] pb-[10px] lg:hidden">
        <h2 className="pt-[30px] text-[22px] font-bold leading-[26px] text-ink">{title}</h2>
        <p className="mt-[12px] whitespace-pre-line text-[12px] leading-[18px] text-[rgba(39,39,39,0.85)]">
          {subtitleM}
        </p>
        <div className="mt-[20px] flex flex-col gap-[20px]">
          {list.map((t, i) => (
            <TeacherCard key={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
