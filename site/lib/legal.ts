// Реестр правовых страниц (Task 4.4). Единая точка: слаги здесь совпадают со ссылками в
// content/site.json (футер) и в согласиях формы. Тексты предоставит университет — сейчас
// страницы-заглушки (см. app/docs/[slug]/page.tsx и README).
import legal from "@/content/legal.json";

export type LegalPage = { slug: string; title: string };

const pages = (legal as { pages: LegalPage[] }).pages;

export const allLegalPages = (): LegalPage[] => [...pages];

export const getLegalPage = (slug: string): LegalPage | undefined =>
  pages.find((p) => p.slug === slug);
