// «Треки третьего курса» — секция 271:1984 (десктоп-нода 1130×475), мобильная зона 271:2313 (y≈6420–7860).
// Контент треков в content/tracks.json. Десктоп — калька: заголовок/подзаголовок + ряд из фото и 3 карточек-треков
// (иконка, заголовок, описание, 3D-иллюстрация с клипом). Мобильная — вертикальный флоу.
// Переносы текстов карточек одинаковы на десктопе и мобиле (ширина ~222px), прошиты в tracks.json жёсткими \n.
import { asset } from "@/lib/asset";
import tracks from "@/content/tracks.json";

type Track = { icon: string; illustration: string; title: string; subtitle: string };
// satisfies вместо as: форма контентного JSON проверяется, а не переопределяется
const { title, subtitle, subtitleM, photo, tracks: TRACKS } = tracks satisfies {
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
// mleft — левая координата в мобильном макете: там карточка на 30px шире, но сама
// иллюстрация того же размера и на той же высоте, сдвинута только вправо (было масштабирование
// ×1.05, из-за него объём лез под текст сильнее макетного).
const ILLU = [
  { left: 71, mleft: 94, bottom: -92, w: 277, h: 277, iw: 222, ih: 222, rot: 162.99 }, // NLP
  { left: 91, mleft: 127, top: 156, w: 248, h: 249, iw: 177, ih: 178, rot: 143.66 }, // CV
  { left: 88, mleft: 118, top: 112, w: 246, h: 265, iw: 217, ih: 238, rot: 172.36 }, // Транзакционные
];

// Размеры иконок из viewBox (SVG с preserveAspectRatio="none" — нужны точные w/h, иначе тянет)
const ICON = [
  { w: 32, h: 25 }, // NLP
  { w: 28, h: 28 }, // CV
  { w: 29, h: 28 }, // Транзакционные
];

function Illu({ src, i, mobile }: { src: string; i: number; mobile?: boolean }) {
  const p = ILLU[i];
  return (
    <div
      className="pointer-events-none absolute flex items-center justify-center"
      style={{
        left: mobile ? p.mleft : p.left,
        top: p.top,
        bottom: p.bottom,
        width: p.w,
        height: p.h,
      }}
      aria-hidden
    >
      <div style={{ transform: `rotate(${p.rot}deg) scaleY(-1)` }}>
        <img
          loading="lazy"
          src={src}
          alt=""
          className="max-w-none object-cover"
          style={{ width: p.iw, height: p.ih }}
        />
      </div>
    </div>
  );
}

function TrackCard({ track, i, mobile }: { track: Track; i: number; mobile?: boolean }) {
  return (
    <div
      className={`group relative overflow-hidden bg-paper transition-transform duration-200 ease-motion hover:-translate-y-[3px] ${
        mobile ? "h-[300px] w-full rounded-[20px]" : "h-[300px] w-[260px] rounded-[20px]"
      }`}
    >
      <Illu src={img(track.illustration, "640w.webp")} i={i} mobile={mobile} />
      <img
        loading="lazy"
        src={img(track.icon + ".svg")}
        alt=""
        aria-hidden
        className="absolute"
        style={{ left: mobile ? 25 : 20, top: mobile ? 25 : 28, width: ICON[i].w, height: ICON[i].h }}
      />
      <p
        className={`absolute whitespace-pre-line font-bold text-ink ${
          mobile ? "text-[15px] leading-[19px]" : "text-[14px] leading-[18px]"
        }`}
        style={{ left: mobile ? 25 : 20, top: mobile ? 68 : 71 }}
      >
        {track.title}
      </p>
      {/* Переносы из tracks.json — они же и в мобильном макете (сверено по эталонному
          рендеру section-05-treki.png). Кегль на мобильной поднят с 12 до 13 по просьбе
          заказчика (docs/deviations.md D10) — от этого строки становятся шире на те же
          8%, а разбивка остаётся макетной. Выше нельзя: у карточки «Компьютерное зрение»
          строка «детекция объектов, сегментация,» при 14px занимает 258px при 250
          свободных в карточке. */}
      <p
        className={`absolute whitespace-pre-line text-ink ${
          mobile ? "text-[13px] leading-[17px]" : "text-[12px] leading-[16px]"
        }`}
        style={{ left: mobile ? 25 : 20, top: mobile ? 114 : 118 }}
      >
        {track.subtitle}
      </p>
      {/* Подсветка при наведении — отдельным слоем ВНУТРИ карточки, а не тенью снаружи.
          Крайняя правая карточка стоит вплотную к краю секции (обе кромки на 1205), а секция
          обрезает содержимое: внешнее кольцо у неё срезалось ровно на эти 2px, и карточка
          выглядела «надкусанной». Слой лежит после иллюстрации, поэтому виден и поверх неё. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] border-2 border-lime opacity-0 transition-opacity duration-200 ease-motion group-hover:opacity-100"
      />
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
            loading="lazy"
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
      <div className="canvas-320 bg-white px-[15px] pb-[35px] md:hidden">
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
            loading="lazy"
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
