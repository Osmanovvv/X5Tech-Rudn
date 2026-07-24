// Запасная статическая сборка (Task B0): STATIC=1 → next.config переключает output на 'export'
// и создаёт out/. Через Node-скрипт, а не «STATIC=1 next build», чтобы работало и на Windows
// (POSIX-префикс переменной там не поддерживается). Zero-dep — без cross-env.
import { execSync } from "node:child_process";

process.env.STATIC = "1";
execSync("next build --webpack", { stdio: "inherit" });
