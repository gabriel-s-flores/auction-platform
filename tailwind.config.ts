import preset from "@auction/config/tailwind/preset";
import type { Config } from "tailwindcss";

export default {
  presets: [preset],
  content: ["./apps/web/src/**/*.{ts,tsx}", "./packages/ui/src/**/*.{ts,tsx}"],
} satisfies Config;
