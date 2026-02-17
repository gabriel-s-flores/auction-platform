import queryPlugin from "@tanstack/eslint-plugin-query";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import tailwindPlugin from "eslint-plugin-tailwindcss";
import globals from "globals";

import baseConfig from "./base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.{tsx,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      tailwindcss: tailwindPlugin,
      "@tanstack/query": queryPlugin,
    },
    settings: {
      react: {
        version: "18.3.1",
      },
      tailwindcss: {
        callees: ["clsx", "cva", "cn"],
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...tailwindPlugin.configs.recommended.rules,
      ...queryPlugin.configs["flat/recommended"][0].rules,
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "sonarjs/prefer-read-only-props": "off",
    },
  },
];
