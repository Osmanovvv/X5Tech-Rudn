// Префикс basePath для статических ассетов (размещение сайта в подпапке домена).
// NEXT_PUBLIC_BASE_PATH инлайнится на сборке (см. next.config.ts).
export const asset = (path: string): string =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

// Тот же basePath-префикс, но для внутренних URL-путей в метаданных (canonical). Метаданные
// Next НЕ применяют basePath к относительному canonical (проверено), поэтому при деплое в
// подпапку canonical иначе теряет префикс и указывает на несуществующий URL. Task 5.1 сделает
// canonical абсолютным через metadataBase — тогда это станет частью абсолютного URL.
export const withBasePath = asset;
