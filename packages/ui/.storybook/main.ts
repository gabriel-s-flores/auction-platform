import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/postcss";
import { mergeConfig } from "vite";

const storybookRoot = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(storybookRoot, "..");
const repositoryRoot = resolve(packageRoot, "../..");
const webSourceRoot = resolve(repositoryRoot, "apps/web/src");

const config = {
  stories: ["../src/**/*.stories.@(ts|tsx)", `${webSourceRoot}/**/*.stories.@(ts|tsx)`],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: resolve(packageRoot, "tsconfig.json"),
    },
  },
  async viteFinal(baseConfig) {
    return mergeConfig(baseConfig, {
      css: {
        postcss: {
          plugins: [
            tailwindcss({
              base: repositoryRoot,
            }),
          ],
        },
      },
      resolve: {
        alias: {
          "@": webSourceRoot,
          "@auction/ui": resolve(packageRoot, "src/index.ts"),
          "@auction/shared-types": resolve(repositoryRoot, "packages/shared-types/src/index.ts"),
          "@web": webSourceRoot,
          "@ui": resolve(packageRoot, "src/index.ts"),
        },
      },
      server: {
        fs: {
          allow: [repositoryRoot],
        },
      },
    });
  },
} satisfies StorybookConfig;

export default config;
