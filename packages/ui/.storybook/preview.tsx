import "../../../apps/web/src/styles/index.css";

import type { Preview } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const initialRoute =
        typeof context.parameters.initialRoute === "string"
          ? context.parameters.initialRoute
          : "/";

      return (
        <MemoryRouter initialEntries={[initialRoute]}>
          <div
            style={{
              backgroundColor: "var(--color-bg-base)",
              color: "var(--color-text-primary)",
              minHeight: "100vh",
              padding: "1.5rem",
            }}
          >
            <Story />
          </div>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
  },
};

export default preview;