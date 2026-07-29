// sitemap.xml (Task 5.1). Абсолютные URL с trailingSlash — ровно те, что отдаёт сайт.
// Из правовых /docs/* сюда идут только страницы с присланным текстом — ровно те, которым
// generateMetadata ставит index. Остальные пока заглушки, они noindex и в карте не нужны.
// lastModified берётся из дат новостей, а не из времени сборки, — иначе sitemap менялся бы
// при каждой пересборке и робот ходил бы вхолостую.
import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";
import { getAllNews } from "@/lib/server/news-store";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const news = getAllNews();
  const newest = news[0]?.date;

  return [
    { url: abs("/"), lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: abs("/news/"), lastModified: newest, changeFrequency: "weekly", priority: 0.6 },
    ...news.map((item) => ({
      url: abs(`/news/${item.slug}/`),
      lastModified: item.date,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
