// Правовые страницы /docs/<slug>/ (Task 4.4). Слаги — из content/legal.json (совпадают со
// ссылками футера и согласиями формы). Текст документа берётся из content/legal-bodies.json;
// если университет его ещё не прислал — честная заглушка «раздел в подготовке» + контакт.
// SSG под output:'export', dynamicParams=false.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import site from "@/content/site.json";
import { abs } from "@/lib/seo";
import { allLegalPages, getLegalBody, getLegalPage, type LegalBlock } from "@/lib/legal";

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
    // Страницу с настоящим текстом документа в индекс пускаем, заглушку — нет: это
    // тонкий контент, и в поиске ей не место
    robots: { index: Boolean(getLegalBody(slug)), follow: true },
  };
}

/* ── Блоки документа ── */

// Таблица целей обработки: на десктопе обычная таблица, на узком экране — карточки
// «подпись → значение». Горизонтальная прокрутка тут не годится: в ячейках сплошной текст.
function DocTable({ head, rows }: { head: string[]; rows: string[][][] }) {
  const cell = (lines: string[]) =>
    lines.length > 1 ? (
      <ul className="space-y-[4px]">
        {lines.map((l, i) => (
          <li key={i} className="flex gap-[8px]">
            <span className="mt-[9px] size-[4px] shrink-0 rounded-full bg-lime" aria-hidden />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    ) : (
      lines[0]
    );

  return (
    <>
      <div className="mt-[20px] hidden overflow-hidden rounded-[12px] border border-hairline md:block">
        <table className="w-full table-fixed border-collapse text-left align-top text-[14px] leading-[21px] text-ink">
          {/* Доли колонок заданы явно: у последней колонки короткие пункты списка, и при
              авторазметке она сжималась так, что «Телефонный номер» вставал в две строки */}
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[44%]" />
            <col className="w-[26%]" />
          </colgroup>
          <thead>
            <tr className="bg-mist">
              {head.map((h, i) => (
                <th key={i} scope="col" className="border-b border-hairline p-[14px] font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={i > 0 ? "border-t border-hairline" : ""}>
                {r.map((c, j) => (
                  <td key={j} className="p-[14px] align-top">
                    {cell(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-[20px] space-y-[14px] md:hidden">
        {rows.map((r, i) => (
          <div key={i} className="rounded-[12px] border border-hairline p-[16px]">
            {r.map((c, j) => (
              <div key={j} className={j > 0 ? "mt-[12px]" : ""}>
                <p className="text-[11px] font-bold uppercase leading-[15px] text-[rgba(39,39,39,0.6)]">
                  {head[j]}
                </p>
                <div className="mt-[4px] text-[14px] leading-[21px] text-ink">{cell(c)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function DocBody({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="mt-[24px]">
      {blocks.map((b, i) => {
        if (b.type === "table") return <DocTable key={i} head={b.head} rows={b.rows} />;
        if (b.type === "list")
          return (
            <ul key={i} className="mt-[14px] space-y-[8px]">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-[10px] text-[15px] leading-[24px] text-ink md:text-[16px]">
                  <span className="mt-[10px] size-[5px] shrink-0 rounded-full bg-lime" aria-hidden />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="mt-[14px] text-[15px] leading-[24px] text-ink first:mt-0 md:text-[16px]">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();
  const body = getLegalBody(slug);

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

          {body ? (
            <DocBody blocks={body} />
          ) : (
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
          )}

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
