// Layout публичной части: шапка, футер, motion-обвязка. Группа (site) не влияет на URL —
// маршруты остаются /, /news, /docs/*. Отделена от /admin, у которой своё окружение (Task B2).
import SiteChrome from "@/components/SiteChrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
