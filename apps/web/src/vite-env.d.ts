/// <reference types="vite/client" />

declare module "@auction/config/tailwind/preset" {
  import type { Config } from "tailwindcss";

  const preset: Config;
  export default preset;
}
