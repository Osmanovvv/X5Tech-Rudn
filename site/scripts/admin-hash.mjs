// Генерация scrypt-хэша пароля администратора для .env (Task B2).
// Запуск:  npm run admin:hash
// Пароль вводится с клавиатуры и НЕ показывается на экране.
//
// Почему не аргументом командной строки: аргументы видны всем пользователям системы в `ps`,
// сохраняются в истории командной оболочки и попадают в отладочные журналы npm.
//
// Хэш считается ТЕМ ЖЕ кодом, что проверяет пароль при входе (lib/server/password.ts).
// Раньше скрипт повторял параметры scrypt у себя, и при их расхождении сгенерированный
// хэш молча переставал подходить — вход в админку ломался без единого сообщения.
import { createInterface } from "node:readline";
import { hashPassword } from "../lib/server/password.ts";

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Гасим эхо ввода: пароль не должен оставаться на экране и в скроллбэке терминала
    const onData = () => rl.output.write("\x1B[2K\x1B[200D" + question);
    rl.output.write(question);
    process.stdin.on("data", onData);
    rl.question("", (answer) => {
      process.stdin.off("data", onData);
      rl.output.write("\n");
      rl.close();
      resolve(answer);
    });
  });
}

// Совместимость: если пароль всё же передали аргументом — используем, но предупреждаем.
let password = process.argv[2];
if (password) {
  console.warn(
    "\nПредупреждение: пароль передан аргументом командной строки — он останется в истории\n" +
      "оболочки и виден в списке процессов. Надёжнее запускать `npm run admin:hash` без аргументов.\n",
  );
} else {
  password = await askHidden("Пароль администратора (ввод скрыт): ");
}

password = String(password ?? "").trim();
if (password.length < 12) {
  console.error("Пароль короче 12 символов — возьмите длиннее (это единственная защита админки).");
  process.exit(2);
}

// Разделитель «:» и параметры scrypt заданы в lib/server/password.ts — там же,
// где пароль проверяется при входе. Расходиться им теперь негде.
console.log("\nADMIN_PASSWORD_HASH=" + hashPassword(password));
console.log("\nСкопируйте строку в .env. Там же задайте ADMIN_USERNAME и SESSION_SECRET.");
console.log("SESSION_SECRET можно сгенерировать так:  npm run admin:secret\n");
