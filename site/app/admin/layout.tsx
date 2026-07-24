// Оболочка админки (Task B2). Внутренний инструмент: пиксель-сверке не подлежит, но
// использует те же токены сайта, чтобы выглядеть единообразно.
//
// ВНИМАНИЕ: здесь НЕТ проверки доступа. Layout не выполняется при вызове Server Actions и
// роутов /api, поэтому защита стоит в каждой странице (requireAdmin) и в каждом действии —
// см. lib/server/auth.ts.
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
