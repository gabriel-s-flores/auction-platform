import reactConfig from "../config/eslint/react.mjs";

export default [
  ...reactConfig,
  {
    rules: {
      "tailwindcss/classnames-order": "off",
      "tailwindcss/migration-from-tailwind-2": "off",
      "tailwindcss/no-arbitrary-value": "off",
      "tailwindcss/no-contradicting-classname": "off",
      "tailwindcss/no-unnecessary-arbitrary-value": "off",
    },
  },
];
