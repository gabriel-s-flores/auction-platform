import globals from "globals";

import reactConfig from "../../packages/config/eslint/react.mjs";

export default [
  ...reactConfig,
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
  },
];
