import type { NextConfig } from "next";

// Dual-mode (Task B0, см. docs/superpowers/plans/2026-07-24-backend.md):
//   по умолчанию   — 'standalone': самодостаточный Node-сервер (.next/standalone/server.js)
//                    для деплоя на VPS с админкой /admin и приёмом заявок /api;
//   STATIC=1        — 'export': прежняя статика out/ (запасной путь без Node).
// Маркетинговые страницы в ОБОИХ режимах остаются статически пререндеренными (SSG) —
// динамика только у /admin и /api/**. Визуал точек 320/1200 заморожен в любом режиме.
const nextConfig: NextConfig = {
  output: process.env.STATIC ? "export" : "standalone",
  // news/<slug>/index.html вместо news/<slug>.html — отдаётся любым статик-сервером
  trailingSlash: true,
  // Размещение в подпапке домена клиента: NEXT_PUBLIC_BASE_PATH=/ai npm run build
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  // Оптимизацию изображений делает scripts/optimize-images.mjs на этапе подготовки ассетов
  images: { unoptimized: true },
  // Кружок-индикатор dev-режима попадает в скриншоты пиксель-сверки
  devIndicators: false,
};

export default nextConfig;
