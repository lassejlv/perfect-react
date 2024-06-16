import { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    logs: false,
    themes: ["light"],
  },
  plugins: [daisyui],
};

export default config;
