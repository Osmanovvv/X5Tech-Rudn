// Реестр правовых страниц (Task 4.4). Единая точка: слаги здесь совпадают со ссылками в
// content/site.json (футер) и в согласиях формы. Тексты документов лежат отдельно, в
// content/legal-bodies.json — их присылает университет, и правятся они без кода.
// Страницы без текста остаются честными заглушками (см. app/(site)/docs/[slug]/page.tsx).
import legal from "@/content/legal.json";
import legalBodies from "@/content/legal-bodies.json";

export type LegalPage = { slug: string; title: string };

/** Блок текста документа. Ячейка таблицы — массив строк (в оригинале это список). */
export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][][] };

const pages = (legal as { pages: LegalPage[] }).pages;
const bodies = (legalBodies as { bodies: Record<string, LegalBlock[]> }).bodies;

export const allLegalPages = (): LegalPage[] => [...pages];

export const getLegalPage = (slug: string): LegalPage | undefined =>
  pages.find((p) => p.slug === slug);

/** Текст документа или undefined, если университет его ещё не прислал. */
export const getLegalBody = (slug: string): LegalBlock[] | undefined => {
  const body = bodies[slug];
  return body?.length ? body : undefined;
};
