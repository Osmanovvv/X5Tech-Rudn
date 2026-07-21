// Префикс basePath для статических ассетов (размещение сайта в подпапке домена).
// NEXT_PUBLIC_BASE_PATH инлайнится на сборке (см. next.config.ts).
export const asset = (path: string): string =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
