// Определение адреса клиента для ограничения частоты запросов. ТОЛЬКО СЕРВЕР.
//
// Почему нельзя просто взять X-Forwarded-For: рекомендованный в README nginx ставит
//   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
// а эта директива ДОПИСЫВАЕТ реальный адрес к присланному клиентом. Значит содержимое списка
// частично подконтрольно атакующему, и ключ счётчика можно менять на каждый запрос — защита от
// перебора пароля админки и лимит заявок переставали бы работать вовсе.
//
// Доверяем ТОЛЬКО X-Real-IP: nginx (см. README) заполняет его из $remote_addr, перезаписывая
// присланное клиентом значение. Если заголовка нет — считаем, что доверенного прокси перед нами
// нет, и НЕ доверяем никаким заголовкам: все такие запросы получают один общий ключ. Лимит при
// этом становится строже (одно ведро на всех), но обойти его подстановкой заголовка нельзя.
//
// Если в конкретной установке прокси заполняет только X-Forwarded-For, клиент может явно
// разрешить его через TRUST_FORWARDED_FOR=1 — тогда берётся ПОСЛЕДНИЙ элемент списка
// (его дописал прокси, а не клиент).
import { headers } from "next/headers";

const TRUST_XFF = process.env.TRUST_FORWARDED_FOR === "1";

export async function clientIp(): Promise<string> {
  const h = await headers();

  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  if (TRUST_XFF) {
    const parts = (h.get("x-forwarded-for") ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }

  // Доверенного источника адреса нет: общий ключ вместо подконтрольного клиенту значения.
  return "no-trusted-proxy";
}
