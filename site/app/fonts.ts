import localFont from "next/font/local";

// Фирменный шрифт X5 Sans (ParaType для X5 Group) — Regular / Medium / Bold.
//
// Замена Inter на X5 Sans улучшила совпадение с эталонами Figma по всем секциям
// (hero 1.30 → 0.59%, «Грант» на мобильной 10.57 → 5.13%) — значит макеты отрисованы
// именно этим шрифтом. Геометрия блоков от шрифта почти не зависит: интерлиньяж и отступы
// заданы в пикселях, поэтому после подмены высоты секций сдвинулись не более чем на 13px.
//
// H1 первого экрана в макете формально набран Inter Bold (таких узлов в файле 93 против 805
// у X5 Sans) — отклонение D2. Сейчас весь сайт, включая H1, набран X5 Sans: это фирменный
// шрифт, и трактовать одиночные Inter-узлы как замысел дизайнера без его подтверждения
// не стоит. Файлы Inter оставлены в app/fonts на случай, если ответ будет обратным —
// в бандл они не попадают, next/font выгружает только то, на что есть ссылка.
export const fontSans = localFont({
  src: [
    { path: "./fonts/X5Sans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/X5Sans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/X5Sans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-x5",
  display: "swap",
  fallback: ["system-ui", "arial"],
});

// Бейджи-капсулы («НА РЕАЛЬНЫХ ДАННЫХ» и т.п.)
export const fontMono = localFont({
  src: [{ path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" }],
  variable: "--font-plex",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});
