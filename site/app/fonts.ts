import localFont from "next/font/local";

// ВРЕМЕННЫЙ шрифт вёрстки: Inter вместо фирменного X5 Sans (файлы ждём от клиента).
// Когда X5 Sans придёт (Task 5.2): заменить src на X5Sans-*.woff2 с теми же весами
// и пересверить все секции — метрики шрифтов различаются.
export const fontSans = localFont({
  src: [
    { path: "./fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
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
