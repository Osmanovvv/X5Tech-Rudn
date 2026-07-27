// Правовые страницы /docs/<slug>/ (Task 4.4). Слаги — из content/legal.json (совпадают со
// ссылками футера и согласиями формы). Тексты предоставит университет: пока честная заглушка
// «раздел в подготовке» + контакт. SSG под output:'export', dynamicParams=false.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/content/site.json";
import { abs } from "@/lib/seo";
import { allLegalPages, getLegalPage } from "@/lib/legal";

export const dynamicParams = false;

const contactEmail =
  site.footer.contacts.find((c) => c.href.startsWith("mailto:"))?.href.replace("mailto:", "") ??
  "ai@rudn.ru";

export function generateStaticParams() {
  return allLegalPages().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: `${page.title}. Официальная информация факультета искусственного интеллекта РУДН и X5 Tech.`,
    alternates: { canonical: abs(`/docs/${page.slug}/`) },
    // Заглушки до текстов от университета — в индекс их пускать нельзя (тонкий контент)
    robots: { index: false, follow: true },
  };
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();

  return (
    <main className="bg-white">
      <div className="container-site pb-[80px] pt-[28px] md:pt-[48px]">
        <div className="mx-auto max-w-[760px]">
          <nav aria-label="Хлебные крошки" className="text-[13px] text-[rgba(39,39,39,0.72)]">
            <Link href="/" className="transition-colors duration-200 ease-motion hover:text-ink">
              Главная
            </Link>
            <span className="mx-[8px]" aria-hidden>
              /
            </span>
            <span className="text-ink">Документы</span>
          </nav>

          <h1 className="mt-[16px] text-[28px] font-bold leading-[1.15] tracking-[-0.5px] text-ink md:mt-[20px] md:text-[38px] md:tracking-[-0.7px]">
            {page.title}
          </h1>

          <div className="mt-[24px] rounded-[15px] border border-hairline bg-paper p-[24px] md:p-[32px]">
            <p className="text-[15px] leading-[24px] text-ink md:text-[16px]">
              Раздел находится в подготовке. Полный текст документа будет опубликован университетом.
            </p>
            <p className="mt-[14px] text-[14px] leading-[22px] text-[rgba(39,39,39,0.85)]">
              По вопросам приёма и документов напишите на{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-[#3b63c9] underline underline-offset-2"
              >
                {contactEmail}
              </a>{" "}
              — ответим и всё расскажем.
            </p>
          </div>

          <Link
            href="/"
            className="mt-[28px] inline-flex h-[45px] items-center rounded-[5px] border border-hairline px-[24px] text-[13px] font-bold text-ink transition-colors duration-200 ease-motion hover:bg-[#f5f5f5]"
          >
            ← На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
