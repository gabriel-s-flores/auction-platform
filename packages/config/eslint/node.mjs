import globals from "globals";
import pluginN from "eslint-plugin-n";

import baseConfig from "./base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.{ts,js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        Bun: "readonly",
      },
    },
    plugins: {
      n: pluginN,
    },
    rules: {
      ...pluginN.configs["recommended"].rules,
      "n/no-missing-import": "off",
      "n/no-unpublished-import": "off",
      "n/no-extraneous-import": "off",
    },
  },
];
