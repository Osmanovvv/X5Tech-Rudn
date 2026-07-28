// Статический анализ (flat config, ESLint 9).
//
// Набор правил подобран так, чтобы ловить настоящие дефекты, а не спорить о стиле:
// форматирование не проверяется вовсе (Prettier в проекте нет — осознанно, см. README),
// зато включены правила про плавающие промисы, необработанные ошибки и мёртвый код.
//
// Порядок блоков важен: eslint-config-next ставит собственный парсер, поэтому
// типизированные правила подключаются ПОСЛЕ него и только для .ts/.tsx — иначе
// парсер Next затирает @typescript-eslint/parser и типовые правила падают.
import js from "@eslint/js";
import next from "eslint-config-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next/**", "out/**", "node_modules/**", "public/**", "next-env.d.ts", "*.config.mjs"],
  },
  js.configs.recommended,
  ...next,
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Пропущенный await у записи в файл или у сессии — тихая потеря данных,
      // а не стилистика: такие ошибки не видны ни в типах, ни в e2e
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",

      // Приведения типов прячут настоящие несоответствия
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-explicit-any": "error",

      // Неиспользованное — либо забытый код, либо признак недоделанной правки.
      // Префикс «_» оставляет лазейку для намеренно неиспользуемых аргументов.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // console.log в проде — мусор в журнале systemd. warn/error оставляем:
      // ими сообщается о неверной конфигурации, это по делу
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // <img> здесь осознан, а не недосмотр. next/image требует рантайм-оптимизатора,
      // которого нет в статическом режиме сборки (`output: export`), и подставляет
      // собственную обёртку с инлайновыми стилями — то есть меняет разметку и раскладку.
      // Размеры и srcset готовит наш конвейер ассетов (scripts/optimize-images.mjs),
      // ширины взяты из макета. Замена сломала бы пиксельную сверку с Figma.
      "@next/next/no-img-element": "off",
    },
  },
  {
    // Скрипты сборки и проверок — инструменты разработчика, а не код продукта:
    // консоль им нужна по назначению, типов в .mjs нет
    files: ["scripts/**/*.mjs"],
    rules: { "no-console": "off", "@typescript-eslint/no-unused-vars": "off" },
  },
  {
    // node:test возвращает промис из test(), но ожидать его не требуется — так устроен
    // сам запускатель. Здесь правило дало бы ложные срабатывания на каждом тесте.
    files: ["**/*.test.ts"],
    rules: { "@typescript-eslint/no-floating-promises": "off" },
  },
);
