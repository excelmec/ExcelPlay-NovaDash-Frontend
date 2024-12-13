import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkIndigo_bg: "#191828",
        white: "#fff",
        purple_track: "352454",
        skyblue_text: "339DDC",
        cherryPink_btn: "D22566",
        coralRed_btn: "F54257",
      },
    },
  },
  plugins: [],
};
export default config;
