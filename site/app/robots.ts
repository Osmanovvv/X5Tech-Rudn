// robots.txt (Task 5.1). Работает в обоих режимах сборки: Next выкладывает статический файл
// и в standalone, и в export.
//
// Пока siteUrl — плейсхолдер (…​.example), индексация закрыта целиком: canonical и sitemap в
// таком билде указывают на несуществующий домен, и пустить туда робота хуже, чем не пустить.
// Как только домен задан (content/site.json или NEXT_PUBLIC_SITE_URL), файл сам открывает сайт.
import type { MetadataRoute } from "next";
import { SITE_URL, IS_PLACEHOLDER_DOMAIN, abs } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (IS_PLACEHOLDER_DOMAIN) {
    console.warn(
      `\n[SEO] siteUrl не задан (${SITE_URL}) — robots.txt закрывает сайт от индексации.\n` +
        `      Перед публикацией: NEXT_PUBLIC_SITE_URL=https://домен npm run build\n` +
        `      или пропишите домен в content/site.json → siteUrl.\n`
    );
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: abs("/sitemap.xml"),
    host: SITE_URL,
  };
}
