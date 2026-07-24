// Генерация случайного SESSION_SECRET для .env (Task B2).
// Запуск:  npm run admin:secret
// Секретом подписывается сессионная кука админки. Держать в тайне; при смене все сессии
// администратора становятся недействительными (это штатный способ «разлогинить всех»).
import { randomBytes } from "node:crypto";

console.log("\nSESSION_SECRET=" + randomBytes(48).toString("base64url"));
console.log("\nСкопируйте строку в .env (не коммитить, не пересылать в мессенджерах).\n");
