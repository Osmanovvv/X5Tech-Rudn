// «Треки третьего курса» — секция 271:1984 (десктоп-нода 1130×475), мобильная зона 271:2313 (y≈6420–7860).
// Контент треков в content/tracks.json. Десктоп — калька: заголовок/подзаголовок + ряд из фото и 3 карточек-треков
// (иконка, заголовок, описание, 3D-иллюстрация с клипом). Мобильная — вертикальный флоу.
// Переносы текстов карточек одинаковы на десктопе и мобиле (ширина ~222px), прошиты в tracks.json жёсткими \n.
import { asset } from "@/lib/asset";
import tracks from "@/content/tracks.json";

type Track = { icon: string; illustration: string; title: string; subtitle: string };
const { title, subtitle, subtitleM, photo, tracks: TRACKS } = tracks as {
  title: string;
  subtitle: string;
  subtitleM: string;
  photo: string;
  tracks: Track[];
};

const img = (name: string, w?: string) =>
  asset(`/img/05-treki/${name}${w ? `-${w}` : ""}`);

// Параметры 3D-иллюстраций из ctx (контейнер + размер картинки + поворот с отражением по Y).
// Значения card-relative (карточка 260×300 на десктопе).
const ILLU = [
  { left: 71, bottom: -92, w: 277, h: 277, iw: 222, ih: 222, rot: 162.99 }, // NLP
  { left: 91, top: 156, w: 248, h: 249, iw: 177, ih: 178, rot: 143.66 }, // CV
  { left: 88, top: 112, w: 246, h: 265, iw: 217, ih: 238, rot: 172.36 }, // Транзакционные
];

// Размеры иконок из viewBox (SVG с preserveAspectRatio="none" — нужны точные w/h, иначе тянет)
const ICON = [
  { w: 32, h: 25 }, // NLP
  { w: 28, h: 28 }, // CV
  { w: 29, h: 28 }, // Транзакционные
];

function Illu({ src, i, scale = 1 }: { src: string; i: number; scale?: number }) {
  const p = ILLU[i];
  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center"
      style={{
        left: p.left * scale,
        top: p.top !== undefined ? p.top * scale : undefined,
        bottom: p.bottom !== undefined ? p.bottom * scale : undefined,
        width: p.w * scale,
        height: p.h * scale,
      }}
      aria-hidden
    >
      <div style={{ transform: `rotate(${p.rot}deg) scaleY(-1)` }}>
        <img
          src={src}
          alt=""
          className="max-w-none object-cover"
          style={{ width: p.iw * scale, height: p.ih * scale }}
        />
      </div>
    </div>
  );
}

function TrackCard({ track, i, mobile }: { track: Track; i: number; mobile?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden bg-paper transition-[box-shadow,transform] duration-200 ease-motion hover:-translate-y-[3px] hover:shadow-[0_0_0_2px_#b6e835] ${
        mobile ? "h-[300px] w-full rounded-[20px]" : "h-[300px] w-[260px] rounded-[20px]"
      }`}
    >
      <Illu src={img(track.illustration, "640w.webp")} i={i} scale={mobile ? 1.05 : 1} />
      <img
        src={img(track.icon + ".svg")}
        alt=""
        aria-hidden
        className="absolute left-[20px] top-[28px]"
        style={{ width: ICON[i].w, height: ICON[i].h }}
      />
      <p
        className="absolute left-[20px] whitespace-pre-line text-[14px] font-bold leading-[18px] text-ink"
        style={{ top: mobile ? 64 : 71 }}
      >
        {track.title}
      </p>
      <p
        className="absolute left-[20px] whitespace-pre-line text-[12px] leading-[16px] text-ink"
        style={{ top: mobile ? 112 : 118 }}
      >
        {track.subtitle}
      </p>
    </div>
  );
}

export default function Treki() {
  return (
    <section id="treki" aria-label="Треки третьего курса">
      {/* ===== Десктоп: калька 1130×475 (зазор до предыдущей секции — 80px по макету) ===== */}
      <div className="calque-1200 relative mx-auto mt-[80px] hidden h-[475px] max-w-[1130px] overflow-hidden bg-white md:block">
        <h2 data-reveal className="absolute left-0 top-0 whitespace-pre-line text-[42px] font-bold leading-[45px] tracking-[-1px] text-ink">
          {title}
        </h2>
        <p data-reveal className="absolute left-0 top-[107px] whitespace-pre-line text-[16px] leading-[20px] text-[rgba(39,39,39,0.85)]">
          {subtitle}
        </p>

        {/* Фото-карточка: в макете отражена по горизонтали + особый вертикальный кроп (ctx 271:2013).
            translate (reveal) не конфликтует с inline transform:scaleX(-1) — это разные свойства. */}
        <div
          data-reveal
          data-i="1"
          className="absolute left-0 top-[175px] h-[300px] w-[259px] overflow-hidden rounded-[20px]"
          style={{ transform: "scaleX(-1)" }}
        >
          <img
            src={img(photo, "640w.webp")}
            alt="Студенты факультета искусственного интеллекта"
            className="absolute left-0 w-full max-w-none"
            style={{ height: "154.68%", top: "-27.34%" }}
          />
        </div>

        {/* 3 карточки-трека — каскад слева направо после фото */}
        {TRACKS.map((track, i) => (
          <div key={i} data-reveal data-i={String(i + 2)} className="absolute top-[175px]" style={{ left: 290 + i * 290 }}>
            <TrackCard track={track} i={i} />
          </div>
        ))}
      </div>

      {/* ===== Мобильная: вертикальный флоу ===== */}
      <div className="canvas-320 bg-white px-[15px] pb-[10px] md:hidden">
        <h2 data-reveal className="whitespace-pre-line pt-[30px] text-[22px] font-bold leading-[26px] tracking-[-0.3px] text-ink">
          {title}
        </h2>
        <p data-reveal className="mt-[12px] whitespace-pre-line text-[12px] leading-[18px] text-[rgba(39,39,39,0.85)]">
          {subtitleM}
        </p>

        <div
          data-reveal
          className="relative mt-[20px] w-full overflow-hidden rounded-[10px]"
          style={{ aspectRatio: "290/335", transform: "scaleX(-1)" }}
        >
          <img
            src={img(photo, "640w.webp")}
            alt="Студенты факультета искусственного интеллекта"
            className="absolute left-0 w-full max-w-none"
            style={{ height: "154.68%", top: "-27.34%" }}
          />
        </div>

        <div data-reveal className="mt-[20px] flex flex-col gap-[20px]">
          {TRACKS.map((track, i) => (
            <TrackCard key={i} track={track} i={i} mobile />
          ))}
        </div>
      </div>
    </section>
  );
}
