import queryPlugin from "@tanstack/eslint-plugin-query";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

import baseConfig from "./base.mjs";

export default [
  ...baseConfig,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
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
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      "@tanstack/query": queryPlugin,
    },
    rules: {
      ...jsxA11yPlugin.configs.recommended.rules,
      ...queryPlugin.configs["flat/recommended"][0].rules,
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "sonarjs/prefer-read-only-props": "off",
    },
  },
  {
    settings: {
      react: {
        version: "19.0.0",
      },
    },
  },
];
