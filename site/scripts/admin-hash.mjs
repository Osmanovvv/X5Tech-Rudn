// Генерация scrypt-хэша пароля администратора для .env (Task B2).
// Запуск:  npm run admin:hash -- "ваш-пароль"
// Вывод — строка вида scrypt$<соль>$<хэш>, её нужно положить в ADMIN_PASSWORD_HASH.
// Пароль в открытом виде никуда не сохраняется: ни в файл, ни в репозиторий.
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Использование: npm run admin:hash -- "ваш-пароль"');
  process.exit(2);
}
if (password.length < 12) {
  console.error("Пароль короче 12 символов — возьмите длиннее (это единственная защита админки).");
  process.exit(2);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password.normalize("NFKC"), salt, 64).toString("hex");

console.log("\nADMIN_PASSWORD_HASH=" + `scrypt$${salt}$${hash}`);
console.log("\nСкопируйте строку в .env. Там же задайте ADMIN_USERNAME и SESSION_SECRET.");
console.log("SESSION_SECRET можно сгенерировать так:  npm run admin:secret\n");
