import type { NextConfig } from "next";

// Статический экспорт: сайт сдаётся папкой out/ и работает на любом сервере
// без Node (см. docs/superpowers/plans/2026-07-21-rudn-frontend.md).
const nextConfig: NextConfig = {
  output: "export",
  // news/<slug>/index.html вместо news/<slug>.html — отдаётся любым статик-сервером
  trailingSlash: true,
  // Размещение в подпапке домена клиента: NEXT_PUBLIC_BASE_PATH=/ai npm run build
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  // Оптимизацию изображений делает scripts/optimize-images.mjs на этапе подготовки ассетов
  images: { unoptimized: true },
};

export default nextConfig;
