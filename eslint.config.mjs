import nodeConfig from "./packages/config/eslint/node.mjs";
import reactConfig from "./packages/config/eslint/react.mjs";

const GLOBAL_IGNORES = [
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/node_modules/**",
  "**/.agent/**",
];

// Helper to filter out global ignores from imported configs
// (Config objects with 'ignores' but no 'files' are global ignores)
const filterGlobalIgnores = (config) => !(config.ignores && !config.files);

export default [
  { ignores: GLOBAL_IGNORES },

  // Node.js Configuration (API + Configs + Scripts)
  ...nodeConfig.filter(filterGlobalIgnores).map((config) => ({
    ...config,
    files: [
      "apps/api/**/*.{ts,js,mjs}",
      "packages/config/**/*.{ts,js,mjs}",
      "packages/shared-types/**/*.{ts,js,mjs}",
      "*.{js,mjs,ts}",
    ],
  })),

  // React Configuration (Web + UI)
  ...reactConfig.filter(filterGlobalIgnores).map((config) => ({
    ...config,
    files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
  })),
];
