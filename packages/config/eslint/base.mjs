import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginPromise from "eslint-plugin-promise";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import pluginSonarjs from "eslint-plugin-sonarjs";

export default [
  {
    ignores: ["**/dist/**", "**/build/**", "**/coverage/**", "**/node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        projectService: {
          allowDefaultProject: [
            "*.mjs",
            "*.js",
            "*.cjs",
            "packages/config/eslint/*.mjs",
            "apps/api/eslint.config.mjs",
            "apps/api/prisma/seed.ts",
            "apps/web/*.cjs",
            "prisma/seed.ts",
          ],
          defaultProject: "tsconfig.json",
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "simple-import-sort": simpleImportSort,
      promise: pluginPromise,
      sonarjs: pluginSonarjs,
    },
    rules: {
      ...pluginPromise.configs.recommended.rules,
      ...pluginSonarjs.configs.recommended.rules,
      "no-unused-vars": "off",
      "no-console": "error",
      eqeqeq: ["error", "always"],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
  eslintConfigPrettier,
];
