import globals from "globals";
import baseConfig from "./base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.{ts,js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        Bun: "readonly"
      }
    }
  }
];
