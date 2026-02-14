import type { Config } from "tailwindcss";
 
const preset = require("@auction/config/tailwind/preset");

export default {
  presets: [preset],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
